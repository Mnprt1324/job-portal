import { Bell, BriefcaseBusiness, CheckCheck, CircleAlert, Loader2, MessageSquare, UserRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMarkAllNotificationsReadMutation, useMarkNotificationReadMutation, useNotificationsQuery } from '../../redux/notificationsApi';
import './NotificationsPage.css';

const iconFor = (type) => ({ application_received: BriefcaseBusiness, application_status_changed: UserRound, message_received: MessageSquare, interview_updated: Bell })[type] || Bell;
const when = (value) => {
  const seconds = Math.floor((Date.now() - new Date(value).getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return new Date(value).toLocaleDateString();
};

export function NotificationsPage() {
  const navigate = useNavigate();
  const { data, isLoading, isError, refetch } = useNotificationsQuery({ limit: 100 }, { pollingInterval: 30000 });
  const [markRead] = useMarkNotificationReadMutation();
  const [markAll, { isLoading: markingAll }] = useMarkAllNotificationsReadMutation();
  const notifications = data?.notifications || [];
  const unread = notifications.filter((notification) => !notification.readAt).length;
  const activitySummary = unread
    ? `${unread} unread ${unread === 1 ? 'update' : 'updates'}`
    : notifications.length
      ? `${notifications.length} recent ${notifications.length === 1 ? 'update' : 'updates'} - all read.`
      : 'Updates about applications, interviews, and messages will appear here.';

  const openNotification = async (notification) => {
    if (!notification.readAt) { try { await markRead(notification._id).unwrap(); } catch { /* The destination remains useful even if marking fails. */ } }
    navigate(notification.link);
  };

  return <section className="notifications-page" aria-labelledby="notifications-heading">
    <header className="notifications-heading">
      <div><p>Your workspace updates</p><h1 id="notifications-heading">Notifications</h1><span>{activitySummary}</span></div>
      {unread > 0 && <button className="btn-secondary notifications-read-all" type="button" onClick={() => markAll()} disabled={markingAll}>{markingAll ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <CheckCheck size={16} aria-hidden="true" />}{markingAll ? 'Marking…' : 'Mark all as read'}</button>}
    </header>
    {isLoading ? <div className="notifications-list notifications-skeleton" aria-busy="true"><span/><span/><span/></div> : isError ? <div className="notifications-state" role="alert"><CircleAlert size={26} aria-hidden="true"/><h2>Notifications did not load</h2><p>Check your connection and try again.</p><button className="btn-primary" type="button" onClick={refetch}>Try again</button></div> : !notifications.length ? <div className="notifications-state notifications-empty"><span className="notifications-empty-icon"><Bell size={23} aria-hidden="true"/></span><div><h2>No notifications yet</h2><p>Application, interview, and message updates will appear here.</p></div></div> : <div className="notifications-list" aria-label="Notification list">{notifications.map((notification) => { const Icon = iconFor(notification.type); return <button key={notification._id} className={`notification-item ${notification.readAt ? '' : 'is-unread'}`} type="button" onClick={() => openNotification(notification)}><span className="notification-icon"><Icon size={19} aria-hidden="true" /></span><span className="notification-copy"><strong>{notification.title}</strong><span>{notification.body}</span></span><time dateTime={notification.createdAt}>{when(notification.createdAt)}</time>{!notification.readAt && <span className="notification-dot" aria-label="Unread" />}</button>; })}</div>}
  </section>;
}
