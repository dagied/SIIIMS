// src/components/HelpdeskTicketing.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { api } from '../../services/api';
import { Plus, Search, X } from 'lucide-react';

export const HelpdeskTicketing = () => {
  const { user } = useAuth();
  const { t } = useLanguage();

  const [selectedTicket, setSelectedTicket] = useState(null);
  const [activeForm, setActiveForm] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [technicians, setTechnicians] = useState([]);
  const [notifyTarget, setNotifyTarget] = useState(null);
  const [notifyMessage, setNotifyMessage] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  const [newTicket, setNewTicket] = useState({
    subject: '',
    category: 'Software / Access',
    priority: 'Medium',
    description: '',
    assetTag: ''
  });

  const [escTarget, setEscTarget] = useState({
    technician: '',
    escalationReason: '',
    status: 'In Progress'
  });

  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await api.getTickets();
      
      // Handle different response formats
      const ticketsData = res?.data || res || [];
      const ticketsArray = Array.isArray(ticketsData) ? ticketsData : [];
      
      const mapped = ticketsArray.map(t => ({
        id: t.id || t._id,
        ticketNo: t.ticketNo || t.id || t._id,
        subject: t.title || t.subject || 'No Subject',
        category: t.category || 'Hardware',
        priority: t.priority || 'Medium',
        status: t.status || 'Open',
        assignedTo: t.assignee?.name || t.assignedTo || 'Unassigned',
        createdBy: t.requester?.name || t.createdBy || 'End User',
        date: t.createdAt ? new Date(t.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        description: t.description || '',
        assetTag: t.assetTag || 'N/A',
        timeline: t.timeline || [
          { 
            date: new Date().toISOString().split('T')[0], 
            action: 'Ticket Registered', 
            user: t.requester?.username || 'system' 
          }
        ]
      }));
      
      setTickets(mapped);
    } catch (err) {
      console.error('[Helpdesk] Failed to fetch tickets:', err);
      setError('Failed to load tickets. Please try again.');
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
    if (user?.role === 'System Admin') {
      api.getHelpdeskTechnicians()
        .then((res) => setTechnicians(Array.isArray(res?.data) ? res.data : []))
        .catch((err) => setError(err.message || 'Failed to load technicians.'));
    }
  }, []);

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = 
      (ticket.subject && ticket.subject.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (ticket.createdBy && ticket.createdBy.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (ticket.id && ticket.id.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === '' || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === '' || ticket.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleSubmitTicket = async (e) => {
    e.preventDefault();
    
    if (!newTicket.subject || !newTicket.description) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setError(null);
      setSuccessMessage(null);
      
      const payload = {
        title: newTicket.subject,
        description: newTicket.description,
        priority: newTicket.priority || 'Medium',
        category: newTicket.category || 'Hardware',
        zone: user?.zone || 'Headquarters',
        assetTag: newTicket.assetTag || '',
        requesterId: user?.id || user?._id,
        status: 'Open'
      };

      const res = await api.createTicket(payload);
      
      if (res && (res.success || res.data)) {
        setSuccessMessage('Ticket created successfully!');
        setActiveForm(null);
        setNewTicket({ 
          subject: '', 
          category: 'Software / Access', 
          priority: 'Medium', 
          description: '', 
          assetTag: '' 
        });
        await fetchTickets();
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        throw new Error('Failed to create ticket');
      }
    } catch (err) {
      console.error('[Helpdesk] Failed to submit ticket:', err);
      setError(err.message || 'Failed to submit ticket. Please try again.');
    }
  };

  // FIXED: Updated to use the correct API method
// In HelpdeskTicketing component
const handleEscalateSubmit = async (e) => {
  e.preventDefault();
  
  if (!selectedTicket) {
    setError('No ticket selected');
    return;
  }
  
  if (isSystemAdmin && !escTarget.technician) {
    setError('Please select a technician');
    return;
  }

  try {
    setError(null);
    setSuccessMessage(null);
    
    // FIXED: Send the payload with the technician name
    const payload = {
      note: escTarget.escalationReason || `Ticket assigned to ${escTarget.technician}`,
      priority: selectedTicket.priority,
      category: selectedTicket.category,
    };

    if (isSystemAdmin) {
      payload.assignedTo = escTarget.technician;
    } else {
      payload.status = escTarget.status;
    }

    console.log('[Helpdesk] Updating ticket with payload:', payload);

    const res = await api.updateTicket(selectedTicket.id, payload);
    
    if (res && res.success) {
      setSuccessMessage(`Ticket updated successfully! Assigned to ${escTarget.technician}`);
      setActiveForm(null);
      setSelectedTicket(null);
      setEscTarget({ 
        technician: '', 
        escalationReason: '', 
        status: 'In Progress' 
      });
      await fetchTickets();
      setTimeout(() => setSuccessMessage(null), 3000);
    } else {
      throw new Error(res?.message || 'Server returned an error');
    }
  } catch (err) {
    console.error('[Helpdesk] Failed to update ticket:', err);
    setError(err.message || 'Failed to update ticket. Please try again.');
  }
};

  // FIXED: Updated to use the correct API method
 const handleMarkResolved = async (ticket) => {
  if (!ticket || !ticket.id) {
    setError('Invalid ticket for resolution');
    return;
  }

  try {
    setError(null);
    setSuccessMessage(null);
    
    const payload = { 
      status: 'Resolved',
      note: 'Ticket resolved by technician',
      resolvedAt: new Date().toISOString(),
    };
    
    const res = await api.updateTicket(ticket.id, payload);
    
    if (res && res.success) {
      setSuccessMessage('Ticket resolved successfully!');
      await fetchTickets();
      
      if (selectedTicket && selectedTicket.id === ticket.id) {
        setSelectedTicket(prev => prev ? { ...prev, status: 'Resolved' } : null);
      }
      
      setTimeout(() => setSuccessMessage(null), 3000);
    } else {
      throw new Error(res?.message || 'Failed to resolve ticket');
    }
  } catch (err) {
    console.error('[Helpdesk] Failed to resolve ticket:', err);
    setError(err.message || 'Failed to resolve ticket. Please try again.');
  }
};

  const isTechnician = user?.role === 'ICT Technician';
  const isSystemAdmin = user?.role === 'System Admin';

  const openNotifyDialog = (ticket) => {
    setNotifyTarget(ticket);
    setNotifyMessage('Please provide a progress update for this ticket.');
    setError(null);
  };

  const handleNotifyAssignee = async (e) => {
    e.preventDefault();
    if (!notifyTarget || !notifyMessage.trim()) {
      setError('Write a message before sending the notification.');
      return;
    }
    try {
      setError(null);
      setSuccessMessage(null);
      const res = await api.notifyTicketAssignee(notifyTarget.id, notifyMessage.trim());
      if (!res?.success) throw new Error(res?.message || 'Failed to send notification.');
      setSuccessMessage(res.message || 'Notification sent to the assigned technician.');
      setNotifyTarget(null);
      setNotifyMessage('');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err.message || 'Failed to notify the assigned technician.');
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Success Message */}
      {successMessage && (
        <div className="alert alert-success" style={{ 
          padding: '1rem', 
          backgroundColor: '#d4edda', 
          border: '1px solid #c3e6cb', 
          borderRadius: '4px',
          color: '#155724'
        }}>
          <strong>Success!</strong> {successMessage}
          <button 
            onClick={() => setSuccessMessage(null)} 
            style={{ 
              marginLeft: '1rem', 
              background: 'none', 
              border: 'none', 
              cursor: 'pointer',
              float: 'right'
            }}
          >
            ×
          </button>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="alert alert-danger" style={{ 
          padding: '1rem', 
          backgroundColor: '#f8d7da', 
          border: '1px solid #f5c6cb', 
          borderRadius: '4px',
          color: '#721c24'
        }}>
          <strong>Error:</strong> {error}
          <button 
            onClick={() => setError(null)} 
            style={{ 
              marginLeft: '1rem', 
              background: 'none', 
              border: 'none', 
              cursor: 'pointer',
              float: 'right'
            }}
          >
            ×
          </button>
        </div>
      )}

      {notifyTarget && (
        <div className="drawer-overlay" onClick={() => setNotifyTarget(null)} style={{ zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <form onSubmit={handleNotifyAssignee} onClick={(e) => e.stopPropagation()} className="card" style={{ width: 'min(92vw, 520px)', padding: '1.5rem', background: 'var(--bg-card)' }}>
            <div className="flex justify-between align-center" style={{ marginBottom: '1rem' }}>
              <h3 style={{ margin: 0 }}>Notify {notifyTarget.assignedTo}</h3>
              <button type="button" className="nav-btn" onClick={() => setNotifyTarget(null)} aria-label="Close notification dialog"><X size={18} /></button>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
              Write a progress request for ticket {notifyTarget.ticketNo || notifyTarget.id}.
            </p>
            <textarea
              className="input-field"
              rows={5}
              value={notifyMessage}
              onChange={(e) => setNotifyMessage(e.target.value)}
              placeholder="Write your message to the technician..."
              autoFocus
            />
            <div className="flex justify-end gap-2" style={{ marginTop: '1rem' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setNotifyTarget(null)}>Cancel</button>
              <button type="submit" className="btn btn-primary">Send Notification</button>
            </div>
          </form>
        </div>
      )}

      {/* Page Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 600 }}>{t('helpdesk')}</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Submit tickets, track resolution pathways, and manage technical support assignments.
          </p>
        </div>
        <button 
          className="btn btn-primary" 
          onClick={() => { 
            setSelectedTicket(null); 
            setActiveForm('submit'); 
            setError(null);
            setSuccessMessage(null);
          }}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Plus size={16} />
          <span>{t('ticket_submit')}</span>
        </button>
      </div>

      {/* Filters */}
      <div className="card" style={{ padding: '1rem', backgroundColor: 'var(--bg-surface)', borderRadius: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div className="form-group flex-1" style={{ margin: 0, minWidth: '220px', flex: 1 }}>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="input-field"
                placeholder={t('search')}
                style={{ paddingLeft: '2.25rem', width: '100%' }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <select
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

          {user?.role !== 'System Admin' && <div className="form-group" style={{ margin: 0 }}>
            <select
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
          </div>}
          
          <button 
            className="btn btn-secondary"
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('');
              setPriorityFilter('');
            }}
            style={{ padding: '0.5rem 1rem' }}
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Tickets List */}
      <div className="table-container" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--bg-surface)', borderBottom: '2px solid var(--border-color)' }}>
              <th style={{ padding: '0.75rem', textAlign: 'left' }}>Ticket ID</th>
              <th style={{ padding: '0.75rem', textAlign: 'left' }}>{t('ticket_subject')}</th>
              <th style={{ padding: '0.75rem', textAlign: 'left' }}>Category</th>
              <th style={{ padding: '0.75rem', textAlign: 'left' }}>{t('priority')}</th>
              <th style={{ padding: '0.75rem', textAlign: 'left' }}>{t('status')}</th>
              <th style={{ padding: '0.75rem', textAlign: 'left' }}>Assigned To</th>
              <th style={{ padding: '0.75rem', textAlign: 'center' }}>{t('actions')}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  Loading tickets...
                </td>
              </tr>
            ) : filteredTickets.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  No tickets found.
                </td>
              </tr>
            ) : (
              filteredTickets.map((tkt) => (
                <tr key={tkt.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '0.75rem', fontWeight: 600, color: 'var(--primary)' }}>
                    #{typeof tkt.id === 'string' ? tkt.id.split('-')[1] || tkt.id.slice(-6) : tkt.id}
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <div>
                      <span style={{ fontWeight: 600 }}>{tkt.subject}</span>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Logged by {tkt.createdBy} on {tkt.date}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '0.75rem' }}>{tkt.category}</td>
                  <td style={{ padding: '0.75rem' }}>
                    <span className={`badge ${
                      tkt.priority === 'Critical' ? 'badge-danger' : 
                      tkt.priority === 'High' ? 'badge-warning' : 
                      tkt.priority === 'Medium' ? 'badge-info' : 'badge-success'
                    }`} style={{ 
                      padding: '0.25rem 0.75rem', 
                      borderRadius: '20px', 
                      fontSize: '0.75rem',
                      fontWeight: 500
                    }}>
                      {tkt.priority}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem' }}>
                    <span className={`badge ${
                      tkt.status === 'Resolved' || tkt.status === 'Closed' ? 'badge-success' : 
                      tkt.status === 'Open' ? 'badge-info' : 'badge-warning'
                    }`} style={{ 
                      padding: '0.25rem 0.75rem', 
                      borderRadius: '20px', 
                      fontSize: '0.75rem',
                      fontWeight: 500
                    }}>
                      {tkt.status}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem' }}>👤 {tkt.assignedTo}</td>
                  <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                      <button 
                        className="btn btn-secondary" 
                        style={{ padding: '4px 12px', fontSize: '0.75rem' }}
                        onClick={() => { 
                          setSelectedTicket(tkt); 
                          setActiveForm('view'); 
                          setError(null);
                          setSuccessMessage(null);
                        }}
                      >
                        Details
                      </button>
                      {isTechnician && tkt.status !== 'Resolved' && tkt.status !== 'Closed' && (
                        <>
                          <button 
                            className="btn btn-secondary" 
                            style={{ 
                              padding: '4px 12px', 
                              fontSize: '0.75rem', 
                              borderColor: 'var(--secondary)', 
                              color: 'var(--secondary)' 
                            }}
                            onClick={() => { 
                              setSelectedTicket(tkt); 
                              setActiveForm('escalate'); 
                              setError(null);
                              setSuccessMessage(null);
                              setEscTarget(prev => ({
                                ...prev,
                                technician: tkt.assignedTo !== 'Unassigned' ? tkt.assignedTo : '',
                                status: tkt.status
                              }));
                            }}
                          >
                            Update
                          </button>
                          <button 
                            className="btn btn-primary" 
                            style={{ padding: '4px 12px', fontSize: '0.75rem' }}
                            onClick={() => handleMarkResolved(tkt)}
                          >
                            Resolve
                          </button>
                        </>
                      )}
                      {isSystemAdmin && tkt.status !== 'Resolved' && tkt.status !== 'Closed' && (
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '4px 12px', fontSize: '0.75rem', borderColor: 'var(--secondary)', color: 'var(--secondary)' }}
                          onClick={() => {
                            setSelectedTicket(tkt);
                            setActiveForm('escalate');
                            setError(null);
                            setSuccessMessage(null);
                            setEscTarget(prev => ({
                              ...prev,
                              technician: tkt.assignedTo !== 'Unassigned' ? tkt.assignedTo : '',
                              status: tkt.status
                            }));
                          }}
                        >
                          Assign / Update
                        </button>
                      )}
                      {isSystemAdmin && tkt.assignedTo !== 'Unassigned' && tkt.status !== 'Resolved' && tkt.status !== 'Closed' && (
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '4px 12px', fontSize: '0.75rem', borderColor: 'var(--primary)', color: 'var(--primary)' }}
                          onClick={() => openNotifyDialog(tkt)}
                        >
                          Notify Technician
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

      {/* VIEW TICKET DETAILS DRAWER */}
      {activeForm === 'view' && selectedTicket && (
        <div className="drawer-overlay" onClick={() => setActiveForm(null)} style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          zIndex: 1000,
          display: 'flex',
          justifyContent: 'flex-end'
        }}>
          <div className="drawer" onClick={(e) => e.stopPropagation()} style={{
            width: '600px',
            maxWidth: '90%',
            backgroundColor: 'var(--bg-card)',
            height: '100vh',
            overflow: 'auto',
            padding: '1.5rem',
            boxShadow: '-2px 0 8px rgba(0,0,0,0.1)'
          }}>
            <div className="drawer-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3>Support Ticket #{typeof selectedTicket.id === 'string' ? selectedTicket.id.split('-')[1] || selectedTicket.id.slice(-6) : selectedTicket.id}</h3>
              <button className="nav-btn" onClick={() => setActiveForm(null)} aria-label="Close drawer" style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '0.5rem'
              }}>
                <X size={18} />
              </button>
            </div>
            <div className="drawer-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>{selectedTicket.subject}</h2>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <span className="badge" style={{ padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem' }}>
                      {selectedTicket.priority}
                    </span>
                    <span className="badge" style={{ padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.75rem', backgroundColor: 'var(--status-success)', color: 'var(--text-on-primary)' }}>
                      {selectedTicket.status}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Date: {selectedTicket.date}
                    </span>
                  </div>
                </div>

                <div>
                  <strong style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Problem Description:</strong>
                  <p style={{ 
                    fontSize: '0.85rem', 
                    color: 'var(--text-primary)', 
                    marginTop: '0.25rem', 
                    padding: '0.75rem', 
                    background: 'var(--bg-app)', 
                    border: '1px solid var(--border-color)', 
                    borderRadius: '4px' 
                  }}>
                    {selectedTicket.description}
                  </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.85rem' }}>
                  <div>
                    <strong style={{ color: 'var(--text-secondary)' }}>Ticket Category:</strong>
                    <div>{selectedTicket.category}</div>
                  </div>
                  {selectedTicket.assetTag && selectedTicket.assetTag !== 'N/A' && (
                    <div>
                      <strong style={{ color: 'var(--text-secondary)' }}>Asset Tag:</strong>
                      <div><code>{selectedTicket.assetTag}</code></div>
                    </div>
                  )}
                  <div>
                    <strong style={{ color: 'var(--text-secondary)' }}>Created By:</strong>
                    <div>👤 {selectedTicket.createdBy}</div>
                  </div>
                  <div>
                    <strong style={{ color: 'var(--text-secondary)' }}>Assigned To:</strong>
                    <div>👤 {selectedTicket.assignedTo}</div>
                  </div>
                </div>

                <div>
                  <h3 style={{ fontSize: '0.95rem', marginBottom: '0.5rem' }}>{t('ticket_history')}</h3>
                  <div style={{ position: 'relative', paddingLeft: '1.5rem' }}>
                    {selectedTicket.timeline && selectedTicket.timeline.map((log, idx) => (
                      <div key={idx} style={{ 
                        position: 'relative', 
                        paddingLeft: '1.5rem',
                        paddingBottom: '1rem',
                        borderLeft: '2px solid var(--border-color)'
                      }}>
                        <div style={{
                          position: 'absolute',
                          left: '-6px',
                          top: '0',
                          width: '10px',
                          height: '10px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--primary)'
                        }} />
                        <div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {log.date} by {log.user}
                          </div>
                          <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{log.action}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {isTechnician && selectedTicket.status !== 'Resolved' && selectedTicket.status !== 'Closed' && (
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                    <button 
                      className="btn btn-secondary" 
                      style={{ flex: 1, padding: '0.5rem' }}
                      onClick={() => setActiveForm('escalate')}
                    >
                      Assign / Escalate
                    </button>
                    <button 
                      className="btn btn-primary" 
                      style={{ flex: 1, padding: '0.5rem' }}
                      onClick={() => handleMarkResolved(selectedTicket)}
                    >
                      Mark Resolved
                    </button>
                  </div>
                )}
                {isSystemAdmin && selectedTicket.assignedTo !== 'Unassigned' && selectedTicket.status !== 'Resolved' && selectedTicket.status !== 'Closed' && (
                  <button
                    className="btn btn-secondary"
                    style={{ width: '100%', marginTop: '1rem', borderColor: 'var(--primary)', color: 'var(--primary)' }}
                    onClick={() => openNotifyDialog(selectedTicket)}
                  >
                    Notify Assigned Technician
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUBMIT SUPPORT TICKET DRAWER */}
      {activeForm === 'submit' && (
        <div className="drawer-overlay" onClick={() => setActiveForm(null)} style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          zIndex: 1000,
          display: 'flex',
          justifyContent: 'flex-end'
        }}>
          <div className="drawer" onClick={(e) => e.stopPropagation()} style={{
            width: '600px',
            maxWidth: '90%',
            backgroundColor: 'var(--bg-card)',
            height: '100vh',
            overflow: 'auto',
            padding: '1.5rem',
            boxShadow: '-2px 0 8px rgba(0,0,0,0.1)'
          }}>
            <form onSubmit={handleSubmitTicket} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div className="drawer-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3>{t('ticket_submit')}</h3>
                <button type="button" className="nav-btn" onClick={() => setActiveForm(null)} aria-label="Close drawer" style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.5rem'
                }}>
                  <X size={18} />
                </button>
              </div>
              <div className="drawer-body" style={{ flex: 1 }}>
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label htmlFor="tkt-sub">Subject *</label>
                  <input
                    id="tkt-sub"
                    type="text"
                    required
                    className="input-field"
                    placeholder="Short description of the fault..."
                    value={newTicket.subject}
                    onChange={(e) => setNewTicket(prev => ({ ...prev, subject: e.target.value }))}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div className="form-group">
                    <label htmlFor="tkt-cat">Category</label>
                    <select
                      id="tkt-cat"
                      className="input-field"
                      value={newTicket.category}
                      onChange={(e) => setNewTicket(prev => ({ ...prev, category: e.target.value }))}
                      style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}
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
                      onChange={(e) => setNewTicket(prev => ({ ...prev, priority: e.target.value }))}
                      style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>
                </div>
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label htmlFor="tkt-tag">Asset Tag (If hardware issue)</label>
                  <input
                    id="tkt-tag"
                    type="text"
                    className="input-field"
                    placeholder="e.g. OSTA-2026-001"
                    value={newTicket.assetTag}
                    onChange={(e) => setNewTicket(prev => ({ ...prev, assetTag: e.target.value }))}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label htmlFor="tkt-desc">Issue Details *</label>
                  <textarea
                    id="tkt-desc"
                    required
                    className="input-field"
                    rows={6}
                    placeholder="Describe fully what occurred, any error message, and steps to reproduce..."
                    value={newTicket.description}
                    onChange={(e) => setNewTicket(prev => ({ ...prev, description: e.target.value }))}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}
                  />
                </div>
              </div>
              <div className="drawer-footer" style={{ display: 'flex', gap: '0.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setActiveForm(null)} style={{ padding: '0.5rem 1rem' }}>
                  {t('cancel')}
                </button>
                <button type="submit" className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>
                  {t('ticket_submit')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ASSIGN / ESCALATE DRAWER */}
      {activeForm === 'escalate' && selectedTicket && (
        <div className="drawer-overlay" onClick={() => setActiveForm(null)} style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          zIndex: 1000,
          display: 'flex',
          justifyContent: 'flex-end'
        }}>
          <div className="drawer" onClick={(e) => e.stopPropagation()} style={{
            width: '600px',
            maxWidth: '90%',
            backgroundColor: 'var(--bg-card)',
            height: '100vh',
            overflow: 'auto',
            padding: '1.5rem',
            boxShadow: '-2px 0 8px rgba(0,0,0,0.1)'
          }}>
            <form onSubmit={handleEscalateSubmit} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div className="drawer-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3>Assign & Update Ticket</h3>
                <button type="button" className="nav-btn" onClick={() => setActiveForm(null)} aria-label="Close drawer" style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.5rem'
                }}>
                  <X size={18} />
                </button>
              </div>
              <div className="drawer-body" style={{ flex: 1 }}>
                <div style={{ marginBottom: '1.5rem', backgroundColor: 'var(--bg-surface-elevated)', padding: '1rem', borderRadius: '4px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Ticket Subject:</div>
                  <strong style={{ fontSize: '1rem' }}>{selectedTicket.subject}</strong>
                  <div style={{ fontSize: '0.8rem', color: 'var(--primary)', marginTop: '0.25rem' }}>
                    Priority: {selectedTicket.priority} | Current Status: {selectedTicket.status} | Assigned: {selectedTicket.assignedTo}
                  </div>
                </div>

                {isSystemAdmin && <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label htmlFor="esc-tech">Assign Technician *</label>
                  <select
                    id="esc-tech"
                    required
                    className="input-field"
                    value={escTarget.technician}
                    onChange={(e) => setEscTarget(prev => ({ ...prev, technician: e.target.value }))}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}
                  >
                    <option value="">Select ICT Technician...</option>
                    {technicians.map((technician) => (
                      <option key={technician.id} value={technician.name}>
                        {technician.name} ({technician.assignedTaskCount} unresolved)
                      </option>
                    ))}
                  </select>
                </div>}

                {isTechnician && <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label htmlFor="esc-status">Ticket Status</label>
                  <select
                    id="esc-status"
                    className="input-field"
                    value={escTarget.status}
                    onChange={(e) => setEscTarget(prev => ({ ...prev, status: e.target.value }))}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}
                  >
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Escalated">Escalated</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>}

                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label htmlFor="esc-reason">Work Log Notes / Update Justification</label>
                  <textarea
                    id="esc-reason"
                    className="input-field"
                    rows={4}
                    placeholder="Enter technician action logs or justification for escalating to external vendor/ISP..."
                    value={escTarget.escalationReason}
                    onChange={(e) => setEscTarget(prev => ({ ...prev, escalationReason: e.target.value }))}
                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)' }}
                  />
                </div>
              </div>
              <div className="drawer-footer" style={{ display: 'flex', gap: '0.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setActiveForm(null)} style={{ padding: '0.5rem 1rem' }}>
                  {t('cancel')}
                </button>
                <button type="submit" className="btn btn-warning" style={{ padding: '0.5rem 1rem' }}>
                  Save Updates
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HelpdeskTicketing;