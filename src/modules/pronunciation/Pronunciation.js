import React, { useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { courseCatalog } from '../lessons/norwegian-program/lessonContent';
import { getLearningLevel } from '../lessons/learningLevel';
import { speakPronunciationModel } from '../../services/azurePronunciationSpeech';
import { ExerciseLayout, ExerciseLessonSelect } from '../exercises/ExerciseUI';
import PronunciationLab from './PronunciationLab';
import './Pronunciation.css';

const PronunciationSession = ({ level }) => {
  const course = courseCatalog[level];
  const [activeLesson, setActiveLesson] = useState('1');
  const [activePhrase, setActivePhrase] = useState(0);
  const lesson = course.lessons.find((item) => item.id === Number(activeLesson)) || course.lessons[0];
  const phrases = useMemo(() => lesson.vocabulary.map(([word, meaning, example, translation]) => ({ word, meaning, example, translation })), [lesson]);
  const chooseLesson = (id) => { setActiveLesson(id); setActivePhrase(0); };
  const openPhrase = (index) => {
    setActivePhrase(index);
    if (typeof document !== 'undefined') document.getElementById('pronunciation-lab-title')?.scrollIntoView?.({ behavior: 'smooth', block: 'start' });
  };
  return <ExerciseLayout className="pronuntie" level={level} title="Pronunție" description="Ascultă o frază, repet-o și exersează în ritmul tău." icon="pronunciation" allowLevelChange>
    <section className="pronuntie__selection"><ExerciseLessonSelect course={course} value={activeLesson} onChange={chooseLesson} label="Alege lecția" all={false} /><div className="pronuntie__phrase-bar" aria-label="Navigare între expresii"><button type="button" onClick={() => setActivePhrase((index) => Math.max(0, index - 1))} disabled={activePhrase === 0} aria-label="Expresia anterioară">←</button><span aria-live="polite"><strong>Expresia {activePhrase + 1}</strong><small>din {phrases.length} · Lecția {lesson.id}</small></span><button type="button" onClick={() => setActivePhrase((index) => Math.min(phrases.length - 1, index + 1))} disabled={activePhrase === phrases.length - 1} aria-label="Expresia următoare">→</button></div></section>
    <PronunciationLab key={level + '-' + lesson.uid + '-' + activePhrase} phrase={phrases[activePhrase]} phraseIndex={activePhrase} level={level} lessonId={lesson.id} />
    <details className="pronuntie__library"><summary>Toate cele {phrases.length} expresii ale lecției</summary><div className="pronuntie__grid">{phrases.map((item, index) => <article className={'pronuntie__phrase ' + (activePhrase === index ? 'is-active' : '')} key={index}><div><span>Expresia {index + 1}</span><strong lang="nb">{item.word}</strong><small>{item.meaning}</small></div><p lang="nb">{item.example}</p><div className="pronuntie__actions"><button type="button" onClick={() => speakPronunciationModel(item.example)} aria-label={'Ascultă ' + item.example}>Ascultă</button><button type="button" onClick={() => openPhrase(index)} aria-pressed={activePhrase === index}>Exersează</button></div></article>)}</div></details>
  </ExerciseLayout>;
};
const Pronunciation = () => {
  const location = useLocation();
  const level = getLearningLevel(location.search);
  return <PronunciationSession key={level} level={level} />;
};
export default Pronunciation;
