import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole, getAuthUser } from "@/lib/api-auth-extended";

// ─── GET /api/users/[id] ──────────────────────────────────────────────────────

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuthUser(request);
  if (auth instanceof Response) return auth;

  const { id } = await params;

  try {
    // EMPLOYEE can only see their own record
    if (auth.role === "EMPLOYEE" && auth.id !== id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // MANAGER can only see their direct reports or themselves
    if (auth.role === "MANAGER" && auth.id !== id) {
      const isReport = await prisma.user.findFirst({
        where: { id, managerId: auth.id, companyId: auth.companyId },
      });
      if (!isReport) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    const user = await prisma.user.findFirst({
      where: { id, companyId: auth.companyId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        isPasswordSet: true,
        createdAt: true,
        manager: { select: { id: true, name: true, email: true } },
        employees: { select: { id: true, name: true, email: true, role: true } },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (err) {
    console.error("[GET /api/users/:id]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ─── PATCH /api/users/[id] ────────────────────────────────────────────────────

const updateUserSchema = z.object({
  role: z.enum(["MANAGER", "EMPLOYEE"]).optional(),
  managerId: z.string().cuid().nullable().optional(),
  isActive: z.boolean().optional(),
  name: z.string().min(2).optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireRole(request, "ADMIN");
  if (auth instanceof Response) return auth;

  const { id } = await params;

  try {
    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const parsed = updateUserSchema.safeParse(body);
    if (!parsed.success) {
      const errors = parsed.error.issues.map((i) => ({
        field: i.path[0],
        message: i.message,
      }));
      return NextResponse.json({ error: "Validation failed", errors }, { status: 400 });
    }

    // Verify target user is in admin's company
    const target = await prisma.user.findFirst({
      where: { id, companyId: auth.companyId },
    });
    if (!target) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Prevent admin from deactivating themselves
    if (parsed.data.isActive === false && id === auth.id) {
      return NextResponse.json(
        { error: "You cannot deactivate your own account" },
        { status: 400 }
      );
    }

    // If managerId given, verify manager is in same company
    if (parsed.data.managerId) {
      const manager = await prisma.user.findFirst({
        where: { id: parsed.data.managerId, companyId: auth.companyId },
      });
      if (!manager) {
        return NextResponse.json(
          { error: "Manager not found in your company" },
          { status: 400 }
        );
      }
    }

    const updated = await prisma.user.update({
      where: { id },
      data: parsed.data,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        isPasswordSet: true,
        managerId: true,
      },
    });

    return NextResponse.json({ user: updated });
  } catch (err) {
    console.error("[PATCH /api/users/:id]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
