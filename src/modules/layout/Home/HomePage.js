import {ui} from '../../../languages/messages.js';
import React from 'react';
import { Link, Redirect } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import SessionLoading from '../../auth/SessionLoading';
import PWAInstallButton from '../../pwa/PWAInstallButton';
import { isNativeApp } from '../../../services/api';
import './HomePage.css';

const sections = [
  { to: '/invata', icon: '📘', title: 'Învață norvegiana', text: 'Lecții, exerciții, pronunție și recapitulare într-un singur traseu.' },
  { to: '/descopera', icon: '🏔️', title: 'Descoperă', text: 'Natură, tradiții și cultura Norvegiei.' },
  { to: '/viata-in-norvegia', icon: '🧭', title: ui('ui_cea9aa1d0028ee59'), text: 'Muncă, acte, vreme și știri într-un singur loc.' },
];

/**
 * Detectează lansarea din aplicația instalată, fără să confunde browserul
 * mobil cu experiența PWA / viitoarea aplicație Android (TWA).
 */
export const isInstalledApp = () => {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;

  const standaloneDisplay = typeof window.matchMedia === 'function'
    && window.matchMedia('(display-mode: standalone)').matches;
  const iosStandalone = navigator.standalone === true;
  const androidApp = document.referrer.startsWith('android-app://');

  return isNativeApp() || standaloneDisplay || iosStandalone || androidApp;
};

const HomePage = () => {
  const { initializing, isAuthenticated } = useAuth();

  if (initializing) return <SessionLoading />;
  if (isAuthenticated) return <Redirect to="/dashboard" />;
  if (isInstalledApp()) return <Redirect to="/dashboard" />;

  return <div className="landing">
    <section className="landing__hero">
      <div className="landing__hero-content">
        <p className="landing__eyebrow">{ui('web_eb0ff974e458cf16')}</p>
        <h1 className="landing__title">{ui('web_426862eb8b15473d')}</h1>
        <p className="landing__subtitle">{ui('web_67ce0216fe9c9e7d')}</p>
        <div className="landing__actions">
          <Link to="/dashboard" className="landing__button landing__button--primary">{ui('web_1e320b7666c6f692')}</Link>
          <PWAInstallButton className="landing__button landing__button--install" />
          <Link to="/viata-in-norvegia" className="landing__button landing__button--secondary">{ui('web_654c851f300bfde8')}</Link>
        </div>
      </div>
    </section>

    <section className="landing__sections" aria-labelledby="landing-sections-title">
      <div className="landing__section-heading">
        <p className="landing__eyebrow landing__eyebrow--dark">{ui('web_d7f5aef529fe8f11')}</p>
        <h2 id="landing-sections-title">{ui('web_493440d1b64c15c9')}</h2>
      </div>
      <div className="landing__cards">
        {sections.map((section) => (
          <Link to={section.to} className="landing-card" key={section.to}>
            <span className="landing-card__icon">{section.icon}</span>
            <h3>{section.title}</h3>
            <p>{section.text}</p>
            <span className="landing-card__action">{ui('web_b9e9c00bf07fbdf3')}</span>
          </Link>
        ))}
      </div>
    </section>
  </div>;
};

export default HomePage;
