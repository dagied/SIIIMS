import React, { useState } from 'react';
import { KeyRound, Save, UserRound } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { email as validateEmail, minLength, required, firstError } from '../../utils/validation';

export const Profile = () => {
  const { user, updateUserSession } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationError = firstError(
      required(name, 'Full name'),
      validateEmail(email, 'Email address'),
      newPassword ? minLength(newPassword, 8, 'New password') : '',
      newPassword && newPassword !== confirmPassword ? 'New passwords do not match.' : ''
    );
    if (validationError) {
      setFeedback({ type: 'error', text: validationError });
      return;
    }

    try {
      setSaving(true);
      setFeedback(null);
      const response = await api.updateProfile({
        name,
        email,
        currentPassword: currentPassword || undefined,
        newPassword: newPassword || undefined
      });
      updateUserSession(response.user, response.token);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setFeedback({ type: 'success', text: response.message });
    } catch (error) {
      setFeedback({ type: 'error', text: error.message || 'Failed to update profile.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '760px' }}>
      <div className="page-header">
        <div>
          <h1>My Profile</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Update your personal details and account password.</p>
        </div>
      </div>

      <form className="card" onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
        <div className="flex align-center gap-2" style={{ marginBottom: '1.25rem' }}>
          <UserRound size={20} color="var(--primary)" />
          <h2 style={{ margin: 0, fontSize: '1.1rem' }}>Personal Details</h2>
        </div>

        {feedback && <div className={`badge ${feedback.type === 'success' ? 'badge-success' : 'badge-danger'}`} style={{ display: 'block', padding: '0.75rem', marginBottom: '1rem', whiteSpace: 'normal' }}>{feedback.text}</div>}

        <div className="form-group">
          <label htmlFor="profile-username">Username</label>
          <input id="profile-username" className="input-field" value={user?.username || ''} disabled />
        </div>
        <div className="form-group">
          <label htmlFor="profile-role">Role</label>
          <input id="profile-role" className="input-field" value={user?.role || ''} disabled />
        </div>
        <div className="form-group">
          <label htmlFor="profile-name">Full Name *</label>
          <input id="profile-name" className="input-field" value={name} onChange={(event) => setName(event.target.value)} required />
        </div>
        <div className="form-group">
          <label htmlFor="profile-email">Email Address *</label>
          <input id="profile-email" type="email" className="input-field" value={email} onChange={(event) => setEmail(event.target.value)} required />
        </div>

        <div style={{ borderTop: '1px solid var(--border-color)', margin: '1.5rem 0', paddingTop: '1.25rem' }}>
          <div className="flex align-center gap-2" style={{ marginBottom: '1rem' }}>
            <KeyRound size={20} color="var(--primary)" />
            <h2 style={{ margin: 0, fontSize: '1.1rem' }}>Change Password</h2>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Leave these fields blank to keep your current password.</p>
          <div className="form-group">
            <label htmlFor="profile-current-password">Current Password</label>
            <input id="profile-current-password" type="password" className="input-field" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} autoComplete="current-password" />
          </div>
          <div className="form-group">
            <label htmlFor="profile-new-password">New Password</label>
            <input id="profile-new-password" type="password" className="input-field" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} minLength={8} autoComplete="new-password" />
          </div>
          <div className="form-group">
            <label htmlFor="profile-confirm-password">Confirm New Password</label>
            <input id="profile-confirm-password" type="password" className="input-field" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} minLength={8} autoComplete="new-password" />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button type="submit" className="btn btn-primary" disabled={saving}><Save size={16} /><span>{saving ? 'Saving...' : 'Save Profile'}</span></button>
        </div>
      </form>
    </div>
  );
};
