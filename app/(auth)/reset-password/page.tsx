"use client";

import { Suspense, useState, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { resetPasswordSchema, type ResetPasswordFormData } from "@/app/lib/validations/auth";
import { AuthFormWrapper, PasswordInput } from "@/app/components/auth";
import { Button } from "@/app/components/ui/button";
import { Loader2 } from "lucide-react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [formData, setFormData] = useState<ResetPasswordFormData>({
    password: "",
    confirmPassword: "",
  });
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof ResetPasswordFormData, string>>
  >({});
  const [globalError, setGlobalError] = useState("");
  const [loading, setLoading] = useState(false);

  function updateField(field: keyof ResetPasswordFormData, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  }

  if (!token) {
    return (
      <AuthFormWrapper title="Invalid Link">
        <p className="text-sm text-muted-foreground text-center">
          This reset link is missing or invalid.
        </p>
        <p className="mt-4 text-center text-sm">
          <Link href="/forgot-password" className="font-medium text-primary underline-offset-4 hover:underline">
            Request a new reset link
          </Link>
        </p>
      </AuthFormWrapper>
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setGlobalError("");
    setFieldErrors({});

    const result = resetPasswordSchema.safeParse(formData);
    if (!result.success) {
      const errors: Partial<Record<keyof ResetPasswordFormData, string>> = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof ResetPasswordFormData;
        if (!errors[field]) errors[field] = issue.message;
      });
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, ...formData }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        message?: string;
      };
      if (!res.ok) {
        throw new Error(data.error || "Failed to reset password");
      }
      // Redirect to sign in with success indicator
      router.push("/signIn?reset=success");
    } catch (err) {
      setGlobalError(
        err instanceof Error ? err.message : "Failed to reset password. The link may have expired."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthFormWrapper
      title="Reset your password"
      description="Enter your new password below"
      error={globalError}
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <PasswordInput
          id="password"
          label="New Password"
          placeholder="Min. 8 characters"
          value={formData.password}
          onChange={(v) => updateField("password", v)}
          error={fieldErrors.password}
          autoComplete="new-password"
          disabled={loading}
        />

        <PasswordInput
          id="confirmPassword"
          label="Confirm New Password"
          placeholder="Re-enter your password"
          value={formData.confirmPassword}
          onChange={(v) => updateField("confirmPassword", v)}
          error={fieldErrors.confirmPassword}
          autoComplete="new-password"
          disabled={loading}
        />

        <Button type="submit" className="w-full h-10" disabled={loading} id="reset-btn">
          {loading ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Resetting…
            </>
          ) : (
            "Reset Password"
          )}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        <Link href="/signIn" className="font-medium text-primary underline-offset-4 hover:underline">
          Back to Sign In
        </Link>
      </p>
    </AuthFormWrapper>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-12 text-muted-foreground">
          <Loader2 className="size-6 animate-spin" />
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
