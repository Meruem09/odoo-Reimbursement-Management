import { NextRequest, NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const userId = await getAuthUserId(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const expenses = await prisma.expense.findMany({
    where: { submittedById: userId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      description: true,
      category: true,
      expenseDate: true,
      amount: true,
      currency: true,
      status: true,
    },
  });

  // Serialize dates and map fields
  const data = expenses.map((e) => ({
    id: e.id,
    title: e.title,
    description: e.description,
    category: e.category,
    expenseDate: e.expenseDate.toISOString(),
    paidBy: null,   // schema doesn't store paidBy — placeholder
    remarks: e.description,
    amount: e.amount,
    currency: e.currency,
    status: e.status,
  }));

  return NextResponse.json(data);
}
