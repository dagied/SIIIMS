import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { LogIn, HelpCircle } from 'lucide-react';
import { required, minLength, firstError } from '../../utils/validation';

export const Login = () => {
  const { login, isLoading } = useAuth();
  const { t } = useLanguage();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('System Admin');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const validationError = firstError(
      required(username, 'Username'),
      required(password, 'Password'),
      minLength(password, 8, 'Password')
    );
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      const loggedIn = await login('', username, password);
      if (!loggedIn) {
        setError('Authentication failed. Please check your credentials.');
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please try again.');
    }
  };

  const handleQuickSelect = async (selectedRole) => {
    setRole(selectedRole);
    const cleanUsername = selectedRole.toLowerCase().replace(/[^a-z]/g, '_');
    setUsername(cleanUsername);
    setPassword('Password123');
    setError('');

    try {
      await login(selectedRole, cleanUsername, 'Password123');
    } catch (err) {
      setError(err.message || 'Authentication failed. Please try again.');
    }
  };

  const roleList = [
    'System Admin',
    'ICT Technician',
    'Zonal ICT Focal Person',
    'Department Staff/End User',
    'Management/Executive Viewer',
  ];

  return (
    <div className="auth-wrapper animate-fade-in">
      <div className="card auth-card glass">
        <div className="auth-header">
          <div className="auth-logo">S</div>
          <h2 className="auth-title">{t('sign_in')}</h2>
          <p className="auth-subtitle">{t('sign_in_subtitle')}</p>
        </div>

        {error && (
          <div className="badge badge-danger" style={{ display: 'block', padding: '0.5rem 1rem', marginBottom: '1.25rem', textAlign: 'center', width: '100%' }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">{t('username')}</label>
            <input
              id="username"
              type="text"
              className="input-field"
              placeholder="e.g. admin_almaz"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">{t('password')}</label>
            <input
              id="password"
              type="password"
              className="input-field"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.5rem' }}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex align-center gap-2 justify-center">
                <span className="spinner" style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTop: '2px solid white',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite'
                }} />
                Signing In...
              </span>
            ) : (
              <>
                <LogIn size={18} />
                <span>{t('login')}</span>
              </>
            )}
          </button>
        </form>

        <div style={{ marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)' }}>
          <h3 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.75rem' }}>
            <HelpCircle size={15} /> Quick Role Testing (Auto-fill)
          </h3>
          <div className="flex flex-col gap-2">
            {roleList.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => handleQuickSelect(r)}
                className="btn btn-secondary"
                style={{ justifyContent: 'flex-start', padding: '0.4rem 0.75rem', fontSize: '0.75rem', textAlign: 'left' }}
                disabled={isLoading}
              >
                🔑 Login as <strong>{r}</strong>
              </button>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
