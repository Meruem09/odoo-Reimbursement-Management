import { useState } from "react";

// ── Design tokens ──────────────────────────────────────────────
const C = {
    sidebar: "#0F172A",
    sidebarText: "rgba(255,255,255,0.45)",
    bg: "#F1F5F9",
    surface: "#FFFFFF",
    border: "#E2E8F0",
    text: "#0F172A",
    muted: "#64748B",
    subtle: "#94A3B8",
    accent: "#2563EB",
    accentBg: "#EFF6FF",
    pending: "#D97706",
    pendingBg: "#FFFBEB",
    pendingBdr: "#FCD34D",
    approved: "#059669",
    approvedBg: "#ECFDF5",
    approvedBdr: "#6EE7B7",
    rejected: "#DC2626",
    rejectedBg: "#FEF2F2",
    rejectedBdr: "#FCA5A5",
    avatarColors: ["#2563EB", "#059669", "#D97706", "#7C3AED", "#DC2626"],
} as const;

// ── Types ──────────────────────────────────────────────────────
type ExpenseStatus = "pending" | "approved" | "rejected";
type ExpenseStep = "Draft" | "Waiting Approval" | "Approved";
type Category = "Travel" | "Meals" | "Software" | "Equipment" | "Training";
type PaidBy = "Company Card" | "Personal Card" | "Cash" | "Bank Transfer";
type Currency = "USD" | "INR" | "EUR" | "GBP";

interface Expense {
    id: string;
    employee: string;
    dept: string;
    category: Category;
    desc: string;
    date: string;
    display: string;
    amount: number;
    status: ExpenseStatus;
    step: string;
    receipt: boolean;
    comment: string;
}

interface TeamMember {
    name: string;
    role: string;
    initials: string;
}

interface ApprovalHistoryEntry {
    approver: string;
    status: "Approved" | "Rejected" | "Pending";
    time: string;
}

interface ExpenseFormData {
    description: string;
    date: string;
    category: Category | "";
    paidBy: PaidBy | "";
    currency: Currency;
    amount: string;
    remarks: string;
    receipt: File | null;
}

// ── Data ───────────────────────────────────────────────────────
const initExpenses: Expense[] = [
    { id: "EXP-001", employee: "Priya Sharma", dept: "Engineering", category: "Travel", desc: "Flight to Mumbai for client meeting", date: "2025-03-18", display: "₹12,500", amount: 12500, status: "pending", step: "Manager Review", receipt: true, comment: "" },
    { id: "EXP-002", employee: "Arjun Mehta", dept: "Sales", category: "Meals", desc: "Client dinner at Trident Hotel", date: "2025-03-20", display: "₹4,800", amount: 4800, status: "pending", step: "Manager Review", receipt: true, comment: "" },
    { id: "EXP-003", employee: "Sneha Patel", dept: "Marketing", category: "Software", desc: "Annual Figma subscription", date: "2025-03-15", display: "₹3,200", amount: 3200, status: "pending", step: "Manager Review", receipt: false, comment: "" },
    { id: "EXP-004", employee: "Rohan Desai", dept: "Engineering", category: "Equipment", desc: "Mechanical keyboard for remote work", date: "2025-03-12", display: "₹8,900", amount: 8900, status: "approved", step: "Finance Review", receipt: true, comment: "Essential for remote setup." },
    { id: "EXP-005", employee: "Kavya Nair", dept: "HR", category: "Training", desc: "Leadership workshop registration", date: "2025-03-10", display: "₹6,500", amount: 6500, status: "rejected", step: "Completed", receipt: true, comment: "Covered by company plan." },
    { id: "EXP-006", employee: "Priya Sharma", dept: "Engineering", category: "Meals", desc: "Team lunch after sprint review", date: "2025-03-05", display: "₹2,100", amount: 2100, status: "approved", step: "Completed", receipt: true, comment: "" },
    { id: "EXP-007", employee: "Arjun Mehta", dept: "Sales", category: "Travel", desc: "Taxi to airport for Pune conference", date: "2025-03-02", display: "₹950", amount: 950, status: "approved", step: "Completed", receipt: true, comment: "" },
];

const teamMembers: TeamMember[] = [
    { name: "Priya Sharma", role: "Senior Engineer", initials: "PS" },
    { name: "Arjun Mehta", role: "Sales Executive", initials: "AM" },
    { name: "Sneha Patel", role: "Marketing Analyst", initials: "SP" },
    { name: "Rohan Desai", role: "Backend Engineer", initials: "RD" },
    { name: "Kavya Nair", role: "HR Specialist", initials: "KN" },
];

const catIcon: Record<Category, string> = {
    Travel: "✈", Meals: "◉", Software: "▣", Equipment: "▤", Training: "▦",
};

const statusCfg: Record<ExpenseStatus, { label: string; color: string; bg: string; bdr: string }> = {
    pending: { label: "Pending", color: C.pending, bg: C.pendingBg, bdr: C.pendingBdr },
    approved: { label: "Approved", color: C.approved, bg: C.approvedBg, bdr: C.approvedBdr },
    rejected: { label: "Rejected", color: C.rejected, bg: C.rejectedBg, bdr: C.rejectedBdr },
};

const STEPS: ExpenseStep[] = ["Draft", "Waiting Approval", "Approved"];

const mockApprovalHistory: ApprovalHistoryEntry[] = [
    { approver: "Sarah", status: "Approved", time: "12:44 · 4th Oct, 2025" },
];

