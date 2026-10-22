import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { getLearningLevel } from '../../lessons/learningLevel';
import { speakNorwegian } from '../../../services/norwegianSpeech';
import { recordStudyActivity } from '../../../services/learningActivity';
import { ExerciseIcon, ExerciseLayout } from '../ExerciseUI';
import { getVerbSessions, readVerbProgress } from './verbsForLevel';
import ChallengeDragDrop from './ChallengeDragDrop';
import ChallengeFillIn from './ChallengeFillIn';
import ChallengeSentenceMatch from './ChallengeSentenceMatch';
import './Challenge30.css';
import { ExerciseArtwork } from '../NordicExerciseUI';

const steps = [['vocab', 'Învață'], ['drag', 'Asociază'], ['fill', 'Completează']];
const VerbSession = ({ level, userId }) => {
  const sessions = useMemo(() => getVerbSessions(level), [level]);
  const storageKey = 'challenge_verbs_progress_' + level.toLowerCase();
  const [progress, setProgress] = useState(() => readVerbProgress(localStorage, level, sessions.length));
  const [currentDay, setCurrentDay] = useState(() => readVerbProgress(localStorage, level, sessions.length).day);
  const [activeTab, setActiveTab] = useState('vocab');
  const [matchesDone, setMatchesDone] = useState(false);
  const tabs = useRef([]);
  const recorded = useRef(new Set());
  const dayVerbs = sessions[currentDay - 1] || [];
  const verbsForExercises = useMemo(() => {
    const previous = sessions.slice(0, currentDay - 1).flat();
    return [...dayVerbs, ...previous.slice(-3)];
  }, [sessions, currentDay, dayVerbs]);
  const percent = Math.round(progress.completed.length / sessions.length * 100);
  const chooseDay = (value) => { setCurrentDay(Number(value)); setActiveTab('vocab'); setMatchesDone(false); };
  useEffect(() => { localStorage.setItem(storageKey, JSON.stringify(progress)); }, [progress, storageKey]);
  const complete = () => {
    if (!recorded.current.has(currentDay)) {
      recorded.current.add(currentDay);
      recordStudyActivity({ type: 'verbs', level, userId, minutes: 3, session: currentDay, words: dayVerbs.length });
    }
    setProgress((value) => ({ day: Math.max(value.day, Math.min(currentDay + 1, sessions.length)), completed: [...new Set([...value.completed, currentDay])] }));
  };
  const navigateTabs = (event, index) => {
    const destination = { ArrowRight: (index + 1) % 3, ArrowLeft: (index + 2) % 3, Home: 0, End: 2 }[event.key];
    if (destination === undefined) return;
    event.preventDefault(); setActiveTab(steps[destination][0]); tabs.current[destination]?.focus();
  };
  return <ExerciseLayout className="challenge30" level={level} title="Verbele de astăzi" description={level.startsWith('C') ? 'Verbe și expresii din programa ta, cu recapitulare din nivelurile anterioare.' : 'Învață trei verbe, găsește perechile și scrie din memorie.'} icon="verbs" allowLevelChange>
    <section className="challenge30__overview" aria-label="Progresul verbelor"><div><span>Parcursul tău · {level}</span><strong>{progress.completed.length} din {sessions.length} sesiuni</strong></div><b>{percent}%</b><div role="progressbar" aria-label="Sesiuni parcurse" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent}><span style={{ width: percent + '%' }} /></div></section>
    <div className="challenge30__workspace">
      <aside className="challenge30__sidebar"><h2>Alege sesiunea</h2><div className="challenge30__day-grid">{sessions.map((_, index) => <button type="button" key={index} className={currentDay === index + 1 ? 'active' : ''} disabled={index + 1 > progress.day} aria-current={currentDay === index + 1 ? 'step' : undefined} onClick={() => chooseDay(index + 1)}><span>{progress.completed.includes(index + 1) ? '✓' : String(index + 1).padStart(2, '0')}</span><strong>Sesiunea {index + 1}</strong></button>)}</div></aside>
      <section className="challenge30__panel">
        <div className="challenge30__session-picker"><label className="exercise-field"><span>Sesiunea ta</span><select aria-label="Alege sesiunea de verbe" value={currentDay} onChange={(event) => chooseDay(event.target.value)}>{sessions.map((_, index) => <option key={index} value={index + 1} disabled={index + 1 > progress.day}>{'Sesiunea ' + (index + 1) + ' din ' + sessions.length + (progress.completed.includes(index + 1) ? ' · Parcursă' : index + 1 > progress.day ? ' · Urmează' : '')}</option>)}</select></label></div>
        <div className="challenge30__panel-head"><h2>Sesiunea {currentDay}</h2><span>Pasul {steps.findIndex(([id]) => id === activeTab) + 1} din 3</span></div>
        <div className="challenge30__tabs" role="tablist" aria-label="Pașii sesiunii">{steps.map(([id, title], index) => <button type="button" ref={(element) => { tabs.current[index] = element; }} role="tab" id={'verb-tab-' + id} aria-controls="verb-exercise-panel" aria-selected={activeTab === id} tabIndex={activeTab === id ? 0 : -1} onKeyDown={(event) => navigateTabs(event, index)} className={activeTab === id ? 'active' : ''} key={id} onClick={() => setActiveTab(id)}><span>{index + 1}</span><strong>{title}</strong></button>)}</div>
        <div className="challenge30__content" id="verb-exercise-panel" role="tabpanel" aria-labelledby={'verb-tab-' + activeTab}>
          {activeTab !== 'fill' && <ExerciseArtwork kind="verbs" className="ng-verb-art"/>}
          {activeTab === 'vocab' && <><h3>Citește și ascultă</h3><p className="challenge30__instructions">Repetă fiecare expresie cu voce tare. În exerciții revin și verbe cunoscute.</p><div className="challenge30__verb-list">{dayVerbs.map((verb, index) => <article key={verb.norwegian}><span className="challenge30__verb-number">{index + 1}</span><div><strong lang="nb">{verb.norwegian}</strong><span>{verb.romanian}</span></div><button type="button" onClick={() => speakNorwegian(verb.norwegian)} aria-label={'Ascultă ' + verb.norwegian}><ExerciseIcon name="listen" /></button></article>)}</div><button type="button" className="exercise-primary challenge30__continue" onClick={() => setActiveTab('drag')}>Exersează sensurile <span aria-hidden="true">→</span></button></>}
          {activeTab === 'drag' && <><ChallengeDragDrop key={'drag-' + currentDay} verbs={verbsForExercises} onComplete={() => setMatchesDone(true)} />{matchesDone && <button type="button" className="exercise-primary challenge30__continue" onClick={() => setActiveTab('fill')}>Continuă cu scrierea <span aria-hidden="true">→</span></button>}<details className="challenge30__extra"><summary>Exersează și în propoziții</summary><ChallengeSentenceMatch key={'sentences-' + currentDay} verbs={dayVerbs} /></details></>}
          {activeTab === 'fill' && <><ChallengeFillIn key={'fill-' + currentDay} verbs={verbsForExercises} onComplete={complete} />{progress.completed.includes(currentDay) && <div className="challenge30__complete" role="status"><strong>Sesiune parcursă ✓</strong><p>{currentDay < sessions.length ? 'Ai fixat expresiile. Poți continua cu următoarea sesiune.' : 'Ai ajuns la final. Revino oricând la sesiunile care au nevoie de practică.'}</p>{currentDay < sessions.length && <button type="button" className="exercise-primary" onClick={() => chooseDay(currentDay + 1)}>Sesiunea {currentDay + 1} <span aria-hidden="true">→</span></button>}</div>}</>}
        </div>
      </section>
    </div>
  </ExerciseLayout>;
};
const Challenge30 = () => {
  const { user } = useAuth();
  const location = useLocation();
  const level = getLearningLevel(location.search);
  const userId = user?.id || 'guest';
  return <VerbSession key={userId + '-' + level} level={level} userId={userId} />;
};
export default Challenge30;
