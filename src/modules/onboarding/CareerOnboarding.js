import React from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { careerPaths, getCareerProfile, saveCareerProfile } from '../../services/careerProfile';
import CareerPathVisual from './CareerPathVisual';
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
  const isEditing = Boolean(existingProfile);

  const choosePath = (pathId) => {
    saveCareerProfile(user, pathId);
    history.replace(safeDestination(location));
  };

  return (
    <div className="career-onboarding">
      <header className="career-onboarding__hero">
        <div>
          <span className="career-onboarding__step">Un singur pas · se poate schimba oricând</span>
          <h1>{isEditing ? 'Schimbă direcția cursului' : 'Construiește-ți cursul în jurul planurilor tale'}</h1>
          <p>Indiferent de planurile tale, vei învăța norvegiana prin situații practice și exemple relevante.</p>
        </div>
      </header>

      <main>
        <div className="career-onboarding__heading"><div><span>Direcția ta</span><h2>Alege varianta cea mai apropiată de planul tău</h2></div><small>Alege o direcție și intri imediat în cursul personalizat.</small></div>
        <div className="career-path-grid" aria-label="Direcții pentru curs">
          {careerPaths.map((path) => (
            <article
              className={`career-path-card ${existingProfile && existingProfile.pathId === path.id ? 'career-path-card--current' : ''}`}
              key={path.id}
            >
              <CareerPathVisual pathId={path.id} className="career-path-card__icon" />
              <span className="career-path-card__copy">
                <strong>{path.title}</strong>
                <small>{path.description}</small>
                {existingProfile && existingProfile.pathId === path.id && <em>Direcția actuală</em>}
              </span>
              <button type="button" className="career-path-card__action" onClick={() => choosePath(path.id)}>
                {existingProfile && existingProfile.pathId === path.id ? 'Continuă cu această direcție' : 'Alege această direcție'} <span aria-hidden="true">→</span>
              </button>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
};

export default CareerOnboarding;
