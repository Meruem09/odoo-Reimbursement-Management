"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  managerId: string | null;
  manager: { name: string } | null;
}

interface ApproverStep {
  id: string;
  userId: string;
  isRequired: boolean;
}

export default function ApprovalChainsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);

  // ─── Rule State ────────────────────────────────────────────────────────
  const [targetUserId, setTargetUserId] = useState('');
  const [description, setDescription] = useState('');
  const [managerId, setManagerId] = useState('');

  const [isManagerApprover, setIsManagerApprover] = useState(false);
  const [isSequential, setIsSequential] = useState(false);
  const [minPercentage, setMinPercentage] = useState<number | ''>('');

  const [approvers, setApprovers] = useState<ApproverStep[]>([
    { id: '1', userId: '', isRequired: false }
  ]);

  // Handle Authentication Validation
  useEffect(() => {
    if (!authLoading && user) {
      if (user.role !== 'ADMIN') {
        router.push('/dashboard');
      }
    }
  }, [authLoading, user, router]);

  // Load Employees
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/employees');
        if (res.ok) {
          setEmployees(await res.json());
        }
      } catch (e) {
        console.error('Failed to load employees', e);
      }
    }
    load();
  }, []);

  // When target user changes, set the manager by default
  useEffect(() => {
    if (targetUserId) {
      const selectedUser = employees.find(e => e.id === targetUserId);
      if (selectedUser && selectedUser.managerId) {
        setManagerId(selectedUser.managerId);
      } else {
        setManagerId('');
      }
    }
  }, [targetUserId, employees]);

  // Prevent flash while checking auth
  if (authLoading || !user || user.role !== 'ADMIN') return null;

  // Helpers for Approvers array
  const addApprover = () => {
    setApprovers([...approvers, { id: Date.now().toString(), userId: '', isRequired: false }]);
  };
  const updateApproverId = (id: string, newUserId: string) => {
    setApprovers(approvers.map(a => a.id === id ? { ...a, userId: newUserId } : a));
  };
  const updateApproverReq = (id: string, isReq: boolean) => {
    setApprovers(approvers.map(a => a.id === id ? { ...a, isRequired: isReq } : a));
  };
  const removeApprover = (id: string) => {
    setApprovers(approvers.filter(a => a.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#faf9f6] flex items-start justify-center font-sans p-6 md:p-8">
      <div className="bg-white rounded-[20px] shadow-[0_2px_32px_rgba(0,0,0,0.07),0_1px_4px_rgba(0,0,0,0.04)] p-8 md:p-12 w-full max-w-[1240px] mt-2 border border-[#ebebeb]">

        <h1 className="text-[26px] font-bold tracking-wide mb-12 text-[#1a1a2e]">
          Admin view (Approval rules)
        </h1>

        <div className="flex flex-col lg:flex-row gap-16 lg:gap-24 relative">

          {/* Divider Line on Desktop */}
          <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-[1px] bg-[#f0ede8] -translate-x-1/2" />

          {/* ────────────────────────────────────────────────────────
              LEFT COLUMN 
          ──────────────────────────────────────────────────────── */}
          <div className="flex-1 flex flex-col gap-10">

            {/* User Row */}
            <div className="flex items-end gap-6 group">
              <label className="text-[15px] font-semibold text-[#888] tracking-[0.4px] uppercase min-w-[100px] pb-1">User</label>
              <select
                value={targetUserId}
                onChange={(e) => setTargetUserId(e.target.value)}
                className="flex-1 bg-transparent border-b-[1.5px] border-[#e0ddd8] text-[15px] text-[#1a1a2e] py-1 outline-none transition-colors focus:border-[#6366f1] appearance-none cursor-pointer placeholder-[#aaa]"
              >
                <option value="">-- Select target user --</option>
                {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
            </div>

            {/* Description Row */}
            <div className="flex flex-col gap-1.5 mt-4">
              <label className="text-[15px] font-semibold text-[#888] tracking-[0.4px] uppercase">Description about rules</label>
              <input
                type="text"
                placeholder="Approval rule for miscellaneous expenses"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-transparent border-b-[1.5px] border-[#e0ddd8] text-[15px] text-[#1a1a2e] py-1 outline-none transition-colors focus:border-[#6366f1] placeholder-[#aaa]"
              />
            </div>

            {/* Manager Row */}
            <div className="flex items-end gap-6 relative mt-4">
              <label className="text-[15px] font-semibold text-[#888] tracking-[0.4px] uppercase min-w-[100px] mb-[-4px]">Manager</label>
              <select
                value={managerId}
                onChange={(e) => setManagerId(e.target.value)}
                className="flex-1 bg-transparent border-b-[1.5px] border-[#e0ddd8] text-[15px] text-[#1a1a2e] py-1 outline-none transition-colors focus:border-[#6366f1] appearance-none cursor-pointer placeholder-[#aaa]"
              >
                <option value="">-- Select override manager --</option>
                {employees.filter(e => e.role === 'MANAGER' || e.role === 'ADMIN').map(mgr => (
                  <option key={mgr.id} value={mgr.id}>{mgr.name}</option>
                ))}
              </select>

            </div>

          </div>


          {/* ────────────────────────────────────────────────────────
              RIGHT COLUMN 
          ──────────────────────────────────────────────────────── */}
          <div className="flex-1 flex flex-col pt-2">

            {/* Is manager approver */}
            <div className="flex items-start mb-8 relative">
              <div className="flex items-center gap-6">
                <h2 className="text-[15px] font-bold text-[#aaa] tracking-[0.8px] uppercase border-b border-[#f0ede8] pb-1 pr-12 min-w-[200px]">Approvers</h2>
                <label className="text-[14px] text-[#1a1a2e] whitespace-nowrap pt-1">Is manager an approver?</label>
                <input
                  type="checkbox"
                  checked={isManagerApprover}
                  onChange={e => setIsManagerApprover(e.target.checked)}
                  className="w-5 h-5 rounded-[4px] border-[1.5px] border-[#c0bdd8] accent-[#6366f1] appearance-none cursor-pointer relative checked:bg-[#6366f1] checked:border-[#6366f1] checked:after:content-['✓'] checked:after:text-white checked:after:absolute checked:after:text-sm checked:after:-top-[1px] checked:after:left-[2.5px]"
                />
              </div>
            </div>

            {/* Approvers Table */}
            <div className="mb-12 w-full pr-10">
              <div className="flex w-full mb-3 px-8 text-[11px] font-bold text-[#aaa] tracking-[0.8px] uppercase">
                <div className="flex-1">User</div>
                <div className="w-[100px] text-center">Required</div>
              </div>

              <div className="flex flex-col gap-5">
                {approvers.map((appr, index) => (
                  <div key={appr.id} className="flex items-center gap-5 relative group">
                    <span className="text-[15px] text-[#888] font-bold w-4 text-center mt-1">{index + 1}</span>
                    <select
                      value={appr.userId}
                      onChange={e => updateApproverId(appr.id, e.target.value)}
                      className="flex-1 bg-transparent border-b-[1.5px] border-[#e0ddd8] text-[15px] text-[#1a1a2e] py-1 outline-none transition-colors focus:border-[#6366f1] appearance-none cursor-pointer"
                    >
                      <option value="">- Select manager -</option>
                      {employees.filter(e => e.role === 'MANAGER' || e.role === 'ADMIN').map(e => <option key={e.id} value={e.id}>{e.name} ({e.role})</option>)}
                    </select>

                    <div className="w-[100px] flex justify-center items-center">
                      <input
                        type="checkbox"
                        checked={appr.isRequired}
                        onChange={e => updateApproverReq(appr.id, e.target.checked)}
                        className="w-[44px] h-[24px] rounded-[12px] border-[1.5px] border-[#c0bdd8] accent-[#6366f1] appearance-none cursor-pointer relative checked:bg-[#6366f1] checked:border-[#6366f1] checked:after:content-['✓'] checked:after:text-white checked:after:absolute checked:after:text-lg checked:after:left-[14px] checked:after:-top-[2px]"
                      />
                    </div>


                    <button onClick={() => removeApprover(appr.id)} className="text-[#aaa] hover:text-[#ef4444] absolute -left-10 text-xl opacity-0 group-hover:opacity-100 transition-opacity">
                      ×
                    </button>
                  </div>
                ))}
              </div>

              <button onClick={addApprover} className="mt-6 text-[13px] font-semibold text-[#888] hover:text-[#1a1a2e] transition-colors tracking-[0.4px] uppercase ml-8 flex items-center gap-2">
                <span className="text-lg leading-none">+</span> Add another approver
              </button>
            </div>

            {/* Approvers Sequence */}
            <div className="flex flex-col mb-10">
              <div className="flex items-center gap-4">
                <label className="text-[15px] font-semibold text-[#888] tracking-[0.4px] uppercase">Approvers Sequence:</label>
                <input
                  type="checkbox"
                  checked={isSequential}
                  onChange={e => setIsSequential(e.target.checked)}
                  className="w-5 h-5 rounded-[4px] border-[1.5px] border-[#c0bdd8] accent-[#6366f1] appearance-none cursor-pointer relative checked:bg-[#6366f1] checked:border-[#6366f1] checked:after:content-['✓'] checked:after:text-white checked:after:absolute checked:after:text-sm checked:after:-top-[1px] checked:after:left-[2.5px]"
                />
              </div>
            </div>

            {/* Minimum Approval Percentage */}
            <div className="flex items-end gap-3 mt-4">
              <label className="text-[15px] font-semibold text-[#888] tracking-[0.4px] uppercase mb-1">Minimum Approval percentage:</label>
              <div className="flex items-end gap-2 w-[80px]">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={minPercentage}
                  onChange={e => setMinPercentage(e.target.value === '' ? '' : Number(e.target.value))}
                  className="flex-1 bg-transparent border-b-[1.5px] border-[#e0ddd8] text-center text-[15px] text-[#1a1a2e] py-1 outline-none transition-colors focus:border-[#6366f1] placeholder-[#aaa]"
                />
                <span className="text-[15px] text-[#1a1a2e] mb-1">%</span>
              </div>
            </div>

          </div>
        </div>

        {/* Save button matching layout style */}
        <div className="mt-16 flex justify-end">
          <button
            className="bg-[#1a1a2e] text-white px-[42px] py-[13px] rounded-[40px] text-[15px] font-semibold tracking-[0.3px] transition-all duration-250 hover:-translate-y-[1px] hover:opacity-[0.88] shadow-[0_4px_16px_rgba(26,26,46,0.18)]"
            onClick={() => alert('Approval rule saved configuration!')}
          >
            Save Configuration
          </button>
        </div>

      </div>
    </div>
  );
}
