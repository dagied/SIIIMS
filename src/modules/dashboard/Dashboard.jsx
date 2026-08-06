import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { 
  Laptop, 
  Ticket, 
  Network, 
  Database, 
  Activity, 
  TrendingUp, 
  ShieldAlert, 
  Clock, 
  MapPin 
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const Dashboard = () => {
  const { user } = useAuth();
  const { t } = useLanguage();

  if (!user) return null;

  // Mock numbers depending on role (Simulated database counts)
  const isZonal = user.role === 'Zonal ICT Focal Person';
  const zoneName = user.zone || 'Global';

  const stats = {
    assets: isZonal ? 142 : 1240,
    tickets: isZonal ? 8 : 42,
    devices: isZonal ? 15 : 180,
    systems: 24, // Global systems
  };

  const getDashboardTitle = () => {
    switch (user.role) {
      case 'System Admin':
        return 'System Administration Control Center';
      case 'ICT Technician':
        return 'ICT Technical Operations Board';
      case 'Zonal ICT Focal Person':
        return `${zoneName} ICT Focal Desk`;
      case 'Department Staff/End User':
        return 'Employee ICT Service Center';
      case 'Management/Executive Viewer':
        return 'OSTA ICT Performance Analytics';
      default:
        return 'SIIMS Dashboard';
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Welcome Header */}
      <div className="page-header" style={{ marginBottom: '0.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', color: 'var(--text-primary)' }}>{getDashboardTitle()}</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Welcome back, <strong>{user.name}</strong> ({user.role})
          </p>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-4 gap-4">
        {/* KPI Assets */}
        <div className="card kpi-card">
          <div className="kpi-details">
            <h3>{t('kpi_assets')}</h3>
            <div className="kpi-value">{stats.assets}</div>
            <div className="kpi-trend" style={{ color: 'var(--status-success)' }}>
              <TrendingUp size={14} /> <span>+4% this month</span>
            </div>
          </div>
          <div className="kpi-icon-wrapper" style={{ backgroundColor: 'var(--primary-glow)', color: 'var(--primary)' }}>
            <Laptop size={22} />
          </div>
        </div>

        {/* KPI Tickets */}
        <div className="card kpi-card">
          <div className="kpi-details">
            <h3>{t('kpi_tickets')}</h3>
            <div className="kpi-value">{stats.tickets}</div>
            <div className="kpi-trend" style={{ color: user.role === 'Department Staff/End User' ? 'var(--text-muted)' : 'var(--status-warning)' }}>
              <Clock size={14} /> <span>{isZonal ? '3 Pending assignment' : '12 SLA Breach Risks'}</span>
            </div>
          </div>
          <div className="kpi-icon-wrapper" style={{ backgroundColor: 'var(--secondary-glow)', color: 'var(--secondary)' }}>
            <Ticket size={22} />
          </div>
        </div>

        {/* KPI Network */}
        <div className="card kpi-card">
          <div className="kpi-details">
            <h3>{t('kpi_devices')}</h3>
            <div className="kpi-value">{stats.devices}</div>
            <div className="kpi-trend" style={{ color: 'var(--status-success)' }}>
              <Activity size={14} /> <span>98.9% Average Uptime</span>
            </div>
          </div>
          <div className="kpi-icon-wrapper" style={{ backgroundColor: 'hsla(199, 89%, 48%, 0.15)', color: 'var(--accent)' }}>
            <Network size={22} />
          </div>
        </div>

        {/* KPI Systems */}
        <div className="card kpi-card">
          <div className="kpi-details">
            <h3>{t('kpi_systems')}</h3>
            <div className="kpi-value">{stats.systems}</div>
            <div className="kpi-trend" style={{ color: 'var(--status-success)' }}>
              <span>24/24 Operational</span>
            </div>
          </div>
          <div className="kpi-icon-wrapper" style={{ backgroundColor: 'var(--primary-glow)', color: 'var(--primary)' }}>
            <Database size={22} />
          </div>
        </div>
      </div>

      {/* Main Panel layout */}
      <div className="grid grid-cols-3 gap-6">
        {/* Left/Middle Column (Colspan 2) */}
        <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Uptime Trend Graphic (Simulated Chart) */}
          <div className="card">
            <div className="card-header">
              <h2 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{t('uptime_summary')}</h2>
              <span className="badge badge-success">Live Network Status</span>
            </div>
            
            {/* Custom pure CSS bar graph representing latency/uptime */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '0.5rem 0' }}>
              <div className="flex justify-between align-center" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                <span>Core Switch (Adama Headquarters)</span>
                <span className="badge badge-success" style={{ textTransform: 'none' }}>99.9% (12ms ping)</span>
              </div>
              <div style={{ height: '8px', background: 'var(--border-color)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: '99.9%', background: 'linear-gradient(to right, var(--primary), var(--primary-light))' }} />
              </div>

              <div className="flex justify-between align-center" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                <span>Bale Zone Office Router</span>
                <span className="badge badge-success" style={{ textTransform: 'none' }}>98.2% (48ms ping)</span>
              </div>
              <div style={{ height: '8px', background: 'var(--border-color)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: '98.2%', background: 'linear-gradient(to right, var(--primary), var(--secondary))' }} />
              </div>

              <div className="flex justify-between align-center" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                <span>Jimma Zone Office Router</span>
                <span className="badge badge-danger" style={{ textTransform: 'none' }}>91.5% (124ms ping - Degraded)</span>
              </div>
              <div style={{ height: '8px', background: 'var(--border-color)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: '91.5%', background: 'linear-gradient(to right, var(--secondary), var(--status-danger))' }} />
              </div>
            </div>
          </div>

          {/* Quick Actions Panel */}
          <div className="card">
            <div className="card-header">
              <h2 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Quick Actions & Shortcuts</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              {['System Admin', 'ICT Technician', 'Zonal ICT Focal Person'].includes(user.role) && (
                <>
                  <Link to="/assets" className="btn btn-primary">➕ Register Asset</Link>
                  <Link to="/maintenance" className="btn btn-secondary">🔧 Schedule Maintenance</Link>
                </>
              )}
              <Link to="/helpdesk" className="btn btn-warning">🎫 Submit Ticket</Link>
              {user.role === 'System Admin' && (
                <Link to="/users" className="btn btn-secondary">👥 Manage Users</Link>
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Recent Activity stream */}
          <div className="card" style={{ flex: 1 }}>
            <div className="card-header">
              <h2 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{t('recent_activities')}</h2>
            </div>

            <div className="timeline">
              <div className="timeline-item">
                <div className="timeline-dot" />
                <div className="timeline-content">
                  <div className="timeline-time">10 mins ago</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Asset Transferred</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>HP EliteBook 840 moved to Jimma Zonal Branch.</div>
                </div>
              </div>

              <div className="timeline-item">
                <div className="timeline-dot warning" />
                <div className="timeline-content">
                  <div className="timeline-time">1 hour ago</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Ticket Escalated</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Ticket #301 escalated to Tier-2 support team.</div>
                </div>
              </div>

              <div className="timeline-item">
                <div className="timeline-dot danger" />
                <div className="timeline-content">
                  <div className="timeline-time">4 hours ago</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>Critical Alert</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Windows Server license key EXP-99 expires in 3 days.</div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Support / Contact Information for Low Bandwidth */}
          <div className="card" style={{ backgroundColor: 'var(--bg-surface-elevated)' }}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <ShieldAlert size={16} style={{ color: 'var(--primary)' }} />
              OSTA Support Desk
            </h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              For urgent network and hardware failure logs, contact HQ core network support:
            </p>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, marginTop: '0.5rem', color: 'var(--text-primary)' }}>
              📞 +251-11-XXXXXXX<br/>
              📧 support@osta.gov.et
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
