"use client";

import { useState, useTransition } from "react";
import { approveExpense } from "./actions";

type ExpenseStatus = "pending" | "approved" | "rejected";
type Category = "Travel" | "Meals" | "Software" | "Equipment" | "Training" | string;

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

const statusCfg: Record<ExpenseStatus, { label: string; textUrl: string; bg: string; border: string; dot: string }> = {
    pending: { label: "Pending", textUrl: "text-amber-600", bg: "bg-amber-50", border: "border-amber-300", dot: "bg-amber-600" },
    approved: { label: "Approved", textUrl: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-300", dot: "bg-emerald-600" },
    rejected: { label: "Rejected", textUrl: "text-red-600", bg: "bg-red-50", border: "border-red-300", dot: "bg-red-600" },
};

const avatarColors = ["bg-blue-600", "bg-emerald-600", "bg-amber-600", "bg-purple-600", "bg-red-600"];
const catIcon: Record<string, string> = { Travel: "✈", Meals: "◉", Software: "▣", Equipment: "▤", Training: "▦" };

// ── Shared components ──────────────────────────────────────────

function Badge({ status }: { status: ExpenseStatus }) {
    const cfg = statusCfg[status];
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-bold tracking-[0.07em] uppercase ${cfg.textUrl} ${cfg.bg} border ${cfg.border}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            {cfg.label}
        </span>
    );
}

function Avatar({ initials, index, size = 34 }: { initials: string; index: number; size?: number }) {
    const bg = avatarColors[index % avatarColors.length];
    return (
        <div style={{ width: size, height: size, fontSize: size * 0.3 }}
             className={`rounded-full shrink-0 flex items-center justify-center font-extrabold text-white ${bg}`}>
            {initials}
        </div>
    );
}

function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
    return (
        <button onClick={onChange} className={`w-10 h-[22px] rounded-full shrink-0 relative transition-colors duration-200 outline-none ${on ? "bg-emerald-600" : "bg-slate-200"}`}>
            <span className={`absolute top-[3px] w-4 h-4 rounded-full bg-white transition-all duration-200 ${on ? "left-[21px]" : "left-[3px]"}`} />
        </button>
    );
}

function StatCard({ label, value, sub, iconBg, iconText, cardBg, borderColor }: {
    label: string; value: string | number; sub: string; iconBg: string; iconText: string; cardBg: string; borderColor: string;
}) {
    return (
        <div className={`rounded-xl p-4 flex items-center gap-4 border ${borderColor} ${cardBg}`}>
            <div className={`w-11 h-11 rounded-lg shrink-0 flex flex-col items-center justify-center font-extrabold text-white ${iconBg} ${typeof value === 'number' && value < 100 ? 'text-xl' : 'text-xs'}`}>
                {value}
            </div>
            <div>
                <div className="text-xs font-bold text-slate-900">{label}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">{sub}</div>
            </div>
        </div>
    );
}

// ── Components ─────────────────────────────────────────────────

