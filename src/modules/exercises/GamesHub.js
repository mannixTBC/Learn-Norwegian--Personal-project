import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getLearningLevel } from '../lessons/learningLevel';
import { getReviewStats } from '../../services/spacedReview';
import { getStudySummary } from '../../services/learningActivity';
import MobileAppNav from '../layout/MobileAppNav';
import { useAuth } from '../auth/AuthContext';
import { getCareerPath, getCareerProfile } from '../../services/careerProfile';
import { ExerciseIcon, ExerciseLayout } from './ExerciseUI';
import { readPracticeProgress } from './practiceActivities';
import { readGameProgress } from './practiceGameData';
import { getVerbSessions, readVerbProgress } from './challenge30/verbsForLevel';
import './GamesHub.css';

const GamesHub = () => {
  const { user } = useAuth();
  const location = useLocation();
  const level = getLearningLevel(location.search);
  const review = getReviewStats(level);
  const streak = Math.max(0, Number(getStudySummary().streak) || 0);
  const career = getCareerPath(getCareerProfile(user)?.pathId);
  const verbSessions = getVerbSessions(level).length;
  const verbs = readVerbProgress(localStorage, level, verbSessions);
  let attempts = [];
  try { const stored = JSON.parse(localStorage.getItem('pronunciation_attempts_' + level.toLowerCase())); if (Array.isArray(stored)) attempts = stored; } catch (_) { /* No attempts yet. */ }
  const pronunciationBest = Math.min(100, attempts.reduce((best, item) => Math.max(best, Number(item.score) || 0), 0));
  const quickGames = [
    { id: 'quiz', route: '/chestionar', title: 'Chestionar', description: 'Leagă cuvintele norvegiene de sensul lor.', meta: 'Vocabular · 2–5 minute' },
    { id: 'order', route: '/drag', title: 'Construiește propoziția', description: 'Așază cuvintele și descoperă ordinea firească.', meta: 'Propoziții · 3–5 minute' },
    { id: 'word', route: '/hangman', title: 'Descoperă cuvântul', description: 'Folosește indiciile și scrie cuvântul potrivit.', meta: 'Scriere · 2–5 minute' },
  ].map((game) => {
    const progress = readGameProgress(localStorage, game.id, level, user?.id);
    return { ...game, badge: progress.sessions ? 'Record: ' + progress.best + '%' : 'Alege o lecție', percent: progress.sessions ? progress.best : null };
  });
  const activities = [
    { id: 'listen', route: '/asculta-si-alege', title: 'Ascultă și alege', description: 'Ascultă o înregistrare, apoi alege sensul corect.', meta: 'Ascultare · 2–4 minute' },
    { id: 'missions', route: '/misiuni-la-serviciu', title: 'Misiuni la serviciu', description: 'Alege replica potrivită în situații de la muncă.', meta: career.shortTitle + (['C1', 'C2'].includes(level) ? ' · Recapitulare B2' : ' · ' + level) },
  ].map((game) => {
    const progress = readPracticeProgress(localStorage, { game: game.id, level: game.id === 'missions' && ['C1', 'C2'].includes(level) ? 'B2' : level, pathId: career.id, userId: user?.id || 'guest' });
    return { ...game, badge: progress.sessions ? 'Record: ' + progress.best + '%' : 'Încearcă acum', percent: progress.sessions ? progress.best : null };
  });
  const guided = [
    { id: 'verbs', route: '/challenge30', title: 'Verbele de astăzi', description: 'Învață, asociază și completează în zece sesiuni.', meta: 'Verbe și expresii · 5 minute', badge: verbs.completed.length + ' / ' + verbSessions + ' sesiuni', percent: verbs.completed.length / verbSessions * 100 },
    { id: 'pronunciation', route: '/pronuntie', title: 'Pronunție', description: 'Ascultă modelul și exersează cu vocea ta.', meta: 'Ascultare și vorbire', badge: attempts.length ? 'Record: ' + pronunciationBest + '%' : 'Ascultă și repetă', percent: attempts.length ? pronunciationBest : null },
    { id: 'review', route: '/recapitulare', title: 'Recapitulare', description: 'Revino la cuvintele și expresiile de repetat.', meta: 'Memorie · În ritmul tău', badge: review.due ? review.due + ' de repetat' : review.total ? 'La zi' : 'După primele exerciții' },
  ];
  const card = (game) => <Link className={'games-hub__card games-hub__card--' + game.id} to={game.route + '?nivel=' + level} key={game.id}>
    <span className="games-hub__icon"><ExerciseIcon name={game.id} /></span>
    <div className="games-hub__copy"><small>{game.meta}</small><h3>{game.title}</h3><p>{game.description}</p><span className="games-hub__badge">{game.badge}</span>{game.percent != null && <span className="games-hub__progress" aria-label={'Progres: ' + Math.round(game.percent) + '%'}><i style={{ width: Math.max(0, Math.min(100, game.percent)) + '%' }} /></span>}</div>
    <span className="games-hub__arrow" aria-hidden="true">›</span>
  </Link>;

  return <ExerciseLayout className="games-hub" title="Jocuri și exerciții" description="Alege ce vrei să exersezi. Câteva minute în fiecare zi fac diferența." icon="games" level={level} allowLevelChange backTo={'/invata?nivel=' + level} backLabel="Lecțiile mele">
    <Link className="games-hub__daily" to={'/hangman?nivel=' + level}><div><span className="games-hub__eyebrow">Câteva cuvinte pentru azi</span><h2>Un pas mic, în fiecare zi.</h2><p>Reia vocabularul din lecțiile nivelului {level}.</p><strong>Începe să exersezi <span aria-hidden="true">→</span></strong></div></Link>
    {streak > 0 && <p className="games-hub__streak"><span aria-hidden="true">✦</span> Seria ta: <strong>{streak} {streak === 1 ? 'zi' : 'zile'}</strong></p>}
    <section className="games-hub__section" aria-labelledby="games-quick"><h2 id="games-quick">Cuvinte și propoziții</h2><div className="games-hub__grid">{quickGames.map(card)}</div></section>
    <section className="games-hub__section" aria-labelledby="games-situations"><h2 id="games-situations">Ascultă și răspunde</h2><div className="games-hub__grid">{activities.map(card)}</div></section>
    <section className="games-hub__section" aria-labelledby="games-guided"><h2 id="games-guided">Antrenament ghidat</h2><div className="games-hub__grid">{guided.map(card)}</div></section>
    <MobileAppNav activeLevel={level} />
  </ExerciseLayout>;
};

export default GamesHub;
