'use client';

import { useState, useEffect } from 'react';

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    fetchUsers();
  }, []);

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

  const admins = users.filter(u => u.role === 'admin');
  const municipalities = users.filter(u => u.role === 'municipality');
  const citizens = users.filter(u => u.role === 'user');

  const renderUserTable = (userList: any[], emptyMessage: string) => {
    if (userList.length === 0) {
      return <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', padding: '1rem 0', textAlign: 'center' }}>{emptyMessage}</p>;
    }

    return (
      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>User ID</th>
              <th>Name</th>
              <th>Email Address</th>
              <th>Account Role</th>
              <th>Join Date</th>
            </tr>
          </thead>
          <tbody>
            {userList.map(u => (
              <tr key={u.id}>
                <td style={{ fontFamily: 'monospace', color: 'var(--text-muted)' }}>#{u.id.substring(u.id.length - 6)}</td>
                <td style={{ fontWeight: 500, color: 'var(--text-main)' }}>{u.name || 'N/A'}</td>
                <td>{u.email}</td>
                <td>
                  <span className={`badge ${u.role === 'admin' ? 'badge-warning' : u.role === 'municipality' ? 'badge-info' : 'badge-success'}`}>
                    {u.role.toUpperCase()}
                  </span>
                </td>
                <td>{new Date(u.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="animate-slide-up">
      <div id="users" className="card glass" style={{ marginBottom: '4rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 className="card-title" style={{ margin: 0 }}>👥 Registered Users Directory</h3>
          <span className="badge badge-info">{users.length} Total Users</span>
        </div>

        <div style={{ marginBottom: '3rem' }}>
          <h4 style={{ color: 'var(--text-main)', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
            System Administrators ({admins.length})
          </h4>
          {renderUserTable(admins, "No administrators found.")}
        </div>

        <div style={{ marginBottom: '3rem' }}>
          <h4 style={{ color: 'var(--text-main)', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
            Municipality Offices ({municipalities.length})
          </h4>
          {renderUserTable(municipalities, "No municipality offices found.")}
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <h4 style={{ color: 'var(--text-main)', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
            Citizens ({citizens.length})
          </h4>
          {renderUserTable(citizens, "No citizens found.")}
        </div>
      </div>
    </div>
  );
}
