import { NextRequest, NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const userId = await getAuthUserId(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { companyId: true },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  try {
    const body = await request.json();
    const { description, category, expenseDate, currency, amount, remarks } = body;

    if (!description || !category || !expenseDate || !currency || !amount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Map frontend category strings to enum values
    const categoryMap: Record<string, string> = {
      "Travel": "TRAVEL",
      "Meals": "MEALS",
      "Accommodation": "ACCOMMODATION",
      "Software": "OTHER",
      "Office Supplies": "OFFICE_SUPPLIES",
      "Other": "OTHER",
    };

    const expense = await prisma.expense.create({
      data: {
        title: description,
        description: remarks || null,
        category: (categoryMap[category] || "OTHER") as any,
        expenseDate: new Date(expenseDate),
        amount: parseFloat(amount),
        currency: currency,
        status: "PENDING",
        submittedById: userId,
        companyId: user.companyId,
      },
    });

    return NextResponse.json(expense, { status: 201 });
  } catch (error: any) {
    console.error("Failed to create expense:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
