import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireRole, getAuthUser } from "@/lib/api-auth-extended";
import { generatePasswordToken } from "@/lib/token";
import { sendInviteEmail } from "@/lib/email";

// ─── GET /api/users ─────────────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const auth = await getAuthUser(request);
  if (auth instanceof Response) return auth;

  try {
    // ADMIN: all users in company
    // MANAGER: only their direct reports
    // EMPLOYEE: forbidden
    if (auth.role === "EMPLOYEE") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const where =
      auth.role === "ADMIN"
        ? { companyId: auth.companyId }
        : { companyId: auth.companyId, managerId: auth.id };

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        isPasswordSet: true,
        createdAt: true,
        manager: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ users });
  } catch (err) {
    console.error("[GET /api/users]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ─── POST /api/users ─────────────────────────────────────────────────────────

const createUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email"),
  role: z.enum(["MANAGER", "EMPLOYEE"]),
  managerId: z.string().cuid().optional().nullable(),
});

export async function POST(request: NextRequest) {
  const auth = await requireRole(request, "ADMIN");
  if (auth instanceof Response) return auth;

  try {
    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const parsed = createUserSchema.safeParse(body);
    if (!parsed.success) {
      const errors = parsed.error.issues.map((i) => ({
        field: i.path[0],
        message: i.message,
      }));
      return NextResponse.json({ error: "Validation failed", errors }, { status: 400 });
    }

    const { name, email, role, managerId } = parsed.data;

    // Check email uniqueness globally (emails are unique across companies too)
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already in use" }, { status: 409 });
    }

    // If managerId given, verify that manager belongs to same company
    if (managerId) {
      const manager = await prisma.user.findFirst({
        where: { id: managerId, companyId: auth.companyId },
      });
      if (!manager) {
        return NextResponse.json(
          { error: "Manager not found in your company" },
          { status: 400 }
        );
      }
    }

    // Create user without password — they'll set it via invite link
    const user = await prisma.user.create({
      data: {
        name,
        email,
        role,
        companyId: auth.companyId,
        managerId: managerId ?? null,
        isPasswordSet: false,
        isVerified: false,
      },
    });

    // Generate invite token and email it
    const raw = await generatePasswordToken(user.id, "SETUP");
    await sendInviteEmail(email, name, auth.name, raw);

    return NextResponse.json(
      {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          isPasswordSet: user.isPasswordSet,
        },
        message: "Invitation email sent.",
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("[POST /api/users]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
