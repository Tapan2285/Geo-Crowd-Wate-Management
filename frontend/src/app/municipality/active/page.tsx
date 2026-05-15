'use client';

import { useState, useEffect } from 'react';

export default function ActiveTasks() {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [userData, setUserData] = useState<any>(null);
  const [feedbackMap, setFeedbackMap] = useState<{[key: string]: string}>({});

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('user');
      if (stored) setUserData(JSON.parse(stored));
    }
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const res = await fetch('/api/complaints');
      if (res.ok) {
        const data = await res.json();
        setComplaints(data);
      }
    } catch (error) {
      console.error('Failed to fetch complaints', error);
    }
  };

  const markAsCleaned = async (id: string) => {
    const feedback = feedbackMap[id] || '';
    try {
      const res = await fetch(`/api/complaints/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Cleaned', feedback })
      });
      if (res.ok) {
        // Clear feedback and refresh
        setFeedbackMap(prev => ({ ...prev, [id]: '' }));
        fetchComplaints();
      }
    } catch (e) {
      alert("Error updating status");
    }
  };

  const assignedTasks = complaints.filter(c => 
    !userData || userData.email === 'municipality@test.com' || c.assignedMunicipalityId === userData.id || c.assignedMunicipalityId === 'm1'
  );
  const pendingTasks = assignedTasks.filter(c => c.status !== 'Cleaned');

  return (
    <div className="animate-slide-up">
      <div id="active-tasks" style={{ marginBottom: '4rem' }}>
        <h3 className="card-title">🚧 Active Tasks</h3>
        {pendingTasks.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No pending tasks to clean up right now! Great job.</p>
        ) : (
          <div className="grid-3">
            {pendingTasks.map(c => (
              <div key={c.id} className="card" style={{ background: 'var(--surface-solid)', border: '1px solid var(--warning)', borderRadius: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <span className="badge badge-warning">{c.status}</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(c.createdAt).toLocaleDateString()}</span>
                </div>
                
                <div style={{ marginBottom: '1rem', padding: '0.75rem', background: 'var(--bg-default)', borderRadius: '8px' }}>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>Reported by:</p>
                  <p style={{ margin: '0.25rem 0 0 0', fontWeight: 500, color: 'var(--text-main)' }}>
                    {c.user ? `${c.user.name} (${c.user.email})` : 'Anonymous Citizen'}
                  </p>
                </div>

                {c.imageUrl && (
                  <div style={{ width: '100%', height: '160px', backgroundImage: `url(${c.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: '12px', marginBottom: '1rem' }}></div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--text-main)', fontSize: '0.95rem' }}>
                  <span>📍</span> {c.address ? c.address : `${c.location.lat.toFixed(4)}, ${c.location.lng.toFixed(4)}`}
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>{c.description}</p>
                
                <div style={{ marginBottom: '1rem' }}>
                  <textarea 
                    placeholder="Add resolution feedback (optional)..."
                    value={feedbackMap[c.id] || ''}
                    onChange={(e) => setFeedbackMap(prev => ({ ...prev, [c.id]: e.target.value }))}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-default)', color: 'var(--text-main)', fontSize: '0.9rem', minHeight: '60px', resize: 'vertical' }}
                  />
                </div>

                <button className="btn btn-primary" style={{ width: '100%', background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }} onClick={() => markAsCleaned(c.id)}>
                  ✓ Mark as Cleaned
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
