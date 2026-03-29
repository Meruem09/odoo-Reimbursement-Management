import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const email = request.nextUrl.searchParams.get("email");
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { isVerified: true },
    });

    return NextResponse.json({ verified: user?.isVerified ?? false });
  } catch (err) {
    console.error("[verification-status]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
