import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getAppUrl } from "./env";
import { prisma } from "./prisma";
import {
  generateAccessToken,
  generateRefreshToken,
  hashToken,
} from "./auth";
import { setAccessTokenCookie, setRefreshTokenCookie } from "./session-cookies";
import type { Role } from "../generated/prisma/client";

const REFRESH_EXPIRY_DAYS = 30;

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  role: Role;
  companyId: string;
  isPasswordSet: boolean;
};

function clientMeta(request: NextRequest) {
  const ua = request.headers.get("user-agent");
  const forwarded = request.headers.get("x-forwarded-for");
  const ip =
    forwarded?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    null;
  return {
    deviceName: ua ? ua.slice(0, 255) : null,
    ipAddress: ip,
  };
}

async function persistSession(
  userId: string,
  request: NextRequest
): Promise<{ accessToken: string; rawRefresh: string }> {
  const accessToken = await generateAccessToken(userId);
  const rawRefresh = generateRefreshToken();
  const tokenHash = hashToken(rawRefresh);
  const expiresAt = new Date(
    Date.now() + REFRESH_EXPIRY_DAYS * 24 * 60 * 60 * 1000
  );
  const meta = clientMeta(request);

  await prisma.session.create({
    data: {
      userId,
      tokenHash,
      deviceName: meta.deviceName,
      ipAddress: meta.ipAddress,
      expiresAt,
    },
  });

  return { accessToken, rawRefresh };
}

function applyCookies(
  res: NextResponse,
  accessToken: string,
  rawRefresh: string
) {
  setAccessTokenCookie(res, accessToken);
  setRefreshTokenCookie(res, rawRefresh);
}

/** JSON API responses (sign-in, setup-password, etc.). */
export async function createAuthJsonResponse(
  userId: string,
  request: NextRequest,
  user: SessionUser
): Promise<NextResponse> {
  const { accessToken, rawRefresh } = await persistSession(userId, request);
  const res = NextResponse.json({
    accessToken,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      avatar_url: user.avatarUrl,
      role: user.role,
      companyId: user.companyId,
      isPasswordSet: user.isPasswordSet,
    },
  });
  applyCookies(res, accessToken, rawRefresh);
  return res;
}

/** OAuth / email verification redirects: sets cookies and Location header. */
export async function createAuthRedirectResponse(
  userId: string,
  request: NextRequest,
  destinationPath: string
): Promise<NextResponse> {
  const { accessToken, rawRefresh } = await persistSession(userId, request);
  const base = getAppUrl().replace(/\/$/, "");
  const path = destinationPath.startsWith("/")
    ? destinationPath
    : `/${destinationPath}`;
  const res = NextResponse.redirect(`${base}${path}`);
  applyCookies(res, accessToken, rawRefresh);
  return res;
}
