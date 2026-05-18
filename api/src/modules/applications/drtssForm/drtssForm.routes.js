const express = require('express');
const router  = express.Router();
const { protect, restrictTo } = require('../../../common/middlewares/auth.middleware');
const { submitDrtssForm, getDrtssForm, verifyDrtssForm } = require('./drtssForm.controller');

router.use(protect);

// POST   /api/forms/drtss/:applicationId
// GET    /api/forms/drtss/:applicationId
// PATCH  /api/forms/drtss/:applicationId/verify

router.post(  '/:applicationId',        restrictTo('CITIZEN'),               submitDrtssForm);
router.get(   '/:applicationId',                                              getDrtssForm);
router.patch( '/:applicationId/verify', restrictTo('AGENCY_STAFF', 'ADMIN'), verifyDrtssForm);

module.exports = router;