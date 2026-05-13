const express = require('express');
const router  = express.Router();
const { protect } = require('../../common/middlewares/auth.middleware');
const { getMyNotifications, markAsRead } = require('./notifications.controller');

router.use(protect);

router.get('/my',          getMyNotifications); // GET  /api/notifications/my
router.patch('/:id/read',  markAsRead);         // PATCH /api/notifications/:id/read

module.exports = router;