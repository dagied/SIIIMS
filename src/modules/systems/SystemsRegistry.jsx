import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../services/api';
import { Plus, Search, ExternalLink, Globe, Database, Cpu, UserCheck, X } from 'lucide-react';

export const SystemsRegistry = () => {
  const { user, canEdit } = useAuth();
  const { t } = useLanguage();

  const [systems, setSystems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');

  const fetchSystems = async () => {
    try {
      setLoading(true);
      setFetchError('');
      const res = await api.getSystems();
      if (res?.success && Array.isArray(res.data)) {
        const mapped = res.data.map(s => ({
          id: s.id,
          name: s.name,
          owner: s.ownerDept || 'ICT Directorate',
          hosting: s.hosting || 'On-Premise',
          status: s.status || 'Operational',
          url: `http://${s.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.osta.gov.et`,
          description: `Enterprise platform ${s.name} version ${s.version || 'v1.0'}`,
          techStack: s.techStack || 'Node.js, PostgreSQL',
          dbType: 'PostgreSQL',
          securityLevel: 'High',
          adminName: 'System Admin'
        }));
        setSystems(mapped);
      } else {
        setSystems([]);
        setFetchError(res?.message || 'No system records were returned from the server.');
      }
    } catch (err) {
      console.warn('[SystemsRegistry] Failed to fetch systems:', err);
      setSystems([]);
      setFetchError(err.message || 'Failed to load systems from the server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSystems();
  }, []);

  const [searchTerm, setSearchTerm] = useState('');
  const [hostingFilter, setHostingFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedSystem, setSelectedSystem] = useState(null);
  const [activeForm, setActiveForm] = useState(null);

  // Form input states
  const [formState, setFormState] = useState({
    name: '',
    owner: '',
    hosting: 'On-Premise',
    status: 'Operational',
    url: '',
    description: '',
    techStack: '',
    dbType: '',
    securityLevel: 'Medium',
    adminName: ''
  });

  const filteredSystems = systems.filter(sys => {
    const matchesSearch = 
      (sys.name && sys.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (sys.owner && sys.owner.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (sys.description && sys.description.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesHosting = hostingFilter === '' || sys.hosting === hostingFilter;
    const matchesStatus = statusFilter === '' || sys.status === statusFilter;

    return matchesSearch && matchesHosting && matchesStatus;
  });

  const handleRegisterClick = () => {
    setFormState({
      name: '',
      owner: '',
      hosting: 'On-Premise',
      status: 'Operational',
      url: '',
      description: '',
      techStack: '',
      dbType: '',
      securityLevel: 'Medium',
      adminName: user?.name || ''
    });
    setSelectedSystem(null);
    setActiveForm('register');
  };

  const handleEditClick = (sys) => {
    setSelectedSystem(sys);
    setFormState({
      name: sys.name,
      owner: sys.owner,
      hosting: sys.hosting,
      status: sys.status,
      url: sys.url,
      description: sys.description,
      techStack: sys.techStack,
      dbType: sys.dbType,
      securityLevel: sys.securityLevel,
      adminName: sys.adminName
    });
    setActiveForm('edit');
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formState.name || !formState.owner) return;

    try {
      if (activeForm === 'register') {
        const payload = {
          name: formState.name,
          category: 'Enterprise Application',
          version: 'v1.0.0',
          hosting: formState.hosting,
          status: formState.status,
          ownerDept: formState.owner,
          techStack: formState.techStack || 'Node.js, Express, PostgreSQL'
        };

        const res = await api.createSystem(payload);
        if (res && res.success) {
          setActiveForm(null);
          setSelectedSystem(null);
          await fetchSystems();
        }
      }
    } catch (err) {
      console.error('[SystemsRegistry] Failed to create system:', err);
    }
  };


  const isWriteAllowed = canEdit('systems');

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div className="page-header">
        <div>
          <h1>{t('systems')}</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Browse OSTA enterprise applications, hosting models, tech stacks, and system links.
          </p>
        </div>
        {isWriteAllowed && (
          <button className="btn btn-primary" onClick={handleRegisterClick}>
            <Plus size={18} />
            <span>Register System</span>
          </button>
        )}
      </div>

      {/* Filter bar */}
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
            <label htmlFor="hosting-filter" className="sr-only" style={{ display: 'none' }}>Hosting Mode</label>
            <select
              id="hosting-filter"
              className="input-field"
              value={hostingFilter}
              onChange={(e) => setHostingFilter(e.target.value)}
              style={{ width: '160px' }}
              aria-label="Hosting Mode"
            >
              <option value="">{t('all')} Hostings</option>
              <option value="On-Premise">On-Premise</option>
              <option value="Cloud">Cloud</option>
              <option value="Hybrid">Hybrid</option>
            </select>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label htmlFor="system-status-filter" className="sr-only" style={{ display: 'none' }}>Status</label>
            <select
              id="system-status-filter"
              className="input-field"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ width: '150px' }}
              aria-label="System Status"
            >
              <option value="">{t('all')} Statuses</option>
              <option value="Operational">Operational</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Down">Down</option>
            </select>
          </div>
        </div>
      </div>

      {/* Systems Grid */}
      <div className="grid grid-cols-2 gap-4">
        {loading ? (
          <div style={{ gridColumn: '1 / -1', padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            Loading systems from database...
          </div>
        ) : fetchError ? (
          <div className="badge badge-danger" style={{ gridColumn: '1 / -1', display: 'block', padding: '1rem', whiteSpace: 'normal' }}>
            {fetchError}
          </div>
        ) : filteredSystems.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            No systems found in the database.
          </div>
        ) : filteredSystems.map(sys => (
          <div key={sys.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div className="flex justify-between align-center" style={{ marginBottom: '0.75rem' }}>
                <span className="badge badge-info">{sys.hosting}</span>
                <span className={`badge ${
                  sys.status === 'Operational' ? 'badge-success' : 
                  sys.status === 'Maintenance' ? 'badge-warning' : 'badge-danger'
                }`}>
                  {sys.status}
                </span>
              </div>

              <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--text-primary)' }}>{sys.name}</h3>
              <div style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 600, marginBottom: '0.5rem' }}>
                🏢 Department: {sys.owner}
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {sys.description}
              </p>
            </div>

            <div style={{ marginTop: '1.25rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignContent: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div className="flex gap-2" style={{ flex: 1 }}>
                <button 
                  className="btn btn-secondary" 
                  style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                  onClick={() => { setSelectedSystem(sys); setActiveForm('view'); }}
                  title="View Registry details"
                >
                  Details
                </button>
                {isWriteAllowed && (
                  <button 
                    className="btn btn-secondary" 
                    style={{ padding: '4px 10px', fontSize: '0.75rem', borderColor: 'var(--primary)', color: 'var(--primary)' }}
                    onClick={() => handleEditClick(sys)}
                  >
                    {t('edit')}
                  </button>
                )}
              </div>
              {sys.url && (
                <a 
                  href={sys.url} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="btn btn-primary"
                  style={{ padding: '4px 10px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                >
                  <span>Launch</span>
                  <ExternalLink size={12} />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* VIEW SYSTEM DETAILS DRAWER */}
      {activeForm === 'view' && selectedSystem && (
        <div className="drawer-overlay" onClick={() => setActiveForm(null)}>
          <div className="drawer" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <h3>System Registry Profile</h3>
              <button className="nav-btn" onClick={() => setActiveForm(null)} aria-label="Close drawer"><X size={18} /></button>
            </div>
            <div className="drawer-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.3rem' }}>{selectedSystem.name}</h2>
                  <div className="flex align-center gap-2" style={{ marginTop: '0.25rem' }}>
                    <span className="badge badge-info">{selectedSystem.hosting}</span>
                    <span className={`badge ${selectedSystem.status === 'Operational' ? 'badge-success' : selectedSystem.status === 'Maintenance' ? 'badge-warning' : 'badge-danger'}`}>
                      {selectedSystem.status}
                    </span>
                  </div>
                </div>

                <div>
                  <strong style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>System Description:</strong>
                  <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', marginTop: '0.25rem' }}>
                    {selectedSystem.description}
                  </p>
                </div>

                <div className="card" style={{ backgroundColor: 'var(--bg-surface-elevated)', borderStyle: 'solid' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
                    <div className="flex justify-between">
                      <span className="flex align-center gap-1"><Globe size={14} /> Owner Department</span>
                      <strong style={{ textAlign: 'right' }}>{selectedSystem.owner}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="flex align-center gap-1"><Cpu size={14} /> Technology Stack</span>
                      <strong>{selectedSystem.techStack || 'Not documented'}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="flex align-center gap-1"><Database size={14} /> Primary Database</span>
                      <strong>{selectedSystem.dbType || 'Not documented'}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="flex align-center gap-1"><UserCheck size={14} /> Technical Lead</span>
                      <strong>{selectedSystem.adminName || 'Unassigned'}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>🔐 Security Compliance</span>
                      <strong>{selectedSystem.securityLevel}</strong>
                    </div>
                  </div>
                </div>

                {selectedSystem.url && (
                  <a 
                    href={selectedSystem.url} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="btn btn-primary"
                    style={{ justifyContent: 'center', marginTop: '0.5rem' }}
                  >
                    <span>Launch Portal Website</span>
                    <ExternalLink size={14} />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REGISTER / EDIT SYSTEM DRAWER */}
      {(activeForm === 'register' || activeForm === 'edit') && (
        <div className="drawer-overlay" onClick={() => setActiveForm(null)}>
          <div className="drawer" onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div className="drawer-header">
                <h3>{activeForm === 'register' ? 'Register New System' : 'Edit System Registry'}</h3>
                <button type="button" className="nav-btn" onClick={() => setActiveForm(null)} aria-label="Close drawer"><X size={18} /></button>
              </div>
              <div className="drawer-body">
                <div className="form-group">
                  <label htmlFor="sys-name">Application / System Name *</label>
                  <input
                    id="sys-name"
                    type="text"
                    required
                    className="input-field"
                    placeholder="e.g. OSTA Core ERP System"
                    value={formState.name}
                    onChange={(e) => setFormState(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="sys-owner">Owner Department / Bureau *</label>
                  <input
                    id="sys-owner"
                    type="text"
                    required
                    className="input-field"
                    placeholder="e.g. Public Relations Department"
                    value={formState.owner}
                    onChange={(e) => setFormState(prev => ({ ...prev, owner: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="form-group">
                    <label htmlFor="sys-hosting">Hosting Model</label>
                    <select
                      id="sys-hosting"
                      className="input-field"
                      value={formState.hosting}
                      onChange={(e) => setFormState(prev => ({ ...prev, hosting: e.target.value }))}
                    >
                      <option value="On-Premise">On-Premise</option>
                      <option value="Cloud">Cloud</option>
                      <option value="Hybrid">Hybrid</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="sys-status">Status</label>
                    <select
                      id="sys-status"
                      className="input-field"
                      value={formState.status}
                      onChange={(e) => setFormState(prev => ({ ...prev, status: e.target.value }))}
                    >
                      <option value="Operational">Operational</option>
                      <option value="Maintenance">Maintenance</option>
                      <option value="Down">Down</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="sys-url">Launch Web Link (URL)</label>
                  <input
                    id="sys-url"
                    type="url"
                    className="input-field"
                    placeholder="https://erp.osta.gov.et"
                    value={formState.url}
                    onChange={(e) => setFormState(prev => ({ ...prev, url: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="sys-desc">System Purpose / Details</label>
                  <textarea
                    id="sys-desc"
                    className="input-field"
                    rows={4}
                    placeholder="Provide a high-level summary of what services this system operates..."
                    value={formState.description}
                    onChange={(e) => setFormState(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="form-group">
                    <label htmlFor="sys-stack">Tech Stack / Frameworks</label>
                    <input
                      id="sys-stack"
                      type="text"
                      className="input-field"
                      placeholder="e.g. React + Spring Boot"
                      value={formState.techStack}
                      onChange={(e) => setFormState(prev => ({ ...prev, techStack: e.target.value }))}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="sys-db">Database Engine</label>
                    <input
                      id="sys-db"
                      type="text"
                      className="input-field"
                      placeholder="e.g. PostgreSQL 14"
                      value={formState.dbType}
                      onChange={(e) => setFormState(prev => ({ ...prev, dbType: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="form-group">
                    <label htmlFor="sys-security">Security Compliance</label>
                    <select
                      id="sys-security"
                      className="input-field"
                      value={formState.securityLevel}
                      onChange={(e) => setFormState(prev => ({ ...prev, securityLevel: e.target.value }))}
                    >
                      <option value="High (Level 3 Audit)">High (Level 3 Audit)</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="sys-admin">System Admin / Lead Officer</label>
                    <input
                      id="sys-admin"
                      type="text"
                      className="input-field"
                      placeholder="e.g. Ebise Gemeda"
                      value={formState.adminName}
                      onChange={(e) => setFormState(prev => ({ ...prev, adminName: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
              <div className="drawer-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setActiveForm(null)}>{t('cancel')}</button>
                <button type="submit" className="btn btn-primary">{t('save')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
