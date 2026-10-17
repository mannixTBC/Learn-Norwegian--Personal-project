import React, { useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getLearningLevel, levelName } from '../lessons/learningLevel';
import { getReviewStats } from '../../services/spacedReview';
import { getStudySummary } from '../../services/learningActivity';
import MobileAppNav from '../layout/MobileAppNav';
import './GamesHub.css';
import './MobileExercisePolish.css';

const readJson = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key)) || fallback; }
  catch (_) { return fallback; }
};

const icons = {
  quiz: <svg viewBox="0 0 32 32" aria-hidden="true"><rect x="7" y="5" width="18" height="22" rx="4" /><path d="m11 11 1.6 1.6 2.8-3.1M11 17l1.6 1.6 2.8-3.1M18 11h3M18 17h3M11 23h10" /></svg>,
  order: <svg viewBox="0 0 32 32" aria-hidden="true"><rect x="5" y="6" width="9" height="8" rx="2" /><rect x="18" y="18" width="9" height="8" rx="2" /><path d="M14 10h4.5c3.2 0 4.5 1.7 4.5 5M19.5 12.5 23 16l3.5-3.5M18 22h-4.5C10.3 22 9 20.3 9 17M12.5 19.5 9 16l-3.5 3.5" /></svg>,
  word: <svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="14" cy="14" r="7" /><path d="m19.2 19.2 7 7" /><path d="M11.5 14h5M14 11.5v5" /></svg>,
  verbs: <svg viewBox="0 0 32 32" aria-hidden="true"><path d="M5.5 7.5c4.2-.7 7.6.2 10.5 2.5v15c-2.9-2.3-6.3-3.1-10.5-2.4ZM26.5 7.5c-4.2-.7-7.6.2-10.5 2.5v15c2.9-2.3 6.3-3.1 10.5-2.4Z" /></svg>,
  pronunciation: <svg viewBox="0 0 32 32" aria-hidden="true"><rect x="11" y="5" width="10" height="15" rx="5" /><path d="M7.8 15.7a8.2 8.2 0 0 0 16.4 0M16 24v3.2M12.2 27.2h7.6" /></svg>,
  review: <svg viewBox="0 0 32 32" aria-hidden="true"><path d="M8.2 8.5A10 10 0 1 1 6 20.3" /><path d="M3.8 8.4h5.1v5.1" /><path d="M11.2 13.1h9.6M11.2 17h7.4M11.2 20.9h5.2" /></svg>,
};

const filters = [
  { id: 'all', label: 'Toate' },
  { id: 'short', label: '5 minute' },
  { id: 'vocabulary', label: 'Vocabular' },
  { id: 'grammar', label: 'Gramatică' },
  { id: 'pronunciation', label: 'Pronunție' },
];

