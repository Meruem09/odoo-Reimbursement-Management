"use client";

import { useState, useEffect } from 'react';

interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  manager: { name: string } | null;
}

export function EmployeesTable() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  // New employee state
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('EMPLOYEE');
  const [newManagerId, setNewManagerId] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const res = await fetch('/api/employees');
      if (res.ok) {
        const data = await res.json();
        setEmployees(data);
      }
    } catch (error) {
      console.error('Failed to fetch employees', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async () => {
    if (!newName || !newEmail) return alert("Name and Email are required");
    
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName,
          email: newEmail,
          role: newRole,
          managerId: newManagerId || null,
        }),
      });

      if (res.ok) {
        const newUser = await res.json();
        setEmployees([newUser, ...employees]);
        // Reset form
        setNewName('');
        setNewEmail('');
        setNewRole('EMPLOYEE');
        setNewManagerId('');
        alert('User created and password email sent!');
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to create user');
      }
    } catch (error) {
      console.error('Submission failed', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <p className="text-[11px] font-bold text-[#aaa] tracking-[0.8px] uppercase">User Management</p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className="text-left font-semibold text-[#bbb] text-[11px] tracking-[0.5px] pb-2 border-b border-[#f0ede8]">User Name</th>
              <th className="text-left font-semibold text-[#bbb] text-[11px] tracking-[0.5px] pb-2 border-b border-[#f0ede8] w-[140px]">Role</th>
              <th className="text-left font-semibold text-[#bbb] text-[11px] tracking-[0.5px] pb-2 border-b border-[#f0ede8] w-[180px]">Direct Manager</th>
              <th className="text-left font-semibold text-[#bbb] text-[11px] tracking-[0.5px] pb-2 border-b border-[#f0ede8]">Email</th>
              <th className="text-left font-semibold text-[#bbb] text-[11px] tracking-[0.5px] pb-2 border-b border-[#f0ede8] w-[140px]">Action</th>
            </tr>
          </thead>
          <tbody>
            {/* New User Row */}
            <tr className="bg-[#faf9f6]">
              <td className="py-2.5 px-2 border-b border-[#f8f6f2]">
                <input 
                  type="text" 
                  value={newName} 
                  onChange={e => setNewName(e.target.value)} 
                  placeholder="e.g. Marc" 
                  className="w-full border-b-[1.5px] border-[#e0ddd8] bg-transparent text-[15px] text-[#1a1a2e] py-1 px-1 outline-none transition-colors focus:border-[#6366f1]"
                />
              </td>
              <td className="py-2.5 px-2 border-b border-[#f8f6f2]">
                <select 
                  value={newRole} 
                  onChange={e => setNewRole(e.target.value)}
                  className="w-full border-b-[1.5px] border-[#e0ddd8] bg-transparent text-[14px] text-[#1a1a2e] py-1 px-1 appearance-none outline-none cursor-pointer focus:border-[#6366f1] bg-no-repeat bg-[right_4px_center]"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23888' d='M6 8L1 3h10z'/%3E%3C/svg%3E")` }}
                >
                  <option value="EMPLOYEE">Employee</option>
                  <option value="MANAGER">Manager</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </td>
              <td className="py-2.5 px-2 border-b border-[#f8f6f2]">
                <select 
                  value={newManagerId} 
                  onChange={e => setNewManagerId(e.target.value)}
                  className="w-full border-b-[1.5px] border-[#e0ddd8] bg-transparent text-[14px] text-[#1a1a2e] py-1 px-1 appearance-none outline-none cursor-pointer focus:border-[#6366f1] text-ellipsis bg-no-repeat bg-[right_4px_center]"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23888' d='M6 8L1 3h10z'/%3E%3C/svg%3E")` }}
                >
                  <option value="">-- No Manager --</option>
                  {employees.filter(e => e.role === 'MANAGER' || e.role === 'ADMIN').map(mgr => (
                    <option key={mgr.id} value={mgr.id}>{mgr.name}</option>
                  ))}
                </select>
              </td>
              <td className="py-2.5 px-2 border-b border-[#f8f6f2]">
                <input 
                  type="email" 
                  value={newEmail} 
                  onChange={e => setNewEmail(e.target.value)} 
                  placeholder="marc@acme.com" 
                  className="w-full border-b-[1.5px] border-[#e0ddd8] bg-transparent text-[15px] text-[#1a1a2e] py-1 px-1 outline-none transition-colors focus:border-[#6366f1]"
                />
              </td>
              <td className="py-2.5 px-2 border-b border-[#f8f6f2]">
                <button 
                  onClick={handleAddUser}
                  disabled={isSubmitting}
                  className="bg-[#1a1a2e] text-white rounded-[8px] px-3 py-1.5 text-[12px] font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {isSubmitting ? 'Sending...' : 'Send password'}
                </button>
              </td>
            </tr>

            {/* Existing Users */}
            {loading ? (
              <tr>
                <td colSpan={5} className="py-6 text-center text-[#888] text-sm">Loading employees...</td>
              </tr>
            ) : employees.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-6 text-center text-[#888] text-sm">No employees found.</td>
              </tr>
            ) : (
              employees.map(user => (
                <tr key={user.id}>
                  <td className="py-3 px-2 text-[#1a1a2e] font-semibold border-b border-[#f8f6f2] text-sm">{user.name}</td>
                  <td className="py-3 px-2 text-[#444] border-b border-[#f8f6f2] text-sm">
                    <span className="bg-[#f0ede8] text-[#555] text-[11px] font-semibold px-2.5 py-[3px] rounded-[12px] uppercase tracking-wider">{user.role}</span>
                  </td>
                  <td className="py-3 px-2 text-[#444] border-b border-[#f8f6f2] text-sm truncate max-w-[180px]">{user.manager?.name || '-'}</td>
                  <td className="py-3 px-2 text-[#444] border-b border-[#f8f6f2] text-sm text-[#888]">{user.email}</td>
                  <td className="py-3 px-2 border-b border-[#f8f6f2]">
                    <button className="text-[#6366f1] text-[13px] font-semibold hover:opacity-80 transition-opacity">Edit</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
