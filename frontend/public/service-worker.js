const CACHE_NAME = 'joborbit-shell-v1';
const APP_SHELL = ['/', '/manifest.webmanifest', '/favicon.svg'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)),
    )).then(() => self.clients.claim()),
  );
});

// Navigation stays fresh whenever possible. The cached shell is only used when offline.
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET' || event.request.mode !== 'navigate') return;

  event.respondWith(
    fetch(event.request).catch(async () => {
      const cached = await caches.match('/');
      return cached || Response.error();
    }),
  );
});

// The backend will send this payload after the push-subscription API is added.
self.addEventListener('push', (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = { body: event.data?.text() };
  }

  const title = payload.title || 'JobOrbit';
  const options = {
    body: payload.body || 'You have a new update.',
    icon: '/favicon.svg',
    badge: '/favicon.svg',
    tag: payload.tag || 'joborbit-update',
    renotify: Boolean(payload.renotify),
    data: { url: payload.url || '/' },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = new URL(event.notification.data?.url || '/', self.location.origin).href;

  event.waitUntil((async () => {
    const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    const existing = windows.find((client) => client.url === target);
    if (existing) return existing.focus();
    return self.clients.openWindow(target);
  })());
});
