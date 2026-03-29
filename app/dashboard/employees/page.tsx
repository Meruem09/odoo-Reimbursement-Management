"use client";

import { useAuth } from '@/app/contexts/AuthContext';
import { EmployeesTable } from '@/app/components/EmployeesTable';
import { EmployeeDashboard } from '@/app/components/dashboard/EmployeeDashboard';

export default function EmployeesPage() {
  const { user, loading: authLoading } = useAuth();

  if (authLoading || !user) return null;

  // EMPLOYEE role → show their own expense dashboard
  if (user.role !== 'ADMIN') {
    return <EmployeeDashboard />;
  }

  // ADMIN role → show the user management table
  return (
    <div className="min-h-screen bg-[#faf9f6] flex items-start justify-center font-sans p-6 md:p-8">
      <div className="bg-white rounded-[20px] shadow-[0_2px_32px_rgba(0,0,0,0.07),0_1px_4px_rgba(0,0,0,0.04)] p-8 md:p-10 w-full max-w-[1000px] border border-[#ebebeb] mt-6">
        <div className="mb-8">
          <h1 className="text-[26px] font-bold text-[#1a1a2e] mb-2">Employees</h1>
          <p className="text-[14px] text-[#888]">Invite employees, assign roles, and set manager relationships.</p>
        </div>
        <div className="h-[1px] bg-[#f0ede8] mx-[-4px] mb-8" />
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
          <EmployeesTable />
        </div>
      </div>
    </div>
  );
}
