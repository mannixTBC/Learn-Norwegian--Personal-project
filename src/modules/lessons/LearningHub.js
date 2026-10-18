import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { levelDetails, levelLessons, levels } from './courseData';
import { getReviewStats } from '../../services/spacedReview';
import { getCareerPath, getCareerProfile } from '../../services/careerProfile';
import { useAuth } from '../auth/AuthContext';
import CareerPathVisual from '../onboarding/CareerPathVisual';
import MobileAppNav from '../layout/MobileAppNav';
import { getLessonImage } from './lessonVisuals';
import './LearningHub.css';
import './FinalTestCard.css';
import './ReviewBadge.css';

const getStorageKey = (levelCode) => levelCode === 'A1' ? 'lesson_prog_progress' : `lesson_prog_progress_${levelCode.toLowerCase()}`;
const ACTIVE_LEVEL_KEY = 'norwegian_active_level';
const LESSON_PROGRESS_STEPS = 7;

const BookIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M4.5 5.5c3.2-.7 5.7 0 7.5 1.7v12c-1.8-1.7-4.3-2.4-7.5-1.7ZM19.5 5.5c-3.2-.7-5.7 0-7.5 1.7v12c1.8-1.7 4.3-2.4 7.5-1.7Z" />
  </svg>
);

const ChevronIcon = () => <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 7 7-7 7" /></svg>;

const getLessonResumeKey = (levelCode, lessonId, user) => `lesson_resume_${user && user.id ? user.id : 'guest'}_${levelCode.toLowerCase()}_${lessonId}`;

const readStoredNumber = (key) => {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return null;
    const value = Number(JSON.parse(raw));
    return Number.isFinite(value) ? value : null;
  } catch (_) {
    return null;
  }
};

const readLessonSteps = (levelCode, lessonId, user) => {
  const legacyKey = getLessonResumeKey(levelCode, lessonId, user);
  const current = readStoredNumber(`${legacyKey}_voice_v1`);
  // În versiunea veche, pasul 6 era deja rezultatul; îl tratăm ca 5 pași
  // finalizați pentru a nu raporta dialogul vocal drept parcurs accidental.
  const value = current === null ? Math.min(5, readStoredNumber(legacyKey) || 0) : current;
  return Math.min(LESSON_PROGRESS_STEPS, Math.max(0, Math.trunc(value)));
};

const readProgress = (levelCode) => {
  try {
    const value = JSON.parse(localStorage.getItem(getStorageKey(levelCode)));
    return value && Array.isArray(value.completed) ? value : { unlocked: 1, completed: [] };
  } catch (_) {
    return { unlocked: 1, completed: [] };
  }
};

