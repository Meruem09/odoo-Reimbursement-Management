import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashToken } from "@/lib/auth";
import { createAuthJsonResponse } from "@/lib/create-session";
import {
  clearAuthCookies,
  REFRESH_TOKEN_COOKIE,
} from "@/lib/session-cookies";

export async function POST(request: NextRequest) {
  try {
    const rawToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;
    if (!rawToken) {
      return NextResponse.json({ error: "No refresh token" }, { status: 401 });
    }

    const tokenHash = hashToken(rawToken);
    const stored = await prisma.session.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!stored || stored.expiresAt < new Date()) {
      if (stored) {
        await prisma.session.delete({ where: { id: stored.id } });
      }
      const res = NextResponse.json(
        { error: "Invalid or expired refresh token" },
        { status: 401 }
      );
      clearAuthCookies(res);
      return res;
    }

    await prisma.session.delete({ where: { id: stored.id } });

    const u = stored.user;
    return createAuthJsonResponse(u.id, request, {
      id: u.id,
      email: u.email,
      name: u.name,
      avatarUrl: u.avatarUrl,
      role: u.role,
      companyId: u.companyId,
      isPasswordSet: u.isPasswordSet,
    });
  } catch (err) {
    console.error("[refresh]", err);
    return NextResponse.json({ error: "Token refresh failed" }, { status: 401 });
  }
}
