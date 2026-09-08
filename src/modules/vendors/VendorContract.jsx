import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Plus, Search, Handshake, Mail, Phone, Calendar, CheckSquare, X } from 'lucide-react';
import { dateRange, email, required, firstError } from '../../utils/validation';

export const VendorContract = () => {
  const { user, canEdit } = useAuth();
  const { t } = useLanguage();

  const [selectedVendor, setSelectedVendor] = useState(null);
  const [activeForm, setActiveForm] = useState(null);
  const [formError, setFormError] = useState('');

  // Mock list of vendor contracts
  const [vendors, setVendors] = useState([
    {
      id: 'ven-1',
      name: 'Ethio Telecom (HQ ISP)',
      contactPerson: 'Abebe Bikila (Key Account Mgr)',
      email: 'abebe.b@telecom.et',
      phone: '+251-911-000111',
      slaStatus: 'Active Compliant',
      slaConditions: [
        '99.99% core internet circuit uptime',
        'Support response within 1 hour for critical outages',
        'MTTR (Mean Time to Resolve) under 4 hours'
      ],
      contractStart: '2026-01-01',
      contractEnd: '2026-12-31',
      notes: 'Primary internet provider for OSTA HQ. High priority SLA escalations.'
    },
    {
      id: 'ven-2',
      name: 'Security Sol Ltd',
      contactPerson: 'Lensa Tolosa',
      email: 'lensa@securitysol.com',
      phone: '+251-922-333444',
      slaStatus: 'Active Compliant',
      slaConditions: [
        'Monthly endpoint security audits and software patch delivery',
        'Support tickets resolution within 24 hours'
      ],
      contractStart: '2025-06-15',
      contractEnd: '2026-06-15', // Needs renewal
      notes: 'Contract expired or near expiration. Under active negotiation.'
    },
    {
      id: 'ven-3',
      name: 'Office Depot Ethiopia',
      contactPerson: 'Chala Kebede',
      email: 'chala.k@officedepot.et',
      phone: '+251-11-5551212',
      slaStatus: 'No SLA',
      slaConditions: [
        'Next-business-day hardware peripheral supplies delivery'
      ],
      contractStart: '2026-03-01',
      contractEnd: '2027-03-01',
      notes: 'Ad-hoc consumable printer cartridge and toner supplier.'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [slaFilter, setSlaFilter] = useState('');

  // Form input state
  const [newVendor, setNewVendor] = useState({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    slaStatus: 'Active Compliant',
    slaConditionsText: '',
    contractStart: '',
    contractEnd: '',
    notes: ''
  });

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    setFormError('');
    const validationError = firstError(
      required(newVendor.name, 'Vendor name'),
      required(newVendor.contactPerson, 'Contact person'),
      email(newVendor.email, 'Contact email'),
      required(newVendor.phone, 'Contact phone'),
      dateRange(newVendor.contractStart, newVendor.contractEnd, 'Contract start date', 'Contract end date')
    );
    if (validationError) {
      setFormError(validationError);
      return;
    }

    const entry = {
      id: `ven-${vendors.length + 1}`,
      name: newVendor.name,
      contactPerson: newVendor.contactPerson,
      email: newVendor.email || 'N/A',
      phone: newVendor.phone || 'N/A',
      slaStatus: newVendor.slaStatus,
      slaConditions: newVendor.slaConditionsText.split('\n').filter(line => line.trim() !== ''),
      contractStart: newVendor.contractStart || new Date().toISOString().split('T')[0],
      contractEnd: newVendor.contractEnd || '',
      notes: newVendor.notes
    };

    setVendors(prev => [entry, ...prev]);
    setActiveForm(null);
    setNewVendor({
      name: '',
      contactPerson: '',
      email: '',
      phone: '',
      slaStatus: 'Active Compliant',
      slaConditionsText: '',
      contractStart: '',
      contractEnd: '',
      notes: ''
    });
  };

  const filteredVendors = vendors.filter(ven => {
    const matchesSearch = 
      ven.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ven.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ven.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSla = slaFilter === '' || ven.slaStatus === slaFilter;

    return matchesSearch && matchesSla;
  });

  const isWriteAllowed = canEdit('vendors');

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div className="page-header">
        <div>
          <h1>{t('vendors')}</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Browse OSTA hardware/software suppliers, SLA agreements, and support phone contacts.
          </p>
        </div>
        {isWriteAllowed && (
          <button className="btn btn-primary" onClick={() => { setSelectedVendor(null); setActiveForm('register'); }}>
            <Plus size={16} />
            <span>Add Supplier</span>
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
            <label htmlFor="vendor-sla-filter" className="sr-only" style={{ display: 'none' }}>SLA Status</label>
            <select
              id="vendor-sla-filter"
              className="input-field"
              value={slaFilter}
              onChange={(e) => setSlaFilter(e.target.value)}
              style={{ width: '180px' }}
              aria-label="SLA Status"
            >
              <option value="">{t('all')} SLAs</option>
              <option value="Active Compliant">Active Compliant</option>
              <option value="At Risk">At Risk</option>
              <option value="No SLA">No SLA</option>
            </select>
          </div>
        </div>
      </div>

      {/* Vendors Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>{t('vendor_name')}</th>
              <th>Primary Contact</th>
              <th>Email</th>
              <th>Phone</th>
              <th>{t('vendor_sla')}</th>
              <th>Contract Period</th>
              <th>{t('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {filteredVendors.map((ven) => (
              <tr key={ven.id}>
                <td style={{ fontWeight: 600, color: 'var(--primary)' }}>{ven.name}</td>
                <td>👤 {ven.contactPerson}</td>
                <td><a href={`mailto:${ven.email}`} style={{ color: 'var(--text-primary)' }}>{ven.email}</a></td>
                <td>{ven.phone}</td>
                <td>
                  <span className={`badge ${
                    ven.slaStatus === 'Active Compliant' ? 'badge-success' : 
                    ven.slaStatus === 'At Risk' ? 'badge-danger' : 'badge-warning'
                  }`}>
                    {ven.slaStatus}
                  </span>
                </td>
                <td>
                  <span style={{ fontSize: '0.8rem' }}>📅 {ven.contractStart} to {ven.contractEnd || 'Ongoing'}</span>
                </td>
                <td>
                  <button 
                    className="btn btn-secondary" 
                    style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                    onClick={() => { setSelectedVendor(ven); setActiveForm('view'); }}
                  >
                    Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* VIEW VENDOR DETAILS DRAWER */}
      {activeForm === 'view' && selectedVendor && (
        <div className="drawer-overlay" onClick={() => setActiveForm(null)}>
          <div className="drawer" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <h3>Vendor Contract Profile</h3>
              <button className="nav-btn" onClick={() => setActiveForm(null)} aria-label="Close drawer"><X size={18} /></button>
            </div>
            <div className="drawer-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.2rem', color: 'var(--text-primary)' }}>{selectedVendor.name}</h2>
                  <span className={`badge ${selectedVendor.slaStatus === 'Active Compliant' ? 'badge-success' : selectedVendor.slaStatus === 'At Risk' ? 'badge-danger' : 'badge-warning'}`} style={{ marginTop: '0.5rem' }}>
                    SLA: {selectedVendor.slaStatus}
                  </span>
                </div>

                <div className="card" style={{ backgroundColor: 'var(--bg-surface-elevated)', padding: '1rem' }}>
                  <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Contact Card</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
                    <div className="flex align-center gap-2">
                      <Mail size={14} style={{ color: 'var(--primary)' }} />
                      <span>{selectedVendor.email}</span>
                    </div>
                    <div className="flex align-center gap-2">
                      <Phone size={14} style={{ color: 'var(--primary)' }} />
                      <span>{selectedVendor.phone}</span>
                    </div>
                    <div className="flex align-center gap-2">
                      <Calendar size={14} style={{ color: 'var(--primary)' }} />
                      <span>SLA Term: {selectedVendor.contractStart} to {selectedVendor.contractEnd}</span>
                    </div>
                  </div>
                </div>

                {/* SLA Conditions */}
                <div>
                  <h3 style={{ fontSize: '0.95rem', marginBottom: '0.5rem' }}><CheckSquare size={16} style={{ verticalAlign: 'middle', marginRight: '0.25rem' }} /> Agreement Obligations (SLA)</h3>
                  <ul style={{ paddingLeft: '1.25rem', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                    {selectedVendor.slaConditions.map((cond, idx) => (
                      <li key={idx} style={{ color: 'var(--text-primary)' }}>{cond}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <strong style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Account Scope / Supplier Notes:</strong>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', marginTop: '0.25rem', padding: '0.75rem', background: 'var(--bg-app)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
                    {selectedVendor.notes || 'No notes saved.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REGISTER VENDOR DRAWER */}
      {activeForm === 'register' && (
        <div className="drawer-overlay" onClick={() => setActiveForm(null)}>
          <div className="drawer" onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div className="drawer-header">
                <h3>Add Vendor Profile</h3>
                <button type="button" className="nav-btn" onClick={() => setActiveForm(null)} aria-label="Close drawer"><X size={18} /></button>
              </div>
              <div className="drawer-body">
                {formError && <div className="badge badge-danger" style={{ display: 'block', padding: '0.75rem', marginBottom: '1rem', whiteSpace: 'normal' }}>{formError}</div>}
                <div className="form-group">
                  <label htmlFor="ven-form-name">Vendor Corporate Name *</label>
                  <input
                    id="ven-form-name"
                    type="text"
                    required
                    className="input-field"
                    placeholder="e.g. Cisco Systems East Africa"
                    value={newVendor.name}
                    onChange={(e) => setNewVendor(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="ven-form-contact">Account Manager Contact Person *</label>
                  <input
                    id="ven-form-contact"
                    type="text"
                    required
                    className="input-field"
                    placeholder="e.g. Abebe Bikila"
                    value={newVendor.contactPerson}
                    onChange={(e) => setNewVendor(prev => ({ ...prev, contactPerson: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="form-group">
                    <label htmlFor="ven-form-email">Email Address</label>
                    <input
                      id="ven-form-email"
                      type="email"
                      className="input-field"
                      placeholder="e.g. contact@cisco.et"
                      value={newVendor.email}
                      onChange={(e) => setNewVendor(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="ven-form-phone">Contact Phone Number</label>
                    <input
                      id="ven-form-phone"
                      type="text"
                      className="input-field"
                      placeholder="e.g. +251-11-XXXXXXX"
                      value={newVendor.phone}
                      onChange={(e) => setNewVendor(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="form-group">
                    <label htmlFor="ven-form-start">Contract Start Date</label>
                    <input
                      id="ven-form-start"
                      type="date"
                      className="input-field"
                      value={newVendor.contractStart}
                      onChange={(e) => setNewVendor(prev => ({ ...prev, contractStart: e.target.value }))}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="ven-form-end">Contract End Date</label>
                    <input
                      id="ven-form-end"
                      type="date"
                      className="input-field"
                      value={newVendor.contractEnd}
                      onChange={(e) => setNewVendor(prev => ({ ...prev, contractEnd: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="ven-form-sla">SLA Performance Status</label>
                  <select
                    id="ven-form-sla"
                    className="input-field"
                    value={newVendor.slaStatus}
                    onChange={(e) => setNewVendor(prev => ({ ...prev, slaStatus: e.target.value }))}
                  >
                    <option value="Active Compliant">Active Compliant</option>
                    <option value="At Risk">At Risk</option>
                    <option value="No SLA">No SLA</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="ven-form-cond">SLA Obligations (One per line)</label>
                  <textarea
                    id="ven-form-cond"
                    className="input-field"
                    rows={3}
                    placeholder="Uptime SLA 99.9%&#10;Onsite resolution within 2 hours"
                    value={newVendor.slaConditionsText}
                    onChange={(e) => setNewVendor(prev => ({ ...prev, slaConditionsText: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="ven-form-notes">Account Scope / Internal Notes</label>
                  <textarea
                    id="ven-form-notes"
                    className="input-field"
                    rows={3}
                    placeholder="Describe specific products provided or escalation contact info..."
                    value={newVendor.notes}
                    onChange={(e) => setNewVendor(prev => ({ ...prev, notes: e.target.value }))}
                  />
                </div>
              </div>
              <div className="drawer-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setActiveForm(null)}>{t('cancel')}</button>
                <button type="submit" className="btn btn-primary">Save Vendor</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
