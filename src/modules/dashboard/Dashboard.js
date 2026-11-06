import {ui} from '../../languages/messages.js';
import {courseLocalStorage as localStorage} from '../../languages/storage.js';
import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { courseCatalog } from '../../content/activeContent.js';
import { learningLevels, levelName } from '../lessons/learningLevel';
import { getReviewItemsForLevel, getReviewStats } from '../../services/spacedReview';
import { getDailyGoal, getStudySummary, setDailyGoal } from '../../services/learningActivity';
import { getCareerLessonModule, getCareerPath, getCareerProfile } from '../../services/careerProfile';
import CareerPathVisual from '../onboarding/CareerPathVisual';
import MobileAppNav from '../layout/MobileAppNav';
import { getLessonImage } from '../lessons/lessonVisuals';
import { finalTestKey, readCourseProgress } from '../../services/curriculumProgress';
import PracticeStudioCard from '../exercises/PracticeStudioCard';
import './Dashboard.css';


const readJson = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key)) || fallback; }
  catch (_) { return fallback; }
};

const readProgress = (level, user) => readCourseProgress(level, user, courseCatalog[level].lessons);

const greeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bună dimineața';
  if (hour < 18) return 'Bună ziua';
  return 'Bună seara';
};

const DashboardAppIcon = ({ type }) => {
  const paths = {
    progress: <><path d="M5 19V11M12 19V5M19 19v-9" /></>,
    book: <><path d="M4.5 5.5c3.2-.7 5.7 0 7.5 1.7v12c-1.8-1.7-4.3-2.4-7.5-1.7Z" /><path d="M19.5 5.5c-3.2-.7-5.7 0-7.5 1.7v12c1.8-1.7 4.3-2.4 7.5-1.7Z" /></>,
    review: <><path d="M19.5 8.5A8 8 0 0 0 6 7l-2 2" /><path d="M4 5v4h4M4.5 15.5A8 8 0 0 0 18 17l2-2" /><path d="M20 19v-4h-4" /></>,
    game: <><path d="M8 9h8a5 5 0 0 1 4.8 3.6l1 3.6a2.8 2.8 0 0 1-4.7 2.7L15.2 17H8.8l-1.9 1.9a2.8 2.8 0 0 1-4.7-2.7l1-3.6A5 5 0 0 1 8 9Z" /><path d="M7 12v4M5 14h4M16.5 13h.1M18.5 15h.1" /></>,
    clock: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></>,
    chat: <><path d="M5 6.5h14v9H10l-4.5 3v-3H5Z" /><path d="M9 11h.1M12 11h.1M15 11h.1" /></>,
  };
  return <svg viewBox="0 0 24 24" aria-hidden="true">{paths[type]}</svg>;
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

  if (type === 'pronunciation') {
    return (
      <svg viewBox="0 0 32 32" aria-hidden="true">
        <rect x="11" y="5.5" width="10" height="15" rx="5" />
        <path d="M7.8 15.7a8.2 8.2 0 0 0 16.4 0M16 24v3.2M12.2 27.2h7.6" />
        <path d="M25.8 9.5c1.7 1.5 1.7 4.2 0 5.8" />
        <circle cx="27.3" cy="7" r="2.1" className="dashboard-recommendation__accent" />
      </svg>
    );
  }

  if (type === 'verbs') {
    return (
      <svg viewBox="0 0 32 32" aria-hidden="true">
        <rect x="4.5" y="6" width="9" height="7" rx="2" />
        <rect x="18.5" y="19" width="9" height="7" rx="2" />
        <path d="M13.5 9.5h4.3c4 0 5.2 2.2 5.2 5.7v1.5M20.4 14.3l2.6 2.6 2.6-2.6" />
        <path d="M8 9.5h2M21.7 22.5h2.6" className="dashboard-recommendation__verb-lines" />
        <circle cx="8" cy="22.5" r="3.2" className="dashboard-recommendation__accent" />
        <path d="m6.8 22.5.9.9 1.7-1.8" className="dashboard-recommendation__verb-check" />
      </svg>
    );
  }

  return fallback;
};

