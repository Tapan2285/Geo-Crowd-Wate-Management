'use client';

import { useState, useEffect } from 'react';

export default function AdminCodes() {
  const [codes, setCodes] = useState<any[]>([]);
  const [newDesignatedTo, setNewDesignatedTo] = useState('');
  const [loadingCode, setLoadingCode] = useState(false);

  useEffect(() => {
    fetchCodes();
  }, []);

  const fetchCodes = async () => {
    try {
      const res = await fetch('http://localhost:5001/api/admin/codes');
      if (res.ok) {
        const data = await res.json();
        setCodes(data);
      }
    } catch (error) {
      console.error('Failed to fetch codes', error);
    }
  };

  const generateCode = async () => {
    if (!newDesignatedTo.trim()) {
      alert("Please enter which municipality this code is designated for.");
      return;
    }
    setLoadingCode(true);
    try {
      const res = await fetch('http://localhost:5001/api/admin/codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ designatedTo: newDesignatedTo })
      });
      if (res.ok) {
        setNewDesignatedTo('');
        fetchCodes();
      } else {
        alert("Failed to generate code.");
      }
    } catch (error) {
      console.error("Error generating code:", error);
    }
    setLoadingCode(false);
  };

  return (
    <div className="animate-slide-up">
      <div id="codes" className="card glass" style={{ marginBottom: '4rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 className="card-title" style={{ margin: 0 }}>🔑 Municipality Access Codes</h3>
          <span className="badge badge-info">{codes.length} Total Codes</span>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
          <input 
            type="text" 
            className="input-field" 
            placeholder="Designated for (e.g. Downtown Office)" 
            value={newDesignatedTo}
            onChange={(e) => setNewDesignatedTo(e.target.value)}
            style={{ flex: 1, padding: '0.85rem', borderRadius: '12px', border: '1px solid var(--border)' }}
          />
          <button 
            className="btn btn-primary" 
            onClick={generateCode} 
            disabled={loadingCode}
          >
            {loadingCode ? 'Generating...' : '+ Generate Code'}
          </button>
        </div>

        {codes.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', padding: '2rem 0', textAlign: 'center' }}>No access codes generated yet.</p>
        ) : (
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Access Code</th>
                  <th>Designated Office</th>
                  <th>Status</th>
                  <th>Used By</th>
                  <th>Generated On</th>
                </tr>
              </thead>
              <tbody>
                {codes.map(c => (
                  <tr key={c._id}>
                    <td style={{ fontFamily: 'monospace', fontWeight: 'bold', color: 'var(--primary)', letterSpacing: '1px' }}>{c.code}</td>
                    <td style={{ color: 'var(--text-main)' }}>{c.designatedTo || 'N/A'}</td>
                    <td>
                      <span className={`badge ${c.isUsed ? 'badge-warning' : 'badge-success'}`}>
                        {c.isUsed ? 'USED' : 'AVAILABLE'}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-muted)' }}>{c.usedBy || '-'}</td>
                    <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
