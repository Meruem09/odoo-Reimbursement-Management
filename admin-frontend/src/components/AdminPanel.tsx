import { useState } from 'react';
import { RuleBuilder } from './RuleBuilder';
import '../index.css';

// UserManagement placeholder component
function UserManagement() {
  const users = [
    { id: '1', name: 'John Employee', role: 'Employee', manager: 'Jane Manager' },
    { id: '2', name: 'Jane Manager', role: 'Manager', manager: 'Alice CFO' },
    { id: '3', name: 'Alice CFO', role: 'Admin', manager: '-' },
  ];

  return (
    <div className="panel">
      <h2>User & Hierarchy Management</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Role</th>
            <th>Direct Manager</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id}>
              <td>{u.name}</td>
              <td>{u.role}</td>
              <td>{u.manager}</td>
              <td><button className="btn-secondary">Edit</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function AdminPanel() {
  const [activeTab, setActiveTab] = useState<'rules' | 'users'>('rules');

  return (
    <div className="container">
      <h1 style={{ marginBottom: '8px' }}>Admin Dashboard</h1>
      <p style={{ color: '#666', marginBottom: '24px' }}>Manage organizational approval structures and reporting hierarchies.</p>
      
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '1px solid #e0e0e0', paddingBottom: '16px' }}>
        <button 
          className={activeTab === 'rules' ? 'btn-primary' : 'btn-secondary'}
          onClick={() => setActiveTab('rules')}
        >
          Approval Rules
        </button>
        <button 
          className={activeTab === 'users' ? 'btn-primary' : 'btn-secondary'}
          onClick={() => setActiveTab('users')}
        >
          User Management
        </button>
      </div>

      <div>
        {activeTab === 'rules' && <RuleBuilder />}
        {activeTab === 'users' && <UserManagement />}
      </div>
    </div>
  );
}
