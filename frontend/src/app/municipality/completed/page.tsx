'use client';

import { useState, useEffect } from 'react';

export default function CompletedTasks() {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('user');
      if (stored) setUserData(JSON.parse(stored));
    }
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const res = await fetch('http://localhost:5001/api/complaints');
      if (res.ok) {
        const data = await res.json();
        setComplaints(data);
      }
    } catch (error) {
      console.error('Failed to fetch complaints', error);
    }
  };

  const assignedTasks = complaints.filter(c => 
    userData && c.assignedMunicipalityId === userData.id || c.assignedMunicipalityId === 'm1'
  );
  const completedTasks = assignedTasks.filter(c => c.status === 'Cleaned');

  return (
    <div className="animate-slide-up">
      <div id="completed-tasks" style={{ marginBottom: '4rem' }}>
        <h3 className="card-title">✨ Completed Tasks</h3>
        {completedTasks.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>You haven&apos;t completed any tasks yet.</p>
        ) : (
          <div className="grid-3">
            {completedTasks.map(c => (
              <div key={c.id} className="card" style={{ background: 'var(--surface-solid)', border: '1px solid var(--success)', borderRadius: '16px', opacity: 0.85 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <span className="badge badge-success">Cleaned</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(c.createdAt).toLocaleDateString()}</span>
                </div>
                {c.imageUrl && (
                  <div style={{ width: '100%', height: '160px', backgroundImage: `url(${c.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: '12px', marginBottom: '1rem', filter: 'grayscale(30%)' }}></div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--text-main)', fontSize: '0.95rem' }}>
                  <span>📍</span> {c.location.lat.toFixed(4)}, {c.location.lng.toFixed(4)}
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{c.description}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
