import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getLearningLevel, levelName } from '../lessons/learningLevel';
import { getReviewStats } from '../../services/spacedReview';
import MobileAppNav from '../layout/MobileAppNav';
import './GamesHub.css';
import './MobileExercisePolish.css';

const readJson = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key)) || fallback; }
  catch (_) { return fallback; }
};

const icons = {
  quiz: <svg viewBox="0 0 32 32" aria-hidden="true"><rect x="7" y="5" width="18" height="22" rx="4" /><path d="m11 11 1.6 1.6 2.8-3.1M11 17l1.6 1.6 2.8-3.1M18 11h3M18 17h3M11 23h10" /></svg>,
  order: <svg viewBox="0 0 32 32" aria-hidden="true"><rect x="4.5" y="6" width="10" height="7" rx="2" /><rect x="17.5" y="18.5" width="10" height="7" rx="2" /><path d="M14.5 9.5h4c3 0 4.5 1.7 4.5 5.2M20.5 12.2l2.5 2.7 2.6-2.7M17.5 22h-4c-3 0-4.5-1.7-4.5-5.2M11.5 19.3 9 16.6l-2.6 2.7" /></svg>,
  word: <svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="14" cy="14" r="7" /><path d="m19.2 19.2 7 7" /></svg>,
  verbs: <svg viewBox="0 0 32 32" aria-hidden="true"><path d="M5.5 7.5c4.2-.7 7.6.2 10.5 2.5v15c-2.9-2.3-6.3-3.1-10.5-2.4ZM26.5 7.5c-4.2-.7-7.6.2-10.5 2.5v15c2.9-2.3 6.3-3.1 10.5-2.4Z" /></svg>,
  pronunciation: <svg viewBox="0 0 32 32" aria-hidden="true"><rect x="11" y="5" width="10" height="15" rx="5" /><path d="M7.8 15.7a8.2 8.2 0 0 0 16.4 0M16 24v3.2M12.2 27.2h7.6" /></svg>,
  review: <svg viewBox="0 0 32 32" aria-hidden="true"><path d="M8.2 8.5A10 10 0 1 1 6 20.3" /><path d="M3.8 8.4h5.1v5.1" /></svg>,
};

