import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashToken } from "@/lib/auth";
import {
  clearAuthCookies,
  REFRESH_TOKEN_COOKIE,
} from "@/lib/session-cookies";

/** Clears refresh session server-side and auth cookies (works even if access JWT expired). */
export async function POST(request: NextRequest) {
  try {
    const rawToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;
    if (rawToken) {
      const tokenHash = hashToken(rawToken);
      await prisma.session.deleteMany({ where: { tokenHash } });
    }
    const res = NextResponse.json({ status: "logged_out" });
    clearAuthCookies(res);
    return res;
  } catch (err) {
    console.error("[logout]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
