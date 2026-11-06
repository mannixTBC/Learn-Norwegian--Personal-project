import {ui} from '../../../languages/messages.js';
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
      if (!controller.signal.aborted && result?.ok === false && !result.cancelled) setError(ui('ui_cd0352a9922b6d1a'));
    } catch (_) {
      if (!controller.signal.aborted) setError(ui('ui_cd0352a9922b6d1a'));
    } finally {
      if (audio.current === controller) { audio.current = null; setPlaying(false); }
    }
  };
  const changeExpression = (nextIndex) => {
    if (nextIndex < 0 || nextIndex >= items.length) return;
    stop(); setError(''); setRevealed(false); setIndex(nextIndex);
  };
  const leave = (callback) => { stop(); callback?.(); };
  return <section className="recall-focus" aria-label={ui('web_57137cf8183e61e4')}>
    <header className="recall-focus__heading">
      <span className="recall-focus__eyebrow">{items.length ? ui('ui_77da5d5f971b40ce') : ui('ui_945bd535167baf2a')}</span>
      <h1 ref={heading} tabIndex={-1}>{!items.length ? ui('ui_5f9380ea734080ff') : done ? 'Ești gata pentru ceva nou' : ui('ui_bd31973164a0b2e4')}</h1>
      <p>{!items.length ? 'Nu trebuie să știi deja norvegiană.' : done ? 'Acum construim pe ceea ce știi deja.' : 'Spune sensul, apoi descoperă traducerea.'}</p>
    </header>
    {!done ? <>
      <div className="recall-focus__progress" aria-live="polite"><span>{ui('ui_5f8317d29f5a120b')}{index + 1}{ui('ui_dbd8b6478643d623')}{items.length}</span><div aria-hidden="true">{items.map((_, i) => <i key={i} className={i < index ? 'is-done' : i === index ? 'is-current' : ''} />)}</div></div>
      <article className="recall-focus__card">
        <span className="recall-focus__source">{ui('ui_0dc50dce857b8cf4')}{items[index].lessonTitle}”</span>
        <h2 lang="nb">{items[index].entry[0]}</h2>
        <button className="recall-focus__audio" type="button" onClick={play} aria-label={playing ? ui('ui_0b96ca6c1611e29f') : 'Ascultă expresia'} aria-pressed={playing}>
          <svg viewBox="0 0 24 24" aria-hidden="true">{playing ? <path d="M7 5h4v14H7zm6 0h4v14h-4z" /> : <path d="M3 9v6h4l5 4V5L7 9H3zm12-2v10c3-2 3-8 0-10z" />}</svg>
        </button>
        <div className="recall-focus__answer" aria-live="polite">
          {revealed ? <p lang="ro">{items[index].entry[1]}</p> : <button type="button" onClick={() => setRevealed(true)}>{ui('web_c298166454d6ffae')}<span aria-hidden="true">↓</span></button>}
        </div>
        <nav className="recall-focus__expressions" aria-label={ui('web_45c34332d2510f6b')}>
          <button type="button" disabled={index === 0} onClick={() => changeExpression(index - 1)} aria-label={ui('web_eb0bc5a49accc00f')}>←</button>
          <span aria-live="polite">{index + 1} / {items.length}</span>
          {index < items.length - 1 && <button type="button" onClick={() => changeExpression(index + 1)} aria-label={ui('web_cd653fde5a07ab2d')}>→</button>}
        </nav>
      </article>
    </> : <article className="recall-focus__card recall-focus__summary">
      <span className="recall-focus__badge" aria-hidden="true">{items.length ? '✓' : '→'}</span>
      <h2>{items.length ? 'Reamintire încheiată' : ui('ui_9ba7d6ca292d8798')}</h2>
      <p>{!items.length ? ui('ui_29a7f0becaf0a50d') : 'Ai reamintit toate expresiile. Continuăm cu vocabularul lecției.'}</p>
    </article>}
    {error && <p className="recall-focus__error" role="status">{error}</p>}
    <footer className="recall-focus__footer"><button type="button" onClick={() => leave(onBack)}>{ui('web_a354f4064be3dfef')}</button><button type="button" className="recall-focus__primary" onClick={() => leave(onContinue)}>{ui('web_cafe611e1b22d8c7')}</button></footer>
  </section>;
}
