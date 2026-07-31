import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Plus, Search, ArrowLeftRight, Trash2, Eye, X } from 'lucide-react';

interface Asset {
  id: string;
  tag: string;
  name: string;
  serial: string;
  category: string;
  status: 'Active' | 'Transferred' | 'Disposed';
  location: string;
  owner: string;
  model: string;
  purchaseDate: string;
  price: string;
  history: Array<{ date: string; action: string; user: string; notes: string }>;
}

export const AssetManagement: React.FC = () => {
  const { user, canEdit } = useAuth();
  const { t } = useLanguage();

  // Mock initial assets list
  const [assets, setAssets] = useState<Asset[]>([
    {
      id: 'ast-1',
      tag: 'OSTA-2026-001',
      name: 'HP EliteBook 840 G8 Laptop',
      serial: '5CG1248FGT',
      category: 'Computers',
      status: 'Active',
      location: 'Adama Headquarters',
      owner: 'Dr. Kenenisa Bekele',
      model: 'EliteBook 840 G8',
      purchaseDate: '2026-01-10',
      price: '1,200 USD',
      history: [
        { date: '2026-01-10', action: 'Asset Registered', user: 'admin_almaz', notes: 'Initial intake registration' },
        { date: '2026-01-12', action: 'Assigned to Executive', user: 'admin_almaz', notes: 'Deployed for executive viewer use' }
      ]
    },
    {
      id: 'ast-2',
      tag: 'OSTA-2026-002',
      name: 'Dell PowerEdge R740 Server',
      serial: 'DELL-98XFGH2',
      category: 'Servers',
      status: 'Active',
      location: 'HQ Data Center',
      owner: 'Infrastructure Department',
      model: 'PowerEdge R740',
      purchaseDate: '2025-11-05',
      price: '8,500 USD',
      history: [
        { date: '2025-11-05', action: 'Asset Registered', user: 'admin_almaz', notes: 'Server intake for virtualization rack' }
      ]
    },
    {
      id: 'ast-3',
      tag: 'OSTA-2026-003',
      name: 'Cisco Catalyst 9300 Switch',
      serial: 'CSCO-SW4412',
      category: 'Network Devices',
      status: 'Active',
      location: 'East Shewa Zone',
      owner: 'Zonal ICT Desk',
      model: 'Catalyst 9300',
      purchaseDate: '2026-02-15',
      price: '3,200 USD',
      history: [
        { date: '2026-02-15', action: 'Asset Registered', user: 'tech_chala', notes: 'Registered at central store' },
        { date: '2026-02-20', action: 'Transferred to Zone', user: 'tech_chala', notes: 'Shipped to East Shewa Zone Office' }
      ]
    },
    {
      id: 'ast-4',
      tag: 'OSTA-2026-004',
      name: 'Lenovo ThinkCentre M70q Desktop',
      serial: 'MJ09EX41',
      category: 'Computers',
      status: 'Transferred',
      location: 'Bale Zone Office',
      owner: 'Regional Staff',
      model: 'ThinkCentre M70q',
      purchaseDate: '2024-05-12',
      price: '850 USD',
      history: [
        { date: '2024-05-12', action: 'Asset Registered', user: 'admin_almaz', notes: 'Standard office workstation setup' },
        { date: '2026-04-10', action: 'Transferred', user: 'zone_lensa', notes: 'Moved from Adama main office to Bale' }
      ]
    },
    {
      id: 'ast-5',
      tag: 'OSTA-2026-005',
      name: 'Epson L3150 Wi-Fi Printer',
      serial: 'EPS-PRNT9922',
      category: 'Peripherals',
      status: 'Disposed',
      location: 'Bishoftu Desk',
      owner: 'Finance Department',
      model: 'L3150 EcoTank',
      purchaseDate: '2023-08-20',
      price: '320 USD',
      history: [
        { date: '2023-08-20', action: 'Asset Registered', user: 'admin_almaz', notes: 'Finance desktop printer' },
        { date: '2026-07-01', action: 'Asset Disposed', user: 'tech_chala', notes: 'Defective printhead, cost of repairs exceeded value.' }
      ]
    }
  ]);

  // Filtering & Pagination State
  const [searchTerm, setSearchTerm] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  // Selected asset for view or action drawers
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [activeForm, setActiveForm] = useState<'register' | 'transfer' | 'dispose' | 'view' | null>(null);

  // New Asset input form state
  const [newAsset, setNewAsset] = useState({
    name: '',
    serial: '',
    category: 'Computers',
    location: '',
    owner: '',
    model: '',
    price: ''
  });

  // Action input states
  const [transferTarget, setTransferTarget] = useState({ location: '', owner: '', notes: '' });
  const [disposeReason, setDisposeReason] = useState({ reason: '', notes: '' });

  // Filtered Assets
  const filteredAssets = assets.filter(asset => {
    // If Zonal user, they only view assets assigned to their branch/zone or region
    if (user?.role === 'Zonal ICT Focal Person' && !asset.location.includes(user.zone || '')) {
      return false;
    }
    // Search query match
    const matchesSearch = 
      asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.serial.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.tag.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.owner.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCat = catFilter === '' || asset.category === catFilter;
    const matchesStatus = statusFilter === '' || asset.status === statusFilter;

    return matchesSearch && matchesCat && matchesStatus;
  });

  // Paginated assets
  const totalPages = Math.ceil(filteredAssets.length / itemsPerPage);
  const paginatedAssets = filteredAssets.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAsset.name || !newAsset.serial) return;

    const newId = `ast-${assets.length + 1}`;
    const newTag = `OSTA-2026-0${assets.length + 1}`;
    const today = new Date().toISOString().split('T')[0];

    const assetEntry: Asset = {
      id: newId,
      tag: newTag,
      name: newAsset.name,
      serial: newAsset.serial,
      category: newAsset.category,
      status: 'Active',
      location: newAsset.location || 'Adama Headquarters',
      owner: newAsset.owner || 'Unassigned',
      model: newAsset.model || 'Generic Model',
      purchaseDate: today,
      price: newAsset.price || 'N/A',
      history: [
        { date: today, action: 'Asset Registered', user: user?.username || 'system', notes: 'Initial intake registration' }
      ]
    };

    setAssets(prev => [assetEntry, ...prev]);
    setActiveForm(null);
    // Reset form
    setNewAsset({ name: '', serial: '', category: 'Computers', location: '', owner: '', model: '', price: '' });
  };

  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAsset || !transferTarget.location) return;

    const today = new Date().toISOString().split('T')[0];
    const updatedAssets = assets.map(asset => {
      if (asset.id === selectedAsset.id) {
        return {
          ...asset,
          location: transferTarget.location,
          owner: transferTarget.owner || asset.owner,
          status: 'Transferred' as const,
          history: [
            ...asset.history,
            {
              date: today,
              action: `Transferred to ${transferTarget.location}`,
              user: user?.username || 'system',
              notes: transferTarget.notes || 'Asset transfer logged'
            }
          ]
        };
      }
      return asset;
    });

    setAssets(updatedAssets);
    setActiveForm(null);
    setSelectedAsset(null);
    setTransferTarget({ location: '', owner: '', notes: '' });
  };

  const handleDisposeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAsset || !disposeReason.reason) return;

    const today = new Date().toISOString().split('T')[0];
    const updatedAssets = assets.map(asset => {
      if (asset.id === selectedAsset.id) {
        return {
          ...asset,
          status: 'Disposed' as const,
          history: [
            ...asset.history,
            {
              date: today,
              action: `Asset Disposed: ${disposeReason.reason}`,
              user: user?.username || 'system',
              notes: disposeReason.notes || 'Asset retired from inventory'
            }
          ]
        };
      }
      return asset;
    });

    setAssets(updatedAssets);
    setActiveForm(null);
    setSelectedAsset(null);
    setDisposeReason({ reason: '', notes: '' });
  };

  const isWriteAllowed = canEdit('assets');

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div className="page-header">
        <div>
          <h1>{t('assets')}</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Manage and audit ICT equipment, computers, servers, and devices.
          </p>
        </div>
        {isWriteAllowed && (
          <button className="btn btn-primary" onClick={() => { setActiveForm('register'); setSelectedAsset(null); }}>
            <Plus size={18} />
            <span>{t('asset_register')}</span>
          </button>
        )}
      </div>

      {/* Filter panel */}
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
            <label htmlFor="cat-filter" className="sr-only" style={{ display: 'none' }}>Category</label>
            <select
              id="cat-filter"
              className="input-field"
              value={catFilter}
              onChange={(e) => setCatFilter(e.target.value)}
              style={{ width: '160px' }}
              aria-label="Category Filter"
            >
              <option value="">{t('all')} Categories</option>
              <option value="Computers">Computers</option>
              <option value="Servers">Servers</option>
              <option value="Network Devices">Network Devices</option>
              <option value="Peripherals">Peripherals</option>
            </select>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label htmlFor="status-filter" className="sr-only" style={{ display: 'none' }}>Status</label>
            <select
              id="status-filter"
              className="input-field"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ width: '150px' }}
              aria-label="Status Filter"
            >
              <option value="">{t('all')} Statuses</option>
              <option value="Active">Active</option>
              <option value="Transferred">Transferred</option>
              <option value="Disposed">Disposed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Asset Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>{t('asset_tag')}</th>
              <th>{t('asset_name')}</th>
              <th>{t('asset_serial')}</th>
              <th>{t('asset_category')}</th>
              <th>{t('status')}</th>
              <th>{t('asset_location')}</th>
              <th>Owner</th>
              <th>{t('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {paginatedAssets.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                  No assets found.
                </td>
              </tr>
            ) : (
              paginatedAssets.map((asset) => (
                <tr key={asset.id}>
                  <td style={{ fontWeight: 600, color: 'var(--primary)' }}>{asset.tag}</td>
                  <td>{asset.name}</td>
                  <td><code style={{ fontSize: '0.8rem' }}>{asset.serial}</code></td>
                  <td>{asset.category}</td>
                  <td>
                    <span className={`badge ${
                      asset.status === 'Active' ? 'badge-success' : 
                      asset.status === 'Transferred' ? 'badge-warning' : 'badge-danger'
                    }`}>
                      {asset.status}
                    </span>
                  </td>
                  <td>{asset.location}</td>
                  <td>{asset.owner}</td>
                  <td>
                    <div className="flex gap-2">
                      <button 
                        className="btn btn-secondary" 
                        style={{ padding: '4px 8px' }}
                        onClick={() => { setSelectedAsset(asset); setActiveForm('view'); }}
                        title={t('view')}
                        aria-label={`View details of ${asset.name}`}
                      >
                        <Eye size={14} />
                      </button>
                      {isWriteAllowed && asset.status !== 'Disposed' && (
                        <>
                          <button 
                            className="btn btn-secondary" 
                            style={{ padding: '4px 8px', borderColor: 'var(--secondary)' }}
                            onClick={() => { setSelectedAsset(asset); setActiveForm('transfer'); }}
                            title={t('asset_transfer')}
                            aria-label={`Transfer ${asset.name}`}
                          >
                            <ArrowLeftRight size={14} style={{ color: 'var(--secondary)' }} />
                          </button>
                          <button 
                            className="btn btn-secondary" 
                            style={{ padding: '4px 8px', borderColor: 'var(--status-danger)' }}
                            onClick={() => { setSelectedAsset(asset); setActiveForm('dispose'); }}
                            title={t('asset_dispose')}
                            aria-label={`Dispose ${asset.name}`}
                          >
                            <Trash2 size={14} style={{ color: 'var(--status-danger)' }} />
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
      </div>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="pagination">
          <span className="pagination-text">
            Showing Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> ({filteredAssets.length} total assets)
          </span>
          <div className="flex gap-2">
            <button 
              className="btn btn-secondary" 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <button 
              className="btn btn-secondary" 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* VIEW DETAILS DRAWER */}
      {activeForm === 'view' && selectedAsset && (
        <div className="drawer-overlay" onClick={() => setActiveForm(null)}>
          <div className="drawer" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <h3>Asset Details</h3>
              <button className="nav-btn" onClick={() => setActiveForm(null)} aria-label="Close drawer"><X size={18} /></button>
            </div>
            <div className="drawer-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
                  <h4 style={{ color: 'var(--primary)', marginBottom: '0.25rem' }}>{selectedAsset.tag}</h4>
                  <h2 style={{ fontSize: '1.25rem' }}>{selectedAsset.name}</h2>
                  <span className={`badge ${selectedAsset.status === 'Active' ? 'badge-success' : selectedAsset.status === 'Transferred' ? 'badge-warning' : 'badge-danger'}`} style={{ marginTop: '0.5rem' }}>
                    {selectedAsset.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4" style={{ fontSize: '0.9rem' }}>
                  <div>
                    <strong style={{ color: 'var(--text-secondary)' }}>Brand / Model:</strong>
                    <div>{selectedAsset.model}</div>
                  </div>
                  <div>
                    <strong style={{ color: 'var(--text-secondary)' }}>Serial Number:</strong>
                    <div><code>{selectedAsset.serial}</code></div>
                  </div>
                  <div>
                    <strong style={{ color: 'var(--text-secondary)' }}>Category:</strong>
                    <div>{selectedAsset.category}</div>
                  </div>
                  <div>
                    <strong style={{ color: 'var(--text-secondary)' }}>Purchase Date:</strong>
                    <div>{selectedAsset.purchaseDate}</div>
                  </div>
                  <div>
                    <strong style={{ color: 'var(--text-secondary)' }}>Current Location:</strong>
                    <div>📍 {selectedAsset.location}</div>
                  </div>
                  <div>
                    <strong style={{ color: 'var(--text-secondary)' }}>Owner:</strong>
                    <div>👤 {selectedAsset.owner}</div>
                  </div>
                </div>

                <div style={{ marginTop: '1.5rem' }}>
                  <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>{t('asset_history')}</h3>
                  <div className="timeline">
                    {selectedAsset.history.map((log, idx) => (
                      <div className="timeline-item" key={idx}>
                        <div className="timeline-dot" />
                        <div className="timeline-content">
                          <div className="timeline-time">{log.date} by {log.user}</div>
                          <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{log.action}</div>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{log.notes}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REGISTER ASSET DRAWER */}
      {activeForm === 'register' && (
        <div className="drawer-overlay" onClick={() => setActiveForm(null)}>
          <div className="drawer" onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div className="drawer-header">
                <h3>{t('asset_register')}</h3>
                <button type="button" className="nav-btn" onClick={() => setActiveForm(null)} aria-label="Close drawer"><X size={18} /></button>
              </div>
              <div className="drawer-body">
                <div className="form-group">
                  <label htmlFor="reg-name">{t('asset_name')} *</label>
                  <input
                    id="reg-name"
                    type="text"
                    required
                    className="input-field"
                    placeholder="e.g. Dell Latitude 5420 Laptop"
                    value={newAsset.name}
                    onChange={(e) => setNewAsset(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="reg-serial">{t('asset_serial')} *</label>
                  <input
                    id="reg-serial"
                    type="text"
                    required
                    className="input-field"
                    placeholder="e.g. CN-0XDFG2"
                    value={newAsset.serial}
                    onChange={(e) => setNewAsset(prev => ({ ...prev, serial: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="form-group">
                    <label htmlFor="reg-cat">{t('asset_category')}</label>
                    <select
                      id="reg-cat"
                      className="input-field"
                      value={newAsset.category}
                      onChange={(e) => setNewAsset(prev => ({ ...prev, category: e.target.value }))}
                    >
                      <option value="Computers">Computers</option>
                      <option value="Servers">Servers</option>
                      <option value="Network Devices">Network Devices</option>
                      <option value="Peripherals">Peripherals</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="reg-model">Model / Brand</label>
                    <input
                      id="reg-model"
                      type="text"
                      className="input-field"
                      placeholder="e.g. Latitude 5420"
                      value={newAsset.model}
                      onChange={(e) => setNewAsset(prev => ({ ...prev, model: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="reg-loc">{t('asset_location')}</label>
                  <input
                    id="reg-loc"
                    type="text"
                    className="input-field"
                    placeholder="e.g. Adama Headquarters"
                    value={newAsset.location}
                    onChange={(e) => setNewAsset(prev => ({ ...prev, location: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="reg-owner">Current Owner / Assigned User</label>
                  <input
                    id="reg-owner"
                    type="text"
                    className="input-field"
                    placeholder="e.g. Ebise Gemeda"
                    value={newAsset.owner}
                    onChange={(e) => setNewAsset(prev => ({ ...prev, owner: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="reg-price">Purchase Price</label>
                  <input
                    id="reg-price"
                    type="text"
                    className="input-field"
                    placeholder="e.g. 980 USD"
                    value={newAsset.price}
                    onChange={(e) => setNewAsset(prev => ({ ...prev, price: e.target.value }))}
                  />
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

      {/* TRANSFER ASSET DRAWER */}
      {activeForm === 'transfer' && selectedAsset && (
        <div className="drawer-overlay" onClick={() => setActiveForm(null)}>
          <div className="drawer" onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleTransferSubmit} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div className="drawer-header">
                <h3>{t('asset_transfer')}</h3>
                <button type="button" className="nav-btn" onClick={() => setActiveForm(null)} aria-label="Close drawer"><X size={18} /></button>
              </div>
              <div className="drawer-body">
                <div style={{ marginBottom: '1.5rem', backgroundColor: 'var(--bg-surface-elevated)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Currently Transferring:</div>
                  <strong style={{ fontSize: '1rem' }}>{selectedAsset.name}</strong>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Tag: {selectedAsset.tag} | Serial: {selectedAsset.serial}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--primary)', marginTop: '0.25rem' }}>📍 Current Location: {selectedAsset.location}</div>
                </div>

                <div className="form-group">
                  <label htmlFor="trn-loc">Target Location / Zone Branch *</label>
                  <input
                    id="trn-loc"
                    type="text"
                    required
                    className="input-field"
                    placeholder="e.g. Jimma Zonal Branch"
                    value={transferTarget.location}
                    onChange={(e) => setTransferTarget(prev => ({ ...prev, location: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="trn-owner">Target Owner / Assigned Person</label>
                  <input
                    id="trn-owner"
                    type="text"
                    className="input-field"
                    placeholder="e.g. Chala Tolosa"
                    value={transferTarget.owner}
                    onChange={(e) => setTransferTarget(prev => ({ ...prev, owner: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="trn-notes">Transfer Justification Notes</label>
                  <textarea
                    id="trn-notes"
                    className="input-field"
                    rows={4}
                    placeholder="Provide details on why this asset is being re-allocated..."
                    value={transferTarget.notes}
                    onChange={(e) => setTransferTarget(prev => ({ ...prev, notes: e.target.value }))}
                  />
                </div>
              </div>
              <div className="drawer-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setActiveForm(null)}>{t('cancel')}</button>
                <button type="submit" className="btn btn-warning">{t('asset_transfer')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DISPOSE ASSET DRAWER */}
      {activeForm === 'dispose' && selectedAsset && (
        <div className="drawer-overlay" onClick={() => setActiveForm(null)}>
          <div className="drawer" onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleDisposeSubmit} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div className="drawer-header" style={{ borderBottomColor: 'rgba(239, 68, 68, 0.2)' }}>
                <h3 style={{ color: 'var(--status-danger)' }}>⚠️ {t('asset_dispose')}</h3>
                <button type="button" className="nav-btn" onClick={() => setActiveForm(null)} aria-label="Close drawer"><X size={18} /></button>
              </div>
              <div className="drawer-body">
                <div style={{ marginBottom: '1.5rem', backgroundColor: 'var(--status-danger-bg)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--status-danger)' }}>Warning: Disposing of asset retired it from active records:</div>
                  <strong style={{ fontSize: '1rem' }}>{selectedAsset.name}</strong>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Tag: {selectedAsset.tag} | Serial: {selectedAsset.serial}</div>
                </div>

                <div className="form-group">
                  <label htmlFor="disp-reason">Reason for Disposal *</label>
                  <select
                    id="disp-reason"
                    className="input-field"
                    required
                    value={disposeReason.reason}
                    onChange={(e) => setDisposeReason(prev => ({ ...prev, reason: e.target.value }))}
                  >
                    <option value="">Select Reason...</option>
                    <option value="Damaged/Unrepairable">Damaged / Unrepairable</option>
                    <option value="Obsolete/Retired">Obsolete / Outdated technology</option>
                    <option value="Lost/Stolen">Lost / Stolen</option>
                    <option value="Donated">Donated / Transferred externally</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="disp-notes">Disposal Audit Log Notes</label>
                  <textarea
                    id="disp-notes"
                    className="input-field"
                    rows={4}
                    placeholder="Enter write-off or technical assessment reference..."
                    value={disposeReason.notes}
                    onChange={(e) => setDisposeReason(prev => ({ ...prev, notes: e.target.value }))}
                  />
                </div>
              </div>
              <div className="drawer-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setActiveForm(null)}>{t('cancel')}</button>
                <button type="submit" className="btn btn-danger">{t('asset_dispose')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
