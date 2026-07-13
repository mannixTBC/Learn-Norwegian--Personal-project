import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { levelDetails, levelLessons, levels } from './courseData';
import { getReviewStats } from '../../services/spacedReview';
import { getCareerPath, getCareerProfile } from '../../services/careerProfile';
import { useAuth } from '../auth/AuthContext';
import './LearningHub.css';
import './FinalTestCard.css';
import './ReviewBadge.css';

const getStorageKey = (levelCode) => levelCode === 'A1' ? 'lesson_prog_progress' : `lesson_prog_progress_${levelCode.toLowerCase()}`;
const ACTIVE_LEVEL_KEY = 'norwegian_active_level';

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
  const activeLessons = levelLessons[activeLevel] || [];
  const activeDetails = levelDetails[activeLevel];
  const activeLevelInfo = levels.find((level) => level.code === activeLevel);
  const progress = readProgress(activeLevel);
  const completedCount = progress.completed.filter((id) => id <= activeLessons.length).length;
  const progressPercent = activeLessons.length ? Math.round((completedCount / activeLessons.length) * 100) : 0;
  const nextLesson = activeLessons.find((lesson) => !progress.completed.includes(lesson.id)) || activeLessons[activeLessons.length - 1];
  const finalTestPassed = localStorage.getItem(`final_test_passed_${activeLevel.toLowerCase()}`) === 'true';
  const finalTestBest = Number(localStorage.getItem(`final_test_best_${activeLevel.toLowerCase()}`)) || 0;
  const reviewStats = getReviewStats(activeLevel);
  const careerProfile = getCareerProfile(user) || { pathId: 'general' };
  const careerPath = getCareerPath(careerProfile.pathId);

  useEffect(() => { localStorage.setItem(ACTIVE_LEVEL_KEY, activeLevel); }, [activeLevel]);

  return (
    <div className="learn-page">
      <header className="learn-hero">
        <div>
          <p className="learn-kicker">Curs de norvegiană</p>
          <h1>Învață norvegiana pas cu pas</h1>
          <p>Un traseu practic pentru vorbitorii de română, cu vocabular, explicații, dialoguri și exerciții după fiecare lecție.</p>
        </div>
        <div className="learn-progress" aria-label={`Progres ${activeLevel}: ${progressPercent}%`}>
          <div className="learn-progress__top"><span>Progres nivel {activeLevel}</span><strong>{progressPercent}%</strong></div>
          <div className="learn-progress__track"><span style={{ width: `${progressPercent}%` }} /></div>
          <small>{completedCount} din {activeLessons.length || 5} lecții finalizate</small>
        </div>
      </header>

      <section className="career-track-card" aria-label={`Direcția cursului: ${careerPath.title}`}>
        <span className="career-track-card__icon" aria-hidden="true">{careerPath.icon}</span>
        <div><small>Direcția ta personalizată</small><h2>{careerPath.title}</h2><p>{careerPath.outcome}</p><div>{careerPath.phrases.slice(0, 3).map((phrase) => <span key={phrase[0]}>{phrase[0]}</span>)}</div></div>
        <Link to={`/alege-directia?redirect=${encodeURIComponent(`/invata?nivel=${activeLevel}`)}`}>Schimbă direcția →</Link>
      </section>

      {nextLesson && <section className="continue-card">
        <div className="continue-card__number">{nextLesson.number}</div>
        <div className="continue-card__content">
          <span>Recomandat pentru tine</span>
          <h2>{nextLesson.title}</h2>
          <p>{nextLesson.description}</p>
        </div>
        <Link className="learn-button" to={`/curs/${activeLevel.toLowerCase()}/${nextLesson.id}`}>{completedCount ? 'Continuă lecția' : 'Începe cursul'} →</Link>
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
            <div className="lesson-list">
              {activeLessons.map((lesson) => {
                const completed = progress.completed.includes(lesson.id);
                const unlocked = true;
                return (
                  <article className={`course-lesson ${!unlocked ? 'course-lesson--locked' : ''}`} key={lesson.id}>
                    <div className="course-lesson__number">{completed ? '✓' : lesson.number}</div>
                    <div className="course-lesson__body"><div className="course-lesson__meta"><span>{lesson.duration}</span><span>{lesson.vocabulary} cuvinte</span><span>+ 3 expresii personalizate</span>{completed && <span className="completed-label">Finalizată</span>}</div><h3>{lesson.title}</h3><p>{lesson.description}</p><div className="topic-list">{lesson.topics.map((topic) => <span key={topic}>{topic}</span>)}<span className="personalized-topic">+ {careerPath.shortTitle}</span></div></div>
                    {unlocked ? <Link className="lesson-action" to={`/curs/${activeLevel.toLowerCase()}/${lesson.id}`} aria-label={`Deschide lecția ${lesson.title}`}>Deschide →</Link> : <span className="lesson-locked"><span role="img" aria-label="Blocat">🔒</span> Termină lecția anterioară</span>}
                  </article>
                );
              })}
            </div>
            <section className="final-test-card"><div className="final-test-card__icon">{finalTestPassed ? '✓' : '10'}</div><div><span>Evaluarea nivelului {activeLevel}</span><h3>Test final interactiv</h3><p>12 întrebări din toate lecțiile: vocabular, gramatică, propoziții și ascultare ElevenLabs.</p><small>{finalTestBest ? `Cel mai bun rezultat: ${finalTestBest}%` : 'Testul nu blochează accesul la următorul nivel.'}</small></div><Link to={`/test-final/${activeLevel.toLowerCase()}`}>{finalTestPassed ? 'Repetă testul' : 'Începe testul'} →</Link></section>
          </div>
        ) : (
          <div className="coming-level"><span>{activeLevel}</span><h2>Programa acestui nivel este în pregătire</h2><p>Finalizează nivelul A1. Lecțiile pentru {activeLevel} vor fi adăugate într-o etapă viitoare.</p><button type="button" onClick={() => setActiveLevel('A1')}>Vezi cursul A1</button></div>
        )}
      </section>

      {activeLevelInfo && activeLevelInfo.available && <section className="learning-tools" id="instrumente">
        <div><p className="learn-kicker">Studiază mai eficient</p><h2>Instrumente de învățare</h2><p className="learning-tools__intro">Folosește-le când vrei să repeți o anumită abilitate în afara lecțiilor.</p></div>
        <div className="learning-tools__grid"><Link className="review-tool-link" to={`/recapitulare?nivel=${activeLevel}`}><span role="img" aria-hidden="true">🧠</span><strong>Recapitulare inteligentă</strong><small>{reviewStats.due ? `${reviewStats.due} ${reviewStats.due === 1 ? 'element pregătit' : 'elemente pregătite'} pentru astăzi.` : reviewStats.total ? 'Totul este la zi. Revenim la momentul potrivit.' : 'Greșelile vor fi programate automat.'}</small>{reviewStats.due > 0 && <em className="review-due-badge">{reviewStats.due}</em>}</Link><Link to={`/pronuntie?nivel=${activeLevel}`}><span role="img" aria-hidden="true">🔊</span><strong>Pronunție</strong><small>Ascultă și repetă sunetele.</small></Link><Link to={`/challenge30?nivel=${activeLevel}`}><span role="img" aria-hidden="true">📅</span><strong>Provocarea verbelor</strong><small>30 de verbe în 10 sesiuni.</small></Link></div>
      </section>}

      <section className="practice-zone" id="practica">
        <div className="practice-zone__heading"><div><p className="learn-kicker">Practică suplimentară</p><h2>Exersează prin joc</h2><p>Aceste activități folosesc abilitățile studiate în curs. Nu sunt obligatorii pentru deblocarea lecțiilor.</p></div><span>Opțional</span></div>
        <div className="practice-zone__grid">
          <Link to="/chestionar" className="practice-tool"><span className="practice-tool__icon" role="img" aria-hidden="true">✅</span><div><small>Verificare rapidă</small><h3>Chestionar</h3><p>Alege răspunsul corect și verifică vocabularul de bază.</p></div><b>Începe →</b></Link>
          <Link to="/drag" className="practice-tool"><span className="practice-tool__icon" role="img" aria-hidden="true">🧩</span><div><small>Construiește propoziții</small><h3>Trage și plasează</h3><p>Ordonează cuvintele și formează structuri corecte.</p></div><b>Începe →</b></Link>
          <Link to="/hangman" className="practice-tool"><span className="practice-tool__icon" role="img" aria-hidden="true">🔤</span><div><small>Joc de vocabular</small><h3>Descoperă cuvântul</h3><p>Recunoaște și fixează cuvintele printr-un joc rapid.</p></div><b>Începe →</b></Link>
        </div>
      </section>
    </div>
  );
};

export default LearningHub;
