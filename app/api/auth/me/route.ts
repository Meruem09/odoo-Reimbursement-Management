import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/api-auth";

export async function GET(request: NextRequest) {
  const auth = await requireUserId(request);
  if (auth instanceof Response) return auth;

  try {
    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
        role: true,
        companyId: true,
        isVerified: true,
        isPasswordSet: true,
        isActive: true,
        createdAt: true,
        company: {
          select: {
            id: true,
            name: true,
            country: true,
            currency: true,
            currencySymbol: true,
            currencyName: true,
          },
        },
      },
    });

    if (!user || !user.isActive) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar_url: user.avatarUrl,
        role: user.role,
        companyId: user.companyId,
        isVerified: user.isVerified,
        isPasswordSet: user.isPasswordSet,
        createdAt: user.createdAt,
        company: user.company,
      },
    });
  } catch (err) {
    console.error("[me]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
