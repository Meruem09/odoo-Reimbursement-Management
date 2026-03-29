"use client";

import { useState, useEffect } from "react";

/* ── Types ────────────────────────────────────────────────────── */
interface DashboardStats {
  totalExpenses: number;
  pendingApproval: number;
  approvedThisMonth: number;
  rejectedThisMonth: number;
  approvalRate: number;
  recentExpenses: RecentExpense[];
}

interface RecentExpense {
  id: string;
  employeeName: string;
  amount: number;
  currency: string;
  category: string;
  submittedDate: string;
  status: string;
  currentApprover: string;
}

/* ── Category labels ──────────────────────────────────────────── */
const catLabel: Record<string, string> = {
  TRAVEL: "Travel",
  MEALS: "Meals",
  ACCOMMODATION: "Accommodation",
  OFFICE_SUPPLIES: "Office Supplies",
  ENTERTAINMENT: "Entertainment",
  MEDICAL: "Medical",
  TRAINING: "Training",
  UTILITIES: "Utilities",
  OTHER: "Other",
};

/* ── Status Badge ─────────────────────────────────────────────── */
const statusCfg: Record<string, { label: string; text: string; bg: string; border: string }> = {
  PENDING:   { label: "Pending",   text: "text-amber-700",   bg: "bg-amber-50",   border: "border-amber-300" },
  IN_REVIEW: { label: "In Review", text: "text-blue-700",    bg: "bg-blue-50",    border: "border-blue-300" },
  APPROVED:  { label: "Approved",  text: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-300" },
  REJECTED:  { label: "Rejected",  text: "text-red-700",     bg: "bg-red-50",     border: "border-red-300" },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = statusCfg[status] ?? statusCfg.PENDING;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-[3px] rounded-full text-[10px] font-bold tracking-[0.04em] uppercase border ${cfg.text} ${cfg.bg} ${cfg.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.text.replace("text-", "bg-")}`} />
      {cfg.label}
    </span>
  );
}

/* ── Donut / Gauge Chart (pure SVG) ──────────────────────────── */
function ApprovalGauge({ rate }: { rate: number }) {
  const radius = 80;
  const stroke = 14;
  const circumference = 2 * Math.PI * radius;
  // We show a 270° arc (3/4 circle)
  const arcLength = circumference * 0.75;
  const filledLength = (rate / 100) * arcLength;
  const emptyLength = arcLength - filledLength;

  // Colors for the gradient segments
  const getColor = () => {
    if (rate >= 80) return "#10b981"; // emerald
    if (rate >= 50) return "#f59e0b"; // amber
    return "#ef4444"; // red
  };

  return (
    <div className="relative flex flex-col items-center justify-center">
      <svg width="220" height="190" viewBox="0 0 220 200">
        {/* Background arc */}
        <circle
          cx="110"
          cy="110"
          r={radius}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth={stroke}
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeDashoffset={0}
          strokeLinecap="round"
          transform="rotate(135, 110, 110)"
        />
        {/* Filled arc */}
        <circle
          cx="110"
          cy="110"
          r={radius}
          fill="none"
          stroke={getColor()}
          strokeWidth={stroke}
          strokeDasharray={`${filledLength} ${circumference}`}
          strokeDashoffset={0}
          strokeLinecap="round"
          transform="rotate(135, 110, 110)"
          className="transition-all duration-1000 ease-out"
        />
        {/* Decorative colored segments on the track */}
        <circle
          cx="110"
          cy="110"
          r={radius}
          fill="none"
          stroke="#f59e0b"
          strokeWidth={stroke}
          strokeDasharray={`${arcLength * 0.15} ${circumference}`}
          strokeDashoffset={-arcLength * 0.55}
          strokeLinecap="round"
          transform="rotate(135, 110, 110)"
          opacity="0.3"
        />
      </svg>
      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
        <div className="flex items-baseline gap-0.5">
          <span className="text-[11px] text-emerald-500 mr-1">↑</span>
          <span className="text-[42px] font-extrabold text-slate-900 leading-none tracking-tight">
            {rate}%
          </span>
        </div>
        <span className="text-[13px] font-semibold text-slate-500 mt-1">Approval Rate</span>
        <span className="text-[11px] text-slate-400 mt-0.5">This month</span>
      </div>
    </div>
  );
}

/* ── Stat Card ────────────────────────────────────────────────── */
function StatCard({
  label,
  value,
  sub,
  dotColor,
  trend,
}: {
  label: string;
  value: string | number;
  sub: string;
  dotColor: string;
  trend?: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col gap-2 shadow-[0_1px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-shadow">
      <div className="flex items-center gap-2">
        <span className={`w-2.5 h-2.5 rounded-full ${dotColor}`} />
        <span className="text-[12px] font-semibold text-slate-500 uppercase tracking-wide">
          {label}
        </span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-[28px] font-extrabold text-slate-900 tracking-tight leading-none">
          {value}
        </span>
        {trend && (
          <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
            ↑ {trend}
          </span>
        )}
      </div>
      <span className="text-[11px] text-slate-400">{sub}</span>
    </div>
  );
}

/* ── Main Admin Dashboard ────────────────────────────────────── */
export function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/dashboard/stats", { credentials: "include" });
        if (res.ok) {
          setStats(await res.json());
        }
      } catch (err) {
        console.error("Dashboard stats error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center p-12">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-blue-600 animate-spin" />
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
            Loading Dashboard…
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="w-full flex justify-center p-12">
        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-semibold max-w-lg text-center border border-red-200">
          Failed to load dashboard data.
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#f8f9fb] px-6 lg:px-10 pt-8 pb-12 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-[26px] font-extrabold text-slate-900 tracking-tight">
          Dashboard
        </h1>
        <p className="text-[13px] text-slate-500 mt-1">
          Company-wide expense overview and approval analytics
        </p>
      </div>

      {/* Stats + Gauge Row */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 mb-8">
        {/* Stat Cards */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-[0_2px_16px_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-2 mb-5">
            <span className="text-[15px]">📊</span>
            <h2 className="text-[15px] font-bold text-slate-900">Expense Summary</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <StatCard
              label="Total Expenses"
              value={stats.totalExpenses}
              sub="All time across company"
              dotColor="bg-blue-500"
            />
            <StatCard
              label="Pending Approval"
              value={stats.pendingApproval}
              sub="Awaiting review"
              dotColor="bg-amber-500"
            />
            <StatCard
              label="Approved"
              value={stats.approvedThisMonth}
              sub="This month"
              dotColor="bg-emerald-500"
              trend={stats.approvedThisMonth > 0 ? `${stats.approvedThisMonth}` : undefined}
            />
            <StatCard
              label="Rejected"
              value={stats.rejectedThisMonth}
              sub="This month"
              dotColor="bg-red-500"
            />
          </div>
        </div>

        {/* Gauge Chart */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-[0_2px_16px_rgba(0,0,0,0.04)] flex flex-col items-center justify-center">
          <div className="flex items-center gap-2 mb-2 self-start">
            <h2 className="text-[15px] font-bold text-slate-900">Approval Summary</h2>
            <span className="text-slate-400 text-[13px] cursor-help" title="Approved / (Approved + Rejected) this month">
              ⓘ
            </span>
          </div>
          <ApprovalGauge rate={stats.approvalRate} />
        </div>
      </div>

      {/* Recent Expenses Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_2px_16px_rgba(0,0,0,0.04)] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <span className="text-[15px]">📋</span>
            <h2 className="text-[15px] font-bold text-slate-900">Recent Expenses</h2>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">
            Last {stats.recentExpenses.length} submissions
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[750px]">
            <thead>
              <tr>
                {["Employee", "Amount", "Category", "Submitted", "Status", "Current Approver"].map((h) => (
                  <th
                    key={h}
                    className="py-3 px-5 text-[10px] font-bold text-slate-500 tracking-[0.08em] uppercase border-b border-slate-100 bg-slate-50/60"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {stats.recentExpenses.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center py-16 text-slate-400 text-sm"
                  >
                    No expenses submitted yet.
                  </td>
                </tr>
              ) : (
                stats.recentExpenses.map((exp, i) => (
                  <tr
                    key={exp.id}
                    className={`${
                      i % 2 === 0 ? "bg-white" : "bg-slate-50/30"
                    } hover:bg-blue-50/30 transition-colors`}
                  >
                    <td className="py-3.5 px-5">
                      <span className="text-[13px] font-semibold text-slate-900">
                        {exp.employeeName}
                      </span>
                    </td>
                    <td className="py-3.5 px-5">
                      <span className="text-[13px] font-extrabold text-slate-900 whitespace-nowrap">
                        {exp.currency === "INR" ? "₹" : exp.currency} {exp.amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="py-3.5 px-5">
                      <span className="text-[12px] text-slate-600">
                        {catLabel[exp.category] ?? exp.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-5">
                      <span className="text-[12px] text-slate-500 whitespace-nowrap">
                        {new Date(exp.submittedDate).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </td>
                    <td className="py-3.5 px-5">
                      <StatusBadge status={exp.status} />
                    </td>
                    <td className="py-3.5 px-5">
                      <span className="text-[12px] text-slate-600 font-medium">
                        {exp.currentApprover}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
