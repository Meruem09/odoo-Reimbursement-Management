"use client";

import { useState, useEffect } from "react";
import { Button } from "@/app/components/ui/button";
import { useRouter } from "next/navigation";
import { Upload, Plus, ArrowRight } from "lucide-react";

type ExpenseStatus = "DRAFT" | "PENDING" | "IN_REVIEW" | "APPROVED" | "REJECTED";

interface MyExpense {
  id: string;
  title: string;
  description: string | null;
  category: string;
  expenseDate: string;
  paidBy: string | null;
  remarks: string | null;
  amount: number;
  currency: string;
  status: ExpenseStatus;
}

const catLabel: Record<string, string> = {
  TRAVEL: "Travel", MEALS: "Food", ACCOMMODATION: "Accommodation",
  OFFICE_SUPPLIES: "Supplies", ENTERTAINMENT: "Entertainment",
  MEDICAL: "Medical", TRAINING: "Training", UTILITIES: "Utilities", OTHER: "Other",
};

export function EmployeeDashboard() {
  const router = useRouter();
  const [expenses, setExpenses] = useState<MyExpense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/expenses/my", { credentials: "include" });
        if (res.ok) {
          setExpenses(await res.json());
        }
      } catch (e) {
        console.error("Failed to load expenses", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const toSubmit = expenses.filter(e => e.status === "DRAFT").reduce((s, e) => s + e.amount, 0);
  const waiting = expenses.filter(e => e.status === "PENDING" || e.status === "IN_REVIEW").reduce((s, e) => s + e.amount, 0);
  const approved = expenses.filter(e => e.status === "APPROVED").reduce((s, e) => s + e.amount, 0);

  const fmt = (n: number) => n.toLocaleString("en-IN");

  const getStatusStyles = (status: ExpenseStatus) => {
    switch (status) {
      case "DRAFT":
        return "border-red-400 text-red-600 bg-red-50/30";
      case "PENDING":
      case "IN_REVIEW":
        return "border-amber-400 text-amber-600 bg-amber-50/30";
      case "APPROVED":
        return "border-green-500 text-green-700 bg-green-50/30";
      case "REJECTED":
        return "border-gray-300 text-gray-600 bg-gray-50/30";
      default:
        return "border-gray-300 text-gray-600 bg-gray-50/30";
    }
  };

  const statusLabel = (status: ExpenseStatus) => {
    switch (status) {
      case "DRAFT": return "Draft";
      case "PENDING": return "Submitted";
      case "IN_REVIEW": return "In Review";
      case "APPROVED": return "Approved";
      case "REJECTED": return "Rejected";
      default: return status;
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#f8f9fa] overflow-hidden">
      {/* Action Header */}
      <div className="flex items-center justify-between p-6 bg-white border-b border-gray-100 flex-shrink-0">
        <div>
          <h2 className="text-sm font-semibold text-gray-800">My Expenses</h2>
          <p className="text-xs text-gray-500 mt-1">Manage all your receipts and submissions</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 border-gray-200 shadow-sm"
          >
            <Upload className="w-4 h-4" /> Upload
          </Button>
          <Button
            className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-gray-100 shadow-sm"
            onClick={() => router.push('/dashboard/expenses')}
          >
            <Plus className="w-4 h-4" /> New
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-6xl mx-auto space-y-8">

          {/* Tracking Metrics */}
          <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
            <div className="flex items-center justify-between relative">
              {/* Connecting Line */}
              <div className="absolute top-1/2 left-[15%] right-[15%] h-[1px] bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 -translate-y-1/2 z-0" />

              {/* Step 1 */}
              <div className="flex flex-col items-center bg-white z-10 px-8">
                <span className="text-3xl font-semibold text-gray-900 tracking-tight">
                  {loading ? "—" : `${fmt(toSubmit)} rs`}
                </span>
                <span className="text-[13px] font-medium text-gray-500 mt-2 uppercase tracking-wide">To submit</span>
              </div>

              <ArrowRight className="w-6 h-6 text-gray-300 z-10 bg-white" />

              {/* Step 2 */}
              <div className="flex flex-col items-center bg-white z-10 px-8">
                <span className="text-3xl font-semibold text-amber-600 tracking-tight">
                  {loading ? "—" : `${fmt(waiting)} rs`}
                </span>
                <span className="text-[13px] font-medium text-gray-500 mt-2 uppercase tracking-wide">Waiting approval</span>
              </div>

              <ArrowRight className="w-6 h-6 text-gray-300 z-10 bg-white" />

              {/* Step 3 */}
              <div className="flex flex-col items-center bg-white z-10 px-8">
                <span className="text-3xl font-semibold text-green-600 tracking-tight">
                  {loading ? "—" : `${fmt(approved)} rs`}
                </span>
                <span className="text-[13px] font-medium text-gray-500 mt-2 uppercase tracking-wide">Approved</span>
              </div>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-[#faf9f6] text-gray-500 uppercase text-[11px] tracking-wider border-b border-gray-100">
                  <tr>
                    {["Employee", "Description", "Date", "Category", "Paid By", "Remarks", "Amount", "Status"].map((col) => (
                      <th key={col} className="px-6 py-4 font-semibold">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50/80">
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-16 text-center text-gray-400 text-sm">
                        Loading your expenses…
                      </td>
                    </tr>
                  ) : expenses.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-16 text-center text-gray-400 text-sm">
                        No expenses yet. Click <strong>+ New</strong> to submit your first expense.
                      </td>
                    </tr>
                  ) : expenses.map((expense) => (
                    <tr key={expense.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-4 font-medium text-gray-900">Me</td>
                      <td className="px-6 py-4 text-gray-600 max-w-[160px] truncate" title={expense.title}>{expense.title}</td>
                      <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                        {new Date(expense.expenseDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                      <td className="px-6 py-4 text-gray-600">{catLabel[expense.category] ?? expense.category}</td>
                      <td className="px-6 py-4 text-gray-600">{expense.paidBy ?? "—"}</td>
                      <td className="px-6 py-4 text-gray-400 italic text-xs max-w-[140px] truncate" title={expense.remarks ?? ""}>
                        {expense.remarks || "None"}
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                        {expense.amount.toLocaleString()} {expense.currency}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${getStatusStyles(expense.status)}`}>
                          {statusLabel(expense.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
