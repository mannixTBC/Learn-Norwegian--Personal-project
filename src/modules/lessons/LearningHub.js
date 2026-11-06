import {ui} from '../../languages/messages.js';
import {courseLocalStorage as localStorage} from '../../languages/storage.js';
import './SectionFinalTest.css';
import React, { useEffect, useRef, useState } from 'react';
import { Link, useHistory, useLocation } from 'react-router-dom';
import { courseCatalog } from '../../content/activeContent.js';
import { LESSON_STEPS, readLessonStep } from './norwegian-program/lessonFlow';
import { getLearningLevel } from './learningLevel';
import { finalTestKey, lessonResumeKey, readCourseProgress, readCurrentLesson } from '../../services/curriculumProgress';
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

const ACTIVE_LEVEL_KEY = 'norwegian_active_level';
const LESSON_PROGRESS_STEPS = LESSON_STEPS.length;

const BookIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M4.5 5.5c3.2-.7 5.7 0 7.5 1.7v12c-1.8-1.7-4.3-2.4-7.5-1.7ZM19.5 5.5c-3.2-.7-5.7 0-7.5 1.7v12c1.8-1.7 4.3-2.4 7.5-1.7Z" />
  </svg>
);

const ChevronIcon = () => <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 7 7-7 7" /></svg>;

const readLessonSteps = (levelCode, lessonId, user) => {
  const legacyKey = lessonResumeKey(levelCode, lessonId, user);
  return readLessonStep(`${legacyKey}_voice_v1`, legacyKey);
};

const SectionHeading = ({ section }) => (
  <div className="learn-section-heading">
    <span>{ui('ui_2bea68454a614bc7')}{section.number}</span><h3>{section.title}</h3><small>{section.lessons.length}{ui('ui_fa56bbc8c2c6fc10')}</small>
  </div>
);

