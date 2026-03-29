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

    const handleSubmit = () => {
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 2500);
    };

    return (
        <div style={styles.page}>
            <style>{cssAnimations}</style>

            <div style={styles.card}>
                {/* Header row */}
                <div style={styles.headerRow}>
                    {/* Receipt button */}
                    <label style={styles.receiptBtn}>
                        <input type="file" accept="image/*,.pdf" onChange={handleFileChange} style={{ display: "none" }} />
                        <span style={styles.receiptIcon}>📎</span>
                        <span>{receiptName ? receiptName.slice(0, 18) + "…" : "Attach Receipt"}</span>
                    </label>

                    {/* Stepper */}
                    <div style={styles.stepper}>
                        {STEPS.map((step, i) => (
                            <div key={step.key} style={styles.stepItem}>
                                <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
                                    <div
                                        style={{
                                            ...styles.stepDot,
                                            background: i <= currentStep ? "#1a1a2e" : "#d1d5db",
                                            border: i === currentStep ? "2.5px solid #6366f1" : "2.5px solid transparent",
                                            transform: i === currentStep ? "scale(1.2)" : "scale(1)",
                                        }}
                                    />
                                    {i < STEPS.length - 1 && (
                                        <div
                                            style={{
                                                ...styles.stepLine,
                                                background: i < currentStep ? "#1a1a2e" : "#d1d5db",
                                            }}
                                        />
                                    )}
                                </div>
                                <span
                                    style={{
                                        ...styles.stepLabel,
                                        color: i <= currentStep ? "#1a1a2e" : "#9ca3af",
                                        fontWeight: i === currentStep ? 700 : 400,
                                    }}
                                >
                                    {step.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Divider */}
                <div style={styles.divider} />

                {/* Form grid */}
                <div style={styles.grid}>
                    {/* Description */}
                    <div style={{ ...styles.fieldWrap, gridColumn: "1 / 2" }}>
                        <label style={styles.label}>Description</label>
                        <input
                            style={styles.input}
                            placeholder="What was this expense for?"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    {/* Expense Date */}
                    <div style={{ ...styles.fieldWrap, gridColumn: "2 / 3" }}>
                        <label style={styles.label}>Expense Date</label>
                        <input
                            type="date"
                            style={styles.input}
                            value={expenseDate}
                            onChange={(e) => setExpenseDate(e.target.value)}
                        />
                    </div>

                    {/* Category */}
                    <div style={{ ...styles.fieldWrap, gridColumn: "1 / 2" }}>
                        <label style={styles.label}>Category</label>
                        <select style={styles.select} value={category} onChange={(e) => setCategory(e.target.value)}>
                            <option value="">Select category</option>
                            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                        </select>
                    </div>

                    {/* Paid By */}
                    <div style={{ ...styles.fieldWrap, gridColumn: "2 / 3" }}>
                        <label style={styles.label}>Paid by</label>
                        <select style={styles.select} value={paidBy} onChange={(e) => setPaidBy(e.target.value)}>
                            <option value="">Select method</option>
                            {PAID_BY.map((p) => <option key={p}>{p}</option>)}
                        </select>
                    </div>

                    {/* Amount + Currency */}
                    <div style={{ ...styles.fieldWrap, gridColumn: "1 / 2" }}>
                        <label style={styles.label}>
                            Total amount in{" "}
                            <select
                                style={styles.inlineSelect}
                                value={currency}
                                onChange={(e) => setCurrency(e.target.value)}
                            >
                                {CURRENCIES.map((c) => <option key={c}>{c}</option>)}
                            </select>
                        </label>
                        <div style={styles.amountWrap}>
                            <span style={styles.currencyBadge}>{currency}</span>
                            <input
                                type="number"
                                style={{ ...styles.input, paddingLeft: 52 }}
                                placeholder="0.00"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                            />
                        </div>
                        <p style={styles.hint}>
                            Employee can submit in any currency · Manager sees auto-converted base currency with live rates
                        </p>
                    </div>

                    {/* Remarks */}
                    <div style={{ ...styles.fieldWrap, gridColumn: "2 / 3" }}>
                        <label style={styles.label}>Remarks</label>
                        <textarea
                            style={{ ...styles.input, height: 72, resize: "none", paddingTop: 10 }}
                            placeholder="Any additional notes…"
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                        />
                    </div>
                </div>

                {/* Divider */}
                <div style={{ ...styles.divider, margin: "20px 0 16px" }} />

                {/* Approval log */}
                <div>
                    <p style={styles.logTitle}>Approval History</p>
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                {["Approver", "Status", "Time"].map((h) => (
                                    <th key={h} style={styles.th}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {approvalLog.map((row, i) => (
                                <tr key={i}>
                                    <td style={styles.td}>{row.approver}</td>
                                    <td style={styles.td}>
                                        <span style={styles.approvedBadge}>{row.status}</span>
                                    </td>
                                    <td style={styles.td}>{row.time}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Submit */}
                <div style={styles.submitRow}>
                    <button
                        style={{
                            ...styles.submitBtn,
                            ...(submitted ? styles.submitBtnSuccess : {}),
                        }}
                        onClick={handleSubmit}
                    >
                        {submitted ? "✓ Submitted!" : "Submit Expense"}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Styles ────────────────────────────────────────────────────────────────

const styles: Record<string, React.CSSProperties> = {
    page: {
        minHeight: "100vh",
        background: "#faf9f6",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
        padding: "32px 16px",
    },
    card: {
        background: "#ffffff",
        borderRadius: 20,
        boxShadow: "0 2px 32px rgba(0,0,0,0.07), 0 1px 4px rgba(0,0,0,0.04)",
        padding: "32px 36px",
        width: "100%",
        maxWidth: 780,
        border: "1px solid #ebebeb",
    },
    headerRow: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 16,
        marginBottom: 20,
    },
    receiptBtn: {
        display: "flex",
        alignItems: "center",
        gap: 8,
        background: "#f5f3ef",
        border: "1.5px dashed #c9c5bc",
        borderRadius: 10,
        padding: "8px 18px",
        cursor: "pointer",
        fontSize: 13,
        fontWeight: 500,
        color: "#555",
        transition: "background 0.2s",
    },
    receiptIcon: { fontSize: 16 },
    stepper: {
        display: "flex",
        alignItems: "flex-start",
        gap: 0,
    },
    stepItem: {
        display: "flex",
        flexDirection: "column" as const,
        alignItems: "center",
        gap: 6,
    },
    stepDot: {
        width: 12,
        height: 12,
        borderRadius: "50%",
        transition: "all 0.3s",
    },
    stepLine: {
        width: 64,
        height: 2,
        borderRadius: 1,
        transition: "background 0.3s",
        marginTop: 5,
    },
    stepLabel: {
        fontSize: 11,
        letterSpacing: 0.2,
        whiteSpace: "nowrap" as const,
    },
    divider: {
        height: 1,
        background: "#f0ede8",
        margin: "0 -4px",
    },
    grid: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "20px 32px",
        marginTop: 24,
    },
    fieldWrap: {
        display: "flex",
        flexDirection: "column" as const,
        gap: 6,
    },
    label: {
        fontSize: 12,
        fontWeight: 600,
        color: "#888",
        letterSpacing: 0.4,
        textTransform: "uppercase" as const,
        display: "flex",
        alignItems: "center",
        gap: 6,
    },
    input: {
        border: "none",
        borderBottom: "1.5px solid #e0ddd8",
        borderRadius: 0,
        padding: "8px 4px",
        fontSize: 15,
        color: "#1a1a2e",
        background: "transparent",
        outline: "none",
        width: "100%",
        transition: "border-color 0.2s",
        fontFamily: "inherit",
    },
    select: {
        border: "none",
        borderBottom: "1.5px solid #e0ddd8",
        borderRadius: 0,
        padding: "8px 4px",
        fontSize: 15,
        color: "#1a1a2e",
        background: "transparent",
        outline: "none",
        width: "100%",
        cursor: "pointer",
        fontFamily: "inherit",
        appearance: "none" as const,
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23888' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 4px center",
    },
    inlineSelect: {
        border: "none",
        borderBottom: "1px solid #c4c0b8",
        background: "transparent",
        fontSize: 12,
        fontWeight: 600,
        color: "#6366f1",
        cursor: "pointer",
        outline: "none",
        padding: "0 2px",
        fontFamily: "inherit",
    },
    amountWrap: {
        position: "relative" as const,
        display: "flex",
        alignItems: "center",
    },
    currencyBadge: {
        position: "absolute" as const,
        left: 4,
        fontSize: 13,
        fontWeight: 700,
        color: "#6366f1",
        pointerEvents: "none" as const,
        letterSpacing: 0.5,
    },
    hint: {
        fontSize: 11,
        color: "#aaa",
        margin: "4px 0 0",
        lineHeight: 1.5,
    },
    logTitle: {
        fontSize: 11,
        fontWeight: 700,
        color: "#aaa",
        letterSpacing: 0.8,
        textTransform: "uppercase" as const,
        marginBottom: 10,
    },
    table: {
        width: "100%",
        borderCollapse: "collapse" as const,
        fontSize: 14,
    },
    th: {
        textAlign: "left" as const,
        fontWeight: 600,
        color: "#bbb",
        fontSize: 11,
        letterSpacing: 0.5,
        paddingBottom: 8,
        borderBottom: "1px solid #f0ede8",
    },
    td: {
        padding: "10px 0",
        color: "#444",
        borderBottom: "1px solid #f8f6f2",
        fontSize: 14,
    },
    approvedBadge: {
        background: "#f0fdf4",
        color: "#16a34a",
        fontSize: 12,
        fontWeight: 600,
        padding: "3px 10px",
        borderRadius: 20,
        border: "1px solid #bbf7d0",
    },
    submitRow: {
        display: "flex",
        justifyContent: "center",
        marginTop: 28,
    },
    submitBtn: {
        background: "#1a1a2e",
        color: "#fff",
        border: "none",
        borderRadius: 40,
        padding: "13px 52px",
        fontSize: 15,
        fontWeight: 600,
        cursor: "pointer",
        letterSpacing: 0.3,
        transition: "all 0.25s",
        boxShadow: "0 4px 16px rgba(26,26,46,0.18)",
    },
    submitBtnSuccess: {
        background: "#16a34a",
        boxShadow: "0 4px 16px rgba(22,163,74,0.25)",
    },
};

const cssAnimations = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
  input:focus, select:focus, textarea:focus {
    border-bottom-color: #6366f1 !important;
  }
  button:hover {
    opacity: 0.88;
    transform: translateY(-1px);
  }
`;
