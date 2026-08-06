import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  LayoutDashboard,
  Laptop,
  Network,
  Database,
  Wrench,
  Ticket,
  Key,
  Handshake,
  Users,
  FileSpreadsheet,
  LogOut,
  X
} from 'lucide-react';

export const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout, hasAccess } = useAuth();
  const { t } = useLanguage();

  if (!user) return null;

  const menuItems = [
    { id: 'dashboard', path: '/dashboard', label: t('dashboard'), icon: LayoutDashboard },
    { id: 'assets', path: '/assets', label: t('assets'), icon: Laptop },
    { id: 'network', path: '/network', label: t('network'), icon: Network },
    { id: 'systems', path: '/systems', label: t('systems'), icon: Database },
    { id: 'maintenance', path: '/maintenance', label: t('maintenance'), icon: Wrench },
    { id: 'helpdesk', path: '/helpdesk', label: t('helpdesk'), icon: Ticket },
    { id: 'licenses', path: '/licenses', label: t('licenses'), icon: Key },
    { id: 'vendors', path: '/vendors', label: t('vendors'), icon: Handshake },
    { id: 'users', path: '/users', label: t('users'), icon: Users },
    { id: 'audit_logs', path: '/audit-logs', label: t('audit_logs'), icon: FileSpreadsheet },
  ];

  // Filter menu items by permissions
  const allowedItems = menuItems.filter(item => hasAccess(item.id));

  // Get initials for avatar
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div 
          className="drawer-overlay" 
          style={{ position: 'fixed', inset: 0, zIndex: 95, background: 'rgba(0,0,0,0.3)' }} 
          onClick={onClose} 
        />
      )}
      
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-logo-container">
          <div className="logo-icon">S</div>
          <div className="logo-text" style={{ flex: 1 }}>
            <h1>SIIMS</h1>
            <p>OSTA PORTAL</p>
          </div>
          {/* Close button for mobile */}
          <button 
            className="nav-btn menu-toggle" 
            onClick={onClose}
            aria-label="Close Navigation Menu"
            style={{ padding: '4px' }}
          >
            <X size={18} />
          </button>
        </div>

        <nav className="sidebar-menu">
          {allowedItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.id}
                to={item.path}
                className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                onClick={onClose}
              >
                <Icon className="sidebar-link-icon" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="user-avatar" title={user.name}>
            {getInitials(user.name)}
          </div>
          <div className="user-info">
            <div className="user-name">{user.name}</div>
            <div className="user-role">{user.role}</div>
          </div>
          <button 
            className="nav-btn" 
            onClick={logout} 
            title={t('logout')}
            aria-label="Sign Out"
          >
            <LogOut size={18} />
          </button>
        </div>
      </aside>
    </>
  );
};
