import * as jose from "jose";
import bcrypt from "bcryptjs";
import { createHash, randomBytes } from "node:crypto";
import { getJwtSecret } from "./env";

const BCRYPT_ROUNDS = 12;

export async function generateAccessToken(userId: string): Promise<string> {
  const secret = getJwtSecret();
  return new jose.SignJWT({})
    .setSubject(userId)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("15m")
    .setAudience("access")
    .sign(secret);
}

export async function verifyAccessToken(
  token: string
): Promise<{ sub: string }> {
  const secret = getJwtSecret();
  const { payload } = await jose.jwtVerify(token, secret, {
    audience: "access",
  });
  const sub = payload.sub;
  if (!sub || typeof sub !== "string") {
    throw new Error("Invalid access token");
  }
  return { sub };
}

export function generateRefreshToken(): string {
  return randomBytes(32).toString("hex");
}

export function hashToken(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}

export async function generateVerificationToken(
  userId: string,
  email: string
): Promise<string> {
  const secret = getJwtSecret();
  return new jose
    .SignJWT({ email })
    .setSubject(userId)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .setAudience("email-verification")
    .sign(secret);
}

export async function verifyVerificationToken(
  token: string
): Promise<{ sub: string; email: string }> {
  const secret = getJwtSecret();
  const { payload } = await jose.jwtVerify(token, secret, {
    audience: "email-verification",
  });
  const sub = payload.sub;
  const email = (payload as { email?: string }).email;
  if (!sub || typeof sub !== "string" || !email || typeof email !== "string") {
    throw new Error("Invalid verification token");
  }
  return { sub, email };
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, BCRYPT_ROUNDS);
}

export async function verifyPassword(
  plain: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}
