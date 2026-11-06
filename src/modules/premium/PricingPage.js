import {ui} from '../../languages/messages.js';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { createCheckoutSession, createPortalSession } from '../../services/billing';
import './premium.css';

const PREMIUM_BENEFITS = [
  { icon: '🎤', title: 'Pronunție nelimitată', desc: 'Evaluare cu Azure Speech la fiecare frază — scor pe foneme, fluență și acuratețe.' },
  { icon: '💬', title: 'Asistent ChatGPT', desc: 'Conversație virtuală în norvegiană cu corectări instant și explicații în română.' },
  { icon: '📚', title: 'Programa A1–C2', desc: 'Șase niveluri organizate în secțiuni, cu lecții conectate și misiuni de consolidare.' },
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
        <span className="pricing-page__eyebrow">{ui('web_c5078ef490d02429')}</span>
        <h1>{ui('web_96e99673e5e5f821')}</h1>
        <p className="pricing-page__subtitle">{ui('web_b15fc629de23ce1c')}</p>
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
              <span className="pricing-page__status-badge">{ui('web_536e8920254f6d8c')}</span>
              {isDevBypass && <small className="pricing-page__dev-note">{ui('web_49f4d3df7b8bbb78')}</small>}
            </div>
            {user && !user.isGuest && !isDevBypass && (
              <button
                type="button"
                className="pricing-page__cta pricing-page__cta--secondary"
                onClick={handlePortal}
                disabled={loading}
              >
                {loading ? ui('web_02bf71cba392fbc4') : 'Gestionează abonamentul'}
              </button>
            )}
          </>
        ) : (
          <>
            <div className="pricing-page__price">
              <span className="pricing-page__price-amount">{ui('web_2f52f1e13d92ce3a')}</span>
              <span className="pricing-page__price-period">{ui('web_526713ba81316935')}</span>
            </div>
            <p className="pricing-page__price-note">{ui('web_94430e8a6b1792f2')}</p>
            <button
              type="button"
              className="pricing-page__cta"
              onClick={handleCheckout}
              disabled={loading}
            >
              {loading ? ui('web_02bf71cba392fbc4') : 'Treci la Premium'}
            </button>
            {!isAuthenticated && (
              <p className="pricing-page__auth-note">{ui('web_9fc9696e306aa53b')}<Link to="/autentificare?redirect=/premium">{ui('web_8eea1753614e4b0c')}</Link>{ui('web_1dae30afece59f86')}</p>
            )}
          </>
        )}
        {error && <p className="pricing-page__error" role="alert">{error}</p>}
      </section>
    </main>
  );
}
