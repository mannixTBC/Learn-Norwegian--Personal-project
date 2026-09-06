import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { createCheckoutSession, createPortalSession } from '../../services/billing';
import './premium.css';

const PREMIUM_BENEFITS = [
  { icon: '🎤', title: 'Pronunție nelimitată', desc: 'Evaluare cu Azure Speech la fiecare frază — scor pe foneme, fluență și acuratețe.' },
  { icon: '💬', title: 'Asistent ChatGPT', desc: 'Conversație virtuală în norvegiană cu corectări instant și explicații în română.' },
  { icon: '📚', title: 'Toate lecțiile', desc: 'Deblocăm nivelele B1 și B2, lecțiile extra și testele finale avansate.' },
  { icon: '🔥', title: 'Provocarea de 30 zile', desc: 'Program intens cu recapitulare spațiată pentru retenție pe termen lung.' },
];

/**
 * PricingPage — pagina publică de la ruta /premium.
 * Dacă utilizatorul e deja Premium, îi oferă acces la Customer Portal (gestionare).
 * Dacă nu, pornește fluxul Stripe Checkout (necesită autentificare).
 * În dev bypass, toți sunt premium deci randează starea „activ”.
 */
export default function PricingPage() {
  const { isPremium, isDevBypass, isAuthenticated, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const handleCheckout = async () => {
    setError('');
    if (!isAuthenticated) {
      window.location.href = '/autentificare?redirect=/premium';
      return;
    }
    setLoading(true);
    try {
      const { url } = await createCheckoutSession();
      window.location.href = url;
    } catch (err) {
      setError(err.message || 'Nu am putut porni procesul de plată.');
      setLoading(false);
    }
  };

  const handlePortal = async () => {
    setError('');
    setLoading(true);
    try {
      const { url } = await createPortalSession();
      window.location.href = url;
    } catch (err) {
      setError(err.message || 'Nu am putut deschide gestionarea abonamentului.');
      setLoading(false);
    }
  };

  return (
    <main className="pricing-page">
      <header className="pricing-page__header">
        <span className="pricing-page__eyebrow">NorvegiaTa Premium</span>
        <h1>Deblochează tot potențialul tău în norvegiană</h1>
        <p className="pricing-page__subtitle">
          Instrumentele avansate care te duc de la „înțeleg” la „vorbesc fluent”.
        </p>
      </header>

      <section className="pricing-page__benefits">
        {PREMIUM_BENEFITS.map((benefit) => (
          <article key={benefit.title} className="pricing-page__benefit">
            <span className="pricing-page__benefit-icon" aria-hidden="true">{benefit.icon}</span>
            <h3>{benefit.title}</h3>
            <p>{benefit.desc}</p>
          </article>
        ))}
      </section>

      <section className="pricing-page__card">
        {isPremium ? (
          <>
            <div className="pricing-page__status pricing-page__status--active">
              <span className="pricing-page__status-badge">★ Premium activ</span>
              {isDevBypass && <small className="pricing-page__dev-note">Mod dezvoltare: gating ocolit pentru testare.</small>}
            </div>
            {user && !user.isGuest && !isDevBypass && (
              <button
                type="button"
                className="pricing-page__cta pricing-page__cta--secondary"
                onClick={handlePortal}
                disabled={loading}
              >
                {loading ? 'Se încarcă…' : 'Gestionează abonamentul'}
              </button>
            )}
          </>
        ) : (
          <>
            <div className="pricing-page__price">
              <span className="pricing-page__price-amount">49 RON</span>
              <span className="pricing-page__price-period">/ lună</span>
            </div>
            <p className="pricing-page__price-note">Anulezi oricând, fără angajament.</p>
            <button
              type="button"
              className="pricing-page__cta"
              onClick={handleCheckout}
              disabled={loading}
            >
              {loading ? 'Se încarcă…' : 'Treci la Premium'}
            </button>
            {!isAuthenticated && (
              <p className="pricing-page__auth-note">
                Trebuie să fii <Link to="/autentificare?redirect=/premium">conectat</Link> pentru abonare.
              </p>
            )}
          </>
        )}
        {error && <p className="pricing-page__error" role="alert">{error}</p>}
      </section>
    </main>
  );
}
