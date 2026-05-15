'use client';

import { useState, useEffect } from 'react';

export default function UserReports() {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [activeFeedbackId, setActiveFeedbackId] = useState<string | null>(null);
  const [feedbackText, setFeedbackText] = useState('');

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const userStr = localStorage.getItem('user');
      const userId = userStr ? JSON.parse(userStr).id : 'u1';
      const res = await fetch(`/api/complaints?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setComplaints(data);
      }
    } catch (error) {
      console.error('Failed to fetch complaints', error);
    }
  };

  const submitFeedback = async (id: string) => {
    if (!feedbackText.trim()) return;
    try {
      const res = await fetch(`/api/complaints/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback: feedbackText })
      });
      if (res.ok) {
        setFeedbackText('');
        setActiveFeedbackId(null);
        fetchComplaints();
      }
    } catch (e) {
      alert("Error submitting feedback");
    }
  };

  return (
    <div className="animate-slide-up">
      <div id="my-reports" style={{ marginBottom: '4rem' }}>
        <h3 className="card-title">My Reports History</h3>
        {complaints.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>You haven&apos;t reported any waste yet.</p>
        ) : (
          <div className="grid-3">
            {complaints.map(c => (
              <div key={c.id} className="card glass">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <span className={`badge ${c.status === 'Cleaned' ? 'badge-success' : 'badge-warning'}`}>{c.status}</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(c.createdAt).toLocaleDateString()}</span>
                </div>
                
                {c.imageUrl && (
                  <div style={{ width: '100%', height: '180px', backgroundImage: `url(${c.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: '12px', marginBottom: '1rem' }}></div>
                )}
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  <span>📍</span> {c.location.lat.toFixed(4)}, {c.location.lng.toFixed(4)}
                </div>
                
                {c.aiValidation && (
                  <div style={{ padding: '0.75rem', background: 'rgba(0,0,0,0.3)', borderRadius: '8px', borderLeft: `3px solid ${c.aiValidation.is_waste ? 'var(--primary)' : 'var(--danger)'}`, marginBottom: '1rem' }}>
                    <p style={{ fontSize: '0.85rem', margin: 0 }}>
                      🤖 AI Validation: <strong style={{ color: c.aiValidation.is_waste ? 'var(--primary)' : 'var(--text-main)' }}>{c.aiValidation.is_waste ? 'Waste Detected' : 'No Waste'}</strong> ({(c.aiValidation.confidence * 100).toFixed(0)}%)
                    </p>
                  </div>
                )}
                
                {c.status === 'Cleaned' && !c.feedback && (
                  <div style={{ marginTop: '1rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                    {activeFeedbackId === c.id ? (
                      <div className="animate-slide-up">
                        <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-main)', fontSize: '0.9rem', fontWeight: 500 }}>Rate the Cleanup:</p>
                        <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '0.5rem', fontSize: '1.2rem', color: '#fbbf24', cursor: 'pointer' }}>
                          ★★★★★
                        </div>
                        <textarea 
                          value={feedbackText}
                          onChange={(e) => setFeedbackText(e.target.value)}
                          placeholder="Leave a comment about the cleanup quality..."
                          style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--primary)', background: 'var(--surface-solid)', color: 'var(--text-main)', fontSize: '0.9rem', resize: 'none', minHeight: '80px', marginBottom: '0.75rem' }}
                        />
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button className="btn btn-outline" style={{ flex: 1, padding: '0.5rem', fontSize: '0.9rem', borderColor: 'var(--border)' }} onClick={() => { setActiveFeedbackId(null); setFeedbackText(''); }}>Cancel</button>
                          <button className="btn btn-primary" style={{ flex: 1, padding: '0.5rem', fontSize: '0.9rem', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }} onClick={() => submitFeedback(c.id)}>Submit Review</button>
                        </div>
                      </div>
                    ) : (
                      <button className="btn btn-outline" style={{ width: '100%', color: 'var(--success)', borderColor: 'rgba(16, 185, 129, 0.3)' }} onClick={() => setActiveFeedbackId(c.id)}>
                        ⭐️ Provide Feedback
                      </button>
                    )}
                  </div>
                )}
                {c.feedback && (
                  <div style={{ padding: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.2)', marginTop: '1rem' }}>
                    <div style={{ fontSize: '1rem', color: '#fbbf24', marginBottom: '0.25rem' }}>★★★★★</div>
                    <p style={{ fontStyle: 'italic', margin: 0, color: 'var(--success)', fontSize: '0.9rem' }}>&quot;{c.feedback}&quot;</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
