import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';

/**
 * Punctul de intrare al aplicației React.
 * Montează componenta App în elementul HTML cu id="root".
 */
const root = createRoot(document.getElementById('root'));
root.render(<App />);

// Service worker dezactivat — activează register() dacă vrei funcționare offline (PWA)
