import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { speakNorwegian } from '../../../services/norwegianSpeech';
import './LessonGrammar.css';
import './GrammarFocus.css';

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

const pagesOf = (text, limit = 340) => {
  const words = (text || '').split(/\s+/).filter(Boolean);
  const pages = [];
  for (const word of words) {
    if (!pages.length || pages[pages.length - 1].length + word.length > limit) pages.push(word);
    else pages[pages.length - 1] += ` ${word}`;
  }
  return pages.length ? pages : [''];
};

export default function LessonGrammar({ lesson, onBack, onContinue }) {
  const controller = useRef(null);
  const [playing, setPlaying] = useState(null);
  const [audioError, setAudioError] = useState('');
  const [pointIndex, setPointIndex] = useState(0);
  const [exampleIndex, setExampleIndex] = useState(0);
  const [view, setView] = useState('rule');
  const [optional, setOptional] = useState(null);
  const [page, setPage] = useState(0);
  const [readingAnswer, setReadingAnswer] = useState('');
  const [showReadingAnswer, setShowReadingAnswer] = useState(false);
  const titleRef = useRef(null);
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
  const point = optional === 'recall' ? lesson.grammar.recall : lesson.grammar.points[pointIndex];
  const explanationPages = pagesOf(view === 'contrast' ? point.contrast.explanation : point.explanation, view === 'contrast' ? 220 : 280);
  const readingPages = pagesOf(lesson.reading?.text, 420);
  const isReading = optional === 'reading';
  const readingQuestion = isReading && page === readingPages.length;
  const change = (action) => {
    stop(); setAudioError(''); action(); titleRef.current?.focus();
  };
  const changePoint = (index) => change(() => { setOptional(null); setPointIndex(index); setExampleIndex(0); setPage(0); setView('rule'); });
  const changeView = (nextView) => change(() => { setView(nextView); setPage(0); });
  const openOptional = (nextOptional) => change(() => { setOptional(nextOptional); setPage(0); setView('rule'); setExampleIndex(0); });
  const back = () => {
    if (optional) { openOptional(null); return; }
    if (view === 'contrast') { changeView('rule'); return; }
    if (page > 0) { change(() => setPage(page - 1)); return; }
    if (pointIndex > 0) changePoint(pointIndex - 1);
    else change(() => onBack?.());
  };
  const next = () => {
    if (optional === 'recall') {
      if (pointIndex < lesson.grammar.points.length - 1) changePoint(pointIndex + 1);
      else change(() => onContinue?.());
      return;
    }
    if (isReading) {
      if (page < readingPages.length) change(() => setPage(page + 1));
      else openOptional(null);
      return;
    }
    if (page < explanationPages.length - 1) { change(() => setPage(page + 1)); return; }
    if (view === 'contrast') { changeView('rule'); return; }
    if (optional) { openOptional(null); return; }
    if (pointIndex < lesson.grammar.points.length - 1) changePoint(pointIndex + 1);
    else change(() => onContinue?.());
  };
  const nextLabel = optional === 'recall' ? (pointIndex < lesson.grammar.points.length - 1 ? 'Următorul reper' : 'Continuă la exerciții')
    : isReading ? (readingQuestion ? 'Înapoi la regulă' : page === readingPages.length - 1 ? 'Întrebarea de lectură' : 'Pagina următoare')
    : page < explanationPages.length - 1 ? 'Continuă explicația'
      : view === 'contrast' || optional ? 'Înapoi la regulă'
        : pointIndex < lesson.grammar.points.length - 1 ? 'Următorul reper' : 'Continuă la exerciții';
  const example = point.examples[exampleIndex];
  return <div className="lesson-grammar lesson-grammar--focused" data-lesson={lesson.uid}>
    <article className="lesson-grammar__card" data-concept={isReading ? 'reading' : point.concept}>
      {optional === 'recall' && <button type="button" className="grammar-focus__return" onClick={() => openOptional(null)}><span aria-hidden="true">←</span> Înapoi la regulă</button>}
      <div className="lesson-grammar__meta"><span>{isReading ? 'Lectură opțională' : optional ? 'Reamintire opțională' : `Reperul ${pointIndex + 1} din ${lesson.grammar.points.length}`}</span><small>{isReading ? `${Math.min(page + 1, readingPages.length)} / ${readingPages.length}` : point.kind === 'usage' ? 'Exprimare și sens' : 'Gramatică'}</small></div>
      <h2 ref={titleRef} tabIndex={-1}>{isReading ? lesson.reading.title : point.title}</h2>
      {!isReading && <SourceLesson source={point.sourceLesson} />}
      {isReading ? <>
        {!readingQuestion ? <p className="grammar-focus__reading" lang="nb">{readingPages[page]}</p> : <div className="grammar-focus__question">
          <p lang={lesson.reading.questionLanguage}>{lesson.reading.question}</p>
          <label htmlFor="grammar-reading-answer">Răspunsul tău</label>
          <textarea id="grammar-reading-answer" rows={3} value={readingAnswer} onChange={(event) => setReadingAnswer(event.target.value)} />
          <button type="button" aria-expanded={showReadingAnswer} onClick={() => setShowReadingAnswer(!showReadingAnswer)}>{showReadingAnswer ? 'Ascunde reperul' : 'Compară cu un răspuns-reper'}</button>
          {showReadingAnswer && <div className="grammar-focus__reading-answer"><strong lang={lesson.reading.answerLanguage}>{lesson.reading.answer}</strong><p>{lesson.reading.explanation}</p></div>}
        </div>}
        {page > 0 && <button type="button" className="grammar-focus__link" onClick={() => change(() => setPage(page - 1))}>← Pagina anterioară</button>}
      </> : view === 'contrast' ? <>
        <div className="grammar-focus__contrast">
          <div className="lesson-grammar__before"><small>{point.kind === 'grammar' ? 'De corectat' : 'Formularea inițială'}</small><p lang="nb">{point.contrast.before}</p></div>
          <div className="lesson-grammar__after"><small>{point.kind === 'grammar' ? 'Forma corectă' : 'În contextul lecției'}</small><p lang="nb"><GrammarHighlight text={point.contrast.after} focus={point.focus} /></p></div>
          <p className="lesson-grammar__reason">{explanationPages[page]}</p>
        </div>
        <button type="button" className="grammar-focus__link" onClick={() => changeView('rule')}>← Înapoi la regulă</button>
      </> : <>
        <p className="lesson-grammar__explanation">{explanationPages[page]}</p>
        <div className="lesson-grammar__example">
          <div><p lang="nb"><GrammarHighlight text={example.norwegian} focus={point.focus} /></p><p lang="ro">{example.romanian}</p></div>
          {audio(`${optional || pointIndex}-${exampleIndex}`, example.norwegian)}
        </div>
      </>}
      {!isReading && explanationPages.length > 1 && <div className="grammar-focus__pages"><button type="button" disabled={page === 0} onClick={() => change(() => setPage(page - 1))}>←</button><span>Explicație {page + 1} / {explanationPages.length}</span><button type="button" disabled={page === explanationPages.length - 1} onClick={() => change(() => setPage(page + 1))}>→</button></div>}
    </article>
    {!optional && <aside className="grammar-focus__extras" aria-label="Materiale opționale">
      {lesson.grammar.recall && <button type="button" onClick={() => openOptional('recall')}>Reamintire <span>Opțional</span></button>}
      {lesson.reading && <button type="button" onClick={() => openOptional('reading')}>Lectură <span>Opțional</span></button>}
    </aside>}
    {audioError && <p className="lesson-grammar__audio-error" role="status">{audioError}</p>}
    <nav className="grammar-focus__navigation" aria-label="Navigare gramatică">
      <button type="button" onClick={back}>← Înapoi</button>
      <button type="button" className="grammar-focus__primary" onClick={next}>{nextLabel} →</button>
    </nav>
  </div>;
}
