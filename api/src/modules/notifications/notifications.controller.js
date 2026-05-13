const prisma = require('../../prisma/prisma.client');

// GET /api/notifications/my
const getMyNotifications = async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where:   { citizenId: req.user.id },
      orderBy: { sentAt: 'desc' },
    });

    res.status(200).json({
      count: notifications.length,
      data:  notifications,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PATCH /api/notifications/:id/read
const markAsRead = async (req, res) => {
  try {
    const notification = await prisma.notification.update({
      where: { id: req.params.id },
      data:  { isRead: true },
    });
    res.status(200).json({ message: 'Marked as read', data: notification });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getMyNotifications, markAsRead };