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
import '../ExerciseBack.css';
import '../MobileExercisePolish.css';

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
      <div className="challenge30__breadcrumb">
        <Link to={`/jocuri?nivel=${level}`} className="tool-back"><span aria-hidden="true">←</span><div><small>Înapoi la meniu</small><strong>Jocuri și exerciții</strong></div></Link>
        <span>Practică suplimentară</span>
      </div>
      <header className="challenge30__hero">
        <div className="challenge30__hero-copy">
          <span className="tool-level">Nivel {level} · {levelName[level]}</span>
          <p>Provocarea verbelor</p>
          <h1>Verbele de astăzi</h1>
          <small>Învață trei verbe utile, ascultă pronunția și fixează-le prin exerciții scurte.</small>
          <div className="challenge30__hero-meta" aria-label="Detaliile sesiunii">
            <span><strong>3</strong> verbe noi</span>
            <span><strong>~5</strong> minute</span>
            <span><strong>3</strong> pași</span>
          </div>
        </div>
        <div className="challenge30__hero-progress" aria-label={`Progres ${completedPercent}%`}>
          <div className="challenge30__hero-progress-top"><span>Parcursul nivelului</span><strong>{completedPercent}%</strong></div>
          <div className="challenge30__hero-progress-track" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={completedPercent}><span style={{ width: `${completedPercent}%` }} /></div>
          <div className="challenge30__hero-progress-foot"><span>Sesiunea curentă</span><strong>{currentDay} din 10</strong></div>
        </div>
      </header>

      <div className="challenge30__workspace">
        <aside className="challenge30__sidebar">
          <div className="challenge30__sidebar-heading"><div><p>Parcursul tău</p><h2>10 sesiuni</h2></div><span>{Math.max(0, progress.day - 1)}/10</span></div>
          <div className="challenge30__day-grid">
            {levelVerbs.map((_, index) => {
              const day = index + 1;
              const unlocked = day <= progress.day;
              return <button key={day} type="button" className={`${currentDay === day ? 'active' : ''} ${!unlocked ? 'locked' : ''} ${day < progress.day ? 'complete' : ''}`} onClick={() => unlocked && setCurrentDay(day)} disabled={!unlocked} aria-current={currentDay === day ? 'step' : undefined}><span>{day < progress.day ? '✓' : String(day).padStart(2, '0')}</span><div><strong>Sesiunea {day}</strong><small>{day < progress.day ? 'Finalizată' : unlocked ? 'Disponibilă acum' : 'Se deblochează pe parcurs'}</small></div></button>;
            })}
          </div>
        </aside>

        <main className="challenge30__panel">
          <div className="challenge30__panel-head"><div><p>Sesiunea {currentDay} · Nivel {level}</p><h2>Exersează pas cu pas</h2><small>Începe cu verbele noi, apoi verifică dacă le recunoști și le poți scrie.</small></div><span>{activeTab === 'vocab' ? 'Pasul 1 din 3' : activeTab === 'drag' ? 'Pasul 2 din 3' : 'Pasul 3 din 3'}</span></div>
          <div className="challenge30__tabs" role="tablist" aria-label="Pașii sesiunii">
            <button type="button" role="tab" aria-selected={activeTab === 'vocab'} className={activeTab === 'vocab' ? 'active' : ''} onClick={() => setActiveTab('vocab')}><span>01</span><div><strong>Învață</strong><small>Ascultă verbele</small></div></button>
            <button type="button" role="tab" aria-selected={activeTab === 'drag'} className={activeTab === 'drag' ? 'active' : ''} onClick={() => setActiveTab('drag')}><span>02</span><div><strong>Asociază</strong><small>Leagă sensurile</small></div></button>
            <button type="button" role="tab" aria-selected={activeTab === 'fill'} className={activeTab === 'fill' ? 'active' : ''} onClick={() => setActiveTab('fill')}><span>03</span><div><strong>Completează</strong><small>Scrie din memorie</small></div></button>
          </div>

          <div className="challenge30__content">
            {activeTab === 'vocab' && <div className="challenge30__learn"><div className="challenge30__section-intro"><span>Pasul 01</span><div><h3>Citește și ascultă</h3><p>Apasă pe difuzor și repetă fiecare verb cu voce tare.</p></div></div><div className="challenge30__verb-list">{dayVerbs.map((verb, index) => <article key={verb.norwegian}><div className="challenge30__verb-number">{String(index + 1).padStart(2, '0')}</div><div className="challenge30__verb-copy"><small>Norvegiană</small><strong>{verb.norwegian}</strong><span>{verb.romanian}</span></div><button type="button" onClick={() => speakNorwegian(verb.norwegian)} aria-label={`Ascultă ${verb.norwegian}`}><span aria-hidden="true">▶</span><small>Ascultă</small></button></article>)}</div>{currentDay === progress.day && progress.day < 10 && <div className="challenge30__next"><div><small>Ai parcurs cele trei verbe?</small><strong>Continuă când te simți pregătit.</strong></div><button type="button" className="challenge30__unlock" onClick={() => unlockDay(currentDay + 1)}>Am învățat · Deschide sesiunea {currentDay + 1} →</button></div>}{progress.day === 10 && currentDay === 10 && <div className="challenge30__complete"><span aria-hidden="true">✓</span><div><strong>Toate sesiunile sunt deschise</strong><p>Continuă cu exercițiile pentru a fixa verbele nivelului {level}.</p></div></div>}</div>}
            {activeTab === 'drag' && <><ChallengeDragDrop key={`drag-${level}-${currentDay}`} verbs={verbsForExercises} onComplete={() => unlockDay(currentDay + 1)} /><ChallengeSentenceMatch key={`sentence-${level}-${currentDay}`} verbs={dayVerbs} onComplete={() => unlockDay(currentDay + 1)} /></>}
            {activeTab === 'fill' && <ChallengeFillIn key={`fill-${level}-${currentDay}`} verbs={verbsForExercises} onComplete={() => unlockDay(currentDay + 1)} />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Challenge30;
