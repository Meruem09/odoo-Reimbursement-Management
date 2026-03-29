import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/api-auth";

export async function GET(request: NextRequest) {
  const auth = await requireUserId(request);
  if (auth instanceof Response) return auth;

  try {
    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      include: { 
          employees: true,
          company: true 
      }
    });

    if (!user || (user.role !== "MANAGER" && user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const teamMemberIds = user.employees.map(e => e.id);
    const expensesRaw = await prisma.expense.findMany({
      where: {
        submittedById: { in: teamMemberIds },
        status: { not: "DRAFT" }
      },
      include: {
        submittedBy: true,
        approvalActions: true
      },
      orderBy: { createdAt: "desc" }
    });

    const expenses = expensesRaw.map((e) => ({
      id: e.id,
      employee: e.submittedBy.name,
      dept: "Unknown", 
      category: e.category,
      desc: e.title || e.description || "",
      date: e.expenseDate.toISOString().split("T")[0],
      display: `${e.currency} ${e.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      amount: e.amount,
      status: e.status === "PENDING" || e.status === "IN_REVIEW" ? "pending" : (e.status === "APPROVED" ? "approved" : "rejected"),
      step: e.currentStepOrder > 0 ? `Step ${e.currentStepOrder}` : "Waiting Approval",
      receipt: !!e.receiptUrl,
      comment: e.approvalActions.length > 0 ? e.approvalActions[e.approvalActions.length - 1].comment || "" : ""
    }));

    const teamMembers = user.employees.map((e) => ({
      name: e.name,
      role: e.role === "EMPLOYEE" ? "Employee" : "Manager",
      initials: e.name.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase()
    }));

    return NextResponse.json({ 
        expenses, 
        teamMembers, 
        user: { 
            name: user.name, 
            email: user.email, 
            role: user.role,
            company: user.company 
        } 
    });
  } catch (err: any) {
    console.error("[GET /api/approvals]", err);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireUserId(request);
  if (auth instanceof Response) return auth;

  try {
    const body = await request.json();
    const { id, decision, comment } = body;

    const expense = await prisma.expense.findUnique({
      where: { id },
      include: {
        submittedBy: true,
        approvalChain: { include: { steps: true } },
      }
    });

    if (!expense) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const statusMap: Record<string, any> = {
      approved: "APPROVED",
      rejected: "REJECTED"
    };
    const nextStatus = statusMap[decision];
    if (!nextStatus) return NextResponse.json({ error: "Invalid logic" }, { status: 400 });

    let stepId = "temp-step"; // fallback
    if (expense.approvalChain?.steps && expense.approvalChain.steps.length > 0) {
      const step = expense.approvalChain.steps.find((s) => s.order === expense.currentStepOrder);
      if (step) stepId = step.id;
      else stepId = expense.approvalChain.steps[0].id; // fallback
    }

    await prisma.$transaction(async (tx) => {
      try {
        await tx.approvalAction.create({
          data: {
            decision: decision === "approved" ? "APPROVED" : "REJECTED",
            comment: comment || null,
            expenseId: expense.id,
            stepId: stepId,
            approverId: auth.userId,
          }
        });
      } catch (e) {
        console.warn("Could not create approvalAction (no steps?)", e);
      }
      await tx.expense.update({
        where: { id: expense.id },
        data: { status: nextStatus }
      });
    });

    return NextResponse.json({ success: true, status: nextStatus });
  } catch (err: any) {
    console.error("[POST /api/approvals]", err);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
