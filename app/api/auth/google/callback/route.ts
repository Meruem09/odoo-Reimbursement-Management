import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createAuthRedirectResponse } from "@/lib/create-session";
import { getAppUrl } from "@/lib/env";
import { getCurrencyForCountry } from "@/lib/currency";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID?.trim();
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET?.trim();

interface GoogleTokenResponse {
  access_token: string;
  id_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
}

interface GoogleUserInfo {
  sub: string;
  email: string;
  email_verified: boolean;
  name: string;
  picture?: string;
}

function redirectError(msg: string) {
  const base = getAppUrl();
  return NextResponse.redirect(
    `${base}/error?msg=${encodeURIComponent(msg)}`
  );
}

export async function GET(request: NextRequest) {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    return redirectError("Google login is not configured");
  }

  const appUrl = getAppUrl().replace(/\/$/, "");
  const callbackUrl = `${appUrl}/api/auth/google/callback`;

  try {
    const code = request.nextUrl.searchParams.get("code");
    const error = request.nextUrl.searchParams.get("error");

    if (error || !code) {
      return redirectError("Google login cancelled");
    }

    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: callbackUrl,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenRes.ok) {
      console.error("[google] Token exchange failed:", await tokenRes.text());
      return redirectError("Google login failed");
    }

    const tokens = (await tokenRes.json()) as GoogleTokenResponse;

    const userRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });

    if (!userRes.ok) {
      console.error("[google] Failed to fetch user info:", await userRes.text());
      return redirectError("Google login failed");
    }

    const profile = (await userRes.json()) as GoogleUserInfo;

    if (!profile.email) {
      return redirectError("No email from Google");
    }

    let user = await prisma.user.findUnique({ where: { email: profile.email } });

    if (!user) {
      // Auto-create a default company for Google OAuth users (like signup)
      const defaultCountry = "US";
      let currency: { code: string; symbol: string; name: string };
      try {
        currency = await getCurrencyForCountry(defaultCountry);
      } catch {
        currency = { code: "USD", symbol: "$", name: "United States dollar" };
      }

      const userName = profile.name ?? profile.email.split("@")[0] ?? "User";

      user = await prisma.$transaction(async (tx) => {
        const company = await tx.company.create({
          data: {
            name: `${userName}'s Company`,
            country: defaultCountry,
            currency: currency.code,
            currencySymbol: currency.symbol,
            currencyName: currency.name,
          },
        });

        return tx.user.create({
          data: {
            email: profile.email,
            name: userName,
            avatarUrl: profile.picture ?? null,
            provider: "google",
            role: "ADMIN",
            companyId: company.id,
            isVerified: true,
            isPasswordSet: false,
          },
        });
      });
    } else {
      // Update existing user with latest Google info
      user = await prisma.user.update({
        where: { email: profile.email },
        data: {
          name: user.name || profile.name,
          avatarUrl: user.avatarUrl ?? profile.picture ?? null,
          isVerified: true,
        },
      });
    }

    // Upsert the OAuth account record
    await prisma.oAuthAccount.upsert({
      where: {
        provider_providerAccountId: {
          provider: "google",
          providerAccountId: profile.sub,
        },
      },
      create: {
        userId: user.id,
        provider: "google",
        providerAccountId: profile.sub,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token ?? null,
      },
      update: {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token ?? null,
      },
    });

    return createAuthRedirectResponse(user.id, request, "/dashboard");
  } catch (err) {
    console.error("[google-callback]", err);
    return redirectError("Google login failed");
  }
}
