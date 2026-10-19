import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getLearningLevel, levelName } from '../lessons/learningLevel';
import { getReviewStats } from '../../services/spacedReview';
import { getStudySummary } from '../../services/learningActivity';
import MobileAppNav from '../layout/MobileAppNav';
import { useAuth } from '../auth/AuthContext';
import { getCareerPath, getCareerProfile } from '../../services/careerProfile';
import { ActivityIcon } from './ActivityGame';
import { readPracticeProgress } from './practiceActivities';
import './GamesHub.css';
import { ExerciseLevelSelect } from './ExerciseUI';
import { readGameProgress } from './practiceGameData';
import { getVerbSessions, readVerbProgress } from './challenge30/verbsForLevel';

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
  const { user } = useAuth();
  const location = useLocation();
  const level = getLearningLevel(location.search);
  const reviewStats = getReviewStats(level);
  const studySummary = getStudySummary();
  const storedBalance = Number(localStorage.getItem('norwegian_reward_balance'));
  const rewardBalance = Number.isFinite(storedBalance) ? Math.max(0, Math.floor(storedBalance)) : 0;
  const verbSessionCount = getVerbSessions(level).length;
  const verbProgress = readVerbProgress(localStorage, level, verbSessionCount);
  const pronunciationAttempts = readJson(`pronunciation_attempts_${level.toLowerCase()}`, []);
  const verbSession = verbProgress.completed.length;
  const pronunciationBest = Array.isArray(pronunciationAttempts)
    ? pronunciationAttempts.reduce((best, attempt) => Math.min(100, Math.max(best, Number(attempt?.score) || 0)), 0)
    : 0;

  const gameCards = [
    { id: 'quiz', to: `/chestionar?nivel=${level}`, title: 'Chestionar', text: 'Testează ce ai învățat într-un mod distractiv.', progress: readGameProgress(localStorage, 'quiz', level, user?.id) },
    { id: 'order', to: `/drag?nivel=${level}`, title: 'Construiește propoziția', text: 'Pune cuvintele în ordinea corectă.', progress: readGameProgress(localStorage, 'order', level, user?.id) },
    { id: 'word', to: `/hangman?nivel=${level}`, title: 'Descoperă cuvântul', text: 'Folosește indiciile și scrie expresia corectă.', progress: readGameProgress(localStorage, 'word', level, user?.id) },
  ].map((game) => ({
    ...game,
    progress: {
      completed: Math.max(0, Number(game.progress.completed) || 0),
      target: Math.max(1, Number(game.progress.target) || 1),
    },
  }));

  const trainingCards = [
    { id: 'verbs', to: `/challenge30?nivel=${level}`, title: 'Verbele de astăzi', text: 'Exersează cele mai importante verbe norvegiene.', badge: `${verbSession} din ${verbSessionCount}` },
    { id: 'pronunciation', to: `/pronuntie?nivel=${level}`, title: 'Pronunție', text: 'Ascultă, repetă și îmbunătățește-ți accentul.', badge: pronunciationBest ? `${pronunciationBest}%` : 'Nou', accent: !pronunciationBest },
    { id: 'review', to: `/recapitulare?nivel=${level}`, title: 'Recapitulare', text: 'Consolidează ce ai învățat până acum.', badge: reviewStats.due ? `${reviewStats.due} de repetat` : level },
  ];

  const appGameCards = [
    { id: 'quiz', to: `/chestionar?nivel=${level}`, title: 'Vocabular', progress: gameCards[0].progress, icon: icons.quiz },
    { id: 'order', to: `/drag?nivel=${level}`, title: 'Propoziții', progress: gameCards[1].progress, icon: icons.order },
    { id: 'verbs', to: `/challenge30?nivel=${level}`, title: 'Verbe', progress: { completed: verbSession, target: verbSessionCount }, icon: icons.verbs },
    { id: 'pronunciation', to: `/pronuntie?nivel=${level}`, title: 'Pronunție', progress: { completed: pronunciationBest, target: 100 }, icon: icons.pronunciation },
    { id: 'word', to: `/hangman?nivel=${level}`, title: 'Cuvinte', progress: gameCards[2].progress, icon: icons.word },
    { id: 'review', to: `/recapitulare?nivel=${level}`, title: 'Recapitulare', progress: { completed: reviewStats.total - reviewStats.due, target: Math.max(1, reviewStats.total) }, badge: reviewStats.due ? `${reviewStats.due} de repetat` : reviewStats.total ? 'La zi' : 'Nou', icon: icons.review },
  ];
  const streak = Math.max(0, Number(studySummary.streak) || 0);
  const careerPath = getCareerPath(getCareerProfile(user)?.pathId);
  const newGames = [
    { id: 'listen', to: '/asculta-si-alege', title: 'Ascultă și alege', text: 'Auzi norvegiana. Descoperă sensul.', meta: `${level} · 10 întrebări` },
    { id: 'missions', to: '/misiuni-la-serviciu', title: 'Misiuni la serviciu', text: 'Situații reale. Replica potrivită.', meta: `${['C1', 'C2'].includes(level) ? 'Recapitulare B2' : level} · ${careerPath.shortTitle}` },
  ].map((game) => ({ ...game, progress: readPracticeProgress(localStorage, { game: game.id, level: game.id === 'missions' && ['C1', 'C2'].includes(level) ? 'B2' : level, pathId: careerPath.id, userId: user?.id || 'guest' }) }));

  return (
    <div className="games-hub">
      <Link className="games-hub__back" to={`/invata?nivel=${level}`}><span aria-hidden="true">←</span><div><small>Înapoi la meniu</small><strong>Lecțiile mele</strong></div></Link>

      <header className="games-hub__app-rewards">
        <h1>Jocuri</h1>
        <div className="games-hub__reward-pill" aria-label={`${rewardBalance} ${rewardBalance === 1 ? 'monedă disponibilă' : 'monede disponibile'}`}>
          <span className="games-hub__coin" aria-hidden="true">
            <img src="/images/norwegian-gold-coin.svg" width="35" height="35" alt="" />
          </span>
          <span><strong>{rewardBalance.toLocaleString('ro-RO')}</strong><small>{rewardBalance === 1 ? 'monedă' : 'monede'}</small></span>
        </div>
        <div className="games-hub__streak-pill" aria-label={`Serie curentă: ${streak} ${streak === 1 ? 'zi' : 'zile'}`}>
          <span aria-hidden="true">🔥</span><strong>{streak}</strong><small>{streak === 1 ? 'zi' : 'zile'}</small>
        </div>
        <ExerciseLevelSelect level={level} />
      </header>

      <header className="games-hub__intro">
        <div><h1>Jocuri și exerciții</h1><p>Exersează în ritmul tău</p></div>
        <div className="games-hub__level" aria-label={`Nivel activ ${level}, ${levelName[level]}`}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 19v-5M10 19V9M15 19V5M20 19V2" /></svg>
          <ExerciseLevelSelect level={level} />
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

      <section className="games-hub__new-games" aria-labelledby="games-hub-new-title">
        <div className="games-hub__new-heading"><h2 id="games-hub-new-title">Ascultă. Înțelege. Răspunde.</h2><span>Două moduri de a exersa</span></div>
        <div className="games-hub__new-grid">{newGames.map((game) => <Link className={`games-hub__new-card games-hub__card games-hub__new-card--${game.id}`} to={`${game.to}?nivel=${level}`} key={game.id}>
          <span className="games-hub__new-icon"><ActivityIcon game={game.id} /></span>
          <div><small>{game.meta}</small><h3>{game.title}</h3><p>{game.text}</p><span className="games-hub__new-badge">{game.progress.sessions ? `Record: ${game.progress.best}% · ${game.progress.sessions} ${game.progress.sessions === 1 ? 'sesiune' : 'sesiuni'}` : 'Încearcă acum'}</span></div>
          <b aria-hidden="true">↗</b>
        </Link>)}</div>
      </section>

      <section className="games-hub__app-library" aria-label="Biblioteca de jocuri">
        {appGameCards.map((game) => {
          const percent = Math.min(100, Math.round((game.progress.completed / game.progress.target) * 100));
          const progressLabel = game.badge || (game.id === 'pronunciation'
            ? Array.isArray(pronunciationAttempts) && pronunciationAttempts.length ? `${pronunciationBest}%` : 'Nou'
            : `${game.progress.completed} din ${game.progress.target}`);
          return (
            <Link to={game.to} key={game.id}>
              <span className={`games-hub__app-game-icon games-hub__app-game-icon--${game.id}`}>{game.icon}</span>
              <span className="games-hub__app-game-copy">
                <strong>{game.title}</strong>
                <small>{progressLabel}</small>
                <i aria-hidden="true"><b style={{ width: `${percent}%` }} /></i>
              </span>
              <em aria-hidden="true">›</em>
            </Link>
          );
        })}
      </section>

      <section className="games-hub__app-streak" aria-label={`Seria ta: ${streak} ${streak === 1 ? 'zi' : 'zile'}`}>
        <span className="games-hub__app-streak-icon" aria-hidden="true">🔥</span>
        <div>
          <strong>{streak ? `Seria ta: ${streak} ${streak === 1 ? 'zi' : 'zile'}` : 'Începe seria ta'}</strong>
          <span aria-hidden="true">
            {Array.from({ length: 7 }, (_, index) => <i className={index < Math.min(streak, 7) ? 'active' : ''} key={index}>●</i>)}
          </span>
        </div>
      </section>

      <section className="games-hub__games" aria-labelledby="games-hub-games-title">
        <div className="games-hub__section-heading"><h2 id="games-hub-games-title">Mai multe jocuri și exerciții</h2><span>3 jocuri</span></div>
        <div className="games-hub__game-grid">
          {gameCards.map((game) => {
            const percent = Math.min(100, Math.round((game.progress.completed / game.progress.target) * 100));
            return (
              <Link className={`games-hub__game-card games-hub__card games-hub__game-card--${game.id}`} to={game.to} key={game.id}>
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
        <div className="games-hub__section-heading"><h2 id="games-hub-training-title">Antrenament ghidat</h2><span>3 activități</span></div>
        <div className="games-hub__training-list">
          {trainingCards.map((item) => (
            <Link className="games-hub__card" to={item.to} key={item.id}>
              <span className="games-hub__training-icon">{icons[item.id]}</span>
              <div><h3>{item.title}</h3><p>{item.text}</p></div>
              <em className={item.accent ? 'accent' : ''}>{item.id === 'verbs' && <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 19v-5M10 19V9M15 19V5M20 19V2" /></svg>}{item.badge}</em>
              <b aria-hidden="true">›</b>
            </Link>
          ))}
        </div>
      </section>

      <MobileAppNav activeLevel={level} />
    </div>
  );
};

export default GamesHub;
