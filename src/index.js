import React from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import App from './App';
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';

/**
 * Punctul de intrare al aplicației React.
 * Montează componenta App în elementul HTML cu id="root".
 */
const container = document.getElementById('root');
if (container.hasChildNodes()) hydrateRoot(container, <App />);
else createRoot(container).render(<App />);

// Service worker dezactivat — activează register() dacă vrei funcționare offline (PWA)
