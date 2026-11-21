import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { getTokenExpiry, redirectForExpiredSession } from '../../utils/sessionExpiry';

export function SessionExpiryGuard() {
  const user = useSelector((state) => state.auth.user);

  useEffect(() => {
    if (!user) return undefined;
    const expiresAt = getTokenExpiry();
    if (!expiresAt || expiresAt <= Date.now()) {
      redirectForExpiredSession();
      return undefined;
    }
    const timer = window.setTimeout(redirectForExpiredSession, Math.max(0, expiresAt - Date.now()));
    return () => window.clearTimeout(timer);
  }, [user]);

  return null;
}
