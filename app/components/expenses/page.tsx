"use client";

import { useState } from "react";

const CURRENCIES = ["USD", "EUR", "GBP", "INR", "JPY", "AED", "SGD"];
const CATEGORIES = ["Travel", "Meals", "Accommodation", "Software", "Office Supplies", "Other"];
const PAID_BY = ["Credit Card", "Cash", "Company Card", "Personal Card"];

type Status = "draft" | "pending" | "approved";

interface ApprovalEntry {
    approver: string;
    status: string;
    time: string;
}

const STEPS: { key: Status; label: string }[] = [
    { key: "draft", label: "Draft" },
    { key: "pending", label: "Waiting Approval" },
    { key: "approved", label: "Approved" },
];

const approvalLog: ApprovalEntry[] = [
    { approver: "Sarah", status: "Approved", time: "12:44 · 4th Oct, 2025" },
];

export default function ExpenseForm() {
    const [status] = useState<Status>("pending");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("");
    const [expenseDate, setExpenseDate] = useState("");
    const [paidBy, setPaidBy] = useState("");
    const [currency, setCurrency] = useState("USD");
    const [amount, setAmount] = useState("");
    const [remarks, setRemarks] = useState("");
    const [receiptName, setReceiptName] = useState<string | null>(null);
    const [submitted, setSubmitted] = useState(false);

    const currentStep = STEPS.findIndex((s) => s.key === status);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) setReceiptName(e.target.files[0].name);
    };

    const handleSubmit = async () => {
        if (!description || !category || !expenseDate || !amount) {
            alert("Please fill required fields (Description, Date, Category, Amount)");
            return;
        }

        try {
            const res = await fetch("/api/expenses", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    description,
                    category,
                    expenseDate,
                    currency,
                    amount,
                    remarks,
                }),
            });

            if (res.ok) {
                setSubmitted(true);
                setTimeout(() => {
                    setSubmitted(false);
                    setDescription("");
                    setCategory("");
                    setExpenseDate("");
                    setAmount("");
                    setRemarks("");
                }, 2500);
            } else {
                const data = await res.json();
                alert(`Error: ${data.error}`);
            }
        } catch (e: any) {
            alert(`Error: ${e.message}`);
        }
    };

    return (
        <div className="min-h-screen bg-[#faf9f6] flex items-center justify-center font-sans p-8">
            <div className="bg-white rounded-[20px] shadow-[0_2px_32px_rgba(0,0,0,0.07),0_1px_4px_rgba(0,0,0,0.04)] p-8 md:p-9 w-full max-w-[780px] border border-[#ebebeb]">
                {/* Header row */}
                <div className="flex items-center justify-between flex-wrap gap-4 mb-5">
                    {/* Receipt button */}
                    <label className="flex items-center gap-2 bg-[#f5f3ef] border-[1.5px] border-dashed border-[#c9c5bc] rounded-lg px-[18px] py-2 cursor-pointer text-[13px] font-medium text-[#555] transition-colors hover:bg-[#ebe9e4]">
                        <input type="file" accept="image/*,.pdf" onChange={handleFileChange} className="hidden" />
                        <span className="text-base">📎</span>
                        <span>{receiptName ? receiptName.slice(0, 18) + "…" : "Attach Receipt"}</span>
                    </label>

                    {/* Stepper */}
                    <div className="flex items-start">
                        {STEPS.map((step, i) => (
                            <div key={step.key} className="flex flex-col items-center gap-1.5">
                                <div className="flex items-center gap-0">
                                    <div
                                        className={`w-3 h-3 rounded-full transition-all duration-300 ${i <= currentStep ? "bg-[#1a1a2e]" : "bg-[#d1d5db]"}`}
                                        style={{
                                            border: i === currentStep ? "2.5px solid #6366f1" : "2.5px solid transparent",
                                            transform: i === currentStep ? "scale(1.2)" : "scale(1)",
                                        }}
                                    />
                                    {i < STEPS.length - 1 && (
                                        <div
                                            className={`w-16 h-[2px] rounded-[1px] transition-colors duration-300 mt-[5px] ${i < currentStep ? "bg-[#1a1a2e]" : "bg-[#d1d5db]"}`}
                                        />
                                    )}
                                </div>
                                <span
                                    className={`text-[11px] tracking-[0.2px] whitespace-nowrap ${i <= currentStep ? "text-[#1a1a2e]" : "text-[#9ca3af]"}`}
                                    style={{ fontWeight: i === currentStep ? 700 : 400 }}
                                >
                                    {step.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Divider */}
                <div className="h-[1px] bg-[#f0ede8] mx-[-4px]" />

                {/* Form grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5 mt-6">
                    {/* Description */}
                    <div className="flex flex-col gap-1.5 sm:col-span-1 border-0">
                        <label className="text-xs font-semibold text-[#888] tracking-[0.4px] uppercase flex items-center gap-1.5">Description</label>
                        <input
                            className="w-full border-b-[1.5px] border-[#e0ddd8] bg-transparent text-[15px] text-[#1a1a2e] py-2 px-1 outline-none transition-colors focus:border-[#6366f1]"
                            placeholder="What was this expense for?"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    {/* Expense Date */}
                    <div className="flex flex-col gap-1.5 sm:col-span-1 border-0">
                        <label className="text-xs font-semibold text-[#888] tracking-[0.4px] uppercase flex items-center gap-1.5">Expense Date</label>
                        <input
                            type="date"
                            className="w-full border-b-[1.5px] border-[#e0ddd8] bg-transparent text-[15px] text-[#1a1a2e] py-2 px-1 outline-none transition-colors focus:border-[#6366f1]"
                            value={expenseDate}
                            onChange={(e) => setExpenseDate(e.target.value)}
                        />
                    </div>

                    {/* Category */}
                    <div className="flex flex-col gap-1.5 sm:col-span-1 border-0">
                        <label className="text-xs font-semibold text-[#888] tracking-[0.4px] uppercase flex items-center gap-1.5">Category</label>
                        <select 
                            className="w-full border-b-[1.5px] border-[#e0ddd8] bg-transparent text-[15px] text-[#1a1a2e] py-2 px-1 appearance-none outline-none cursor-pointer focus:border-[#6366f1] bg-no-repeat bg-[right_4px_center]" 
                            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23888' d='M6 8L1 3h10z'/%3E%3C/svg%3E")` }}
                            value={category} 
                            onChange={(e) => setCategory(e.target.value)}
                        >
                            <option value="">Select category</option>
                            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                        </select>
                    </div>

                    {/* Paid By */}
                    <div className="flex flex-col gap-1.5 sm:col-span-1 border-0">
                        <label className="text-xs font-semibold text-[#888] tracking-[0.4px] uppercase flex items-center gap-1.5">Paid by</label>
                        <select 
                            className="w-full border-b-[1.5px] border-[#e0ddd8] bg-transparent text-[15px] text-[#1a1a2e] py-2 px-1 appearance-none outline-none cursor-pointer focus:border-[#6366f1] bg-no-repeat bg-[right_4px_center]"
                            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23888' d='M6 8L1 3h10z'/%3E%3C/svg%3E")` }}
                            value={paidBy} 
                            onChange={(e) => setPaidBy(e.target.value)}
                        >
                            <option value="">Select method</option>
                            {PAID_BY.map((p) => <option key={p}>{p}</option>)}
                        </select>
                    </div>

                    {/* Amount + Currency */}
                    <div className="flex flex-col gap-1.5 sm:col-span-1 border-0">
                        <label className="text-xs font-semibold text-[#888] tracking-[0.4px] uppercase flex items-center gap-1.5">
                            Total amount in{" "}
                            <select
                                className="border-b border-[#c4c0b8] bg-transparent text-xs font-semibold text-[#6366f1] cursor-pointer outline-none px-0.5"
                                value={currency}
                                onChange={(e) => setCurrency(e.target.value)}
                            >
                                {CURRENCIES.map((c) => <option key={c}>{c}</option>)}
                            </select>
                        </label>
                        <div className="relative flex items-center">
                            <span className="absolute left-[4px] text-[13px] font-bold text-[#6366f1] tracking-[0.5px] pointer-events-none">{currency}</span>
                            <input
                                type="number"
                                className="w-full border-b-[1.5px] border-[#e0ddd8] bg-transparent text-[15px] text-[#1a1a2e] py-2 px-1 pl-[52px] outline-none transition-colors focus:border-[#6366f1]"
                                placeholder="0.00"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                            />
                        </div>
                        <p className="text-[11px] text-[#aaa] mt-1 leading-[1.5]">
                            Employee can submit in any currency · Manager sees auto-converted base currency with live rates
                        </p>
                    </div>

                    {/* Remarks */}
                    <div className="flex flex-col gap-1.5 sm:col-span-1 border-0">
                        <label className="text-xs font-semibold text-[#888] tracking-[0.4px] uppercase flex items-center gap-1.5">Remarks</label>
                        <textarea
                            className="w-full border-b-[1.5px] border-[#e0ddd8] bg-transparent text-[15px] text-[#1a1a2e] px-1 h-[72px] resize-none pt-[10px] outline-none transition-colors focus:border-[#6366f1]"
                            placeholder="Any additional notes…"
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                        />
                    </div>
                </div>

                {/* Divider */}
                <div className="h-[1px] bg-[#f0ede8] mx-[-4px] my-5" />

                {/* Approval log */}
                <div>
                    <p className="text-[11px] font-bold text-[#aaa] tracking-[0.8px] uppercase mb-2.5">Approval History</p>
                    <table className="w-full border-collapse text-sm">
                        <thead>
                            <tr>
                                {["Approver", "Status", "Time"].map((h) => (
                                    <th key={h} className="text-left font-semibold text-[#bbb] text-[11px] tracking-[0.5px] pb-2 border-b border-[#f0ede8]">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {approvalLog.map((row, i) => (
                                <tr key={i}>
                                    <td className="py-2.5 text-[#444] border-b border-[#f8f6f2] text-sm">{row.approver}</td>
                                    <td className="py-2.5 text-[#444] border-b border-[#f8f6f2] text-sm">
                                        <span className="bg-[#f0fdf4] text-[#16a34a] text-xs font-semibold px-2.5 py-[3px] rounded-[20px] border border-[#bbf7d0]">{row.status}</span>
                                    </td>
                                    <td className="py-2.5 text-[#444] border-b border-[#f8f6f2] text-sm">{row.time}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Submit */}
                <div className="flex justify-center mt-7">
                    <button
                        className={`rounded-[40px] px-[52px] py-[13px] text-[15px] font-semibold cursor-pointer tracking-[0.3px] transition-all duration-250 hover:-translate-y-[1px] hover:opacity-[0.88] ${submitted ? 'bg-[#16a34a] text-white shadow-[0_4px_16px_rgba(22,163,74,0.25)]' : 'bg-[#1a1a2e] text-white shadow-[0_4px_16px_rgba(26,26,46,0.18)]'}`}
                        onClick={handleSubmit}
                    >
                        {submitted ? "✓ Submitted!" : "Submit Expense"}
                    </button>
                </div>
            </div>
        </div>
    );
}
