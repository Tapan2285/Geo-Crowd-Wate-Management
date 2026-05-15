import { Camera, ClipboardList, Settings, LogOut, Leaf } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Citizen Portal | CleanCity AI',
  description: 'Report waste and track your cleanups.',
};

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dashboard-layout">
      {/* Sidebar Navigation */}
      <aside className="sidebar glass-panel">
        <div style={{ marginBottom: '3rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ color: 'var(--primary)' }}><Leaf size={32} strokeWidth={2.5} /></span>
          <h1 style={{ color: 'var(--primary)', fontSize: '1.5rem', margin: 0 }}>CleanCity</h1>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <a href="/user" className="sidebar-link">
            <div className="sidebar-icon"><Camera size={20} strokeWidth={2.5} /></div>
            <span>Report Waste</span>
          </a>
          <a href="/user/reports" className="sidebar-link">
            <div className="sidebar-icon"><ClipboardList size={20} strokeWidth={2.5} /></div>
            <span>My Reports</span>
          </a>
          <a href="/user/settings" className="sidebar-link">
            <div className="sidebar-icon"><Settings size={20} strokeWidth={2.5} /></div>
            <span>Settings</span>
          </a>
        </nav>

        <div style={{ marginTop: 'auto' }}>
          <a href="/" className="btn btn-outline" style={{ width: '100%', border: 'none', color: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <LogOut size={18} style={{ marginRight: '8px' }} /> Logout
          </a>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <div>
            <h2 style={{ margin: 0, color: 'var(--text-main)' }}>User Dashboard</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>Welcome back, Citizen.</p>
          </div>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
            U
          </div>
        </header>
        
        {children}
      </main>
    </div>
  );
}
