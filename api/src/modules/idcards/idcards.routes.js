const express = require('express');
const router  = express.Router();
const { protect, restrictTo } = require('../../common/middlewares/auth.middleware');
const {
  issueIDCard,
  createManualCard,
  updateCardStatus,
  getMyIDCards,
  getIDCardById,
  markAsCollected,
  searchIDCard,
} = require('./idcards.controller');

// ── PUBLIC route — no auth required ───────────────────────────
router.get('/search', searchIDCard);  // GET /api/idcards/search?cardNumber=ML-NRB-2024-123456

// ── All routes below require authentication ────────────────────
router.use(protect);

// ── Citizen routes ─────────────────────────────────────────────
router.get('/my',  restrictTo('CITIZEN'), getMyIDCards);   // GET  /api/idcards/my
router.get('/:id', getIDCardById);                         // GET  /api/idcards/:id

// ── Staff routes ───────────────────────────────────────────────
router.post('/manual',
  restrictTo('AGENCY_STAFF', 'ADMIN'),
  createManualCard                                          // POST  /api/idcards/manual
);

router.patch('/:cardNumber/status',
  restrictTo('AGENCY_STAFF', 'ADMIN'),
  updateCardStatus                                          // PATCH /api/idcards/:cardNumber/status
);

router.post('/:applicationId/issue',
  restrictTo('AGENCY_STAFF', 'ADMIN'),
  issueIDCard                                               // POST  /api/idcards/:applicationId/issue
);

router.patch('/:applicationId/collect',
  restrictTo('AGENCY_STAFF', 'ADMIN'),
  markAsCollected                                           // PATCH /api/idcards/:applicationId/collect
);

module.exports = router;