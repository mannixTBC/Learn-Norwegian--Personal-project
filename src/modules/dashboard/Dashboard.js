import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { courseCatalog } from '../lessons/norwegian-program/lessonContent';
import { learningLevels, levelName } from '../lessons/learningLevel';
import { getReviewItemsForLevel, getReviewStats } from '../../services/spacedReview';
import { getDailyGoal, getStudySummary, setDailyGoal } from '../../services/learningActivity';
import { getCareerLessonModule, getCareerPath, getCareerProfile } from '../../services/careerProfile';
import CareerPathVisual from '../onboarding/CareerPathVisual';
import './Dashboard.css';

const progressKey = (level) => level === 'A1' ? 'lesson_prog_progress' : `lesson_prog_progress_${level.toLowerCase()}`;

const readJson = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key)) || fallback; }
  catch (_) { return fallback; }
};

const readProgress = (level) => {
  const value = readJson(progressKey(level), { completed: [], unlocked: 1 });
  return { completed: Array.isArray(value.completed) ? value.completed : [], unlocked: value.unlocked || 1 };
};

const greeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bună dimineața';
  if (hour < 18) return 'Bună ziua';
  return 'Bună seara';
};

const RecommendationVisual = ({ type, fallback, pathId }) => {
  if (type === 'career') {
    return <CareerPathVisual pathId={pathId} className="dashboard-recommendation__career-icon" />;
  }

  if (type === 'review') {
    return (
      <svg viewBox="0 0 32 32" aria-hidden="true">
        <path d="M8.2 8.5A10 10 0 1 1 6 20.3" />
        <path d="M3.8 8.4h5.1v5.1" />
        <path d="M11.2 13.1h9.6M11.2 17h7.4M11.2 20.9h5.2" />
        <circle cx="23.8" cy="23.4" r="4.2" className="dashboard-recommendation__accent" />
        <path d="m22.1 23.4 1.1 1.1 2.3-2.5" className="dashboard-recommendation__review-check" />
      </svg>
    );
  }

  if (type === 'direction') {
    return (
      <svg viewBox="0 0 32 32" aria-hidden="true">
        <circle cx="8" cy="23.5" r="2.5" />
        <path d="M10.5 23.5c7 0 4.2-9.2 10.5-9.2" />
        <path d="M20.8 6.2 27 8.6l-2.4 6.2-1.3-3.2-3.2-1.3 3.2-1.1Z" className="dashboard-recommendation__accent" />
      </svg>
    );
  }

  if (type === 'lesson') {
    return (
      <svg viewBox="0 0 32 32" aria-hidden="true">
        <path d="M5.5 7.5c4.2-.7 7.6.2 10.5 2.5v15c-2.9-2.3-6.3-3.1-10.5-2.4Z" />
        <path d="M26.5 7.5c-4.2-.7-7.6.2-10.5 2.5v15c2.9-2.3 6.3-3.1 10.5-2.4Z" />
        <circle cx="24" cy="22.5" r="5" className="dashboard-recommendation__accent" />
        <path d="m22.8 20.1 3.4 2.4-3.4 2.4Z" className="dashboard-recommendation__play" />
      </svg>
    );
  }

  return fallback;
};

