import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getVerbsForDay, getVerbsForExercises } from './verbs';
import ChallengeDragDrop from './ChallengeDragDrop';
import ChallengeFillIn from './ChallengeFillIn';
import './Challenge30.css';

const STORAGE_KEY = 'challenge30_progress';

const Challenge30 = () => {
  const [currentDay, setCurrentDay] = useState(1);
  const [activeTab, setActiveTab] = useState('vocab');
  const [progress, setProgress] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : { day: 1, completed: {} };
    } catch {
      return { day: 1, completed: {} };
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }, [progress]);

  const dayVerbs = getVerbsForDay(currentDay);
  const verbsForExercises = useMemo(() => getVerbsForExercises(currentDay), [currentDay]);

  const unlockDay = (day) => {
    setProgress((p) => ({ ...p, day: Math.max(p.day, day) }));
  };

  return (
    <div className="challenge30">
      <Link to="/invata-limba" className="challenge30__back">
        ← Înapoi la Învață limba
      </Link>

      <div className="challenge30__card">
        <header className="challenge30__header">
          <h1 className="challenge30__title">Învață verbele</h1>
          <p className="challenge30__subtitle">
            3 verbe norvegiene pe zi – învață și exersează
          </p>
        </header>

        <div className="challenge30__day-selector">
          <span className="challenge30__day-label">Ziua:</span>
          <div className="challenge30__day-grid">
            {[...Array(30)].map((_, i) => {
              const day = i + 1;
              const isUnlocked = day <= progress.day;
              const isCompleted = day < progress.day;
              return (
                <button
                  key={day}
                  type="button"
                  className={`challenge30__day-btn ${currentDay === day ? 'challenge30__day-btn--active' : ''} ${!isUnlocked ? 'challenge30__day-btn--locked' : ''} ${isCompleted ? 'challenge30__day-btn--completed' : ''}`}
                  onClick={() => isUnlocked && setCurrentDay(day)}
                  disabled={!isUnlocked}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>

        <div className="challenge30__tabs">
          <button
            type="button"
            className={`challenge30__tab ${activeTab === 'vocab' ? 'challenge30__tab--active' : ''}`}
            onClick={() => setActiveTab('vocab')}
          >
            Verbe ziua {currentDay}
          </button>
          <button
            type="button"
            className={`challenge30__tab ${activeTab === 'drag' ? 'challenge30__tab--active' : ''}`}
            onClick={() => setActiveTab('drag')}
          >
            Trage și plasează
          </button>
          <button
            type="button"
            className={`challenge30__tab ${activeTab === 'fill' ? 'challenge30__tab--active' : ''}`}
            onClick={() => setActiveTab('fill')}
          >
            Completare
          </button>
        </div>

        <div className="challenge30__content">
          {activeTab === 'vocab' && (
            <div className="challenge30__vocab">
              <h3>Verbe pentru ziua {currentDay}</h3>
              <ul className="challenge30__verb-list">
                {dayVerbs.map((v, i) => (
                  <li key={i}>
                    <strong>{v.norwegian}</strong> → {v.romanian}
                  </li>
                ))}
              </ul>
              {currentDay < progress.day && (
                <p className="challenge30__hint">Poți trece la ziua următoare din selector.</p>
              )}
              {currentDay === progress.day && progress.day < 30 && (
                <button
                  type="button"
                  className="challenge30__unlock"
                  onClick={() => unlockDay(currentDay + 1)}
                >
                  Deschide ziua {currentDay + 1}
                </button>
              )}
            </div>
          )}

          {activeTab === 'drag' && (
            <ChallengeDragDrop
              verbs={verbsForExercises}
              onComplete={() => unlockDay(currentDay + 1)}
            />
          )}

          {activeTab === 'fill' && (
            <ChallengeFillIn
              verbs={verbsForExercises}
              onComplete={() => unlockDay(currentDay + 1)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Challenge30;
