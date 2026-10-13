import React from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import App from './App';
import { registerServiceWorker } from './serviceWorker';
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';

const isInstalledApp = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
document.documentElement.classList.toggle('is-installed-app', isInstalledApp);

/**
 * Punctul de intrare al aplicației React.
 * Montează componenta App în elementul HTML cu id="root".
 */
const container = document.getElementById('root');
if (container.hasChildNodes()) hydrateRoot(container, <App />);
else createRoot(container).render(<App />);

registerServiceWorker();
