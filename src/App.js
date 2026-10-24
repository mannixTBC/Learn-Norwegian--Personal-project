import React, { useRef } from 'react';
import { BrowserRouter as Router, useLocation } from 'react-router-dom';
import './App.css';
import './modules/exercises/DesktopPractice.css';

import Navbar from './modules/layout/Navbar/Navbar';
import Footer from './modules/layout/Footer/Footer';
import AppRoutes from './routes/AppRoutes';
import { AuthProvider } from './modules/auth/AuthContext';
import SeoManager from './seo/SeoManager';
import PageLoading from './modules/layout/PageLoading';

/**
 * Componenta radacina a aplica?iei ,NordLingo".
 *
 * Structura paginii:
 *   1. Navbar  - bara de navigare (ascunsa �n jocul Propozi?ii)
 *   2. Main    - con?inutul dinamic, schimbat de React Router
 *   3. Footer  - subsolul paginii (ascuns �n jocul Propozi?ii)
 */
export function AppContent() {
  const mainRef = useRef(null);
  const { pathname } = useLocation();
  const isSentenceGame = /^\/drag(?:\/|$)/.test(pathname);
  return (
    <AuthProvider>
      <SeoManager />
      <div className="App">
        {!isSentenceGame && <Navbar />}
        <main className="App__main" ref={mainRef}>
          <AppRoutes />
          <PageLoading contentRef={mainRef} />
        </main>
        {!isSentenceGame && <Footer />}
      </div>
    </AuthProvider>
  );
}

function App() {
  return <Router><AppContent /></Router>;
}

export default App;

