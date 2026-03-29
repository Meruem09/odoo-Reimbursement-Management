import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAccessToken } from "./lib/auth";
import { ACCESS_TOKEN_COOKIE } from "./lib/session-cookies";

/**
 * Frontend guard: protect app routes before render.
 * Uses the short-lived access JWT stored in an httpOnly cookie.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/dashboard")) {
    const token = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
    if (!token) {
      const signIn = new URL("/signIn", request.url);
      signIn.searchParams.set("redirect", pathname);
      return NextResponse.redirect(signIn);
    }
    try {
      await verifyAccessToken(token);
      return NextResponse.next();
    } catch {
      const signIn = new URL("/signIn", request.url);
      signIn.searchParams.set("redirect", pathname);
      return NextResponse.redirect(signIn);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
