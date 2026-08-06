import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Search, Server, Shield, Network, RefreshCw, X, Radio, AlertTriangle } from 'lucide-react';

export const NetworkMonitoring = () => {
  const { user } = useAuth();
  const { t } = useLanguage();

  // Mock list of network devices
  const [devices, setDevices] = useState([
    {
      id: 'net-1',
      name: 'OSTA HQ Core Switch',
      ip: '10.10.1.1',
      mac: '00:1B:44:11:3A:B7',
      type: 'Switch',
      status: 'Online',
      location: 'Adama Headquarters Server Room',
      latency: 12,
      uptime: '45 days, 12 hours',
      ports: Array.from({ length: 24 }, (_, i) => ({
        port: i + 1,
        status: i < 12 ? 'active' : i < 20 ? 'inactive' : 'disabled',
      })),
    },
    {
      id: 'net-2',
      name: 'OSTA Core Gateway Router',
      ip: '10.10.1.254',
      mac: '00:1B:44:11:3C:A9',
      type: 'Router',
      status: 'Online',
      location: 'Adama Headquarters Server Room',
      latency: 8,
      uptime: '124 days, 3 hours',
      ports: [
        { port: 1, status: 'active' },
        { port: 2, status: 'active' },
        { port: 3, status: 'inactive' },
        { port: 4, status: 'disabled' },
      ],
    },
    {
      id: 'net-3',
      name: 'Bale Zone Office Gateway',
      ip: '10.12.10.254',
      mac: '00:1B:44:22:9E:FF',
      type: 'Router',
      status: 'Online',
      location: 'Bale Zone Branch Office',
      latency: 48,
      uptime: '14 days, 1 hour',
      ports: [
        { port: 1, status: 'active' },
        { port: 2, status: 'inactive' },
      ],
    },
    {
      id: 'net-4',
      name: 'Jimma Zone Office Router',
      ip: '10.14.10.254',
      mac: '00:1B:44:33:CF:D1',
      type: 'Router',
      status: 'Degraded',
      location: 'Jimma Zone Branch Office',
      latency: 124,
      uptime: '3 days, 18 hours',
      ports: [
        { port: 1, status: 'active' },
        { port: 2, status: 'active' },
      ],
    },
    {
      id: 'net-5',
      name: 'OSTA Web Hosting Server',
      ip: '10.10.2.20',
      mac: '00:1B:44:11:FA:B1',
      type: 'Server',
      status: 'Online',
      location: 'HQ Data Center Rack B',
      latency: 15,
      uptime: '90 days, 6 hours',
      ports: [
        { port: 1, status: 'active' },
        { port: 2, status: 'active' },
      ],
    },
    {
      id: 'net-6',
      name: 'HQ Ground Floor Access Point',
      ip: '10.10.5.50',
      mac: '00:1B:44:99:AA:C4',
      type: 'Access Point',
      status: 'Offline',
      location: 'Adama HQ Lobby reception',
      latency: 0,
      uptime: '0 days (Offline)',
      ports: [
        { port: 1, status: 'disabled' },
      ],
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Simulate network status refresh
  const triggerRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setDevices(prev => prev.map(dev => {
        if (dev.status === 'Offline') return dev;
        // Randomly tweak latency slightly for simulation realism
        const delta = Math.floor(Math.random() * 9) - 4;
        const newLatency = Math.max(2, dev.latency + delta);
        return {
          ...dev,
          latency: newLatency
        };
      }));
      setIsRefreshing(false);
    }, 1000);
  };

  const filteredDevices = devices.filter(dev => {
    const matchesSearch = 
      dev.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dev.ip.includes(searchTerm) ||
      dev.location.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = typeFilter === '' || dev.type === typeFilter;
    const matchesStatus = statusFilter === '' || dev.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div className="page-header">
        <div>
          <h1>{t('network')}</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Real-time ping latency, connectivity status, and switch interface port telemetry.
          </p>
        </div>
        <button 
          className="btn btn-secondary" 
          onClick={triggerRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw size={16} className={isRefreshing ? 'spin-anim' : ''} />
          <span>{isRefreshing ? 'Pinging Devices...' : 'Refresh Network'}</span>
        </button>
      </div>

      {/* Network Alert Banner if any device is Offline/Degraded */}
      {devices.some(d => d.status === 'Offline' || d.status === 'Degraded') && (
        <div className="badge badge-warning" style={{ 
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
            <strong>Network Issues Detected:</strong> 1 Access Point is Offline; Jimma Zone router latency is abnormally high (124ms).
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
            <label htmlFor="device-type-filter" className="sr-only" style={{ display: 'none' }}>Device Type</label>
            <select
              id="device-type-filter"
              className="input-field"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              style={{ width: '160px' }}
              aria-label="Device Type"
            >
              <option value="">{t('all')} Types</option>
              <option value="Switch">Switch</option>
              <option value="Router">Router</option>
              <option value="Server">Server</option>
              <option value="Access Point">Access Point</option>
            </select>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label htmlFor="network-status-filter" className="sr-only" style={{ display: 'none' }}>Status</label>
            <select
              id="network-status-filter"
              className="input-field"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ width: '150px' }}
              aria-label="Network Status"
            >
              <option value="">{t('all')} Statuses</option>
              <option value="Online">Online</option>
              <option value="Degraded">Degraded</option>
              <option value="Offline">Offline</option>
            </select>
          </div>
        </div>
      </div>

      {/* Network Device Grid */}
      <div className="grid grid-cols-3 gap-4">
        {filteredDevices.map(dev => (
          <div 
            key={dev.id} 
            className="card" 
            style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              justifyContent: 'space-between',
              cursor: 'pointer',
              borderTop: `4px solid ${
                dev.status === 'Online' ? 'var(--status-success)' :
                dev.status === 'Degraded' ? 'var(--secondary)' : 'var(--status-danger)'
              }`
            }}
            onClick={() => setSelectedDevice(dev)}
          >
            <div>
              <div className="flex justify-between align-center" style={{ marginBottom: '0.75rem' }}>
                <span className="badge badge-info" style={{ fontSize: '0.65rem' }}>{dev.type}</span>
                <span className="flex align-center gap-1">
                  <span className="pulsing-dot" style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: dev.status === 'Online' ? 'var(--status-success)' : dev.status === 'Degraded' ? 'var(--secondary)' : 'var(--status-danger)'
                  }} />
                  <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{dev.status}</span>
                </span>
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.25rem' }}>{dev.name}</h3>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                📍 {dev.location}
              </div>
            </div>

            <div style={{ marginTop: '1.25rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>IP: </span>
                <code style={{ fontSize: '0.75rem', fontWeight: 600 }}>{dev.ip}</code>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Ping: </span>
                <span style={{ fontWeight: 600, color: dev.status === 'Online' ? 'var(--status-success)' : dev.status === 'Degraded' ? 'var(--secondary)' : 'var(--status-danger)' }}>
                  {dev.status === 'Offline' ? 'Timed out' : `${dev.latency}ms`}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* DETAIL VIEW DRAWER */}
      {selectedDevice && (
        <div className="drawer-overlay" onClick={() => setSelectedDevice(null)}>
          <div className="drawer" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <h3>Device Telemetry Details</h3>
              <button className="nav-btn" onClick={() => setSelectedDevice(null)} aria-label="Close drawer"><X size={18} /></button>
            </div>
            <div className="drawer-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.25rem' }}>{selectedDevice.name}</h2>
                  <div className="flex align-center gap-2" style={{ marginTop: '0.25rem' }}>
                    <span className="badge badge-info">{selectedDevice.type}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>IP: {selectedDevice.ip}</span>
                  </div>
                </div>

                {/* Performance Box */}
                <div className="card" style={{ backgroundColor: 'var(--bg-surface-elevated)', borderStyle: 'dashed' }}>
                  <div className="grid grid-cols-2 gap-4" style={{ fontSize: '0.85rem' }}>
                    <div>
                      <strong style={{ color: 'var(--text-secondary)' }}>MAC Address:</strong>
                      <div><code>{selectedDevice.mac}</code></div>
                    </div>
                    <div>
                      <strong style={{ color: 'var(--text-secondary)' }}>Active Uptime:</strong>
                      <div>{selectedDevice.uptime}</div>
                    </div>
                    <div>
                      <strong style={{ color: 'var(--text-secondary)' }}>Subnet Mask:</strong>
                      <div>255.255.255.0</div>
                    </div>
                    <div>
                      <strong style={{ color: 'var(--text-secondary)' }}>Default Gateway:</strong>
                      <div>10.10.1.254</div>
                    </div>
                  </div>
                </div>

                {/* Interface Ports Grid */}
                {['Switch', 'Router'].includes(selectedDevice.type) && (
                  <div>
                    <h3 style={{ fontSize: '0.95rem', marginBottom: '0.5rem' }}>Interface Port Telemetry</h3>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                      Clickable physical jack layout representing Ethernet interface state.
                    </p>
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(12, 1fr)', 
                      gap: '0.375rem', 
                      background: 'var(--bg-app)', 
                      padding: '0.75rem', 
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-color)'
                    }}>
                      {selectedDevice.ports.map((port) => (
                        <div 
                           key={port.port} 
                           style={{
                             aspectRatio: '1',
                             borderRadius: '4px',
                             display: 'flex',
                             flexDirection: 'column',
                             alignItems: 'center',
                             justifyContent: 'center',
                             fontSize: '0.65rem',
                             fontWeight: 600,
                             backgroundColor: 
                               port.status === 'active' ? 'var(--status-success-bg)' :
                               port.status === 'disabled' ? 'var(--status-danger-bg)' : 'var(--bg-surface)',
                             border: `1px solid ${
                               port.status === 'active' ? 'var(--status-success)' :
                               port.status === 'disabled' ? 'var(--status-danger)' : 'var(--border-color)'
                             }`,
                             color: 
                               port.status === 'active' ? 'var(--status-success)' :
                               port.status === 'disabled' ? 'var(--status-danger)' : 'var(--text-secondary)'
                           }}
                           title={`Port ${port.port}: ${port.status.toUpperCase()}`}
                        >
                          {port.port}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Latency History Simulation */}
                {selectedDevice.status !== 'Offline' && (
                  <div>
                    <h3 style={{ fontSize: '0.95rem', marginBottom: '0.5rem' }}>Ping Response (Past 60 Seconds)</h3>
                    <div style={{ display: 'flex', alignItems: 'flex-end', height: '60px', gap: '4px', background: 'var(--bg-app)', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                      <div style={{ flex: 1, height: '40%', backgroundColor: 'var(--primary)', opacity: 0.6, borderRadius: '2px' }} />
                      <div style={{ flex: 1, height: '45%', backgroundColor: 'var(--primary)', opacity: 0.6, borderRadius: '2px' }} />
                      <div style={{ flex: 1, height: '38%', backgroundColor: 'var(--primary)', opacity: 0.6, borderRadius: '2px' }} />
                      <div style={{ flex: 1, height: '52%', backgroundColor: 'var(--primary)', opacity: 0.6, borderRadius: '2px' }} />
                      <div style={{ flex: 1, height: '42%', backgroundColor: 'var(--primary)', opacity: 0.6, borderRadius: '2px' }} />
                      <div style={{ flex: 1, height: '48%', backgroundColor: 'var(--primary)', opacity: 0.6, borderRadius: '2px' }} />
                      <div style={{ flex: 1, height: `${selectedDevice.latency / 2}%`, backgroundColor: selectedDevice.status === 'Degraded' ? 'var(--secondary)' : 'var(--primary)', borderRadius: '2px' }} />
                    </div>
                    <div className="flex justify-between" style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                      <span>60s ago</span>
                      <span>Now: {selectedDevice.latency}ms</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .spin-anim {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .pulsing-dot {
          animation: pulse 1.8s infinite ease-in-out;
        }
        @keyframes pulse {
          0% { opacity: 0.4; transform: scale(0.9); }
          50% { opacity: 1; transform: scale(1.1); }
          100% { opacity: 0.4; transform: scale(0.9); }
        }
      `}</style>
    </div>
  );
};
