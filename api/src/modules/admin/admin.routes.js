const express = require('express');
const router  = express.Router();
const { protect, restrictTo } = require('../../common/middlewares/auth.middleware');
const {
  getOverviewHandler, getAllStaffHandler,
  deleteStaffHandler, getAllCardsHandler,
} = require('./admin.controller');

router.use(protect);
router.use(restrictTo('ADMIN'));

router.get('/overview',     getOverviewHandler);   // Phase 2 — GET /api/admin/overview
router.get('/staff',        getAllStaffHandler);    // Phase 4 — GET /api/admin/staff
router.delete('/staff/:id', deleteStaffHandler);   // Phase 4 — DELETE /api/admin/staff/:id
router.get('/cards',        getAllCardsHandler);    // Phase 5 — GET /api/admin/cards

module.exports = router;