// ── Shared components ──────────────────────────────────────────
function Badge({ status }: { status: ExpenseStatus }) {
    const cfg = statusCfg[status];
    return (
        <span style={{
            display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 9px",
            borderRadius: 4, fontSize: 10, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase",
            color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.bdr}`
        }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: cfg.color }} />
            {cfg.label}
        </span>
    );
}

function Avatar({ initials, index, size = 34 }: { initials: string; index: number; size?: number }) {
    const bg = C.avatarColors[index % C.avatarColors.length];
    return (
        <div style={{
            width: size, height: size, borderRadius: "50%", background: bg, flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: size * 0.3, fontWeight: 800, color: "#fff"
        }}>
            {initials}
        </div>
    );
}

function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
    return (
        <button onClick={onChange} style={{
            width: 40, height: 22, borderRadius: 11, border: "none",
            background: on ? C.approved : C.border, cursor: "pointer", position: "relative", flexShrink: 0,
            transition: "background 0.2s"
        }}>
            <span style={{
                position: "absolute", top: 3, left: on ? 21 : 3, width: 16, height: 16,
                borderRadius: "50%", background: "#fff", transition: "left 0.2s"
            }} />
        </button>
    );
}

function StatCard({ label, value, sub, color, bg }: {
    label: string; value: string | number; sub: string; color: string; bg: string;
}) {
    return (
        <div style={{
            background: bg, border: `1.5px solid ${color}30`, borderRadius: 10,
            padding: "16px 18px", display: "flex", alignItems: "center", gap: 14
        }}>
            <div style={{
                width: 46, height: 46, borderRadius: 8, background: color, flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: typeof value === "number" && value < 100 ? 20 : 12,
                fontWeight: 800, color: "#fff"
            }}>
                {value}
            </div>
            <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.text }}>{label}</div>
                <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{sub}</div>
            </div>
        </div>
    );
}

// ── Status Stepper ─────────────────────────────────────────────
function StatusStepper({ currentStep }: { currentStep: ExpenseStep }) {
    const currentIdx = STEPS.indexOf(currentStep);
    return (
        <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
            {STEPS.map((step, i) => {
                const isCompleted = i < currentIdx;
                const isActive = i === currentIdx;
                const dotColor = isCompleted || isActive ? C.accent : "#D1D5DB";
                const lineColor = i < currentIdx ? C.accent : "#D1D5DB";
                return (
                    <div key={step} style={{ display: "flex", alignItems: "center" }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                            <div style={{
                                width: 12, height: 12, borderRadius: "50%",
                                background: isCompleted ? C.accent : isActive ? C.accent : "transparent",
                                border: `2px solid ${dotColor}`,
                                boxShadow: isActive ? `0 0 0 3px ${C.accent}30` : "none",
                            }} />
                            <span style={{
                                fontSize: 10, whiteSpace: "nowrap", fontWeight: isActive ? 700 : 500,
                                color: isActive ? C.text : C.subtle,
                            }}>
                                {step}
                            </span>
                        </div>
                        {i < STEPS.length - 1 && (
                            <div style={{
                                width: 60, height: 2, background: lineColor,
                                marginBottom: 14, flexShrink: 0,
                            }} />
                        )}
                    </div>
                );
            })}
        </div>
    );
}

// ── Approval History Table ─────────────────────────────────────
function ApprovalHistory({ entries }: { entries: ApprovalHistoryEntry[] }) {
    const statusColor: Record<ApprovalHistoryEntry["status"], string> = {
        Approved: C.approved,
        Rejected: C.rejected,
        Pending: C.pending,
    };
    return (
        <div style={{ marginTop: 24 }}>
            <div style={{
                fontSize: 10, fontWeight: 700, letterSpacing: "0.09em", textTransform: "uppercase",
                color: C.muted, marginBottom: 10
            }}>
                Approval History
            </div>
            <div style={{ border: `1px solid ${C.border}`, borderRadius: 8, overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr style={{ background: C.bg }}>
                            {["Approver", "Status", "Time"].map(h => (
                                <th key={h} style={{
                                    padding: "8px 14px", textAlign: "left", fontSize: 10, fontWeight: 600,
                                    color: C.subtle, letterSpacing: "0.05em"
                                }}>
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {entries.map((entry, i) => (
                            <tr key={i} style={{ borderTop: `1px solid ${C.border}` }}>
                                <td style={{ padding: "10px 14px", fontSize: 13, color: C.text, fontWeight: 500 }}>
                                    {entry.approver}
                                </td>
                                <td style={{ padding: "10px 14px" }}>
                                    <span style={{
                                        display: "inline-block", padding: "3px 10px", borderRadius: 20,
                                        fontSize: 11, fontWeight: 600,
                                        color: statusColor[entry.status],
                                        background: `${statusColor[entry.status]}15`,
                                        border: `1px solid ${statusColor[entry.status]}40`,
                                    }}>
                                        {entry.status}
                                    </span>
                                </td>
                                <td style={{ padding: "10px 14px", fontSize: 12, color: C.muted }}>
                                    {entry.time}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// ── Expense Form (matches screenshot UI) ──────────────────────
function ExpenseForm() {
    const [form, setForm] = useState<ExpenseFormData>({
        description: "",
        date: "",
        category: "",
        paidBy: "",
        currency: "USD",
        amount: "",
        remarks: "",
        receipt: null,
    });
    const [step] = useState<ExpenseStep>("Waiting Approval");
    const [submitted, setSubmitted] = useState(false);

    const labelStyle: React.CSSProperties = {
        fontSize: 10, fontWeight: 700, letterSpacing: "0.09em",
        textTransform: "uppercase", color: C.muted, marginBottom: 5, display: "block",
    };
    const inputStyle: React.CSSProperties = {
        width: "100%", padding: "10px 0", border: "none", borderBottom: `1.5px solid ${C.border}`,
        fontSize: 14, color: C.text, background: "transparent", outline: "none",
        fontFamily: "inherit", boxSizing: "border-box",
    };
    const selectStyle: React.CSSProperties = {
        ...inputStyle,
        appearance: "none", cursor: "pointer",
    };

    const set = <K extends keyof ExpenseFormData>(key: K, val: ExpenseFormData[K]) =>
        setForm(prev => ({ ...prev, [key]: val }));

    const handleSubmit = () => {
        if (!form.description || !form.date || !form.category || !form.paidBy || !form.amount) return;
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 3000);
    };

    return (
        <div style={{
            background: C.bg, minHeight: "100vh", display: "flex",
            alignItems: "center", justifyContent: "center", padding: 24
        }}>
            <div style={{
                background: C.surface, borderRadius: 20, width: "100%", maxWidth: 600,
                padding: 32, boxShadow: "0 8px 40px rgba(15,23,42,0.10)"
            }}>

                {/* Top Row: Attach Receipt + Stepper */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
                    <label style={{
                        display: "inline-flex", alignItems: "center", gap: 8,
                        padding: "9px 18px", borderRadius: 10,
                        border: `1.5px dashed ${C.border}`, cursor: "pointer",
                        fontSize: 13, fontWeight: 600, color: C.muted,
                        background: form.receipt ? C.approvedBg : "transparent",
                        transition: "all 0.15s",
                    }}>
                        <span style={{ fontSize: 16 }}>📎</span>
                        {form.receipt ? form.receipt.name.slice(0, 18) + "…" : "Attach Receipt"}
                        <input type="file" accept="image/*,.pdf" style={{ display: "none" }}
                            onChange={e => set("receipt", e.target.files?.[0] ?? null)} />
                    </label>
                    <StatusStepper currentStep={step} />
                </div>

                {/* Fields Grid */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "22px 32px", marginBottom: 24 }}>
                    {/* Description */}
                    <div style={{ gridColumn: "1" }}>
                        <label style={labelStyle}>Description</label>
                        <input
                            value={form.description}
                            onChange={e => set("description", e.target.value)}
                            placeholder="What was this expense for?"
                            style={inputStyle}
                        />
                    </div>

                    {/* Expense Date */}
                    <div>
                        <label style={labelStyle}>Expense Date</label>
                        <input
                            type="date"
                            value={form.date}
                            onChange={e => set("date", e.target.value)}
                            style={inputStyle}
                        />
                    </div>

                    {/* Category */}
                    <div style={{ position: "relative" }}>
                        <label style={labelStyle}>Category</label>
                        <select value={form.category} onChange={e => set("category", e.target.value as Category | "")}
                            style={selectStyle}>
                            <option value="">Select category</option>
                            {(["Travel", "Meals", "Software", "Equipment", "Training"] as Category[]).map(c => (
                                <option key={c} value={c}>{catIcon[c]} {c}</option>
                            ))}
                        </select>
                        <span style={{ position: "absolute", right: 0, bottom: 12, color: C.subtle, pointerEvents: "none" }}>▾</span>
                    </div>

                    {/* Paid By */}
                    <div style={{ position: "relative" }}>
                        <label style={labelStyle}>Paid By</label>
                        <select value={form.paidBy} onChange={e => set("paidBy", e.target.value as PaidBy | "")}
                            style={selectStyle}>
                            <option value="">Select method</option>
                            {(["Company Card", "Personal Card", "Cash", "Bank Transfer"] as PaidBy[]).map(p => (
                                <option key={p} value={p}>{p}</option>
                            ))}
                        </select>
                        <span style={{ position: "absolute", right: 0, bottom: 12, color: C.subtle, pointerEvents: "none" }}>▾</span>
                    </div>

                    {/* Amount */}
                    <div>
                        <label style={labelStyle}>
                            Total Amount in{" "}
                            <select value={form.currency}
                                onChange={e => set("currency", e.target.value as Currency)}
                                style={{
                                    border: "none", background: "transparent", fontSize: 10, fontWeight: 700,
                                    color: C.accent, cursor: "pointer", fontFamily: "inherit", outline: "none"
                                }}>
                                {(["USD", "INR", "EUR", "GBP"] as Currency[]).map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </label>
                        <div style={{ display: "flex", alignItems: "center", borderBottom: `1.5px solid ${C.border}`, paddingBottom: 10 }}>
                            <span style={{ fontSize: 13, fontWeight: 700, color: C.accent, marginRight: 8, flexShrink: 0 }}>
                                {form.currency}
                            </span>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={form.amount}
                                onChange={e => set("amount", e.target.value)}
                                placeholder="0.00"
                                style={{ ...inputStyle, border: "none", padding: 0, flexGrow: 1 }}
                            />
                        </div>
                        <div style={{ fontSize: 10, color: C.subtle, marginTop: 6 }}>
                            Employee can submit in any currency · Manager sees auto-converted base currency with live rates
                        </div>
                    </div>

                    {/* Remarks */}
                    <div>
                        <label style={labelStyle}>Remarks</label>
                        <textarea
                            value={form.remarks}
                            onChange={e => set("remarks", e.target.value)}
                            placeholder="Any additional notes..."
                            rows={3}
                            style={{
                                ...inputStyle, borderBottom: "none",
                                border: `1.5px solid ${C.border}`, borderRadius: 6,
                                padding: "8px 10px", resize: "none", fontSize: 13
                            }}
                        />
                    </div>
                </div>

                {/* Divider */}
                <div style={{ height: 1, background: C.border, marginBottom: 24 }} />

                {/* Approval History */}
                <ApprovalHistory entries={mockApprovalHistory} />

                {/* Submit */}
                <button
                    onClick={handleSubmit}
                    style={{
                        width: "100%", marginTop: 28, padding: "14px 0",
                        background: submitted ? C.approved : C.text,
                        color: "#fff", border: "none", borderRadius: 30,
                        fontSize: 14, fontWeight: 700, cursor: "pointer",
                        fontFamily: "inherit", letterSpacing: "0.02em",
                        transition: "background 0.25s, transform 0.1s",
                        transform: submitted ? "scale(0.99)" : "scale(1)",
                    }}
                >
                    {submitted ? "✓ Submitted!" : "Submit Expense"}
                </button>
            </div>
        </div>
    );
}

// ── Approval Modal ─────────────────────────────────────────────
function Modal({ expense, onClose, onAction }: {
    expense: Expense | null;
    onClose: () => void;
    onAction: (id: string, action: ExpenseStatus, comment: string) => void;
}) {
    const [comment, setComment] = useState("");
    if (!expense) return null;
    return (
        <div onClick={(e) => e.target === e.currentTarget && onClose()}
            style={{
                position: "fixed", inset: 0, background: "rgba(15,23,42,0.55)", zIndex: 200,
                display: "flex", alignItems: "center", justifyContent: "center", padding: 24
            }}>
            <div style={{
                background: C.surface, borderRadius: 12, width: "100%", maxWidth: 500,
                overflow: "hidden", boxShadow: "0 24px 64px rgba(15,23,42,0.18)"
            }}>
                <div style={{
                    padding: "18px 22px", borderBottom: `1px solid ${C.border}`,
                    display: "flex", justifyContent: "space-between", alignItems: "center", background: C.sidebar
                }}>
                    <div>
                        <div style={{
                            fontSize: 10, color: "rgba(255,255,255,0.4)", fontWeight: 700,
                            letterSpacing: "0.1em", textTransform: "uppercase"
                        }}>Expense Review</div>
                        <div style={{ fontSize: 16, fontWeight: 800, color: "#fff", marginTop: 2 }}>{expense.id}</div>
                    </div>
                    <button onClick={onClose} style={{
                        background: "rgba(255,255,255,0.1)", border: "none",
                        borderRadius: 6, width: 32, height: 32, cursor: "pointer", color: "#fff", fontSize: 16,
                        display: "flex", alignItems: "center", justifyContent: "center"
                    }}>✕</button>
                </div>
                <div style={{ padding: 22 }}>
                    <div style={{ background: C.bg, borderRadius: 8, padding: 16, marginBottom: 18, border: `1px solid ${C.border}` }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                            <div>
                                <div style={{ fontWeight: 700, fontSize: 15, color: C.text }}>{expense.employee}</div>
                                <div style={{ fontSize: 11, color: C.muted, marginTop: 1 }}>{expense.dept}</div>
                            </div>
                            <div style={{ textAlign: "right" }}>
                                <div style={{ fontSize: 22, fontWeight: 800, color: C.text }}>{expense.display}</div>
                                <Badge status={expense.status} />
                            </div>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, fontSize: 12 }}>
                            {([["Category", expense.category], ["Date", expense.date],
                            ["Receipt", expense.receipt ? "✓ Attached" : "Not attached"], ["Step", expense.step]] as [string, string][])
                                .map(([l, v]) => (
                                    <div key={l}>
                                        <div style={{
                                            color: C.subtle, fontSize: 10, fontWeight: 600, letterSpacing: "0.05em",
                                            textTransform: "uppercase", marginBottom: 2
                                        }}>{l}</div>
                                        <div style={{ color: C.text, fontWeight: 600, fontSize: 12 }}>{v}</div>
                                    </div>
                                ))}
                        </div>
                        <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${C.border}` }}>
                            <div style={{
                                color: C.subtle, fontSize: 10, fontWeight: 600, letterSpacing: "0.05em",
                                textTransform: "uppercase", marginBottom: 3
                            }}>Description</div>
                            <div style={{ color: C.text, fontSize: 13 }}>{expense.desc}</div>
                        </div>
                        {expense.comment && (
                            <div style={{
                                marginTop: 10, padding: "8px 10px", background: C.accentBg,
                                borderLeft: `3px solid ${C.accent}`, borderRadius: "0 4px 4px 0", fontSize: 11, color: C.muted
                            }}>
                                <b style={{ color: C.accent }}>Note:</b> {expense.comment}
                            </div>
                        )}
                    </div>
                    {expense.status === "pending" ? (
                        <>
                            <div style={{ marginBottom: 16 }}>
                                <label style={{
                                    display: "block", fontSize: 10, fontWeight: 700, color: C.muted,
                                    letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6
                                }}>
                                    Comment (optional)
                                </label>
                                <textarea value={comment} onChange={e => setComment(e.target.value)} rows={3}
                                    placeholder="Add a note for the employee..."
                                    style={{
                                        width: "100%", padding: "10px 12px", border: `1px solid ${C.border}`, borderRadius: 6,
                                        fontSize: 12, fontFamily: "inherit", color: C.text, resize: "none", outline: "none",
                                        background: C.bg, boxSizing: "border-box"
                                    }} />
                            </div>
                            <div style={{ display: "flex", gap: 10 }}>
                                <button onClick={() => onAction(expense.id, "rejected", comment)}
                                    style={{
                                        flex: 1, padding: "11px 0", border: `1.5px solid ${C.rejected}`, borderRadius: 6,
                                        fontSize: 12, fontWeight: 700, color: C.rejected, background: "transparent",
                                        cursor: "pointer", fontFamily: "inherit"
                                    }}>
                                    Reject
                                </button>
                                <button onClick={() => onAction(expense.id, "approved", comment)}
                                    style={{
                                        flex: 2, padding: "11px 0", border: "none", borderRadius: 6,
                                        fontSize: 12, fontWeight: 700, color: "#fff", background: C.approved,
                                        cursor: "pointer", fontFamily: "inherit"
                                    }}>
                                    Approve Expense
                                </button>
                            </div>
                        </>
                    ) : (
                        <div style={{
                            textAlign: "center", padding: "14px 0", fontSize: 13,
                            color: statusCfg[expense.status].color, fontWeight: 700,
                            background: statusCfg[expense.status].bg, borderRadius: 6,
                            border: `1px solid ${statusCfg[expense.status].bdr}`
                        }}>
                            This expense was {expense.status}.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// ── Dashboard ──────────────────────────────────────────────────
function Dashboard({ expenses, setExpenses }: {
    expenses: Expense[];
    setExpenses: React.Dispatch<React.SetStateAction<Expense[]>>;
}) {
    const [tab, setTab] = useState<ExpenseStatus | "all">("pending");
    const [search, setSearch] = useState("");
    const [modal, setModal] = useState<Expense | null>(null);
    const [toast, setToast] = useState<{ msg: string; type: ExpenseStatus } | null>(null);

    const counts = { all: expenses.length, pending: 0, approved: 0, rejected: 0 } as Record<string, number>;
    expenses.forEach(e => counts[e.status]++);
    const totalPending = expenses.filter(e => e.status === "pending").reduce((s, e) => s + e.amount, 0);

    const filtered = expenses.filter(e => {
        const matchTab = tab === "all" || e.status === tab;
        const q = search.toLowerCase();
        return matchTab && (
            e.employee.toLowerCase().includes(q) ||
            e.id.toLowerCase().includes(q) ||
            e.category.toLowerCase().includes(q)
        );
    });

    const handleAction = (id: string, action: ExpenseStatus, comment: string) => {
        setExpenses(prev => prev.map(e => e.id === id ? { ...e, status: action, comment } : e));
        setModal(null);
        setToast({ msg: action === "approved" ? "Expense approved." : "Expense rejected.", type: action });
        setTimeout(() => setToast(null), 3000);
    };

    const tabs: [ExpenseStatus | "all", string][] = [
        ["pending", "Pending"], ["approved", "Approved"], ["rejected", "Rejected"], ["all", "All"],
    ];

    return (
        <div>
            {toast && (
                <div style={{
                    position: "fixed", top: 24, right: 24, zIndex: 300, padding: "11px 20px",
                    borderRadius: 8, fontSize: 12, fontWeight: 700, color: "#fff",
                    background: toast.type === "approved" ? C.approved : C.rejected
                }}>
                    {toast.msg}
                </div>
            )}
            <div style={{ marginBottom: 22 }}>
                <h1 style={{ fontSize: 24, fontWeight: 800, color: C.text, letterSpacing: "-0.5px" }}>Expense Approvals</h1>
                <p style={{ fontSize: 12, color: C.muted, marginTop: 3 }}>Review and manage your team's expense requests</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 22 }}>
                <StatCard label="Pending Review" value={counts.pending} sub={`₹${totalPending.toLocaleString("en-IN")} total`} color={C.pending} bg={C.pendingBg} />
                <StatCard label="Approved This Month" value={counts.approved} sub="Team expenses" color={C.approved} bg={C.approvedBg} />
                <StatCard label="Rejected" value={counts.rejected} sub="This month" color={C.rejected} bg={C.rejectedBg} />
            </div>
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, overflow: "hidden" }}>
                <div style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "0 18px", borderBottom: `1px solid ${C.border}`
                }}>
                    <div style={{ display: "flex" }}>
                        {tabs.map(([k, l]) => (
                            <button key={k} onClick={() => setTab(k)}
                                style={{
                                    padding: "13px 14px", border: "none", background: "none", cursor: "pointer",
                                    fontFamily: "inherit", fontSize: 12, fontWeight: tab === k ? 700 : 500,
                                    color: tab === k ? C.text : C.subtle,
                                    borderBottom: tab === k ? `2px solid ${C.accent}` : "2px solid transparent",
                                    display: "flex", alignItems: "center", gap: 5, marginBottom: -1
                                }}>
                                {l}
                                <span style={{
                                    fontSize: 9, fontWeight: 700, padding: "1px 5px", borderRadius: 8,
                                    background: tab === k ? C.accent : C.bg,
                                    color: tab === k ? "#fff" : C.muted
                                }}>
                                    {counts[k]}
                                </span>
                            </button>
                        ))}
                    </div>
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..."
                        style={{
                            padding: "6px 11px", border: `1px solid ${C.border}`, borderRadius: 5, fontSize: 11,
                            fontFamily: "inherit", color: C.text, background: C.bg, outline: "none", width: 160
                        }} />
                </div>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr>
                            {["ID", "Employee", "Category", "Description", "Date", "Amount", "Status", "Action"].map(h => (
                                <th key={h} style={{
                                    padding: "9px 14px", textAlign: "left", fontSize: 10, fontWeight: 700,
                                    color: C.muted, letterSpacing: "0.08em", textTransform: "uppercase",
                                    borderBottom: `1px solid ${C.border}`, background: C.bg
                                }}>
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 ? (
                            <tr><td colSpan={8} style={{ textAlign: "center", padding: 40, color: C.subtle, fontSize: 12 }}>
                                No expenses found
                            </td></tr>
                        ) : filtered.map((e, i) => (
                            <tr key={e.id} style={{ background: i % 2 === 0 ? C.surface : C.bg }}>
                                <td style={{ padding: "11px 14px" }}>
                                    <span style={{ fontFamily: "monospace", fontSize: 10, fontWeight: 700, color: C.muted }}>{e.id}</span>
                                </td>
                                <td style={{ padding: "11px 14px" }}>
                                    <div style={{ fontWeight: 700, fontSize: 12, color: C.text }}>{e.employee}</div>
                                    <div style={{ fontSize: 10, color: C.subtle }}>{e.dept}</div>
                                </td>
                                <td style={{ padding: "11px 14px" }}>
                                    <span style={{ fontSize: 11, color: C.muted }}>{catIcon[e.category as Category] || "▪"} {e.category}</span>
                                </td>
                                <td style={{ padding: "11px 14px", maxWidth: 160 }}>
                                    <div style={{
                                        fontSize: 11, color: C.muted, overflow: "hidden", textOverflow: "ellipsis",
                                        whiteSpace: "nowrap", maxWidth: 160
                                    }}>{e.desc}</div>
                                </td>
                                <td style={{ padding: "11px 14px" }}>
                                    <span style={{ fontSize: 11, color: C.muted }}>{e.date}</span>
                                </td>
                                <td style={{ padding: "11px 14px" }}>
                                    <span style={{ fontWeight: 800, fontSize: 13, color: C.text }}>{e.display}</span>
                                </td>
                                <td style={{ padding: "11px 14px" }}><Badge status={e.status} /></td>
                                <td style={{ padding: "11px 14px" }}>
                                    {e.status === "pending" ? (
                                        <button onClick={() => setModal(e)}
                                            style={{
                                                padding: "5px 12px", background: C.accent, color: "#fff", border: "none",
                                                borderRadius: 5, fontSize: 10, fontWeight: 700, cursor: "pointer", fontFamily: "inherit"
                                            }}>
                                            Review
                                        </button>
                                    ) : (
                                        <button onClick={() => setModal(e)}
                                            style={{
                                                padding: "5px 12px", background: "transparent", color: C.muted,
                                                border: `1px solid ${C.border}`, borderRadius: 5, fontSize: 10,
                                                fontWeight: 600, cursor: "pointer", fontFamily: "inherit"
                                            }}>
                                            View
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <div style={{
                    padding: "11px 18px", borderTop: `1px solid ${C.border}`,
                    display: "flex", justifyContent: "space-between", alignItems: "center"
                }}>
                    <span style={{ fontSize: 11, color: C.subtle }}>
                        Showing {filtered.length} of {expenses.length} expenses
                    </span>
                    <div style={{ display: "flex", gap: 5 }}>
                        {["←", "→"].map(a => (
                            <button key={a} style={{
                                padding: "4px 10px", border: `1px solid ${C.border}`, borderRadius: 4,
                                background: "none", cursor: "pointer", fontSize: 12, color: C.muted, fontFamily: "inherit"
                            }}>{a}</button>
                        ))}
                    </div>
                </div>
            </div>
            <Modal expense={modal} onClose={() => setModal(null)} onAction={handleAction} />
        </div>
    );
}

// ── My Team ────────────────────────────────────────────────────
function MyTeam({ expenses }: { expenses: Expense[] }) {
    const approvedAmt = (name: string) =>
        expenses.filter(e => e.employee === name && e.status === "approved").reduce((s, e) => s + e.amount, 0);
    const pendingCnt = (name: string) =>
        expenses.filter(e => e.employee === name && e.status === "pending").length;
    const total = teamMembers.reduce((s, m) => s + approvedAmt(m.name), 0);
    const maxSpend = Math.max(...teamMembers.map(m => approvedAmt(m.name)), 1);

    return (
        <div>
            <div style={{ marginBottom: 22 }}>
                <h1 style={{ fontSize: 24, fontWeight: 800, color: C.text, letterSpacing: "-0.5px" }}>My Team</h1>
                <p style={{ fontSize: 12, color: C.muted, marginTop: 3 }}>Direct reports and their expense activity</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 22 }}>
                <StatCard label="Team Members" value={teamMembers.length} sub="Direct reports" color={C.accent} bg={C.accentBg} />
                <StatCard label="Pending Review" value={teamMembers.reduce((s, m) => s + pendingCnt(m.name), 0)} sub="Awaiting action" color={C.pending} bg={C.pendingBg} />
                <StatCard label="Approved Spend" value={`₹${total.toLocaleString("en-IN")}`} sub="This month" color={C.approved} bg={C.approvedBg} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
                <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, overflow: "hidden" }}>
                    <div style={{
                        padding: "14px 18px", borderBottom: `1px solid ${C.border}`,
                        display: "flex", justifyContent: "space-between"
                    }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>Direct Reports</span>
                        <span style={{ fontSize: 11, color: C.muted }}>{teamMembers.length} members</span>
                    </div>
                    {teamMembers.map((m, i) => {
                        const p = pendingCnt(m.name);
                        return (
                            <div key={m.name} style={{
                                display: "flex", alignItems: "center", gap: 12, padding: "13px 18px",
                                borderBottom: i < teamMembers.length - 1 ? `1px solid ${C.border}` : "none"
                            }}>
                                <Avatar initials={m.initials} index={i} />
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{m.name}</div>
                                    <div style={{ fontSize: 10, color: C.subtle }}>{m.role}</div>
                                </div>
                                <div style={{ textAlign: "right", marginRight: 12 }}>
                                    <div style={{ fontSize: 12, fontWeight: 800, color: C.text }}>₹{approvedAmt(m.name).toLocaleString("en-IN")}</div>
                                    <div style={{ fontSize: 10, color: C.subtle }}>approved</div>
                                </div>
                                {p > 0
                                    ? <Badge status="pending" />
                                    : <span style={{
                                        fontSize: 10, fontWeight: 700, color: C.approved, background: C.approvedBg,
                                        border: `1px solid ${C.approvedBdr}`, padding: "2px 8px", borderRadius: 4
                                    }}>Clear</span>
                                }
                            </div>
                        );
                    })}
                </div>
                <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, overflow: "hidden" }}>
                    <div style={{ padding: "14px 18px", borderBottom: `1px solid ${C.border}` }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>Spend Breakdown</span>
                    </div>
                    <div style={{ padding: "18px 20px" }}>
                        {teamMembers.map((m, i) => {
                            const spend = approvedAmt(m.name);
                            const pct = Math.round((spend / maxSpend) * 100);
                            return (
                                <div key={m.name} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                                    <div style={{
                                        width: 72, fontSize: 11, color: C.muted, whiteSpace: "nowrap",
                                        overflow: "hidden", textOverflow: "ellipsis"
                                    }}>
                                        {m.name.split(" ")[0]}
                                    </div>
                                    <div style={{ flex: 1, height: 8, background: C.bg, borderRadius: 4, overflow: "hidden" }}>
                                        <div style={{
                                            width: `${pct}%`, height: "100%",
                                            background: C.avatarColors[i % 5], borderRadius: 4
                                        }} />
                                    </div>
                                    <div style={{ width: 72, textAlign: "right", fontSize: 11, fontWeight: 700, color: C.text }}>
                                        ₹{spend.toLocaleString("en-IN")}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── History ────────────────────────────────────────────────────
function History({ expenses }: { expenses: Expense[] }) {
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState<ExpenseStatus | "all">("all");
    const [sort, setSort] = useState("date-desc");

    let hist = expenses.filter(e => e.status !== "pending");
    if (filter !== "all") hist = hist.filter(e => e.status === filter);
    if (search) hist = hist.filter(e =>
        e.employee.toLowerCase().includes(search.toLowerCase()) ||
        e.id.toLowerCase().includes(search.toLowerCase())
    );
    if (sort === "date-asc") hist.sort((a, b) => a.date.localeCompare(b.date));
    else if (sort === "amount-desc") hist.sort((a, b) => b.amount - a.amount);
    else hist.sort((a, b) => b.date.localeCompare(a.date));

    const totalApproved = hist.filter(e => e.status === "approved").reduce((s, e) => s + e.amount, 0);

    const sel: React.CSSProperties = {
        padding: "6px 10px", border: `1px solid ${C.border}`, borderRadius: 5, fontSize: 11,
        fontFamily: "inherit", color: C.text, background: C.bg, outline: "none",
    };

    return (
        <div>
            <div style={{ marginBottom: 22 }}>
                <h1 style={{ fontSize: 24, fontWeight: 800, color: C.text, letterSpacing: "-0.5px" }}>Approval History</h1>
                <p style={{ fontSize: 12, color: C.muted, marginTop: 3 }}>All expenses reviewed with comments and timestamps</p>
            </div>
            <div style={{ display: "flex", gap: 10, marginBottom: 18, flexWrap: "wrap" }}>
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search history..."
                    style={{ ...sel, width: 200 }} />
                <select value={filter} onChange={e => setFilter(e.target.value as ExpenseStatus | "all")} style={sel}>
                    <option value="all">All statuses</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                </select>
                <select value={sort} onChange={e => setSort(e.target.value)} style={sel}>
                    <option value="date-desc">Newest first</option>
                    <option value="date-asc">Oldest first</option>
                    <option value="amount-desc">Highest amount</option>
                </select>
            </div>
            <div style={{
                background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10,
                overflow: "hidden", marginBottom: 18
            }}>
                {hist.length === 0 ? (
                    <div style={{ textAlign: "center", padding: 40, color: C.subtle, fontSize: 12 }}>No history found</div>
                ) : hist.map((e, i) => {
                    const cfg = statusCfg[e.status];
                    return (
                        <div key={e.id} style={{
                            display: "flex", gap: 14, padding: "14px 18px", alignItems: "flex-start",
                            borderBottom: i < hist.length - 1 ? `1px solid ${C.border}` : "none"
                        }}>
                            <div style={{
                                width: 10, height: 10, borderRadius: "50%", background: cfg.color,
                                flexShrink: 0, marginTop: 4
                            }} />
                            <div style={{ flex: 1 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                    <div>
                                        <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{e.employee}</span>
                                        <span style={{ fontSize: 10, color: C.subtle, marginLeft: 8, fontFamily: "monospace" }}>{e.id}</span>
                                    </div>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                        <span style={{ fontSize: 13, fontWeight: 800, color: C.text }}>{e.display}</span>
                                        <Badge status={e.status} />
                                    </div>
                                </div>
                                <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{e.desc}</div>
                                {e.comment && (
                                    <div style={{
                                        marginTop: 6, fontSize: 11, color: C.muted, padding: "5px 10px",
                                        background: C.accentBg, borderLeft: `3px solid ${C.accent}`,
                                        borderRadius: "0 4px 4px 0"
                                    }}>
                                        <b style={{ color: C.accent }}>Note:</b> {e.comment}
                                    </div>
                                )}
                                <div style={{ fontSize: 10, color: C.subtle, marginTop: 6 }}>
                                    {e.date} · {catIcon[e.category as Category] || "▪"} {e.category}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
                <StatCard label="Total Approved" value={`₹${totalApproved.toLocaleString("en-IN")}`} sub="From filtered view" color={C.approved} bg={C.approvedBg} />
                <StatCard label="Rejected" value={hist.filter(e => e.status === "rejected").length} sub="Expenses declined" color={C.rejected} bg={C.rejectedBg} />
                <StatCard label="Reviewed" value={hist.length} sub="Total in view" color={C.accent} bg={C.accentBg} />
            </div>
        </div>
    );
}

// ── Settings ───────────────────────────────────────────────────
function Settings() {
    const [toggles, setToggles] = useState<Record<string, boolean>>({
        t1: true, t2: true, t3: false, t4: true, t5: true, t6: false,
    });
    const tog = (k: string) => setToggles(prev => ({ ...prev, [k]: !prev[k] }));
    const [saved, setSaved] = useState(false);
    const save = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

    const fieldStyle: React.CSSProperties = {
        padding: "8px 10px", border: `1px solid ${C.border}`, borderRadius: 5,
        fontSize: 12, fontFamily: "inherit", color: C.text, background: C.bg, outline: "none", width: "100%",
    };

    const SettingItem = ({ label, sub, tKey, last }: { label: string; sub?: string; tKey: string; last?: boolean }) => (
        <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "13px 18px", borderBottom: !last ? `1px solid ${C.border}` : "none"
        }}>
            <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{label}</div>
                {sub && <div style={{ fontSize: 10, color: C.subtle, marginTop: 1 }}>{sub}</div>}
            </div>
            <Toggle on={toggles[tKey]} onChange={() => tog(tKey)} />
        </div>
    );

    return (
        <div>
            <div style={{ marginBottom: 22 }}>
                <h1 style={{ fontSize: 24, fontWeight: 800, color: C.text, letterSpacing: "-0.5px" }}>Settings</h1>
                <p style={{ fontSize: 12, color: C.muted, marginTop: 3 }}>Profile, notifications and approval preferences</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                <div>
                    <div style={{
                        fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
                        color: C.muted, marginBottom: 8
                    }}>Profile</div>
                    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: 20 }}>
                        <div style={{
                            display: "flex", alignItems: "center", gap: 14, marginBottom: 20,
                            paddingBottom: 16, borderBottom: `1px solid ${C.border}`
                        }}>
                            <div style={{
                                width: 52, height: 52, borderRadius: "50%", background: C.accent,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                fontSize: 16, fontWeight: 800, color: "#fff"
                            }}>RK</div>
                            <div>
                                <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>Rahul Kumar</div>
                                <div style={{ fontSize: 11, color: C.muted }}>Manager · Engineering</div>
                            </div>
                        </div>
                        {([["Full Name", "Rahul Kumar"], ["Email", "rahul.kumar@company.com"], ["Department", "Engineering"]] as [string, string][]).map(([l, v]) => (
                            <div key={l} style={{ marginBottom: 12 }}>
                                <div style={{
                                    fontSize: 10, fontWeight: 700, color: C.muted, letterSpacing: "0.06em",
                                    textTransform: "uppercase", marginBottom: 4
                                }}>{l}</div>
                                <input defaultValue={v} style={fieldStyle} />
                            </div>
                        ))}
                        <button onClick={save}
                            style={{
                                width: "100%", padding: "10px 0", background: saved ? C.approved : C.accent,
                                color: "#fff", border: "none", borderRadius: 6, fontSize: 12, fontWeight: 700,
                                cursor: "pointer", fontFamily: "inherit", marginTop: 4, transition: "background 0.2s"
                            }}>
                            {saved ? "✓ Saved" : "Save Changes"}
                        </button>
                    </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                    <div>
                        <div style={{
                            fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
                            color: C.muted, marginBottom: 8
                        }}>Notifications</div>
                        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, overflow: "hidden" }}>
                            <SettingItem label="New expense submitted" sub="Alert when a team member submits" tKey="t1" />
                            <SettingItem label="Escalation alerts" sub="Notify when expense is escalated" tKey="t2" />
                            <SettingItem label="Weekly digest" sub="Summary email every Monday" tKey="t3" />
                            <SettingItem label="Reminder after 48h" sub="Remind if not reviewed in time" tKey="t4" last />
                        </div>
                    </div>
                    <div>
                        <div style={{
                            fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
                            color: C.muted, marginBottom: 8
                        }}>Approval Preferences</div>
                        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, overflow: "hidden" }}>
                            <SettingItem label="I am a manager approver" sub="Expenses route to me first" tKey="t5" />
                            <SettingItem label="Auto-approve under ₹500" sub="Skip review for small amounts" tKey="t6" />
                            <div style={{ padding: "13px 18px" }}>
                                <div style={{
                                    fontSize: 10, fontWeight: 700, color: C.muted, letterSpacing: "0.06em",
                                    textTransform: "uppercase", marginBottom: 5
                                }}>Default currency view</div>
                                <select style={{ ...fieldStyle }}>
                                    <option>INR – Indian Rupee</option>
                                    <option>USD – US Dollar</option>
                                    <option>EUR – Euro</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div>
                        <div style={{
                            fontSize: 10, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
                            color: C.muted, marginBottom: 8
                        }}>Danger Zone</div>
                        <div style={{
                            background: C.surface, border: `1px solid ${C.rejectedBdr}`,
                            borderRadius: 10, overflow: "hidden"
                        }}>
                            <div style={{ padding: "13px 18px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <div>
                                    <div style={{ fontSize: 12, fontWeight: 600, color: C.rejected }}>Sign out of all sessions</div>
                                    <div style={{ fontSize: 10, color: C.subtle, marginTop: 1 }}>Revoke all active logins</div>
                                </div>
                                <button style={{
                                    padding: "5px 14px", border: `1.5px solid ${C.rejected}`, borderRadius: 5,
                                    background: "transparent", color: C.rejected, fontSize: 11, fontWeight: 700,
                                    cursor: "pointer", fontFamily: "inherit"
                                }}>
                                    Sign Out
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── Root ───────────────────────────────────────────────────────
type Page = "dashboard" | "team" | "history" | "settings";

export default function ManagerDashboard() {
    const [page, setPage] = useState<Page>("dashboard");
    const [expenses, setExpenses] = useState<Expense[]>(initExpenses);

    const nav: { key: Page; icon: string; label: string }[] = [
        { key: "dashboard", icon: "◈", label: "Dashboard" },
        { key: "team", icon: "◻", label: "My Team" },
        { key: "history", icon: "◷", label: "History" },
        { key: "settings", icon: "◯", label: "Settings" },
    ];

    return (
        <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'DM Sans','Helvetica Neue',sans-serif" }}>
            {/* Sidebar */}
            <div style={{
                position: "fixed", left: 0, top: 0, bottom: 0, width: 210, background: C.sidebar,
                display: "flex", flexDirection: "column", zIndex: 10
            }}>
                <div style={{ padding: "26px 20px 18px" }}>
                    <div style={{ fontSize: 17, fontWeight: 800, color: "#fff", letterSpacing: "-0.5px" }}>Reimburse</div>
                    <div style={{
                        fontSize: 9, color: "rgba(255,255,255,0.3)", letterSpacing: "0.12em",
                        textTransform: "uppercase", marginTop: 3
                    }}>Manager Portal</div>
                </div>
                <div style={{ height: 1, background: "rgba(255,255,255,0.07)", margin: "0 20px" }} />
                <nav style={{ padding: "14px 10px", flex: 1 }}>
                    {nav.map(({ key, icon, label }) => (
                        <div key={key} onClick={() => setPage(key)}
                            style={{
                                display: "flex", alignItems: "center", gap: 10, padding: "9px 12px",
                                borderRadius: 6, marginBottom: 2, cursor: "pointer",
                                background: page === key ? "rgba(255,255,255,0.08)" : "transparent",
                                color: page === key ? "#fff" : C.sidebarText,
                                fontSize: 12, fontWeight: page === key ? 700 : 400,
                                borderLeft: page === key ? `3px solid ${C.accent}` : "3px solid transparent"
                            }}>
                            <span style={{ fontSize: 14 }}>{icon}</span>
                            {label}
                        </div>
                    ))}
                </nav>
                <div style={{ padding: "14px 20px", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{
                            width: 32, height: 32, borderRadius: "50%", background: C.accent,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 11, fontWeight: 800, color: "#fff", flexShrink: 0
                        }}>RK</div>
                        <div>
                            <div style={{ fontSize: 11, fontWeight: 700, color: "#fff" }}>Rahul Kumar</div>
                            <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)" }}>Manager</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div style={{ marginLeft: 210, padding: "32px" }}>
                {page === "dashboard" && <Dashboard expenses={expenses} setExpenses={setExpenses} />}
                {page === "team" && <MyTeam expenses={expenses} />}
                {page === "history" && <History expenses={expenses} />}
                {page === "settings" && <Settings />}
            </div>
        </div>
    );
}
