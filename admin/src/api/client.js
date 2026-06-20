const API_URL = 'https://the-gents-studio-app-api.vercel.app';

export function getToken() {
  return localStorage.getItem('gents_admin_access_token');
}

export function setSession(session) {
  localStorage.setItem('gents_admin_access_token', session.accessToken);
  localStorage.setItem('gents_admin_refresh_token', session.refreshToken);
  localStorage.setItem('gents_admin_profile', JSON.stringify(session.admin));
}

export function clearSession() {
  localStorage.removeItem('gents_admin_access_token');
  localStorage.removeItem('gents_admin_refresh_token');
  localStorage.removeItem('gents_admin_profile');
}

export async function apiRequest(path, options = {}) {
  const token = getToken();

  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Request failed');

  return data;
}

export const api = {
  uploadImage: body => apiRequest('/api/media/upload-image', { method: 'POST', body }),
  login: body => apiRequest('/api/auth/login', { method: 'POST', body }),
  logout: body => apiRequest('/api/auth/logout', { method: 'POST', body }),

  dashboard: () => apiRequest('/api/reports/dashboard'),

  customers: search => apiRequest(`/api/customers${search ? `?search=${encodeURIComponent(search)}` : ''}`),
  updateCustomer: (id, body) => apiRequest(`/api/customers/${id}`, { method: 'PUT', body }),

  services: () => apiRequest('/api/services'),
  createService: body => apiRequest('/api/services', { method: 'POST', body }),
  updateService: (id, body) => apiRequest(`/api/services/${id}`, { method: 'PUT', body }),
  deleteService: id => apiRequest(`/api/services/${id}`, { method: 'DELETE' }),

  staff: () => apiRequest('/api/staff'),
  createStaff: body => apiRequest('/api/staff', { method: 'POST', body }),
  updateStaff: (id, body) => apiRequest(`/api/staff/${id}`, { method: 'PUT', body }),

  appointments: () => apiRequest('/api/appointments'),

  inventory: () => apiRequest('/api/inventory'),
  createInventoryItem: body => apiRequest('/api/inventory', { method: 'POST', body }),
  updateInventoryItem: (id, body) => apiRequest(`/api/inventory/${id}`, { method: 'PUT', body }),

  settings: () => apiRequest('/api/settings'),
  updateSetting: (key, value) => apiRequest(`/api/settings/${key}`, { method: 'PUT', body: { value } }),

  addStamp: body => apiRequest('/api/stamps/add', { method: 'POST', body }),

  adminReviews: () => apiRequest('/api/reviews/admin/all'),
  approveReview: id => apiRequest(`/api/reviews/admin/${id}/approve`, { method: 'PUT' }),
  rejectReview: id => apiRequest(`/api/reviews/admin/${id}/reject`, { method: 'PUT' }),

  appNotifications: () => apiRequest('/api/app-notifications/admin/all'),
  createAppNotification: body => apiRequest('/api/app-notifications/admin', { method: 'POST', body }),
  updateAppNotification: (id, body) => apiRequest(`/api/app-notifications/admin/${id}`, { method: 'PUT', body }),
};
