import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Plus, Search, ExternalLink, Globe, Database, Cpu, UserCheck, X } from 'lucide-react';

interface SoftSystem {
  id: string;
  name: string;
  owner: string;
  hosting: 'On-Premise' | 'Cloud' | 'Hybrid';
  status: 'Operational' | 'Maintenance' | 'Down';
  url: string;
  description: string;
  techStack: string;
  dbType: string;
  securityLevel: string;
  adminName: string;
}

export const SystemsRegistry: React.FC = () => {
  const { user, canEdit } = useAuth();
  const { t } = useLanguage();

  // Mock list of applications
  const [systems, setSystems] = useState<SoftSystem[]>([
    {
      id: 'sys-1',
      name: 'OSTA Core ERP System',
      owner: 'Human Resources & Finance',
      hosting: 'On-Premise',
      status: 'Operational',
      url: 'http://erp.osta.gov.et',
      description: 'Central platform managing administrative resources, staff payroll, budgets, and public finance ledgers.',
      techStack: 'React + Java Spring Boot',
      dbType: 'PostgreSQL',
      securityLevel: 'High (Level 3 Audit)',
      adminName: 'Chala Gemechu'
    },
    {
      id: 'sys-2',
      name: 'Integrated ICT Assets Registry (SIIMS)',
      owner: 'ICT Department',
      hosting: 'Cloud',
      status: 'Operational',
      url: 'http://siims.osta.gov.et',
      description: 'Central repository tracking hardware assets, network nodes, technical suphaa logs, and user ticketing.',
      techStack: 'Vite React + Node.js Express',
      dbType: 'PostgreSQL',
      securityLevel: 'Medium',
      adminName: 'Almaz Tolosa'
    },
    {
      id: 'sys-3',
      name: 'Zonal Communication Portal',
      owner: 'Public Relations Department',
      hosting: 'Hybrid',
      status: 'Maintenance',
      url: 'http://zonal.osta.gov.et',
      description: 'Collaborative document sharing and announcements platform connecting zonal offices to headquarters.',
      techStack: 'PHP Laravel + Vue.js',
      dbType: 'MySQL',
      securityLevel: 'Low',
      adminName: 'Lensa Kebede'
    },
    {
      id: 'sys-4',
      name: 'OSTA Public Website',
      owner: 'Public Relations Department',
      hosting: 'Cloud',
      status: 'Operational',
      url: 'https://www.osta.gov.et',
      description: 'Official public-facing informational portal providing research archives, authority directives, and news.',
      techStack: 'WordPress Engine',
      dbType: 'MySQL',
      securityLevel: 'Low',
      adminName: 'Kenenisa Bekele'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [hostingFilter, setHostingFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedSystem, setSelectedSystem] = useState<SoftSystem | null>(null);
  const [activeForm, setActiveForm] = useState<'register' | 'edit' | 'view' | null>(null);

  // Form input states
  const [formState, setFormState] = useState<Omit<SoftSystem, 'id'>>({
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
      sys.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sys.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sys.description.toLowerCase().includes(searchTerm.toLowerCase());

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

  const handleEditClick = (sys: SoftSystem) => {
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

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.name || !formState.owner) return;

    if (activeForm === 'register') {
      const newSys: SoftSystem = {
        id: `sys-${systems.length + 1}`,
        ...formState
      };
      setSystems(prev => [newSys, ...prev]);
    } else if (activeForm === 'edit' && selectedSystem) {
      setSystems(prev => prev.map(sys => sys.id === selectedSystem.id ? { ...sys, ...formState } : sys));
    }

    setActiveForm(null);
    setSelectedSystem(null);
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
        {filteredSystems.map(sys => (
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
                      onChange={(e) => setFormState(prev => ({ ...prev, hosting: e.target.value as any }))}
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
                      onChange={(e) => setFormState(prev => ({ ...prev, status: e.target.value as any }))}
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
