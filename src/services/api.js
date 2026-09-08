// src/services/api.js
const API_BASE_URL = 'http://localhost:5000/api';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('siims_jwt_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('siims_jwt_token');
        localStorage.removeItem('siims_auth');
        window.dispatchEvent(new CustomEvent('siims:auth-expired'));
      }
      const error = new Error(data.message || `Request failed with status ${response.status}`);
      error.status = response.status;
      throw error;
    }

    return data;
  } catch (error) {
    console.warn(`[API] Endpoint ${endpoint} failed:`, error.message);
    throw error;
  }
}

export const api = {
  // Auth
  login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  getProfile: () => request('/auth/me'),
  getDashboardSummary: () => request('/dashboard'),
  updateProfile: (profile) => request('/auth/profile', { method: 'PUT', body: JSON.stringify(profile) }),
  getNotifications: () => request('/auth/notifications'),
  markNotificationRead: (id) => request(`/auth/notifications/${id}/read`, { method: 'PATCH' }),
  markAllNotificationsRead: () => request('/auth/notifications/read-all', { method: 'PATCH' }),
  createAnnouncement: (announcement) => request('/auth/announcements', {
    method: 'POST',
    body: JSON.stringify(announcement)
  }),

  // Assets
  getAssets: (params = '') => request(`/assets${params ? `?${params}` : ''}`),
  getAssetById: (id) => request(`/assets/${id}`),
  createAsset: (assetData) => request('/assets', { method: 'POST', body: JSON.stringify(assetData) }),
  updateAsset: (id, assetData) => request(`/assets/${id}`, { method: 'PUT', body: JSON.stringify(assetData) }),
  deleteAsset: (id) => request(`/assets/${id}`, { method: 'DELETE' }),

  // Network Nodes
  getNetworkNodes: () => request('/network'),
  createNetworkNode: (nodeData) => request('/network', { method: 'POST', body: JSON.stringify(nodeData) }),
  pingNode: (id) => request(`/network/${id}/ping`, { method: 'POST' }),

  // Helpdesk Tickets
  getTickets: () => request('/helpdesk'),
  getHelpdeskTechnicians: () => request('/helpdesk/technicians'),
  notifyTicketAssignee: (id, message) => request(`/helpdesk/${id}/notify`, {
    method: 'POST',
    body: JSON.stringify({ message })
  }),
  getTicket: (id) => request(`/helpdesk/${id}`),
  createTicket: (ticketData) => request('/helpdesk', { method: 'POST', body: JSON.stringify(ticketData) }),
  
  // FIXED: Uses PUT method which calls updateTicketStatus
  updateTicket: (id, ticketData) => request(`/helpdesk/${id}`, { 
    method: 'PUT', 
    body: JSON.stringify(ticketData) 
  }),
  
  deleteTicket: (id) => request(`/helpdesk/${id}`, { method: 'DELETE' }),
  getMyTickets: () => request('/helpdesk/my'),
  getTicketStats: () => request('/helpdesk/stats'),

  // Maintenance
  getMaintenanceTasks: () => request('/maintenance'),
  createMaintenanceTask: (taskData) => request('/maintenance', { method: 'POST', body: JSON.stringify(taskData) }),

  // Software Licenses & Vendors
  getLicenses: () => request('/licenses'),
  createLicense: (licenseData) => request('/licenses', { method: 'POST', body: JSON.stringify(licenseData) }),
  getVendors: () => request('/vendors'),

  // Enterprise System Registry
  getSystems: () => request('/systems'),
  createSystem: (systemData) => request('/systems', { method: 'POST', body: JSON.stringify(systemData) }),

  // User Management & Audit Logs
  getUsers: () => request('/users'),
  createUser: (userData) => request('/users', { method: 'POST', body: JSON.stringify(userData) }),
  updateUser: (id, userData) => request(`/users/${id}`, { method: 'PUT', body: JSON.stringify(userData) }),
  toggleUserStatus: (id) => request(`/users/${id}/status`, { method: 'PATCH' }),
  deleteUser: (id) => request(`/users/${id}`, { method: 'DELETE' }),
  getAuditLogs: () => request('/audit-logs'),
  createAuditLog: (logData) => request('/audit-logs', { method: 'POST', body: JSON.stringify(logData) }),
};

export default api;