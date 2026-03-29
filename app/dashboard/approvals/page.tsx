import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ACCESS_TOKEN_COOKIE } from "@/lib/session-cookies";
import { verifyAccessToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ApprovalsClient from "./client";

export default async function ApprovalsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;

  if (!token) {
    redirect("/signIn");
  }

  let userId: string;
  try {
    const act = await verifyAccessToken(token);
    userId = act.sub;
  } catch (err) {
    redirect("/signIn");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      company: true,
      employees: true, // "My Team"
    },
  });

  if (!user || (user.role !== "MANAGER" && user.role !== "ADMIN")) {
    return (
      <div className="p-8 text-center text-muted-foreground mt-20">
        You do not have permission to view approvals.
      </div>
    );
  }

  // Fetch all pending / history expenses under this manager's domain
  // For the ADMIN, fetch all expenses across the company
  const expensesWhere: any = { status: { not: "DRAFT" } };
  let displayTeamMembers = user.employees;

  if (user.role === "ADMIN") {
    expensesWhere.companyId = user.companyId;
    const allCompanyUsers = await prisma.user.findMany({
      where: { companyId: user.companyId }
    });
    displayTeamMembers = allCompanyUsers as any;
  } else {
    expensesWhere.submittedById = { in: user.employees.map(e => e.id) };
  }

  const expensesRaw = await prisma.expense.findMany({
    where: expensesWhere,
    include: {
      submittedBy: true,
      approvalActions: true
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  // Serialize and prepare
  const expenses = expensesRaw.map((e) => {
    return {
      id: e.id,
      employee: e.submittedBy.name,
      dept: "Unknown", // Add custom if needed
      category: e.category,
      desc: e.title || e.description || "",
      date: e.expenseDate.toISOString().split("T")[0],
      display: `${e.currency} ${e.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      amount: e.amount,
      status: e.status === "PENDING" || e.status === "IN_REVIEW" ? "pending" : (e.status === "APPROVED" ? "approved" : "rejected"),
      step: e.currentStepOrder > 0 ? `Step ${e.currentStepOrder}` : "Waiting Approval",
      receipt: !!e.receiptUrl,
      comment: e.approvalActions.length > 0 ? e.approvalActions[e.approvalActions.length - 1].comment || "" : ""
    };
  });

  const teamMembers = displayTeamMembers.map((e) => {
    const initials = e.name.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase();
    return {
      name: e.name,
      role: e.role === "EMPLOYEE" ? "Employee" : "Manager",
      initials
    };
  });

  return (
    <div className="flex-1 w-full bg-[#F1F5F9] min-h-screen">
      <ApprovalsClient initialExpenses={expenses as any} teamMembers={teamMembers as any} user={user} />
    </div>
  );
}
