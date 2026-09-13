import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
}, (error) => Promise.reject(error));

// Global error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken');
      if (window.location.pathname.startsWith('/admin') && window.location.pathname !== '/admin/login') {
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

// ── Lost Items ────────────────────────────────────────────────────
export const getLostItems = (params = {}) =>
  api.get('/lost', { params });

export const getLostItem = (id) =>
  api.get(`/lost/${id}`);

export const postLostItem = (formData) =>
  api.post('/lost', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

// ── Found Items ───────────────────────────────────────────────────
export const getFoundItems = (params = {}) =>
  api.get('/found', { params });

export const getFoundItem = (id) =>
  api.get(`/found/${id}`);

export const postFoundItem = (formData) =>
  api.post('/found', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

// ── Search ────────────────────────────────────────────────────────
export const searchItems = (params = {}) =>
  api.get('/search', { params });

// ── Campus Office Settings ───────────────────────────────────────
// Public, read-only — returns only official Campus Office info (never
// private reporter contact details).
export const getOfficeInfo = () =>
  api.get('/settings/office');

// Admin-only — update the single global Campus Office settings document.
export const updateOfficeInfo = (payload) =>
  api.patch('/admin/settings/office', payload);

// ── Admin Auth ────────────────────────────────────────────────────
export const adminLogin = (credentials) =>
  api.post('/auth/login', credentials);

export const verifyToken = () =>
  api.get('/auth/verify');

export const changeAdminCredentials = (payload) =>
  api.patch('/admin/change-credentials', payload);

// ── Admin Operations ──────────────────────────────────────────────
export const getDashboardStats = () =>
  api.get('/admin/dashboard');

export const getAdminLostItems = (params = {}) =>
  api.get('/admin/lost', { params });

export const getAdminFoundItems = (params = {}) =>
  api.get('/admin/found', { params });

export const approveLostItem = (id) =>
  api.patch(`/admin/lost/${id}/approve`);

export const approveFoundItem = (id) =>
  api.patch(`/admin/found/${id}/approve`);

export const rejectLostItem = (id) =>
  api.patch(`/admin/lost/${id}/reject`);

export const rejectFoundItem = (id) =>
  api.patch(`/admin/found/${id}/reject`);

export const updateAdminLostItem = (id, payload) =>
  api.patch(`/admin/lost/${id}`, payload);

export const updateAdminFoundItem = (id, payload) =>
  api.patch(`/admin/found/${id}`, payload);

export const archiveAdminLostItem = (id) =>
  api.patch(`/admin/lost/${id}/archive`);

export const archiveAdminFoundItem = (id) =>
  api.patch(`/admin/found/${id}/archive`);

export const restoreAdminLostItem = (id) =>
  api.patch(`/admin/lost/${id}/restore`);

export const restoreAdminFoundItem = (id) =>
  api.patch(`/admin/found/${id}/restore`);

export const deleteAdminLostItem = (id) =>
  api.delete(`/admin/lost/${id}`);

export const deleteAdminFoundItem = (id) =>
  api.delete(`/admin/found/${id}`);

// ── Possible Matches ──────────────────────────────────────────────
export const getPossibleMatches = (status = 'pending') =>
  api.get('/admin/matches', { params: { status } });

export const confirmMatch = (id) =>
  api.patch(`/admin/matches/${id}/confirm`);

export const ignoreMatch = (id) =>
  api.patch(`/admin/matches/${id}/ignore`);

// ── OTP Verification ──────────────────────────────────────────────
export const sendOtp = (payload) =>
  api.post('/verification/send-otp', payload);

export const verifyOtp = (payload) =>
  api.post('/verification/verify-otp', payload);

// ── Notifications ─────────────────────────────────────────────────
export const getNotifications = (email, verificationToken, params = {}) =>
  api.get('/notifications', { params: { email, verificationToken, ...params } });

export const getUnreadNotificationCount = (email, verificationToken) =>
  api.get('/notifications/unread-count', { params: { email, verificationToken } });

export const markNotificationRead = (id, email, verificationToken) =>
  api.patch(`/notifications/${id}/read`, { email, verificationToken });

export const markAllNotificationsRead = (email, verificationToken) =>
  api.patch('/notifications/read-all', { email, verificationToken });

export const deleteNotification = (id, email, verificationToken) =>
  api.delete(`/notifications/${id}`, { data: { email, verificationToken } });

export default api;
