/**
 * Extended API auth helpers — role-based access control for Route Handlers.
 * Re-exports base helpers from api-auth and adds requireRole.
 */

import type { NextRequest } from "next/server";
import { prisma } from "./prisma";
import { getAuthUserId } from "./api-auth";
import type { Role } from "../generated/prisma/client";

export { getAuthUserId, requireUserId } from "./api-auth";

export type AuthenticatedUser = {
  id: string;
  email: string;
  name: string;
  role: Role;
  companyId: string;
  isPasswordSet: boolean;
  isActive: boolean;
};

/**
 * Fetch the full user record from the database for the authenticated request.
 * Returns the user or a 401/403 Response.
 */
export async function getAuthUser(
  request: NextRequest
): Promise<AuthenticatedUser | Response> {
  const userId = await getAuthUserId(request);
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      companyId: true,
      isPasswordSet: true,
      isActive: true,
    },
  });

  if (!user || !user.isActive) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  return user as AuthenticatedUser;
}

/**
 * Require the requesting user to have one of the specified roles.
 * Returns the user object or a Response (401 / 403).
 *
 * Usage in a Route Handler:
 *   const auth = await requireRole(request, "ADMIN");
 *   if (auth instanceof Response) return auth;
 *   // auth is AuthenticatedUser
 */
export async function requireRole(
  request: NextRequest,
  ...roles: Role[]
): Promise<AuthenticatedUser | Response> {
  const user = await getAuthUser(request);
  if (user instanceof Response) return user;

  if (!roles.includes(user.role)) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  return user;
}
