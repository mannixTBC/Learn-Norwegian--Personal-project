import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { a1Lessons, levels } from './courseData';
import './LearningHub.css';

const STORAGE_KEY = 'lesson_prog_progress';

const readProgress = () => {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return value && Array.isArray(value.completed) ? value : { unlocked: 1, completed: [] };
  } catch (_) {
    return { unlocked: 1, completed: [] };
  }
};

const LearningHub = () => {
  const [activeLevel, setActiveLevel] = useState('A1');
  const [progress] = useState(readProgress);
  const completedCount = progress.completed.filter((id) => id <= a1Lessons.length).length;
  const progressPercent = Math.round((completedCount / a1Lessons.length) * 100);
  const nextLesson = a1Lessons.find((lesson) => !progress.completed.includes(lesson.id)) || a1Lessons[a1Lessons.length - 1];

  return (
    <div className="learn-page">
      <header className="learn-hero">
        <div>
          <p className="learn-kicker">Curs de norvegiană</p>
          <h1>Învață norvegiana pas cu pas</h1>
          <p>Un traseu practic pentru vorbitorii de română, cu vocabular, explicații, dialoguri și exerciții după fiecare lecție.</p>
        </div>
        <div className="learn-progress" aria-label={`Progres A1: ${progressPercent}%`}>
          <div className="learn-progress__top"><span>Progres nivel A1</span><strong>{progressPercent}%</strong></div>
          <div className="learn-progress__track"><span style={{ width: `${progressPercent}%` }} /></div>
          <small>{completedCount} din {a1Lessons.length} lecții finalizate</small>
        </div>
      </header>

      <section className="continue-card">
        <div className="continue-card__number">{nextLesson.number}</div>
        <div className="continue-card__content">
          <span>Recomandat pentru tine</span>
          <h2>{nextLesson.title}</h2>
          <p>{nextLesson.description}</p>
        </div>
        <Link className="learn-button" to={`/curs/a1/${nextLesson.id}`}>{completedCount ? 'Continuă lecția' : 'Începe cursul'} →</Link>
      </section>

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

        {activeLevel === 'A1' ? (
          <div className="course-block">
            <div className="course-block__header"><div><span className="level-pill">A1 · Începător</span><h2>Bazele limbii norvegiene</h2><p>La final vei putea purta conversații simple în situații cotidiene.</p></div><div className="course-stats"><span><strong>5</strong> lecții</span><span><strong>~95</strong> minute</span><span><strong>74</strong> cuvinte</span></div></div>
            <div className="lesson-list">
              {a1Lessons.map((lesson) => {
                const completed = progress.completed.includes(lesson.id);
                const unlocked = true;
                return (
                  <article className={`course-lesson ${!unlocked ? 'course-lesson--locked' : ''}`} key={lesson.id}>
                    <div className="course-lesson__number">{completed ? '✓' : lesson.number}</div>
                    <div className="course-lesson__body"><div className="course-lesson__meta"><span>{lesson.duration}</span><span>{lesson.vocabulary} cuvinte</span>{completed && <span className="completed-label">Finalizată</span>}</div><h3>{lesson.title}</h3><p>{lesson.description}</p><div className="topic-list">{lesson.topics.map((topic) => <span key={topic}>{topic}</span>)}</div></div>
                    {unlocked ? <Link className="lesson-action" to={`/curs/a1/${lesson.id}`} aria-label={`Deschide lecția ${lesson.title}`}>Deschide →</Link> : <span className="lesson-locked"><span role="img" aria-label="Blocat">🔒</span> Termină lecția anterioară</span>}
                  </article>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="coming-level"><span>{activeLevel}</span><h2>Programa acestui nivel este în pregătire</h2><p>Finalizează nivelul A1. Lecțiile pentru {activeLevel} vor fi adăugate într-o etapă viitoare.</p><button type="button" onClick={() => setActiveLevel('A1')}>Vezi cursul A1</button></div>
        )}
      </section>

      <section className="learning-tools" id="instrumente">
        <div><p className="learn-kicker">Studiază mai eficient</p><h2>Instrumente de învățare</h2><p className="learning-tools__intro">Folosește-le când vrei să repeți o anumită abilitate în afara lecțiilor.</p></div>
        <div className="learning-tools__grid"><Link to="/recapitulare"><span role="img" aria-hidden="true">🧠</span><strong>Recapitulare rapidă</strong><small>Repetă automat răspunsurile dificile.</small></Link><Link to="/pronuntie"><span role="img" aria-hidden="true">🔊</span><strong>Pronunție</strong><small>Ascultă și repetă sunetele.</small></Link><Link to="/challenge30"><span role="img" aria-hidden="true">📅</span><strong>Provocarea verbelor</strong><small>90 de verbe în 30 de zile.</small></Link></div>
      </section>

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
