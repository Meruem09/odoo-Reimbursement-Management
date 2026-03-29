import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyVerificationToken } from "@/lib/auth";
import { createAuthRedirectResponse } from "@/lib/create-session";
import { getAppUrl } from "@/lib/env";

function errRedirect(msg: string) {
  const base = getAppUrl();
  return NextResponse.redirect(
    `${base}/error?msg=${encodeURIComponent(msg)}`
  );
}

export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get("token");
    if (!token) {
      return errRedirect("Missing verification token");
    }

    let payload: { sub: string; email: string };
    try {
      payload = await verifyVerificationToken(token);
    } catch {
      return errRedirect("Invalid or expired verification link");
    }

    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) {
      return errRedirect("User not found");
    }

    if (user.isVerified) {
      return createAuthRedirectResponse(user.id, request, "/dashboard");
    }

    await prisma.user.update({
      where: { id: payload.sub },
      data: { isVerified: true },
    });

    return createAuthRedirectResponse(user.id, request, "/dashboard");
  } catch (err) {
    console.error("[verify-email]", err);
    return errRedirect("Verification failed");
  }
}
