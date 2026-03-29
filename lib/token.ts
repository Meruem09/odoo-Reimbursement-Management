/**
 * Password-reset / setup token helpers.
 * Raw tokens are NEVER stored in the DB — only SHA-256 hashes.
 */

import { randomBytes } from "node:crypto";
import { hashToken } from "./auth";
import { prisma } from "./prisma";
import type { TokenType } from "../generated/prisma/client";

/** Expiry duration per token type */
const EXPIRY_HOURS: Record<TokenType, number> = {
  RESET: 1,   // forgot-password link valid 1 hour
  SETUP: 48,  // invite link valid 48 hours
};

/**
 * Generate a new password token, invalidating any existing unused tokens
 * of the same type for the user.
 * @returns The raw (unhashed) token string — put this in the email link.
 */
export async function generatePasswordToken(
  userId: string,
  type: TokenType
): Promise<string> {
  // Invalidate old unused tokens of the same type
  await prisma.passwordResetToken.updateMany({
    where: { userId, type, usedAt: null },
    data: { usedAt: new Date() },
  });

  const raw = randomBytes(32).toString("hex"); // 64-char hex
  const tokenHash = hashToken(raw);
  const expiresAt = new Date(
    Date.now() + EXPIRY_HOURS[type] * 60 * 60 * 1000
  );

  await prisma.passwordResetToken.create({
    data: { userId, tokenHash, type, expiresAt },
  });

  return raw;
}

/**
 * Validate and return the token record. Does NOT mark it as used —
 * the caller is responsible for that inside their transaction.
 */
export async function consumePasswordToken(raw: string, type: TokenType) {
  const tokenHash = hashToken(raw);

  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
    include: { user: true },
  });

  if (!record) throw new Error("Invalid or expired token");
  if (record.type !== type) throw new Error("Invalid token type");
  if (record.usedAt) throw new Error("Token has already been used");
  if (record.expiresAt < new Date()) throw new Error("Token has expired");

  return record;
}
