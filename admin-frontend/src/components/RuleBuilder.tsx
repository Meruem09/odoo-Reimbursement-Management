import { useState } from 'react';
import '../index.css';

interface ApproverStep {
  id: string;
  sequence: number;
  role: string;
  approverId: string;
}

export function RuleBuilder() {
  const [ruleName, setRuleName] = useState('');
  const [targetLevel, setTargetLevel] = useState('company'); // company, department, cost_center
  const [isManagerFirst, setIsManagerFirst] = useState(false);
  const [ruleType, setRuleType] = useState('percentage'); // fixed, percentage, hybrid
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
    <div className="panel">
      <h2>Approval Rule Configuration</h2>
      
      <div className="flex gap-4 mb-4">
        <div className="form-group" style={{ flex: 1 }}>
          <label>Rule Name</label>
          <input 
            type="text" 
            value={ruleName} 
            onChange={e => setRuleName(e.target.value)} 
            placeholder="e.g. Standard Expenses" 
          />
        </div>
        <div className="form-group" style={{ flex: 1 }}>
          <label>Apply for</label>
          <select value={targetLevel} onChange={e => setTargetLevel(e.target.value)}>
            <option value="company">Entire Company</option>
            <option value="department">Specific Department</option>
            <option value="cost_center">Cost Center</option>
          </select>
        </div>
      </div>

      <hr style={{ margin: '24px 0', border: 'none', borderTop: '1px solid #e0e0e0' }} />

      <h3>Approvers Sequence</h3>
      <table>
        <thead>
          <tr>
            <th style={{ width: '80px' }}>Seq #</th>
            <th>Role Category</th>
            <th>Specific Approver (Optional)</th>
            <th style={{ width: '100px' }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {steps.map(step => (
            <tr key={step.id}>
              <td>{step.sequence}</td>
              <td>
                <input 
                  type="text" 
                  value={step.role} 
                  onChange={e => updateStep(step.id, 'role', e.target.value)} 
                  placeholder="e.g. Finance" 
                  style={{ width: '100%' }}
                />
              </td>
              <td>
                <select 
                  value={step.approverId} 
                  onChange={e => updateStep(step.id, 'approverId', e.target.value)}
                  style={{ width: '100%' }}
                >
                  <option value="">-- Any in Role --</option>
                  <option value="u1">Alice (CFO)</option>
                  <option value="u2">Bob (Director)</option>
                </select>
              </td>
              <td>
                <button className="btn-secondary" onClick={() => removeStep(step.id)}>Remove</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-4">
        <button className="btn-secondary" onClick={addStep}>+ Add Approver Step</button>
      </div>

      <hr style={{ margin: '24px 0', border: 'none', borderTop: '1px solid #e0e0e0' }} />

      <h3>Dynamic Conditions</h3>
      <p style={{ fontSize: '14px', color: '#666', marginBottom: '16px' }}>
        Determine how the rule logic evaluates the sequence above.
      </p>

      <div style={{ padding: '16px', backgroundColor: '#fafafa', borderRadius: '4px', border: '1px solid #e0e0e0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <input 
            type="checkbox" 
            id="managerFirst"
            checked={isManagerFirst}
            onChange={e => setIsManagerFirst(e.target.checked)}
            style={{ width: 'auto', margin: 0 }}
          />
          <label htmlFor="managerFirst" style={{ fontWeight: 600 }}>Is Employee's Direct Manager the First Approver?</label>
        </div>

        <div className="form-group">
          <label>Evaluation Logic Type (Overrides & Quorums)</label>
          <select value={ruleType} onChange={e => setRuleType(e.target.value)}>
            <option value="fixed">Fixed Specific Manager (VIP Override)</option>
            <option value="percentage">By Threshold Percentage (Quorum)</option>
            <option value="hybrid">Hybrid (Either/Or)</option>
          </select>
        </div>

        {(ruleType === 'percentage' || ruleType === 'hybrid') && (
          <div className="form-group mt-4">
            <label>Rule met pass criteria (%)</label>
            <input 
              type="number" 
              min="1" 
              max="100" 
              value={thresholdPct} 
              onChange={e => setThresholdPct(Number(e.target.value))} 
              style={{ maxWidth: '120px' }}
            />
          </div>
        )}

        {(ruleType === 'fixed' || ruleType === 'hybrid') && (
          <div className="form-group mt-4">
            <label>Specific VIP Approver (Auto-approves if true)</label>
            <select value={specificApprover} onChange={e => setSpecificApprover(e.target.value)}>
              <option value="">-- Select VIP --</option>
              <option value="u1">Alice (CFO)</option>
            </select>
          </div>
        )}
      </div>

      <div className="mt-4" style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button className="btn-primary" onClick={() => alert('Rule Saved!')}>Save Approval Rule</button>
      </div>
    </div>
  );
}
