const express = require('express');
const router  = express.Router();
const { protect, restrictTo } = require('../../../common/middlewares/auth.middleware');
const {
  submitImmigrationForm,
  getImmigrationForm,
  verifyImmigrationForm,
} = require('./immigrationForm.controller');

router.use(protect);

// POST   /api/forms/immigration/:applicationId
// GET    /api/forms/immigration/:applicationId
// PATCH  /api/forms/immigration/:applicationId/verify

router.post(  '/:applicationId',        restrictTo('CITIZEN'),               submitImmigrationForm);
router.get(   '/:applicationId',                                              getImmigrationForm);
router.patch( '/:applicationId/verify', restrictTo('AGENCY_STAFF', 'ADMIN'), verifyImmigrationForm);

module.exports = router;