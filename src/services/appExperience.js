/** Set by the entry point for Capacitor, standalone PWA and development app preview. */
export const isInstalledAppView = () => typeof document !== 'undefined'
  && document.documentElement.classList.contains('is-installed-app');
