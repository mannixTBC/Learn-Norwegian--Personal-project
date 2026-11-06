import {ui} from '../../languages/messages.js';
import React, { useEffect, useRef, useState } from 'react';
import { speakNorwegian } from '../../services/norwegianSpeech';
import './VocabularyNotebook.css';
import NorwegianFlagIcon from '../layout/Navbar/NorwegianFlagIcon';

function Book() {
  return <svg viewBox="0 0 32 28" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="M16 6Q9 1 2 4v21q7-3 14 1 7-4 14-1V4q-7-3-14 2Zm0 0v20" /></svg>;
}

export default function VocabularyNotebook({ level, question, current, total, headingRef, answer, setAnswer, checked, correct, completeAnswer, onVerify, onNext, onExit }) {
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
    if (!checked) return undefined;
    const dialog = feedback.current;
    if (!dialog) return undefined;
    dialog.showModal();
    return () => dialog.close();
  }, [checked, question.id]);
  return <div className="vocabulary-notebook">
    <header className="vn-header"><button type="button" onClick={onExit} aria-label={ui('web_4d841d600c45fb73')}>←</button><NorwegianFlagIcon className="game-brand-logo" /><span className="vn-level" aria-label={ui('ui_1450f9b5ea87b98c') + level}>{level}</span></header>
    <h1 className="vn-game-title">{ui('web_a0f17cbedf66213a')}</h1><section className="vn-sheet" aria-label={ui('web_2186af86dea8c74f')}>
      <div className="vn-flow-top"><div className="vn-stage">{ui('web_19ed038df30235c1')}{current + 1}{ui('ui_dbd8b6478643d623')}{total}</div><button type="button" className="vn-sound-toggle" aria-pressed={!muted} onClick={() => setMuted(value => !value)}>{muted ? 'Sunet oprit' : 'Sunet pornit'}</button></div>
      <progress className="vn-progress" value={current + (checked ? 1 : 0)} max={total} aria-label={ui('web_165f18f56c1d0084')} />
      <ol className="vn-steps" aria-label={ui('web_7dfdbbe4d3d2468d')}>{[['recognize', ui('ui_4f1de8dfcdc075b8')], ['context', 'Completează'], ['recall', ui('ui_b7a0ba760a09458d')]].map(([id, label]) => <li key={id} aria-current={stage === id ? 'step' : undefined}>{label}</li>)}</ol>
      <div className={'vn-word' + (stage === 'context' ? ' vn-word--sentence' : '')}><Book /><small>{stage === 'context' ? 'Cuvântul în context' : choice ? ui('ui_e031b264893791c5') : 'Tradu în norvegiană'}</small><h2 ref={headingRef} tabIndex={-1} lang={choice ? 'nb' : 'ro'}>{stage === 'context' ? checked ? question.example : question.prompt : choice ? question.word : question.translation}</h2>{stage === 'recognize' && <button type="button" onClick={() => audioStatus === 'playing' ? stop() : play()} aria-label={audioStatus === 'playing' ? ui('ui_926e26688b3f621b') : ui('ui_f44b0b599ead02f3')}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="m11 4-6 5H2v6h3l6 5ZM15 8q4 4 0 8m3-11q7 7 0 14" /></svg>{audioStatus === 'playing' ? ui('ui_5a117569814756df') : ui('ui_f44b0b599ead02f3')}</button>}</div>
      {audioStatus === 'error' && <p className="vn-audio-error" role="status">{ui('web_5b1546f7c5d923b4')}<button type="button" onClick={() => play()}>{ui('web_768057ce8d093db5')}</button></p>}
      <h3 className="vn-question">{stage === 'context' ? ui('ui_b89f8ec8099dbfd2') : choice ? 'Ce înseamnă acest cuvânt?' : 'Cum spui în norvegiană?'}</h3>
      <p className="vn-hint" id="vn-instruction">{checked ? 'Citește explicația, apoi continuă.' : stage === 'context' ? <>{ui('web_474d65f09a7eb04a')}<strong>{question.translation}</strong></> : choice ? 'Atinge răspunsul pentru verificare.' : 'Scrie răspunsul, apoi verifică.'}</p>
      {choice ? <div className="vn-choices" role="group" aria-label={ui('ui_4f1de8dfcdc075b8')} aria-describedby="vn-instruction">{question.options.map((option, index) => {
        const state = checked ? option === question.answer ? 'correct' : option === answer ? 'wrong' : '' : '';
        return <button type="button" key={option} className={state} disabled={checked} aria-pressed={answer === option} onClick={() => onVerify(option)}><span className="vn-letter" aria-hidden="true">{String.fromCharCode(65 + index)}</span><span className="vn-option-text">{option}</span></button>;
      })}</div> : <form className="vn-answer" onSubmit={event => { event.preventDefault(); if (!checked && completeAnswer) onVerify(); }}><label htmlFor="vn-answer">{ui('ui_20e6846a345b752a')}</label><input id="vn-answer" lang="nb" value={answer} onChange={event => setAnswer(event.target.value)} disabled={checked} autoComplete="off" autoCorrect="off" autoCapitalize="none" spellCheck={false} enterKeyHint="done" placeholder="Scrie aici…" />{!checked && <><div className="vn-letters" aria-label={ui('web_54c31b5cdecc5f87')}>{['æ', 'ø', 'å'].map(letter => <button key={letter} type="button" aria-label={'Adaugă ' + letter} onClick={() => setAnswer(answer + letter)}>{letter}</button>)}</div><button className="vn-continue" type="submit" disabled={!completeAnswer}>{ui('web_fbe982d19d5d8200')}</button><button type="button" className="vn-reveal" onClick={() => onVerify(null)}>{ui('web_9cb5f7a25002375f')}</button></>}</form>}
      <div className="vn-outcome">{checked ? <dialog ref={feedback} className="vn-feedback-popup" aria-labelledby="vn-feedback-title" aria-describedby="vn-feedback-description" onCancel={event => { event.preventDefault(); onNext(); }}>
        <div className="vn-feedback" id="vn-feedback-description"><Book /><div><h3 id="vn-feedback-title">{correct ? 'Corect! ' : 'Reține: '}<span lang="nb">{question.word}</span> = {question.translation}</h3>{question.example && <p lang="nb">{question.example}</p>}{!correct && <small>{ui('ui_29e294c9b60e8089')}</small>}</div></div>
        {stage !== 'recognize' && <button className="vn-replay" type="button" onClick={() => audioStatus === 'playing' ? stop() : play()}>{audioStatus === 'playing' ? ui('ui_926e26688b3f621b') : stage === 'context' ? 'Ascultă propoziția din nou' : 'Ascultă cuvântul din nou'}</button>}
        <button type="button" className="vn-continue" onClick={onNext} autoFocus>{current === total - 1 ? ui('ui_1834cd8f7b513ef9') : ui('ui_5fc4497d148a38a8')} <span aria-hidden="true">→</span></button>
      </dialog> : <p className="vn-note">{stage === 'recognize' ? 'Vezi cuvântul, ascultă și alege sensul.' : stage === 'context' ? 'Propoziția se aude după verificare.' : 'Încearcă din memorie. Sunetul vine după verificare.'}</p>}</div>
    </section>
  </div>;
}
