import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { consumePasswordToken } from "@/lib/token";
import { createAuthJsonResponse } from "@/lib/create-session";

const setupSchema = z
  .object({
    token: z.string().min(1, "Token is required"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const parsed = setupSchema.safeParse(body);
    if (!parsed.success) {
      const errors = parsed.error.issues.map((i) => ({
        field: i.path[0],
        message: i.message,
      }));
      return NextResponse.json({ error: "Validation failed", errors }, { status: 400 });
    }

    const { token, password } = parsed.data;

    let record: Awaited<ReturnType<typeof consumePasswordToken>>;
    try {
      record = await consumePasswordToken(token, "SETUP");
    } catch (err) {
      return NextResponse.json(
        { error: err instanceof Error ? err.message : "Invalid or expired token" },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(password);

    // Update password + mark token used + mark isVerified true (invited users skip email verification)
    const [updatedUser] = await prisma.$transaction([
      prisma.user.update({
        where: { id: record.userId },
        data: {
          passwordHash,
          isPasswordSet: true,
          isVerified: true, // auto-verify invited users
        },
        select: {
          id: true,
          email: true,
          name: true,
          avatarUrl: true,
          role: true,
          companyId: true,
          isPasswordSet: true,
        },
      }),
      prisma.passwordResetToken.update({
        where: { id: record.id },
        data: { usedAt: new Date() },
      }),
    ]);

    // Auto-login: create session and return JWT
    return createAuthJsonResponse(updatedUser.id, request, {
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      avatarUrl: updatedUser.avatarUrl,
      role: updatedUser.role,
      companyId: updatedUser.companyId,
      isPasswordSet: true,
    });
  } catch (err) {
    console.error("[setup-password]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
