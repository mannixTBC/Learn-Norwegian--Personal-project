import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { speakNorwegian } from '../../../services/norwegianSpeech';
import { CurriculumReading } from './CurriculumPractice';
import './LessonGrammar.css';

export const grammarStepDescription = (lesson) => lesson.grammar.mode === 'review'
  ? 'Reiei trei repere din secțiune și le folosești împreună în exerciții.'
  : 'Două repere practice. Observă exemplele, ascultă-le și compară formulările.';

export const GrammarHighlight = ({ text, focus = [] }) => {
  const terms = [...new Set(focus.filter(Boolean))].sort((a, b) => b.length - a.length);
  if (!terms.length) return text;
  const pattern = terms.map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
  const parts = text.split(new RegExp(`(?<![\\p{L}\\p{N}])(${pattern})(?![\\p{L}\\p{N}])`, 'giu'));
  return parts.map((part, index) => terms.some((term) => term.toLocaleLowerCase('nb-NO') === part.toLocaleLowerCase('nb-NO'))
    ? <mark key={index}>{part}</mark> : part);
};

const SourceLesson = ({ source }) => source ? <Link className="lesson-grammar__source" to={`/curs/${source.level.toLowerCase()}/${source.id}`}>Din {source.level} · Lecția {source.id}: {source.title}</Link> : null;

export default function LessonGrammar({ lesson }) {
  const controller = useRef(null);
  const [playing, setPlaying] = useState(null);
  const [audioError, setAudioError] = useState('');
  useEffect(() => () => controller.current?.abort(), [lesson.uid]);
  const stop = () => {
    controller.current?.abort();
    controller.current = null;
    setPlaying(null);
  };
  const play = async (id, text) => {
    if (playing === id) { stop(); return; }
    controller.current?.abort();
    const current = new AbortController();
    controller.current = current;
    setPlaying(id);
    setAudioError('');
    try {
      const result = await speakNorwegian(text, { signal: current.signal, waitForEnd: true });
      if (!current.signal.aborted && result?.ok === false && !result.cancelled) setAudioError('Exemplul nu a putut fi redat. Încearcă din nou.');
    } catch (_) {
      if (!current.signal.aborted) setAudioError('Exemplul nu a putut fi redat. Încearcă din nou.');
    } finally {
      if (controller.current === current) { controller.current = null; setPlaying(null); }
    }
  };
  const audio = (id, text) => <button type="button" className={`lesson-grammar__audio${playing === id ? ' is-playing' : ''}`} aria-label={playing === id ? `Oprește: ${text}` : `Ascultă: ${text}`} aria-pressed={playing === id} onClick={() => play(id, text)}>
    {playing === id ? <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5h3v14H8zm5 0h3v14h-3z" /></svg> : <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 11 7-11 7zM5 5h2v14H5z" /></svg>}
  </button>;
  const card = (point, index, review = false) => <article className={`lesson-grammar__card${review ? ' lesson-grammar__card--recall' : ''}`} key={`${point.concept}-${index}`} data-concept={point.concept}>
    <div className="lesson-grammar__meta"><span>{review ? 'Reamintire' : `${index + 1} din ${lesson.grammar.points.length}`}</span><small>{point.kind === 'usage' ? 'Exprimare și sens' : 'Gramatică'}</small></div>
    <h2>{point.title}</h2>
    <SourceLesson source={point.sourceLesson} />
    <p className="lesson-grammar__explanation">{point.explanation}</p>
    <div className="lesson-grammar__examples">{point.examples.map((example, exampleIndex) => <div className="lesson-grammar__example" key={`${example.norwegian}-${exampleIndex}`}>
      <div><p lang="nb"><GrammarHighlight text={example.norwegian} focus={point.focus} /></p><p lang="ro">{example.romanian}</p></div>
      {audio(`${review ? 'recall' : index}-${exampleIndex}`, example.norwegian)}
    </div>)}</div>
    <details className="lesson-grammar__contrast" onToggle={(event) => { if (!event.currentTarget.open) stop(); }}>
      <summary>Compară formulările<span aria-hidden="true">⌄</span></summary>
      <div className="lesson-grammar__before"><small>{point.kind === 'grammar' ? 'De corectat' : 'Formularea inițială'}</small><p lang="nb">{point.contrast.before}</p></div>
      <div className="lesson-grammar__after"><small>{point.kind === 'grammar' ? 'Forma corectă' : 'În contextul lecției'}</small><p lang="nb"><GrammarHighlight text={point.contrast.after} focus={point.focus} /></p></div>
      <p className="lesson-grammar__reason">{point.contrast.explanation}</p>
    </details>
  </article>;

  return <div className="lesson-grammar" data-lesson={lesson.uid}>
    {lesson.grammar.points.map((point, index) => card(point, index))}
    {lesson.grammar.recall && <details className="lesson-grammar__optional" onToggle={(event) => { if (!event.currentTarget.open) stop(); }}>
      <summary><span><small>Opțional · Dintr-o lecție anterioară</small>Îți amintești? {lesson.grammar.recall.title}</span><span aria-hidden="true">⌄</span></summary>
      {card(lesson.grammar.recall, 0, true)}
    </details>}
    {lesson.reading && <details className="lesson-grammar__optional lesson-grammar__reading">
      <summary><span><small>Opțional · Aprofundare</small>Lectură aplicată</span><span aria-hidden="true">⌄</span></summary>
      <CurriculumReading key={lesson.uid} lesson={lesson} />
    </details>}
    {audioError && <p className="lesson-grammar__audio-error" role="status">{audioError}</p>}
    <p className="lesson-grammar__next">Urmează exercițiile: aplici reperele învățate în această lecție.</p>
  </div>;
}
