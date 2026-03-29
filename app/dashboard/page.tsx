"use client";

import { useAuth } from "@/app/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/app/components/ui/button";

export default function DashboardPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/signIn?redirect=/dashboard");
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="flex flex-1 items-center justify-center p-8 text-muted-foreground">
        Loading…
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Top header bar */}
      <header className="flex h-14 items-center justify-between border-b border-border px-6 shrink-0">
        <div>
          <h1 className="text-base font-semibold">Dashboard</h1>
          <p className="text-xs text-muted-foreground">
            Welcome back,{" "}
            <span className="font-medium text-foreground">{user.name}</span>
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => logout()}>
          Sign out
        </Button>
      </header>

      {/* Page body */}
      <main className="flex-1 overflow-y-auto p-6">
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Pending Approvals", value: "0" },
            { label: "Total Expenses (This Month)", value: "$0" },
            { label: "Approved (This Month)", value: "0" },
            { label: "Total Employees", value: "0" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-lg border border-border bg-card p-4 flex flex-col gap-1"
            >
              <p className="text-xs text-muted-foreground">{stat.label}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-lg border border-border bg-card p-6 text-center text-muted-foreground text-sm">
          Your reimbursement activity will appear here.
        </div>
      </main>
    </div>
  );
}
