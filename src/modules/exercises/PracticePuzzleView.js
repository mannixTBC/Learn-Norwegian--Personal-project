import React from 'react';
import { ExerciseLayout } from './ExerciseUI';
import { ExerciseArtwork, NordicProgress } from './NordicExerciseUI';

export default function PracticePuzzleView({ game, level, info, question, current, total, score, headingRef, answer, setAnswer, selected, setSelected, checked, correct, completeAnswer, onVerify, onNext, onExit, onSpeak }) {
  const isOrder = game === 'order';
  return <ExerciseLayout className={'practice-game practice-game--session ng-puzzle ng-puzzle--' + game} level={level} icon={game} title={info.title} description={info.subtitle} onExit={onExit}>
    <NordicProgress current={current + 1} total={total} detail={`${current + 1} / ${total} · ${score} corecte`} />
    <section className="game-question ng-puzzle-card">
      <ExerciseArtwork kind={game} text={question.word || question.answer} />
      <div className="ng-question-meta"><span>Lecția {question.lessonId} · {level}</span>{!isOrder && <button type="button" className="ng-audio" onClick={onSpeak} aria-label="Ascultă cuvântul în norvegiană"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="m4 9 4 0 5-4v14l-5-4H4zM16 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14" /></svg></button>}</div>
      <h2 ref={headingRef} tabIndex={-1}>{question.prompt}</h2>
      {!isOrder && question.type === 'choice' && <div className="game-choices" role="group" aria-label="Alege răspunsul">{question.options.map(option => {
        const state = checked ? option === question.answer ? 'correct' : answer === option ? 'wrong' : '' : answer === option ? 'selected' : '';
        return <button type="button" disabled={checked} aria-pressed={answer === option} className={state} onClick={() => setAnswer(option)} key={option}><span className="ng-radio" aria-hidden="true">{state === 'correct' ? '✓' : state === 'wrong' ? '×' : answer === option ? '●' : ''}</span><strong>{option}</strong></button>;
      })}</div>}
      {!isOrder && question.type === 'text' && <form className="practice-answer" onSubmit={event => { event.preventDefault(); if (!checked) onVerify(); }}><label htmlFor="practice-answer">Răspunsul tău în norvegiană</label><input id="practice-answer" className="game-input" lang="nb" autoComplete="off" autoCorrect="off" autoCapitalize="none" spellCheck={false} enterKeyHint="done" disabled={checked} value={answer} onChange={event => setAnswer(event.target.value)} placeholder="Scrie aici…" /></form>}
      {isOrder && <>
        <div className="order-zone" aria-label="Propoziția ta"><small>Propoziția ta</small><div>{selected.map((wordIndex, index) => <button type="button" lang="nb" disabled={checked} onClick={() => setSelected(all => all.filter((_, position) => position !== index))} aria-label={'Elimină ' + question.words[wordIndex] + ' din poziția ' + (index + 1)} key={wordIndex}>{question.words[wordIndex]}</button>)}{Array.from({ length: Math.max(0, question.words.length - selected.length) }, (_, index) => <span className="ng-empty-token" key={'empty-' + index} aria-hidden="true" />)}</div></div>
        <div className="order-bank" aria-label="Cuvinte disponibile">{question.words.map((word, index) => <button type="button" lang="nb" disabled={checked || selected.includes(index)} aria-pressed={selected.includes(index)} onClick={() => setSelected(all => all.includes(index) ? all : [...all, index])} key={index}>{word}</button>)}</div>
        <div className="ng-order-tools"><small>Atinge un cuvânt ca să îl muți.</small><button type="button" disabled={checked || !selected.length} onClick={() => setSelected(all => all.slice(0, -1))}>↶ Anulează</button></div>
      </>}
      {checked && <div role="status" className={'game-feedback ' + (correct ? 'correct' : 'wrong')}><span aria-hidden="true">{correct ? '✓' : '↻'}</span><div><h3>{correct ? 'Corect!' : 'Reține pentru data viitoare'}</h3><p>{correct ? question.example || question.explanation || 'Ai găsit răspunsul potrivit.' : 'Răspunsul corect: ' + question.answer}</p></div></div>}
      <footer className="session-actions"><button type="button" className="exercise-primary" disabled={!checked && !completeAnswer} onClick={checked ? onNext : onVerify}>{checked ? current === total - 1 ? 'Vezi rezultatul' : 'Continuă' : isOrder && !completeAnswer ? 'Completează propoziția' : 'Verifică'} <span aria-hidden="true">→</span></button></footer>
    </section>
  </ExerciseLayout>;
}
