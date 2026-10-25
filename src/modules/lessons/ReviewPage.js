import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getDueReviewItems, getReviewItemsForLevel, readReviewItems, writeReviewItems } from '../../services/spacedReview';
import { recordStudyActivity } from '../../services/learningActivity';
import { speakNorwegian } from '../../services/norwegianSpeech';
import { getLearningLevel } from './learningLevel';
import { courseCatalog } from './norwegian-program/lessonContent';
import NorwegianFlagIcon from '../layout/Navbar/NorwegianFlagIcon';
import './ReviewPage.css';
import ScenarioReview from '../exercises/ScenarioReview.js';

const normalize = value => String(value || '').normalize('NFC').toLowerCase().replace(/[\p{P}\p{S}]/gu, '').replace(/\s+/g, ' ').trim();
const mistakes = items => items.filter(item => item.source !== 'curriculum' || item.lapses > 0);
function content(item, lessons) {
  const answer = normalize(item.answer);
  for (const lesson of lessons.filter(value => !item.lessonId || String(value.id) === String(item.lessonId))) {
    for (const [word, translation] of lesson.vocabulary || []) {
      if (answer === normalize(word) || (answer === normalize(translation) && normalize(item.prompt).includes(normalize(word)))) return { norwegian: word, translation, category: 'Vocabular', note: item.explanation || `${word} = ${translation}` };
    }
    for (const [, norwegian, translation] of lesson.dialogue || []) {
      if (answer === normalize(norwegian)) return { norwegian, translation, category: 'Propoziții', note: item.explanation };
    }
    for (const exercise of lesson.exercises || []) {
      const correct = Array.isArray(exercise.answer) ? exercise.answer.join(' ') : exercise.answer;
      if (exercise.type === 'order' && answer === normalize(correct)) return { norwegian: correct, translation: item.translation || exercise.prompt, category: 'Propoziții', note: exercise.explanation };
    }
  }
  return { norwegian: item.norwegian, translation: item.translation || item.prompt, category: 'Din exercițiile tale', note: item.explanation };
}
function ReviewSession({ level }) {
  const [queue, setQueue] = useState(() => mistakes(getDueReviewItems(level)).slice(0, 6));
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState('');

  const audio = useRef(null);
  const lock = useRef(false);
  const started = useRef(Date.now());
  const current = queue[index];
  const card = current && content(current, courseCatalog[level]?.lessons || []);
  const remaining = mistakes(getReviewItemsForLevel(level));
  useEffect(() => { lock.current = false; setPlaying(false); setError(''); return () => audio.current?.abort(); }, [index, queue]);
  const next = repeat => {
    if (!current || lock.current) return;
    lock.current = true; audio.current?.abort();
    // A view is not a correct answer: preserve mastery and assessment counters.
    writeReviewItems(readReviewItems().map(item => item.id !== current.id ? item : { ...item, lastSeenAt: new Date().toISOString(), reviewViews: (Number(item.reviewViews) || 0) + 1, dueAt: new Date(Date.now() + (repeat ? 1 : 3) * 86400000).toISOString() }));
    if (index === queue.length - 1) recordStudyActivity({ type: 'review', level, reviewed: queue.length, minutes: Math.max(1, Math.round((Date.now() - started.current) / 60000)) });
    setIndex(value => value + 1);
  };
  const listen = async () => {
    if (playing) { audio.current?.abort(); setPlaying(false); return; }
    const controller = new AbortController(); audio.current = controller; setPlaying(true); setError('');
    try { const result = await speakNorwegian(card.norwegian, { signal: controller.signal }); if (result?.ok === false && !controller.signal.aborted) setError('Sunetul nu este disponibil. Încearcă din nou.'); }
    catch (_) { if (!controller.signal.aborted) setError('Sunetul nu este disponibil. Încearcă din nou.'); }
    finally { if (!controller.signal.aborted) setPlaying(false); }
  };
  return <main className="review-page recall-sheet">
    <header className="recall-brand"><Link to={`/jocuri?nivel=${level}`} aria-label="Înapoi la jocuri">←</Link><Link to="/dashboard" aria-label="NordLingo — Acasă"><NorwegianFlagIcon className="recall-logo" /></Link></header>
    <div className="recall-heading"><h1>Recapitulare</h1><p>Reia expresiile care ți-au dat de gândit.</p>{current && <div className="recall-progress"><span>{index + 1} din {queue.length}</span><progress aria-label="Progresul sesiunii" value={index + 1} max={queue.length} /></div>}</div>
    {card ? <><article className="recall-card" key={current.id} aria-live="polite"><span className="recall-category">♧ &nbsp; {card.category}</span><h2>{card.translation}</h2><div className="recall-divider" aria-hidden="true"><span>⌁</span></div><p className="recall-expression" lang={card.norwegian ? 'nb' : undefined}>{card.norwegian || current.answer}</p>{card.norwegian && <button type="button" className="recall-listen" onClick={listen}><svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M11 4 5 9H2v6h3l6 5ZM15 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14" /></svg>{playing ? 'Oprește' : 'Ascultă'}</button>}{error && <small role="status">{error}</small>}{card.note && <aside className="recall-note"><span aria-hidden="true">♧</span><span>{card.note}</span></aside>}</article><div className="recall-actions"><button type="button" onClick={() => next(true)}><span aria-hidden="true">↻</span> Mai repet</button><button type="button" onClick={() => next(false)}>Continuă <span aria-hidden="true">→</span></button></div></> : <section className="recall-card recall-empty"><span className="recall-category">În ritmul tău</span><h2>{queue.length ? `Ai revăzut ${queue.length} expresii.` : 'Expresiile sunt la zi.'}</h2><p>{queue.length ? 'Expresiile marcate „Mai repet” vor reveni mai curând.' : 'Dificultățile din lecții și jocuri se adună aici, pentru a le revedea pe îndelete.'}</p><Link to={`/jocuri?nivel=${level}`}>Înapoi la jocuri →</Link>{remaining.length > 0 && <button type="button" onClick={() => { setQueue(remaining.slice(0, 6)); setIndex(0); started.current = Date.now(); }}>Mai reiau câteva</button>}</section>}
    <ScenarioReview level={level}/>
  </main>;
}
export default function ReviewPage() { const location = useLocation(); const level = getLearningLevel(location.search); return <ReviewSession key={level} level={level} />; }
