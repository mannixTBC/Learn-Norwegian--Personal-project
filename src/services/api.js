import { Capacitor } from '@capacitor/core';

const configuredOrigin = String(
  import.meta.env.VITE_API_BASE_URL
  || import.meta.env.VITE_SITE_URL
  || 'https://nordlingo.net',
).replace(/\/$/, '');

export const isNativeApp = () => Capacitor.isNativePlatform();

/**
 * Browserul folosește în continuare URL-uri relative și proxy-ul Vite/Netlify.
 * Aplicația Capacitor apelează API-ul public, deoarece originea ei locală este
 * https://localhost și nu conține funcțiile Netlify.
 */
export const apiUrl = (path) => {
  if (/^https?:\/\//i.test(path)) return path;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return isNativeApp() ? `${configuredOrigin}${normalizedPath}` : normalizedPath;
};

export const webUrl = (path = '/') => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${configuredOrigin}${normalizedPath}`;
};