const GamesHub = () => {
  const location = useLocation();
  const level = getLearningLevel(location.search);
  const reviewStats = getReviewStats(level);
  const verbProgress = readJson(`challenge_verbs_progress_${level.toLowerCase()}`, { day: 1 });
  const pronunciationAttempts = readJson(`pronunciation_attempts_${level.toLowerCase()}`, []);
  const verbSession = Math.max(1, Math.min(Number(verbProgress.day) || 1, 10));
  const pronunciationBest = Array.isArray(pronunciationAttempts)
    ? pronunciationAttempts.reduce((best, attempt) => Math.max(best, Number(attempt.score) || 0), 0)
    : 0;

  const gameCards = [
    { id: 'quiz', to: `/chestionar?nivel=${level}`, title: 'Chestionar', text: 'Testează ce ai învățat într-un mod distractiv.', progress: readJson('practice_game_progress_quiz', { completed: 0, target: 10 }) },
    { id: 'order', to: `/drag?nivel=${level}`, title: 'Construiește propoziția', text: 'Pune cuvintele în ordinea corectă.', progress: readJson('practice_game_progress_order', { completed: 0, target: 5 }) },
    { id: 'word', to: `/hangman?nivel=${level}`, title: 'Descoperă cuvântul', text: 'Găsește cuvintele ascunse în grilă.', progress: readJson('practice_game_progress_word', { completed: 0, target: 5 }) },
  ].map((game) => ({
    ...game,
    progress: {
      completed: Math.max(0, Number(game.progress.completed) || 0),
      target: Math.max(1, Number(game.progress.target) || 1),
    },
  }));

  const trainingCards = [
    { id: 'verbs', to: `/challenge30?nivel=${level}`, title: 'Verbele de astăzi', text: 'Exersează cele mai importante verbe norvegiene.', badge: `${verbSession} din 10` },
    { id: 'pronunciation', to: `/pronuntie?nivel=${level}`, title: 'Pronunție', text: 'Ascultă, repetă și îmbunătățește-ți accentul.', badge: pronunciationBest ? `${pronunciationBest}%` : 'Nou', accent: !pronunciationBest },
    { id: 'review', to: `/recapitulare?nivel=${level}`, title: 'Recapitulare', text: 'Consolidează ce ai învățat până acum.', badge: reviewStats.due ? `${reviewStats.due} de repetat` : level },
  ];

  return (
    <main className="games-hub">
      <Link className="games-hub__back" to={`/invata?nivel=${level}`}><span aria-hidden="true">←</span><div><small>Înapoi la meniu</small><strong>Lecțiile mele</strong></div></Link>

      <header className="games-hub__intro">
        <div><h1>Jocuri și exerciții</h1><p>Exersează în ritmul tău</p></div>
        <div className="games-hub__level" aria-label={`Nivel activ ${level}, ${levelName[level]}`}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 19v-5M10 19V9M15 19V5M20 19V2" /></svg>
          <span>Nivel {level}</span><b aria-hidden="true">⌄</b>
        </div>
      </header>

      <Link className="games-hub__daily" to={`/hangman?nivel=${level}`}>
        <div className="games-hub__daily-copy">
          <span className="games-hub__eyebrow"><i aria-hidden="true">★</i> Provocarea zilei</span>
          <h2>5 cuvinte<br />pentru azi</h2>
          <p>Învață și exersează cuvinte utile din viața de zi cu zi.</p>
          <div className="games-hub__daily-meta"><span aria-hidden="true">◷</span> 5 minute</div>
          <strong>Începe <span aria-hidden="true">›</span></strong>
        </div>
      </Link>

      <section className="games-hub__games" aria-labelledby="games-hub-games-title">
        <div className="games-hub__section-heading"><h2 id="games-hub-games-title">Mai multe jocuri și exerciții</h2><span>Vezi toate <b aria-hidden="true">›</b></span></div>
        <div className="games-hub__game-grid">
          {gameCards.map((game) => {
            const percent = Math.min(100, Math.round((game.progress.completed / game.progress.target) * 100));
            return (
              <Link className={`games-hub__game-card games-hub__game-card--${game.id}`} to={game.to} key={game.id}>
                <span className={`games-hub__game-icon games-hub__game-icon--${game.id}`}>
                  {game.id === 'order'
                    ? <span className="games-hub__word-tiles" aria-hidden="true"><i>jeg</i><i>er</i><i>her</i></span>
                    : icons[game.id]}
                </span>
                <h3>{game.id === 'word' ? <>Descoperă<br />cuvântul</> : game.title}</h3>
                <p>{game.text}</p>
                <div className="games-hub__game-progress" aria-label={`${game.progress.completed} din ${game.progress.target}`}><span style={{ width: `${percent}%` }} /></div>
                <footer><small>{game.progress.completed} din {game.progress.target}</small><b aria-hidden="true">›</b></footer>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="games-hub__training" aria-labelledby="games-hub-training-title">
        <div className="games-hub__section-heading"><h2 id="games-hub-training-title">Antrenament ghidat</h2><span>Vezi toate <b aria-hidden="true">›</b></span></div>
        <div className="games-hub__training-list">
          {trainingCards.map((item) => (
            <Link to={item.to} key={item.id}>
              <span className="games-hub__training-icon">{icons[item.id]}</span>
              <div><h3>{item.title}</h3><p>{item.text}</p></div>
              <em className={item.accent ? 'accent' : ''}>{item.id === 'verbs' && <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 19v-5M10 19V9M15 19V5M20 19V2" /></svg>}{item.badge}</em>
              <b aria-hidden="true">›</b>
            </Link>
          ))}
        </div>
      </section>

      <MobileAppNav activeLevel={level} />
    </main>
  );
};

export default GamesHub;
