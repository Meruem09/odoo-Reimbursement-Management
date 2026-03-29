"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { authUrl } from "@/app/lib/api";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  avatar_url: string | null;
  role: "ADMIN" | "MANAGER" | "EMPLOYEE";
  companyId: string;
  isPasswordSet: boolean;
  isVerified?: boolean;
  createdAt?: string;
  company?: {
    id: string;
    name: string;
    country: string;
    currency: string;
    currencySymbol: string;
    currencyName: string;
  };
};

type LoginResult =
  | { status: "ok" }
  | { status: "pending_verification" }
  | { status: "setup_required" };

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<LoginResult>;
  signup: (
    name: string,
    email: string,
    password: string,
    country: string
  ) => Promise<LoginResult>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<boolean>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshSession = useCallback(async (): Promise<boolean> => {
    try {
      const res = await fetch(authUrl("/refresh"), {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) return false;
      const data = (await res.json()) as { user?: AuthUser };
      if (data.user) setUser(data.user);
      return true;
    } catch {
      return false;
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(authUrl("/me"), { credentials: "include" });
        if (cancelled) return;
        if (res.ok) {
          const data = (await res.json()) as { user: AuthUser };
          setUser(data.user);
        } else if (res.status === 401) {
          const ok = await refreshSession();
          if (!cancelled && ok) {
            const me = await fetch(authUrl("/me"), { credentials: "include" });
            if (me.ok) {
              const data = (await me.json()) as { user: AuthUser };
              setUser(data.user);
            }
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refreshSession]);

  const login = useCallback<AuthContextValue["login"]>(
    async (email, password) => {
      const res = await fetch(authUrl("/signin"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        status?: string;
        user?: AuthUser;
      };

      if (res.status === 403 && data.status === "pending_verification") {
        return { status: "pending_verification" };
      }
      if (!res.ok) {
        throw new Error(data.error || "Sign in failed");
      }
      if (data.user) {
        setUser(data.user);
        // If user has never set a password, signal the UI to redirect
        if (!data.user.isPasswordSet) {
          return { status: "setup_required" };
        }
      }
      return { status: "ok" };
    },
    []
  );

  const signup = useCallback<AuthContextValue["signup"]>(
    async (name, email, password, country) => {
      const res = await fetch(authUrl("/signup"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, email, password, confirmPassword: password, country }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        errors?: { field: string; message: string }[];
        status?: string;
        user?: AuthUser;
      };
      if (!res.ok) {
        // Surface first validation error if available
        const msg =
          data.errors?.[0]?.message || data.error || "Sign up failed";
        throw new Error(msg);
      }
      if (data.user) {
        setUser(data.user);
        return { status: "ok" };
      }
      return { status: "pending_verification" };
    },
    []
  );

  const logout = useCallback(async () => {
    await fetch(authUrl("/logout"), {
      method: "POST",
      credentials: "include",
    });
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      signup,
      logout,
      refreshSession,
    }),
    [user, loading, login, signup, logout, refreshSession]
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
