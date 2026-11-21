import { useEffect, useState } from 'react';
import { BellOff, BellRing, Check, ShieldCheck, X } from 'lucide-react';
import { toast } from 'react-toastify';
import { saveBrowserPushSubscription } from '../../pwa/pushSubscription';
import './PushPermissionPrompt.css';

const canUsePush = () => 'Notification' in window && 'serviceWorker' in navigator;

export function PushPermissionPrompt() {
  const [permission, setPermission] = useState(null);
  const [visible, setVisible] = useState(false);
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    if (!canUsePush()) return;
    const current = Notification.permission;
    setPermission(current);
    setVisible(current === 'default' && sessionStorage.getItem('zipjob-push-prompt-hidden') !== 'true');
    if (current === 'granted') saveBrowserPushSubscription().catch(() => {});
  }, []);

  const requestPermission = async () => {
    if (!canUsePush() || requesting) return;
    setRequesting(true);
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      setVisible(result !== 'granted');
      if (result === 'granted') {
        await saveBrowserPushSubscription();
        toast.success('Browser notifications are enabled.');
      } else if (result === 'denied') {
        toast.info('Notifications are blocked. You can enable them later from your browser site settings.');
      }
    } catch {
      toast.error('Notifications were allowed, but ZipJob could not finish setup. Please try again.');
    } finally {
      setRequesting(false);
    }
  };

  if (!visible || permission !== 'default') return null;

  return (
    <section className="push-permission" aria-label="Push notification preference">
      <BellRing size={20} aria-hidden="true" />
      <div className="push-permission-copy">
        <strong>Stay updated on your opportunities</strong>
        <p>Allow notifications for applications, interview updates, and new messages—even when ZipJob is closed.</p>
      </div>
      <div className="push-permission-actions">
        <button className="btn-primary" type="button" onClick={requestPermission} disabled={requesting}>
          {requesting ? 'Requesting…' : 'Enable notifications'}
        </button>
        <button
          className="push-permission-dismiss"
          type="button"
          onClick={() => {
            sessionStorage.setItem('zipjob-push-prompt-hidden', 'true');
            setVisible(false);
          }}
          aria-label="Dismiss notification permission prompt"
        >
          <X size={18} aria-hidden="true" />
          Not now
        </button>
      </div>
    </section>
  );
}

export function PushPermissionStatus() {
  const [permission, setPermission] = useState(null);

  useEffect(() => {
    if (canUsePush()) setPermission(Notification.permission);
  }, []);

  if (permission !== 'granted') return null;
  return <span className="push-enabled-status" role="status"><Check size={15} aria-hidden="true" />Notifications enabled</span>;
}

export function PushNotificationSettings() {
  const [permission, setPermission] = useState(null);
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    setPermission(canUsePush() ? Notification.permission : 'unsupported');
  }, []);

  const requestPermission = async () => {
    if (!canUsePush() || requesting) return;
    setRequesting(true);
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      if (result === 'granted') {
        await saveBrowserPushSubscription();
        toast.success('Browser notifications are enabled.');
      }
      else if (result === 'denied') toast.info('Notifications are blocked. Enable them from browser site settings if you change your mind.');
    } catch {
      toast.error('We could not request notification permission. Please try again.');
    } finally {
      setRequesting(false);
    }
  };

  const status = {
    granted: { Icon: ShieldCheck, title: 'Notifications enabled', copy: 'This browser can receive ZipJob updates when the app is closed.' },
    denied: { Icon: BellOff, title: 'Notifications blocked', copy: 'Allow notifications in your browser site settings, then return here to manage them.' },
    default: { Icon: BellRing, title: 'Notifications are off', copy: 'Turn them on to hear about new applications, messages, and interview updates.' },
    unsupported: { Icon: BellOff, title: 'Notifications unavailable', copy: 'This browser does not support web push notifications.' },
  }[permission || 'default'];
  const { Icon } = status;

  return (
    <section className="push-settings" aria-labelledby="push-settings-title">
      <div className="push-settings-heading">
        <span className={`push-settings-icon is-${permission || 'default'}`}><Icon size={20} aria-hidden="true" /></span>
        <div>
          <h2 id="push-settings-title">Push notifications</h2>
          <p>{status.copy}</p>
        </div>
      </div>
      <div className="push-settings-status" role="status">
        <span>{status.title}</span>
        {permission === 'granted' && <Check size={16} aria-hidden="true" />}
      </div>
      <div className="push-settings-toggle-row">
        <div>
          <strong>Allow browser notifications</strong>
          <span>{permission === 'granted' ? 'Permission is active for this browser.' : permission === 'denied' ? 'Permission is blocked in browser site settings.' : 'Turn on to request browser permission.'}</span>
        </div>
        <button
          className="push-toggle"
          type="button"
          role="switch"
          aria-checked={permission === 'granted'}
          aria-label="Allow browser notifications"
          onClick={requestPermission}
          disabled={permission !== 'default' || requesting}
        >
          <span aria-hidden="true" />
        </button>
      </div>
      {permission === 'denied' && <p className="push-settings-help">Your browser controls this permission. Open the site settings for ZipJob, allow notifications, and refresh this page.</p>}
    </section>
  );
}
