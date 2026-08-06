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
import './App.css';

// App content wrapper that listens to Auth state
const AppContent = () => {
  const { user, isLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
            <Route path="/network" element={<NetworkMonitoring />} />
            <Route path="/systems" element={<SystemsRegistry />} />
            <Route path="/maintenance" element={<MaintenanceManagement />} />
            <Route path="/helpdesk" element={<HelpdeskTicketing />} />
            <Route path="/licenses" element={<LicenseWarranty />} />
            <Route path="/vendors" element={<VendorContract />} />
            <Route path="/users" element={<UserManagement />} />
            <Route path="/audit-logs" element={<AuditLog />} />
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
