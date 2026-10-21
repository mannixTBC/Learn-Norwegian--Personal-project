import React from 'react';
import { useLocation } from 'react-router-dom';
import { getLearningLevel } from '../lessons/learningLevel';
import { getReviewStats } from '../../services/spacedReview';
import { getStudySummary } from '../../services/learningActivity';
import { useAuth } from '../auth/AuthContext';
import { getCareerPath, getCareerProfile } from '../../services/careerProfile';
import { readPracticeProgress } from './practiceActivities';
import GamesMosaic from './GamesMosaic';
import { readGameProgress } from './practiceGameData';
import { getVerbSessions, readVerbProgress } from './challenge30/verbsForLevel';

const readJson = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key)) || fallback; }
  catch (_) { return fallback; }
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

  const appGameCards = [
    { id: 'quiz', to: `/chestionar?nivel=${level}`, title: 'Vocabular', progress: gameCards[0].progress },
    { id: 'order', to: `/drag?nivel=${level}`, title: 'Propoziții', progress: gameCards[1].progress },
    { id: 'verbs', to: `/challenge30?nivel=${level}`, title: 'Verbe', progress: { completed: verbSession, target: verbSessionCount } },
    { id: 'pronunciation', to: `/pronuntie?nivel=${level}`, title: 'Pronunție', progress: { completed: pronunciationBest, target: 100 } },
    { id: 'word', to: `/hangman?nivel=${level}`, title: 'Cuvinte', progress: gameCards[2].progress },
    { id: 'review', to: `/recapitulare?nivel=${level}`, title: 'Recapitulare', progress: { completed: reviewStats.total - reviewStats.due, target: Math.max(1, reviewStats.total) }, badge: reviewStats.due ? `${reviewStats.due} de repetat` : reviewStats.total ? 'La zi' : 'Nou' },
  ];
  const streak = Math.max(0, Number(studySummary.streak) || 0);
  const careerPath = getCareerPath(getCareerProfile(user)?.pathId);
  const newGames = [
    { id: 'listen', to: '/asculta-si-alege', title: 'Ascultă și alege', text: 'Auzi norvegiana. Descoperă sensul.', meta: `${level} · 10 întrebări` },
    { id: 'missions', to: '/misiuni-la-serviciu', title: 'Misiuni la serviciu', text: 'Situații reale. Replica potrivită.', meta: `${['C1', 'C2'].includes(level) ? 'Recapitulare B2' : level} · ${careerPath.shortTitle}` },
  ].map((game) => ({ ...game, progress: readPracticeProgress(localStorage, { game: game.id, level: game.id === 'missions' && ['C1', 'C2'].includes(level) ? 'B2' : level, pathId: careerPath.id, userId: user?.id || 'guest' }) }));

  return <GamesMosaic level={level} balance={rewardBalance} streak={streak} cards={appGameCards} activities={newGames} reviewStats={reviewStats} />;
};

export default GamesHub;
