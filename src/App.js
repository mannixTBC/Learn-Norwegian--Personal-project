import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import './App.css';

import Navbar from './modules/layout/Navbar/Navbar';
import Footer from './modules/layout/Footer/Footer';
import AppRoutes from './routes/AppRoutes';
import { AuthProvider } from './modules/auth/AuthContext';

/**
 * Componenta rădăcină a aplicației „NorvegiaTa”.
 *
 * Structura paginii:
 *   1. Navbar  — bara de navigare (mereu vizibilă)
 *   2. Main    — conținutul dinamic, schimbat de React Router
 *   3. Footer  — subsolul paginii (mereu vizibil)
 */
function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <Navbar />
          <main className="App__main">
            <AppRoutes />
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
