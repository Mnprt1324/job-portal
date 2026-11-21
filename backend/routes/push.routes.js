const express = require('express');
const { authenticate } = require('../middleware/auth');
const push = require('../services/push.service');

const router = express.Router();

router.get('/public-key', authenticate, (req, res) => {
  if (!push.vapidReady()) return res.status(503).json({ success: false, message: 'Push notifications are not configured.' });
  return res.json({ success: true, publicKey: process.env.VAPID_PUBLIC_KEY });
});

router.post('/subscribe', authenticate, async (req, res) => {
  try {
    if (!push.vapidReady()) return res.status(503).json({ success: false, message: 'Push notifications are not configured.' });
    await push.saveSubscription(req.user._id, req.body?.subscription, req.get('user-agent'));
    return res.status(201).json({ success: true, message: 'Push notifications enabled.' });
  } catch (error) {
    return res.status(error.status || 500).json({ success: false, message: error.status ? error.message : 'Unable to save push subscription.' });
  }
});

router.delete('/subscribe', authenticate, async (req, res) => {
  try {
    await push.removeSubscription(req.user._id, req.body?.endpoint);
    return res.json({ success: true });
  } catch (error) {
    return res.status(error.status || 500).json({ success: false, message: error.status ? error.message : 'Unable to remove push subscription.' });
  }
});

module.exports = router;
