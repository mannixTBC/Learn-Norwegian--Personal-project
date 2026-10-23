import React, { useEffect, useRef } from 'react';
import './VocabularyNotebook.css';

function Book() {
  return <svg viewBox="0 0 32 28" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="M16 6Q9 1 2 4v21q7-3 14 1 7-4 14-1V4q-7-3-14 2Zm0 0v20" /></svg>;
}

export default function VocabularyNotebook({ level, question, current, total, headingRef, answer, setAnswer, checked, correct, completeAnswer, onVerify, onNext, onExit, onSpeak }) {
  const outcome = useRef(null);
  const feedback = useRef(null);
  const choice = question.type === 'choice';
  useEffect(() => {
    if (!checked) return;
    feedback.current?.focus({ preventScroll: true });
    outcome.current?.scrollIntoView?.({ block: 'nearest' });
  }, [checked]);
  return <div className="vocabulary-notebook">
    <header className="vn-header"><button type="button" onClick={onExit} aria-label="Înapoi la jocuri">←</button><h1>Vocabular</h1><span aria-label={'Nivel ' + level}>{level}</span></header>
    <section className="vn-sheet" aria-label="Carnetul de cuvinte">
      <div className="vn-stage">Cuvântul {current + 1} din {total}</div>
      <progress className="vn-progress" value={current + (checked ? 1 : 0)} max={total} aria-label="Cuvinte parcurse" />
      <div className="vn-word"><Book /><small>{choice ? 'Norvegiană' : 'Tradu în norvegiană'}</small><h2 ref={headingRef} tabIndex={-1} lang={choice ? 'nb' : 'ro'}>{choice ? question.word : question.translation}</h2>{choice && <button type="button" onClick={onSpeak} aria-label="Ascultă pronunția în norvegiană"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="m11 4-6 5H2v6h3l6 5ZM15 8q4 4 0 8m3-11q7 7 0 14" /></svg>Ascultă</button>}</div>
      <h3 className="vn-question">{choice ? 'Ce înseamnă acest cuvânt?' : 'Cum spui în norvegiană?'}</h3>
      <p className="vn-hint" id="vn-instruction">{checked ? 'Citește explicația, apoi continuă.' : choice ? 'Atinge răspunsul pentru verificare.' : 'Scrie răspunsul, apoi verifică.'}</p>
      {choice ? <div className="vn-choices" role="group" aria-label="Alege sensul" aria-describedby="vn-instruction">{question.options.map((option, index) => {
        const state = checked ? option === question.answer ? 'correct' : option === answer ? 'wrong' : '' : '';
        return <button type="button" key={option} className={state} disabled={checked} aria-pressed={answer === option} onClick={() => onVerify(option)}><span className="vn-letter" aria-hidden="true">{String.fromCharCode(65 + index)}</span><span className="vn-option-text">{option}</span>{state && <small><b aria-hidden="true">{state === 'correct' ? '✓' : '×'}</b>{state === 'correct' ? 'Corect' : 'Ai ales'}</small>}</button>;
      })}</div> : <form className="vn-answer" onSubmit={event => { event.preventDefault(); if (!checked && completeAnswer) onVerify(); }}><label htmlFor="vn-answer">Răspunsul tău</label><input id="vn-answer" lang="nb" value={answer} onChange={event => setAnswer(event.target.value)} disabled={checked} autoComplete="off" autoCapitalize="none" spellCheck={false} placeholder="Scrie aici…" /><button className="vn-continue" type="submit" disabled={checked || !completeAnswer}>Verifică →</button></form>}
      <div ref={outcome} className="vn-outcome">{checked ? <>
        <div className="vn-feedback" ref={feedback} tabIndex={-1} role="status"><Book /><div><h3>{correct ? 'Corect! ' : 'Reține: '}<span lang="nb">{question.word}</span> = {question.translation}</h3>{question.example && <p lang="nb">{question.example}</p>}{!correct && <small>Salvat pentru recapitulare.</small>}</div></div>
        <button type="button" className="vn-continue" onClick={onNext}>{current === total - 1 ? 'Vezi rezultatul' : 'Continuă'} <span aria-hidden="true">→</span></button>
      </> : <p className="vn-note">{choice ? 'Poți asculta pronunția oricând.' : 'Un cuvânt nou, un pas înainte.'}</p>}</div>
    </section>
  </div>;
}
