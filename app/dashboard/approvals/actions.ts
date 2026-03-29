"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { ACCESS_TOKEN_COOKIE } from "@/lib/session-cookies";
import { verifyAccessToken } from "@/lib/auth";

export async function approveExpense(expenseId: string, decision: "APPROVED" | "REJECTED", comment: string) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
    
    if (!token) throw new Error("Unauthorized");
    const { sub: userId } = await verifyAccessToken(token);

    // Get the expense
    const expense = await prisma.expense.findUnique({
      where: { id: expenseId },
      include: {
        approvalChain: { include: { steps: true } },
      }
    });

    if (!expense) throw new Error("Expense not found");
    if (expense.status === "APPROVED" || expense.status === "REJECTED" || expense.status === "DRAFT") {
      throw new Error(`Cannot process expense in status ${expense.status}`);
    }

    // Since this is a simple manager bypass for the hackathon, we assume the manager is deciding
    // and we just update the final status directly for now.
    // Ideally, we'd record an ApprovalAction and check if more steps are needed.
    
    // We'll record the generic action
    let nextStatus = decision === "APPROVED" ? "APPROVED" : "REJECTED";

    await prisma.$transaction(async (tx) => {
      // Create action
      // To create the action, we need a stepId. Let's find the current step, if any
      let stepId = "temp-step"; // fallback
      if (expense.approvalChain?.steps && expense.approvalChain.steps.length > 0) {
          // Just grab the first step for logging sake since currentStepOrder is used
          const step = expense.approvalChain.steps.find((s) => s.order === expense.currentStepOrder);
          if (step) stepId = step.id;
          else stepId = expense.approvalChain.steps[0].id; // fallback
      }

      try {
        await tx.approvalAction.create({
            data: {
                decision,
                comment: comment || null,
                expenseId: expense.id,
                stepId: stepId,
                approverId: userId,
            }
        });
      } catch (e) {
        // If we failed to find a valid step ID (maybe no chain assigned), skip creating action
        console.warn("Failed to create approval action:", e);
      }

      await tx.expense.update({
        where: { id: expense.id },
        data: { status: nextStatus as any }
      });
    });

    revalidatePath("/dashboard/approvals");
    return { success: true };
  } catch (error: any) {
    console.error("Action error:", error);
    return { success: false, error: error.message };
  }
}
