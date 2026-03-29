"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/app/contexts/AuthContext";
import { signUpSchema, type SignUpFormData } from "@/app/lib/validations/auth";
import {
  AuthFormWrapper,
  FormField,
  PasswordInput,
  SelectField,
  OAuthButtons,
} from "@/app/components/auth";
import { Button } from "@/app/components/ui/button";
import { Loader2 } from "lucide-react";

// Top ~50 countries by population/usage — extend as needed
const COUNTRIES = [
  { code: "IN", name: "India" },
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" },
  { code: "CA", name: "Canada" },
  { code: "AU", name: "Australia" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "JP", name: "Japan" },
  { code: "CN", name: "China" },
  { code: "BR", name: "Brazil" },
  { code: "MX", name: "Mexico" },
  { code: "SG", name: "Singapore" },
  { code: "AE", name: "United Arab Emirates" },
  { code: "ZA", name: "South Africa" },
  { code: "NG", name: "Nigeria" },
  { code: "KE", name: "Kenya" },
  { code: "PK", name: "Pakistan" },
  { code: "BD", name: "Bangladesh" },
  { code: "ID", name: "Indonesia" },
  { code: "PH", name: "Philippines" },
  { code: "NL", name: "Netherlands" },
  { code: "ES", name: "Spain" },
  { code: "IT", name: "Italy" },
  { code: "SE", name: "Sweden" },
  { code: "NO", name: "Norway" },
  { code: "CH", name: "Switzerland" },
  { code: "NZ", name: "New Zealand" },
  { code: "AR", name: "Argentina" },
  { code: "CL", name: "Chile" },
  { code: "CO", name: "Colombia" },
].sort((a, b) => a.name.localeCompare(b.name));

export default function SignUpPage() {
  const { signup } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState<SignUpFormData>({
    name: "",
    email: "",
    country: "",
    password: "",
    confirmPassword: "",
  });
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof SignUpFormData, string>>
  >({});
  const [globalError, setGlobalError] = useState("");
  const [loading, setLoading] = useState(false);

  function updateField(field: keyof SignUpFormData, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setGlobalError("");
    setFieldErrors({});

    const result = signUpSchema.safeParse(formData);
    if (!result.success) {
      const errors: Partial<Record<keyof SignUpFormData, string>> = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof SignUpFormData;
        if (!errors[field]) errors[field] = issue.message;
      });
      setFieldErrors(errors);
      return;
    }

    setLoading(true);
    try {
      const result = await signup(
        formData.name,
        formData.email,
        formData.password,
        formData.country
      );
      if (result.status === "ok") {
        router.push("/dashboard");
      } else {
        router.push(
          `/verify-pending?email=${encodeURIComponent(formData.email)}`
        );
      }
    } catch (err) {
      setGlobalError(
        err instanceof Error ? err.message : "Sign up failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthFormWrapper
      title="Create your account"
      description="Start managing reimbursements — free forever for small teams"
      error={globalError}
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <FormField
          id="name"
          label="Full Name"
          placeholder="Jane Doe"
          value={formData.name}
          onChange={(v) => updateField("name", v)}
          error={fieldErrors.name}
          autoComplete="name"
          disabled={loading}
        />

        <FormField
          id="email"
          label="Work Email"
          type="email"
          placeholder="you@company.com"
          value={formData.email}
          onChange={(v) => updateField("email", v)}
          error={fieldErrors.email}
          autoComplete="email"
          disabled={loading}
        />

        <SelectField
          id="country"
          label="Country"
          value={formData.country}
          onChange={(v) => updateField("country", v)}
          error={fieldErrors.country}
          disabled={loading}
          placeholder="Select your country"
          options={COUNTRIES.map((c) => ({ value: c.code, label: c.name }))}
        />

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
          id="signup-btn"
        >
          {loading ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Creating account…
            </>
          ) : (
            "Create Account"
          )}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
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