function ApprovalsModal({ expense, onClose, onAction }: { expense: Expense | null; onClose: () => void; onAction: (id: string, action: ExpenseStatus, comment: string) => void; }) {
    const [comment, setComment] = useState("");
    const [isPending, startTransition] = useTransition();

    if (!expense) return null;

    const handleActionLocal = (decision: ExpenseStatus) => {
        startTransition(() => {
            onAction(expense.id, decision, comment);
        });
    };

    return (
        <div onClick={(e) => e.target === e.currentTarget && onClose()} className="fixed inset-0 bg-slate-900/55 z-50 flex items-center justify-center p-6">
            <div className="bg-white rounded-xl w-full max-w-lg overflow-hidden shadow-2xl">
                <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-900">
                    <div>
                        <div className="text-[10px] text-white/40 font-bold tracking-[0.1em] uppercase">Expense Review</div>
                        <div className="text-base font-extrabold text-white mt-1">{"#" + expense.id.slice(-6).toUpperCase()}</div>
                    </div>
                    <button onClick={onClose} className="bg-white/10 rounded-md w-8 h-8 flex items-center justify-center text-white cursor-pointer hover:bg-white/20 transition-colors">
                        ✕
                    </button>
                </div>
                <div className="p-6">
                    <div className="bg-slate-50 rounded-lg p-4 mb-4 border border-slate-200">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <div className="font-bold text-[15px] text-slate-900">{expense.employee}</div>
                                <div className="text-[11px] text-slate-500 mt-0.5">{expense.dept}</div>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-extrabold text-slate-900">{expense.display}</div>
                                <Badge status={expense.status} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-xs mb-3">
                            <div><div className="text-slate-500 text-[10px] font-semibold tracking-wider uppercase mb-0.5">Category</div><div className="text-slate-900 font-semibold text-xs">{catIcon[expense.category] || "▪"} {expense.category}</div></div>
                            <div><div className="text-slate-500 text-[10px] font-semibold tracking-wider uppercase mb-0.5">Date</div><div className="text-slate-900 font-semibold text-xs">{expense.date}</div></div>
                            <div><div className="text-slate-500 text-[10px] font-semibold tracking-wider uppercase mb-0.5">Receipt</div><div className="text-slate-900 font-semibold text-xs">{expense.receipt ? "✓ Attached" : "None"}</div></div>
                            <div><div className="text-slate-500 text-[10px] font-semibold tracking-wider uppercase mb-0.5">Current Step</div><div className="text-slate-900 font-semibold text-xs">{expense.step}</div></div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-slate-200">
                            <div className="text-slate-500 text-[10px] font-semibold tracking-wider uppercase mb-1">Description</div>
                            <div className="text-slate-900 text-[13px]">{expense.desc}</div>
                        </div>
                        {expense.comment && (
                            <div className="mt-3 p-2.5 bg-blue-50 border-l-4 border-blue-600 rounded-r text-[11px] text-slate-600">
                                <strong className="text-blue-600 mr-1">Previous Note:</strong>
                                {expense.comment}
                            </div>
                        )}
                    </div>

                    {expense.status === "pending" ? (
                        <>
                            <div className="mb-4">
                                <label className="block text-[10px] font-bold text-slate-500 tracking-[0.08em] uppercase mb-1.5">Your Comment (optional)</label>
                                <textarea 
                                    value={comment} 
                                    onChange={e => setComment(e.target.value)} 
                                    rows={3}
                                    placeholder="Add a note for the employee..."
                                    className="w-full p-3 border border-slate-200 rounded-md text-xs font-sans text-slate-900 resize-none outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors bg-slate-50" 
                                />
                            </div>
                            <div className="flex gap-3">
                                <button disabled={isPending} onClick={() => handleActionLocal("rejected")} className="flex-1 py-3 border-[1.5px] border-red-600 rounded-md text-xs font-bold text-red-600 bg-transparent hover:bg-red-50 disabled:opacity-50 transition-colors">
                                    {isPending ? "Processing..." : "Reject"}
                                </button>
                                <button disabled={isPending} onClick={() => handleActionLocal("approved")} className="flex-[2] py-3 border-none rounded-md text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 transition-colors">
                                    {isPending ? "Processing..." : "Approve Expense"}
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className={`text-center py-3.5 text-[13px] font-bold rounded-md border ${statusCfg[expense.status].border} ${statusCfg[expense.status].bg} ${statusCfg[expense.status].textUrl}`}>
                            This expense has been {expense.status}.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function DashboardView({ expenses, onAction }: { expenses: Expense[], onAction: (id: string, act: ExpenseStatus, c: string) => void }) {
    const [tab, setTab] = useState<ExpenseStatus | "all">("pending");
    const [search, setSearch] = useState("");
    const [modal, setModal] = useState<Expense | null>(null);

    const counts = { all: expenses.length, pending: 0, approved: 0, rejected: 0 } as Record<string, number>;
    expenses.forEach(e => counts[e.status]++);
    const totalPending = expenses.filter(e => e.status === "pending").reduce((s, e) => s + e.amount, 0);

    const filtered = expenses.filter(e => {
        const matchTab = tab === "all" || e.status === tab;
        const q = search.toLowerCase();
        return matchTab && (e.employee.toLowerCase().includes(q) || e.category.toLowerCase().includes(q));
    });

    const handleModalAction = (id: string, action: ExpenseStatus, comment: string) => {
        onAction(id, action, comment);
        setModal(null);
    };

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Expense Approvals</h1>
                <p className="text-xs text-slate-500 mt-1">Review and manage your team's expense requests</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <StatCard label="Pending Review" value={counts.pending} sub={`${totalPending.toLocaleString("en-IN", { style: 'currency', currency: 'INR'})} value`} iconBg="bg-amber-600" iconText="text-white" cardBg="bg-amber-50" borderColor="border-amber-600/30" />
                <StatCard label="Approved History" value={counts.approved} sub="Team expenses" iconBg="bg-emerald-600" iconText="text-white" cardBg="bg-emerald-50" borderColor="border-emerald-600/30" />
                <StatCard label="Rejected" value={counts.rejected} sub="Declined requests" iconBg="bg-red-600" iconText="text-white" cardBg="bg-red-50" borderColor="border-red-600/30" />
            </div>

            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <div className="flex items-center justify-between px-4 border-b border-slate-200">
                    <div className="flex">
                        {(Object.entries({ pending: "Pending", approved: "Approved", rejected: "Rejected", all: "All" })).map(([k, l]) => (
                            <button key={k} onClick={() => setTab(k as any)}
                                className={`px-4 py-3.5 text-xs font-medium border-b-2 flex items-center gap-1.5 -mb-[1px] ${tab === k ? 'border-blue-600 text-slate-900 font-bold' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>
                                {l}
                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${tab === k ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                    {counts[k]}
                                </span>
                            </button>
                        ))}
                    </div>
                    <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." className="hidden md:block w-48 px-3 py-1.5 text-[11px] border border-slate-200 rounded-md bg-slate-50 text-slate-900 outline-none focus:border-blue-500" />
                </div>
                <div className="overflow-x-auto w-full">
                    <table className="w-full text-left border-collapse min-w-[700px]">
                        <thead>
                            <tr>
                                {["Employee", "Category", "Description", "Date", "Amount", "Status", "Action"].map(h => (
                                    <th key={h} className="py-2.5 px-4 text-[10px] font-bold text-slate-500 tracking-[0.08em] uppercase border-b border-slate-200 bg-slate-50">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filtered.length === 0 ? (
                                <tr><td colSpan={7} className="text-center py-12 text-slate-400 text-xs">No expenses found matching the criteria.</td></tr>
                            ) : filtered.map((e, i) => (
                                <tr key={e.id} className={i % 2 === 0 ? "bg-white hover:bg-slate-50/50 transition-colors" : "bg-slate-50/30 hover:bg-slate-50/80 transition-colors"}>
                                    <td className="p-3 px-4">
                                        <div className="font-bold text-xs text-slate-900">{e.employee}</div>
                                        <div className="text-[10px] text-slate-500">{e.dept}</div>
                                    </td>
                                    <td className="p-3 px-4">
                                        <span className="text-[11px] text-slate-500">{catIcon[e.category] || "▪"} {e.category}</span>
                                    </td>
                                    <td className="p-3 px-4 max-w-[150px]">
                                        <div className="text-[11px] text-slate-500 truncate" title={e.desc}>{e.desc}</div>
                                    </td>
                                    <td className="p-3 px-4">
                                        <span className="text-[11px] text-slate-500">{e.date}</span>
                                    </td>
                                    <td className="p-3 px-4">
                                        <span className="font-extrabold text-[13px] text-slate-900">{e.display}</span>
                                    </td>
                                    <td className="p-3 px-4"><Badge status={e.status} /></td>
                                    <td className="p-3 px-4">
                                        {e.status === "pending" ? (
                                            <button onClick={() => setModal(e)} className="px-3 py-1.5 bg-blue-600 text-white rounded text-[10px] font-bold hover:bg-blue-700 transition-colors shadow-sm">Review</button>
                                        ) : (
                                            <button onClick={() => setModal(e)} className="px-3 py-1.5 bg-transparent border border-slate-200 text-slate-500 rounded text-[10px] font-semibold hover:bg-slate-50 transition-colors">View</button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="px-4 py-3 border-t border-slate-200 flex justify-between items-center bg-slate-50">
                    <span className="text-[11px] text-slate-500">Showing {filtered.length} of {expenses.length} expenses</span>
                    <div className="flex gap-1.5">
                        <button className="px-3 py-1 border border-slate-200 bg-white rounded text-xs text-slate-500 hover:bg-slate-50 transition-colors">←</button>
                        <button className="px-3 py-1 border border-slate-200 bg-white rounded text-xs text-slate-500 hover:bg-slate-50 transition-colors">→</button>
                    </div>
                </div>
            </div>
            {modal && <ApprovalsModal expense={modal} onClose={() => setModal(null)} onAction={handleModalAction} />}
        </div>
    );
}

function TeamView({ expenses, teamMembers }: { expenses: Expense[], teamMembers: TeamMember[] }) {
    const approvedAmt = (name: string) => expenses.filter(e => e.employee === name && e.status === "approved").reduce((s, e) => s + e.amount, 0);
    const pendingCnt = (name: string) => expenses.filter(e => e.employee === name && e.status === "pending").length;
    
    // Safety fallback if teamMembers is somehow undefined
    if (!teamMembers) return null;

    const total = teamMembers.reduce((s, m) => s + approvedAmt(m.name), 0);
    const maxSpend = Math.max(...teamMembers.map(m => approvedAmt(m.name)), 1);

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">My Team</h1>
                <p className="text-xs text-slate-500 mt-1">Direct reports and their expense activity</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <StatCard label="Team Members" value={teamMembers.length} sub="Direct reports" iconBg="bg-blue-600" iconText="text-white" cardBg="bg-blue-50" borderColor="border-blue-600/30" />
                <StatCard label="Pending Review" value={teamMembers.reduce((s, m) => s + pendingCnt(m.name), 0)} sub="Awaiting action" iconBg="bg-amber-600" iconText="text-white" cardBg="bg-amber-50" borderColor="border-amber-600/30" />
                <StatCard label="Approved Spend" value={total.toLocaleString("en-IN", { style: 'currency', currency: 'INR' })} sub="Total approved" iconBg="bg-emerald-600" iconText="text-white" cardBg="bg-emerald-50" borderColor="border-emerald-600/30" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    <div className="p-4 border-b border-slate-200 flex justify-between items-center">
                        <span className="text-[13px] font-bold text-slate-900">Direct Reports</span>
                        <span className="text-[11px] text-slate-500">{teamMembers.length} members</span>
                    </div>
                    <div>
                        {teamMembers.length === 0 ? (
                            <div className="p-8 text-center text-xs text-slate-500">You currently have no direct reports.</div>
                        ) : teamMembers.map((m, i) => {
                            const p = pendingCnt(m.name);
                            return (
                                <div key={m.name} className={`flex items-center gap-3 p-3.5 ${i < teamMembers.length - 1 ? 'border-b border-slate-100' : ''}`}>
                                    <Avatar initials={m.initials} index={i} />
                                    <div className="flex-1 min-w-0">
                                        <div className="text-[13px] font-bold text-slate-900 truncate">{m.name}</div>
                                        <div className="text-[10px] text-slate-500">{m.role}</div>
                                    </div>
                                    <div className="text-right mr-3 hidden sm:block">
                                        <div className="text-xs font-extrabold text-slate-900">{approvedAmt(m.name).toLocaleString("en-IN", { style: 'currency', currency: 'INR'})}</div>
                                        <div className="text-[10px] text-slate-400">approved</div>
                                    </div>
                                    {p > 0 ? <Badge status="pending" /> : <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-300 px-2.5 py-0.5 rounded">Clear</span>}
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    <div className="p-4 border-b border-slate-200">
                        <span className="text-[13px] font-bold text-slate-900">Spend Breakdown</span>
                    </div>
                    <div className="p-5">
                        {teamMembers.length === 0 ? (
                            <div className="p-4 text-center text-xs text-slate-500">No data available</div>
                        ) : teamMembers.map((m, i) => {
                            const spend = approvedAmt(m.name);
                            const pct = Math.round((spend / maxSpend) * 100) || 0;
                            return (
                                <div key={m.name} className="flex items-center gap-3 mb-4 last:mb-0">
                                    <div className="w-16 text-[11px] text-slate-500 truncate">{m.name.split(" ")[0]}</div>
                                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div className={`h-full rounded-full ${avatarColors[i % 5]}`} style={{ width: `${pct}%` }} />
                                    </div>
                                    <div className="w-16 text-right text-[11px] font-bold text-slate-900">{spend.toLocaleString("en-IN", { style: 'currency', currency: 'INR'})}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}

function SettingsView({ user }: { user: any }) {
    const [toggles, setToggles] = useState<Record<string, boolean>>({ t1: true, t2: true, t3: false, t4: true, t5: true, t6: false });
    const tog = (k: string) => setToggles(p => ({ ...p, [k]: !p[k] }));
    const [saved, setSaved] = useState(false);
    
    const initial = user?.name ? user.name.split(" ").map((n: string) => n[0]).join("").substring(0,2).toUpperCase() : "U";

    const save = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

    const inputClass = "w-full p-2 border border-slate-200 rounded-md text-xs font-sans text-slate-900 bg-slate-50 outline-none focus:border-blue-500 focus:bg-white transition-colors";

    return (
        <div className="pb-12">
            <div className="mb-6">
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Settings</h1>
                <p className="text-xs text-slate-500 mt-1">Profile, notifications and approval preferences</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                <div>
                    <div className="text-[10px] font-bold tracking-[0.08em] uppercase text-slate-500 mb-2">Profile</div>
                    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                        <div className="flex items-center gap-4 mb-5 pb-4 border-b border-slate-100">
                            <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-sm font-extrabold text-white">{initial}</div>
                            <div>
                                <div className="text-[15px] font-bold text-slate-900">{user?.name || "Manager"}</div>
                                <div className="text-[11px] text-slate-500">{user?.role || "Manager"} · {user?.company?.name || "Company"}</div>
                            </div>
                        </div>
                        
                        <div className="space-y-4 mb-5">
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 tracking-[0.06em] uppercase mb-1.5">Full Name</label>
                                <input defaultValue={user?.name || ""} className={inputClass} disabled />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-500 tracking-[0.06em] uppercase mb-1.5">Email</label>
                                <input defaultValue={user?.email || ""} className={inputClass} disabled />
                            </div>
                        </div>
                        
                        <button onClick={save} className={`w-full py-2.5 rounded-md text-xs font-bold text-white transition-colors ${saved ? 'bg-emerald-600' : 'bg-blue-600 hover:bg-blue-700'}`}>
                            {saved ? "✓ Saved" : "Save Changes"}
                        </button>
                    </div>
                </div>

                <div className="space-y-6">
                    <div>
                        <div className="text-[10px] font-bold tracking-[0.08em] uppercase text-slate-500 mb-2">Notifications</div>
                        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                            {[
                                { k: "t1", label: "New expense submitted", sub: "Alert when a team member submits" },
                                { k: "t2", label: "Escalation alerts", sub: "Notify when expense is escalated" },
                                { k: "t3", label: "Weekly digest", sub: "Summary email every Monday" },
                                { k: "t4", label: "Reminder after 48h", sub: "Remind if not reviewed in time" },
                            ].map((item, i) => (
                                <div key={item.k} className={`flex items-center justify-between p-3.5 ${i < 3 ? 'border-b border-slate-100' : ''}`}>
                                    <div>
                                        <div className="text-xs font-bold text-slate-900">{item.label}</div>
                                        <div className="text-[10px] text-slate-500 mt-0.5">{item.sub}</div>
                                    </div>
                                    <Toggle on={toggles[item.k]} onChange={() => tog(item.k)} />
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    <div>
                        <div className="text-[10px] font-bold tracking-[0.08em] uppercase text-slate-500 mb-2">Danger Zone</div>
                        <div className="bg-white border border-red-200 rounded-xl overflow-hidden shadow-sm">
                            <div className="p-4 flex justify-between items-center">
                                <div>
                                    <div className="text-xs font-bold text-red-600">Revalidate Data Cache</div>
                                    <div className="text-[10px] text-slate-500 mt-0.5">Force a soft refresh of expense data</div>
                                </div>
                                <button onClick={() => window.location.reload()} className="px-3.5 py-1.5 border border-red-600 rounded text-[11px] font-bold text-red-600 hover:bg-red-50 transition-colors">
                                    Refresh
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function ApprovalsClient({ initialExpenses, teamMembers, user }: { initialExpenses: Expense[], teamMembers: TeamMember[], user: any }) {
    const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);

    const handleAction = async (id: string, decision: ExpenseStatus, comment: string) => {
        // Optimistic update
        setExpenses(prev => prev.map(e => e.id === id ? { ...e, status: decision, comment } : e));
        
        // Execute server action mapping "approved" => "APPROVED", "rejected" => "REJECTED"
        const dbDecision = decision === "approved" ? "APPROVED" : "REJECTED";
        const result = await approveExpense(id, dbDecision, comment);
        
        if (!result.success) {
            // Unwind or show error if failed
            console.error("Failed to approve expense:", result.error);
        }
    };

    return (
        <div className="w-full h-full flex flex-col pt-8 px-6 lg:px-10 max-w-7xl mx-auto">
            {/* Main Content Area */}
            <div className="flex-1 overflow-x-hidden animate-in fade-in duration-300">
                <DashboardView expenses={expenses} onAction={handleAction} />
            </div>
        </div>
    );
}
