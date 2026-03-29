import type { NextResponse } from "next/server";

export const ACCESS_TOKEN_COOKIE = "access_token";
export const REFRESH_TOKEN_COOKIE = "refresh_token";

const ACCESS_MAX_AGE_SEC = 15 * 60;
const REFRESH_MAX_AGE_SEC = 30 * 24 * 60 * 60;

function cookieBase() {
  const secure = process.env.NODE_ENV === "production";
  return { secure, sameSite: "lax" as const, path: "/" };
}

export function setAccessTokenCookie(
  res: NextResponse,
  token: string
): void {
  const b = cookieBase();
  res.cookies.set(ACCESS_TOKEN_COOKIE, token, {
    ...b,
    httpOnly: true,
    maxAge: ACCESS_MAX_AGE_SEC,
  });
}

export function setRefreshTokenCookie(res: NextResponse, token: string): void {
  const b = cookieBase();
  res.cookies.set(REFRESH_TOKEN_COOKIE, token, {
    ...b,
    httpOnly: true,
    maxAge: REFRESH_MAX_AGE_SEC,
  });
}

export function clearAuthCookies(res: NextResponse): void {
  const b = cookieBase();
  res.cookies.set(ACCESS_TOKEN_COOKIE, "", { ...b, httpOnly: true, maxAge: 0 });
  res.cookies.set(REFRESH_TOKEN_COOKIE, "", { ...b, httpOnly: true, maxAge: 0 });
}
