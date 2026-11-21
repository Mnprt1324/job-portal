const Notification = require('../models/notification.model');
const { sendToUser } = require('./push.service');
const { publishToUser } = require('../socket');

async function createNotification(input) {
  try {
    const notification = await Notification.create(input);
    return { notification, created: true };
  } catch (error) {
    if (error?.code !== 11000) throw error;
    const notification = await Notification.findOne({ eventKey: input.eventKey });
    return { notification, created: false };
  }
}

async function createAndDeliver(input) {
  const result = await createNotification(input);
  if (!result.created) return result;
  const notification = result.notification.toObject();
  publishToUser(input.recipient, 'notification:created', notification);
  sendToUser(input.recipient, { title: input.title, body: input.body, url: input.link, tag: input.eventKey })
    .catch((error) => console.warn('Push notification delivery failed:', error.message));
  return result;
}

async function listForUser(userId, { limit = 50, unreadOnly = false } = {}) {
  const safeLimit = Math.min(Math.max(Number(limit) || 50, 1), 100);
  const filter = { recipient: userId };
  if (unreadOnly) filter.readAt = null;
  return Notification.find(filter).sort({ createdAt: -1, _id: -1 }).limit(safeLimit).lean();
}

async function unreadForUser(userId) {
  return Notification.countDocuments({ recipient: userId, readAt: null });
}

async function markRead(userId, notificationId) {
  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, recipient: userId, readAt: null },
    { readAt: new Date() },
    { new: true },
  ).lean();
  return notification;
}

async function markAllRead(userId) {
  const result = await Notification.updateMany({ recipient: userId, readAt: null }, { readAt: new Date() });
  return result.modifiedCount;
}

module.exports = { createAndDeliver, listForUser, unreadForUser, markRead, markAllRead };
