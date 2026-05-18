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
  create:       (data)     => api.post('/applications', data),
  getMy:        ()         => api.get('/applications/my'),
  getById:      (id)       => api.get(`/applications/${id}`),
  updateStatus: (id, data) => api.patch(`/applications/${id}/status`, data),
  getAgencyAll: (params)   => api.get('/applications/agency/all', { params }),
};

// ─── Agency-specific Forms ───────────────────────────────
// These map exactly to the backend routes:
//   POST   /api/forms/nrb/:applicationId
//   GET    /api/forms/nrb/:applicationId
//   PATCH  /api/forms/nrb/:applicationId/verify
//   (same pattern for immigration and drtss)

export const formsAPI = {
  // NRB — National ID Card
  submitNrb:         (applicationId, data) => api.post(`/forms/nrb/${applicationId}`, data),
  getNrb:            (applicationId)       => api.get(`/forms/nrb/${applicationId}`),
  verifyNrb:         (applicationId, data) => api.patch(`/forms/nrb/${applicationId}/verify`, data),

  // Immigration — Passport
  submitImmigration: (applicationId, data) => api.post(`/forms/immigration/${applicationId}`, data),
  getImmigration:    (applicationId)       => api.get(`/forms/immigration/${applicationId}`),
  verifyImmigration: (applicationId, data) => api.patch(`/forms/immigration/${applicationId}/verify`, data),

  // DRTSS — Driving Licence
  submitDrtss:       (applicationId, data) => api.post(`/forms/drtss/${applicationId}`, data),
  getDrtss:          (applicationId)       => api.get(`/forms/drtss/${applicationId}`),
  verifyDrtss:       (applicationId, data) => api.patch(`/forms/drtss/${applicationId}/verify`, data),
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
  getMy:           ()                 => api.get('/idcards/my'),
  getById:         (id)               => api.get(`/idcards/${id}`),
  issue:           (applicationId)    => api.post(`/idcards/${applicationId}/issue`),
  markAsCollected: (applicationId)    => api.patch(`/idcards/${applicationId}/collect`),
  createManual:    (data)             => api.post('/idcards/manual', data),
  updateStatus:    (cardNumber, data) => api.patch(`/idcards/${cardNumber}/status`, data),

  // Public: search by card number — no token needed
  search: (cardNumber) =>
    fetch(`${API_URL}/idcards/search?cardNumber=${encodeURIComponent(cardNumber)}`)
      .then(res => res.json()),
};

export default api;