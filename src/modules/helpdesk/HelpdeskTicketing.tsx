import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Plus, Search, Tag, MessageSquare, AlertTriangle, UserCheck, X } from 'lucide-react';

interface Ticket {
  id: string;
  subject: string;
  category: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  status: 'Open' | 'In Progress' | 'Escalated' | 'Resolved' | 'Closed';
  assignedTo: string;
  createdBy: string;
  date: string;
  description: string;
  assetTag?: string;
  timeline: Array<{ date: string; action: string; user: string }>;
}

export const HelpdeskTicketing: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();

  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [activeForm, setActiveForm] = useState<'submit' | 'escalate' | 'view' | null>(null);

  // Mock list of helpdesk tickets
  const [tickets, setTickets] = useState<Ticket[]>([
    {
      id: 'tkt-401',
      subject: 'Unable to connect to OSTA Core ERP System',
      category: 'Software / Access',
      priority: 'High',
      status: 'In Progress',
      assignedTo: 'Chala Gemechu',
      createdBy: 'Derartu Tulu',
      date: '2026-07-28',
      description: 'Since this morning, when attempting to open erp.osta.gov.et I receive a Connection Timed Out error. Rest of the internet seems to work fine.',
      assetTag: 'OSTA-2026-001',
      timeline: [
        { date: '2026-07-28 09:00', action: 'Ticket Submitted', user: 'staff_derartu' },
        { date: '2026-07-28 10:15', action: 'Assigned to Technician', user: 'admin_almaz' },
      ],
    },
    {
      id: 'tkt-402',
      subject: 'Laser printer leaving thick black lines on prints',
      category: 'Hardware / Printer',
      priority: 'Medium',
      status: 'Open',
      assignedTo: 'Unassigned',
      createdBy: 'Tolosa Kebede',
      date: '2026-07-27',
      description: 'The Epsom printout has black smudges on the right margin of all pages. Cleaning rollers did not resolve.',
      assetTag: 'OSTA-2026-005',
      timeline: [
        { date: '2026-07-27 14:00', action: 'Ticket Submitted', user: 'staff_tolosa' }
      ]
    },
    {
      id: 'tkt-403',
      subject: 'Internet failure at East Shewa Zone Office',
      category: 'Network',
      priority: 'Critical',
      status: 'Escalated',
      assignedTo: 'Chala Gemechu',
      createdBy: 'Lensa Kebede',
      date: '2026-07-26',
      description: 'Complete outage at the zonal branch office. No IP address allocated on the main router gateway. Staff unable to sync records.',
      assetTag: 'OSTA-2026-003',
      timeline: [
        { date: '2026-07-26 08:30', action: 'Ticket Submitted', user: 'zone_lensa' },
        { date: '2026-07-26 09:00', action: 'Assigned to Technician', user: 'admin_almaz' },
        { date: '2026-07-26 13:00', action: 'Escalated to Tier-3 ISP support', user: 'tech_chala' }
      ]
    }
  ]);

  // Filtering state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  // Form input states
  const [newTicket, setNewTicket] = useState({
    subject: '',
    category: 'Software / Access',
    priority: 'Medium' as Ticket['priority'],
    description: '',
    assetTag: ''
  });

  const [escTarget, setEscTarget] = useState({
    technician: '',
    escalationReason: '',
    status: 'In Progress' as Ticket['status']
  });

  const filteredTickets = tickets.filter(ticket => {
    // End users can only see tickets they submitted
    if (user?.role === 'Department Staff/End User' && ticket.createdBy !== user.name) {
      // Allow fallback if they mock created
      if (ticket.createdBy !== 'Derartu Tulu') return false;
    }

    const matchesSearch = 
      ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.createdBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.id.includes(searchTerm);

    const matchesStatus = statusFilter === '' || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === '' || ticket.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicket.subject || !newTicket.description) return;

    const today = new Date().toISOString().split('T')[0];
    const time = new Date().toLocaleTimeString().substring(0, 5);

    const ticketEntry: Ticket = {
      id: `tkt-${tickets.length + 401}`,
      subject: newTicket.subject,
      category: newTicket.category,
      priority: newTicket.priority,
      status: 'Open',
      assignedTo: 'Unassigned',
      createdBy: user?.name || 'Department Staff',
      date: today,
      description: newTicket.description,
      assetTag: newTicket.assetTag,
      timeline: [
        { date: `${today} ${time}`, action: 'Ticket Submitted', user: user?.username || 'user' }
      ]
    };

    setTickets(prev => [ticketEntry, ...prev]);
    setActiveForm(null);
    setNewTicket({ subject: '', category: 'Software / Access', priority: 'Medium', description: '', assetTag: '' });
  };

  const handleEscalateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !escTarget.technician) return;

    const today = new Date().toISOString().split('T')[0];
    const time = new Date().toLocaleTimeString().substring(0, 5);

    const updated = tickets.map(tkt => {
      if (tkt.id === selectedTicket.id) {
        return {
          ...tkt,
          assignedTo: escTarget.technician,
          status: escTarget.status,
          timeline: [
            ...tkt.timeline,
            {
              date: `${today} ${time}`,
              action: `Ticket updated status to [${escTarget.status}] & assigned to ${escTarget.technician}`,
              user: user?.username || 'system'
            }
          ]
        };
      }
      return tkt;
    });

    setTickets(updated);
    setActiveForm(null);
    setSelectedTicket(null);
    setEscTarget({ technician: '', escalationReason: '', status: 'In Progress' });
  };

  const handleMarkResolved = (ticket: Ticket) => {
    const today = new Date().toISOString().split('T')[0];
    const time = new Date().toLocaleTimeString().substring(0, 5);

    const updated = tickets.map(tkt => {
      if (tkt.id === ticket.id) {
        return {
          ...tkt,
          status: 'Resolved' as const,
          timeline: [
            ...tkt.timeline,
            { date: `${today} ${time}`, action: 'Ticket Resolved successfully', user: user?.username || 'system' }
          ]
        };
      }
      return tkt;
    });

    setTickets(updated);
    if (selectedTicket && selectedTicket.id === ticket.id) {
      setSelectedTicket(prev => prev ? { ...prev, status: 'Resolved' } : null);
    }
  };

  // Permission Checks: End users cannot escalate/assign
  const isTechnicianOrAdmin = ['System Admin', 'ICT Technician', 'Zonal ICT Focal Person'].includes(user?.role || '');

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div className="page-header">
        <div>
          <h1>{t('helpdesk')}</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Submit tickets, track resolution pathways, and manage technical support assignments.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => { setSelectedTicket(null); setActiveForm('submit'); }}>
          <Plus size={16} />
          <span>{t('ticket_submit')}</span>
        </button>
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
            <label htmlFor="priority-filter" className="sr-only" style={{ display: 'none' }}>Priority</label>
            <select
              id="priority-filter"
              className="input-field"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              style={{ width: '150px' }}
              aria-label="Priority Filter"
            >
              <option value="">{t('all')} Priorities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label htmlFor="helpdesk-status-filter" className="sr-only" style={{ display: 'none' }}>Status</label>
            <select
              id="helpdesk-status-filter"
              className="input-field"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ width: '150px' }}
              aria-label="Status Filter"
            >
              <option value="">{t('all')} Statuses</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Escalated">Escalated</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tickets List */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Ticket ID</th>
              <th>{t('ticket_subject')}</th>
              <th>Category</th>
              <th>{t('priority')}</th>
              <th>{t('status')}</th>
              <th>Assigned To</th>
              <th>{t('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {filteredTickets.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                  No active support tickets.
                </td>
              </tr>
            ) : (
              filteredTickets.map((tkt) => (
                <tr key={tkt.id}>
                  <td style={{ fontWeight: 600, color: 'var(--primary)' }}>#{tkt.id.split('-')[1]}</td>
                  <td>
                    <div>
                      <span style={{ fontWeight: 600 }}>{tkt.subject}</span>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Logged by {tkt.createdBy} on {tkt.date}</div>
                    </div>
                  </td>
                  <td>{tkt.category}</td>
                  <td>
                    <span className={`badge ${
                      tkt.priority === 'Critical' ? 'badge-danger' : 
                      tkt.priority === 'High' ? 'badge-warning' : 
                      tkt.priority === 'Medium' ? 'badge-info' : 'badge-success'
                    }`} style={{ color: tkt.priority === 'High' ? 'var(--status-warning)' : '' }}>
                      {tkt.priority}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${
                      tkt.status === 'Resolved' || tkt.status === 'Closed' ? 'badge-success' : 
                      tkt.status === 'Open' ? 'badge-info' : 'badge-warning'
                    }`}>
                      {tkt.status}
                    </span>
                  </td>
                  <td>👤 {tkt.assignedTo}</td>
                  <td>
                    <div className="flex gap-2">
                      <button 
                        className="btn btn-secondary" 
                        style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                        onClick={() => { setSelectedTicket(tkt); setActiveForm('view'); }}
                      >
                        Details
                      </button>
                      {isTechnicianOrAdmin && tkt.status !== 'Resolved' && tkt.status !== 'Closed' && (
                        <>
                          <button 
                            className="btn btn-secondary" 
                            style={{ padding: '4px 8px', fontSize: '0.75rem', borderColor: 'var(--secondary)', color: 'var(--secondary)' }}
                            onClick={() => { setSelectedTicket(tkt); setActiveForm('escalate'); }}
                          >
                            Update
                          </button>
                          <button 
                            className="btn btn-primary" 
                            style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                            onClick={() => handleMarkResolved(tkt)}
                          >
                            Resolve
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

      {/* VIEW TICKET DETAILS DRAWER */}
      {activeForm === 'view' && selectedTicket && (
        <div className="drawer-overlay" onClick={() => setActiveForm(null)}>
          <div className="drawer" onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <h3>Support Ticket #{(selectedTicket.id.split('-')[1])}</h3>
              <button className="nav-btn" onClick={() => setActiveForm(null)} aria-label="Close drawer"><X size={18} /></button>
            </div>
            <div className="drawer-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.2rem' }}>{selectedTicket.subject}</h2>
                  <div className="flex align-center gap-2 flex-wrap" style={{ marginTop: '0.5rem' }}>
                    <span className={`badge ${selectedTicket.priority === 'Critical' ? 'badge-danger' : selectedTicket.priority === 'High' ? 'badge-warning' : 'badge-info'}`}>{selectedTicket.priority}</span>
                    <span className="badge badge-success">{selectedTicket.status}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Date: {selectedTicket.date}</span>
                  </div>
                </div>

                <div>
                  <strong style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Problem Description:</strong>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', marginTop: '0.25rem', padding: '0.75rem', background: 'var(--bg-app)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
                    {selectedTicket.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3" style={{ fontSize: '0.85rem' }}>
                  <div>
                    <strong style={{ color: 'var(--text-secondary)' }}>Ticket Category:</strong>
                    <div>{selectedTicket.category}</div>
                  </div>
                  {selectedTicket.assetTag && (
                    <div>
                      <strong style={{ color: 'var(--text-secondary)' }}>Target Asset Tag:</strong>
                      <div><code>{selectedTicket.assetTag}</code></div>
                    </div>
                  )}
                  <div>
                    <strong style={{ color: 'var(--text-secondary)' }}>Created By Employee:</strong>
                    <div>👤 {selectedTicket.createdBy}</div>
                  </div>
                  <div>
                    <strong style={{ color: 'var(--text-secondary)' }}>Assigned Tech Support:</strong>
                    <div>👤 {selectedTicket.assignedTo}</div>
                  </div>
                </div>

                {/* Progress Timeline Checklist */}
                <div>
                  <h3 style={{ fontSize: '0.95rem', marginBottom: '0.5rem' }}>{t('ticket_history')}</h3>
                  <div className="timeline">
                    {selectedTicket.timeline.map((log, idx) => (
                      <div className="timeline-item" key={idx}>
                        <div className="timeline-dot" />
                        <div className="timeline-content">
                          <div className="timeline-time">{log.date} by {log.user}</div>
                          <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{log.action}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {isTechnicianOrAdmin && selectedTicket.status !== 'Resolved' && selectedTicket.status !== 'Closed' && (
                  <div className="flex gap-2" style={{ marginTop: '1rem' }}>
                    <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setActiveForm('escalate')}>
                      Assign / Escalate
                    </button>
                    <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => handleMarkResolved(selectedTicket)}>
                      Mark Resolved
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBMIT SUPPORT TICKET DRAWER */}
      {activeForm === 'submit' && (
        <div className="drawer-overlay" onClick={() => setActiveForm(null)}>
          <div className="drawer" onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleSubmitTicket} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div className="drawer-header">
                <h3>{t('ticket_submit')}</h3>
                <button type="button" className="nav-btn" onClick={() => setActiveForm(null)} aria-label="Close drawer"><X size={18} /></button>
              </div>
              <div className="drawer-body">
                <div className="form-group">
                  <label htmlFor="tkt-sub">Subject *</label>
                  <input
                    id="tkt-sub"
                    type="text"
                    required
                    className="input-field"
                    placeholder="Short description of the fault..."
                    value={newTicket.subject}
                    onChange={(e) => setNewTicket(prev => ({ ...prev, subject: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="form-group">
                    <label htmlFor="tkt-cat">Category</label>
                    <select
                      id="tkt-cat"
                      className="input-field"
                      value={newTicket.category}
                      onChange={(e) => setNewTicket(prev => ({ ...prev, category: e.target.value }))}
                    >
                      <option value="Software / Access">Software / Access</option>
                      <option value="Hardware / Printer">Hardware / Printer</option>
                      <option value="Network">Network</option>
                      <option value="Other">Other / Request</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="tkt-prio">Priority</label>
                    <select
                      id="tkt-prio"
                      className="input-field"
                      value={newTicket.priority}
                      onChange={(e) => setNewTicket(prev => ({ ...prev, priority: e.target.value as any }))}
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="tkt-tag">Asset Tag (If hardware issue)</label>
                  <input
                    id="tkt-tag"
                    type="text"
                    className="input-field"
                    placeholder="e.g. OSTA-2026-001"
                    value={newTicket.assetTag}
                    onChange={(e) => setNewTicket(prev => ({ ...prev, assetTag: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="tkt-desc">Issue Details *</label>
                  <textarea
                    id="tkt-desc"
                    required
                    className="input-field"
                    rows={6}
                    placeholder="Describe fully what occurred, any error message, and steps to reproduce..."
                    value={newTicket.description}
                    onChange={(e) => setNewTicket(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
              </div>
              <div className="drawer-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setActiveForm(null)}>{t('cancel')}</button>
                <button type="submit" className="btn btn-primary">{t('ticket_submit')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ASSIGN / ESCALATE DRAWER */}
      {activeForm === 'escalate' && selectedTicket && (
        <div className="drawer-overlay" onClick={() => setActiveForm(null)}>
          <div className="drawer" onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleEscalateSubmit} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div className="drawer-header">
                <h3>Assign & Update Ticket</h3>
                <button type="button" className="nav-btn" onClick={() => setActiveForm(null)} aria-label="Close drawer"><X size={18} /></button>
              </div>
              <div className="drawer-body">
                <div style={{ marginBottom: '1.5rem', backgroundColor: 'var(--bg-surface-elevated)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Ticket Subject:</div>
                  <strong style={{ fontSize: '1rem' }}>{selectedTicket.subject}</strong>
                  <div style={{ fontSize: '0.8rem', color: 'var(--primary)', marginTop: '0.25rem' }}>Priority: {selectedTicket.priority} | Current Assigned: {selectedTicket.assignedTo}</div>
                </div>

                <div className="form-group">
                  <label htmlFor="esc-tech">Assign Technician *</label>
                  <select
                    id="esc-tech"
                    required
                    className="input-field"
                    value={escTarget.technician}
                    onChange={(e) => setEscTarget(prev => ({ ...prev, technician: e.target.value }))}
                  >
                    <option value="">Select Technician...</option>
                    <option value="Chala Gemechu">Chala Gemechu (Technician)</option>
                    <option value="Almaz Tolosa">Almaz Tolosa (Admin)</option>
                    <option value="Lensa Kebede">Lensa Kebede (Zone Focal)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="esc-status">Ticket Status</label>
                  <select
                    id="esc-status"
                    className="input-field"
                    value={escTarget.status}
                    onChange={(e) => setEscTarget(prev => ({ ...prev, status: e.target.value as any }))}
                  >
                    <option value="In Progress">In Progress</option>
                    <option value="Escalated">Escalated</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="esc-reason">Work Log Notes / Update Justification</label>
                  <textarea
                    id="esc-reason"
                    className="input-field"
                    rows={4}
                    placeholder="Enter technician action logs or justification for escalating to external vendor/ISP..."
                    value={escTarget.escalationReason}
                    onChange={(e) => setEscTarget(prev => ({ ...prev, escalationReason: e.target.value }))}
                  />
                </div>
              </div>
              <div className="drawer-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setActiveForm(null)}>{t('cancel')}</button>
                <button type="submit" className="btn btn-warning">Save Updates</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
