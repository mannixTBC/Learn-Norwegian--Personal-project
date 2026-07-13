import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import * as serviceWorker from './serviceWorker';

/**
 * Punctul de intrare al aplicației React.
 * Montează componenta App în elementul HTML cu id="root".
 */
ReactDOM.render(<App />, document.getElementById('root'));

// Service worker dezactivat — activează register() dacă vrei funcționare offline (PWA)
serviceWorker.unregister();
