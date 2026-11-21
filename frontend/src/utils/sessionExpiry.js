import Cookies from 'js-cookie';

const tokenValue = () => localStorage.getItem('token')?.replace(/^Bearer\s+/i, '');

export const getTokenExpiry = () => {
  const token = tokenValue();
  if (!token) return null;
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = JSON.parse(atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=')));
    return Number.isFinite(decoded.exp) ? decoded.exp * 1000 : null;
  } catch {
    return null;
  }
};

export const clearExpiredSession = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('persist:root');
  Cookies.remove('token');
};

export const redirectForExpiredSession = () => {
  clearExpiredSession();
  if (window.location.pathname === '/login') return;
  window.location.replace('/login?reason=session-expired');
};

export const isAuthenticationFailure = (status) => status === 401;
