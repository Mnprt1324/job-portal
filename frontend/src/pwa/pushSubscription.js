import { getPushPublicKeyApi, subscribePushApi } from '../API/api';

const base64ToUint8Array = (value) => {
  const padding = '='.repeat((4 - value.length % 4) % 4);
  const base64 = (value + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = window.atob(base64);
  return Uint8Array.from(raw, (character) => character.charCodeAt(0));
};

export async function saveBrowserPushSubscription() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window) || Notification.permission !== 'granted') return;
  const registration = await navigator.serviceWorker.ready;
  const existing = await registration.pushManager.getSubscription();
  const subscription = existing || await (async () => {
    const { data } = await getPushPublicKeyApi();
    if (!data?.success || !data.publicKey) throw new Error(data?.message || 'Push notifications are not configured.');
    return registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: base64ToUint8Array(data.publicKey) });
  })();
  await subscribePushApi(subscription.toJSON());
}
