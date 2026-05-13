const express = require('express');
const router  = express.Router();
const { protect, restrictTo } = require('../../common/middlewares/auth.middleware');
const {
  getMe,
  updateMe,
  getAllCitizens,
  getCitizenById,
} = require('./citizens.controller');

router.use(protect);

// Citizen routes
router.get('/me',    getMe);     // GET  /api/citizens/me
router.patch('/me',  updateMe);  // PATCH /api/citizens/me

// Admin only routes
router.get('/',      restrictTo('ADMIN'), getAllCitizens);     // GET /api/citizens?search=john
router.get('/:id',   restrictTo('ADMIN'), getCitizenById);    // GET /api/citizens/:id

module.exports = router;