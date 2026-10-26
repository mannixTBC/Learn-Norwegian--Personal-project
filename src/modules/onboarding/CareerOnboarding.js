import React, { useEffect, useRef, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { careerPaths, getCareerProfile, saveCareerProfile } from '../../services/careerProfile';
import CareerPathVisual from './CareerPathVisual';
import './CareerOnboarding.css';

// Additional languages preview the future catalogue; lessons remain Romanian / Norwegian.
const supportLanguages = [
  { code: 'ro', title: 'Română', flag: 'ro' },
  { code: 'en', title: 'English', flag: 'gb' },
  { code: 'pl', title: 'Polski', flag: 'pl' },
  { code: 'uk', title: 'Українська', flag: 'ua' },
];
const learningLanguages = [
  { code: 'nb', title: 'Norvegiană', flag: 'no' },
  { code: 'de', title: 'Germană', flag: 'de' },
  { code: 'fr', title: 'Franceză', flag: 'fr' },
  { code: 'en', title: 'Engleză', flag: 'gb' },
];
const steps = [
  { id: 'support', label: 'Explicații', title: 'În ce limbă vrei explicațiile?' },
  { id: 'language', label: 'Limba învățată', title: 'Ce limbă vrei să înveți?' },
  { id: 'paths', label: 'Traseu', title: 'Alege traseul tău' },
  { id: 'levels', label: 'Nivel', title: 'De unde începem?' },
];
const levels = [
  { code: 'A1', badge: 'A1', title: 'Începător', description: 'Încep de la zero' },
  { code: 'A2', badge: 'A2', title: 'De bază', description: 'Înțeleg expresii uzuale' },
  { code: 'B1', badge: 'B1–B2', title: 'Intermediar', description: 'Pot purta conversații' },
  { code: 'C1', badge: 'C1–C2', title: 'Avansat', description: 'Mă exprim fluent' },
];
const pathLabels = {
  transport: 'Transport', hospitality: 'Hoteluri și restaurante', construction: 'Construcții',
  healthcare: 'Sănătate', cleaning: 'Curățenie', retail: 'Comerț', office: 'Birou',
  studies: 'Studii', family: 'Familie', general: 'Viața de zi cu zi',
};
const safeDestination = location => {
  const requested = new URLSearchParams(location.search).get('redirect');
  return requested && requested.startsWith('/') && !requested.startsWith('//') && !requested.includes('\\') && !requested.startsWith('/alege-directia')
    ? requested : '/dashboard';
};

const CareerOnboarding = () => {
  const { user } = useAuth();
  const history = useHistory();
  const location = useLocation();
  const [savedProfile] = useState(() => getCareerProfile(user));
  const [step, setStep] = useState(0);
  const [supportLanguage, setSupportLanguage] = useState(savedProfile?.supportLanguage || null);
  const [learningLanguage, setLearningLanguage] = useState(savedProfile?.learningLanguage || null);
  const [pathId, setPathId] = useState(savedProfile?.pathId || null);
  const [pressed, setPressed] = useState(null);
  const [error, setError] = useState('');
  const timer = useRef(null);
  const busy = useRef(false);
  const heading = useRef(null);
  const currentStep = steps[step];

  useEffect(() => () => clearTimeout(timer.current), []);
  useEffect(() => {
    heading.current?.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }, [step]);

  const transition = (id, action) => {
    if (busy.current) return;
    busy.current = true;
    setPressed(id);
    setError('');
    timer.current = setTimeout(() => {
      try { action(); }
      catch (_) { setError('Nu am putut salva alegerea. Încearcă din nou.'); }
      finally { busy.current = false; setPressed(null); }
    }, window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 200);
  };
  const chooseLanguage = language => transition(language.code, () => {
    if (step === 0) setSupportLanguage(language.code);
    else setLearningLanguage(language.code);
    setStep(step + 1);
  });
  const choosePath = id => transition(id, () => { setPathId(id); setStep(3); });
  const chooseLevel = level => transition(level.code, () => {
    localStorage.setItem('norwegian_active_level', level.code);
    saveCareerProfile(user, pathId, { supportLanguage, learningLanguage });
    const destination = new URL(safeDestination(location), window.location.origin);
    if (destination.searchParams.has('nivel')) destination.searchParams.set('nivel', level.code);
    history.replace(`${destination.pathname}${destination.search}${destination.hash}`);
  });
  const goBack = () => {
    if (busy.current) return;
    setError('');
    setStep(previous => Math.max(0, previous - 1));
  };
  const cardClass = (id, selected) => `career-onboarding__card${pressed === id || selected ? ' is-selected' : ''}`;

  return (
    <div className={`career-onboarding career-onboarding--${currentStep.id}`}>
      <header className="career-onboarding__header">
        <div className="career-onboarding__brand">
          <img src="/branding/nordlingo-selected-color.png" alt="NordLingo" width="150" />
          <ol className="career-onboarding__progress" aria-label={`Pasul ${step + 1} din ${steps.length}`}>
            {steps.map((item, index) => (
              <li key={item.id} className={index <= step ? 'is-reached' : ''} aria-current={index === step ? 'step' : undefined}>
                <span className="career-onboarding__sr-only">{index + 1}. {item.label}</span>
              </li>
            ))}
          </ol>
        </div>
        <div className="career-onboarding__navigation">
          {step > 0 && (
            <button className="career-onboarding__back" type="button" aria-label={`Înapoi la ${steps[step - 1].label.toLocaleLowerCase('ro')}`} disabled={Boolean(pressed)} onClick={goBack}>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 5-7 7 7 7M5 12h15" /></svg>
            </button>
          )}
        </div>
      </header>
      <section className="career-onboarding__content" key={currentStep.id} aria-labelledby="onboarding-title">
        <h1 id="onboarding-title" ref={heading} tabIndex={-1}>{currentStep.title}</h1>
        <div className={`career-onboarding__choices${step === 2 ? ' career-onboarding__choices--paths' : ''}`} role="group" aria-label={currentStep.label} aria-busy={Boolean(pressed)}>
          {step < 2 && (step === 0 ? supportLanguages : learningLanguages).map(language => (
            <button type="button" key={language.code} className={`${cardClass(language.code, (step === 0 ? supportLanguage : learningLanguage) === language.code)} career-onboarding__language`} aria-pressed={(step === 0 ? supportLanguage : learningLanguage) === language.code} disabled={Boolean(pressed)} onClick={() => chooseLanguage(language)}>
              <span className={`career-onboarding__flag career-onboarding__flag--${language.flag}`} aria-hidden="true" />
              <strong>{language.title}</strong>
            </button>
          ))}
          {step === 2 && careerPaths.map(path => (
            <button type="button" key={path.id} className={`${cardClass(path.id, pathId === path.id)} career-onboarding__path`} aria-pressed={pathId === path.id} disabled={Boolean(pressed)} onClick={() => choosePath(path.id)}>
              <CareerPathVisual pathId={path.id} /><strong>{pathLabels[path.id] || path.shortTitle}</strong>
            </button>
          ))}
          {step === 3 && levels.map(level => (
            <button type="button" key={level.code} className={`${cardClass(level.code)} career-onboarding__level`} disabled={Boolean(pressed)} onClick={() => chooseLevel(level)}>
              <span className="career-onboarding__level-badge" aria-hidden="true">{level.badge}</span>
              <span><strong>{level.title}</strong><small>{level.description}</small><span className="career-onboarding__sr-only"> — {level.badge}</span></span>
            </button>
          ))}
        </div>
        {error && <p className="career-onboarding__error" role="alert">{error}</p>}
      </section>
    </div>
  );
};
export default CareerOnboarding;
