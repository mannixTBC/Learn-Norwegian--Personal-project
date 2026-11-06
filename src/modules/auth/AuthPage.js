import {ui} from '../../languages/messages.js';
import React, { useEffect, useState } from 'react';
import { Link, useHistory, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { isInstalledAppView } from '../../services/appExperience';
import './AuthPage.css';
import './GuestAuth.css';
import './SupabaseAuth.css';
import './AuthFjord.css';

const GoogleIcon = () => (
  <svg className="auth-google__mark" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.39-.18-2.05H12v3.87h5.38a4.6 4.6 0 0 1-2 3.02v2.51h3.24c1.89-1.74 2.98-4.31 2.98-7.35Z" />
    <path fill="#34A853" d="M12 22c2.7 0 4.96-.9 6.62-2.42l-3.24-2.51c-.89.6-2.04.95-3.38.95-2.6 0-4.81-1.76-5.6-4.12H3.06v2.59A10 10 0 0 0 12 22Z" />
    <path fill="#FBBC05" d="M6.4 13.9A6 6 0 0 1 6.09 12c0-.66.11-1.3.31-1.9V7.51H3.06A10 10 0 0 0 2 12c0 1.61.39 3.14 1.06 4.49L6.4 13.9Z" />
    <path fill="#EA4335" d="M12 5.98c1.47 0 2.79.5 3.82 1.49l2.87-2.87A9.64 9.64 0 0 0 12 2a10 10 0 0 0-8.94 5.51L6.4 10.1c.79-2.36 3-4.12 5.6-4.12Z" />
  </svg>
);

const GuestIcon = () => (
  <svg className="auth-guest__mark" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 12.25a4.25 4.25 0 1 0 0-8.5 4.25 4.25 0 0 0 0 8.5Z" />
    <path d="M4.75 20.25c.58-3.37 3.52-5.5 7.25-5.5s6.67 2.13 7.25 5.5" />
  </svg>
);

const AuthPage = () => {
  const history = useHistory();
  const location = useLocation();
  const {
    initializing,
    isAuthenticated,
    passwordRecovery,
    login,
    loginAsGuest,
    loginWithGoogle,
    register,
    requestPasswordReset,
    updatePassword,
  } = useAuth();
  const params = new URLSearchParams(location.search);
  const requestedRedirect = params.get('redirect');
  const destination = requestedRedirect && requestedRedirect.startsWith('/') ? requestedRedirect : '/dashboard';
  const [mode, setMode] = useState(params.get('recovery') === '1' ? 'recovery' : 'login');
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(params.get('deleted') === '1' ? 'Contul și datele asociate au fost șterse.' : '');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [mobileEmailOpen, setMobileEmailOpen] = useState(params.get('recovery') === '1');

  useEffect(() => {
    if (passwordRecovery) {
      setMode('recovery');
      setMobileEmailOpen(true);
    }
  }, [passwordRecovery]);

  useEffect(() => {
    if (!initializing && isAuthenticated && mode !== 'recovery' && !passwordRecovery) history.replace(destination);
  }, [destination, history, initializing, isAuthenticated, mode, passwordRecovery]);

  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  const clearFeedback = () => { setError(''); setSuccess(''); };

  const submit = async (event) => {
    event.preventDefault();
    clearFeedback();

    if (mode === 'recovery') {
      if (form.password.length < 8) return setError('Parola trebuie să aibă cel puțin 8 caractere.');
      if (form.password !== form.confirmPassword) return setError('Parolele introduse nu coincid.');
    } else {
      if (mode === 'register' && form.name.trim().length < 2) return setError('Introdu un nume de cel puțin 2 caractere.');
      if (!form.email.includes('@')) return setError('Introdu o adresă de e-mail validă.');
      if (form.password.length < 8) return setError('Parola trebuie să aibă cel puțin 8 caractere.');
    }

    setSubmitting(true);
    try {
      if (mode === 'login') {
        await login(form);
      } else if (mode === 'register') {
        const result = await register(form);
        if (result.requiresEmailConfirmation) {
          setSuccess('Contul a fost creat. Verifică e-mailul și apasă linkul de confirmare înainte de conectare.');
          setMode('login');
          setForm((current) => ({ ...current, password: '', confirmPassword: '' }));
        }
      } else {
        await updatePassword(form.password);
        setSuccess('Parola a fost schimbată. Te redirecționăm către profil.');
        setMode('login');
      }
    } catch (authError) {
      setError(authError.message);
    } finally {
      setSubmitting(false);
    }
  };

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setShowPassword(false);
    setForm((current) => ({ ...current, password: '', confirmPassword: '' }));
    clearFeedback();
  };

  const sendPasswordReset = async () => {
    clearFeedback();
    if (!form.email.includes('@')) return setError('Introdu mai întâi adresa de e-mail a contului.');
    setSubmitting(true);
    try {
      await requestPasswordReset(form.email);
      setSuccess('Ți-am trimis un e-mail cu linkul pentru schimbarea parolei.');
    } catch (authError) {
      setError(authError.message);
    } finally {
      setSubmitting(false);
    }
  };

  const continueWithGoogle = async () => {
    clearFeedback();
    setSubmitting(true);
    try {
      await loginWithGoogle();
    } catch (authError) {
      setError(authError.message);
      setSubmitting(false);
    }
  };

  const continueAsGuest = async () => {
    clearFeedback();
    setSubmitting(true);
    try {
      await loginAsGuest();
      history.replace(destination);
    } catch (authError) {
      setError(authError.message);
      setSubmitting(false);
    }
  };

  const isRecovery = mode === 'recovery';
  const installedApp = isInstalledAppView();
  const FormHeading = installedApp ? 'h1' : 'h2';

  return (
    <div className={`auth-page ${installedApp ? `auth-fjord ${mobileEmailOpen || isRecovery ? 'auth-fjord--form' : ''}` : 'auth-web'}`}>
      {installedApp ? <section className="auth-fjord__hero" aria-label={ui('ui_ee728f3245aed708')}>
        {mobileEmailOpen && !isRecovery && <button className="auth-fjord__back" type="button" aria-label={ui('ui_98945804443c27d1')} onClick={() => { clearFeedback(); setMobileEmailOpen(false); }}>←</button>}
        <Link to="/" className="auth-fjord__brand"><img src="/branding/nordlingo-selected-color.png" alt={ui('ui_ee728f3245aed708')} /></Link>
        <img className="auth-fjord__scene" src="/images/loading-fjord.webp" alt="" />
      </section> : <section className="auth-story" aria-labelledby="auth-story-title">
        <div>
          <span className="auth-story__eyebrow">{ui('web_6e58a0bd2d2e13ff')}</span>
          <h1 id="auth-story-title">{ui('ui_229266d269e2a8e0')}</h1>
          <p>{ui('ui_9313d36dbe0d9b2e')}</p>
          <div className="auth-story__features"><span>{ui('web_b9d1764fed7c7521')}</span><span>{ui('web_863591d5a5ca2ce2')}</span><span>{ui('web_f64810848bf53922')}</span></div>
        </div>
      </section>}
      <main className="auth-panel">
        <div className="auth-panel__inner">
          {!installedApp && <Link className="auth-panel__back" to="/">{ui('web_2ff33ea3a43ccf4d')}</Link>}

          {installedApp && !isRecovery && <section className={`auth-mobile-quick ${mobileEmailOpen ? 'is-hidden' : ''}`} aria-label={ui('web_bf458cf637a1eb2c')}>
            <h1>{ui('ui_9702a93f937cab68')}</h1>
            <button className="auth-google" type="button" disabled={submitting} onClick={continueWithGoogle}>
              <span className="auth-google__icon"><GoogleIcon /></span>
              <span className="auth-google__copy"><strong>{ui('ui_f109a965ce4721cd')}</strong><small>{ui('web_a4d4decd1924a0f6')}</small></span>
              <span className="auth-google__arrow" aria-hidden="true">→</span>
            </button>
            <button className="auth-mobile-email" type="button" disabled={submitting} onClick={() => { switchMode('login'); setMobileEmailOpen(true); }}>{ui('web_1819b7be8f668300')}</button>
            <button className="auth-guest" type="button" disabled={submitting} onClick={continueAsGuest}>
              <span className="auth-guest__icon"><GuestIcon /></span>
              <span><strong>{ui('ui_57ef432292f0f5c3')}</strong><small>{ui('web_5644b21c5b95ba5b')}</small></span>
              <span className="auth-guest__arrow" aria-hidden="true">→</span>
            </button>
            <p className="auth-fjord__register">{ui('web_aa8def74208ef8fd')}<button type="button" onClick={() => { switchMode('register'); setMobileEmailOpen(true); }}>{ui('ui_216147cfd0d20f2c')}</button></p>
            {error && <div className="auth-error" role="alert">{error}</div>}
          </section>}

          <div className={`auth-details ${mobileEmailOpen || isRecovery ? 'is-open' : ''}`}>

            <header>
              <FormHeading>{isRecovery ? ui('ui_0c16a8469ec40459') : mode === 'login' ? ui('ui_2a8874f48f3cd1d4') : ui('ui_216147cfd0d20f2c')}</FormHeading>
              <p>{isRecovery ? ui('ui_fc054126338613c8') : mode === 'login' ? ui('ui_290c33b191f530fc') : ui('ui_cd3e3e56e981d75c')}</p>
            </header>

            <form onSubmit={submit}>
              {!isRecovery && mode === 'register' && <label><span>{ui('ui_b54f1d8a41645cda')}</span><input required minLength={2} value={form.name} onChange={(event) => update('name', event.target.value)} placeholder={ui('web_0e1d35f27e2e29fe')} autoComplete="name" /></label>}
              {!isRecovery && <label><span>{ui('ui_deb062e302c598be')}</span><input required type="email" autoCapitalize="none" spellCheck={false} value={form.email} onChange={(event) => update('email', event.target.value)} placeholder={ui('web_955616c0c8933e62')} autoComplete="email" /></label>}
              <label><span>{isRecovery ? 'Parola nouă' : ui('ui_e3962ceb93e1d6fc')}</span><div className="auth-password"><input required minLength={8} type={showPassword ? 'text' : 'password'} value={form.password} onChange={(event) => update('password', event.target.value)} placeholder={ui('web_d874a2c3412b27e4')} aria-describedby={mode === 'register' ? 'auth-password-hint' : undefined} autoComplete={isRecovery || mode === 'register' ? 'new-password' : 'current-password'} /><button type="button" aria-label={showPassword ? 'Ascunde parola' : 'Arată parola'} aria-pressed={showPassword} onClick={() => setShowPassword((visible) => !visible)}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>{showPassword && <path d="m3 3 18 18"/>}</svg></button></div>{mode === 'register' && <small id="auth-password-hint">{ui('web_7aacac9c2b992dc1')}</small>}</label>
              {isRecovery && <label><span>{ui('ui_edc1a0c232a4146c')}</span><input required minLength={8} type={showPassword ? 'text' : 'password'} value={form.confirmPassword} onChange={(event) => update('confirmPassword', event.target.value)} placeholder={ui('web_38dfd104890dd6d6')} autoComplete="new-password" /></label>}
              {mode === 'login' && <button className="auth-forgot" type="button" disabled={submitting} onClick={sendPasswordReset}>{ui('web_536ed7ff9131c40c')}</button>}
              {error && <div className="auth-error" role="alert">{error}</div>}
              {success && <div className="auth-success" role="status">{success}</div>}
              <button className="auth-submit" type="submit" disabled={submitting || initializing}>{submitting ? 'Se procesează...' : isRecovery ? 'Salvează parola nouă' : mode === 'login' ? 'Conectează-te' : 'Creează contul'}</button>
            </form>

            {!isRecovery && <>
              <p className="auth-switch">{mode === 'login' ? ui('ui_812977368714f7e6') : 'Ai deja un cont?'} <button type="button" onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}>{mode === 'login' ? ui('ui_216147cfd0d20f2c') : 'Conectează-te'}</button></p>
              {!installedApp && <section className="auth-web__alternatives" aria-label={ui('web_5af71bc9cf12d280')}>
                <div className="auth-guest-separator">{ui('web_feca5e68527fb559')}</div>
                <button className="auth-google" type="button" disabled={submitting} onClick={continueWithGoogle}>
                  <span className="auth-google__icon"><GoogleIcon /></span>
                  <span className="auth-google__copy"><strong>{ui('ui_f109a965ce4721cd')}</strong><small>{ui('web_1232ad38bf36254b')}</small></span>
                  <span className="auth-google__arrow" aria-hidden="true">→</span>
                </button>
                <button className="auth-guest" type="button" disabled={submitting} onClick={continueAsGuest}>
                  <span className="auth-guest__icon"><GuestIcon /></span>
                  <span><strong>{ui('ui_57ef432292f0f5c3')}</strong><small>{ui('web_5644b21c5b95ba5b')}</small></span>
                  <span className="auth-guest__arrow" aria-hidden="true">→</span>
                </button>
              </section>}
            </>}
          </div>
        </div>
      </main>
      {installedApp && <div className="auth-fjord__foot" aria-hidden="true" />}
    </div>
  );
};

export default AuthPage;
