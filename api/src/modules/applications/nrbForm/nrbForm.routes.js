const express = require('express');
const router  = express.Router();
const { protect, restrictTo } = require('../../../common/middlewares/auth.middleware');
const { submitNrbForm, getNrbForm, verifyNrbForm } = require('./nrbForm.controller');

router.use(protect);

// POST   /api/forms/nrb/:applicationId        — citizen submits/updates form
// GET    /api/forms/nrb/:applicationId        — citizen or staff views form
// PATCH  /api/forms/nrb/:applicationId/verify — staff verifies form

router.post(  '/:applicationId',        restrictTo('CITIZEN'),                     submitNrbForm);
router.get(   '/:applicationId',                                                   getNrbForm);
router.patch( '/:applicationId/verify', restrictTo('AGENCY_STAFF', 'ADMIN'),       verifyNrbForm);

module.exports = router;