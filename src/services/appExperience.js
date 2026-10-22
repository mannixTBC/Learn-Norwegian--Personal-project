const APP_PREVIEW_KEY = 'nordlingo_app_preview';

/** Explicit preview opt-in, kept only for this browser tab. */
export function resolveAppPreview(search, storage) {
  const requested = new URLSearchParams(search).get('appPreview');
  if (requested === '1' || requested === '0') {
    const enabled = requested === '1';
    try {
      if (enabled) storage?.setItem(APP_PREVIEW_KEY, '1');
      else storage?.removeItem(APP_PREVIEW_KEY);
    } catch { /* The explicit URL still works when storage is unavailable. */ }
    return enabled;
  }
  try {
    return storage?.getItem(APP_PREVIEW_KEY) === '1';
  } catch {
    return false;
  }
}

/** Set by the entry point for Capacitor, standalone PWA and explicit app preview. */
export const isInstalledAppView = () => typeof document !== 'undefined'
  && document.documentElement.classList.contains('is-installed-app');
