const webpush = require('web-push');
const PushSubscription = require('../models/pushSubscription.model');

const vapidReady = () => Boolean(process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY && process.env.VAPID_SUBJECT);

function configure() {
  if (!vapidReady()) return false;
  webpush.setVapidDetails(process.env.VAPID_SUBJECT, process.env.VAPID_PUBLIC_KEY, process.env.VAPID_PRIVATE_KEY);
  return true;
}

function validSubscription(subscription) {
  return subscription && typeof subscription.endpoint === 'string' &&
    typeof subscription.keys?.p256dh === 'string' && typeof subscription.keys?.auth === 'string';
}

async function saveSubscription(userId, subscription, userAgent = '') {
  if (!validSubscription(subscription)) throw Object.assign(new Error('Invalid push subscription.'), { status: 400 });
  return PushSubscription.findOneAndUpdate(
    { endpoint: subscription.endpoint },
    { user: userId, endpoint: subscription.endpoint, keys: subscription.keys, userAgent: String(userAgent).slice(0, 512) },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );
}

async function removeSubscription(userId, endpoint) {
  if (typeof endpoint !== 'string' || !endpoint) throw Object.assign(new Error('A subscription endpoint is required.'), { status: 400 });
  await PushSubscription.deleteOne({ user: userId, endpoint });
}

async function sendToUser(userId, payload) {
  if (!vapidReady()) return { delivered: 0, skipped: 'Push notifications are not configured.' };
  configure();
  const subscriptions = await PushSubscription.find({ user: userId });
  const data = JSON.stringify(payload);
  let delivered = 0;
  await Promise.all(subscriptions.map(async (subscription) => {
    try {
      await webpush.sendNotification({ endpoint: subscription.endpoint, keys: subscription.keys }, data, { TTL: 60 * 60 });
      delivered += 1;
    } catch (error) {
      // Browser subscriptions can expire. Remove only confirmed stale endpoints.
      if (error.statusCode === 404 || error.statusCode === 410) await PushSubscription.deleteOne({ _id: subscription._id });
      else console.warn('Push notification delivery failed:', error.statusCode || error.message);
    }
  }));
  return { delivered };
}

module.exports = { vapidReady, saveSubscription, removeSubscription, sendToUser };
