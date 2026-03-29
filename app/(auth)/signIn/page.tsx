"use client";

import { Suspense, useState, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/app/contexts/AuthContext";
import { signInSchema, type SignInFormData } from "@/app/lib/validations/auth";
import { signUpSchema, type SignUpFormData } from "@/app/lib/validations/auth";

/* ── Country list ──────────────────────────────────────────────── */
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
  { code: "NL", name: "Netherlands" },
  { code: "ES", name: "Spain" },
  { code: "IT", name: "Italy" },
  { code: "SE", name: "Sweden" },
  { code: "CH", name: "Switzerland" },
].sort((a, b) => a.name.localeCompare(b.name));

/* ── Shared styles ────────────────────────────────────────────── */
const inputClass =
  "w-full h-11 px-4 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 placeholder:text-gray-400 outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed";

const selectClass =
  "w-full h-11 px-4 rounded-lg border border-gray-200 bg-white text-sm text-gray-900 outline-none transition-all focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed appearance-none";

/* ── Auth Form (inner, reads searchParams) ────────────────────── */
function AuthFormInner() {
  const { login, signup } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [mode, setMode] = useState<"signin" | "signup">("signin");

  // Sign-in state
  const [signInData, setSignInData] = useState<SignInFormData>({
    email: "",
    password: "",
  });
  const [signInErrors, setSignInErrors] = useState<
    Partial<Record<keyof SignInFormData, string>>
  >({});

  // Sign-up state
  const [signUpData, setSignUpData] = useState<SignUpFormData>({
    name: "",
    email: "",
    country: "",
    password: "",
    confirmPassword: "",
  });
  const [signUpErrors, setSignUpErrors] = useState<
    Partial<Record<keyof SignUpFormData, string>>
  >({});

  const [globalError, setGlobalError] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  function updateSignIn(field: keyof SignInFormData, value: string) {
    setSignInData((prev) => ({ ...prev, [field]: value }));
    if (signInErrors[field])
      setSignInErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function updateSignUp(field: keyof SignUpFormData, value: string) {
    setSignUpData((prev) => ({ ...prev, [field]: value }));
    if (signUpErrors[field])
      setSignUpErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  async function handleSignIn(e: FormEvent) {
    e.preventDefault();
    setGlobalError("");
    setSignInErrors({});

    const result = signInSchema.safeParse(signInData);
    if (!result.success) {
      const errors: Partial<Record<keyof SignInFormData, string>> = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof SignInFormData;
        if (!errors[field]) errors[field] = issue.message;
      });
      setSignInErrors(errors);
      return;
    }

    setLoading(true);
    try {
      const res = await login(signInData.email, signInData.password);
      if (res.status === "pending_verification") {
        router.push(
          `/verify-pending?email=${encodeURIComponent(signInData.email)}`
        );
      } else {
        const next = searchParams.get("redirect") || "/dashboard";
        router.push(next.startsWith("/") ? next : "/dashboard");
      }
    } catch (err) {
      setGlobalError(
        err instanceof Error ? err.message : "Sign in failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSignUp(e: FormEvent) {
    e.preventDefault();
    setGlobalError("");
    setSignUpErrors({});

    const result = signUpSchema.safeParse(signUpData);
    if (!result.success) {
      const errors: Partial<Record<keyof SignUpFormData, string>> = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof SignUpFormData;
        if (!errors[field]) errors[field] = issue.message;
      });
      setSignUpErrors(errors);
      return;
    }

    setLoading(true);
    try {
      const res = await signup(
        signUpData.name,
        signUpData.email,
        signUpData.password,
        signUpData.country
      );
      if (res.status === "ok") {
        router.push("/dashboard");
      } else {
        router.push(
          `/verify-pending?email=${encodeURIComponent(signUpData.email)}`
        );
      }
    } catch (err) {
      setGlobalError(
        err instanceof Error
          ? err.message
          : "Sign up failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  function switchMode(newMode: "signin" | "signup") {
    setMode(newMode);
    setGlobalError("");
    setSignInErrors({});
    setSignUpErrors({});
  }

  return (
    <div className="flex w-full min-h-screen">
      {/* ─── LEFT PANEL: Form ─────────────────────────────── */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between px-6 sm:px-12 lg:px-16 xl:px-24 py-8">
        <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-[32px] font-bold text-gray-900 tracking-tight leading-tight">
              {mode === "signin" ? "Welcome back" : "Create an account"}
            </h1>
            <p className="mt-2 text-[15px] text-gray-500">
              {mode === "signin"
                ? "Enter your details to access your account."
                : "Start managing reimbursements — free forever for small teams."}
            </p>
          </div>

          {/* Error alert */}
          {globalError && (
            <div className="mb-5 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              <svg
                className="w-4 h-4 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01M12 3a9 9 0 110 18 9 9 0 010-18z"
                />
              </svg>
              {globalError}
            </div>
          )}

          {/* ── SIGN IN FORM ────────────────────────── */}
          {mode === "signin" && (
            <form onSubmit={handleSignIn} className="space-y-5" noValidate>
              {/* Email */}
              <div>
                <label
                  htmlFor="signin-email"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Email
                </label>
                <input
                  id="signin-email"
                  type="email"
                  placeholder="Enter your email"
                  value={signInData.email}
                  onChange={(e) => updateSignIn("email", e.target.value)}
                  autoComplete="email"
                  disabled={loading}
                  className={inputClass}
                />
                {signInErrors.email && (
                  <p className="mt-1 text-xs text-red-500">
                    {signInErrors.email}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="signin-password"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="signin-password"
                    type="password"
                    placeholder="Enter your password"
                    value={signInData.password}
                    onChange={(e) => updateSignIn("password", e.target.value)}
                    autoComplete="current-password"
                    disabled={loading}
                    className={inputClass}
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  </button>
                </div>
                {signInErrors.password && (
                  <p className="mt-1 text-xs text-red-500">
                    {signInErrors.password}
                  </p>
                )}
              </div>

              {/* Remember me + Forgot */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={() => setRememberMe(!rememberMe)}
                    className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                  <span className="text-sm text-gray-600">Remember me</span>
                </label>
                <Link
                  href="/forgot-password"
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                id="signin-btn"
                className="w-full h-11 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 shadow-sm shadow-indigo-600/25"
              >
                {loading ? (
                  <>
                    <svg
                      className="w-4 h-4 animate-spin"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Signing in…
                  </>
                ) : (
                  "Sign in"
                )}
              </button>
            </form>
          )}

          {/* ── SIGN UP FORM ────────────────────────── */}
          {mode === "signup" && (
            <form onSubmit={handleSignUp} className="space-y-4" noValidate>
              {/* Name */}
              <div>
                <label
                  htmlFor="signup-name"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Full Name
                </label>
                <input
                  id="signup-name"
                  type="text"
                  placeholder="Jane Doe"
                  value={signUpData.name}
                  onChange={(e) => updateSignUp("name", e.target.value)}
                  autoComplete="name"
                  disabled={loading}
                  className={inputClass}
                />
                {signUpErrors.name && (
                  <p className="mt-1 text-xs text-red-500">
                    {signUpErrors.name}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="signup-email"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Work Email
                </label>
                <input
                  id="signup-email"
                  type="email"
                  placeholder="you@company.com"
                  value={signUpData.email}
                  onChange={(e) => updateSignUp("email", e.target.value)}
                  autoComplete="email"
                  disabled={loading}
                  className={inputClass}
                />
                {signUpErrors.email && (
                  <p className="mt-1 text-xs text-red-500">
                    {signUpErrors.email}
                  </p>
                )}
              </div>

              {/* Country */}
              <div>
                <label
                  htmlFor="signup-country"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Country
                </label>
                <div className="relative">
                  <select
                    id="signup-country"
                    value={signUpData.country}
                    onChange={(e) => updateSignUp("country", e.target.value)}
                    disabled={loading}
                    className={selectClass}
                  >
                    <option value="" disabled>
                      Select your country
                    </option>
                    {COUNTRIES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <svg
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
                {signUpErrors.country && (
                  <p className="mt-1 text-xs text-red-500">
                    {signUpErrors.country}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="signup-password"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Password
                </label>
                <input
                  id="signup-password"
                  type="password"
                  placeholder="Min. 8 characters"
                  value={signUpData.password}
                  onChange={(e) => updateSignUp("password", e.target.value)}
                  autoComplete="new-password"
                  disabled={loading}
                  className={inputClass}
                />
                {signUpErrors.password && (
                  <p className="mt-1 text-xs text-red-500">
                    {signUpErrors.password}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label
                  htmlFor="signup-confirm"
                  className="block text-sm font-medium text-gray-700 mb-1.5"
                >
                  Confirm Password
                </label>
                <input
                  id="signup-confirm"
                  type="password"
                  placeholder="Re-enter your password"
                  value={signUpData.confirmPassword}
                  onChange={(e) =>
                    updateSignUp("confirmPassword", e.target.value)
                  }
                  autoComplete="new-password"
                  disabled={loading}
                  className={inputClass}
                />
                {signUpErrors.confirmPassword && (
                  <p className="mt-1 text-xs text-red-500">
                    {signUpErrors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                id="signup-btn"
                className="w-full h-11 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 shadow-sm shadow-indigo-600/25"
              >
                {loading ? (
                  <>
                    <svg
                      className="w-4 h-4 animate-spin"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Creating account…
                  </>
                ) : (
                  "Create Account"
                )}
              </button>
            </form>
          )}

          {/* Switch mode link */}
          <p className="mt-8 text-center text-sm text-gray-500">
            {mode === "signin" ? (
              <>
                Don&apos;t have an account?{" "}
                <button
                  onClick={() => switchMode("signup")}
                  className="font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
                >
                  Register
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  onClick={() => switchMode("signin")}
                  className="font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
                >
                  Sign in
                </button>
              </>
            )}
          </p>
        </div>

        {/* Footer */}
        <div className="pt-6">
          <p className="text-xs text-gray-400 text-center">
            © {new Date().getFullYear()} Approvia. All rights reserved.
          </p>
        </div>
      </div>

      {/* ─── RIGHT PANEL: Branding ────────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden rounded-l-[40px]">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700" />

        {/* Decorative circles */}
        <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-white/5" />
        <div className="absolute -bottom-20 -left-20 w-96 h-96 rounded-full bg-white/5" />
        <div className="absolute top-1/2 right-10 w-40 h-40 rounded-full bg-white/5" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center items-center w-full px-12 xl:px-20">
          {/* Logo */}
          <div className="flex items-center gap-2.5 mb-10 self-start">
            <div className="w-9 h-9 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
            </div>
            <span className="text-white text-lg font-bold tracking-tight">
              Approvia
            </span>
          </div>

          {/* Headline */}
          <div className="self-start mb-8">
            <h2 className="text-[36px] xl:text-[42px] font-bold text-white leading-[1.15] tracking-tight">
              Take Control of
              <br />
              Every Expense.
            </h2>
            <p className="mt-4 text-[15px] text-indigo-100/80 leading-relaxed max-w-md">
              Submit, track, and approve reimbursements without the back-and-forth.
            </p>
          </div>

          {/* Dashboard preview image */}
          <div className="w-full max-w-lg relative">
            <div className="rounded-xl overflow-hidden shadow-2xl shadow-black/30 border border-white/10">
              <Image
                src="/dashboard-preview.png"
                alt="Dashboard Preview"
                width={600}
                height={400}
                className="w-full h-auto object-cover"
                priority
              />
            </div>
            {/* Subtle glow behind image */}
            <div className="absolute -inset-4 bg-white/5 rounded-2xl -z-10 blur-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Page export with Suspense boundary ───────────────────────── */
export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center w-full min-h-screen">
          <svg
            className="w-6 h-6 animate-spin text-indigo-600"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        </div>
      }
    >
      <AuthFormInner />
    </Suspense>
  );
}