const Dashboard = () => {
  const { user } = useAuth();
  const activeLevel = learningLevels.includes(localStorage.getItem('norwegian_active_level')) ? localStorage.getItem('norwegian_active_level') : ui('ui_16a36e86f6fed5d4');
  const course = courseCatalog[activeLevel];
  const activeProgress = readProgress(activeLevel, user);
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
    const progress = readProgress(level, user);
    const completed = progress.completed.filter((id) => id <= lessons.length).length;
    const words = lessons.filter((lesson) => progress.completed.includes(lesson.id)).reduce((total, lesson) => total + lesson.introducedVocabulary.length, 0);
    return { level, completed, total: lessons.length, words, percent: Math.round((completed / lessons.length) * 100) };
  });
  const totalWords = levels.reduce((total, level) => total + level.words, 0);
  const totalLessons = levels.reduce((total, level) => total + level.completed, 0);
  const activeLevelProgress = Math.round((activeProgress.completed.length / course.lessons.length) * 100);
  const goalPercent = Math.min(100, Math.round((activity.todayMinutes / dailyGoal) * 100));
  const maxWeekMinutes = Math.max(20, ...activity.last7Days.map((day) => day.minutes));
  const finalBest = Number(localStorage.getItem(finalTestKey(activeLevel, 'best', user))) || 0;
  const finalPassed = localStorage.getItem(finalTestKey(activeLevel, 'passed', user)) === 'true';
  const careerProfile = getCareerProfile(user);
  const careerPath = careerProfile ? getCareerPath(careerProfile.pathId) : null;
  const careerModule = careerPath ? getCareerLessonModule(careerPath.id, activeLevel, nextLesson.id, nextLesson) : null;

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
      ? { icon: 'P', visual: 'pronunciation', title: '5 minute de pronunție', text: pronunciationAttempts.length ? `Cel mai bun scor este ${pronunciationBest}%. Repetă o frază la viteză lentă.` : 'Ascultă o frază, înregistreaz-o și verifică ce cuvinte sunt clare.', to: `/pronuntie?nivel=${activeLevel}`, action: 'Deschide laboratorul' }
      : { icon: 'P', visual: 'pronunciation', title: 'Pronunția este pe drumul bun', text: `Ai atins ${pronunciationBest}%. Încearcă acum o frază din lecția următoare.`, to: `/pronuntie?nivel=${activeLevel}`, action: 'Continuă antrenamentul' },
    activeLevelProgress === 100 && !finalPassed
      ? { icon: 'T', title: `Verifică nivelul ${activeLevel}`, text: finalBest ? `Cel mai bun scor este ${finalBest}%. Pragul de promovare este 70%.` : 'Ai terminat lecțiile. Testul final rămâne opțional și oferă feedback complet.', to: `/test-final/${activeLevel.toLowerCase()}`, action: 'Deschide testul' }
      : { icon: 'V', visual: 'verbs', title: `Sesiunea ${Math.min(challengeProgress.day || 1, 10)} de verbe`, text: 'Fixează trei verbe prin asociere, propoziții și completare.', to: `/challenge30?nivel=${activeLevel}`, action: 'Exersează verbele' },
  ];

  return (
    <div className="daily-dashboard">
      <header className="daily-dashboard__hero">
        <div className="daily-dashboard__welcome">
          <span>{new Date().toLocaleDateString('ro-RO', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
          <h1>{user && user.isGuest ? greeting() : `${greeting()}, ${user ? user.name.split(' ')[0] : 'prietene'}`}</h1>
          <p>{ui('web_9fd13a2cd84960c1')}</p>
          <div><span>{ui('web_a83add46adfe2454')}</span><strong>{activeLevel} · {levelName[activeLevel]}</strong><Link to={`/invata?nivel=${activeLevel}`}>{ui('web_153da0ffd4ba6de5')}</Link></div>
          <section className="dashboard-desktop-progress" aria-label={`Progres nivel ${activeLevel}`}>
            <div><span>{activeProgress.completed.length}{ui('ui_dbd8b6478643d623')}{course.lessons.length}{ui('web_f1755afa0a66fbaa')}</span><strong>{activeLevelProgress}%</strong></div>
            <div className="dashboard-desktop-progress__track" role="progressbar" aria-label={`Progres la nivelul ${activeLevel}`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={activeLevelProgress}><span style={{ width: `${activeLevelProgress}%` }} /></div>
            <p className="dashboard-desktop-progress__streak">{activity.streak ? <>{ui('web_1361ac83c61d4718')}<strong>{activity.streak} {activity.streak === 1 ? 'zi' : 'zile'}</strong>{ui('web_ed6c41a039ab6a68')}</> : 'Începe astăzi seria ta de zile de studiu.'}</p>
          </section>
        </div>
        <div className="dashboard-desktop-start">
          <div>
            <span>{ui('web_79c528a04549be63')}{nextLesson.duration}{ui('ui_2e75737a6b582974')}</span>
            <strong>{ui('ui_abf153365567efe1')}{nextLesson.id}: {nextLesson.title}</strong>
          </div>
          <Link to={`/curs/${activeLevel.toLowerCase()}/${nextLesson.id}`}>
            {activeProgress.completed.length ? ui('ui_6bbb599cd39f1d5d') : ui('ui_54609dd4c72877da')} <span aria-hidden="true">→</span>
          </Link>
        </div>
        <div className="daily-goal">
          <div className="daily-goal__ring" style={{ '--goal-progress': `${goalPercent * 3.6}deg` }}><div><strong>{activity.todayMinutes}</strong><span>{ui('web_7cd4e21293d592db')}{dailyGoal}{ui('ui_2e75737a6b582974')}</span></div></div>
          <div><span>{ui('web_161d6ab17d374146')}</span><strong>{goalPercent >= 100 ? 'Obiectiv atins!' : `${dailyGoal - activity.todayMinutes > 0 ? dailyGoal - activity.todayMinutes : 0} minute rămase`}</strong><small>{activity.todaySessions ? `${activity.todaySessions} activități astăzi` : 'Începe cu o activitate scurtă'}</small></div>
        </div>
      </header>

      <section className="dashboard-mobile-start" aria-label={ui('web_086934f28eadeec2')}>
        <div className="dashboard-mobile-start__welcome">
          <span>{greeting()}</span>
          <h1>{user && !user.isGuest ? user.name.split(' ')[0] : ui('ui_cdda62f450e2ca93')}</h1>
        </div>
        <div className="dashboard-mobile-start__top">
          <div>
            <span>{ui('web_d8b37400e6052b2d')}{activeLevel}</span>
            <strong>{activeLevelProgress}%</strong>
          </div>
          <small>{activeProgress.completed.length}{ui('ui_dbd8b6478643d623')}{course.lessons.length}{ui('ui_fa56bbc8c2c6fc10')}</small>
        </div>
        <div className="dashboard-mobile-start__track" aria-hidden="true">
          <span style={{ width: `${activeLevelProgress}%` }} />
        </div>
        <div className="dashboard-mobile-start__lesson">
          <div>
            <small>{ui('web_d2a9ecabc33165da')}</small>
            <h2>{ui('ui_abf153365567efe1')}{nextLesson.id}: {nextLesson.title}</h2>
            <p>{nextLesson.duration}{ui('ui_46e2a1c0fa99b3a3')}{nextLesson.vocabulary.length}{ui('ui_a6619ff79822addd')}</p>
          </div>
          <Link to={`/curs/${activeLevel.toLowerCase()}/${nextLesson.id}`}>
            {activeProgress.completed.length ? ui('ui_6bbb599cd39f1d5d') : ui('ui_54609dd4c72877da')} <span aria-hidden="true">→</span>
          </Link>
        </div>
        <div className="dashboard-mobile-start__secondary" aria-label={ui('web_d8e382a281aebbe7')}>
          <Link to={`/invata?nivel=${activeLevel}`}><span aria-hidden="true">{ui('web_81acaafba961bb83')}</span>{ui('web_c7f49bea475cef84')}</Link>
          <Link to={`/recapitulare?nivel=${activeLevel}`}><span aria-hidden="true">↻</span>{ui('ui_fe74dd05d0e5825f')}</Link>
        </div>
      </section>

      <section className="dashboard-app-home" aria-label={ui('web_39668ceac3860055')}>
        <header className="dashboard-app-home__hero">
          <Link className="dashboard-app-home__brand" to="/dashboard" aria-label={ui('web_5eea99318c403ce0')}>
            <img src="/branding/nordlingo-selected-color.png" alt={ui('ui_ee728f3245aed708')} />
          </Link>
          <div>
            <span>{greeting()}</span>
            <h1>{user && !user.isGuest ? user.name.split(' ')[0] : ui('ui_cdda62f450e2ca93')}</h1>
          </div>
        </header>

        <section className="dashboard-app-home__progress" aria-label={`Progres nivel ${activeLevel}`}>
          <div className="dashboard-app-home__ring" style={{ '--app-progress': `${activeLevelProgress * 3.6}deg` }} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={activeLevelProgress}>
            <strong>{activeLevelProgress}%</strong>
          </div>
          <div className="dashboard-app-home__progress-copy">
            <strong>{ui('web_d8b37400e6052b2d')}{activeLevel}</strong>
            <span>{activeProgress.completed.length}{ui('ui_dbd8b6478643d623')}{course.lessons.length}{ui('ui_fa56bbc8c2c6fc10')}</span>
            <div aria-hidden="true"><i style={{ width: `${activeLevelProgress}%` }} /></div>
          </div>
          <span className="dashboard-app-home__progress-icon"><DashboardAppIcon type="progress" /></span>
        </section>

        <article className="dashboard-app-home__lesson" style={{ '--dashboard-lesson-image': `url("${getLessonImage(activeLevel, nextLesson.id)}")` }}>
          <div className="dashboard-app-home__lesson-copy">
            <span>{ui('web_d2a9ecabc33165da')}</span>
            <h2>{ui('ui_abf153365567efe1')}{nextLesson.id}: {nextLesson.title}</h2>
            <p><span><DashboardAppIcon type="clock" />{nextLesson.duration}{ui('ui_2e75737a6b582974')}</span><span><DashboardAppIcon type="chat" />{nextLesson.vocabulary.length}{ui('ui_a6619ff79822addd')}</span></p>
          </div>
          <Link to={`/curs/${activeLevel.toLowerCase()}/${nextLesson.id}`}>
            {activeProgress.completed.length ? ui('ui_6bbb599cd39f1d5d') : ui('ui_54609dd4c72877da')} <span aria-hidden="true">→</span>
          </Link>
        </article>

        <div className="dashboard-app-home__conversation"><PracticeStudioCard level={activeLevel}/></div>
      </section>

      <Link className="dashboard-mobile-games" to={`/jocuri?nivel=${activeLevel}`}>
        <span className="dashboard-mobile-games__icon" aria-hidden="true">{ui('web_81acaafba961bb83')}</span>
        <div>
          <small>{ui('web_0318c92e2aaa4fed')}</small>
          <h2>{ui('web_4ff8c30397e8a3a2')}</h2>
          <p>{ui('web_9dc8d7884dfb14de')}</p>
        </div>
        <strong aria-hidden="true">→</strong>
      </Link>

      {careerPath && (
        <section className="dashboard-career" aria-label={ui('web_28c5e0aa62f82fd0')}>
          <span className="dashboard-career__icon" aria-hidden="true">{careerPath.icon}</span>
          <div><small>{ui('web_db83519e5632add9')}</small><h2>{careerPath.title}</h2><p>{careerPath.outcome}</p>{careerModule && <div>{careerModule.phrases.map((phrase) => <span key={phrase[0]}>{phrase[0]}</span>)}</div>}</div>
          <Link to="/alege-directia?redirect=/dashboard">{ui('web_1717f542639a2541')}</Link>
        </section>
      )}

      <section className="dashboard-section dashboard-today" aria-labelledby="today-plan-title">
        <div className="dashboard-section__heading"><div><span>{ui('web_e9703bbf047005f5')}{activeLevel}</span><h2 id="today-plan-title">{ui('web_e637439c66f4cd67')}</h2></div><Link to={`/invata?nivel=${activeLevel}`}>{ui('web_51345f07896323fe')}</Link></div>
        <div className="dashboard-today__grid">
          <article className="today-task today-task--primary"><div className="today-task__top"><span>01</span><small>{ui('web_543eb0e533683fc7')}</small></div><h3>{ui('web_2f98469645083847')}{nextLesson.id}</h3><p>{nextLesson.title}</p><div className="today-task__meta"><span>◷ {nextLesson.duration}{ui('ui_2e75737a6b582974')}</span><span>○ {nextLesson.vocabulary.length}{ui('ui_a6619ff79822addd')}</span></div><Link to={`/curs/${activeLevel.toLowerCase()}/${nextLesson.id}`}>{activeProgress.completed.length ? ui('ui_6bbb599cd39f1d5d') : ui('ui_54609dd4c72877da')} →</Link></article>
          <article className="today-task"><div className="today-task__top"><span>02</span><small>{ui('web_64e1fdd0bdf033e3')}</small></div><h3>{reviews.due ? `Repetă ${reviews.due} elemente` : 'Recapitularea este la zi'}</h3><p>{reviews.due ? 'Greșelile recente sunt pregătite pentru repetare spațiată.' : reviews.total ? 'Următoarele elemente vor apărea când este momentul potrivit.' : 'Greșelile din lecții vor fi salvate automat aici.'}</p><Link to={`/recapitulare?nivel=${activeLevel}`}>{reviews.due ? 'Începe recapitularea' : 'Recapitulează'} →</Link></article>
          <article className="today-task"><div className="today-task__top"><span>03</span><small>{ui('web_b8f58ca36b4f99d1')}</small></div><h3>{ui('web_3643f20f88660057')}</h3><p>{ui('web_452cb1025b14f471')}</p><Link to={`/pronuntie?nivel=${activeLevel}`}>{ui('web_c3dc2f5c739dac2c')}</Link></article>
        </div>
      </section>

      <section className="dashboard-stats" aria-label={ui('web_1a71d5462a6ee936')}>
        <article><span className="dashboard-stat__icon">↗</span><div><small>{ui('web_7719efed0bb1413e')}</small><strong>{activity.streak} {activity.streak === 1 ? 'zi' : 'zile'}</strong><p>{activity.streak ? 'Continuă și astăzi' : 'Începe seria astăzi'}</p></div></article>
        <article><span className="dashboard-stat__icon">{ui('web_81acaafba961bb83')}</span><div><small>{ui('web_7c212ba7f036fcd9')}</small><strong>{totalWords}</strong><p>{ui('web_7cd4e21293d592db')}{totalLessons}{ui('ui_fa56bbc8c2c6fc10')}</p></div></article>
        <article><span className="dashboard-stat__icon">%</span><div><small>{ui('web_9f571a76d38400e6')}</small><strong>{activity.averageScore ? `${activity.averageScore}%` : '—'}</strong><p>{activity.averageScore ? 'lecții și evaluări' : 'apare după primul rezultat'}</p></div></article>
        <article><span className="dashboard-stat__icon">◷</span><div><small>{ui('web_c3813bcdc930bf7a')}</small><strong>{activity.totalMinutes}{ui('ui_2e75737a6b582974')}</strong><p>{activity.activeDays} {activity.activeDays === 1 ? 'zi activă' : 'zile active'}</p></div></article>
      </section>

      <div className="dashboard-main-grid">
        <section className="dashboard-panel dashboard-week" aria-labelledby="weekly-title">
          <div className="dashboard-panel__heading"><div><span>{ui('web_081c93ac2248b3d7')}</span><h2 id="weekly-title">{ui('web_51d1fbc6a86ee970')}</h2></div><strong>{activity.weekMinutes}{ui('ui_2e75737a6b582974')}</strong></div>
          <div className="dashboard-week__chart" aria-label={`${activity.weekMinutes} minute studiate în ultimele șapte zile`}>
            {activity.last7Days.map((day) => <div key={day.key}><div><span style={{ height: `${day.minutes ? Math.max(12, (day.minutes / maxWeekMinutes) * 100) : 4}%` }} className={day.minutes ? 'active' : ''}><i>{day.minutes || ''}</i></span></div><small>{day.label}</small><b>{day.dayNumber}</b></div>)}
          </div>
          <div className="dashboard-goal-picker"><div><strong>{ui('ui_667c7e104a7fcccd')}</strong><span>{ui('web_720c99685ea04416')}</span></div><div>{[5, 10, 15, 20].map((goal) => <button type="button" className={dailyGoal === goal ? 'active' : ''} onClick={() => selectGoal(goal)} key={goal}>{goal}{ui('ui_2e75737a6b582974')}</button>)}</div></div>
        </section>

        <section className="dashboard-panel dashboard-calendar" aria-labelledby="calendar-title">
          <div className="dashboard-panel__heading"><div><span>{ui('web_278efa56d13ebe05')}</span><h2 id="calendar-title">{ui('web_a0fab5255ef8035a')}</h2></div><strong>{activity.activeDays}{ui('web_fc4df31f7962ed97')}</strong></div>
          <div className="dashboard-calendar__weekdays">{['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, index) => <span key={`${day}-${index}`}>{day}</span>)}</div>
          <div className="dashboard-calendar__days">{activity.last28Days.map((day) => <span className={`${day.minutes ? 'active' : ''} ${day.minutes >= dailyGoal ? 'goal' : ''} ${day.isToday ? 'today' : ''}`} title={`${day.date.toLocaleDateString('ro-RO')}: ${day.minutes} minute`} key={day.key}>{day.date.getDate()}</span>)}</div>
          <div className="dashboard-calendar__legend"><span><i />{ui('web_170eca28a6d617e7')}</span><span><i className="active" />{ui('web_9a9140cef778b55f')}</span><span><i className="goal" />{ui('web_38b8b01a95408558')}</span></div>
        </section>
      </div>

      <section className="dashboard-section dashboard-recommendations" aria-labelledby="recommendations-title">
        <div className="dashboard-section__heading"><div><span>{ui('web_73698799bb4d6baa')}</span><h2 id="recommendations-title">{ui('web_b7dafc7bdfd82ff5')}</h2><p className="dashboard-recommendations__subtitle">{ui('web_e1ef9de501c704da')}</p></div></div>
        <div className="dashboard-recommendations__grid">{recommendations.map((item) => <article className={item.visual ? `dashboard-recommendation dashboard-recommendation--${item.visual}` : 'dashboard-recommendation'} key={item.title}><span className={item.visual ? `dashboard-recommendation__visual dashboard-recommendation__visual--${item.visual}` : 'dashboard-recommendation__visual'} aria-hidden="true"><RecommendationVisual type={item.visual} fallback={item.icon} pathId={item.pathId} /></span><div><h3>{item.title}</h3><p>{item.text}</p><Link to={item.to}>{item.action} →</Link></div></article>)}</div>
      </section>

      <section className="dashboard-section dashboard-levels" aria-labelledby="levels-progress-title">
        <div className="dashboard-section__heading"><div><span>{ui('web_c4775dc2e98843b3')}</span><h2 id="levels-progress-title">{ui('web_50b798afe61e8f9f')}</h2></div><Link to={`/invata?nivel=${activeLevel}`}>{ui('web_51345f07896323fe')}</Link></div>
        <div className="dashboard-levels__grid">{levels.map((item) => <article className={item.level === activeLevel ? 'active' : ''} key={item.level}><div><span>{item.level}</span><small>{levelName[item.level]}{item.level === activeLevel ? ' · nivel activ' : ''}</small><strong>{item.percent}%</strong></div><div className="dashboard-levels__track"><span style={{ width: `${item.percent}%` }} /></div><p>{item.completed}{ui('ui_dbd8b6478643d623')}{item.total}{ui('web_5edfa5841c3617fe')}{item.words}{ui('web_f75773e3941bf565')}</p></article>)}</div>
      </section>

      <MobileAppNav activeLevel={activeLevel} />
    </div>
  );
};

export default Dashboard;
