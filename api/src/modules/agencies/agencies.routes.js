const express = require('express');
const router  = express.Router();
const { protect, restrictTo } = require('../../common/middlewares/auth.middleware');
const {
  createStaff,
  staffLogin,
  getAllAgencies,
  getAgencyStats,
} = require('./agencies.controller');

// Public — no login needed
router.get('/',           getAllAgencies);   // GET  /api/agencies
router.post('/staff/login', staffLogin);    // POST /api/agencies/staff/login

// Protected
router.post('/staff',     protect, restrictTo('ADMIN'), createStaff);           // POST /api/agencies/staff
router.get('/:id/stats',  protect, restrictTo('ADMIN', 'AGENCY_STAFF'), getAgencyStats); // GET /api/agencies/:id/stats

module.exports = router;