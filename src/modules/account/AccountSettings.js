import React, { useEffect, useRef, useState } from 'react';
import { Link, useHistory, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { createCheckoutSession, createPortalSession } from '../../services/billing';
import { getVoiceTranscriptPreference, setVoiceTranscriptPreference } from '../../services/voiceTranscripts';
import MobileAppNav from '../layout/MobileAppNav';
import './AccountSettings.css';

const deletionReasons = [
  { id: 'rarely-used', label: 'Nu folosesc aplicația suficient de des', description: 'Nu reușesc să includ învățarea în programul meu.' },
  { id: 'better-service', label: 'Am găsit un serviciu mai potrivit', description: 'O altă aplicație răspunde mai bine nevoilor mele.' },
  { id: 'content-fit', label: 'Conținutul nu mi se potrivește', description: 'Lecțiile sau nivelul nu corespund obiectivelor mele.' },
  { id: 'other', label: 'Alt motiv', description: 'Vreau să ofer un motiv diferit.' },
];

const DeleteIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M4 7h16M9 7V4h6v3M7 7l1 13h8l1-13M10 11v5M14 11v5" />
  </svg>
);

const PrivacyIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 3 5.5 5.7v5.2c0 4.4 2.7 8.1 6.5 10.1 3.8-2 6.5-5.7 6.5-10.1V5.7L12 3Z" />
    <path d="m9.2 12 1.8 1.8 3.9-4" />
  </svg>
);

const LogoutIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M10 5H6.8A1.8 1.8 0 0 0 5 6.8v10.4A1.8 1.8 0 0 0 6.8 19H10M14.5 8.5 18 12l-3.5 3.5M9 12h9" />
  </svg>
);

const AccountIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="12" cy="8" r="3.25" />
    <path d="M5.5 20c.5-4.1 2.7-6.2 6.5-6.2s6 2.1 6.5 6.2" />
  </svg>
);

const SubscriptionIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <rect x="3.5" y="5.5" width="17" height="13" rx="2.5" />
    <path d="M3.5 9.5h17M7 14h4" />
  </svg>
);

const ChevronIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="m9 5 7 7-7 7" />
  </svg>
);

