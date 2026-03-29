"use client";

import { useState } from 'react';

// ─── Rule Builder Component ──────────────────────────────────────────────
interface ApproverStep {
  id: string;
  sequence: number;
  role: string;
  approverId: string;
}

function RuleBuilder() {
  const [ruleName, setRuleName] = useState('');
  const [targetLevel, setTargetLevel] = useState('company'); 
  const [isManagerFirst, setIsManagerFirst] = useState(false);
  const [ruleType, setRuleType] = useState('percentage'); 
  const [thresholdPct, setThresholdPct] = useState(60);
  const [specificApprover, setSpecificApprover] = useState('');
  
  const [steps, setSteps] = useState<ApproverStep[]>([
    { id: '1', sequence: 1, role: 'Finance', approverId: '' }
  ]);

  const addStep = () => {
    setSteps([...steps, { id: Date.now().toString(), sequence: steps.length + 1, role: '', approverId: '' }]);
  };

  const removeStep = (id: string) => {
    const newSteps = steps.filter(s => s.id !== id).map((s, idx) => ({ ...s, sequence: idx + 1 }));
    setSteps(newSteps);
  };

  const updateStep = (id: string, field: keyof ApproverStep, value: string) => {
    setSteps(steps.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5 mb-8">
        <div className="flex flex-col gap-1.5 border-0">
          <label className="text-xs font-semibold text-[#888] tracking-[0.4px] uppercase flex items-center gap-1.5">Rule Name</label>
          <input 
            type="text" 
            value={ruleName} 
            onChange={e => setRuleName(e.target.value)} 
            placeholder="e.g. Standard Expenses" 
            className="w-full border-b-[1.5px] border-[#e0ddd8] bg-transparent text-[15px] text-[#1a1a2e] py-2 px-1 outline-none transition-colors focus:border-[#6366f1]"
          />
        </div>
        <div className="flex flex-col gap-1.5 border-0">
          <label className="text-xs font-semibold text-[#888] tracking-[0.4px] uppercase flex items-center gap-1.5">Apply for</label>
          <select 
            value={targetLevel} 
            onChange={e => setTargetLevel(e.target.value)}
            className="w-full border-b-[1.5px] border-[#e0ddd8] bg-transparent text-[15px] text-[#1a1a2e] py-2 px-1 appearance-none outline-none cursor-pointer focus:border-[#6366f1] bg-no-repeat bg-[right_4px_center]"
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23888' d='M6 8L1 3h10z'/%3E%3C/svg%3E")` }}
          >
            <option value="company">Entire Company</option>
            <option value="department">Specific Department</option>
            <option value="cost_center">Cost Center</option>
          </select>
        </div>
      </div>

      <div className="h-[1px] bg-[#f0ede8] mx-[-4px] mb-8" />

      <p className="text-[11px] font-bold text-[#aaa] tracking-[0.8px] uppercase mb-4">Approvers Sequence</p>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className="text-left font-semibold text-[#bbb] text-[11px] tracking-[0.5px] pb-2 border-b border-[#f0ede8] w-[60px]">Seq #</th>
              <th className="text-left font-semibold text-[#bbb] text-[11px] tracking-[0.5px] pb-2 border-b border-[#f0ede8]">Role Category</th>
              <th className="text-left font-semibold text-[#bbb] text-[11px] tracking-[0.5px] pb-2 border-b border-[#f0ede8]">Specific Approver (Optional)</th>
              <th className="text-left font-semibold text-[#bbb] text-[11px] tracking-[0.5px] pb-2 border-b border-[#f0ede8] w-[80px]">Action</th>
            </tr>
          </thead>
          <tbody>
            {steps.map(step => (
              <tr key={step.id}>
                <td className="py-2.5 text-[#444] border-b border-[#f8f6f2] text-sm font-semibold">{step.sequence}</td>
                <td className="py-2.5 px-2 border-b border-[#f8f6f2]">
                  <input 
                    type="text" 
                    value={step.role} 
                    onChange={e => updateStep(step.id, 'role', e.target.value)} 
                    placeholder="e.g. Finance" 
                    className="w-full border-b-[1.5px] border-[#e0ddd8] bg-transparent text-[15px] text-[#1a1a2e] py-1 px-1 outline-none transition-colors focus:border-[#6366f1]"
                  />
                </td>
                <td className="py-2.5 px-2 border-b border-[#f8f6f2]">
                  <select 
                    value={step.approverId} 
                    onChange={e => updateStep(step.id, 'approverId', e.target.value)}
                    className="w-full border-b-[1.5px] border-[#e0ddd8] bg-transparent text-[14px] text-[#1a1a2e] py-1 px-1 appearance-none outline-none cursor-pointer focus:border-[#6366f1] bg-no-repeat bg-[right_4px_center]"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23888' d='M6 8L1 3h10z'/%3E%3C/svg%3E")` }}
                  >
                    <option value="">-- Any in Role --</option>
                    <option value="u1">Alice (CFO)</option>
                    <option value="u2">Bob (Director)</option>
                  </select>
                </td>
                <td className="py-2.5 border-b border-[#f8f6f2]">
                  <button className="text-[#ef4444] text-[13px] font-semibold hover:opacity-80 transition-opacity" onClick={() => removeStep(step.id)}>Remove</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-5 mb-10">
        <button 
          className="flex items-center gap-2 bg-[#f5f3ef] border-[1.5px] border-dashed border-[#c9c5bc] rounded-lg px-4 py-2 text-[13px] font-medium text-[#555] hover:bg-[#ebe9e4] transition-colors"
          onClick={addStep}
        >
          <span className="text-base">+</span> Add Approver Step
        </button>
      </div>

      <div className="h-[1px] bg-[#f0ede8] mx-[-4px] mb-8" />

      <p className="text-[11px] font-bold text-[#aaa] tracking-[0.8px] uppercase mb-2">Dynamic Conditions</p>
      <p className="text-[12px] text-[#888] mb-4">Determine how the rule logic evaluates the sequence above.</p>

      <div className="bg-[#faf9f6] border border-[#f0ede8] rounded-[16px] p-6 mb-8">
        <label className="flex items-center gap-3 cursor-pointer group mb-6">
          <input 
            type="checkbox" 
            checked={isManagerFirst}
            onChange={e => setIsManagerFirst(e.target.checked)}
            className="w-4 h-4 accent-[#6366f1] cursor-pointer"
          />
          <span className="text-[14px] font-semibold text-[#1a1a2e] group-hover:text-[#6366f1] transition-colors">Is Employee's Direct Manager the First Approver?</span>
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
          <div className="flex flex-col gap-1.5 border-0">
            <label className="text-xs font-semibold text-[#888] tracking-[0.4px] uppercase flex items-center gap-1.5">Evaluation Logic</label>
            <select 
              value={ruleType} 
              onChange={e => setRuleType(e.target.value)}
              className="w-full border-b-[1.5px] border-[#e0ddd8] bg-transparent text-[15px] text-[#1a1a2e] py-2 px-1 appearance-none outline-none cursor-pointer focus:border-[#6366f1] bg-no-repeat bg-[right_4px_center]"
              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23888' d='M6 8L1 3h10z'/%3E%3C/svg%3E")` }}
            >
              <option value="fixed">Fixed Specific Manager (VIP Override)</option>
              <option value="percentage">By Threshold Percentage (Quorum)</option>
              <option value="hybrid">Hybrid (Either/Or)</option>
            </select>
          </div>

          {(ruleType === 'percentage' || ruleType === 'hybrid') && (
            <div className="flex flex-col gap-1.5 border-0">
              <label className="text-xs font-semibold text-[#888] tracking-[0.4px] uppercase flex items-center gap-1.5">Pass Criteria (%)</label>
              <input 
                type="number" 
                min="1" 
                max="100" 
                value={thresholdPct} 
                onChange={e => setThresholdPct(Number(e.target.value))} 
                className="w-full border-b-[1.5px] border-[#e0ddd8] bg-transparent text-[15px] text-[#1a1a2e] py-2 px-1 outline-none transition-colors focus:border-[#6366f1]"
              />
            </div>
          )}

          {(ruleType === 'fixed' || ruleType === 'hybrid') && (
            <div className="flex flex-col gap-1.5 border-0">
              <label className="text-xs font-semibold text-[#888] tracking-[0.4px] uppercase flex items-center gap-1.5">Specific VIP Approver</label>
              <select 
                value={specificApprover} 
                onChange={e => setSpecificApprover(e.target.value)}
                className="w-full border-b-[1.5px] border-[#e0ddd8] bg-transparent text-[15px] text-[#1a1a2e] py-2 px-1 appearance-none outline-none cursor-pointer focus:border-[#6366f1] bg-no-repeat bg-[right_4px_center]"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23888' d='M6 8L1 3h10z'/%3E%3C/svg%3E")` }}
              >
                <option value="">-- Select VIP --</option>
                <option value="u1">Alice (CFO)</option>
              </select>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end mt-7">
        <button 
          className="bg-[#1a1a2e] text-white rounded-[40px] px-[42px] py-[13px] text-[15px] font-semibold shadow-[0_4px_16px_rgba(26,26,46,0.18)] hover:-translate-y-[1px] hover:opacity-[0.88] transition-all duration-250 cursor-pointer tracking-[0.3px]"
          onClick={() => alert('Rule Saved!')}
        >
          Save Approval Rule
        </button>
      </div>
    </div>
  );
}

// ─── User Management Component ───────────────────────────────────────────
function UserManagement() {
  const users = [
    { id: '1', name: 'John Employee', role: 'Employee', manager: 'Jane Manager' },
    { id: '2', name: 'Jane Manager', role: 'Manager', manager: 'Alice CFO' },
    { id: '3', name: 'Alice CFO', role: 'Admin', manager: '-' },
  ];

  return (
    <div>
      <p className="text-[11px] font-bold text-[#aaa] tracking-[0.8px] uppercase mb-4">User & Hierarchy</p>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className="text-left font-semibold text-[#bbb] text-[11px] tracking-[0.5px] pb-2 border-b border-[#f0ede8]">Name</th>
              <th className="text-left font-semibold text-[#bbb] text-[11px] tracking-[0.5px] pb-2 border-b border-[#f0ede8]">Role</th>
              <th className="text-left font-semibold text-[#bbb] text-[11px] tracking-[0.5px] pb-2 border-b border-[#f0ede8]">Direct Manager</th>
              <th className="text-left font-semibold text-[#bbb] text-[11px] tracking-[0.5px] pb-2 border-b border-[#f0ede8] w-[80px]">Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td className="py-3 text-[#1a1a2e] font-semibold border-b border-[#f8f6f2] text-sm">{u.name}</td>
                <td className="py-3 text-[#444] border-b border-[#f8f6f2] text-sm">
                  <span className="bg-[#f0ede8] text-[#555] text-xs font-semibold px-2.5 py-[3px] rounded-[12px]">{u.role}</span>
                </td>
                <td className="py-3 text-[#444] border-b border-[#f8f6f2] text-sm">{u.manager}</td>
                <td className="py-3 border-b border-[#f8f6f2]">
                  <button className="text-[#6366f1] text-[13px] font-semibold hover:opacity-80 transition-opacity">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Main Exported Page ──────────────────────────────────────────────────
export default function ApprovalChainsPage() {
  const [activeTab, setActiveTab] = useState<'rules' | 'users'>('rules');

  return (
    <div className="min-h-screen bg-[#faf9f6] flex items-start justify-center font-sans p-6 md:p-8">
      <div className="bg-white rounded-[20px] shadow-[0_2px_32px_rgba(0,0,0,0.07),0_1px_4px_rgba(0,0,0,0.04)] p-8 md:p-10 w-full max-w-[900px] border border-[#ebebeb] mt-6">
        
        <div className="mb-8">
          <h1 className="text-[26px] font-bold text-[#1a1a2e] mb-2">Admin Dashboard</h1>
          <p className="text-[14px] text-[#888]">Manage organizational approval structures and reporting hierarchies.</p>
        </div>
        
        <div className="flex gap-3 mb-8">
          <button 
            className={`rounded-[40px] px-[24px] py-[10px] text-[14px] transition-all duration-200 ${activeTab === 'rules' ? 'bg-[#1a1a2e] text-white font-semibold shadow-[0_4px_16px_rgba(26,26,46,0.18)]' : 'bg-[#f5f3ef] border border-[#c9c5bc] text-[#555] font-medium hover:bg-[#ebe9e4]'}`}
            onClick={() => setActiveTab('rules')}
          >
            Approval Rules
          </button>
          <button 
            className={`rounded-[40px] px-[24px] py-[10px] text-[14px] transition-all duration-200 ${activeTab === 'users' ? 'bg-[#1a1a2e] text-white font-semibold shadow-[0_4px_16px_rgba(26,26,46,0.18)]' : 'bg-[#f5f3ef] border border-[#c9c5bc] text-[#555] font-medium hover:bg-[#ebe9e4]'}`}
            onClick={() => setActiveTab('users')}
          >
            User Management
          </button>
        </div>

        <div className="h-[1px] bg-[#f0ede8] mx-[-4px] mb-8" />

        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
          {activeTab === 'rules' && <RuleBuilder />}
          {activeTab === 'users' && <UserManagement />}
        </div>
      </div>
    </div>
  );
}
