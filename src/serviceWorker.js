/**
 * Înregistrează service worker-ul publicat de Vite.
 * În dezvoltare rămâne dezactivat ca să nu servească fișiere vechi din cache.
 */
export function registerServiceWorker() {
  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return;

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').catch((error) => {
      console.error('Service worker-ul NordLingo nu a putut fi înregistrat:', error);
    });
  });
}
