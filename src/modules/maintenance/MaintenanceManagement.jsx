import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Plus, Wrench, CheckSquare, Calendar, Users, ShieldAlert, X } from 'lucide-react';

export const MaintenanceManagement = () => {
  const { user, canEdit } = useAuth();
  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState('Scheduled');
  const [selectedTask, setSelectedTask] = useState(null);
  const [activeForm, setActiveForm] = useState(null);

  // Mock list of maintenance logs
  const [maintenanceList, setMaintenanceList] = useState([
    {
      id: 'maint-1',
      title: 'Quarterly Server Dust Cleaning & Backup Test',
      assetTag: 'OSTA-2026-002',
      assetName: 'Dell PowerEdge R740 Server',
      type: 'Preventive',
      technician: 'Chala Gemechu',
      status: 'Pending',
      date: '2026-08-15',
      checklist: [
        'Perform complete database snapshot backup',
        'Verify secondary power source (UPS) battery health',
        'Shutdown server and blow out dust from ventilation fan ducts',
        'Boot up server, run hardware self-diagnostics checks'
      ],
      remarks: 'Standard hardware lifespan preservation maintenance'
    },
    {
      id: 'maint-2',
      title: 'Switch Port #12 Re-cabling & Patching',
      assetTag: 'OSTA-2026-003',
      assetName: 'Cisco Catalyst 9300 Switch',
      type: 'Corrective',
      technician: 'Chala Gemechu',
      status: 'Completed',
      date: '2026-07-20',
      durationHours: 2.5,
      cost: '45 USD',
      remarks: 'Cat-6 Ethernet cable port termination had decayed. Replaced cable and patch panel jack. Tested OK.'
    },
    {
      id: 'maint-3',
      title: 'East Shewa Zone UPS Battery Replacement',
      assetTag: 'OSTA-2026-003',
      assetName: 'Cisco Catalyst 9300 Switch', // Associated with the zone stack
      type: 'Corrective',
      technician: 'Lensa Kebede',
      status: 'Overdue',
      date: '2026-07-10',
      remarks: 'UPS backup fails immediately when power is lost. New 12V batteries ordered but delivery is delayed.'
    },
    {
      id: 'maint-4',
      title: 'Monthly OS Patching & Security Audit',
      assetTag: 'OSTA-2026-001',
      assetName: 'HP EliteBook 840 G8 Laptop',
      type: 'Preventive',
      technician: 'Almaz Tolosa',
      status: 'Completed',
      date: '2026-07-25',
      durationHours: 1,
      checklist: ['Apply latest Windows security patches', 'Run antivirus scan', 'Verify firewalls are enabled'],
      remarks: 'Standard monthly compliance checklist'
    }
  ]);

  // Form input states
  const [schedForm, setSchedForm] = useState({
    title: '',
    assetTag: '',
    assetName: '',
    technician: '',
    date: '',
    checklistText: '',
    remarks: ''
  });

  const [corrForm, setCorrForm] = useState({
    title: '',
    assetTag: '',
    assetName: '',
    technician: '',
    date: '',
    durationHours: 1,
    cost: '',
    remarks: ''
  });

  const scheduledTasks = maintenanceList.filter(item => item.type === 'Preventive');
  const correctiveLogs = maintenanceList.filter(item => item.type === 'Corrective');

  const handleScheduleSubmit = (e) => {
    e.preventDefault();
    if (!schedForm.title || !schedForm.date) return;

    const newTask = {
      id: `maint-${maintenanceList.length + 1}`,
      title: schedForm.title,
      assetTag: schedForm.assetTag || 'N/A',
      assetName: schedForm.assetName || 'Unspecified Asset',
      type: 'Preventive',
      technician: schedForm.technician || user?.name || 'Unassigned',
      status: 'Pending',
      date: schedForm.date,
      checklist: schedForm.checklistText.split('\n').filter(line => line.trim() !== ''),
      remarks: schedForm.remarks
    };

    setMaintenanceList(prev => [newTask, ...prev]);
    setActiveForm(null);
    setSchedForm({ title: '', assetTag: '', assetName: '', technician: '', date: '', checklistText: '', remarks: '' });
  };

  const handleCorrectiveSubmit = (e) => {
    e.preventDefault();
    if (!corrForm.title || !corrForm.date) return;

    const newLog = {
      id: `maint-${maintenanceList.length + 1}`,
      title: corrForm.title,
      assetTag: corrForm.assetTag || 'N/A',
      assetName: corrForm.assetName || 'Unspecified Asset',
      type: 'Corrective',
      technician: corrForm.technician || user?.name || 'Unassigned',
      status: 'Completed',
      date: corrForm.date,
      durationHours: Number(corrForm.durationHours),
      cost: corrForm.cost || '0 USD',
      remarks: corrForm.remarks
    };

    setMaintenanceList(prev => [newLog, ...prev]);
    setActiveForm(null);
    setCorrForm({ title: '', assetTag: '', assetName: '', technician: '', date: '', durationHours: 1, cost: '', remarks: '' });
  };

  const handleMarkCompleted = (task) => {
    const today = new Date().toISOString().split('T')[0];
    const updated = maintenanceList.map(item => {
      if (item.id === task.id) {
        return {
          ...item,
          status: 'Completed',
          date: today,
          remarks: item.remarks ? `${item.remarks} (Marked completed on ${today})` : `Completed on ${today}`
        };
      }
      return item;
    });
    setMaintenanceList(updated);
    if (selectedTask && selectedTask.id === task.id) {
      setSelectedTask(prev => prev ? { ...prev, status: 'Completed', date: today } : null);
    }
  };

  const isWriteAllowed = canEdit('maintenance');
  const activeList = activeTab === 'Scheduled' ? scheduledTasks : correctiveLogs;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div className="page-header">
        <div>
          <h1>{t('maintenance')}</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Schedule hardware preventive checkups and log active repair operations.
          </p>
        </div>
        {isWriteAllowed && (
          <div className="flex gap-2">
            <button className="btn btn-primary" onClick={() => { setSelectedTask(null); setActiveForm('schedule'); }}>
              <Plus size={16} />
              <span>{t('maint_schedule')}</span>
            </button>
            <button className="btn btn-secondary" style={{ borderColor: 'var(--secondary)', color: 'var(--secondary)' }} onClick={() => { setSelectedTask(null); setActiveForm('corrective_log'); }}>
              <Wrench size={16} />
              <span>{t('maint_log')}</span>
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="tabs-container">
        <button
          className={`tab-btn ${activeTab === 'Scheduled' ? 'active' : ''}`}
          onClick={() => setActiveTab('Scheduled')}
        >
          📅 Preventive Maintenance (Scheduled)
        </button>
        <button
          className={`tab-btn ${activeTab === 'Corrective' ? 'active' : ''}`}
          onClick={() => setActiveTab('Corrective')}
        >
          🔧 Corrective Maintenance Logs
        </button>
      </div>

      {/* Maintenance List Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>{t('maint_type')} / Title</th>
              <th>Asset Target</th>
              <th>{t('maint_technician')}</th>
              <th>{t('date')}</th>
              <th>{t('status')}</th>
              <th>{t('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {activeList.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                  No maintenance items log found.
                </td>
              </tr>
            ) : (
              activeList.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className={`badge ${item.type === 'Preventive' ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '0.6rem' }}>
                        {item.type}
                      </span>
                      <span style={{ fontWeight: 600 }}>{item.title}</span>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{item.assetName}</span>
                    <div style={{ fontSize: '0.75rem', color: 'var(--primary)' }}><code>{item.assetTag}</code></div>
                  </td>
                  <td>{item.technician}</td>
                  <td>{item.date}</td>
                  <td>
                    <span className={`badge ${
                      item.status === 'Completed' ? 'badge-success' : 
                      item.status === 'Overdue' ? 'badge-danger' : 'badge-warning'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <button 
                        className="btn btn-secondary" 
                        style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                        onClick={() => { setSelectedTask(item); setActiveForm('view'); }}
                      >
                        Details
                      </button>
                      {isWriteAllowed && item.status !== 'Completed' && (
                        <button 
                          className="btn btn-primary" 
                          style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                          onClick={() => handleMarkCompleted(item)}
                        >
                          Resolve
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* VIEW MAINTENANCE TASK DRAWER */}
      {activeForm === 'view' && selectedTask && (
        <div className="drawer-overlay" onClick={() => setActiveForm(null)}>
          <div className="drawer" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <h3>Maintenance Activity Details</h3>
              <button className="nav-btn" onClick={() => setActiveForm(null)} aria-label="Close drawer"><X size={18} /></button>
            </div>
            <div className="drawer-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <span className={`badge ${selectedTask.type === 'Preventive' ? 'badge-success' : 'badge-warning'}`}>
                    {selectedTask.type}
                  </span>
                  <h2 style={{ fontSize: '1.2rem', marginTop: '0.5rem' }}>{selectedTask.title}</h2>
                </div>

                <div className="card" style={{ backgroundColor: 'var(--bg-surface-elevated)' }}>
                  <div className="grid grid-cols-2 gap-3" style={{ fontSize: '0.85rem' }}>
                    <div>
                      <strong style={{ color: 'var(--text-secondary)' }}>Target Asset:</strong>
                      <div>{selectedTask.assetName}</div>
                      <code style={{ fontSize: '0.75rem' }}>{selectedTask.assetTag}</code>
                    </div>
                    <div>
                      <strong style={{ color: 'var(--text-secondary)' }}>Responsible Tech:</strong>
                      <div>👤 {selectedTask.technician}</div>
                    </div>
                    <div>
                      <strong style={{ color: 'var(--text-secondary)' }}>Log Date:</strong>
                      <div>📅 {selectedTask.date}</div>
                    </div>
                    <div>
                      <strong style={{ color: 'var(--text-secondary)' }}>Status:</strong>
                      <div>
                        <span className={`badge ${selectedTask.status === 'Completed' ? 'badge-success' : selectedTask.status === 'Overdue' ? 'badge-danger' : 'badge-warning'}`}>
                          {selectedTask.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Corrective Details */}
                {selectedTask.type === 'Corrective' && (
                  <div className="grid grid-cols-2 gap-3" style={{ fontSize: '0.85rem' }}>
                    <div>
                      <strong style={{ color: 'var(--text-secondary)' }}>Resource Cost:</strong>
                      <div>💰 {selectedTask.cost || '0 USD'}</div>
                    </div>
                    <div>
                      <strong style={{ color: 'var(--text-secondary)' }}>Time Expended:</strong>
                      <div>⏱️ {selectedTask.durationHours || 0} Hours</div>
                    </div>
                  </div>
                )}

                {/* Checklist (Preventive) */}
                {selectedTask.checklist && selectedTask.checklist.length > 0 && (
                  <div>
                    <h3 style={{ fontSize: '0.95rem', marginBottom: '0.5rem' }}><CheckSquare size={16} style={{ verticalAlign: 'middle', marginRight: '0.25rem' }} /> Maintenance Checklist</h3>
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                      {selectedTask.checklist.map((item, idx) => (
                        <li key={idx} style={{ fontSize: '0.85rem', display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                          <input 
                            type="checkbox" 
                            checked={selectedTask.status === 'Completed'} 
                            readOnly 
                            style={{ marginTop: '0.25rem' }} 
                            aria-label={`Checklist item ${idx + 1}`}
                          />
                          <span style={{ textDecoration: selectedTask.status === 'Completed' ? 'line-through' : 'none', color: selectedTask.status === 'Completed' ? 'var(--text-muted)' : 'var(--text-primary)' }}>
                            {item}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div>
                  <strong style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Technician Actions & Remarks:</strong>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', marginTop: '0.25rem', padding: '0.75rem', background: 'var(--bg-app)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
                    {selectedTask.remarks || 'No remarks provided.'}
                  </p>
                </div>

                {selectedTask.status !== 'Completed' && isWriteAllowed && (
                  <button 
                    className="btn btn-primary" 
                    onClick={() => handleMarkCompleted(selectedTask)}
                    style={{ marginTop: '1rem', width: '100%' }}
                  >
                    Mark Maintenance as Completed
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SCHEDULE PREVENTIVE MAINTENANCE DRAWER */}
      {activeForm === 'schedule' && (
        <div className="drawer-overlay" onClick={() => setActiveForm(null)}>
          <div className="drawer" onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleScheduleSubmit} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div className="drawer-header">
                <h3>Schedule Preventive Work</h3>
                <button type="button" className="nav-btn" onClick={() => setActiveForm(null)} aria-label="Close drawer"><X size={18} /></button>
              </div>
              <div className="drawer-body">
                <div className="form-group">
                  <label htmlFor="sch-title">Maintenance Task Title *</label>
                  <input
                    id="sch-title"
                    type="text"
                    required
                    className="input-field"
                    placeholder="e.g. Monthly Switch Port Vacuuming"
                    value={schedForm.title}
                    onChange={(e) => setSchedForm(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="form-group">
                    <label htmlFor="sch-asset-name">Asset Name</label>
                    <input
                      id="sch-asset-name"
                      type="text"
                      className="input-field"
                      placeholder="e.g. Cisco Catalyst 9300"
                      value={schedForm.assetName}
                      onChange={(e) => setSchedForm(prev => ({ ...prev, assetName: e.target.value }))}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="sch-asset-tag">Asset Tag</label>
                    <input
                      id="sch-asset-tag"
                      type="text"
                      className="input-field"
                      placeholder="e.g. OSTA-2026-003"
                      value={schedForm.assetTag}
                      onChange={(e) => setSchedForm(prev => ({ ...prev, assetTag: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="form-group">
                    <label htmlFor="sch-date">Scheduled Date *</label>
                    <input
                      id="sch-date"
                      type="date"
                      required
                      className="input-field"
                      value={schedForm.date}
                      onChange={(e) => setSchedForm(prev => ({ ...prev, date: e.target.value }))}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="sch-tech">Assigned Technician</label>
                    <input
                      id="sch-tech"
                      type="text"
                      className="input-field"
                      placeholder="e.g. Chala Gemechu"
                      value={schedForm.technician}
                      onChange={(e) => setSchedForm(prev => ({ ...prev, technician: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="sch-check">Checklist Items (One per line)</label>
                  <textarea
                    id="sch-check"
                    className="input-field"
                    rows={4}
                    placeholder="Perform DB vacuum&#10;Verify logs&#10;Verify backup size"
                    value={schedForm.checklistText}
                    onChange={(e) => setSchedForm(prev => ({ ...prev, checklistText: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="sch-rem">Pre-work Notes / Instructions</label>
                  <textarea
                    id="sch-rem"
                    className="input-field"
                    rows={3}
                    placeholder="Special details about access keys or security permits..."
                    value={schedForm.remarks}
                    onChange={(e) => setSchedForm(prev => ({ ...prev, remarks: e.target.value }))}
                  />
                </div>
              </div>
              <div className="drawer-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setActiveForm(null)}>{t('cancel')}</button>
                <button type="submit" className="btn btn-primary">Schedule Task</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LOG CORRECTIVE MAINTENANCE DRAWER */}
      {activeForm === 'corrective_log' && (
        <div className="drawer-overlay" onClick={() => setActiveForm(null)}>
          <div className="drawer" onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleCorrectiveSubmit} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div className="drawer-header">
                <h3>Log Corrective Maintenance</h3>
                <button type="button" className="nav-btn" onClick={() => setActiveForm(null)} aria-label="Close drawer"><X size={18} /></button>
              </div>
              <div className="drawer-body">
                <div className="form-group">
                  <label htmlFor="cor-title">Failure Issue / Resolution Title *</label>
                  <input
                    id="cor-title"
                    type="text"
                    required
                    className="input-field"
                    placeholder="e.g. Patch cable replacement"
                    value={corrForm.title}
                    onChange={(e) => setCorrForm(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="form-group">
                    <label htmlFor="cor-asset-name">Asset Name</label>
                    <input
                      id="cor-asset-name"
                      type="text"
                      className="input-field"
                      placeholder="e.g. Cisco Catalyst 9300"
                      value={corrForm.assetName}
                      onChange={(e) => setCorrForm(prev => ({ ...prev, assetName: e.target.value }))}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="cor-asset-tag">Asset Tag</label>
                    <input
                      id="cor-asset-tag"
                      type="text"
                      className="input-field"
                      placeholder="e.g. OSTA-2026-003"
                      value={corrForm.assetTag}
                      onChange={(e) => setCorrForm(prev => ({ ...prev, assetTag: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="form-group">
                    <label htmlFor="cor-date">Completion Date *</label>
                    <input
                      id="cor-date"
                      type="date"
                      required
                      className="input-field"
                      value={corrForm.date}
                      onChange={(e) => setCorrForm(prev => ({ ...prev, date: e.target.value }))}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="cor-hours">Hours Spent</label>
                    <input
                      id="cor-hours"
                      type="number"
                      min={0.5}
                      step={0.5}
                      className="input-field"
                      value={corrForm.durationHours}
                      onChange={(e) => setCorrForm(prev => ({ ...prev, durationHours: Number(e.target.value) }))}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="cor-cost">Parts Cost</label>
                    <input
                      id="cor-cost"
                      type="text"
                      className="input-field"
                      placeholder="e.g. 50 USD"
                      value={corrForm.cost}
                      onChange={(e) => setCorrForm(prev => ({ ...prev, cost: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="cor-tech">Responsible Tech</label>
                  <input
                    id="cor-tech"
                    type="text"
                    className="input-field"
                    placeholder="e.g. Chala Gemechu"
                    value={corrForm.technician}
                    onChange={(e) => setCorrForm(prev => ({ ...prev, technician: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="cor-rem">Resolution Actions & Remarks *</label>
                  <textarea
                    id="cor-rem"
                    className="input-field"
                    required
                    rows={4}
                    placeholder="Describe failure details and actions taken to resolve the incident..."
                    value={corrForm.remarks}
                    onChange={(e) => setCorrForm(prev => ({ ...prev, remarks: e.target.value }))}
                  />
                </div>
              </div>
              <div className="drawer-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setActiveForm(null)}>{t('cancel')}</button>
                <button type="submit" className="btn btn-warning">Save Log</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
