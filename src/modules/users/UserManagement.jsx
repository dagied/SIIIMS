import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../services/api';
import { Plus, Search, X, CheckCircle, Mail, Key, User } from 'lucide-react';

export const UserManagement = () => {
  const { canEdit } = useAuth();
  const { t } = useLanguage();

  const [selectedUser, setSelectedUser] = useState(null);
  const [activeForm, setActiveForm] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Success modal state for showing auto-generated credentials to admin
  const [credentialsModal, setCredentialsModal] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  // Form input states
  const [formState, setFormState] = useState({
    name: '',
    username: '',
    email: '',
    role: 'Department Staff/End User',
    zone: '',
    status: 'Active'
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const res = await api.getUsers();
      if (res && res.data) {
        setUsersList(res.data);
      }
    } catch (err) {
      console.warn('[UserManagement] API Fetch error, using fallback or empty:', err.message);
      setErrorMsg(err.message || 'Failed to load users from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = usersList.filter(u => {
    const matchesSearch = 
      (u.name && u.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (u.username && u.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesRole = roleFilter === '' || u.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const handleRegisterClick = () => {
    setFormState({
      name: '',
      username: '',
      email: '',
      role: 'Department Staff/End User',
      zone: '',
      status: 'Active'
    });
    setSelectedUser(null);
    setErrorMsg(null);
    setActiveForm('register');
  };

  const handleEditClick = (u) => {
    setSelectedUser(u);
    setFormState({
      name: u.name,
      username: u.username,
      email: u.email,
      role: u.role,
      zone: u.zone || '',
      status: u.status
    });
    setErrorMsg(null);
    setActiveForm('edit');
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formState.name.trim() || !formState.email.trim()) {
      setErrorMsg('Full employee name and official email address are required.');
      return;
    }

    if (activeForm === 'register' && formState.role === 'Zonal ICT Focal Person' && !formState.zone) {
      setErrorMsg('Select a geographic zone for a zonal ICT focal person.');
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg(null);

      if (activeForm === 'register') {
        const payload = {
          name: formState.name,
          email: formState.email,
          role: formState.role,
          zone: formState.role === 'Zonal ICT Focal Person' ? formState.zone : 'Headquarters',
          department: 'General'
        };

        const res = await api.createUser(payload);
        if (res && res.success) {
          // Open credentials confirmation modal
          setCredentialsModal(res.data);
          setActiveForm(null);
          setSelectedUser(null);
          await fetchUsers();
        } else {
          setErrorMsg(res?.message || 'The user could not be registered.');
        }
      } else if (activeForm === 'edit' && selectedUser) {
        const payload = {
          name: formState.name,
          username: formState.username,
          email: formState.email,
          role: formState.role,
          zone: formState.role === 'Zonal ICT Focal Person' ? formState.zone : 'Headquarters',
          status: formState.status
        };

        const res = await api.updateUser(selectedUser.id, payload);
        if (res && res.success) {
          setActiveForm(null);
          setSelectedUser(null);
          await fetchUsers();
        } else {
          setErrorMsg(res?.message || 'The user could not be updated.');
        }
      }
    } catch (err) {
      console.error('[UserManagement] Form submit error:', err);
      setErrorMsg(err.message || 'Failed to process request.');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleStatus = async (targetUser) => {
    try {
      setErrorMsg(null);
      // Optimistic UI update
      setUsersList(prev => prev.map(u => {
        if (u.id === targetUser.id) {
          return {
            ...u,
            status: u.status === 'Active' ? 'Suspended' : 'Active'
          };
        }
        return u;
      }));

      const res = await api.toggleUserStatus(targetUser.id);
      if (res && res.success) {
        await fetchUsers();
      }
    } catch (err) {
      console.error('[UserManagement] Toggle status error:', err);
      setErrorMsg(err.message || 'Failed to update user status.');
      await fetchUsers(); // revert on error
    }
  };


  const isWriteAllowed = canEdit('users');
  const roleList = [
    'System Admin',
    'ICT Technician',
    'Zonal ICT Focal Person',
    'Department Staff/End User',
    'Management/Executive Viewer',
  ];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div className="page-header">
        <div>
          <h1>{t('users')}</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            CRUD system accounts, assign security roles, auto-generate credentials, and dispatch to user email.
          </p>
        </div>
        {isWriteAllowed && (
          <button className="btn btn-primary" onClick={handleRegisterClick}>
            <Plus size={16} />
            <span>Create User</span>
          </button>
        )}
      </div>

      {errorMsg && (
        <div style={{ background: '#fef2f2', color: '#991b1b', padding: '0.75rem 1rem', borderRadius: '6px', fontSize: '0.9rem', border: '1px solid #fecaca' }}>
          ⚠️ {errorMsg}
        </div>
      )}

      {/* Filters */}
      <div className="card" style={{ padding: '1rem' }}>
        <div className="flex align-center gap-3 flex-wrap">
          <div className="form-group flex-1" style={{ margin: 0, minWidth: '220px' }}>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="input-field"
                placeholder={t('search')}
                style={{ paddingLeft: '2.25rem' }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search size={16} style={{ position: 'absolute', left: '10px', top: '13px', color: 'var(--text-muted)' }} />
            </div>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label htmlFor="user-role-filter" className="sr-only" style={{ display: 'none' }}>User Role</label>
            <select
              id="user-role-filter"
              className="input-field"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              style={{ width: '220px' }}
              aria-label="User Role Filter"
            >
              <option value="">{t('all')} Roles</option>
              {roleList.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="table-container">
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            Loading users from database...
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Full Name</th>
                <th>Username</th>
                <th>Email Address</th>
                <th>Assigned Role</th>
                <th>Linked Zone Branch</th>
                <th>Status</th>
                <th>{t('actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                    No users found. Click "Create User" to register an account.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id}>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{u.name}</td>
                    <td><code style={{ fontSize: '0.85rem', background: 'var(--bg-secondary)', padding: '2px 6px', borderRadius: '4px' }}>{u.username}</code></td>
                    <td>{u.email}</td>
                    <td>
                      <span className="badge badge-info" style={{ textTransform: 'none' }}>
                        {u.role}
                      </span>
                    </td>
                    <td>
                      {u.role === 'Zonal ICT Focal Person' ? (
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary)' }}>
                          🏢 {u.zone || 'Not Specified'}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{u.zone || 'Global HQ'}</span>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${u.status === 'Active' ? 'badge-success' : 'badge-danger'}`}>
                        {u.status}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-2">
                        {isWriteAllowed && (
                          <>
                            <button 
                              className="btn btn-secondary" 
                              style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                              onClick={() => handleEditClick(u)}
                            >
                              Edit
                            </button>
                            <button 
                              className="btn btn-secondary" 
                              style={{ padding: '4px 8px', fontSize: '0.75rem', borderColor: u.status === 'Active' ? 'var(--status-danger)' : 'var(--primary)', color: u.status === 'Active' ? 'var(--status-danger)' : 'var(--primary)' }}
                              onClick={() => toggleStatus(u)}
                            >
                              {u.status === 'Active' ? 'Suspend' : 'Activate'}
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* REGISTER / EDIT USER DRAWER */}
      {(activeForm === 'register' || activeForm === 'edit') && (
        <div className="drawer-overlay" onClick={() => setActiveForm(null)}>
          <div className="drawer" onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div className="drawer-header">
                <h3>{activeForm === 'register' ? 'Register System Account' : 'Edit User Permissions'}</h3>
                <button type="button" className="nav-btn" onClick={() => setActiveForm(null)} aria-label="Close drawer"><X size={18} /></button>
              </div>
              <div className="drawer-body">
                {activeForm === 'register' && (
                  <div style={{ background: 'var(--bg-secondary)', padding: '0.85rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem', borderLeft: '4px solid var(--primary)' }}>
                    <strong>✨ Auto-Generated Credentials:</strong> Username (FirstName + Random Digits) and Temporary Password will be generated automatically and emailed to the official address provided below.
                  </div>
                )}

                <div className="form-group">
                  <label htmlFor="usr-form-name">Full Employee Name *</label>
                  <input
                    id="usr-form-name"
                    type="text"
                    required
                    className="input-field"
                    placeholder="e.g. Ebise Gemeda"
                    value={formState.name}
                    onChange={(e) => setFormState(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>

                {activeForm === 'edit' && (
                  <div className="form-group">
                    <label htmlFor="usr-form-uname">System Username *</label>
                    <input
                      id="usr-form-uname"
                      type="text"
                      required
                      className="input-field"
                      placeholder="e.g. ebise4829"
                      value={formState.username}
                      onChange={(e) => setFormState(prev => ({ ...prev, username: e.target.value }))}
                    />
                  </div>
                )}

                <div className="form-group">
                  <label htmlFor="usr-form-email">Official Email Address *</label>
                  <input
                    id="usr-form-email"
                    type="email"
                    required
                    className="input-field"
                    placeholder="e.g. ebise.g@osta.gov.et"
                    value={formState.email}
                    onChange={(e) => setFormState(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="usr-form-role">Security Access Role</label>
                  <select
                    id="usr-form-role"
                    className="input-field"
                    value={formState.role}
                    onChange={(e) => setFormState(prev => ({ ...prev, role: e.target.value }))}
                  >
                    {roleList.map(roleOption => (
                      <option key={roleOption} value={roleOption}>{roleOption}</option>
                    ))}
                  </select>
                </div>

                {/* Conditional Zone selection for Zonal users */}
                {formState.role === 'Zonal ICT Focal Person' && (
                  <div className="form-group animate-fade-in">
                    <label htmlFor="usr-form-zone">Geographic OSTA Zone Branch *</label>
                    <select
                      id="usr-form-zone"
                      required
                      className="input-field"
                      value={formState.zone}
                      onChange={(e) => setFormState(prev => ({ ...prev, zone: e.target.value }))}
                    >
                      <option value="">Select Region Zone...</option>
                      <option value="East Shewa Zone">East Shewa Zone</option>
                      <option value="Bale Zone">Bale Zone</option>
                      <option value="Jimma Zone">Jimma Zone</option>
                      <option value="West Wollega Zone">West Wollega Zone</option>
                    </select>
                  </div>
                )}

                {activeForm === 'edit' && (
                  <div className="form-group">
                    <label htmlFor="usr-form-status">Account Authorization Status</label>
                    <select
                      id="usr-form-status"
                      className="input-field"
                      value={formState.status}
                      onChange={(e) => setFormState(prev => ({ ...prev, status: e.target.value }))}
                    >
                      <option value="Active">Active / Approved</option>
                      <option value="Suspended">Suspended / Deactivated</option>
                    </select>
                  </div>
                )}
              </div>
              <div className="drawer-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setActiveForm(null)}>{t('cancel')}</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : activeForm === 'register' ? 'Register & Send Email' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUCCESS CREDENTIALS POPUP MODAL */}
      {credentialsModal && (
        <div className="drawer-overlay" style={{ background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="card animate-fade-in" style={{ width: '90%', maxWidth: '450px', padding: '1.5rem', background: 'var(--bg-card)', borderRadius: '12px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)' }}>
            <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
              <div style={{ background: '#dcfce7', width: '56px', height: '56px', borderRadius: '50%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
                <CheckCircle size={32} color="#16a34a" />
              </div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>User Created Successfully!</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                Saved to PostgreSQL database and credentials dispatched to employee email.
              </p>
            </div>

            <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <User size={16} color="var(--primary)" />
                <span style={{ color: 'var(--text-muted)' }}>Full Name:</span>
                <strong style={{ marginLeft: 'auto' }}>{credentialsModal.name}</strong>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <User size={16} color="var(--primary)" />
                <span style={{ color: 'var(--text-muted)' }}>Auto Username:</span>
                <code style={{ marginLeft: 'auto', background: 'var(--bg-main)', padding: '2px 8px', borderRadius: '4px', color: 'var(--primary)', fontWeight: 600 }}>
                  {credentialsModal.username}
                </code>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Key size={16} color="var(--primary)" />
                <span style={{ color: 'var(--text-muted)' }}>Temp Password:</span>
                <code style={{ marginLeft: 'auto', background: 'var(--bg-main)', padding: '2px 8px', borderRadius: '4px', color: '#d97706', fontWeight: 600 }}>
                  {credentialsModal.generatedPassword}
                </code>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Mail size={16} color="var(--primary)" />
                <span style={{ color: 'var(--text-muted)' }}>Sent To:</span>
                <span style={{ marginLeft: 'auto', fontSize: '0.85rem' }}>{credentialsModal.email}</span>
              </div>
            </div>

            <button 
              className="btn btn-primary" 
              style={{ width: '100%', marginTop: '1.25rem' }}
              onClick={() => setCredentialsModal(null)}
            >
              Done & Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

