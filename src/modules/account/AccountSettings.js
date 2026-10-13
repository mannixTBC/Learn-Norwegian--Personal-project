import React, { useEffect, useRef, useState } from 'react';
import { Link, useHistory, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { createCheckoutSession, createPortalSession } from '../../services/billing';
import './AccountSettings.css';

const DeleteIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M4 7h16M9 7V4h6v3M7 7l1 13h8l1-13M10 11v5M14 11v5" />
  </svg>
);

const AccountSettings = () => {
  const history = useHistory();
  const location = useLocation();
  const { user, plan, isPremium, isDevBypass, premiumUntil, refreshEntitlements, logout, deleteAccount } = useAuth();
  const [confirming, setConfirming] = useState(false);
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [billingLoading, setBillingLoading] = useState(false);
  const [billingError, setBillingError] = useState('');
  const inputRef = useRef(null);
  const registeredAccount = user && !user.isGuest;

  useEffect(() => {
    if (new URLSearchParams(location.search).get('billing') === 'success') void refreshEntitlements();
  }, [location.search]);

  useEffect(() => {
    if (!confirming) return undefined;
    inputRef.current?.focus();
    const closeOnEscape = (event) => {
      if (event.key === 'Escape' && !deleting) setConfirming(false);
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [confirming, deleting]);

  const closeDialog = () => {
    if (deleting) return;
    setConfirming(false);
    setConfirmation('');
    setError('');
  };

  const removeAccount = async (event) => {
    event.preventDefault();
    if (confirmation.trim().toLocaleUpperCase('ro-RO') !== 'ȘTERGE') return;
    setDeleting(true);
    setError('');
    try {
      await deleteAccount();
      history.replace('/autentificare?deleted=1');
    } catch (accountError) {
      setError(accountError.message);
      setDeleting(false);
    }
  };

  const openBilling = async () => {
    setBillingLoading(true);
    setBillingError('');
    try {
      const { url } = isPremium && !isDevBypass ? await createPortalSession() : await createCheckoutSession();
      window.location.href = url;
    } catch (billingFailure) {
      setBillingError(billingFailure.message);
      setBillingLoading(false);
    }
  };

  const connectAccount = async () => {
    await logout();
    history.push('/autentificare?redirect=/cont');
  };

  return (
    <div className="account-page">
      <header className="account-page__heading">
        <Link to="/dashboard">← Înapoi</Link>
        <span>Setările contului</span>
        <h1>Contul tău</h1>
        <p>Identitatea, planul și opțiunile tale de confidențialitate.</p>
      </header>

      <div className="account-page__layout">
        <section className="account-profile" aria-labelledby="account-profile-title">
          <div className="account-profile__avatar" aria-hidden="true">{user.name.charAt(0).toUpperCase()}</div>
          <div>
            <small id="account-profile-title">{user.isGuest ? 'Sesiune de vizitator' : 'Cont activ'}</small>
            <h2>{user.name}</h2>
            <p>{user.email || 'Fără adresă de e-mail asociată'}</p>
          </div>
          <span className="account-profile__plan">{plan === 'premium' ? 'Premium' : 'Gratuit'}</span>
        </section>

        <section className="account-subscription" aria-labelledby="account-subscription-title">
          <div className="account-subscription__mark" aria-hidden="true">★</div>
          <div className="account-subscription__copy">
            <small>Abonament</small>
            <h2 id="account-subscription-title">{isPremium ? 'Premium activ' : 'Plan gratuit'}</h2>
            <p>{user.isGuest
              ? 'Creează sau conectează un cont pentru a activa funcțiile Premium.'
              : isPremium
                ? premiumUntil ? `Acces Premium disponibil până la ${new Date(premiumUntil).toLocaleDateString('ro-RO')}.` : 'Ai acces la toate lecțiile și instrumentele Premium.'
                : 'Poți trece la Premium pentru dialog vocal, pronunție și toate nivelurile.'}</p>
            {billingError && <div className="account-subscription__error" role="alert">{billingError}</div>}
          </div>
          {registeredAccount && <button type="button" onClick={openBilling} disabled={billingLoading || isDevBypass}>{billingLoading ? 'Se încarcă…' : isPremium ? 'Gestionează abonamentul' : 'Treci la Premium'}</button>}
          {user.isGuest && <button type="button" onClick={connectAccount}>Conectează un cont</button>}
        </section>

        <section className="account-danger" aria-labelledby="account-danger-title">
          <div className="account-danger__icon"><DeleteIcon /></div>
          <div className="account-danger__copy">
            <small>Zonă sensibilă</small>
            <h2 id="account-danger-title">{registeredAccount ? 'Șterge definitiv contul' : 'Șterge datele de vizitator'}</h2>
            <p>{registeredAccount
              ? 'Progresul, istoricul și profilul vor fi eliminate. Dacă există un abonament asociat, acesta va fi oprit înaintea ștergerii.'
              : 'Progresul și preferințele salvate pe acest dispozitiv vor fi eliminate definitiv.'}</p>
          </div>
          <button type="button" onClick={() => setConfirming(true)}><DeleteIcon />{registeredAccount ? 'Șterge contul' : 'Șterge datele'}</button>
        </section>
      </div>

      {confirming && (
        <div className="account-delete-overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) closeDialog(); }}>
          <section className="account-delete-dialog" role="dialog" aria-modal="true" aria-labelledby="delete-account-title">
            <div className="account-delete-dialog__mark"><DeleteIcon /></div>
            <span>Acțiune ireversibilă</span>
            <h2 id="delete-account-title">{registeredAccount ? 'Ștergi definitiv contul?' : 'Ștergi datele salvate?'}</h2>
            <p>{registeredAccount
              ? 'Nu vei mai putea recupera profilul sau progresul. Pentru confirmare, scrie ȘTERGE mai jos.'
              : 'Nu vei mai putea recupera progresul local. Pentru confirmare, scrie ȘTERGE mai jos.'}</p>
            <form onSubmit={removeAccount}>
              <label htmlFor="delete-account-confirmation">Scrie <strong>ȘTERGE</strong></label>
              <input ref={inputRef} id="delete-account-confirmation" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} autoComplete="off" disabled={deleting} />
              {error && <div className="account-delete-dialog__error" role="alert">{error}</div>}
              <div className="account-delete-dialog__actions">
                <button type="button" onClick={closeDialog} disabled={deleting}>Păstrează contul</button>
                <button type="submit" disabled={deleting || confirmation.trim().toLocaleUpperCase('ro-RO') !== 'ȘTERGE'}>{deleting ? 'Se șterge…' : 'Șterge definitiv'}</button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
};

export default AccountSettings;
