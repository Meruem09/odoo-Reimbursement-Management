import type { NextRequest } from "next/server";
import { verifyAccessToken } from "./auth";
import {
  ACCESS_TOKEN_COOKIE,
} from "./session-cookies";

export async function getAuthUserId(
  request: NextRequest
): Promise<string | null> {
  const header = request.headers.get("authorization");
  const bearer =
    header?.startsWith("Bearer ") ? header.slice(7).trim() : undefined;
  const fromCookie = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const token = bearer || fromCookie;
  if (!token) return null;
  try {
    const { sub } = await verifyAccessToken(token);
    return sub;
  } catch {
    return null;
  }
}

export async function requireUserId(
  request: NextRequest
): Promise<{ userId: string } | Response> {
  const userId = await getAuthUserId(request);
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  return { userId };
}
