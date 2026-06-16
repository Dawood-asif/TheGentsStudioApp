const API_URL = 'http://10.0.2.2:5000';

export async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'API request failed');
  return data;
}

export const api = {
  services: () => apiRequest('/api/services'),
  leaderboard: period => apiRequest(`/api/leaderboard?period=${period}`),
  signup: body => apiRequest('/api/customers', { method: 'POST', body }),
  requestOtp: body => apiRequest('/api/otp/send', { method: 'POST', body }),
  verifyOtp: body => apiRequest('/api/otp/verify', { method: 'POST', body }),
  createAppointment: body => apiRequest('/api/appointments', { method: 'POST', body }),
  calendarSlots: date => apiRequest(`/api/calendar/slots?date=${encodeURIComponent(date)}`),
  registerPushToken: body => apiRequest('/api/notifications/register-token', { method: 'POST', body }),
  staffAddStamp: (body, staffDeviceKey) => apiRequest('/api/staff-device/stamps/add', { method: 'POST', body, headers: { 'x-staff-device-key': staffDeviceKey } }),
  staffOfflineSync: (body, staffDeviceKey) => apiRequest('/api/staff-device/offline-sync', { method: 'POST', body, headers: { 'x-staff-device-key': staffDeviceKey } }),
};
