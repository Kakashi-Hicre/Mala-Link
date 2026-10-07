import axios from 'axios';
import Cookies from 'js-cookie';

// Points to your Express backend
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

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

// ═══════════════════════════════════════════════════════════════
// FILE 1 — lib/api.js
// ADD this adminAPI block anywhere after the existing exports.
// It stubs all admin endpoints across all 5 phases.
//
// ✅ = backend route already exists (no backend work needed)
// 🔜 = backend route needs to be created (noted per phase)
// ═══════════════════════════════════════════════════════════════

export const adminAPI = {

  // ── Phase 2: Overview ──────────────────────────────────────
  // 🔜 Needs: GET /api/admin/overview  (new route + service)
  getOverview: () => api.get('/admin/overview'),


  // ── Phase 3: Citizens ──────────────────────────────────────
  // ✅ GET  /api/citizens?search=&role=   (already restrictTo ADMIN)
  // ✅ GET  /api/citizens/:id              (already restrictTo ADMIN)
  // 🔜 Needs: PATCH /api/citizens/:id/role  (add to citizens.routes.js)
  getCitizens:       (params) => api.get('/citizens', { params }),
  getCitizenById:    (id)     => api.get(`/citizens/${id}`),
  updateCitizenRole: (id, data) => api.patch(`/citizens/${id}/role`, data),


  // ── Phase 4: Agency Staff ───────────────────────────────────
  // ✅ POST /api/agencies/staff   (already restrictTo ADMIN)
  // 🔜 Needs: GET    /api/admin/staff      (new — list all staff across agencies)
  // 🔜 Needs: DELETE /api/admin/staff/:id  (new — remove a staff account)
  createStaff: (data) => api.post('/agencies/staff', data),
  getAllStaff:  (params) => api.get('/admin/staff', { params }),
  deleteStaff: (id)     => api.delete(`/admin/staff/${id}`),


  // ── Phase 5: Applications (admin read-only cross-agency view) ──
  // ✅ GET /api/applications?status=&type=  (already restrictTo ADMIN)
  getAllApplications: (params) => api.get('/applications', { params }),


  // ── Phase 5: ID Cards ───────────────────────────────────────
  // 🔜 Needs: GET /api/admin/cards?status=  (new — all cards with filters)
  // ✅ PATCH /api/idcards/:cardNumber/status  (already restrictTo AGENCY_STAFF|ADMIN)
  getAllCards:       (params)            => api.get('/admin/cards', { params }),
  updateCardStatus: (cardNumber, data)  => api.patch(`/idcards/${cardNumber}/status`, data),
};



// ═══════════════════════════════════════════════════════════════
// FILE 2 — app/(auth)/login/page.js  (or wherever your login is)
//
// CHANGE: After a successful citizen login, check the user's role
// and redirect to /admin instead of /dashboard if role === 'ADMIN'.
//
// Your login currently probably looks like this:
//
//   const res  = await authAPI.login({ email, password });
//   const token = res.data.access_token;
//   Cookies.set('token', token);
//
//   const me = await citizensAPI.getMe();   // <-- fetches role
//   Cookies.set('user', JSON.stringify(me.data.data));
//
//   router.push('/dashboard');              // <-- THIS LINE changes
//
// Replace that last line with the snippet below:
// ═══════════════════════════════════════════════════════════════

// ── Drop-in replacement for the redirect after login ──────────
//
//   const me   = await citizensAPI.getMe();
//   const user = me.data.data;
//   Cookies.set('user', JSON.stringify(user));
//
//   // Role-based redirect — admin goes to /admin, everyone else to /dashboard
//   if (user.role === 'ADMIN') {
//     router.push('/admin');
//   } else {
//     router.push('/dashboard');
//   }
//
// That's all. The AdminLayout auth guard handles any edge case
// where someone manually navigates to /admin without the right role.
// ═══════════════════════════════════════════════════════════════



// ═══════════════════════════════════════════════════════════════
// FOLDER STRUCTURE to create now (all files can be empty or use
// the placeholder pattern from admin/page.js for now):
//
//   app/
//     admin/
//       _components/
//         AdminSidebar.js    ← provided above
//       layout.js            ← provided above
//       page.js              ← provided above
//       citizens/
//         page.js            ← Phase 3 (leave empty for now)
//       staff/
//         page.js            ← Phase 4 (leave empty for now)
//       applications/
//         page.js            ← Phase 5 (leave empty for now)
//       cards/
//         page.js            ← Phase 5 (leave empty for now)
//
// For the empty Phase pages, paste this minimal placeholder
// so Next.js doesn't throw a "missing default export" error:
// ═══════════════════════════════════════════════════════════════

// ── Minimal placeholder for not-yet-built pages ────────────────
// (copy into each empty page until that Phase is built)

export function ComingSoonPage({ title }) {
  return (
    <div>
      <div className="mb-8">
        <p className="text-xs font-bold text-[#f59e0b] uppercase tracking-widest mb-1.5">
          Admin Portal
        </p>
        <h1 className="text-2xl font-bold text-[#0f172a] tracking-tight">{title}</h1>
      </div>
      <div className="bg-white border border-[#e2e8f0] rounded-2xl px-8 py-16 text-center">
        <div className="w-12 h-12 bg-[#f1f5f9] rounded-2xl flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">🔜</span>
        </div>
        <p className="font-bold text-[#0f172a]">Coming soon</p>
        <p className="text-sm text-[#64748b] mt-1">This page will be built in the next phase.</p>
      </div>
    </div>
  );
}

// citizens/page.js  → <ComingSoonPage title="Citizens" />
// staff/page.js     → <ComingSoonPage title="Agency Staff" />
// applications/page.js → <ComingSoonPage title="Applications" />
// cards/page.js     → <ComingSoonPage title="ID Cards" />
export default api;