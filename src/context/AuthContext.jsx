import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(undefined);

// Mock Users for testing
const MOCK_PROFILES = {
  'System Admin': { id: 'usr-001', name: 'Almaz Tolosa', username: 'admin_almaz', email: 'almaz.t@osta.gov.et' },
  'ICT Technician': { id: 'usr-002', name: 'Chala Gemechu', username: 'tech_chala', email: 'chala.g@osta.gov.et' },
  'Zonal ICT Focal Person': { id: 'usr-003', name: 'Lensa Kebede', username: 'zone_lensa', email: 'lensa.k@osta.gov.et', zone: 'East Shewa Zone' },
  'Department Staff/End User': { id: 'usr-004', name: 'Derartu Tulu', username: 'staff_derartu', email: 'derartu.t@osta.gov.et' },
  'Management/Executive Viewer': { id: 'usr-005', name: 'Dr. Kenenisa Bekele', username: 'exec_kenenisa', email: 'kenenisa.b@osta.gov.et' },
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('siims_auth');
    if (saved) {
      setUser(JSON.parse(saved));
    }
    setIsLoading(false);
  }, []);

  const login = async (role, username = '') => {
    setIsLoading(true);
    // Simulate low-bandwidth network latency for premium real feel
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    const profile = MOCK_PROFILES[role];
    const loggedInUser = {
      id: profile.id,
      name: profile.name,
      username: username || profile.username,
      email: profile.email,
      role,
      zone: profile.zone
    };
    
    setUser(loggedInUser);
    localStorage.setItem('siims_auth', JSON.stringify(loggedInUser));
    setIsLoading(false);
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('siims_auth');
  };

  // Centralized Module Access Policy Matrix
  const hasAccess = (module) => {
    if (!user) return false;
    
    const role = user.role;

    switch (module) {
      case 'dashboard':
        return true; // Everyone can see dashboard
      case 'assets':
        return true; // Everyone can see assets (some may see filtered/read-only)
      case 'network':
        // Management, Admin, Tech can view
        return ['System Admin', 'ICT Technician', 'Management/Executive Viewer'].includes(role);
      case 'systems':
        return true; // Catalog is viewable by all
      case 'maintenance':
        // Admin, Tech, Zone, Executive can see
        return ['System Admin', 'ICT Technician', 'Zonal ICT Focal Person', 'Management/Executive Viewer'].includes(role);
      case 'helpdesk':
        return true; // Everyone has ticketing access
      case 'licenses':
        // Admin, Tech, Executive can see
        return ['System Admin', 'ICT Technician', 'Management/Executive Viewer'].includes(role);
      case 'vendors':
        // Admin, Tech, Executive can see
        return ['System Admin', 'ICT Technician', 'Management/Executive Viewer'].includes(role);
      case 'users':
        // Only System Admin can CRUD users
        return role === 'System Admin';
      case 'audit_logs':
        // Only System Admin can see Audit Logs
        return role === 'System Admin';
      case 'reporting':
        // Admin, Tech, Management can view reports
        return ['System Admin', 'ICT Technician', 'Management/Executive Viewer'].includes(role);
      case 'notifications':
        return true; // Notifications are global
      default:
        return false;
    }
  };

  // Centralized Module Write/Edit Policy Matrix
  const canEdit = (module) => {
    if (!user) return false;
    
    const role = user.role;

    // Management is always read-only
    if (role === 'Management/Executive Viewer') return false;

    switch (module) {
      case 'assets':
        // Admins and Technicians have full edits. Focal person can request/edit local.
        return ['System Admin', 'ICT Technician', 'Zonal ICT Focal Person'].includes(role);
      case 'network':
        return ['System Admin', 'ICT Technician'].includes(role);
      case 'systems':
        return ['System Admin', 'ICT Technician'].includes(role);
      case 'maintenance':
        return ['System Admin', 'ICT Technician', 'Zonal ICT Focal Person'].includes(role);
      case 'helpdesk':
        // End users can submit but not escalate/assign. Tech, Admin, Zone can modify/assign.
        return true;
      case 'licenses':
        return ['System Admin', 'ICT Technician'].includes(role);
      case 'vendors':
        return ['System Admin', 'ICT Technician'].includes(role);
      case 'users':
        return role === 'System Admin';
      default:
        return false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, hasAccess, canEdit }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
