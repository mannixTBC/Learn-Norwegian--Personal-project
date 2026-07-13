import React, { useEffect, useState } from 'react';
import { Link, useHistory, useLocation } from 'react-router-dom';
import NorwegianFlagIcon from '../layout/Navbar/NorwegianFlagIcon';
import { useAuth } from './AuthContext';
import './AuthPage.css';
import './GuestAuth.css';

const AuthPage = () => {
  const history = useHistory();
  const location = useLocation();
  const { isAuthenticated, login, loginAsGuest, register } = useAuth();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const requestedRedirect = new URLSearchParams(location.search).get('redirect');
  const destination = requestedRedirect && requestedRedirect.startsWith('/') ? requestedRedirect : '/dashboard';

  useEffect(() => { if (isAuthenticated) history.replace(destination); }, [destination, history, isAuthenticated]);

  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  const submit = (event) => {
    event.preventDefault();
    setError('');
    if (mode === 'register' && form.name.trim().length < 2) return setError('Introdu un nume de cel puțin 2 caractere.');
    if (!form.email.includes('@')) return setError('Introdu o adresă de e-mail validă.');
    if (form.password.length < 4) return setError('Parola trebuie să aibă cel puțin 4 caractere.');
    try {
      if (mode === 'login') login(form); else register(form);
      history.replace(destination);
    } catch (authError) { setError(authError.message); }
  };

  const switchMode = (nextMode) => { setMode(nextMode); setError(''); };
  const continueAsGuest = () => {
    loginAsGuest();
    history.replace(destination);
  };

  return (
    <div className="auth-page">
      <section className="auth-story">
        <Link to="/" className="auth-story__brand"><NorwegianFlagIcon /><span>NorvegiaTa</span></Link>
        <div><span className="auth-story__eyebrow">Spațiul tău de învățare</span><h1>Norvegiana ta,<br />pas cu pas.</h1><p>Conectează-te pentru a continua lecțiile, testele și exercițiile de la nivelul tău.</p><div className="auth-story__features"><span>✓ Progres păstrat local</span><span>✓ Audio ElevenLabs</span><span>✓ Teste cu feedback</span></div></div>
        <small>Cont demonstrativ salvat numai în acest browser.</small>
      </section>
      <main className="auth-panel">
        <div className="auth-panel__inner">
          <Link className="auth-panel__back" to="/">← Înapoi la pagina principală</Link>
          <div className="auth-tabs" role="tablist"><button type="button" role="tab" aria-selected={mode === 'login'} className={mode === 'login' ? 'active' : ''} onClick={() => switchMode('login')}>Conectare</button><button type="button" role="tab" aria-selected={mode === 'register'} className={mode === 'register' ? 'active' : ''} onClick={() => switchMode('register')}>Cont nou</button></div>
          <header><span>{mode === 'login' ? 'Bine ai revenit' : 'Începe gratuit'}</span><h2>{mode === 'login' ? 'Continuă de unde ai rămas' : 'Creează-ți spațiul de studiu'}</h2><p>{mode === 'login' ? 'Introdu datele contului salvat în acest browser.' : 'Ai nevoie doar de un nume, e-mail și o parolă.'}</p></header>
          <form onSubmit={submit}>
            {mode === 'register' && <label><span>Numele tău</span><input value={form.name} onChange={(event) => update('name', event.target.value)} placeholder="Ex: Andrei" autoComplete="name" /></label>}
            <label><span>Adresa de e-mail</span><input type="email" value={form.email} onChange={(event) => update('email', event.target.value)} placeholder="nume@email.com" autoComplete="email" /></label>
            <label><span>Parola</span><div className="auth-password"><input type={showPassword ? 'text' : 'password'} value={form.password} onChange={(event) => update('password', event.target.value)} placeholder="Minimum 4 caractere" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} /><button type="button" onClick={() => setShowPassword((visible) => !visible)}>{showPassword ? 'Ascunde' : 'Arată'}</button></div></label>
            {error && <div className="auth-error" role="alert">{error}</div>}
            <button className="auth-submit" type="submit">{mode === 'login' ? 'Conectează-te' : 'Creează contul'} →</button>
          </form>
          <div className="auth-guest-separator"><span>sau</span></div>
          <button className="auth-guest" type="button" onClick={continueAsGuest}>
            <span className="auth-guest__icon" aria-hidden="true">◎</span>
            <span><strong>Continuă ca vizitator</strong><small>Fără cont și fără parolă</small></span>
            <span className="auth-guest__arrow" aria-hidden="true">→</span>
          </button>
          <p className="auth-switch">{mode === 'login' ? 'Nu ai încă un cont?' : 'Ai deja un cont?'} <button type="button" onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}>{mode === 'login' ? 'Creează unul' : 'Conectează-te'}</button></p>
          <div className="auth-note"><strong>Autentificare frontend</strong><p>Datele rămân în browserul tău și nu sunt trimise pe un server. Nu folosi o parolă importantă.</p></div>
        </div>
      </main>
    </div>
  );
};

export default AuthPage;
