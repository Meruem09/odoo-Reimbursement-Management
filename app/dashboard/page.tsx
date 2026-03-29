"use client";

import { useAuth } from "@/app/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { EmployeeDashboard } from "@/app/components/dashboard/EmployeeDashboard";
import { AdminDashboard } from "@/app/components/dashboard/AdminDashboard";

export default function DashboardPage() {
  const { user, loading } = useAuth();
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

  // ADMIN → full admin dashboard with stats, gauge, table
  if (user.role === "ADMIN") {
    return <AdminDashboard />;
  }

  // EMPLOYEE / MANAGER → employee expense dashboard
  return <EmployeeDashboard />;
}
