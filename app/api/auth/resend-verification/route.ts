import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateVerificationToken } from "@/lib/auth";
import { sendVerificationEmail } from "@/lib/email";
import { canResendVerification } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { email?: string };
    const { email } = body;
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    if (!canResendVerification(email)) {
      return NextResponse.json(
        { error: "Too many requests. Try again in 30 minutes." },
        { status: 429 }
      );
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.isVerified) {
      return NextResponse.json({ status: "ok" });
    }

    const verificationToken = await generateVerificationToken(user.id, email);
    await sendVerificationEmail(email, verificationToken);
    return NextResponse.json({ status: "ok" });
  } catch (err) {
    console.error("[resend-verification]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