const LearningHub = () => {
  const { user } = useAuth();
  const [activeLevel, setActiveLevel] = useState(() => {
    const requested = new URLSearchParams(window.location.search).get('nivel');
    return requested || localStorage.getItem(ACTIVE_LEVEL_KEY) || 'A1';
  });
  const [showAllLessons, setShowAllLessons] = useState(false);
  const activeLessons = levelLessons[activeLevel] || [];
  const visibleLessons = showAllLessons ? activeLessons : activeLessons.slice(0, 4);
  const activeDetails = levelDetails[activeLevel];
  const activeLevelInfo = levels.find((level) => level.code === activeLevel);
  const progress = readProgress(activeLevel);
  const completedCount = progress.completed.filter((id) => id <= activeLessons.length).length;
  const lessonStepProgress = new Map(activeLessons.map((lesson) => [lesson.id, readLessonSteps(activeLevel, lesson.id, user)]));
  const completedStepUnits = activeLessons.reduce((total, lesson) => total + (progress.completed.includes(lesson.id) ? LESSON_PROGRESS_STEPS : lessonStepProgress.get(lesson.id)), 0);
  const totalStepUnits = activeLessons.length * LESSON_PROGRESS_STEPS;
  const progressPercent = totalStepUnits ? Math.round((completedStepUnits / totalStepUnits) * 100) : 0;
  const nextLesson = activeLessons.find((lesson) => !progress.completed.includes(lesson.id)) || activeLessons[activeLessons.length - 1];
  const nextLessonIndex = Math.max(0, activeLessons.findIndex((lesson) => lesson.id === nextLesson?.id));
  const appPreviewStart = Math.max(0, Math.min(nextLessonIndex - 1, Math.max(0, activeLessons.length - 4)));
  const appVisibleLessons = showAllLessons ? activeLessons : activeLessons.slice(appPreviewStart, appPreviewStart + 4);
  const appTimelineActiveIndex = Math.max(0, appVisibleLessons.findIndex((lesson) => lesson.id === nextLesson?.id));
  const appTimelineProgress = appVisibleLessons.length > 1
    ? Math.round((appTimelineActiveIndex / (appVisibleLessons.length - 1)) * 100)
    : 0;
  const currentLessonSteps = nextLesson && !progress.completed.includes(nextLesson.id) ? lessonStepProgress.get(nextLesson.id) : 0;
  const hasLearningProgress = completedStepUnits > 0;
  const progressSummary = `${completedCount} din ${activeLessons.length || 5} lecții finalizate${currentLessonSteps ? ` · ${currentLessonSteps} din ${LESSON_PROGRESS_STEPS} pași în lecția curentă` : ''}`;
  const finalTestPassed = localStorage.getItem(`final_test_passed_${activeLevel.toLowerCase()}`) === 'true';
  const finalTestBest = Number(localStorage.getItem(`final_test_best_${activeLevel.toLowerCase()}`)) || 0;
  const reviewStats = getReviewStats(activeLevel);
  const careerProfile = getCareerProfile(user) || { pathId: 'general' };
  const careerPath = getCareerPath(careerProfile.pathId);

  useEffect(() => {
    localStorage.setItem(ACTIVE_LEVEL_KEY, activeLevel);
    setShowAllLessons(false);
  }, [activeLevel]);

  return (
    <div className="learn-page">
      <section className="learn-app" aria-label="Lecțiile tale">
        <Link className="learn-app__direction" to={`/alege-directia?redirect=${encodeURIComponent(`/invata?nivel=${activeLevel}`)}`} aria-label={`Direcția cursului: ${careerPath.title}. Schimbă direcția`}>
          <span className="learn-app__direction-icon"><BookIcon /></span>
          <span className="learn-app__direction-copy">
            <small>Direcția cursului</small>
            <strong>{careerPath.title}</strong>
            <em>{careerPath.outcome}</em>
          </span>
          <span className="learn-app__direction-action">Schimbă <ChevronIcon /></span>
        </Link>

        <div className="learn-app__levels" role="tablist" aria-label="Niveluri de limbă">
          {levels.map((level) => (
            <button key={level.code} type="button" className={activeLevel === level.code ? 'active' : ''} onClick={() => setActiveLevel(level.code)} role="tab" aria-selected={activeLevel === level.code}>{level.code}</button>
          ))}
        </div>

        <section className="learn-app__progress" aria-label={`Progres nivel ${activeLevel}: ${progressPercent}%`}>
          <div><span>Nivel {activeLevel} · {activeLevelInfo?.title}</span><strong>{completedCount} din {activeLessons.length} lecții</strong></div>
          <div className="learn-app__progress-track" role="progressbar" aria-label={`Progres la nivelul ${activeLevel}`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={progressPercent}><span style={{ width: `${progressPercent}%` }} /></div>
          <b>{progressPercent}%</b>
        </section>

        {nextLesson && (
          <article className="learn-app__next" style={{ '--learn-lesson-image': `url("${getLessonImage(nextLesson.id)}")` }}>
            <div>
              <small>Lecția următoare</small>
              <h1>Lecția {nextLesson.id}: {nextLesson.title}</h1>
              <p>{nextLesson.duration} · {nextLesson.vocabulary} expresii</p>
            </div>
            <Link to={`/curs/${activeLevel.toLowerCase()}/${nextLesson.id}`}>{hasLearningProgress ? 'Continuă lecția' : 'Începe lecția'} <span aria-hidden="true">→</span></Link>
          </article>
        )}

        <section className="learn-app__program" aria-labelledby="learn-app-program-title">
          <header><div><small>Traseul tău</small><h2 id="learn-app-program-title">Programa {activeLevel}</h2></div><span>{activeLessons.length} lecții</span></header>
          <div className="learn-app__timeline" style={{ '--learn-timeline-progress': `${appTimelineProgress}%` }}>
            {appVisibleLessons.map((lesson) => {
              const completed = progress.completed.includes(lesson.id);
              const current = lesson.id === nextLesson?.id && !completed;
              const completedSteps = lessonStepProgress.get(lesson.id);
              return (
                <Link className={`learn-app__lesson${completed ? ' is-complete' : ''}${current ? ' is-current' : ''}`} to={`/curs/${activeLevel.toLowerCase()}/${lesson.id}`} key={lesson.id}>
                  <span className="learn-app__lesson-node">{completed ? '✓' : lesson.number}</span>
                  <span className="learn-app__lesson-copy"><strong>{lesson.title}</strong><small>{lesson.duration} · {lesson.vocabulary} expresii</small></span>
                  {completed
                    ? <em>Finalizată</em>
                    : current
                      ? <em className="is-current">{completedSteps ? `${completedSteps} din ${LESSON_PROGRESS_STEPS} pași` : 'În desfășurare'}</em>
                      : <span className="learn-app__lesson-chevron"><ChevronIcon /></span>}
                </Link>
              );
            })}
          </div>
          {activeLessons.length > 4 && (
            <button className="learn-app__all" type="button" aria-expanded={showAllLessons} onClick={() => setShowAllLessons((current) => !current)}>
              {showAllLessons ? 'Arată mai puține lecții' : `Vezi toate cele ${activeLessons.length} lecții`} <span aria-hidden="true">{showAllLessons ? '↑' : '↓'}</span>
            </button>
          )}
        </section>

        <Link className="learn-app__test" to={`/test-final/${activeLevel.toLowerCase()}`}>
          <span>{finalTestPassed ? '✓' : activeLevel}</span>
          <span><small>La finalul programei</small><strong>Test final interactiv</strong><em>{finalTestBest ? `Cel mai bun rezultat: ${finalTestBest}%` : 'Verifică ce ai învățat'}</em></span>
          <ChevronIcon />
        </Link>
      </section>

      <header className="learn-hero">
        <div>
          <p className="learn-kicker">Curs de norvegiană</p>
          <h1>Învață norvegiana pas cu pas</h1>
          <p>Un traseu practic pentru vorbitorii de română, cu vocabular, explicații, dialoguri și exerciții după fiecare lecție.</p>
        </div>
        <div className="learn-progress" aria-label={`Progres ${activeLevel}: ${progressPercent}%`}>
          <div className="learn-progress__top"><span>Progres nivel {activeLevel}</span><strong>{progressPercent}%</strong></div>
          <div className="learn-progress__track"><span style={{ width: `${progressPercent}%` }} /></div>
          <small>{progressSummary}</small>
        </div>
      </header>

      <section className="career-track-card" aria-label={`Direcția cursului: ${careerPath.title}`}>
        <span className="career-track-card__icon" aria-hidden="true"><span className="career-track-card__initials">{careerPath.icon}</span><CareerPathVisual pathId={careerPath.id} /></span>
        <div><small>Direcția ta personalizată</small><h2>{careerPath.title}</h2><p>{careerPath.outcome}</p><div>{careerPath.phrases.slice(0, 3).map((phrase) => <span key={phrase[0]}>{phrase[0]}</span>)}</div></div>
        <Link to={`/alege-directia?redirect=${encodeURIComponent(`/invata?nivel=${activeLevel}`)}`}>Schimbă direcția →</Link>
        <div className="career-track-progress" aria-label={`Progres nivel ${activeLevel}`}>
          <div className="career-track-progress__summary"><span>Nivel {activeLevel} · {progressSummary}</span><strong>{progressPercent}%</strong></div>
          <div className="career-track-progress__track" role="progressbar" aria-label={`Progres la nivelul ${activeLevel}`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={progressPercent}><span style={{ width: `${progressPercent}%` }} /></div>
          {nextLesson && <Link className="career-track-progress__start" to={`/curs/${activeLevel.toLowerCase()}/${nextLesson.id}`}>{hasLearningProgress ? 'Continuă lecția' : 'Începe cursul'} <span aria-hidden="true">→</span></Link>}
        </div>
      </section>

      {nextLesson && <section className="continue-card">
        <div className="continue-card__number">{nextLesson.number}</div>
        <div className="continue-card__content">
          <span>Recomandat pentru tine</span>
          <h2>{nextLesson.title}</h2>
          <p>{nextLesson.description}</p>
        </div>
        <Link className="learn-button" to={`/curs/${activeLevel.toLowerCase()}/${nextLesson.id}`}>{hasLearningProgress ? 'Continuă lecția' : 'Începe cursul'} →</Link>
      </section>}

      <section className="level-section">
        <div className="section-title-row">
          <div><p className="learn-kicker">Traseul tău</p><h2>Niveluri de învățare</h2></div>
          <p>Alege nivelul pentru a vedea programa.</p>
        </div>
        <div className="level-tabs" role="tablist" aria-label="Niveluri de limbă">
          {levels.map((level) => (
            <button key={level.code} className={`level-tab ${activeLevel === level.code ? 'level-tab--active' : ''}`} onClick={() => setActiveLevel(level.code)} role="tab" aria-selected={activeLevel === level.code}>
              <strong>{level.code}</strong><span>{level.title}</span>{!level.available && <small>În curând</small>}
            </button>
          ))}
        </div>

        {activeLevelInfo && activeLevelInfo.available ? (
          <div className="course-block">
            <div className="course-block__header"><div><span className="level-pill">{activeLevel} · {activeLevelInfo.title}</span><h2>{activeDetails.heading}</h2><p>{activeDetails.outcome}</p></div><div className="course-stats"><span><strong>{activeLessons.length}</strong> lecții</span><span><strong>~{activeDetails.minutes}</strong> minute</span><span><strong>{activeDetails.words}</strong> cuvinte</span></div></div>
            <div className="lesson-list" id="active-lesson-list">
              {visibleLessons.map((lesson) => {
                const completed = progress.completed.includes(lesson.id);
                const completedSteps = lessonStepProgress.get(lesson.id);
                const unlocked = true;
                return (
                  <article className={`course-lesson ${!unlocked ? 'course-lesson--locked' : ''}`} key={lesson.id}>
                    <div className="course-lesson__number">{completed ? '✓' : lesson.number}</div>
                    <div className="course-lesson__body"><div className="course-lesson__meta"><span>{lesson.duration}</span><span>{lesson.vocabulary} cuvinte</span><span>+ 3 expresii personalizate</span>{completed ? <span className="completed-label">Finalizată</span> : completedSteps > 0 && <span className="in-progress-label">{completedSteps} din {LESSON_PROGRESS_STEPS} pași</span>}</div><h3>{lesson.title}</h3><p>{lesson.description}</p><div className="topic-list">{lesson.topics.map((topic) => <span key={topic}>{topic}</span>)}<span className="personalized-topic">+ {careerPath.shortTitle}</span></div></div>
                    {unlocked ? <Link className="lesson-action" to={`/curs/${activeLevel.toLowerCase()}/${lesson.id}`} aria-label={`Deschide lecția ${lesson.title}`}>Deschide →</Link> : <span className="lesson-locked"><span role="img" aria-label="Blocat">🔒</span> Termină lecția anterioară</span>}
                  </article>
                );
              })}
            </div>
            {activeLessons.length > 4 && (
              <div className="lesson-list-toggle-wrap">
                <button
                  type="button"
                  className="lesson-list-toggle"
                  aria-expanded={showAllLessons}
                  aria-controls="active-lesson-list"
                  onClick={() => setShowAllLessons((current) => !current)}
                >
                  <span>{showAllLessons ? 'Arată mai puține lecții' : `Vezi toate cele ${activeLessons.length} lecții`}</span>
                  <i aria-hidden="true">{showAllLessons ? '↑' : '↓'}</i>
                </button>
              </div>
            )}
            <section className="final-test-card"><div className="final-test-card__icon">{finalTestPassed ? '✓' : '10'}</div><div><span>Evaluarea nivelului {activeLevel}</span><h3>Test final interactiv</h3><p>12 întrebări din toate lecțiile: vocabular, gramatică, propoziții și ascultare ElevenLabs.</p><small>{finalTestBest ? `Cel mai bun rezultat: ${finalTestBest}%` : 'Testul nu blochează accesul la următorul nivel.'}</small></div><Link to={`/test-final/${activeLevel.toLowerCase()}`}>{finalTestPassed ? 'Repetă testul' : 'Începe testul'} →</Link></section>
          </div>
        ) : (
          <div className="coming-level"><span>{activeLevel}</span><h2>Programa acestui nivel este în pregătire</h2><p>Finalizează nivelul A1. Lecțiile pentru {activeLevel} vor fi adăugate într-o etapă viitoare.</p><button type="button" onClick={() => setActiveLevel('A1')}>Vezi cursul A1</button></div>
        )}
      </section>

      {activeLevelInfo && activeLevelInfo.available && (
        <Link className="games-hub-promo" to={`/jocuri?nivel=${activeLevel}`}>
          <span className="games-hub-promo__icon" aria-hidden="true">Aa</span>
          <div><small>Practică suplimentară</small><h2>Jocuri și exerciții</h2><p>Chestionare, propoziții, vocabular, verbe și pronunție — toate într-un singur loc.</p></div>
          <strong>Vezi toate jocurile <span aria-hidden="true">→</span></strong>
        </Link>
      )}

      {activeLevelInfo && activeLevelInfo.available && <section className="learning-tools" id="instrumente">
        <div><p className="learn-kicker">Studiază mai eficient</p><h2>Instrumente de învățare</h2><p className="learning-tools__intro">Folosește-le când vrei să repeți o anumită abilitate în afara lecțiilor.</p></div>
        <div className="learning-tools__grid"><Link className="review-tool-link" to={`/recapitulare?nivel=${activeLevel}`}><span role="img" aria-hidden="true">🧠</span><strong>Recapitulare inteligentă</strong><small>{reviewStats.due ? `${reviewStats.due} ${reviewStats.due === 1 ? 'element pregătit' : 'elemente pregătite'} pentru astăzi.` : reviewStats.total ? 'Totul este la zi. Revenim la momentul potrivit.' : 'Greșelile vor fi programate automat.'}</small>{reviewStats.due > 0 && <em className="review-due-badge">{reviewStats.due}</em>}</Link><Link to={`/pronuntie?nivel=${activeLevel}`}><span role="img" aria-hidden="true">🔊</span><strong>Pronunție</strong><small>Ascultă și repetă sunetele.</small></Link><Link to={`/challenge30?nivel=${activeLevel}`}><span role="img" aria-hidden="true">📅</span><strong>Provocarea verbelor</strong><small>30 de verbe în 10 sesiuni.</small></Link></div>
      </section>}

      <MobileAppNav activeLevel={activeLevel} />

    </div>
  );
};

export default LearningHub;
