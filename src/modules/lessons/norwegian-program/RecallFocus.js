import React, { useEffect, useRef, useState } from 'react';
import { speakNorwegian } from '../../../services/norwegianSpeech';
import './RecallFocus.css';

export default function RecallFocus({ lesson, onContinue, onBack }) {
  const items = lesson.recycledVocabulary;
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState('');
  const audio = useRef(null);
  const heading = useRef(null);
  const done = index >= items.length;
  useEffect(() => () => audio.current?.abort(), []);
  const stop = () => { audio.current?.abort(); audio.current = null; setPlaying(false); };
  const play = async () => {
    if (playing) { stop(); return; }
    const controller = new AbortController();
    audio.current = controller;
    setPlaying(true); setError('');
    try {
      const result = await speakNorwegian(items[index].entry[0], { signal: controller.signal, waitForEnd: true });
      if (!controller.signal.aborted && result?.ok === false && !result.cancelled) setError('Sunetul nu a putut fi redat. Încearcă din nou.');
    } catch (_) {
      if (!controller.signal.aborted) setError('Sunetul nu a putut fi redat. Încearcă din nou.');
    } finally {
      if (audio.current === controller) { audio.current = null; setPlaying(false); }
    }
  };
  const changeExpression = (nextIndex) => {
    if (nextIndex < 0 || nextIndex >= items.length) return;
    stop(); setError(''); setRevealed(false); setIndex(nextIndex);
  };
  const leave = (callback) => { stop(); callback?.(); };
  return <section className="recall-focus" aria-label="Înainte de ceva nou">
    <header className="recall-focus__heading">
      <span className="recall-focus__eyebrow">{items.length ? 'O scurtă reamintire' : 'Prima ta lecție'}</span>
      <h1 ref={heading} tabIndex={-1}>{!items.length ? 'Începem de la zero' : done ? 'Ești gata pentru ceva nou' : 'Îți amintești?'}</h1>
      <p>{!items.length ? 'Nu trebuie să știi deja norvegiană.' : done ? 'Acum construim pe ceea ce știi deja.' : 'Spune sensul, apoi descoperă traducerea.'}</p>
    </header>
    {!done ? <>
      <div className="recall-focus__progress" aria-live="polite"><span>Expresia {index + 1} din {items.length}</span><div aria-hidden="true">{items.map((_, i) => <i key={i} className={i < index ? 'is-done' : i === index ? 'is-current' : ''} />)}</div></div>
      <article className="recall-focus__card">
        <span className="recall-focus__source">Din lecția „{items[index].lessonTitle}”</span>
        <h2 lang="nb">{items[index].entry[0]}</h2>
        <button className="recall-focus__audio" type="button" onClick={play} aria-label={playing ? 'Oprește sunetul' : 'Ascultă expresia'} aria-pressed={playing}>
          <svg viewBox="0 0 24 24" aria-hidden="true">{playing ? <path d="M7 5h4v14H7zm6 0h4v14h-4z" /> : <path d="M3 9v6h4l5 4V5L7 9H3zm12-2v10c3-2 3-8 0-10z" />}</svg>
        </button>
        <div className="recall-focus__answer" aria-live="polite">
          {revealed ? <p lang="ro">{items[index].entry[1]}</p> : <button type="button" onClick={() => setRevealed(true)}>Arată sensul <span aria-hidden="true">↓</span></button>}
        </div>
        <nav className="recall-focus__expressions" aria-label="Navigare expresii">
          <button type="button" disabled={index === 0} onClick={() => changeExpression(index - 1)} aria-label="Expresia precedentă">←</button>
          <span aria-live="polite">{index + 1} / {items.length}</span>
          {index < items.length - 1 && <button type="button" onClick={() => changeExpression(index + 1)} aria-label="Expresia următoare">→</button>}
        </nav>
      </article>
    </> : <article className="recall-focus__card recall-focus__summary">
      <span className="recall-focus__badge" aria-hidden="true">{items.length ? '✓' : '→'}</span>
      <h2>{items.length ? 'Reamintire încheiată' : 'Construim prima ta bază'}</h2>
      <p>{!items.length ? 'Descoperi primele expresii la pasul următor, apoi le folosești în exemple și conversații.' : 'Ai reamintit toate expresiile. Continuăm cu vocabularul lecției.'}</p>
    </article>}
    {error && <p className="recall-focus__error" role="status">{error}</p>}
    <footer className="recall-focus__footer"><button type="button" onClick={() => leave(onBack)}>← Înapoi</button><button type="button" className="recall-focus__primary" onClick={() => leave(onContinue)}>Continuă →</button></footer>
  </section>;
}
