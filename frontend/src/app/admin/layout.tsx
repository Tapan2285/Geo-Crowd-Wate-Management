import { LineChart, Users, FileText, Settings, LogOut, ShieldCheck, Key } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Command Center | Admin Dashboard',
  description: 'System-wide analytics and oversight.',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dashboard-layout">
      {/* Sidebar Navigation */}
      <aside className="sidebar glass-panel" style={{ borderRightColor: 'rgba(99, 102, 241, 0.2)' }}>
        <div style={{ marginBottom: '3rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ color: '#818CF8' }}><ShieldCheck size={32} strokeWidth={2.5} /></span>
          <h1 style={{ color: '#818CF8', fontSize: '1.5rem', margin: 0 }}>Command</h1>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <a href="/admin" className="sidebar-link">
            <div className="sidebar-icon"><LineChart size={20} strokeWidth={2.5} /></div>
            <span>Dashboard</span>
          </a>
          <a href="/admin/users" className="sidebar-link">
            <div className="sidebar-icon"><Users size={20} strokeWidth={2.5} /></div>
            <span>Registered Users</span>
          </a>
          <a href="/admin/codes" className="sidebar-link">
            <div className="sidebar-icon"><Key size={20} strokeWidth={2.5} /></div>
            <span>Access Codes</span>
          </a>
          <a href="/admin/reports" className="sidebar-link">
            <div className="sidebar-icon"><FileText size={20} strokeWidth={2.5} /></div>
            <span>System Reports</span>
          </a>
          <a href="/admin/settings" className="sidebar-link">
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
            <h2 style={{ margin: 0, color: 'var(--text-main)' }}>Global Administration</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>System Overview & Analytics</p>
          </div>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#818CF8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
            A
          </div>
        </header>
        
        {children}
      </main>
    </div>
  );
}
