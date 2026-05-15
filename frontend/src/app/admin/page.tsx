'use client';

import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, ZAxis } from 'recharts';

export default function AdminDashboard() {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    fetchComplaints();
    fetchUsers();
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

  const fetchUsers = async () => {
    try {
      const res = await fetch('http://localhost:5001/api/auth/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Failed to fetch users', error);
    }
  };

  const pendingCount = complaints.filter(c => c.status !== 'Cleaned').length;
  const completedCount = complaints.filter(c => c.status === 'Cleaned').length;
  
  const chartData = [
    { name: 'Pending Tasks', value: pendingCount, color: '#f59e0b' },
    { name: 'Completed Tasks', value: completedCount, color: '#10b981' }
  ];

  const heatmapData = complaints
    .filter(c => c.location && c.location.lat && c.location.lng)
    .map(c => ({
      x: parseFloat(c.location.lng.toFixed(4)),
      y: parseFloat(c.location.lat.toFixed(4)),
      z: 200, 
      status: c.status,
      id: c.id
    }));

  return (
    <div className="animate-slide-up">
      <div id="dashboard" className="grid-3" style={{ marginBottom: '2.5rem' }}>
        <div className="card glass" style={{ borderTop: '4px solid #818CF8', background: 'var(--surface-solid)' }}>
          <h3 style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Reports</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
            <p style={{ fontSize: '3rem', fontWeight: 700, color: 'var(--text-main)', margin: 0, fontFamily: 'var(--font-heading)' }}>{complaints.length}</p>
            <span className="badge badge-info">+12%</span>
          </div>
        </div>
        
        <div className="card glass" style={{ borderTop: '4px solid var(--warning)', background: 'var(--surface-solid)' }}>
          <h3 style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pending Cleanup</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
            <p style={{ fontSize: '3rem', fontWeight: 700, color: 'var(--warning)', margin: 0, fontFamily: 'var(--font-heading)' }}>
              {pendingCount}
            </p>
          </div>
        </div>
        
        <div className="card glass" style={{ borderTop: '4px solid var(--success)', background: 'var(--surface-solid)' }}>
          <h3 style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Resolved</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
            <p style={{ fontSize: '3rem', fontWeight: 700, color: 'var(--success)', margin: 0, fontFamily: 'var(--font-heading)' }}>
              {completedCount}
            </p>
            <span className="badge badge-success">{(complaints.length > 0 ? (completedCount / complaints.length) * 100 : 0).toFixed(0)}% Rate</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '4rem' }}>
        <div className="card glass" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '450px' }}>
          <h3 className="card-title" style={{ textAlign: 'center', marginBottom: '1rem', width: '100%' }}>Global Completion Analytics</h3>
          <div style={{ width: '100%', height: '350px' }}>
            {complaints.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={chartData} cx="50%" cy="50%" innerRadius={80} outerRadius={120} paddingAngle={5} dataKey="value" stroke="none">
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} style={{ filter: 'drop-shadow(0px 4px 6px rgba(0,0,0,0.1))' }} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', background: 'rgba(255,255,255,0.95)' }} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '4rem' }}>No data available for chart</p>
            )}
          </div>
        </div>

        <div className="card glass" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '450px' }}>
          <h3 className="card-title" style={{ textAlign: 'center', marginBottom: '1rem', width: '100%' }}>📍 Waste Distribution Heatmap</h3>
          <div style={{ width: '100%', height: '350px' }}>
            {heatmapData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis type="number" dataKey="x" name="Longitude" domain={['auto', 'auto']} tickFormatter={(v) => v.toFixed(3)} tick={{fontSize: 12, fill: 'var(--text-muted)'}} />
                  <YAxis type="number" dataKey="y" name="Latitude" domain={['auto', 'auto']} tickFormatter={(v) => v.toFixed(3)} tick={{fontSize: 12, fill: 'var(--text-muted)'}} />
                  <ZAxis type="number" dataKey="z" range={[100, 800]} name="Density" />
                  <Tooltip 
                    cursor={{ strokeDasharray: '3 3' }} 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', background: 'rgba(255,255,255,0.95)' }}
                    formatter={(value: any, name: any, props: any) => {
                      if (name === 'Density') return null;
                      return [value, name];
                    }}
                  />
                  <Scatter name="Waste Locations" data={heatmapData} fill="#ef4444" fillOpacity={0.4} shape="circle" />
                </ScatterChart>
              </ResponsiveContainer>
            ) : (
              <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '4rem' }}>No location data available</p>
            )}
          </div>
        </div>
      </div>

      <div className="card glass" style={{ marginBottom: '4rem' }}>
        <h3 className="card-title">Recent User Reports</h3>
        {complaints.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', padding: '2rem 0', textAlign: 'center' }}>No recent reports found.</p>
        ) : (
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Report ID</th>
                  <th>Date</th>
                  <th>Location / Address</th>
                  <th>Assigned Muni</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {complaints.slice(0, 5).map(c => (
                  <tr key={c.id}>
                    <td style={{ fontFamily: 'monospace', color: 'var(--text-muted)' }}>#{c.id.substring(c.id.length - 6)}</td>
                    <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                    <td style={{ maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={c.address || `${c.location.lat.toFixed(3)}, ${c.location.lng.toFixed(3)}`}>
                      {c.address ? c.address : `${c.location.lat.toFixed(3)}, ${c.location.lng.toFixed(3)}`}
                    </td>
                    <td style={{ color: 'var(--text-main)', fontWeight: 500 }}>
                      {c.assignedMunicipality?.name || c.assignedMunicipalityId || 'Unassigned'}
                    </td>
                    <td>
                      <span className={`badge ${c.status === 'Cleaned' ? 'badge-success' : 'badge-warning'}`}>
                        {c.status}
                      </span>
                    </td>
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
