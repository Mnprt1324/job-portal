import { useNotificationUnreadQuery } from '../../redux/notificationsApi';

export function NotificationBadge() {
  const { data } = useNotificationUnreadQuery(undefined, { pollingInterval: 20000 });
  const unread = data?.unread || 0;
  return unread > 0 ? <span className="js-nav-count" aria-label={`${unread} unread notifications`}>{unread > 99 ? '99+' : unread}</span> : null;
}
