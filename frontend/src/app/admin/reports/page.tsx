'use client';

import { useState, useEffect } from 'react';

export default function AdminReports() {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [municipalities, setMunicipalities] = useState<any[]>([]);
  const [reassigningId, setReassigningId] = useState<string | null>(null);
  const [newMuniId, setNewMuniId] = useState<string>('');

  useEffect(() => {
    fetchComplaints();
    fetchMunicipalities();
  }, []);

  const fetchMunicipalities = async () => {
    try {
      const res = await fetch('/api/auth/users');
      if (res.ok) {
        const users = await res.json();
        setMunicipalities(users.filter((u: any) => u.role === 'municipality'));
      }
    } catch (e) {
      console.error(e);
    }
  };

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

  const startReassign = (id: string, currentMuniId: string) => {
    setReassigningId(id);
    setNewMuniId(currentMuniId || '');
  };

  const saveReassign = async (id: string) => {
    if (!newMuniId.trim()) return;
    try {
      const res = await fetch(`/api/complaints/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignedMunicipalityId: newMuniId.trim() })
      });
      if (res.ok) {
        setReassigningId(null);
        fetchComplaints();
      }
    } catch (e) {
      console.error("Failed to reassign municipality", e);
    }
  };

  const cancelReassign = () => {
    setReassigningId(null);
    setNewMuniId('');
  };

  const deleteComplaint = async (id: string) => {
    try {
      const res = await fetch(`/api/complaints/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchComplaints();
      } else {
        alert("Failed to delete complaint.");
      }
    } catch (e) {
      alert("Error deleting complaint.");
    }
  };

  return (
    <div className="animate-slide-up">
      <div id="system-reports" className="card glass">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 className="card-title" style={{ margin: 0 }}>System Reports Directory</h3>
          <span className="badge badge-warning">{complaints.length} Total</span>
        </div>
        
        {complaints.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', padding: '2rem 0', textAlign: 'center' }}>No reports found in the system.</p>
        ) : (
          <div className="data-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Report ID</th>
                  <th>Image</th>
                  <th>Date</th>
                  <th>Location / Address</th>
                  <th>Status</th>
                  <th>Assigned Muni</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map(c => (
                  <tr key={c.id}>
                    <td style={{ fontFamily: 'monospace', color: 'var(--text-muted)' }}>#{c.id.substring(c.id.length - 6)}</td>
                    <td>
                      {c.imageUrl ? (
                        <div style={{ width: '40px', height: '40px', borderRadius: '4px', backgroundImage: `url(${c.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                      ) : (
                        <div style={{ width: '40px', height: '40px', borderRadius: '4px', background: 'var(--border)' }} />
                      )}
                    </td>
                    <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                    <td style={{ maxWidth: '250px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={c.address || `${c.location.lat.toFixed(3)}, ${c.location.lng.toFixed(3)}`}>
                      {c.address ? c.address : `${c.location.lat.toFixed(3)}, ${c.location.lng.toFixed(3)}`}
                    </td>
                    <td>
                      <span className={`badge ${c.status === 'Cleaned' ? 'badge-success' : 'badge-warning'}`}>
                        {c.status}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-main)', fontWeight: 500 }}>
                      {reassigningId === c.id ? (
                        <select 
                          value={newMuniId}
                          onChange={(e) => setNewMuniId(e.target.value)}
                          className="input-field"
                          style={{ padding: '0.4rem', borderRadius: '6px', border: '1px solid var(--primary)', width: '150px' }}
                          autoFocus
                        >
                          <option value="">Select Municipality...</option>
                          {municipalities.map(m => (
                            <option key={m.id} value={m.id}>{m.name}</option>
                          ))}
                        </select>
                      ) : (
                        c.assignedMunicipality?.name || c.assignedMunicipalityId || 'Unassigned'
                      )}
                    </td>
                    <td>
                      {c.status !== 'Cleaned' && (
                        reassigningId === c.id ? (
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => saveReassign(c.id)}>
                              Save
                            </button>
                            <button className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={cancelReassign}>
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }} onClick={() => startReassign(c.id, c.assignedMunicipalityId)}>
                              Reassign
                            </button>
                            <button className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', color: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={() => deleteComplaint(c.id)}>
                              Delete
                            </button>
                          </div>
                        )
                      )}
                      {c.status === 'Cleaned' && (
                        <button className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', color: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={() => deleteComplaint(c.id)}>
                          Delete
                        </button>
                      )}
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
