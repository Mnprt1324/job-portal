export function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').catch((error) => {
      // Registration can fail in unsupported/private browser contexts. The app remains usable.
      console.warn('JobOrbit service worker registration failed.', error);
    });
  }, { once: true });
}
