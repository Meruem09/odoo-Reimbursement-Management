"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { forgotPasswordSchema, type ForgotPasswordFormData } from "@/app/lib/validations/auth";
import { AuthFormWrapper, FormField } from "@/app/components/auth";
import { Button } from "@/app/components/ui/button";
import { Loader2, CheckCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const [formData, setFormData] = useState<ForgotPasswordFormData>({ email: "" });
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<"email", string>>>({});
  const [globalError, setGlobalError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setGlobalError("");
    setFieldErrors({});

    const result = forgotPasswordSchema.safeParse(formData);
    if (!result.success) {
      setFieldErrors({ email: result.error.issues[0]?.message });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error || "Something went wrong");
      }
      setSent(true);
    } catch (err) {
      setGlobalError(
        err instanceof Error ? err.message : "Failed to send reset email. Try again."
      );
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <AuthFormWrapper title="Check your email">
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <CheckCircle className="size-12 text-green-500" />
          <p className="text-sm text-muted-foreground">
            If an account exists for{" "}
            <span className="font-medium text-foreground">{formData.email}</span>,
            a password reset link has been sent.
          </p>
          <p className="text-xs text-muted-foreground">
            Didn&apos;t receive it? Check your spam folder or{" "}
            <button
              className="text-primary underline-offset-4 hover:underline"
              onClick={() => setSent(false)}
            >
              try again
            </button>
            .
          </p>
        </div>
        <p className="mt-4 text-center text-sm">
          <Link href="/signIn" className="font-medium text-primary underline-offset-4 hover:underline">
            Back to Sign In
          </Link>
        </p>
      </AuthFormWrapper>
    );
  }

  return (
    <AuthFormWrapper
      title="Forgot your password?"
      description="Enter your email and we'll send you a reset link"
      error={globalError}
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <FormField
          id="email"
          label="Email"
          type="email"
          placeholder="you@company.com"
          value={formData.email}
          onChange={(v) => setFormData({ email: v })}
          error={fieldErrors.email}
          autoComplete="email"
          disabled={loading}
        />

        <Button type="submit" className="w-full h-10" disabled={loading} id="forgot-btn">
          {loading ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Sending…
            </>
          ) : (
            "Send Reset Link"
          )}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Remember your password?{" "}
        <Link href="/signIn" className="font-medium text-primary underline-offset-4 hover:underline">
          Sign in
        </Link>
      </p>
    </AuthFormWrapper>
  );
}
