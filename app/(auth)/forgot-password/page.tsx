"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { AuthFormWrapper, FormField } from "@/app/components/auth";
import { Button } from "@/app/components/ui/button";
import { Loader2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!email) {
      setError("Email is required");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit request");
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <AuthFormWrapper
        title="Check your email"
        description="If an account exists, a password reset link has been sent to your email."
      >
        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link
            href="/signIn"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            ← Back to sign in
          </Link>
        </p>
      </AuthFormWrapper>
    );
  }

  return (
    <AuthFormWrapper
      title="Reset your password"
      description="Enter your email to receive a password reset link."
      error={error}
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <FormField
          id="email"
          label="Email Address"
          type="email"
          placeholder="you@company.com"
          value={email}
          onChange={setEmail}
          autoComplete="email"
          disabled={loading}
        />

        <Button
          type="submit"
          className="w-full h-10"
          disabled={loading}
          id="reset-btn"
        >
          {loading ? (
            <>
              <Loader2 className="size-4 animate-spin mr-2" />
              Sending link…
            </>
          ) : (
            "Send Reset Link"
          )}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Remember your password?{" "}
        <Link
          href="/signIn"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </AuthFormWrapper>
  );
}
