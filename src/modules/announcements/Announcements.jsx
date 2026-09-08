import React, { useState } from 'react';
import { Megaphone, Send } from 'lucide-react';
import { api } from '../../services/api';
import { minLength, required, firstError } from '../../utils/validation';

export const Announcements = () => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [sending, setSending] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationError = firstError(
      required(title, 'Announcement title'),
      minLength(title, 3, 'Announcement title'),
      required(message, 'Announcement body'),
      minLength(message, 10, 'Announcement body')
    );
    if (validationError) {
      setFeedback({ type: 'error', text: validationError });
      return;
    }

    try {
      setSending(true);
      setFeedback(null);
      const response = await api.createAnnouncement({ title, message });
      setFeedback({ type: 'success', text: response.message });
      setTitle('');
      setMessage('');
    } catch (error) {
      setFeedback({ type: 'error', text: error.message || 'Failed to send announcement.' });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '760px' }}>
      <div className="page-header">
        <div>
          <h1>Staff Announcements</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Send an announcement to all active staff and end users.
          </p>
        </div>
      </div>

      <form className="card" onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
        <div className="flex align-center gap-2" style={{ marginBottom: '1.25rem' }}>
          <Megaphone size={20} color="var(--primary)" />
          <h2 style={{ margin: 0, fontSize: '1.1rem' }}>New Announcement</h2>
        </div>

        {feedback && (
          <div className={`badge ${feedback.type === 'success' ? 'badge-success' : 'badge-danger'}`} style={{ display: 'block', padding: '0.75rem', marginBottom: '1rem', whiteSpace: 'normal' }}>
            {feedback.text}
          </div>
        )}

        <div className="form-group">
          <label htmlFor="announcement-title">Announcement Title *</label>
          <input
            id="announcement-title"
            className="input-field"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="e.g. Scheduled network maintenance"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="announcement-body">Announcement Body *</label>
          <textarea
            id="announcement-body"
            className="input-field"
            rows={7}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Write the announcement details for staff..."
            required
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button type="submit" className="btn btn-primary" disabled={sending}>
            <Send size={16} />
            <span>{sending ? 'Sending...' : 'Send to All Staff'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
