const express = require('express');
const mongoose = require('mongoose');
const { authenticate } = require('../middleware/auth');
const notifications = require('../services/notification.service');
const { publishToUser } = require('../socket');

const router = express.Router();
router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const items = await notifications.listForUser(req.user._id, { limit: req.query.limit, unreadOnly: req.query.unreadOnly === 'true' });
    return res.json({ success: true, notifications: items });
  } catch {
    return res.status(500).json({ success: false, message: 'Unable to load notifications.' });
  }
});

router.get('/unread', async (req, res) => {
  try { return res.json({ success: true, unread: await notifications.unreadForUser(req.user._id) }); }
  catch { return res.status(500).json({ success: false, message: 'Unable to load unread notifications.' }); }
});

router.patch('/read-all', async (req, res) => {
  try {
    const updated = await notifications.markAllRead(req.user._id);
    publishToUser(req.user._id, 'notification:read', { all: true });
    return res.json({ success: true, updated });
  } catch { return res.status(500).json({ success: false, message: 'Unable to update notifications.' }); }
});

router.patch('/:id/read', async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ success: false, message: 'Invalid notification ID.' });
  try {
    const notification = await notifications.markRead(req.user._id, req.params.id);
    if (notification) publishToUser(req.user._id, 'notification:read', { notificationId: req.params.id, readAt: notification.readAt });
    return res.json({ success: true, notification });
  } catch { return res.status(500).json({ success: false, message: 'Unable to update notification.' }); }
});

module.exports = router;
