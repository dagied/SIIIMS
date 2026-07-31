import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage, type LanguageCode } from '../context/LanguageContext';
import { Menu, Sun, Moon, Bell, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface NavbarProps {
  onMenuToggle: () => void;
}

export interface NotificationItem {
  id: string;
  title: string;
  desc: string;
  time: string;
  unread: boolean;
  link: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onMenuToggle }) => {
  const { user } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('siims_theme') as 'light' | 'dark') || 'light';
  });

  const [showNotiDropdown, setShowNotiDropdown] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'n-1',
      title: 'Warranty Expiry Alert',
      desc: 'Dell PowerEdge R740 Server warranty expires in 12 days!',
      time: '2 hours ago',
      unread: true,
      link: '/licenses'
    },
    {
      id: 'n-2',
      title: 'New Corrective maintenance Logged',
      desc: 'Switch port malfunction at East Shewa Zone resolved.',
      time: '4 hours ago',
      unread: true,
      link: '/maintenance'
    },
    {
      id: 'n-3',
      title: 'Ticket Assigned to You',
      desc: 'Ticket #402: "Unable to connect to OSTA core ERP" assigned.',
      time: '1 day ago',
      unread: false,
      link: '/helpdesk'
    }
  ]);

  const notiRef = useRef<HTMLDivElement>(null);

  // Apply theme to document element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('siims_theme', theme);
  }, [theme]);

  // Click outside to close notification dropdown
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (notiRef.current && !notiRef.current.contains(e.target as Node)) {
        setShowNotiDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value as LanguageCode);
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const handleNotiClick = (noti: NotificationItem) => {
    setNotifications(prev => prev.map(n => n.id === noti.id ? { ...n, unread: false } : n));
    setShowNotiDropdown(false);
    navigate(noti.link);
  };

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <header className="navbar animate-fade-in">
      <div className="flex align-center gap-3">
        <button 
          className="nav-btn menu-toggle" 
          onClick={onMenuToggle}
          aria-label="Toggle Navigation Menu"
        >
          <Menu size={22} />
        </button>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            {t('dashboard')}
          </h2>
          {user?.zone && (
            <span style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600 }}>
              🏢 {user.zone}
            </span>
          )}
        </div>
      </div>

      <div className="nav-actions">
        {/* Language Selection */}
        <div className="lang-dropdown">
          <label htmlFor="language-select" className="sr-only" style={{ display: 'none' }}>Select Language</label>
          <select 
            id="language-select"
            value={language} 
            onChange={handleLanguageChange}
            className="lang-select"
            aria-label="Language Selector"
          >
            <option value="en">English (EN)</option>
            <option value="om">Afaan Oromo (OM)</option>
            <option value="am">አማርኛ (AM)</option>
          </select>
        </div>

        {/* Theme Toggle */}
        <button 
          className="nav-btn" 
          onClick={toggleTheme}
          title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          aria-label="Toggle Theme"
        >
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>

        {/* Notifications Dropdown */}
        <div className="lang-dropdown" ref={notiRef}>
          <button 
            className="nav-btn" 
            onClick={() => setShowNotiDropdown(!showNotiDropdown)}
            title={t('notifications')}
            aria-label={`Notifications, ${unreadCount} unread`}
          >
            <Bell size={20} />
            {unreadCount > 0 && <span className="noti-dot" />}
          </button>

          {showNotiDropdown && (
            <div className="noti-list-container">
              <div style={{ 
                padding: '0.75rem 1rem', 
                borderBottom: '1px solid var(--border-color)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{t('notifications')}</span>
                {unreadCount > 0 && (
                  <button 
                    onClick={markAllRead}
                    style={{ 
                      background: 'none', 
                      border: 'none', 
                      color: 'var(--primary)', 
                      fontSize: '0.75rem', 
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}
                  >
                    <CheckCircle size={12} /> Mark all read
                  </button>
                )}
              </div>
              <div>
                {notifications.length === 0 ? (
                  <div style={{ padding: '1.5rem', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    No notifications
                  </div>
                ) : (
                  notifications.map((noti) => (
                    <div 
                      key={noti.id} 
                      className={`noti-item ${noti.unread ? 'unread' : ''}`}
                      onClick={() => handleNotiClick(noti)}
                    >
                      <div className="noti-title" style={{ color: noti.unread ? 'var(--primary)' : 'var(--text-primary)' }}>
                        {noti.title}
                      </div>
                      <div className="noti-desc">{noti.desc}</div>
                      <div className="noti-time">{noti.time}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
