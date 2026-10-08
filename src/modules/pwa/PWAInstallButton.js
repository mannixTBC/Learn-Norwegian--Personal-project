import React, { useEffect, useState } from 'react';

/**
 * Browserul emite `beforeinstallprompt` numai când toate cerințele PWA sunt
 * îndeplinite. Păstrăm evenimentul și afișăm butonul exact în acel moment.
 */
export default function PWAInstallButton({ className = '' }) {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const displayMode = window.matchMedia('(display-mode: standalone)');
    const installed = displayMode.matches || window.navigator.standalone === true;
    setIsInstalled(installed);

    const saveInstallPrompt = (event) => {
      event.preventDefault();
      setInstallPrompt(event);
    };

    const markAsInstalled = () => {
      setIsInstalled(true);
      setInstallPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', saveInstallPrompt);
    window.addEventListener('appinstalled', markAsInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', saveInstallPrompt);
      window.removeEventListener('appinstalled', markAsInstalled);
    };
  }, []);

  if (isInstalled || !installPrompt) return null;

  const installApp = async () => {
    await installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
  };

  return (
    <button type="button" className={className} onClick={installApp}>
      <svg className="pwa-install-icon" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 3v11m0 0 4-4m-4 4-4-4M5 15v3a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3" />
      </svg>
      Descarcă aplicația
    </button>
  );
}
