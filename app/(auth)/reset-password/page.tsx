"use client";

import { useState, FormEvent, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AuthFormWrapper, PasswordInput } from "@/app/components/auth";
import { Button } from "@/app/components/ui/button";
import { Loader2 } from "lucide-react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!token) {
    return (
      <AuthFormWrapper
        title="Invalid Link"
        description="The password reset link is missing or malformed."
        error="Missing reset token."
      >
        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link
            href="/forgot-password"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            ← Request a new link
          </Link>
        </p>
      </AuthFormWrapper>
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!password || !confirmPassword) {
      setError("Both fields are required");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to reset password");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/signIn");
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <AuthFormWrapper
        title="Password Reset"
        description="Your password has been successfully updated. Redirecting to sign in..."
      >
        <div className="flex justify-center mt-6">
          <Loader2 className="size-6 animate-spin text-primary" />
        </div>
      </AuthFormWrapper>
    );
  }

  return (
    <AuthFormWrapper
      title="Create new password"
      description="Please enter a new minimum 8 character password for your account."
      error={error}
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <PasswordInput
          id="password"
          label="New Password"
          placeholder="Min. 8 characters"
          value={password}
          onChange={setPassword}
          autoComplete="new-password"
          disabled={loading}
        />

        <PasswordInput
          id="confirmPassword"
          label="Confirm Password"
          placeholder="Re-enter your password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          autoComplete="new-password"
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
              Resetting…
            </>
          ) : (
            "Reset Password"
          )}
        </Button>
      </form>
    </AuthFormWrapper>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="flex justify-center mt-20"><Loader2 className="size-8 animate-spin" /></div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