const Dashboard = () => {
  const { user } = useAuth();
  const activeLevel = learningLevels.includes(localStorage.getItem('norwegian_active_level')) ? localStorage.getItem('norwegian_active_level') : 'A1';
  const course = courseCatalog[activeLevel];
  const activeProgress = readProgress(activeLevel);
  const nextLesson = course.lessons.find((lesson) => !activeProgress.completed.includes(lesson.id)) || course.lessons[course.lessons.length - 1];
  const reviews = getReviewStats(activeLevel);
  const difficultItems = getReviewItemsForLevel(activeLevel).sort((left, right) => (right.lapses || 0) - (left.lapses || 0));
  const pronunciationAttempts = readJson(`pronunciation_attempts_${activeLevel.toLowerCase()}`, []);
  const pronunciationBest = pronunciationAttempts.reduce((best, attempt) => Math.max(best, attempt.score || 0), 0);
  const challengeProgress = readJson(`challenge_verbs_progress_${activeLevel.toLowerCase()}`, { day: 1 });
  const [dailyGoal, updateDailyGoal] = useState(getDailyGoal);
  const activity = useMemo(() => getStudySummary(), []);

  const levels = learningLevels.map((level) => {
    const lessons = courseCatalog[level].lessons;
    const progress = readProgress(level);
    const completed = progress.completed.filter((id) => id <= lessons.length).length;
    const words = lessons.filter((lesson) => progress.completed.includes(lesson.id)).reduce((total, lesson) => total + lesson.vocabulary.length, 0);
    return { level, completed, total: lessons.length, words, percent: Math.round((completed / lessons.length) * 100) };
  });
  const totalWords = levels.reduce((total, level) => total + level.words, 0);
  const totalLessons = levels.reduce((total, level) => total + level.completed, 0);
  const activeLevelProgress = Math.round((activeProgress.completed.length / course.lessons.length) * 100);
  const goalPercent = Math.min(100, Math.round((activity.todayMinutes / dailyGoal) * 100));
  const maxWeekMinutes = Math.max(20, ...activity.last7Days.map((day) => day.minutes));
  const finalBest = Number(localStorage.getItem(`final_test_best_${activeLevel.toLowerCase()}`)) || 0;
  const finalPassed = localStorage.getItem(`final_test_passed_${activeLevel.toLowerCase()}`) === 'true';
  const careerProfile = getCareerProfile(user);
  const careerPath = careerProfile ? getCareerPath(careerProfile.pathId) : null;
  const careerModule = careerPath ? getCareerLessonModule(careerPath.id, activeLevel, nextLesson.id) : null;

  const selectGoal = (goal) => {
    updateDailyGoal(setDailyGoal(goal));
  };

  const recommendations = [
    careerPath
      ? { icon: careerPath.icon, visual: 'career', pathId: careerPath.id, title: `Scenariu: ${careerModule.scenario.title}`, text: `${careerModule.scenario.romanian} Este integrat în următoarea lecție.`, to: `/curs/${activeLevel.toLowerCase()}/${nextLesson.id}`, action: `Exersează pentru ${careerPath.shortTitle}` }
      : { icon: '+', visual: 'direction', title: 'Personalizează cursul', text: 'Alege domeniul în care vrei să folosești norvegiana și primești vocabular, audio și scenarii potrivite.', to: '/alege-directia?redirect=/dashboard', action: 'Alege direcția' },
    reviews.due > 0
      ? { icon: 'R', visual: 'review', title: `Repetă ${reviews.due} ${reviews.due === 1 ? 'element' : 'elemente'} astăzi`, text: difficultItems.length ? `Începe cu „${difficultItems[0].prompt}”, unde ai avut cele mai multe ezitări.` : 'Recapitularea este pregătită pentru sesiunea de astăzi.', to: `/recapitulare?nivel=${activeLevel}`, action: 'Începe recapitularea' }
      : { icon: 'L', visual: 'lesson', title: `Continuă lecția ${nextLesson.id}`, text: `„${nextLesson.title}” este următorul pas potrivit pentru nivelul ${activeLevel}.`, to: `/curs/${activeLevel.toLowerCase()}/${nextLesson.id}`, action: 'Deschide lecția' },
    pronunciationBest < 75
      ? { icon: 'P', title: '5 minute de pronunție', text: pronunciationAttempts.length ? `Cel mai bun scor este ${pronunciationBest}%. Repetă o frază la viteză lentă.` : 'Ascultă o frază, înregistreaz-o și verifică ce cuvinte sunt clare.', to: `/pronuntie?nivel=${activeLevel}`, action: 'Deschide laboratorul' }
      : { icon: 'P', title: 'Pronunția este pe drumul bun', text: `Ai atins ${pronunciationBest}%. Încearcă acum o frază din lecția următoare.`, to: `/pronuntie?nivel=${activeLevel}`, action: 'Continuă antrenamentul' },
    activeLevelProgress === 100 && !finalPassed
      ? { icon: 'T', title: `Verifică nivelul ${activeLevel}`, text: finalBest ? `Cel mai bun scor este ${finalBest}%. Pragul de promovare este 70%.` : 'Ai terminat lecțiile. Testul final rămâne opțional și oferă feedback complet.', to: `/test-final/${activeLevel.toLowerCase()}`, action: 'Deschide testul' }
      : { icon: 'V', title: `Sesiunea ${Math.min(challengeProgress.day || 1, 10)} de verbe`, text: 'Fixează trei verbe prin asociere, propoziții și completare.', to: `/challenge30?nivel=${activeLevel}`, action: 'Exersează verbele' },
  ];

  return (
    <div className="daily-dashboard">
      <header className="daily-dashboard__hero">
        <div className="daily-dashboard__welcome">
          <span>{new Date().toLocaleDateString('ro-RO', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
          <h1>{user && user.isGuest ? greeting() : `${greeting()}, ${user ? user.name.split(' ')[0] : 'prietene'}`}</h1>
          <p>Ai un plan simplu pentru astăzi. Fiecare minut se adună în progresul tău.</p>
          <div><span>Nivel activ</span><strong>{activeLevel} · {levelName[activeLevel]}</strong><Link to={`/invata?nivel=${activeLevel}`}>Vezi cursul →</Link></div>
        </div>
        <div className="daily-goal">
          <div className="daily-goal__ring" style={{ '--goal-progress': `${goalPercent * 3.6}deg` }}><div><strong>{activity.todayMinutes}</strong><span>din {dailyGoal} min</span></div></div>
          <div><span>Obiectivul de astăzi</span><strong>{goalPercent >= 100 ? 'Obiectiv atins!' : `${dailyGoal - activity.todayMinutes > 0 ? dailyGoal - activity.todayMinutes : 0} minute rămase`}</strong><small>{activity.todaySessions ? `${activity.todaySessions} activități astăzi` : 'Începe cu o activitate scurtă'}</small></div>
        </div>
      </header>

      <section className="dashboard-mobile-start" aria-label="Continuă învățarea">
        <div className="dashboard-mobile-start__top">
          <div>
            <span>Progresul tău · {activeLevel}</span>
            <strong>{activeLevelProgress}%</strong>
          </div>
          <small>{activeProgress.completed.length} din {course.lessons.length} lecții</small>
        </div>
        <div className="dashboard-mobile-start__track" aria-hidden="true">
          <span style={{ width: `${activeLevelProgress}%` }} />
        </div>
        <div className="dashboard-mobile-start__lesson">
          <div>
            <small>Următorul pas</small>
            <h2>Lecția {nextLesson.id}: {nextLesson.title}</h2>
            <p>{nextLesson.duration} min · {nextLesson.vocabulary.length + (careerModule ? careerModule.phrases.length : 0)} expresii</p>
          </div>
          <Link to={`/curs/${activeLevel.toLowerCase()}/${nextLesson.id}`}>
            {activeProgress.completed.length ? 'Continuă lecția' : 'Începe lecția'} <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>

      {careerPath && (
        <section className="dashboard-career" aria-label="Direcția personalizată a cursului">
          <span className="dashboard-career__icon" aria-hidden="true">{careerPath.icon}</span>
          <div><small>Direcția cursului tău</small><h2>{careerPath.title}</h2><p>{careerPath.outcome}</p>{careerModule && <div>{careerModule.phrases.map((phrase) => <span key={phrase[0]}>{phrase[0]}</span>)}</div>}</div>
          <Link to="/alege-directia?redirect=/dashboard">Schimbă direcția →</Link>
        </section>
      )}

      <section className="dashboard-section dashboard-today" aria-labelledby="today-plan-title">
        <div className="dashboard-section__heading"><div><span>Plan personalizat</span><h2 id="today-plan-title">Ce faci astăzi</h2></div><small>Recomandări pentru nivelul {activeLevel}</small></div>
        <div className="dashboard-today__grid">
          <article className="today-task today-task--primary"><div className="today-task__top"><span>01</span><small>Activitatea principală</small></div><h3>Continuă lecția {nextLesson.id}</h3><p>{nextLesson.title}</p><div className="today-task__meta"><span>◷ {nextLesson.duration} min</span><span>○ {nextLesson.vocabulary.length + (careerModule ? careerModule.phrases.length : 0)} expresii</span></div><Link to={`/curs/${activeLevel.toLowerCase()}/${nextLesson.id}`}>{activeProgress.completed.length ? 'Continuă lecția' : 'Începe lecția'} →</Link></article>
          <article className="today-task"><div className="today-task__top"><span>02</span><small>Memorie</small></div><h3>{reviews.due ? `Repetă ${reviews.due} elemente` : 'Recapitularea este la zi'}</h3><p>{reviews.due ? 'Greșelile recente sunt pregătite pentru repetare spațiată.' : reviews.total ? 'Următoarele elemente vor apărea când este momentul potrivit.' : 'Greșelile din lecții vor fi salvate automat aici.'}</p><Link to={`/recapitulare?nivel=${activeLevel}`}>{reviews.due ? 'Începe recapitularea' : 'Recapitulează'} →</Link></article>
          <article className="today-task"><div className="today-task__top"><span>03</span><small>Exercițiu opțional</small></div><h3>Pronunție · 5 minute</h3><p>Ascultă o frază, înregistrează-te și compară rezultatul fără să afecteze progresul.</p><Link to={`/pronuntie?nivel=${activeLevel}`}>Deschide laboratorul →</Link></article>
        </div>
      </section>

      <section className="dashboard-stats" aria-label="Statisticile tale">
        <article><span className="dashboard-stat__icon">↗</span><div><small>Serie curentă</small><strong>{activity.streak} {activity.streak === 1 ? 'zi' : 'zile'}</strong><p>{activity.streak ? 'Continuă și astăzi' : 'Începe seria astăzi'}</p></div></article>
        <article><span className="dashboard-stat__icon">Aa</span><div><small>Cuvinte învățate</small><strong>{totalWords}</strong><p>din {totalLessons} lecții</p></div></article>
        <article><span className="dashboard-stat__icon">%</span><div><small>Scor mediu</small><strong>{activity.averageScore ? `${activity.averageScore}%` : '—'}</strong><p>{activity.averageScore ? 'lecții și evaluări' : 'apare după primul rezultat'}</p></div></article>
        <article><span className="dashboard-stat__icon">◷</span><div><small>Timp total</small><strong>{activity.totalMinutes} min</strong><p>{activity.activeDays} {activity.activeDays === 1 ? 'zi activă' : 'zile active'}</p></div></article>
      </section>

      <div className="dashboard-main-grid">
        <section className="dashboard-panel dashboard-week" aria-labelledby="weekly-title">
          <div className="dashboard-panel__heading"><div><span>Ultimele 7 zile</span><h2 id="weekly-title">Rezumat săptămânal</h2></div><strong>{activity.weekMinutes} min</strong></div>
          <div className="dashboard-week__chart" aria-label={`${activity.weekMinutes} minute studiate în ultimele șapte zile`}>
            {activity.last7Days.map((day) => <div key={day.key}><div><span style={{ height: `${day.minutes ? Math.max(12, (day.minutes / maxWeekMinutes) * 100) : 4}%` }} className={day.minutes ? 'active' : ''}><i>{day.minutes || ''}</i></span></div><small>{day.label}</small><b>{day.dayNumber}</b></div>)}
          </div>
          <div className="dashboard-goal-picker"><div><strong>Obiectiv zilnic</strong><span>Alege un ritm realist pentru programul tău.</span></div><div>{[5, 10, 15, 20].map((goal) => <button type="button" className={dailyGoal === goal ? 'active' : ''} onClick={() => selectGoal(goal)} key={goal}>{goal} min</button>)}</div></div>
        </section>

        <section className="dashboard-panel dashboard-calendar" aria-labelledby="calendar-title">
          <div className="dashboard-panel__heading"><div><span>Consecvență</span><h2 id="calendar-title">Calendarul activității</h2></div><strong>{activity.activeDays} zile</strong></div>
          <div className="dashboard-calendar__weekdays">{['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, index) => <span key={`${day}-${index}`}>{day}</span>)}</div>
          <div className="dashboard-calendar__days">{activity.last28Days.map((day) => <span className={`${day.minutes ? 'active' : ''} ${day.minutes >= dailyGoal ? 'goal' : ''} ${day.isToday ? 'today' : ''}`} title={`${day.date.toLocaleDateString('ro-RO')}: ${day.minutes} minute`} key={day.key}>{day.date.getDate()}</span>)}</div>
          <div className="dashboard-calendar__legend"><span><i />fără activitate</span><span><i className="active" />studiu</span><span><i className="goal" />obiectiv atins</span></div>
        </section>
      </div>

      <section className="dashboard-section dashboard-recommendations" aria-labelledby="recommendations-title">
        <div className="dashboard-section__heading"><div><span>Următorii pași</span><h2 id="recommendations-title">Recomandări pentru tine</h2></div><small>Bazate pe nivel, direcție și greșelile recente</small></div>
        <div className="dashboard-recommendations__grid">{recommendations.map((item) => <article className={item.visual ? `dashboard-recommendation dashboard-recommendation--${item.visual}` : 'dashboard-recommendation'} key={item.title}><span className={item.visual ? `dashboard-recommendation__visual dashboard-recommendation__visual--${item.visual}` : 'dashboard-recommendation__visual'} aria-hidden="true"><RecommendationVisual type={item.visual} fallback={item.icon} pathId={item.pathId} /></span><div><h3>{item.title}</h3><p>{item.text}</p><Link to={item.to}>{item.action} →</Link></div></article>)}</div>
      </section>

      <section className="dashboard-section dashboard-levels" aria-labelledby="levels-progress-title">
        <div className="dashboard-section__heading"><div><span>Imagine completă</span><h2 id="levels-progress-title">Progres pe niveluri</h2></div><Link to={`/invata?nivel=${activeLevel}`}>Vezi toate lecțiile →</Link></div>
        <div className="dashboard-levels__grid">{levels.map((item) => <article className={item.level === activeLevel ? 'active' : ''} key={item.level}><div><span>{item.level}</span><small>{levelName[item.level]}{item.level === activeLevel ? ' · nivel activ' : ''}</small><strong>{item.percent}%</strong></div><div className="dashboard-levels__track"><span style={{ width: `${item.percent}%` }} /></div><p>{item.completed} din {item.total} lecții · {item.words} cuvinte</p></article>)}</div>
      </section>
    </div>
  );
};

export default Dashboard;
