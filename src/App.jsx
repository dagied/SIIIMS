import React, { useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { Login } from './modules/auth/Login';
import { Dashboard } from './modules/dashboard/Dashboard';
import { AssetManagement } from './modules/assets/AssetManagement';
import { NetworkMonitoring } from './modules/network/NetworkMonitoring';
import { SystemsRegistry } from './modules/systems/SystemsRegistry';
import { MaintenanceManagement } from './modules/maintenance/MaintenanceManagement';
import { HelpdeskTicketing } from './modules/helpdesk/HelpdeskTicketing';
import { LicenseWarranty } from './modules/licenses/LicenseWarranty';
import { VendorContract } from './modules/vendors/VendorContract';
import { UserManagement } from './modules/users/UserManagement';
import { AuditLog } from './modules/audit/AuditLog';
import { Announcements } from './modules/announcements/Announcements';
import { Profile } from './modules/profile/Profile';
import './App.css';

// App content wrapper that listens to Auth state
const AppContent = () => {
  const { user, isLoading, hasAccess } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const AccessRoute = ({ module, children }) => {
    return hasAccess(module) ? children : <Navigate to="/dashboard" replace />;
  };

  if (isLoading) {
    return (
      <div style={{
        height: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--bg-app)',
        color: 'var(--text-primary)'
      }}>
        <div style={{
          width: '32px',
          height: '32px',
          border: '3px solid var(--border-color)',
          borderTop: '3px solid var(--primary)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }} />
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // If user is not logged in, redirect to login page directly
  if (!user) {
    return <Login />;
  }

  return (
    <div className="app-container">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col" style={{ minWidth: 0 }}>
        <Navbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        
        <main className="main-content">
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/assets" element={<AssetManagement />} />
            <Route path="/network" element={<AccessRoute module="network"><NetworkMonitoring /></AccessRoute>} />
            <Route path="/systems" element={<SystemsRegistry />} />
            <Route path="/maintenance" element={<AccessRoute module="maintenance"><MaintenanceManagement /></AccessRoute>} />
            <Route path="/helpdesk" element={<HelpdeskTicketing />} />
            <Route path="/licenses" element={<AccessRoute module="licenses"><LicenseWarranty /></AccessRoute>} />
            <Route path="/vendors" element={<AccessRoute module="vendors"><VendorContract /></AccessRoute>} />
            <Route path="/users" element={<AccessRoute module="users"><UserManagement /></AccessRoute>} />
            <Route path="/audit-logs" element={<AccessRoute module="audit_logs"><AuditLog /></AccessRoute>} />
            <Route path="/announcements" element={<AccessRoute module="announcements"><Announcements /></AccessRoute>} />
            <Route path="/profile" element={<AccessRoute module="profile"><Profile /></AccessRoute>} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <HashRouter>
          <AppContent />
        </HashRouter>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
