import React, { useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { courseCatalog } from '../lessons/norwegian-program/lessonContent';
import { getLearningLevel, levelName } from '../lessons/learningLevel';
import { speakNorwegian } from '../../services/norwegianSpeech';
import PronunciationLab from './PronunciationLab';
import './Pronunciation.css';
import './PronunciationEnhancements.css';

const Pronunciation = () => {
  const location = useLocation();
  const level = getLearningLevel(location.search);
  const lessons = courseCatalog[level].lessons;
  const [activeLesson, setActiveLesson] = useState(1);
  const [activePhrase, setActivePhrase] = useState(0);
  const phrases = useMemo(() => {
    const lesson = lessons.find((item) => item.id === activeLesson) || lessons[0];
    return lesson.vocabulary.map(([word, meaning, example, translation]) => ({ word, meaning, example, translation }));
  }, [activeLesson, lessons]);
  const selectedPhrase = phrases[activePhrase] || phrases[0];

  const chooseLesson = (lessonId) => {
    setActiveLesson(lessonId);
    setActivePhrase(0);
  };

  const openInLab = (index) => {
    setActivePhrase(index);
    window.requestAnimationFrame(() => {
      const labTitle = document.getElementById('pronunciation-lab-title');
      if (labTitle) labTitle.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  return (
    <div className="pronuntie">
      <Link to="/invata" className="tool-back">← Înapoi la curs</Link>
      <header className="pronuntie__hero">
        <span className="tool-level">{level} · {levelName[level]}</span>
        <p>Pronunție în context</p>
        <h1>Ascultă. Repetă. Vorbește natural.</h1>
        <small>Exersează frazele exacte din cursul {level}. Ascultă ritmul normal, apoi varianta lentă.</small>
      </header>

      <nav className="pronuntie__lessons" aria-label="Alege lecția">
        {lessons.map((lesson) => <button type="button" className={activeLesson === lesson.id ? 'active' : ''} onClick={() => chooseLesson(lesson.id)} key={lesson.id}><span>{String(lesson.id).padStart(2, '0')}</span>{lesson.title}</button>)}
      </nav>

      {selectedPhrase && <PronunciationLab phrase={selectedPhrase} phraseIndex={activePhrase} level={level} lessonId={activeLesson} />}

      <section className="pronuntie__section">
        <div className="pronuntie__section-heading"><div><p>Lecția {activeLesson}</p><h2>Alege următoarea frază</h2></div><span>{phrases.length} expresii</span></div>
        <div className="pronuntie__grid">
          {phrases.map((item, index) => (
            <article className={`pronuntie__phrase ${activePhrase === index ? 'pronuntie__phrase--active' : ''}`} key={`${item.word}-${index}`}>
              <div className="pronuntie__phrase-top"><span>Expresia {String(index + 1).padStart(2, '0')}</span><strong>{item.word}</strong><small>{item.meaning}</small></div>
              <blockquote lang="no">{item.example}</blockquote>
              <p><span>RO</span>{item.translation}</p>
              <div className="pronuntie__actions"><button type="button" onClick={() => speakNorwegian(item.example)} aria-label={`Ascultă: ${item.example}`}><span aria-hidden="true">▶</span> Normal</button><button type="button" onClick={() => speakNorwegian(item.example, { slow: true })} aria-label={`Ascultă lent: ${item.example}`}><span aria-hidden="true">◷</span> Lent</button><button type="button" className="pronuntie__practice-button" onClick={() => openInLab(index)} aria-label={`Exersează în laborator: ${item.example}`}><span aria-hidden="true">●</span> Exersează</button></div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Pronunciation;
