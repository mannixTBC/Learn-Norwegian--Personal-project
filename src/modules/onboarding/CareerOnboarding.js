import React, { useEffect, useRef, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { careerPaths, saveCareerProfile } from '../../services/careerProfile';
import CareerPathVisual from './CareerPathVisual';
import './CareerOnboarding.css';

const levels = [
  { code: 'A1', title: 'Începător', description: 'A1 · Încep de la zero' },
  { code: 'A2', title: 'De bază', description: 'A2 · Înțeleg expresii uzuale' },
  { code: 'B1', title: 'Intermediar', description: 'B1–B2 · Pot purta conversații' },
  { code: 'C1', title: 'Avansat', description: 'C1–C2 · Mă exprim fluent și nuanțat' },
];
const pathLabel = path => path.id === 'family' ? 'Familie și integrare' : path.shortTitle;
const safeDestination = location => {
  const requested = new URLSearchParams(location.search).get('redirect');
  return requested && requested.startsWith('/') && !requested.startsWith('//') && !requested.includes('\\') && !requested.startsWith('/alege-directia')
    ? requested : '/dashboard';
};

const CareerOnboarding = () => {
  const { user } = useAuth();
  const history = useHistory();
  const location = useLocation();
  const [path, setPath] = useState(null);
  const [pressed, setPressed] = useState(null);
  const [error, setError] = useState('');
  const timer = useRef(null);
  const busy = useRef(false);
  const heading = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);
  useEffect(() => {
    heading.current?.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }, [path]);

  const transition = (id, action) => {
    if (busy.current) return;
    busy.current = true;
    setPressed(id);
    setError('');
    timer.current = setTimeout(() => {
      try { action(); }
      catch (_) { setError('Nu am putut salva alegerea. Încearcă din nou.'); }
      finally { busy.current = false; setPressed(null); }
    }, window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 240);
  };
  const chooseLevel = level => transition(level.code, () => {
    localStorage.setItem('norwegian_active_level', level.code);
    saveCareerProfile(user, path.id);
    const destination = new URL(safeDestination(location), window.location.origin);
    if (destination.searchParams.has('nivel')) destination.searchParams.set('nivel', level.code);
    history.replace(`${destination.pathname}${destination.search}${destination.hash}`);
  });

  return (
    <div className={`career-onboarding career-onboarding--${path ? 'levels' : 'paths'}`}>
      <header className="career-onboarding__brand">
        {path && <button className="career-onboarding__back" type="button" aria-label="Înapoi la trasee" disabled={Boolean(pressed)} onClick={() => { setPath(null); setError(''); }}>←</button>}
        <img src="/branding/nordlingo-selected-color.png" alt="NordLingo" width="150" />
      </header>
      <section className="career-onboarding__content" key={path ? 'levels' : 'paths'} aria-labelledby="onboarding-title">
        <h1 id="onboarding-title" ref={heading} tabIndex={-1}>{path ? 'Nivelul de norvegiană' : 'Alege traseul tău'}</h1>
        <div className="career-onboarding__list" aria-label={path ? 'Nivelul de norvegiană' : 'Traseul de norvegiană'} aria-busy={Boolean(pressed)}>
          {path ? levels.map((level, index) => (
            <button type="button" key={level.code} className={`career-onboarding__row career-onboarding__level${pressed === level.code ? ' is-selected' : ''}`} disabled={Boolean(pressed)} onClick={() => chooseLevel(level)}>
              <span className="career-onboarding__bars" aria-hidden="true">{[0, 1, 2, 3].map(bar => <i key={bar} className={bar <= index ? 'is-filled' : ''} />)}</span>
              <span><strong>{level.title}</strong><small>{level.description}</small></span>
            </button>
          )) : careerPaths.map(item => (
            <button type="button" key={item.id} className={`career-onboarding__row${pressed === item.id ? ' is-selected' : ''}`} disabled={Boolean(pressed)} onClick={() => transition(item.id, () => setPath(item))}>
              <CareerPathVisual pathId={item.id} /><strong>{pathLabel(item)}</strong>
            </button>
          ))}
        </div>
        {error && <p className="career-onboarding__error" role="alert">{error}</p>}
      </section>
    </div>
  );
};
export default CareerOnboarding;