const LearningHub = () => {
  const { user } = useAuth();
  const location = useLocation();
  const history = useHistory();
  const activeLevel = getLearningLevel(location.search);
  const course = courseCatalog[activeLevel];
  const levelTabs = useRef({});
  const setActiveLevel = (level) => {
    const query = new URLSearchParams(location.search);
    query.set('nivel', level);
    history.replace({ pathname: location.pathname, search: query.toString() });
  };
  const navigateLevels = (event, index, view) => {
    const destination = { ArrowRight: (index + 1) % levels.length, ArrowLeft: (index + levels.length - 1) % levels.length, Home: 0, End: levels.length - 1 }[event.key];
    if (destination === undefined) return;
    event.preventDefault();
    setActiveLevel(levels[destination].code);
    levelTabs.current[`${view}-${levels[destination].code}`]?.focus();
  };
  const [showAllLessons, setShowAllLessons] = useState(false);
  const activeLessons = levelLessons[activeLevel] || [];
  const visibleLessons = showAllLessons ? activeLessons : activeLessons.slice(0, 4);
  const activeDetails = levelDetails[activeLevel];
  const activeLevelInfo = levels.find((level) => level.code === activeLevel);
  const progress = readCourseProgress(activeLevel, user, course.lessons);
  const completedCount = progress.completed.filter((id) => id <= activeLessons.length).length;
  const lessonStepProgress = new Map(activeLessons.map((lesson) => [lesson.id, readLessonSteps(activeLevel, lesson.id, user)]));
  const completedStepUnits = activeLessons.reduce((total, lesson) => total + (progress.completed.includes(lesson.id) ? LESSON_PROGRESS_STEPS : lessonStepProgress.get(lesson.id)), 0);
  const totalStepUnits = activeLessons.length * LESSON_PROGRESS_STEPS;
  const progressPercent = totalStepUnits ? Math.round((completedStepUnits / totalStepUnits) * 100) : 0;
  const currentLesson = readCurrentLesson(user, courseCatalog);
  const currentLessonId = currentLesson?.level === activeLevel ? currentLesson.lessonId : null;
  const nextLesson = activeLessons.find((lesson) => lesson.id === currentLessonId) || activeLessons.find((lesson) => !progress.completed.includes(lesson.id)) || activeLessons[activeLessons.length - 1];
  const nextLessonIndex = Math.max(0, activeLessons.findIndex((lesson) => lesson.id === nextLesson?.id));
  const appPreviewStart = Math.max(0, Math.min(nextLessonIndex - 1, Math.max(0, activeLessons.length - 4)));
  const appVisibleLessons = showAllLessons ? activeLessons : activeLessons.slice(appPreviewStart, appPreviewStart + 4);
  const appTimelineActiveIndex = Math.max(0, appVisibleLessons.findIndex((lesson) => lesson.id === nextLesson?.id));
  const appTimelineProgress = appVisibleLessons.length > 1
    ? Math.round((appTimelineActiveIndex / (appVisibleLessons.length - 1)) * 100)
    : 0;
  const currentLessonSteps = nextLesson?.id === currentLessonId ? lessonStepProgress.get(nextLesson.id) : 0;
  const canResumeLesson = nextLesson?.id === currentLessonId;
  const progressSummary = `${completedCount} din ${activeLessons.length || 5} lecții finalizate${currentLessonSteps ? ` · ${currentLessonSteps} din ${LESSON_PROGRESS_STEPS} pași în lecția curentă` : ''}`;
  const finalTestPassed = localStorage.getItem(finalTestKey(activeLevel, 'passed', user)) === 'true';
  const finalTestBest = Number(localStorage.getItem(finalTestKey(activeLevel, 'best', user))) || 0;
  const reviewStats = getReviewStats(activeLevel);
  const careerProfile = getCareerProfile(user) || { pathId: 'general' };
  const careerPath = getCareerPath(careerProfile.pathId);

  useEffect(() => {
    localStorage.setItem(ACTIVE_LEVEL_KEY, activeLevel);
    setShowAllLessons(false);
  }, [activeLevel]);

  return (
    <div className="learn-page">
      <section className="learn-app" aria-label={ui('web_f3f7d0e05c4ee276')}>
        <Link className="learn-app__direction" to={`/alege-directia?redirect=${encodeURIComponent(`/invata?nivel=${activeLevel}`)}`} aria-label={`Direcția cursului: ${careerPath.title}. Schimbă direcția`}>
          <span className="learn-app__direction-icon"><BookIcon /></span>
          <span className="learn-app__direction-copy">
            <small>{ui('web_c40fa94751f7fbf4')}</small>
            <strong>{careerPath.title}</strong>
            <em>{careerPath.outcome}</em>
          </span>
          <span className="learn-app__direction-action">{ui('web_95e9d99d02557913')}<ChevronIcon /></span>
        </Link>

        <div className="learn-app__levels" role="tablist" aria-label={ui('web_c23c9030a7dab5a8')}>
          {levels.map((level, index) => (
            <button key={level.code} type="button" className={activeLevel === level.code ? 'active' : ''} onClick={() => setActiveLevel(level.code)} role="tab" aria-selected={activeLevel === level.code} tabIndex={activeLevel === level.code ? 0 : -1} id={`learn-app-tab-${level.code}`} aria-controls="learn-app-panel" ref={(element) => { levelTabs.current[`app-${level.code}`] = element; }} onKeyDown={(event) => navigateLevels(event, index, 'app')}>{level.code}</button>
          ))}
        </div>

        <section className="learn-app__progress" aria-label={`Progres nivel ${activeLevel}: ${progressPercent}%`}>
          <div><span>{ui('ui_1450f9b5ea87b98c')}{activeLevel} · {activeLevelInfo?.title}</span><strong>{completedCount}{ui('ui_dbd8b6478643d623')}{activeLessons.length}{ui('ui_fa56bbc8c2c6fc10')}</strong></div>
          <div className="learn-app__progress-track" role="progressbar" aria-label={`Progres la nivelul ${activeLevel}`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={progressPercent}><span style={{ width: `${progressPercent}%` }} /></div>
          <b>{progressPercent}%</b>
        </section>

        {nextLesson && (
          <article className="learn-app__next" style={{ '--learn-lesson-image': `url("${getLessonImage(activeLevel, nextLesson.id)}")` }}>
            <div>
              <small>{ui('web_628120ae7c2470fb')}</small>
              <h1>{ui('ui_abf153365567efe1')}{nextLesson.id}: {nextLesson.title}</h1>
              <p>{nextLesson.duration} · {nextLesson.vocabulary}{ui('ui_a6619ff79822addd')}</p>
            </div>
            <Link to={`/curs/${activeLevel.toLowerCase()}/${nextLesson.id}`}>{canResumeLesson ? ui('ui_6bbb599cd39f1d5d') : ui('ui_54609dd4c72877da')} <span aria-hidden="true">→</span></Link>
          </article>
        )}

        <section className="learn-app__program" id="learn-app-panel" role="tabpanel" aria-labelledby={`learn-app-tab-${activeLevel}`}>
          <header><div><small>{ui('web_c3356210423f69fa')}</small><h2 id="learn-app-program-title">{ui('ui_abef442239ce0d3f')}{activeLevel}</h2></div><span>{activeLessons.length}{ui('ui_fa56bbc8c2c6fc10')}</span></header>
          <div className="learn-app__timeline" id="learn-app-lesson-list" style={{ '--learn-timeline-progress': `${appTimelineProgress}%` }}>
            {appVisibleLessons.map((lesson, index) => {
              const completed = progress.completed.includes(lesson.id);
              const current = lesson.id === currentLessonId && !completed;
              const completedSteps = lessonStepProgress.get(lesson.id);
              const section = course.sections.find((item) => item.id === lesson.sectionId);
              const startsSection = index === 0 || appVisibleLessons[index - 1].sectionId !== lesson.sectionId;
              return (
                <React.Fragment key={lesson.uid}>
                {startsSection && <SectionHeading section={section} />}
                <Link className={`learn-app__lesson${completed ? ' is-complete' : ''}${current ? ' is-current' : ''}`} to={`/curs/${activeLevel.toLowerCase()}/${lesson.id}`} key={lesson.id}>
                  <span className="learn-app__lesson-node">{completed ? '✓' : lesson.number}</span>
                  <span className="learn-app__lesson-copy"><strong>{lesson.title}</strong><small>{lesson.duration} · {lesson.kind === 'consolidation' ? 'Consolidare' : `${lesson.vocabulary} expresii`}</small></span>
                  {completed
                    ? <em>{ui('web_13589381efd1211d')}</em>
                    : current
                      ? <em className="is-current">{completedSteps ? `${completedSteps} din ${LESSON_PROGRESS_STEPS} pași` : 'În desfășurare'}</em>
                      : <span className="learn-app__lesson-chevron"><ChevronIcon /></span>}
                </Link>
                {lesson.kind === 'consolidation' && <Link className="section-test-link" to={`/test-sectiune/${activeLevel.toLowerCase()}/${section.id}`}><span className="section-test-link__icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M9 4H6a2 2 0 0 0-2 2v14h16V6a2 2 0 0 0-2-2h-3M9 3h6v4H9zM8 13l2 2 6-5" /></svg></span><span className="section-test-link__copy"><strong>{ui('web_6fa6cc4ba86d3af4')}</strong><small>{ui('web_0fa05a2a97a15c01')}</small></span><span className="section-test-link__arrow" aria-hidden="true"><ChevronIcon /></span></Link>}
                </React.Fragment>
              );
            })}
          </div>
          {activeLessons.length > 4 && (
            <button className="learn-app__all" type="button" aria-controls="learn-app-lesson-list" aria-expanded={showAllLessons} onClick={() => setShowAllLessons((current) => !current)}>
              {showAllLessons ? ui('ui_2386c74c3816a32e') : `Vezi toate cele ${activeLessons.length} lecții`} <span aria-hidden="true">{showAllLessons ? '↑' : '↓'}</span>
            </button>
          )}
        </section>

        <Link className="learn-app__test" to={`/test-final/${activeLevel.toLowerCase()}`}>
          <span>{finalTestPassed ? '✓' : activeLevel}</span>
          <span><small>{ui('web_8769bf1a149a34c1')}</small><strong>{ui('web_9dfc80e68facc652')}</strong><em>{finalTestBest ? `Cel mai bun rezultat: ${finalTestBest}%` : ui('ui_d1e352bf38a9c55b')}</em></span>
          <ChevronIcon />
        </Link>
      </section>

      <header className="learn-hero">
        <div>
          <p className="learn-kicker">{ui('web_725874211fb012a2')}</p>
          <h1>{ui('web_621d297afcbed8cf')}</h1>
          <p>{ui('web_79ba4e4ae6724df9')}</p>
        </div>
        <div className="learn-progress" aria-label={`Progres ${activeLevel}: ${progressPercent}%`}>
          <div className="learn-progress__top"><span>{ui('web_983753827537c2cd')}{activeLevel}</span><strong>{progressPercent}%</strong></div>
          <div className="learn-progress__track"><span style={{ width: `${progressPercent}%` }} /></div>
          <small>{progressSummary}</small>
        </div>
      </header>

      <section className="career-track-card" aria-label={`Direcția cursului: ${careerPath.title}`}>
        <span className="career-track-card__icon" aria-hidden="true"><span className="career-track-card__initials">{careerPath.icon}</span><CareerPathVisual pathId={careerPath.id} /></span>
        <div><small>{ui('web_cea7f62d165e196d')}</small><h2>{careerPath.title}</h2><p>{careerPath.outcome}</p><div>{careerPath.phrases.slice(0, 3).map((phrase) => <span key={phrase[0]}>{phrase[0]}</span>)}</div></div>
        <Link to={`/alege-directia?redirect=${encodeURIComponent(`/invata?nivel=${activeLevel}`)}`}>{ui('web_1717f542639a2541')}</Link>
        <div className="career-track-progress" aria-label={`Progres nivel ${activeLevel}`}>
          <div className="career-track-progress__summary"><span>{ui('ui_1450f9b5ea87b98c')}{activeLevel} · {progressSummary}</span><strong>{progressPercent}%</strong></div>
          <div className="career-track-progress__track" role="progressbar" aria-label={`Progres la nivelul ${activeLevel}`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={progressPercent}><span style={{ width: `${progressPercent}%` }} /></div>
          {nextLesson && <Link className="career-track-progress__start" to={`/curs/${activeLevel.toLowerCase()}/${nextLesson.id}`}>{canResumeLesson ? ui('ui_6bbb599cd39f1d5d') : 'Începe cursul'} <span aria-hidden="true">→</span></Link>}
        </div>
      </section>

      {nextLesson && <section className="continue-card">
        <div className="continue-card__number">{nextLesson.number}</div>
        <div className="continue-card__content">
          <span>{ui('web_d938a81a433c3df7')}</span>
          <h2>{nextLesson.title}</h2>
          <p>{nextLesson.description}</p>
        </div>
        <Link className="learn-button" to={`/curs/${activeLevel.toLowerCase()}/${nextLesson.id}`}>{canResumeLesson ? ui('ui_6bbb599cd39f1d5d') : 'Începe cursul'} →</Link>
      </section>}

      <section className="level-section">
        <div className="section-title-row">
          <div><p className="learn-kicker">{ui('web_c3356210423f69fa')}</p><h2>{ui('web_a02c97a995feaf74')}</h2></div>
          <p>{ui('web_b0273c5f2fa467c9')}</p>
        </div>
        <div className="level-tabs" role="tablist" aria-label={ui('web_c23c9030a7dab5a8')}>
          {levels.map((level, index) => (
            <button key={level.code} type="button" className={`level-tab ${activeLevel === level.code ? 'level-tab--active' : ''}`} onClick={() => setActiveLevel(level.code)} role="tab" aria-selected={activeLevel === level.code} tabIndex={activeLevel === level.code ? 0 : -1} id={`learn-web-tab-${level.code}`} aria-controls="learn-web-panel" ref={(element) => { levelTabs.current[`web-${level.code}`] = element; }} onKeyDown={(event) => navigateLevels(event, index, 'web')}>
              <strong>{level.code}</strong><span>{level.title}</span>{!level.available && <small>{ui('web_364eee36c1b00aa1')}</small>}
            </button>
          ))}
        </div>

        {activeLevelInfo && activeLevelInfo.available ? (
          <div className="course-block" id="learn-web-panel" role="tabpanel" aria-labelledby={`learn-web-tab-${activeLevel}`}>
            <div className="course-block__header"><div><span className="level-pill">{activeLevel} · {activeLevelInfo.title}</span><h2>{activeDetails.heading}</h2><p>{activeDetails.outcome}</p></div><div className="course-stats"><span><strong>{activeLessons.length}</strong>{ui('ui_fa56bbc8c2c6fc10')}</span><span><strong>~{activeDetails.minutes}</strong>{ui('web_e00000d8936cf869')}</span><span><strong>{activeDetails.words}</strong>{ui('ui_a6619ff79822addd')}</span></div></div>
            <div className="lesson-list" id="active-lesson-list">
              {visibleLessons.map((lesson, index) => {
                const completed = progress.completed.includes(lesson.id);
                const completedSteps = lessonStepProgress.get(lesson.id);
                const unlocked = true;
                const section = course.sections.find((item) => item.id === lesson.sectionId);
                const startsSection = index === 0 || visibleLessons[index - 1].sectionId !== lesson.sectionId;
                return (
                  <React.Fragment key={lesson.uid}>
                  {startsSection && <SectionHeading section={section} />}
                  <article className={`course-lesson ${!unlocked ? 'course-lesson--locked' : ''}`} key={lesson.id}>
                    <div className="course-lesson__number">{completed ? '✓' : lesson.number}</div>
                    <div className="course-lesson__body"><div className="course-lesson__meta"><span>{lesson.duration}</span><span>{lesson.kind === 'consolidation' ? 'Consolidare' : `${lesson.vocabulary} expresii`}</span>{completed ? <span className="completed-label">{ui('web_13589381efd1211d')}</span> : lesson.id === currentLessonId && <span className="in-progress-label">{completedSteps ? `${completedSteps} din ${LESSON_PROGRESS_STEPS} pași` : 'În desfășurare'}</span>}</div><h3>{lesson.title}</h3><p>{lesson.description}</p><div className="topic-list">{lesson.topics.map((topic) => <span key={topic}>{topic}</span>)}<span className="personalized-topic">+ {careerPath.shortTitle}</span></div></div>
                    {unlocked ? <Link className="lesson-action" to={`/curs/${activeLevel.toLowerCase()}/${lesson.id}`} aria-label={`Deschide lecția ${lesson.title}`}>{ui('web_b9e9c00bf07fbdf3')}</Link> : <span className="lesson-locked"><span role="img" aria-label={ui('web_880262495d54f637')}>🔒</span>{ui('web_bca858f708effefc')}</span>}
                  </article>
                  {lesson.kind === 'consolidation' && <Link className="section-test-link" to={`/test-sectiune/${activeLevel.toLowerCase()}/${section.id}`}><span className="section-test-link__icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M9 4H6a2 2 0 0 0-2 2v14h16V6a2 2 0 0 0-2-2h-3M9 3h6v4H9zM8 13l2 2 6-5" /></svg></span><span className="section-test-link__copy"><strong>{ui('web_6fa6cc4ba86d3af4')}</strong><small>{ui('web_0fa05a2a97a15c01')}</small></span><span className="section-test-link__arrow" aria-hidden="true"><ChevronIcon /></span></Link>}
                  </React.Fragment>
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
                  <span>{showAllLessons ? ui('ui_2386c74c3816a32e') : `Vezi toate cele ${activeLessons.length} lecții`}</span>
                  <i aria-hidden="true">{showAllLessons ? '↑' : '↓'}</i>
                </button>
              </div>
            )}
            <section className="final-test-card"><div className="final-test-card__icon">{finalTestPassed ? '✓' : activeLevel}</div><div><span>{ui('web_2d269044f065f047')}{activeLevel}</span><h3>{ui('web_9dfc80e68facc652')}</h3><p>{ui('web_f53a65dcc1f9bb82')}</p><small>{finalTestBest ? `Cel mai bun rezultat: ${finalTestBest}%` : 'Testul nu blochează accesul la următorul nivel.'}</small></div><Link to={`/test-final/${activeLevel.toLowerCase()}`}>{finalTestPassed ? 'Repetă testul' : 'Începe testul'} →</Link></section>
          </div>
        ) : (
          <div className="coming-level"><span>{activeLevel}</span><h2>{ui('web_f00fd47e29f5f7ab')}</h2><p>{ui('web_4c3c15d2d51f9dc2')}{activeLevel}{ui('web_1bc8364d9b792362')}</p><button type="button" onClick={() => setActiveLevel(ui('ui_16a36e86f6fed5d4'))}>{ui('web_e45c87aa2f271d93')}</button></div>
        )}
      </section>

      {activeLevelInfo && activeLevelInfo.available && (
        <Link className="games-hub-promo" to={`/jocuri?nivel=${activeLevel}`}>
          <span className="games-hub-promo__icon" aria-hidden="true">{ui('web_81acaafba961bb83')}</span>
          <div><small>{ui('web_2caee7e617eb71fd')}</small><h2>{ui('web_4ff8c30397e8a3a2')}</h2><p>{ui('web_49607e5c11655410')}</p></div>
          <strong>{ui('web_edac3e20dae235b6')}<span aria-hidden="true">→</span></strong>
        </Link>
      )}

      {activeLevelInfo && activeLevelInfo.available && <section className="learning-tools" id="instrumente">
        <div><p className="learn-kicker">{ui('web_149a9b3298544a8b')}</p><h2>{ui('web_9382cba1c56486c8')}</h2><p className="learning-tools__intro">{ui('web_820672ec167973dd')}</p></div>
        <div className="learning-tools__grid"><Link className="review-tool-link" to={`/recapitulare?nivel=${activeLevel}`}><span role="img" aria-hidden="true">🧠</span><strong>{ui('web_5183f8c86046280a')}</strong><small>{reviewStats.due ? `${reviewStats.due} ${reviewStats.due === 1 ? 'element pregătit' : 'elemente pregătite'} pentru astăzi.` : reviewStats.total ? 'Totul este la zi. Revenim la momentul potrivit.' : 'Greșelile vor fi programate automat.'}</small>{reviewStats.due > 0 && <em className="review-due-badge">{reviewStats.due}</em>}</Link><Link to={`/pronuntie?nivel=${activeLevel}`}><span role="img" aria-hidden="true">🔊</span><strong>{ui('web_a0d81f59f290be9e')}</strong><small>{ui('web_aa0d2381b775c515')}</small></Link><Link to={`/challenge30?nivel=${activeLevel}`}><span role="img" aria-hidden="true">📅</span><strong>{ui('web_225ade7030a63327')}</strong><small>{ui('web_58051cb0248d2b12')}</small></Link></div>
      </section>}

      <MobileAppNav activeLevel={activeLevel} />

    </div>
  );
};

export default LearningHub;
