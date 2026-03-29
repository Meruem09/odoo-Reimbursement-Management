import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generatePasswordToken } from "@/lib/token";
import { sendPasswordResetEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => null)) as {
      email?: string;
    } | null;

    if (!body?.email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const email = body.email.trim().toLowerCase();

    // Always respond 200 — never reveal whether the email exists
    const user = await prisma.user.findUnique({ where: { email } });

    if (user && user.isActive) {
      try {
        const raw = await generatePasswordToken(user.id, "RESET");
        await sendPasswordResetEmail(email, raw);
      } catch (err) {
        // Log but don't surface to client
        console.error("[forgot-password] token/email error:", err);
      }
    }

    return NextResponse.json({
      message:
        "If an account with that email exists, a password reset link has been sent.",
    });
  } catch (err) {
    console.error("[forgot-password]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
