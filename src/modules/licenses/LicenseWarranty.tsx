import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { ShieldAlert, Search, Plus, Calendar, AlertTriangle, X } from 'lucide-react';

interface Contract {
  id: string;
  name: string;
  serialOrKey: string;
  type: 'Software License' | 'Hardware Warranty';
  expiryDate: string;
  totalSeats?: number;
  assignedSeats?: number;
  vendorName: string;
  remarks?: string;
}

export const LicenseWarranty: React.FC = () => {
  const { user, canEdit } = useAuth();
  const { t } = useLanguage();

  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [activeForm, setActiveForm] = useState<'register' | 'view' | null>(null);

  // Mock list of licenses and warranties
  const [contracts, setContracts] = useState<Contract[]>([
    {
      id: 'lic-1',
      name: 'Windows Server 2022 Core Licenses',
      serialOrKey: 'W269N-WFGWX-YVC9B-4J6C9-T83GX',
      type: 'Software License',
      expiryDate: '2026-08-05', // Very soon
      totalSeats: 32,
      assignedSeats: 28,
      vendorName: 'Microsoft East Africa',
      remarks: 'Core OS licenses for HQ Virtualization clusters.'
    },
    {
      id: 'lic-2',
      name: 'Kaspersky Endpoint Security for Business',
      serialOrKey: 'KS-EPSEC-99221-OSTA',
      type: 'Software License',
      expiryDate: '2026-10-15', // ~2.5 months
      totalSeats: 500,
      assignedSeats: 480,
      vendorName: 'Security Sol Ltd',
      remarks: 'Enterprise antivirus node deployment licenses.'
    },
    {
      id: 'lic-3',
      name: 'Dell PowerEdge R740 Server Gold Warranty',
      serialOrKey: 'DELL-WARR-98XFGH2',
      type: 'Hardware Warranty',
      expiryDate: '2026-08-12', // Very soon
      vendorName: 'Dell Technologies HQ',
      remarks: '24/7 ProSupport Next Business Day Onsite service.'
    },
    {
      id: 'lic-4',
      name: 'Fortinet FortiGate 100F Firewall License',
      serialOrKey: 'FG-100F-LIC-88221',
      type: 'Software License',
      expiryDate: '2027-05-30', // Long term
      vendorName: 'CyberSec East Africa',
      remarks: 'Unified Threat Protection (UTP) network security subscription.'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  // Form input states
  const [newContract, setNewContract] = useState({
    name: '',
    serialOrKey: '',
    type: 'Software License' as Contract['type'],
    expiryDate: '',
    totalSeats: 1,
    assignedSeats: 0,
    vendorName: '',
    remarks: ''
  });

  // Calculate days remaining helper
  const getDaysRemaining = (expiryDateStr: string) => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const expiry = new Date(expiryDateStr);
    expiry.setHours(0,0,0,0);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getAlertStatus = (days: number) => {
    if (days < 0) return { label: 'Expired', class: 'badge-danger', style: { color: 'var(--status-danger)' } };
    if (days <= 15) return { label: 'Critical Alert', class: 'badge-danger', style: { color: 'var(--status-danger)' } };
    if (days <= 90) return { label: 'Warning', class: 'badge-warning', style: { color: 'var(--status-warning)' } };
    return { label: 'Active', class: 'badge-success', style: { color: 'var(--status-success)' } };
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContract.name || !newContract.expiryDate) return;

    const entry: Contract = {
      id: `lic-${contracts.length + 1}`,
      name: newContract.name,
      serialOrKey: newContract.serialOrKey || 'N/A',
      type: newContract.type,
      expiryDate: newContract.expiryDate,
      totalSeats: Number(newContract.totalSeats),
      assignedSeats: Number(newContract.assignedSeats),
      vendorName: newContract.vendorName || 'General Store',
      remarks: newContract.remarks
    };

    setContracts(prev => [entry, ...prev]);
    setActiveForm(null);
    setNewContract({ name: '', serialOrKey: '', type: 'Software License', expiryDate: '', totalSeats: 1, assignedSeats: 0, vendorName: '', remarks: '' });
  };

  const filteredContracts = contracts.filter(con => {
    const matchesSearch = 
      con.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      con.serialOrKey.toLowerCase().includes(searchTerm.toLowerCase()) ||
      con.vendorName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = typeFilter === '' || con.type === typeFilter;

    return matchesSearch && matchesType;
  });

  const isWriteAllowed = canEdit('licenses');

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div className="page-header">
        <div>
          <h1>{t('licenses')}</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Track software license keys and physical equipment warranty durations.
          </p>
        </div>
        {isWriteAllowed && (
          <button className="btn btn-primary" onClick={() => { setSelectedContract(null); setActiveForm('register'); }}>
            <Plus size={16} />
            <span>Add Contract</span>
          </button>
        )}
      </div>

      {/* Critical Alert Center Banner if expirations are imminent */}
      {contracts.some(c => getDaysRemaining(c.expiryDate) <= 90) && (
        <div className="badge badge-danger" style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem', 
          padding: '0.75rem 1.25rem', 
          borderRadius: 'var(--radius-sm)', 
          textAlign: 'left',
          width: '100%',
          textTransform: 'none',
          letterSpacing: 'normal'
        }}>
          <AlertTriangle size={18} />
          <div>
            <strong>License Expiration Warnings:</strong> 2 critical assets expire in less than 30 days! Plan renewals immediately to prevent service disruptions.
          </div>
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
            <label htmlFor="license-type-filter" className="sr-only" style={{ display: 'none' }}>Contract Type</label>
            <select
              id="license-type-filter"
              className="input-field"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              style={{ width: '180px' }}
              aria-label="Contract Type"
            >
              <option value="">{t('all')} Types</option>
              <option value="Software License">Software License</option>
              <option value="Hardware Warranty">Hardware Warranty</option>
            </select>
          </div>
        </div>
      </div>

      {/* Contracts Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>{t('lic_name')}</th>
              <th>Type</th>
              <th>Serial / Key</th>
              <th>{t('lic_expiry')}</th>
              <th>{t('days_left')}</th>
              <th>{t('status')}</th>
              <th>{t('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {filteredContracts.map((con) => {
              const days = getDaysRemaining(con.expiryDate);
              const status = getAlertStatus(days);
              return (
                <tr key={con.id}>
                  <td>
                    <div>
                      <span style={{ fontWeight: 600 }}>{con.name}</span>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Vendor: {con.vendorName}</div>
                    </div>
                  </td>
                  <td>{con.type}</td>
                  <td><code style={{ fontSize: '0.8rem' }}>{con.serialOrKey}</code></td>
                  <td>{con.expiryDate}</td>
                  <td style={{ fontWeight: 600, color: days <= 30 ? 'var(--status-danger)' : days <= 90 ? 'var(--secondary)' : 'var(--text-primary)' }}>
                    {days < 0 ? 'Expired' : `${days} Days`}
                  </td>
                  <td>
                    <span className={`badge ${status.class}`}>
                      {status.label}
                    </span>
                  </td>
                  <td>
                    <button 
                      className="btn btn-secondary" 
                      style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                      onClick={() => { setSelectedContract(con); setActiveForm('view'); }}
                    >
                      Details
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* VIEW CONTRACT DETAILS DRAWER */}
      {activeForm === 'view' && selectedContract && (
        <div className="drawer-overlay" onClick={() => setActiveForm(null)}>
          <div className="drawer" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <h3>Contract Registry Details</h3>
              <button className="nav-btn" onClick={() => setActiveForm(null)} aria-label="Close drawer"><X size={18} /></button>
            </div>
            <div className="drawer-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <span className="badge badge-info">{selectedContract.type}</span>
                  <h2 style={{ fontSize: '1.2rem', marginTop: '0.5rem' }}>{selectedContract.name}</h2>
                </div>

                {/* Progress bar style countdown */}
                <div className="card" style={{ backgroundColor: 'var(--bg-surface-elevated)' }}>
                  <div className="flex justify-between" style={{ fontSize: '0.8rem', marginBottom: '0.375rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Expiration Countdown</span>
                    <strong style={{
                      color: getDaysRemaining(selectedContract.expiryDate) <= 30 ? 'var(--status-danger)' : getDaysRemaining(selectedContract.expiryDate) <= 90 ? 'var(--secondary)' : 'var(--status-success)'
                    }}>
                      {getDaysRemaining(selectedContract.expiryDate)} Days Remaining
                    </strong>
                  </div>
                  <div style={{ height: '8px', background: 'var(--border-color)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                    <div style={{ 
                      height: '100%', 
                      width: `${Math.min(100, Math.max(0, (getDaysRemaining(selectedContract.expiryDate) / 365) * 100))}%`, 
                      backgroundColor: getDaysRemaining(selectedContract.expiryDate) <= 30 ? 'var(--status-danger)' : getDaysRemaining(selectedContract.expiryDate) <= 90 ? 'var(--secondary)' : 'var(--status-success)'
                    }} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3" style={{ fontSize: '0.85rem' }}>
                  <div>
                    <strong style={{ color: 'var(--text-secondary)' }}>Product Key / Serial:</strong>
                    <div><code>{selectedContract.serialOrKey}</code></div>
                  </div>
                  <div>
                    <strong style={{ color: 'var(--text-secondary)' }}>Primary Vendor:</strong>
                    <div>🏢 {selectedContract.vendorName}</div>
                  </div>
                  <div>
                    <strong style={{ color: 'var(--text-secondary)' }}>Expiration Date:</strong>
                    <div>📅 {selectedContract.expiryDate}</div>
                  </div>
                  {selectedContract.type === 'Software License' && selectedContract.totalSeats && (
                    <div>
                      <strong style={{ color: 'var(--text-secondary)' }}>Seat Allocations:</strong>
                      <div>🎟️ {selectedContract.assignedSeats} / {selectedContract.totalSeats} Active Seats</div>
                    </div>
                  )}
                </div>

                <div>
                  <strong style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Contract Notes & Scope:</strong>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', marginTop: '0.25rem', padding: '0.75rem', background: 'var(--bg-app)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
                    {selectedContract.remarks || 'No remarks provided.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REGISTER CONTRACT DRAWER */}
      {activeForm === 'register' && (
        <div className="drawer-overlay" onClick={() => setActiveForm(null)}>
          <div className="drawer" onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div className="drawer-header">
                <h3>Register License / Warranty</h3>
                <button type="button" className="nav-btn" onClick={() => setActiveForm(null)} aria-label="Close drawer"><X size={18} /></button>
              </div>
              <div className="drawer-body">
                <div className="form-group">
                  <label htmlFor="con-name">Asset / software Title Name *</label>
                  <input
                    id="con-name"
                    type="text"
                    required
                    className="input-field"
                    placeholder="e.g. Fortinet UTM Firewall License"
                    value={newContract.name}
                    onChange={(e) => setNewContract(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="form-group">
                    <label htmlFor="con-type">Asset Contract Type</label>
                    <select
                      id="con-type"
                      className="input-field"
                      value={newContract.type}
                      onChange={(e) => setNewContract(prev => ({ ...prev, type: e.target.value as any }))}
                    >
                      <option value="Software License">Software License</option>
                      <option value="Hardware Warranty">Hardware Warranty</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="con-expiry">Expiry Date *</label>
                    <input
                      id="con-expiry"
                      type="date"
                      required
                      className="input-field"
                      value={newContract.expiryDate}
                      onChange={(e) => setNewContract(prev => ({ ...prev, expiryDate: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="con-key">Serial Number / Product Key</label>
                  <input
                    id="con-key"
                    type="text"
                    className="input-field"
                    placeholder="e.g. KEY-AAAA-BBBB"
                    value={newContract.serialOrKey}
                    onChange={(e) => setNewContract(prev => ({ ...prev, serialOrKey: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="form-group">
                    <label htmlFor="con-seats">Total Seats</label>
                    <input
                      id="con-seats"
                      type="number"
                      min={1}
                      className="input-field"
                      value={newContract.totalSeats}
                      onChange={(e) => setNewContract(prev => ({ ...prev, totalSeats: Number(e.target.value) }))}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="con-assigned">Assigned Seats</label>
                    <input
                      id="con-assigned"
                      type="number"
                      min={0}
                      className="input-field"
                      value={newContract.assignedSeats}
                      onChange={(e) => setNewContract(prev => ({ ...prev, assignedSeats: Number(e.target.value) }))}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="con-vendor">Supplier / Vendor Name</label>
                  <input
                    id="con-vendor"
                    type="text"
                    className="input-field"
                    placeholder="e.g. Fortinet East Africa"
                    value={newContract.vendorName}
                    onChange={(e) => setNewContract(prev => ({ ...prev, vendorName: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="con-remarks">Contract Scope / Service Notes</label>
                  <textarea
                    id="con-remarks"
                    className="input-field"
                    rows={4}
                    placeholder="Specify renewal conditions, contact detail links..."
                    value={newContract.remarks}
                    onChange={(e) => setNewContract(prev => ({ ...prev, remarks: e.target.value }))}
                  />
                </div>
              </div>
              <div className="drawer-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setActiveForm(null)}>{t('cancel')}</button>
                <button type="submit" className="btn btn-primary">Save Contract</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
