const express = require('express');
const router  = express.Router();
const { protect, restrictTo } = require('../../common/middlewares/auth.middleware');
const {
  createApplication,
  submitForm,
  getForm,
  verifyForm,
  getMyApplications,
  getApplicationById,
  getAgencyApplications,
  updateStatus,
  getAllApplications,
} = require('./applications.controller');

// All application routes require login
router.use(protect);

// ── Citizen routes ─────────────────────────────────────────────
router.post('/',      restrictTo('CITIZEN'), createApplication);  // POST   /api/applications
router.get('/my',     restrictTo('CITIZEN'), getMyApplications);  // GET    /api/applications/my
router.post('/:id/form', restrictTo('CITIZEN'), submitForm);      // POST   /api/applications/:id/form
router.get('/:id/form',  getForm);                                // GET    /api/applications/:id/form  (citizen + staff)

// ── Staff routes ───────────────────────────────────────────────
router.get('/agency/all',        restrictTo('AGENCY_STAFF', 'ADMIN'), getAgencyApplications);  // GET    /api/applications/agency/all
router.patch('/:id/status',      restrictTo('AGENCY_STAFF', 'ADMIN'), updateStatus);           // PATCH  /api/applications/:id/status
router.patch('/:id/form/verify', restrictTo('AGENCY_STAFF', 'ADMIN'), verifyForm);             // PATCH  /api/applications/:id/form/verify

// ── Admin only ─────────────────────────────────────────────────
router.get('/:id', getApplicationById);   // GET    /api/applications/:id
router.get('/',    restrictTo('ADMIN'), getAllApplications);       // GET    /api/applications

module.exports = router;