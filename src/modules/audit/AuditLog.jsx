import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Search, ShieldAlert, Calendar, Filter } from 'lucide-react';

export const AuditLog = () => {
  const { user } = useAuth();
  const { t } = useLanguage();

  const [searchTerm, setSearchTerm] = useState('');
  const [moduleFilter, setModuleFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');

  // Mock list of global audit trail logs
  const [audits] = useState([
    {
      id: 'aud-1',
      timestamp: '2026-07-28 15:30:12',
      user: 'admin_almaz',
      action: 'Suspended user account: tola_suspended',
      module: 'User Management',
      ipAddress: '192.168.10.45',
      severity: 'Warning'
    },
    {
      id: 'aud-2',
      timestamp: '2026-07-28 14:15:30',
      user: 'tech_chala',
      action: 'Registered new asset: Cisco Catalyst 9300 (OSTA-2026-003)',
      module: 'Assets & Inventory',
      ipAddress: '192.168.10.82',
      severity: 'Info'
    },
    {
      id: 'aud-3',
      timestamp: '2026-07-28 11:22:04',
      user: 'admin_almaz',
      action: 'Modified system permissions mapping for Zonal ICT Focal Person',
      module: 'Security Policy',
      ipAddress: '192.168.10.45',
      severity: 'Critical'
    },
    {
      id: 'aud-4',
      timestamp: '2026-07-28 09:48:51',
      user: 'zone_lensa',
      action: 'Submitted support ticket #403: "Internet failure at East Shewa"',
      module: 'Helpdesk Tickets',
      ipAddress: '10.12.1.25',
      severity: 'Info'
    },
    {
      id: 'aud-5',
      timestamp: '2026-07-27 16:04:10',
      user: 'tech_chala',
      action: 'Marked corrective maintenance task #maint-2 as resolved',
      module: 'Maintenance',
      ipAddress: '192.168.10.82',
      severity: 'Info'
    },
    {
      id: 'aud-6',
      timestamp: '2026-07-27 10:12:00',
      user: 'system_daemon',
      action: 'License key EXP-99 automatic check: 3 days remaining warning',
      module: 'Contracts & Expirations',
      ipAddress: '127.0.0.1',
      severity: 'Critical'
    }
  ]);

  const filteredAudits = audits.filter(log => {
    const matchesSearch = 
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.ipAddress.includes(searchTerm);

    const matchesModule = moduleFilter === '' || log.module === moduleFilter;
    const matchesSeverity = severityFilter === '' || log.severity === severityFilter;

    return matchesSearch && matchesModule && matchesSeverity;
  });

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div className="page-header">
        <div>
          <h1>Global Audit Logs</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Traceability system registry tracking system events, permission updates, and asset modifications.
          </p>
        </div>
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
            <label htmlFor="audit-module-filter" className="sr-only" style={{ display: 'none' }}>System Module</label>
            <select
              id="audit-module-filter"
              className="input-field"
              value={moduleFilter}
              onChange={(e) => setModuleFilter(e.target.value)}
              style={{ width: '180px' }}
              aria-label="System Module"
            >
              <option value="">{t('all')} Modules</option>
              <option value="User Management">User Management</option>
              <option value="Assets & Inventory">Assets & Inventory</option>
              <option value="Security Policy">Security Policy</option>
              <option value="Helpdesk Tickets">Helpdesk Tickets</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Contracts & Expirations">Contracts & Expirations</option>
            </select>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label htmlFor="audit-severity-filter" className="sr-only" style={{ display: 'none' }}>Severity</label>
            <select
              id="audit-severity-filter"
              className="input-field"
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              style={{ width: '150px' }}
              aria-label="Severity"
            >
              <option value="">{t('all')} Severities</option>
              <option value="Info">Info</option>
              <option value="Warning">Warning</option>
              <option value="Critical">Critical</option>
            </select>
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Operator User</th>
              <th>Action Description</th>
              <th>System Module</th>
              <th>Terminal IP Address</th>
              <th>Severity</th>
            </tr>
          </thead>
          <tbody>
            {filteredAudits.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                  No matching log entries found in registry database.
                </td>
              </tr>
            ) : (
              filteredAudits.map((log) => (
                <tr key={log.id}>
                  <td>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--mono)' }}>
                      📅 {log.timestamp}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600 }}>👤 {log.user}</td>
                  <td>{log.action}</td>
                  <td>
                    <span className="badge badge-info" style={{ textTransform: 'none' }}>{log.module}</span>
                  </td>
                  <td><code style={{ fontSize: '0.75rem' }}>{log.ipAddress}</code></td>
                  <td>
                    <span className={`badge ${
                      log.severity === 'Critical' ? 'badge-danger' : 
                      log.severity === 'Warning' ? 'badge-warning' : 'badge-success'
                    }`}>
                      {log.severity}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
