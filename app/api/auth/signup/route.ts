import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword, generateVerificationToken } from "@/lib/auth";
import { sendVerificationEmail } from "@/lib/email";
import { getCurrencyForCountry } from "@/lib/currency";
import { createAuthJsonResponse } from "@/lib/create-session";

const signupSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Enter a valid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
    country: z
      .string()
      .length(2, "Country must be a 2-letter ISO code")
      .toUpperCase(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const parsed = signupSchema.safeParse(body);
    if (!parsed.success) {
      const errors = parsed.error.issues.map((i) => ({
        field: i.path[0],
        message: i.message,
      }));
      return NextResponse.json({ error: "Validation failed", errors }, { status: 400 });
    }

    const { name, email, password, country } = parsed.data;

    // Resolve currency before any DB writes
    let currency: { code: string; symbol: string; name: string };
    try {
      currency = await getCurrencyForCountry(country);
    } catch (err) {
      console.error("[signup] currency lookup failed:", err);
      return NextResponse.json(
        { error: "Invalid country code or unable to fetch currency data" },
        { status: 400 }
      );
    }

    // Check uniqueness
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already in use" }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);

    // Transactional: create Company + Admin User together
    const user = await prisma.$transaction(async (tx) => {
      const company = await tx.company.create({
        data: {
          name: `${name}'s Company`, // Admin can rename later
          country,
          currency: currency.code,
          currencySymbol: currency.symbol,
          currencyName: currency.name,
        },
      });

      return tx.user.create({
        data: {
          name,
          email,
          passwordHash,
          role: "ADMIN",
          companyId: company.id,
          isPasswordSet: true,
          isVerified: true, // Auto-verify upon signup
        },
      });
    });

    // Instead of pending_verification, just log them in instantly
    return createAuthJsonResponse(user.id, request, {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      role: user.role,
      companyId: user.companyId,
      isPasswordSet: user.isPasswordSet,
    });
  } catch (err) {
    console.error("[signup]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
