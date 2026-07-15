import React, { useEffect, useState } from 'react';
import { Link, useHistory, useLocation } from 'react-router-dom';
import NorwegianFlagIcon from '../layout/Navbar/NorwegianFlagIcon';
import { useAuth } from './AuthContext';
import './AuthPage.css';
import './GuestAuth.css';
import './SupabaseAuth.css';

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
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (passwordRecovery) setMode('recovery');
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

  return (
    <div className="auth-page">
      <section className="auth-story">
        <Link to="/" className="auth-story__brand"><NorwegianFlagIcon /><span>NorvegiaTa</span></Link>
        <div><span className="auth-story__eyebrow">Spațiul tău de învățare</span><h1>Norvegiana ta,<br />pas cu pas.</h1><p>Învață printr-un curs modern, construit pentru situațiile reale pe care le vei întâlni în Norvegia.</p><div className="auth-story__features"><span>✓ Programă structurată pe niveluri A1–B2</span><span>✓ Lecții practice pentru viața din Norvegia</span><span>✓ Audio, exerciții și feedback personalizat</span><span>✓ Recapitulare inteligentă prin repetare spațiată și reamintire activă</span></div></div>
        <small>Contul și progresul tău rămân protejate.</small>
      </section>
      <main className="auth-panel">
        <div className="auth-panel__inner">
          <Link className="auth-panel__back" to="/">← Înapoi la pagina principală</Link>

          {!isRecovery && <div className="auth-tabs" role="tablist"><button type="button" role="tab" aria-selected={mode === 'login'} className={mode === 'login' ? 'active' : ''} onClick={() => switchMode('login')}>Conectare</button><button type="button" role="tab" aria-selected={mode === 'register'} className={mode === 'register' ? 'active' : ''} onClick={() => switchMode('register')}>Cont nou</button></div>}

          <header>
            <span>{isRecovery ? 'Securitatea contului' : mode === 'login' ? 'Bine ai revenit' : 'Începe gratuit'}</span>
            <h2>{isRecovery ? 'Alege o parolă nouă' : mode === 'login' ? 'Continuă de unde ai rămas' : 'Creează-ți spațiul de studiu'}</h2>
            <p>{isRecovery ? 'Folosește minimum 8 caractere și nu reutiliza o parolă importantă.' : mode === 'login' ? 'Conectează-te cu e-mailul și parola contului tău.' : 'Progresul tău va putea fi accesat de pe orice dispozitiv.'}</p>
          </header>

          <form onSubmit={submit}>
            {!isRecovery && mode === 'register' && <label><span>Numele tău</span><input value={form.name} onChange={(event) => update('name', event.target.value)} placeholder="Ex: Andrei" autoComplete="name" /></label>}
            {!isRecovery && <label><span>Adresa de e-mail</span><input type="email" value={form.email} onChange={(event) => update('email', event.target.value)} placeholder="nume@email.com" autoComplete="email" /></label>}
            <label><span>{isRecovery ? 'Parola nouă' : 'Parola'}</span><div className="auth-password"><input type={showPassword ? 'text' : 'password'} value={form.password} onChange={(event) => update('password', event.target.value)} placeholder="Minimum 8 caractere" autoComplete={isRecovery || mode === 'register' ? 'new-password' : 'current-password'} /><button type="button" onClick={() => setShowPassword((visible) => !visible)}>{showPassword ? 'Ascunde' : 'Arată'}</button></div></label>
            {isRecovery && <label><span>Confirmă parola nouă</span><input type={showPassword ? 'text' : 'password'} value={form.confirmPassword} onChange={(event) => update('confirmPassword', event.target.value)} placeholder="Repetă parola" autoComplete="new-password" /></label>}
            {mode === 'login' && <button className="auth-forgot" type="button" disabled={submitting} onClick={sendPasswordReset}>Ai uitat parola?</button>}
            {error && <div className="auth-error" role="alert">{error}</div>}
            {success && <div className="auth-success" role="status">{success}</div>}
            <button className="auth-submit" type="submit" disabled={submitting || initializing}>{submitting ? 'Se procesează...' : isRecovery ? 'Salvează parola nouă' : mode === 'login' ? 'Conectează-te' : 'Creează contul'} →</button>
          </form>

          {!isRecovery && <>
            <div className="auth-guest-separator"><span>sau</span></div>
            <button className="auth-google" type="button" disabled={submitting} onClick={continueWithGoogle}>
              <span className="auth-google__icon"><GoogleIcon /></span>
              <span className="auth-google__copy"><strong>Conectează-te cu Google</strong><small>Conectare rapidă și sigură</small></span>
              <span className="auth-google__arrow" aria-hidden="true">→</span>
            </button>
            <button className="auth-guest" type="button" disabled={submitting} onClick={continueAsGuest}>
              <span className="auth-guest__icon"><GuestIcon /></span>
              <span><strong>Continuă ca vizitator</strong><small>Fără cont și fără parolă</small></span>
              <span className="auth-guest__arrow" aria-hidden="true">→</span>
            </button>
            <p className="auth-switch">{mode === 'login' ? 'Nu ai încă un cont?' : 'Ai deja un cont?'} <button type="button" onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}>{mode === 'login' ? 'Creează unul' : 'Conectează-te'}</button></p>
            <div className="auth-note"><strong>Autentificare securizată</strong><p>Datele contului sunt protejate, iar sesiunea ta rămâne activă doar pe dispozitivele pe care alegi să te conectezi.</p></div>
          </>}
        </div>
      </main>
    </div>
  );
};

export default AuthPage;
