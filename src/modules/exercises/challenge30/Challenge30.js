import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { verbsByDay } from './verbs';
import { getLearningLevel, levelName } from '../../lessons/learningLevel';
import { speakNorwegian } from '../../../services/norwegianSpeech';
import ChallengeDragDrop from './ChallengeDragDrop';
import ChallengeFillIn from './ChallengeFillIn';
import ChallengeSentenceMatch from './ChallengeSentenceMatch';
import { recordStudyActivity } from '../../../services/learningActivity';
import './Challenge30.css';

const levelOffset = { A1: 0, A2: 10, B1: 20, B2: 30 };

const Challenge30 = () => {
  const location = useLocation();
  const level = getLearningLevel(location.search);
  const storageKey = `challenge_verbs_progress_${level.toLowerCase()}`;
  const [currentDay, setCurrentDay] = useState(1);
  const [activeTab, setActiveTab] = useState('vocab');
  const [progress, setProgress] = useState(() => {
    try { return JSON.parse(localStorage.getItem(storageKey)) || { day: 1 }; }
    catch (_) { return { day: 1 }; }
  });

  useEffect(() => { localStorage.setItem(storageKey, JSON.stringify(progress)); }, [progress, storageKey]);

  const levelVerbs = useMemo(() => verbsByDay.slice(levelOffset[level], levelOffset[level] + 10), [level]);
  const dayVerbs = levelVerbs[currentDay - 1] || [];
  const verbsForExercises = useMemo(() => {
    const previous = levelVerbs.slice(0, currentDay - 1).flat();
    return [...dayVerbs, ...previous.slice(Math.max(0, previous.length - 3))];
  }, [currentDay, dayVerbs, levelVerbs]);
  const completedPercent = Math.round(((progress.day - 1) / 10) * 100);
  const unlockDay = (day) => {
    const nextDay = Math.min(day, 10);
    if (nextDay > progress.day) recordStudyActivity({ type: 'verbs', level, minutes: 3, session: currentDay, words: 3 });
    setProgress((value) => ({ ...value, day: Math.max(value.day, nextDay) }));
  };

  return (
    <div className="challenge30">
      <Link to="/invata" className="tool-back">← Înapoi la curs</Link>
      <header className="challenge30__hero">
        <div><span className="tool-level">{level} · {levelName[level]}</span><p>Provocarea verbelor</p><h1>Construiește propoziții cu încredere</h1><small>10 sesiuni scurte, cu verbe potrivite nivelului {level}. Învață, asociază și completează.</small></div>
        <div className="challenge30__hero-progress"><div><strong>{completedPercent}%</strong><span>progres</span></div><div><span style={{ width: `${completedPercent}%` }} /></div><small>Sesiunea {currentDay} din 10</small></div>
      </header>

      <div className="challenge30__workspace">
        <aside className="challenge30__sidebar">
          <p>Parcursul tău</p><h2>10 sesiuni</h2>
          <div className="challenge30__day-grid">
            {levelVerbs.map((_, index) => {
              const day = index + 1;
              const unlocked = day <= progress.day;
              return <button key={day} type="button" className={`${currentDay === day ? 'active' : ''} ${!unlocked ? 'locked' : ''}`} onClick={() => unlocked && setCurrentDay(day)} disabled={!unlocked}><span>{day < progress.day ? '✓' : String(day).padStart(2, '0')}</span><div><strong>Sesiunea {day}</strong><small>{day < progress.day ? 'Finalizată' : unlocked ? 'Disponibilă' : 'Blocată'}</small></div></button>;
            })}
          </div>
        </aside>

        <main className="challenge30__panel">
          <div className="challenge30__panel-head"><div><p>Sesiunea {currentDay} · Nivel {level}</p><h2>Verbele de astăzi</h2></div><span>3 verbe noi</span></div>
          <div className="challenge30__tabs" role="tablist"><button type="button" className={activeTab === 'vocab' ? 'active' : ''} onClick={() => setActiveTab('vocab')}>Învață</button><button type="button" className={activeTab === 'drag' ? 'active' : ''} onClick={() => setActiveTab('drag')}>Asociază</button><button type="button" className={activeTab === 'fill' ? 'active' : ''} onClick={() => setActiveTab('fill')}>Completează</button></div>

          <div className="challenge30__content">
            {activeTab === 'vocab' && <div className="challenge30__verb-list">{dayVerbs.map((verb, index) => <article key={verb.norwegian}><span>{String(index + 1).padStart(2, '0')}</span><div><strong>{verb.norwegian}</strong><small>{verb.romanian}</small></div><button type="button" onClick={() => speakNorwegian(verb.norwegian)} aria-label={`Ascultă ${verb.norwegian}`}>▶</button></article>)}{currentDay === progress.day && progress.day < 10 && <button type="button" className="challenge30__unlock" onClick={() => unlockDay(currentDay + 1)}>Am învățat · Deschide sesiunea {currentDay + 1} →</button>}{progress.day === 10 && currentDay === 10 && <div className="challenge30__complete">Ai deschis toate sesiunile nivelului {level}. Continuă cu exercițiile pentru a fixa verbele.</div>}</div>}
            {activeTab === 'drag' && <><ChallengeDragDrop key={`drag-${level}-${currentDay}`} verbs={verbsForExercises} onComplete={() => unlockDay(currentDay + 1)} /><ChallengeSentenceMatch key={`sentence-${level}-${currentDay}`} verbs={dayVerbs} onComplete={() => unlockDay(currentDay + 1)} /></>}
            {activeTab === 'fill' && <ChallengeFillIn key={`fill-${level}-${currentDay}`} verbs={verbsForExercises} onComplete={() => unlockDay(currentDay + 1)} />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Challenge30;