const GamesHub = () => {
  const location = useLocation();
  const level = getLearningLevel(location.search);
  const [activeFilter, setActiveFilter] = useState('all');
  const reviewStats = getReviewStats(level);
  const studySummary = useMemo(() => getStudySummary(), []);
  const verbProgress = readJson(`challenge_verbs_progress_${level.toLowerCase()}`, { day: 1 });
  const pronunciationAttempts = readJson(`pronunciation_attempts_${level.toLowerCase()}`, []);
  const verbSession = Math.max(1, Math.min(Number(verbProgress.day) || 1, 10));
  const completedVerbSessions = Math.max(0, verbSession - 1);
  const pronunciationBest = Array.isArray(pronunciationAttempts)
    ? pronunciationAttempts.reduce((best, attempt) => Math.max(best, Number(attempt.score) || 0), 0)
    : 0;
  const reviewComplete = reviewStats.total > 0 && reviewStats.due === 0;
  const currentActivity = reviewStats.due > 0
    ? 'review'
    : completedVerbSessions > 0 && verbSession < 10
      ? 'verbs'
      : pronunciationAttempts.length > 0 && pronunciationBest < 75
        ? 'pronunciation'
        : 'quiz';

  const activities = [
    { id: 'quiz', to: `/chestionar?nivel=${level}`, category: 'vocabulary', minutes: 5, title: 'Chestionar', text: 'Verifică rapid vocabularul și expresiile din lecții.', meta: '5–15 întrebări' },
    { id: 'order', to: `/drag?nivel=${level}`, category: 'grammar', minutes: 5, title: 'Construiește propoziția', text: 'Așază cuvintele în ordinea corectă.', meta: 'Sesiune personalizată' },
    { id: 'word', to: `/hangman?nivel=${level}`, category: 'vocabulary', minutes: 5, title: 'Descoperă cuvântul', text: 'Găsește cuvântul norvegian folosind indiciile.', meta: '5–15 cuvinte' },
    { id: 'verbs', to: `/challenge30?nivel=${level}`, category: 'grammar', minutes: 5, title: 'Verbele de astăzi', text: 'Fixează trei verbe prin exerciții scurte.', meta: `Sesiunea ${verbSession} din 10` },
    { id: 'pronunciation', to: `/pronuntie?nivel=${level}`, category: 'pronunciation', minutes: 5, title: 'Pronunție', text: 'Ascultă, repetă și primește feedback.', meta: pronunciationBest ? `Cel mai bun scor: ${pronunciationBest}%` : 'Prima sesiune' },
    {
      id: 'review', to: `/recapitulare?nivel=${level}`, category: 'vocabulary', minutes: 10, title: 'Recapitulare', text: 'Reia exact elementele care au nevoie de atenție.',
      meta: reviewStats.due ? `${reviewStats.due} ${reviewStats.due === 1 ? 'element pregătit' : 'elemente pregătite'}` : reviewStats.total ? 'Totul este la zi' : 'Se adaptează progresului tău',
      complete: reviewComplete,
    },
  ];

  const visibleActivities = activities.filter((activity) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'short') return activity.minutes <= 5;
    return activity.category === activeFilter;
  });

  return (
    <div className="games-hub">
      <Link className="games-hub__back" to={`/invata?nivel=${level}`}><span aria-hidden="true">←</span><div><small>Înapoi la meniu</small><strong>Lecțiile mele</strong></div></Link>

      <header className="games-hub__intro">
        <div><h1>Jocuri și exerciții</h1><p>Exersează în ritmul tău.</p></div>
        <div className="games-hub__level" aria-label={`Nivel activ ${level}, ${levelName[level]}`}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 19v-5M10 19V9M15 19V5M20 19V2" /></svg><span>Nivel {level}</span></div>
      </header>

      <Link className="games-hub__daily" to={`/hangman?nivel=${level}`}>
        <div className="games-hub__daily-copy">
          <span className="games-hub__eyebrow"><i aria-hidden="true">★</i> Provocarea zilei</span>
          <h2>5 cuvinte pentru azi</h2>
          <p>Învață și exersează cuvinte utile din viața de zi cu zi.</p>
          <div className="games-hub__daily-meta"><span>◷ 5 minute</span><span>★ +10 XP</span></div>
          <strong>Începe <span aria-hidden="true">→</span></strong>
        </div>
        <div className="games-hub__fjord" aria-hidden="true"><span /><i /><b /></div>
      </Link>

      <section className="games-hub__momentum" aria-label="Progresul activităților">
        <div className="games-hub__streak"><span aria-hidden="true">♨</span><div><strong>{studySummary.streak ? `${studySummary.streak} ${studySummary.streak === 1 ? 'zi' : 'zile'} la rând` : 'Începe seria de azi'}</strong><small>{studySummary.streak ? 'Continuă și menține ritmul.' : 'O sesiune scurtă este suficientă.'}</small></div></div>
        <div className="games-hub__verb-progress"><div><span>Parcursul verbelor</span><strong>{completedVerbSessions} din 10 sesiuni</strong></div><div className="games-hub__progress-dots" aria-hidden="true">{Array.from({ length: 10 }, (_, index) => <i className={index < completedVerbSessions ? 'complete' : index === completedVerbSessions ? 'current' : ''} key={index} />)}</div></div>
      </section>

      <nav className="games-hub__filters" aria-label="Filtrează activitățile">
        {filters.map((filter) => <button type="button" className={activeFilter === filter.id ? 'active' : ''} onClick={() => setActiveFilter(filter.id)} aria-pressed={activeFilter === filter.id} key={filter.id}>{filter.label}</button>)}
      </nav>

      <section className="games-hub__journey" aria-labelledby="journey-title">
        <div className="games-hub__journey-heading"><div><span>Toate activitățile sunt disponibile</span><h2 id="journey-title">Continuă traseul</h2></div><small>{visibleActivities.length} {visibleActivities.length === 1 ? 'activitate' : 'activități'}</small></div>
        <div className="games-hub__activity-list">
          {visibleActivities.map((activity) => {
            const isCurrent = activity.id === currentActivity;
            const state = activity.complete ? 'complete' : isCurrent ? 'current' : 'available';
            return (
              <div className={`games-hub__activity-step games-hub__activity-step--${state}`} key={activity.id}>
                <span className="games-hub__node" aria-hidden="true">{activity.complete ? '✓' : ''}</span>
                <Link className="games-hub__activity-card" to={activity.to} aria-label={`${isCurrent ? 'Continuă ' : 'Deschide '}${activity.title}`}>
                  <span className="games-hub__activity-icon">{icons[activity.id]}</span>
                  <div className="games-hub__activity-copy"><div><h3>{activity.title}</h3>{activity.complete && <em>Finalizată</em>}</div><p>{activity.text}</p><small>◷ {activity.minutes} min <i /> {activity.meta}</small></div>
                  {isCurrent ? <strong>Continuă <span aria-hidden="true">→</span></strong> : <b aria-hidden="true">→</b>}
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      <MobileAppNav activeLevel={level} />
    </div>
  );
};

export default GamesHub;
