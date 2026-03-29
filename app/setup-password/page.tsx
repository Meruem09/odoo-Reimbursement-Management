"use client";

import { Suspense, useState, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { setupPasswordSchema, type SetupPasswordFormData } from "@/app/lib/validations/auth";
import { AuthFormWrapper, PasswordInput } from "@/app/components/auth";
import { useAuth } from "@/app/contexts/AuthContext";
import { Button } from "@/app/components/ui/button";
import { Loader2 } from "lucide-react";

function SetupPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshSession } = useAuth();
  const token = searchParams.get("token") ?? "";

  const [formData, setFormData] = useState<SetupPasswordFormData>({
    password: "",
    confirmPassword: "",
  });
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof SetupPasswordFormData, string>>
  >({});
  const [globalError, setGlobalError] = useState("");
  const [loading, setLoading] = useState(false);

  function updateField(field: keyof SetupPasswordFormData, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  }

  if (!token) {
    return (
      <AuthFormWrapper title="Invalid Invitation Link">
        <p className="text-sm text-muted-foreground text-center">
          This invitation link is missing or invalid. Please ask your administrator
          to resend the invitation.
        </p>
      </AuthFormWrapper>
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setGlobalError("");
    setFieldErrors({});

    const result = setupPasswordSchema.safeParse(formData);
    if (!result.success) {
      const errors: Partial<Record<keyof SetupPasswordFormData, string>> = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof SetupPasswordFormData;
        if (!errors[field]) errors[field] = issue.message;
      });
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/setup-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ token, ...formData }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        user?: { role: string };
      };
      if (!res.ok) {
        throw new Error(data.error || "Failed to set up password");
      }
      // Refresh auth context to pick up the new session
      await refreshSession();
      router.push("/dashboard");
    } catch (err) {
      setGlobalError(
        err instanceof Error
          ? err.message
          : "Failed to set up password. The link may have expired."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthFormWrapper
      title="Set up your password"
      description="You've been invited! Create a password to activate your account."
      error={globalError}
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <PasswordInput
          id="password"
          label="Password"
          placeholder="Min. 8 characters"
          value={formData.password}
          onChange={(v) => updateField("password", v)}
          error={fieldErrors.password}
          autoComplete="new-password"
          disabled={loading}
        />

        <PasswordInput
          id="confirmPassword"
          label="Confirm Password"
          placeholder="Re-enter your password"
          value={formData.confirmPassword}
          onChange={(v) => updateField("confirmPassword", v)}
          error={fieldErrors.confirmPassword}
          autoComplete="new-password"
          disabled={loading}
        />

        <Button
          type="submit"
          className="w-full h-10"
          disabled={loading}
          id="setup-btn"
        >
          {loading ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Activating account…
            </>
          ) : (
            "Activate Account"
          )}
        </Button>
      </form>
    </AuthFormWrapper>
  );
}

export default function SetupPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-12 text-muted-foreground">
          <Loader2 className="size-6 animate-spin" />
        </div>
      }
    >
      <SetupPasswordForm />
    </Suspense>
  );
}
