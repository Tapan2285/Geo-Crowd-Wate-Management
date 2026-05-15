'use client';

import { useState, useEffect } from 'react';

export default function UserSettings() {
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('user');
      if (stored) {
        setUserData(JSON.parse(stored));
      }
    }
  }, []);

  return (
    <div className="animate-slide-up">
      <div id="settings" style={{ marginBottom: '4rem' }}>
        <h3 className="card-title">Account Settings</h3>
        <div className="card glass" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1.5rem' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary) 0%, #3b82f6 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '2rem', fontWeight: 'bold' }}>
              {userData ? userData.name?.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <h2 style={{ margin: '0 0 0.25rem 0', color: 'var(--text-main)' }}>
                {userData ? userData.name : 'Citizen'}
              </h2>
              <p style={{ margin: 0, color: 'var(--text-muted)' }}>
                {userData ? userData.email : 'user@test.com'}
              </p>
              <span className="badge badge-success" style={{ marginTop: '0.5rem', display: 'inline-block' }}>Citizen Account</span>
            </div>
          </div>

          <div>
            <h4 style={{ color: 'var(--text-main)', marginBottom: '1rem' }}>Security & Preferences</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '400px' }}>
              <button className="btn btn-outline" style={{ justifyContent: 'flex-start' }} onClick={() => alert("Password change functionality will be available in v2.0")}>
                🔑 Change Password
              </button>
              <button className="btn btn-outline" style={{ justifyContent: 'flex-start' }}>
                🔔 Notification Preferences
              </button>
              <button className="btn btn-danger" style={{ justifyContent: 'flex-start', background: 'transparent', color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.3)' }} onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('user'); window.location.href = '/'; }}>
                🚪 Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
