import React, { useEffect, useRef, useState } from 'react';
import { speakNorwegian } from '../../services/norwegianSpeech';
import './VocabularyNotebook.css';

function Book() {
  return <svg viewBox="0 0 32 28" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="M16 6Q9 1 2 4v21q7-3 14 1 7-4 14-1V4q-7-3-14 2Zm0 0v20" /></svg>;
}

export default function VocabularyNotebook({ level, question, current, total, headingRef, answer, setAnswer, checked, correct, completeAnswer, onVerify, onNext, onExit }) {
  const outcome = useRef(null);
  const feedback = useRef(null);
  const choice = question.type === 'choice';
  const stage = question.stage || 'recognize';
  const [muted, setMuted] = useState(false);
  const [audioStatus, setAudioStatus] = useState('idle');
  const audio = useRef(null);
  const audioText = stage === 'recognize' ? question.word : checked ? stage === 'context' ? question.example : question.word : null;
  const play = async (text = audioText) => {
    if (!text) return;
    audio.current?.abort();
    const controller = new AbortController();
    audio.current = controller;
    setAudioStatus('playing');
    try {
      const result = await speakNorwegian(text, { signal: controller.signal, waitForEnd: true });
      if (!controller.signal.aborted) setAudioStatus(result?.ok ? 'idle' : 'error');
    } catch (_) {
      if (!controller.signal.aborted) setAudioStatus('error');
    }
  };
  useEffect(() => {
    audio.current?.abort();
    setAudioStatus('idle');
    if (!muted && audioText) void play(audioText);
    return () => audio.current?.abort();
    // A new card or newly revealed sentence is read once, never on answer input.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question.id, audioText, muted]);
  const stop = () => { audio.current?.abort(); setAudioStatus('idle'); };
  useEffect(() => {
    if (!checked) return;
    feedback.current?.focus({ preventScroll: true });
    outcome.current?.scrollIntoView?.({ block: 'nearest' });
  }, [checked]);
  return <div className="vocabulary-notebook">
    <header className="vn-header"><button type="button" onClick={onExit} aria-label="Înapoi la jocuri">←</button><h1>Vocabular</h1><span aria-label={'Nivel ' + level}>{level}</span></header>
    <section className="vn-sheet" aria-label="Carnetul de cuvinte">
      <div className="vn-flow-top"><div className="vn-stage">Pasul {current + 1} din {total}</div><button type="button" className="vn-sound-toggle" aria-pressed={!muted} onClick={() => setMuted(value => !value)}>{muted ? 'Sunet oprit' : 'Sunet pornit'}</button></div>
      <progress className="vn-progress" value={current + (checked ? 1 : 0)} max={total} aria-label="Cuvinte parcurse" />
      <ol className="vn-steps" aria-label="Etapele exercițiului">{[['recognize', 'Alege sensul'], ['context', 'Completează'], ['recall', 'Scrie cuvântul']].map(([id, label]) => <li key={id} aria-current={stage === id ? 'step' : undefined}>{label}</li>)}</ol>
      <div className={'vn-word' + (stage === 'context' ? ' vn-word--sentence' : '')}><Book /><small>{stage === 'context' ? 'Cuvântul în context' : choice ? 'Norvegiană' : 'Tradu în norvegiană'}</small><h2 ref={headingRef} tabIndex={-1} lang={choice ? 'nb' : 'ro'}>{stage === 'context' ? checked ? question.example : question.prompt : choice ? question.word : question.translation}</h2>{stage === 'recognize' && <button type="button" onClick={() => audioStatus === 'playing' ? stop() : play()} aria-label={audioStatus === 'playing' ? 'Oprește redarea' : 'Ascultă din nou'}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="m11 4-6 5H2v6h3l6 5ZM15 8q4 4 0 8m3-11q7 7 0 14" /></svg>{audioStatus === 'playing' ? 'Oprește' : 'Ascultă din nou'}</button>}</div>
      {audioStatus === 'error' && <p className="vn-audio-error" role="status">Sunetul nu a pornit. Poți continua exercițiul.<button type="button" onClick={() => play()}>Reîncearcă sunetul</button></p>}
      <h3 className="vn-question">{stage === 'context' ? 'Ce cuvânt lipsește?' : choice ? 'Ce înseamnă acest cuvânt?' : 'Cum spui în norvegiană?'}</h3>
      <p className="vn-hint" id="vn-instruction">{checked ? 'Citește explicația, apoi continuă.' : stage === 'context' ? <>Completează cu sensul: <strong>{question.translation}</strong></> : choice ? 'Atinge răspunsul pentru verificare.' : 'Scrie răspunsul, apoi verifică.'}</p>
      {choice ? <div className="vn-choices" role="group" aria-label="Alege sensul" aria-describedby="vn-instruction">{question.options.map((option, index) => {
        const state = checked ? option === question.answer ? 'correct' : option === answer ? 'wrong' : '' : '';
        return <button type="button" key={option} className={state} disabled={checked} aria-pressed={answer === option} onClick={() => onVerify(option)}><span className="vn-letter" aria-hidden="true">{String.fromCharCode(65 + index)}</span><span className="vn-option-text">{option}</span>{state && <small><b aria-hidden="true">{state === 'correct' ? '✓' : '×'}</b>{state === 'correct' ? 'Corect' : 'Ai ales'}</small>}</button>;
      })}</div> : <form className="vn-answer" onSubmit={event => { event.preventDefault(); if (!checked && completeAnswer) onVerify(); }}><label htmlFor="vn-answer">Răspunsul tău în norvegiană</label><input id="vn-answer" lang="nb" value={answer} onChange={event => setAnswer(event.target.value)} disabled={checked} autoComplete="off" autoCorrect="off" autoCapitalize="none" spellCheck={false} enterKeyHint="done" placeholder="Scrie aici…" />{!checked && <><div className="vn-letters" aria-label="Litere norvegiene">{['æ', 'ø', 'å'].map(letter => <button key={letter} type="button" aria-label={'Adaugă ' + letter} onClick={() => setAnswer(answer + letter)}>{letter}</button>)}</div><button className="vn-continue" type="submit" disabled={!completeAnswer}>Verifică →</button><button type="button" className="vn-reveal" onClick={() => onVerify(null)}>Nu-mi amintesc</button></>}</form>}
      <div ref={outcome} className="vn-outcome">{checked ? <>
        <div className="vn-feedback" ref={feedback} tabIndex={-1} role="status"><Book /><div><h3>{correct ? 'Corect! ' : 'Reține: '}<span lang="nb">{question.word}</span> = {question.translation}</h3>{question.example && <p lang="nb">{question.example}</p>}{!correct && <small>Salvat pentru recapitulare.</small>}</div></div>
        {stage !== 'recognize' && <button className="vn-replay" type="button" onClick={() => audioStatus === 'playing' ? stop() : play()}>{audioStatus === 'playing' ? 'Oprește redarea' : stage === 'context' ? 'Ascultă propoziția din nou' : 'Ascultă cuvântul din nou'}</button>}
        <button type="button" className="vn-continue" onClick={onNext}>{current === total - 1 ? 'Vezi rezultatul' : 'Continuă'} <span aria-hidden="true">→</span></button>
      </> : <p className="vn-note">{stage === 'recognize' ? 'Vezi cuvântul, ascultă și alege sensul.' : stage === 'context' ? 'Propoziția se aude după verificare.' : 'Încearcă din memorie. Sunetul vine după verificare.'}</p>}</div>
    </section>
  </div>;
}
