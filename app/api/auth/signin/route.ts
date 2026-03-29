import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth";
import { createAuthJsonResponse } from "@/lib/create-session";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => null)) as {
      email?: string;
      password?: string;
    } | null;

    if (!body?.email || !body?.password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const { email, password } = body;

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        passwordHash: true,
        role: true,
        companyId: true,
        isVerified: true,
        isPasswordSet: true,
        isActive: true,
      },
    });

    // Generic message — never reveal which field is wrong
    const invalidMsg = "Invalid email or password";

    if (!user || !user.passwordHash) {
      return NextResponse.json({ error: invalidMsg }, { status: 401 });
    }

    if (!user.isActive) {
      return NextResponse.json(
        { error: "Your account has been deactivated. Please contact your administrator." },
        { status: 403 }
      );
    }

    if (!user.isVerified) {
      return NextResponse.json(
        { status: "pending_verification", email },
        { status: 403 }
      );
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: invalidMsg }, { status: 401 });
    }

    return createAuthJsonResponse(user.id, request, {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      role: user.role,
      companyId: user.companyId,
      isPasswordSet: user.isPasswordSet,
    });
  } catch (err) {
    console.error("[signin]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
