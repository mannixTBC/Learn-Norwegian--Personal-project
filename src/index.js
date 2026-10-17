import React from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import App from './App';
import { registerServiceWorker } from './serviceWorker';
import { isNativeApp } from './services/api';
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';

const isInstalledAppPreview = import.meta.env.DEV
  && new URLSearchParams(window.location.search).get('appPreview') === '1';
const isInstalledApp = isNativeApp()
  || isInstalledAppPreview
  || window.matchMedia('(display-mode: standalone)').matches
  || window.navigator.standalone === true;
document.documentElement.classList.toggle('is-installed-app', isInstalledApp);

/**
 * Punctul de intrare al aplicației React.
 * Montează componenta App în elementul HTML cu id="root".
 */
const container = document.getElementById('root');
// În development, placeholder-ul <!--app-html--> este un nod comentariu, nu
// conținut prerandat. Hidratăm doar când build-ul SSR a introdus elemente reale.
if (container.childElementCount > 0) hydrateRoot(container, <App />);
else createRoot(container).render(<App />);

registerServiceWorker();
