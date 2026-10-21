import React, { useEffect, useRef, useState } from 'react';
import { speakNorwegian } from '../../../services/norwegianSpeech';
import { SpeakerAvatar, getDialogueVoice } from './lessonParts';
import './DialogueWalkthrough.css';

const SOUND_KEY = 'nordlingo-dialogue-muted';

export default function DialogueWalkthrough({ dialogue, children }) {
  const [started, setStarted] = useState(false);
  const [practice, setPractice] = useState(false);
  const [scene, setScene] = useState(0);
  const [active, setActive] = useState(null);
  const [translations, setTranslations] = useState({});
  const [error, setError] = useState('');
  const [muted, setMuted] = useState(() => {
    try { return localStorage.getItem(SOUND_KEY) === 'true'; } catch (_) { return false; }
  });
  const playback = useRef(null);
  const total = Math.ceil(dialogue.length / 2);
  const stop = () => { playback.current?.abort(); setActive(null); };
  useEffect(() => () => playback.current?.abort(), []);

  const play = async (page, soundOff = muted) => {
    stop();
    setError('');
    if (soundOff) return;
    const controller = new AbortController();
    playback.current = controller;
    try {
      for (let index = page * 2; index < Math.min(page * 2 + 2, dialogue.length); index += 1) {
        if (controller.signal.aborted) return;
        const [speaker, text] = dialogue[index];
        const result = await speakNorwegian(text, {
          voice: getDialogueVoice(speaker, index), slow: true, waitForEnd: true,
          signal: controller.signal, onPlaybackStart: () => {
            if (!controller.signal.aborted) setActive(index);
          },
        });
        if (controller.signal.aborted) return;
        setActive(null);
        if (!result.ok) {
          setError('Sunetul nu a pornit. Apasă Reascultă pentru a încerca din nou.');
          return;
        }
        if (index + 1 < Math.min(page * 2 + 2, dialogue.length)) {
          await new Promise(resolve => {
            const done = () => { clearTimeout(timer); controller.signal.removeEventListener('abort', done); resolve(); };
            const timer = setTimeout(done, 450);
            controller.signal.addEventListener('abort', done, { once: true });
          });
        }
      }
    } catch (_) {
      if (!controller.signal.aborted) setError('Sunet indisponibil. Poți continua să citești sau să reîncerci.');
    } finally {
      if (!controller.signal.aborted) setActive(null);
    }
  };

  const changeScene = (page) => {
    setScene(page);
    setTranslations({});
    void play(page);
  };
  const toggleSound = () => {
    const value = !muted;
    setMuted(value);
    try { localStorage.setItem(SOUND_KEY, String(value)); } catch (_) { /* Optional preference. */ }
    if (value) stop();
    else if (started && !practice) void play(scene, false);
  };

  if (practice) return <div className="dialogue-walkthrough"><button type="button" className="dw-link" onClick={() => { setPractice(false); }}>← Revezi conversația</button>{children}</div>;

  return <section className="dialogue-walkthrough" aria-label="Urmărește conversația">
    <header className="dw-header"><div><span className="dw-counter">{started ? `Scena ${scene + 1} din ${total}` : 'Ascultă și observă'}</span><h2>Urmărește conversația</h2></div>
      <button type="button" className="dw-sound" onClick={toggleSound} aria-label={muted ? 'Activează sunetul' : 'Oprește sunetul'} aria-pressed={!muted} title={muted ? 'Activează sunetul' : 'Oprește sunetul'}>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4Z"/>{muted ? <path d="m16 9 5 6m0-6-5 6"/> : <><path d="M15 8a6 6 0 0 1 0 8"/><path d="M18 5a10 10 0 0 1 0 14"/></>}</svg>
      </button>
    </header>
    {!started ? <div className="dw-start"><p>Urmărește câte două replici. Treci mai departe în ritmul tău.</p><button type="button" className="dw-primary" onClick={() => { setStarted(true); void play(scene); }}>Urmărește conversația</button></div> : <>
      <div className="dw-lines">{dialogue.slice(scene * 2, scene * 2 + 2).map(([speaker, text, translation], offset) => {
        const index = scene * 2 + offset;
        return <article key={index} className={`dw-line ${active === index ? 'is-speaking' : ''}`}>
          <div className="dw-speaker"><SpeakerAvatar voice={getDialogueVoice(speaker, index)}/><strong>{speaker}</strong>{active === index && <span className="dw-speaking">Se aude acum</span>}</div>
          <p lang="nb">{text}</p>
          <button type="button" className="dw-link" aria-expanded={!!translations[index]} onClick={() => { if (!translations[index]) stop(); setTranslations(current => ({ ...current, [index]: !current[index] })); }}>{translations[index] ? 'Ascunde traducerea' : 'În română'}</button>
          {translations[index] && <p className="dw-translation" lang="ro">{translation}</p>}
        </article>;
      })}</div>
      {error && <p role="status" className="dw-error">{error}</p>}
      <footer className="dw-controls"><button type="button" className="dw-link" disabled={scene === 0} onClick={() => changeScene(scene - 1)}>Înapoi</button><button type="button" className="dw-link" disabled={muted} onClick={() => { setTranslations({}); void play(scene); }}>↻ Reascultă</button>
        <button type="button" className="dw-primary" onClick={() => { if (scene + 1 < total) changeScene(scene + 1); else { stop(); setPractice(true); } }}>{scene + 1 < total ? 'Mai departe' : 'Exersează în text'}</button>
      </footer>
    </>}
  </section>;
}
