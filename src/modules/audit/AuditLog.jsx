import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../services/api';
import { Search, ShieldAlert, Calendar, Filter } from 'lucide-react';

export const AuditLog = () => {
  const { user } = useAuth();
  const { t } = useLanguage();

  const [searchTerm, setSearchTerm] = useState('');
  const [moduleFilter, setModuleFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [audits, setAudits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');

  const fetchAudits = async () => {
    try {
      const res = await api.getAuditLogs();
      if (!res?.success || !Array.isArray(res.data)) {
        throw new Error(res?.message || 'Invalid audit log response.');
      }
      setAudits(res.data.map((log) => ({
        id: log.id,
        timestamp: new Date(log.timestamp).toLocaleString(),
        user: log.userRole || 'System',
        action: log.details || log.action,
        module: log.module,
        ipAddress: log.ipAddress,
        severity: log.action.includes('DELETE') ? 'Warning' : 'Info'
      })));
      setFetchError('');
    } catch (err) {
      setFetchError(err.message || 'Failed to load audit logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAudits();
    const refreshTimer = window.setInterval(fetchAudits, 3000);
    return () => window.clearInterval(refreshTimer);
  }, []);

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
              <option value="Auth">Auth</option>
              <option value="Users">Users</option>
              <option value="Assets">Assets</option>
              <option value="Helpdesk">Helpdesk</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Network">Network</option>
              <option value="Systems">Systems</option>
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
            {loading ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                  Loading live audit events...
                </td>
              </tr>
            ) : fetchError ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', color: 'var(--status-danger)', padding: '2rem' }}>
                  {fetchError}
                </td>
              </tr>
            ) : filteredAudits.length === 0 ? (
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
