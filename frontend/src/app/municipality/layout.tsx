import { LayoutDashboard, Clock, CheckCircle2, Settings, LogOut, Building2 } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'CityOps | Municipality Dashboard',
  description: 'Manage and resolve active waste reports.',
};

export default function MunicipalityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dashboard-layout">
      {/* Sidebar Navigation */}
      <aside className="sidebar glass-panel" style={{ borderRightColor: 'rgba(59, 130, 246, 0.2)' }}>
        <div style={{ marginBottom: '3rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ color: '#3b82f6' }}><Building2 size={32} strokeWidth={2.5} /></span>
          <h1 style={{ color: '#3b82f6', fontSize: '1.5rem', margin: 0 }}>CityOps</h1>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <a href="/municipality" className="sidebar-link">
            <div className="sidebar-icon"><LayoutDashboard size={20} strokeWidth={2.5} /></div>
            <span>Overview</span>
          </a>
          <a href="/municipality/active" className="sidebar-link">
            <div className="sidebar-icon"><Clock size={20} strokeWidth={2.5} /></div>
            <span>Active Tasks</span>
          </a>
          <a href="/municipality/completed" className="sidebar-link">
            <div className="sidebar-icon"><CheckCircle2 size={20} strokeWidth={2.5} /></div>
            <span>Completed</span>
          </a>
          <a href="/municipality/settings" className="sidebar-link">
            <div className="sidebar-icon"><Settings size={20} strokeWidth={2.5} /></div>
            <span>Settings</span>
          </a>
        </nav>

        <div style={{ marginTop: 'auto' }}>
          <a href="/" className="btn btn-outline" style={{ width: '100%', border: 'none', color: 'var(--danger)', display: 'flex', alignItems: 'center', justifyItems: 'center' }}>
            <LogOut size={18} style={{ marginRight: '8px' }} /> Logout
          </a>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h2 style={{ margin: 0, color: 'var(--text-main)' }}>Downtown Municipality</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>Task Management Board</p>
          </div>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
            DM
          </div>
        </header>
        
        {children}
      </main>
    </div>
  );
}
