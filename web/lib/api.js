import axios from 'axios';
import Cookies from 'js-cookie';

// Points to your Express backend
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
});

// Automatically attach the JWT token to every request
api.interceptors.request.use((config) => {
  const token = Cookies.get('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// If token expires, redirect to login automatically
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      Cookies.remove('token');
      Cookies.remove('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ─── Auth ────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login:    (data) => api.post('/auth/login', data),
};

// ─── Citizens ────────────────────────────────────────────
export const citizensAPI = {
  getMe:    ()     => api.get('/citizens/me'),
  updateMe: (data) => api.patch('/citizens/me', data),
};

// ─── Applications ────────────────────────────────────────
export const applicationsAPI = {
  create:       (data)      => api.post('/applications', data),
  getMy:        ()          => api.get('/applications/my'),
  getById:      (id)        => api.get(`/applications/${id}`),
  updateStatus: (id, data)  => api.patch(`/applications/${id}/status`, data),
  getAgencyAll: (params)    => api.get('/applications/agency/all', { params }),

  // ── Application Form ─────────────────────────────────
  submitForm:  (id, data)  => api.post(`/applications/${id}/form`, data),
  getForm:     (id)        => api.get(`/applications/${id}/form`),
  verifyForm:  (id, data)  => api.patch(`/applications/${id}/form/verify`, data),
};

// ─── Documents ───────────────────────────────────────────
export const documentsAPI = {
  upload: (applicationId, formData) =>
    api.post(`/documents/upload/${applicationId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getByApplication: (applicationId) => api.get(`/documents/${applicationId}`),
  delete:           (documentId)    => api.delete(`/documents/${documentId}`),
};

// ─── Notifications ───────────────────────────────────────
export const notificationsAPI = {
  getMy:      ()   => api.get('/notifications/my'),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
};

// ─── Agencies ────────────────────────────────────────────
export const agenciesAPI = {
  getAll:     ()     => api.get('/agencies'),
  getStats:   (id)   => api.get(`/agencies/${id}/stats`),
  staffLogin: (data) => api.post('/agencies/staff/login', data),
};

// ─── ID Cards ────────────────────────────────────────────
export const idcardsAPI = {
  getMy:           ()              => api.get('/idcards/my'),
  getById:         (id)            => api.get(`/idcards/${id}`),
  issue:           (applicationId) => api.post(`/idcards/${applicationId}/issue`),
  markAsCollected: (applicationId) => api.patch(`/idcards/${applicationId}/collect`),

  // Staff: manually register a physical card
  createManual:    (data)          => api.post('/idcards/manual', data),

  // Staff: update card status (ACTIVE / LOST / EXPIRED / SUSPENDED)
  updateStatus:    (cardNumber, data) => api.patch(`/idcards/${cardNumber}/status`, data),

  // Public: search by card number — no token needed
  // Uses plain fetch in the landing page, but this is here for authenticated pages
  search: (cardNumber) =>
    fetch(`${API_URL}/idcards/search?cardNumber=${encodeURIComponent(cardNumber)}`)
      .then(res => res.json()),
};

export default api;