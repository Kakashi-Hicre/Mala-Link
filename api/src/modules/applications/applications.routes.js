const express = require('express');
const router  = express.Router();
const { protect, restrictTo } = require('../../common/middlewares/auth.middleware');
const {
  createApplication,
  getMyApplications,
  getApplicationById,
  getAgencyApplications,
  updateStatus,
  getAllApplications,
} = require('./applications.controller');

// All application routes require login
router.use(protect);

// ── Citizen ────────────────────────────────────────────────────
router.post('/',    restrictTo('CITIZEN'), createApplication);   // POST  /api/applications
router.get('/my',   restrictTo('CITIZEN'), getMyApplications);   // GET   /api/applications/my

// ── Staff ──────────────────────────────────────────────────────
router.get('/agency/all',   restrictTo('AGENCY_STAFF', 'ADMIN'), getAgencyApplications);  // GET   /api/applications/agency/all
router.patch('/:id/status', restrictTo('AGENCY_STAFF', 'ADMIN'), updateStatus);           // PATCH /api/applications/:id/status

// ── Admin only ─────────────────────────────────────────────────
router.get('/',    restrictTo('ADMIN'), getAllApplications);  // GET /api/applications
router.get('/:id', getApplicationById);                      // GET /api/applications/:id

module.exports = router;