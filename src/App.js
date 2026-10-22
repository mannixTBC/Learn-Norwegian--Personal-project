import React, { useRef } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import './App.css';

import Navbar from './modules/layout/Navbar/Navbar';
import Footer from './modules/layout/Footer/Footer';
import AppRoutes from './routes/AppRoutes';
import { AuthProvider } from './modules/auth/AuthContext';
import SeoManager from './seo/SeoManager';
import PageLoading from './modules/layout/PageLoading';

/**
 * Componenta rădăcină a aplicației „NordLingo”.
 *
 * Structura paginii:
 *   1. Navbar  — bara de navigare (mereu vizibilă)
 *   2. Main    — conținutul dinamic, schimbat de React Router
 *   3. Footer  — subsolul paginii (mereu vizibil)
 */
export function AppContent() {
  const mainRef = useRef(null);
  return (
    <AuthProvider>
      <SeoManager />
      <div className="App">
        <Navbar />
        <main className="App__main" ref={mainRef}>
          <AppRoutes />
          <PageLoading contentRef={mainRef} />
        </main>
        <Footer />
      </div>
    </AuthProvider>
  );
}

function App() {
  return <Router><AppContent /></Router>;
}

export default App;
