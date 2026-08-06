import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Plus, Search, X } from 'lucide-react';

export const UserManagement = () => {
  const { canEdit } = useAuth();
  const { t } = useLanguage();

  const [selectedUser, setSelectedUser] = useState(null);
  const [activeForm, setActiveForm] = useState(null);

  // Mock list of users
  const [usersList, setUsersList] = useState([
    {
      id: 'usr-1',
      name: 'Almaz Tolosa',
      username: 'admin_almaz',
      email: 'almaz.t@osta.gov.et',
      role: 'System Admin',
      status: 'Active'
    },
    {
      id: 'usr-2',
      name: 'Chala Gemechu',
      username: 'tech_chala',
      email: 'chala.g@osta.gov.et',
      role: 'ICT Technician',
      status: 'Active'
    },
    {
      id: 'usr-3',
      name: 'Lensa Kebede',
      username: 'zone_lensa',
      email: 'lensa.k@osta.gov.et',
      role: 'Zonal ICT Focal Person',
      zone: 'East Shewa Zone',
      status: 'Active'
    },
    {
      id: 'usr-4',
      name: 'Derartu Tulu',
      username: 'staff_derartu',
      email: 'derartu.t@osta.gov.et',
      role: 'Department Staff/End User',
      status: 'Active'
    },
    {
      id: 'usr-5',
      name: 'Dr. Kenenisa Bekele',
      username: 'exec_kenenisa',
      email: 'kenenisa.b@osta.gov.et',
      role: 'Management/Executive Viewer',
      status: 'Active'
    },
    {
      id: 'usr-6',
      name: 'Tola Abera',
      username: 'tola_suspended',
      email: 'tola.a@osta.gov.et',
      role: 'Department Staff/End User',
      status: 'Suspended'
    }
  ]);

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

  const filteredUsers = usersList.filter(u => {
    const matchesSearch = 
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());

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
    setActiveForm('edit');
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formState.name || !formState.username) return;

    if (activeForm === 'register') {
      const newUser = {
        id: `usr-${usersList.length + 1}`,
        ...formState,
        zone: formState.role === 'Zonal ICT Focal Person' ? formState.zone : undefined
      };
      setUsersList(prev => [newUser, ...prev]);
    } else if (activeForm === 'edit' && selectedUser) {
      setUsersList(prev => prev.map(u => u.id === selectedUser.id ? { 
        ...u, 
        ...formState,
        zone: formState.role === 'Zonal ICT Focal Person' ? formState.zone : undefined 
      } : u));
    }

    setActiveForm(null);
    setSelectedUser(null);
  };

  const toggleStatus = (targetUser) => {
    setUsersList(prev => prev.map(u => {
      if (u.id === targetUser.id) {
        return {
          ...u,
          status: u.status === 'Active' ? 'Suspended' : 'Active'
        };
      }
      return u;
    }));
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
            CRUD system accounts, assign security roles, and link regional technicians to zonal offices.
          </p>
        </div>
        {isWriteAllowed && (
          <button className="btn btn-primary" onClick={handleRegisterClick}>
            <Plus size={16} />
            <span>Create User</span>
          </button>
        )}
      </div>

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
            {filteredUsers.map((u) => (
              <tr key={u.id}>
                <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{u.name}</td>
                <td><code style={{ fontSize: '0.8rem' }}>{u.username}</code></td>
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
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Global HQ</span>
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
            ))}
          </tbody>
        </table>
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
                <div className="form-group">
                  <label htmlFor="usr-form-uname">System Username *</label>
                  <input
                    id="usr-form-uname"
                    type="text"
                    required
                    className="input-field"
                    placeholder="e.g. ebise_g"
                    value={formState.username}
                    onChange={(e) => setFormState(prev => ({ ...prev, username: e.target.value }))}
                  />
                </div>
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
              </div>
              <div className="drawer-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setActiveForm(null)}>{t('cancel')}</button>
                <button type="submit" className="btn btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
