'use client';

import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function MunicipalityDashboard() {
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
    try {
      const res = await fetch(`/api/complaints/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Cleaned' })
      });
      if (res.ok) {
        fetchComplaints();
      }
    } catch (e) {
      alert("Error updating status");
    }
  };

  // Dynamically filter using the logged-in municipality's ID, fallback to 'm1' if no real ID is present yet.
  const assignedTasks = complaints.filter(c => 
    userData && c.assignedMunicipalityId === userData.id || c.assignedMunicipalityId === 'm1'
  );
  const pendingTasks = assignedTasks.filter(c => c.status !== 'Cleaned');
  const completedTasks = assignedTasks.filter(c => c.status === 'Cleaned');

  const chartData = [
    { name: 'Pending', value: pendingTasks.length, color: '#f59e0b' },
    { name: 'Completed', value: completedTasks.length, color: '#10b981' }
  ];

  return (
    <div className="animate-slide-up">
      {/* Overview Stats */}
      <div id="overview" style={{ marginBottom: '4rem' }}>
        <h3 className="card-title">📊 Overview Dashboard</h3>
        <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="card glass" style={{ flex: 1, padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: '4px solid var(--warning)' }}>
              <div style={{ fontSize: '2.5rem' }}>🚧</div>
              <div>
                <p style={{ color: 'var(--text-muted)', margin: 0 }}>Pending Tasks</p>
                <h3 style={{ fontSize: '1.8rem', margin: 0 }}>{pendingTasks.length}</h3>
              </div>
            </div>
            <div className="card glass" style={{ flex: 1, padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: '4px solid var(--success)' }}>
              <div style={{ fontSize: '2.5rem' }}>✨</div>
              <div>
                <p style={{ color: 'var(--text-muted)', margin: 0 }}>Cleaned Up</p>
                <h3 style={{ fontSize: '1.8rem', margin: 0 }}>{completedTasks.length}</h3>
              </div>
            </div>
          </div>
          
          <div className="card glass" style={{ flex: '2 1 400px', minHeight: '350px', display: 'flex', flexDirection: 'column' }}>
            <h4 style={{ margin: '0 0 1rem 0', color: 'var(--text-muted)' }}>Resolution Rate</h4>
            {assignedTasks.length > 0 ? (
              <div style={{ flex: 1, position: 'relative', minHeight: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={chartData} cx="50%" cy="50%" innerRadius={90} outerRadius={130} paddingAngle={5} dataKey="value" stroke="none">
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} style={{ filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.1))' }} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                No tasks assigned yet
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
