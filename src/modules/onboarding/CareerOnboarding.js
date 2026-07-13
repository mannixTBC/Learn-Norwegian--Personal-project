import React, { useMemo, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { careerPaths, getCareerPath, getCareerProfile, saveCareerProfile } from '../../services/careerProfile';
import './CareerOnboarding.css';

const safeDestination = (location) => {
  const requested = new URLSearchParams(location.search).get('redirect');
  return requested && requested.startsWith('/') && !requested.startsWith('//') ? requested : '/dashboard';
};

const CareerOnboarding = () => {
  const { user } = useAuth();
  const history = useHistory();
  const location = useLocation();
  const existingProfile = getCareerProfile(user);
  const [selectedPath, setSelectedPath] = useState(existingProfile ? existingProfile.pathId : '');
  const selected = useMemo(() => selectedPath ? getCareerPath(selectedPath) : null, [selectedPath]);
  const isEditing = Boolean(existingProfile);

  const save = () => {
    if (!selectedPath) return;
    saveCareerProfile(user, selectedPath);
    history.replace(safeDestination(location));
  };

  return (
    <div className="career-onboarding">
      <header className="career-onboarding__hero">
        <div>
          <span className="career-onboarding__step">Un singur pas · se poate schimba oricând</span>
          <h1>{isEditing ? 'Schimbă direcția cursului' : 'Pentru ce vrei să folosești norvegiana?'}</h1>
          <p>Alegerea ta personalizează exemplele, vocabularul, audio și scenariile din fiecare lecție. Programa A1–B2 și progresul tău rămân aceleași.</p>
        </div>
        <div className="career-onboarding__mix" aria-label="Structura cursului personalizat">
          <div><strong>70%</strong><span>norvegiană esențială</span></div>
          <div><strong>30%</strong><span>direcția aleasă</span></div>
        </div>
      </header>

      <main>
        <div className="career-onboarding__heading"><div><span>Direcția ta</span><h2>Alege varianta cea mai apropiată de planul tău</h2></div><small>Nu trebuie să ai deja experiență în domeniu.</small></div>
        <div className="career-path-grid" role="radiogroup" aria-label="Direcții pentru curs">
          {careerPaths.map((path) => (
            <button
              type="button"
              role="radio"
              aria-checked={selectedPath === path.id}
              className={`career-path-card ${selectedPath === path.id ? 'career-path-card--selected' : ''}`}
              onClick={() => setSelectedPath(path.id)}
              key={path.id}
            >
              <span className="career-path-card__icon" aria-hidden="true">{path.icon}</span>
              <span className="career-path-card__copy"><strong>{path.title}</strong><small>{path.description}</small></span>
              <span className="career-path-card__check" aria-hidden="true">{selectedPath === path.id ? '✓' : ''}</span>
            </button>
          ))}
        </div>

        <section className={`career-selection ${selected ? 'career-selection--ready' : ''}`} aria-live="polite">
          {selected ? <>
            <div className="career-selection__icon" aria-hidden="true">{selected.icon}</div>
            <div><span>Cursul tău va include</span><h2>{selected.title}</h2><p>{selected.outcome}</p><div className="career-selection__preview">{selected.phrases.slice(0, 3).map((phrase) => <span key={phrase[0]}>{phrase[0]}</span>)}</div></div>
            <button type="button" onClick={save}>{isEditing ? 'Salvează direcția' : 'Creează traseul meu'} →</button>
          </> : <div className="career-selection__empty"><strong>Alege o direcție pentru a continua</strong><span>Poți selecta „Norvegiană generală” dacă încă nu ești sigur.</span></div>}
        </section>
      </main>
    </div>
  );
};

export default CareerOnboarding;
