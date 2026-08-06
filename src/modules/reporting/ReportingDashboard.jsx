import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { FileText, Download, BarChart2, CheckCircle, Clock, ShieldAlert } from 'lucide-react';

export const ReportingDashboard = () => {
  const { user } = useAuth();
  const { t } = useLanguage();

  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isExportingExcel, setIsExportingExcel] = useState(false);

  const simulateDownload = (type) => {
    if (type === 'PDF') {
      setIsExportingPdf(true);
      setTimeout(() => {
        setIsExportingPdf(false);
        alert('SIIMS Executive Report compiled successfully! Downloaded SIIMS_Report_2026.pdf');
      }, 1500);
    } else {
      setIsExportingExcel(true);
      setTimeout(() => {
        setIsExportingExcel(false);
        alert('SIIMS Inventory Ledger compiled successfully! Downloaded SIIMS_Inventory_2026.xlsx');
      }, 1200);
    }
  };

  // Mock reporting analytics metrics
  const reports = {
    totalValue: '128,450 USD',
    avgResolutionHours: '3.8 Hours',
    slaAdherence: '96.4%',
    uptimeCore: '99.98%'
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div className="page-header">
        <div>
          <h1>Reporting & Performance Analytics</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Compile system inventories, hardware depreciation audit ledgers, and helpdesk SLA indicators.
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            className="btn btn-secondary" 
            onClick={() => simulateDownload('Excel')}
            disabled={isExportingExcel}
          >
            <Download size={16} />
            <span>{isExportingExcel ? 'Generating XLS...' : 'Export to Excel'}</span>
          </button>
          <button 
            className="btn btn-primary" 
            onClick={() => simulateDownload('PDF')}
            disabled={isExportingPdf}
          >
            <FileText size={16} />
            <span>{isExportingPdf ? 'Compiling PDF...' : 'Export PDF Report'}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards row */}
      <div className="grid grid-cols-4 gap-4">
        <div className="card" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)', background: 'var(--primary-glow)', color: 'var(--primary)' }}>
            <BarChart2 size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Assets Assets Value</div>
            <strong style={{ fontSize: '1.25rem' }}>{reports.totalValue}</strong>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)', background: 'var(--secondary-glow)', color: 'var(--secondary)' }}>
            <Clock size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Ticket MTTR</div>
            <strong style={{ fontSize: '1.25rem' }}>{reports.avgResolutionHours}</strong>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)', background: 'hsla(199, 89%, 48%, 0.15)', color: 'var(--accent)' }}>
            <CheckCircle size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>SLA Target Achieved</div>
            <strong style={{ fontSize: '1.25rem' }}>{reports.slaAdherence}</strong>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)', background: 'var(--status-success-bg)', color: 'var(--status-success)' }}>
            <ShieldAlert size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Network Uptime</div>
            <strong style={{ fontSize: '1.25rem' }}>{reports.uptimeCore}</strong>
          </div>
        </div>
      </div>

      {/* Analytics chart panels */}
      <div className="grid grid-cols-2 gap-6">
        
        {/* Chart 1: Asset distribution */}
        <div className="card">
          <div className="card-header">
            <h2 style={{ fontSize: '1.1rem' }}>Asset Distribution By Category</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem 0' }}>
            <div>
              <div className="flex justify-between" style={{ fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                <span>Computers (Workstations & Laptops)</span>
                <strong>60% (742 units)</strong>
              </div>
              <div style={{ height: '14px', background: 'var(--border-color)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: '60%', background: 'var(--primary)' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between" style={{ fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                <span>Network Devices (Switches & Routers)</span>
                <strong>20% (248 units)</strong>
              </div>
              <div style={{ height: '14px', background: 'var(--border-color)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: '20%', background: 'var(--accent)' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between" style={{ fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                <span>Servers & Core Storage</span>
                <strong>10% (124 units)</strong>
              </div>
              <div style={{ height: '14px', background: 'var(--border-color)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: '10%', background: 'var(--secondary)' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between" style={{ fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                <span>Peripherals (Printers & Scanners)</span>
                <strong>10% (126 units)</strong>
              </div>
              <div style={{ height: '14px', background: 'var(--border-color)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: '10%', background: 'var(--text-muted)' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Chart 2: Helpdesk tickets status */}
        <div className="card">
          <div className="card-header">
            <h2 style={{ fontSize: '1.1rem' }}>Helpdesk Ticket Resolutions (This Month)</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem 0' }}>
            <div>
              <div className="flex justify-between" style={{ fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                <span>Resolved Tickets (SLA Compliant)</span>
                <strong>82%</strong>
              </div>
              <div style={{ height: '14px', background: 'var(--border-color)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: '82%', background: 'var(--status-success)' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between" style={{ fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                <span>Resolved Tickets (SLA Breached)</span>
                <strong>10%</strong>
              </div>
              <div style={{ height: '14px', background: 'var(--border-color)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: '10%', background: 'var(--secondary)' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between" style={{ fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                <span>Open / Unresolved Tickets</span>
                <strong>8%</strong>
              </div>
              <div style={{ height: '14px', background: 'var(--border-color)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: '8%', background: 'var(--status-danger)' }} />
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
