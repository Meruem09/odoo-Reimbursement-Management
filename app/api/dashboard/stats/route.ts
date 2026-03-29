import { NextRequest, NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { convertToINR } from "@/lib/currency";

export async function GET(request: NextRequest) {
  const userId = await getAuthUserId(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true, companyId: true },
  });

  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const companyId = user.companyId;

  // Current month boundaries
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  // All expenses for this company (not DRAFT)
  const allExpenses = await prisma.expense.findMany({
    where: { companyId, status: { not: "DRAFT" } },
    include: {
      submittedBy: { select: { name: true } },
      approvalChain: {
        include: {
          steps: {
            include: { assignedUser: { select: { name: true } } },
            orderBy: { order: "asc" },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Stats
  const totalExpenses = allExpenses.length;
  const pendingApproval = allExpenses.filter(
    (e) => e.status === "PENDING" || e.status === "IN_REVIEW"
  ).length;

  const thisMonthExpenses = allExpenses.filter(
    (e) => e.createdAt >= monthStart && e.createdAt <= monthEnd
  );
  const approvedThisMonth = thisMonthExpenses.filter(
    (e) => e.status === "APPROVED"
  ).length;
  const rejectedThisMonth = thisMonthExpenses.filter(
    (e) => e.status === "REJECTED"
  ).length;

  const approvalRate =
    approvedThisMonth + rejectedThisMonth > 0
      ? Math.round(
          (approvedThisMonth / (approvedThisMonth + rejectedThisMonth)) * 100
        )
      : 0;

  // Recent expenses (last 10)
  const recentExpenses = await Promise.all(allExpenses.slice(0, 10).map(async (e) => {
    // Find current approver from step
    let currentApprover = "—";
    if (
      e.approvalChain?.steps &&
      e.approvalChain.steps.length > 0 &&
      (e.status === "PENDING" || e.status === "IN_REVIEW")
    ) {
      const currentStep = e.approvalChain.steps.find(
        (s) => s.order === e.currentStepOrder
      );
      if (currentStep?.assignedUser) currentApprover = currentStep.assignedUser.name;
    }

    const inrAmount = await convertToINR(e.amount, e.currency);

    return {
      id: e.id,
      employeeName: e.submittedBy.name,
      amount: inrAmount,
      currency: "INR",
      category: e.category,
      submittedDate: e.createdAt.toISOString(),
      status: e.status,
      currentApprover,
    };
  }));

  return NextResponse.json({
    totalExpenses,
    pendingApproval,
    approvedThisMonth,
    rejectedThisMonth,
    approvalRate,
    recentExpenses,
  });
}