const AccountSettings = () => {
  const history = useHistory();
  const location = useLocation();
  const { user, plan, isPremium, isDevBypass, premiumUntil, refreshEntitlements, logout, deleteAccount } = useAuth();
  const [confirming, setConfirming] = useState(false);
  const [deletionReason, setDeletionReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [billingLoading, setBillingLoading] = useState(false);
  const [billingError, setBillingError] = useState('');
  const [voiceConsent, setVoiceConsent] = useState(false);
  const [voiceConsentState, setVoiceConsentState] = useState('loading');
  const [managingAccount, setManagingAccount] = useState(false);
  const firstReasonRef = useRef(null);
  const registeredAccount = user && !user.isGuest;

  useEffect(() => {
    if (new URLSearchParams(location.search).get('billing') === 'success') void refreshEntitlements();
  }, [location.search]);

  useEffect(() => {
    if (new URLSearchParams(location.search).get('delete') === '1') setConfirming(true);
  }, [location.search]);

  useEffect(() => {
    const abort = new AbortController();
    getVoiceTranscriptPreference(abort.signal).then((preference) => {
      if (abort.signal.aborted) return;
      setVoiceConsent(preference.enabled === true);
      setVoiceConsentState('ready');
    }).catch(() => {
      if (!abort.signal.aborted) setVoiceConsentState('unavailable');
    });
    return () => abort.abort();
  }, []);

  useEffect(() => {
    if (!confirming && !managingAccount) return undefined;
    if (confirming) firstReasonRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const closeOnEscape = (event) => {
      if (event.key === 'Escape' && !deleting) setConfirming(false);
      if (event.key === 'Escape') setManagingAccount(false);
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [confirming, managingAccount, deleting]);

  const closeDialog = () => {
    if (deleting) return;
    setConfirming(false);
    setDeletionReason('');
    setCustomReason('');
    setConfirmation('');
    setError('');
    if (new URLSearchParams(location.search).get('delete') === '1') history.replace('/cont');
  };

  const updateVoiceConsent = async () => {
    if (voiceConsentState !== 'ready') return;
    const enabled = !voiceConsent;
    setVoiceConsentState('saving');
    try {
      const preference = await setVoiceTranscriptPreference(enabled);
      setVoiceConsent(preference.enabled === true);
      setVoiceConsentState('ready');
    } catch (_) {
      setVoiceConsentState('unavailable');
    }
  };

  const removeAccount = async (event) => {
    event.preventDefault();
    const hasReason = deletionReason && (deletionReason !== 'other' || customReason.trim().length >= 3);
    if (!hasReason || confirmation.trim().toLocaleUpperCase('ro-RO') !== 'ȘTERGE') return;
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

  const signOut = async () => {
    await logout();
    history.replace('/autentificare');
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

        <section className="account-privacy" aria-labelledby="account-privacy-title">
          <div className="account-privacy__icon"><PrivacyIcon /></div>
          <div className="account-privacy__copy">
            <small>Confidențialitate și AI</small>
            <h2 id="account-privacy-title">Contribuie la îmbunătățirea Norei</h2>
            <p>{voiceConsent
              ? 'Păstrăm numai textul dialogurilor vocale, fără audio, cel mult 90 de zile. Dezactivarea șterge și transcriptele salvate.'
              : 'Dialogurile tale nu sunt păstrate. Poți permite opțional salvarea textului, fără înregistrările audio.'}</p>
            {voiceConsentState === 'unavailable' && <span className="account-privacy__notice">Preferința nu este disponibilă momentan.</span>}
          </div>
          <label className={`account-privacy__toggle ${voiceConsent ? 'account-privacy__toggle--enabled' : ''}`}>
            <input type="checkbox" checked={voiceConsent} disabled={!['ready'].includes(voiceConsentState)} onChange={updateVoiceConsent} />
            <span aria-hidden="true" />
            <strong>{voiceConsent ? 'Activat' : voiceConsentState === 'loading' ? 'Se încarcă…' : 'Dezactivat'}</strong>
          </label>
        </section>

        <section className="account-signout" aria-labelledby="account-signout-title">
          <div className="account-signout__icon"><LogoutIcon /></div>
          <div className="account-signout__copy"><small>Sesiunea ta</small><h2 id="account-signout-title">Deconectare</h2><p>Ieși în siguranță din cont pe acest dispozitiv.</p></div>
          <button type="button" onClick={signOut}><LogoutIcon />Deconectare</button>
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

      <div className="account-mobile" aria-label="Setările contului">
        <div className="account-mobile__hero" aria-hidden="true" />

        <section className="account-mobile__profile" aria-labelledby="account-mobile-profile-title">
          <div className="account-mobile__avatar" aria-hidden="true">{user.name.charAt(0).toUpperCase()}</div>
          <div className="account-mobile__identity">
            <h1 id="account-mobile-profile-title">{user.name}</h1>
            <p>{user.email || 'Fără adresă de e-mail asociată'}</p>
            <span>{plan === 'premium' ? 'Premium' : 'Plan gratuit'}</span>
          </div>
        </section>

        <section className="account-mobile__settings" aria-label="Opțiunile contului">
          <button type="button" className="account-mobile__row" onClick={registeredAccount ? openBilling : connectAccount} disabled={billingLoading || isDevBypass}>
            <span className="account-mobile__row-icon"><SubscriptionIcon /></span>
            <span className="account-mobile__row-copy">
              <strong>Abonamentul meu</strong>
              <small>{billingLoading ? 'Se încarcă…' : user.isGuest ? 'Conectează un cont' : isPremium ? 'Premium activ' : 'Plan gratuit'}</small>
            </span>
            <span className="account-mobile__chevron"><ChevronIcon /></span>
          </button>

          <div className="account-mobile__row account-mobile__row--privacy">
            <span className="account-mobile__row-icon"><PrivacyIcon /></span>
            <span className="account-mobile__row-copy">
              <strong>Confidențialitate și Nora</strong>
              <small>Controlează salvarea transcrierilor</small>
              {voiceConsentState === 'unavailable' && <em>Preferința nu este disponibilă momentan.</em>}
            </span>
            <label className={`account-mobile__toggle ${voiceConsent ? 'account-mobile__toggle--enabled' : ''}`}>
              <span className="sr-only">Salvarea transcrierilor</span>
              <input type="checkbox" checked={voiceConsent} disabled={voiceConsentState !== 'ready'} onChange={updateVoiceConsent} />
              <span aria-hidden="true" />
            </label>
          </div>

          <button type="button" className="account-mobile__row" onClick={() => setManagingAccount(true)}>
            <span className="account-mobile__row-icon"><AccountIcon /></span>
            <span className="account-mobile__row-copy">
              <strong>Administrare cont</strong>
              <small>Date personale și ștergerea contului</small>
            </span>
            <span className="account-mobile__chevron"><ChevronIcon /></span>
          </button>

          <button type="button" className="account-mobile__row" onClick={signOut}>
            <span className="account-mobile__row-icon"><LogoutIcon /></span>
            <span className="account-mobile__row-copy">
              <strong>Deconectare</strong>
              <small>Ieși din cont pe acest dispozitiv</small>
            </span>
            <span className="account-mobile__chevron"><ChevronIcon /></span>
          </button>
        </section>

        {billingError && <div className="account-mobile__error" role="alert">{billingError}</div>}
      </div>

      <MobileAppNav />

      {managingAccount && (
        <div className="account-manage-overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setManagingAccount(false); }}>
          <section className="account-manage-dialog" role="dialog" aria-modal="true" aria-labelledby="account-manage-title">
            <header>
              <div>
                <span>Setările profilului</span>
                <h2 id="account-manage-title">Administrare cont</h2>
              </div>
              <button type="button" onClick={() => setManagingAccount(false)} aria-label="Închide administrarea contului">×</button>
            </header>

            <div className="account-manage-dialog__details">
              <span className="account-manage-dialog__icon"><AccountIcon /></span>
              <div><small>Nume</small><strong>{user.name}</strong></div>
              <div><small>Adresă de e-mail</small><strong>{user.email || 'Neasociată'}</strong></div>
            </div>

            <button type="button" className="account-manage-dialog__action account-manage-dialog__action--danger" onClick={() => { setManagingAccount(false); setConfirming(true); }}>
              <span><DeleteIcon /></span>
              <span><strong>{registeredAccount ? 'Șterge contul' : 'Șterge datele'}</strong><small>{registeredAccount ? 'Elimină definitiv contul și progresul' : 'Elimină progresul salvat pe dispozitiv'}</small></span>
              <ChevronIcon />
            </button>
          </section>
        </div>
      )}

      {confirming && (
        <div className="account-delete-overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) closeDialog(); }}>
          <section className="account-delete-dialog" role="dialog" aria-modal="true" aria-labelledby="delete-account-title">
            <div className="account-delete-dialog__mark"><DeleteIcon /></div>
            <span>Acțiune ireversibilă</span>
            <h2 id="delete-account-title">{registeredAccount ? 'Ștergi definitiv contul?' : 'Ștergi datele salvate?'}</h2>
            <p>{registeredAccount
              ? 'Nu vei mai putea recupera profilul sau progresul. Spune-ne motivul, apoi confirmă ștergerea.'
              : 'Nu vei mai putea recupera progresul local. Spune-ne motivul, apoi confirmă ștergerea.'}</p>
            <form onSubmit={removeAccount}>
              <fieldset className="account-delete-reasons">
                <legend>De ce alegi să pleci?</legend>
                {deletionReasons.map((reason, index) => (
                  <label className={deletionReason === reason.id ? 'selected' : ''} key={reason.id}>
                    <input
                      ref={index === 0 ? firstReasonRef : undefined}
                      type="radio"
                      name="deletion-reason"
                      value={reason.id}
                      checked={deletionReason === reason.id}
                      onChange={(event) => setDeletionReason(event.target.value)}
                      disabled={deleting}
                    />
                    <span aria-hidden="true" />
                    <div><strong>{reason.label}</strong><small>{reason.description}</small></div>
                  </label>
                ))}
              </fieldset>
              {deletionReason === 'other' && (
                <div className="account-delete-other">
                  <label htmlFor="delete-account-other">Spune-ne pe scurt motivul</label>
                  <textarea id="delete-account-other" value={customReason} onChange={(event) => setCustomReason(event.target.value)} maxLength={240} placeholder="Scrie motivul aici…" disabled={deleting} />
                  <small>{customReason.length}/240</small>
                </div>
              )}
              <label htmlFor="delete-account-confirmation">Scrie <strong>ȘTERGE</strong></label>
              <input id="delete-account-confirmation" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} autoComplete="off" disabled={deleting} />
              {error && <div className="account-delete-dialog__error" role="alert">{error}</div>}
              <div className="account-delete-dialog__actions">
                <button type="button" onClick={closeDialog} disabled={deleting}>Păstrează contul</button>
                <button type="submit" disabled={deleting || !deletionReason || (deletionReason === 'other' && customReason.trim().length < 3) || confirmation.trim().toLocaleUpperCase('ro-RO') !== 'ȘTERGE'}>{deleting ? 'Se șterge…' : 'Șterge definitiv'}</button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
};

export default AccountSettings;
