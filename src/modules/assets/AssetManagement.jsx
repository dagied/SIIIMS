import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../services/api';
import { minLength, positiveNumber, required, firstError } from '../../utils/validation';
import { Plus, Search, ArrowLeftRight, Trash2, Eye, X } from 'lucide-react';

export const AssetManagement = () => {
  const { user, canEdit } = useAuth();
  const { t } = useLanguage();

  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formError, setFormError] = useState('');
  const [fetchError, setFetchError] = useState('');

  const fetchAssets = async () => {
    try {
      setLoading(true);
      setFetchError('');
      const res = await api.getAssets();
      if (res?.success && Array.isArray(res.data)) {
        // Map API objects to frontend asset model format if needed
        const mapped = res.data.map(a => ({
          id: a.id,
          tag: a.tagId || a.tag || `OSTA-${a.id}`,
          name: a.name,
          serial: a.serialNumber || a.serial || 'N/A',
          category: a.category || 'Computers',
          zone: a.zone || 'Headquarters',
          status: a.status || 'Active',
          location: a.location || a.zone || 'Headquarters',
          owner: a.assignedTo || 'Unassigned',
          model: a.model || 'Generic',
          purchaseDate: a.purchaseDate ? new Date(a.purchaseDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          price: a.cost ? `${a.cost} USD` : 'N/A',
          history: [
            { date: new Date().toISOString().split('T')[0], action: 'Asset Registered', user: user?.username || 'system', notes: 'Persisted in PostgreSQL database' }
          ]
        }));
        setAssets(mapped);
      } else {
        setAssets([]);
        setFetchError(res?.message || 'No assets were returned from the server.');
      }
    } catch (err) {
      console.warn('[AssetManagement] Failed to fetch assets from server:', err);
      setAssets([]);
      setFetchError(err.message || 'Failed to load assets from the server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  // Filtering & Pagination State
  const [searchTerm, setSearchTerm] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Selected asset for view or action drawers
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [activeForm, setActiveForm] = useState(null);

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
    const matchesSearch = 
      (asset.name && asset.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (asset.serial && asset.serial.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (asset.tag && asset.tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (asset.owner && asset.owner.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCat = catFilter === '' || asset.category === catFilter;
    const matchesStatus = statusFilter === '' || asset.status === statusFilter;

    return matchesSearch && matchesCat && matchesStatus;
  });

  // Paginated assets
  const totalPages = Math.ceil(filteredAssets.length / itemsPerPage) || 1;
  const paginatedAssets = filteredAssets.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    const validationError = firstError(
      required(newAsset.name, 'Asset name'),
      minLength(newAsset.name, 2, 'Asset name'),
      required(newAsset.serial, 'Serial number'),
      required(newAsset.location, 'Asset location'),
      newAsset.price ? positiveNumber(newAsset.price, 'Asset cost', true) : ''
    );
    if (validationError) {
      setFormError(validationError);
      return;
    }

    try {
      const payload = {
        name: newAsset.name,
        serialNumber: newAsset.serial || `SN-${Date.now()}`,
        category: newAsset.category || 'Computers',
        location: newAsset.location || 'Headquarters',
        assignedTo: newAsset.owner || 'Unassigned',
        model: newAsset.model || 'Generic',
        cost: newAsset.price ? parseFloat(newAsset.price) : 0,
        status: 'In Store',
        condition: 'Good'
      };

      const res = await api.createAsset(payload);
      if (res && res.success) {
        setActiveForm(null);
        setNewAsset({ name: '', serial: '', category: 'Computers', location: '', owner: '', model: '', price: '' });
        await fetchAssets();
      }
    } catch (err) {
      console.error('[AssetManagement] Failed to register asset:', err);
      setFormError(err.message || 'Failed to register asset.');
    }
  };


  const handleTransferSubmit = (e) => {
    e.preventDefault();
    const validationError = firstError(
      selectedAsset ? '' : 'Select an asset to transfer.',
      required(transferTarget.location, 'Transfer location')
    );
    if (validationError) {
      setFormError(validationError);
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    const updatedAssets = assets.map(asset => {
      if (asset.id === selectedAsset.id) {
        return {
          ...asset,
          location: transferTarget.location,
          owner: transferTarget.owner || asset.owner,
          status: 'Transferred',
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

  const handleDisposeSubmit = (e) => {
    e.preventDefault();
    const validationError = firstError(
      selectedAsset ? '' : 'Select an asset to dispose.',
      required(disposeReason.reason, 'Disposal reason')
    );
    if (validationError) {
      setFormError(validationError);
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    const updatedAssets = assets.map(asset => {
      if (asset.id === selectedAsset.id) {
        return {
          ...asset,
          status: 'Disposed',
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
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            Loading assets from database...
          </div>
        ) : fetchError ? (
          <div className="badge badge-danger" style={{ display: 'block', padding: '1rem', whiteSpace: 'normal' }}>
            {fetchError}
          </div>
        ) : <table>
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
        </table>}
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
                {formError && (
                  <div className="badge badge-danger" style={{ display: 'block', padding: '0.75rem 1rem', marginBottom: '1rem', whiteSpace: 'normal' }}>
                    {formError}
                  </div>
                )}
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
                {formError && <div className="badge badge-danger" style={{ display: 'block', padding: '0.75rem', marginBottom: '1rem', whiteSpace: 'normal' }}>{formError}</div>}
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
                {formError && <div className="badge badge-danger" style={{ display: 'block', padding: '0.75rem', marginBottom: '1rem', whiteSpace: 'normal' }}>{formError}</div>}
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
