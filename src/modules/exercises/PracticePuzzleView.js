import React, { useEffect, useRef } from 'react';
import { ExerciseIcon, ExerciseLayout } from './ExerciseUI';
import { NordicProgress } from './NordicExerciseUI';
import VocabularyNotebook from './VocabularyNotebook';
import SentenceWorkshop from './SentenceWorkshop';

export default function PracticePuzzleView({ game, level, info, question, current, total, score, headingRef, answer, setAnswer, selected, setSelected, checked, correct, completeAnswer, onVerify, onNext, onExit, onSpeak }) {
  const isOrder = game === 'order';
  const instantChoice = !isOrder && question.type === 'choice';
  const feedback = useRef(null);
  const outcome = useRef(null);
  useEffect(() => {
    if (!checked) return;
    feedback.current?.focus({ preventScroll: true });
    outcome.current?.scrollIntoView?.({ block: 'nearest' });
  }, [checked]);
  if (game === 'quiz') return <VocabularyNotebook {...{ level, question, current, total, headingRef, answer, setAnswer, checked, correct, completeAnswer, onVerify, onNext, onExit, onSpeak }} />;
  if (isOrder) return <SentenceWorkshop {...{ level, question, current, total, headingRef, selected, setSelected, checked, correct, completeAnswer, onVerify, onNext, onExit, onSpeak }} />;
  return <ExerciseLayout className={'practice-game practice-game--session ng-puzzle ng-puzzle--' + game} level={level} icon={game} title={info.title} description={info.subtitle} onExit={onExit}>
    <NordicProgress current={current + 1} total={total} detail={`${current + 1} / ${total} · ${score} ${score === 1 ? 'corect' : 'corecte'}`} />
    <section className="game-question ng-puzzle-card">
      <div className="ng-question-meta"><span>Lecția {question.lessonId} · {level}</span><span>{isOrder ? 'CONSTRUIEȘTE' : 'GĂSEȘTE SENSUL'}</span></div>
      <div className="ng-puzzle-prompt">
        <span className="ng-puzzle-symbol" aria-hidden="true"><ExerciseIcon name={game} /></span>
        <h2 ref={headingRef} tabIndex={-1}>{question.prompt}</h2>
        {!isOrder && <button type="button" className="ng-audio" onClick={onSpeak} aria-label="Ascultă cuvântul în norvegiană"><ExerciseIcon name="listen" /><span>Ascultă</span></button>}
      </div>
      {!isOrder && question.type === 'choice' && <>
        <p className="ng-action-hint" id="puzzle-instruction">Atinge răspunsul. Se verifică imediat.</p>
        <div className="game-choices" role="group" aria-label="Alege răspunsul" aria-describedby="puzzle-instruction">{question.options.map((option, index) => {
          const state = checked ? option === question.answer ? 'correct' : answer === option ? 'wrong' : '' : '';
          return <button type="button" disabled={checked} aria-pressed={answer === option} className={state} onClick={() => onVerify(option)} key={option}>
            <span className="ng-radio" aria-hidden="true">{state === 'correct' ? '✓' : state === 'wrong' ? '×' : String.fromCharCode(65 + index)}</span>
            <strong>{option}</strong>{checked && state && <small>{state === 'correct' ? 'Corect' : 'Ai ales'}</small>}
          </button>;
        })}</div>
      </>}
      {!isOrder && question.type === 'text' && <form className="practice-answer" onSubmit={event => { event.preventDefault(); if (!checked) onVerify(); }}><label htmlFor="practice-answer">Răspunsul tău în norvegiană</label><input id="practice-answer" className="game-input" lang="nb" autoComplete="off" autoCorrect="off" autoCapitalize="none" spellCheck={false} enterKeyHint="done" disabled={checked} value={answer} onChange={event => setAnswer(event.target.value)} placeholder="Scrie aici…" /></form>}
      {isOrder && <>
        <div className={'order-zone' + (checked ? correct ? ' is-correct' : ' is-wrong' : '')} aria-label="Propoziția ta">
          <div className="ng-board-label"><small>PROPOZIȚIA TA</small><span aria-live="polite">{selected.length} / {question.words.length} cuvinte</span></div>
          <div className="ng-assembled-words">{selected.map((wordIndex, index) => <button type="button" lang="nb" disabled={checked} onClick={() => setSelected(all => all.filter((_, position) => position !== index))} aria-label={'Elimină ' + question.words[wordIndex] + ' din poziția ' + (index + 1)} key={wordIndex}>{question.words[wordIndex]}<span aria-hidden="true">×</span></button>)}{!selected.length && <span className="ng-empty-sentence">Atinge primul cuvânt de mai jos</span>}{selected.length > 0 && !completeAnswer && <span className="ng-empty-token" aria-hidden="true">+</span>}</div>
        </div>
        <p className="ng-bank-label">Cuvinte disponibile</p>
        <div className="order-bank" aria-label="Cuvinte disponibile">{question.words.map((word, index) => <button type="button" lang="nb" disabled={checked || selected.includes(index)} aria-pressed={selected.includes(index)} onClick={() => setSelected(all => all.includes(index) ? all : [...all, index])} key={index}>{word}</button>)}</div>
        <div className="ng-order-tools"><small>Atinge un cuvânt din propoziție ca să îl scoți.</small><button type="button" disabled={checked || !selected.length} onClick={() => setSelected(all => all.slice(0, -1))}>↶ Anulează</button></div>
      </>}
      <div ref={outcome} className="ng-answer-outcome">
        {checked && <div ref={feedback} tabIndex={-1} role="status" className={'game-feedback ' + (correct ? 'correct' : 'wrong')}><span aria-hidden="true">{correct ? '✓' : '↻'}</span><div><h3>{correct ? 'Corect!' : 'Răspunsul corect'}</h3><p>{correct ? question.example || question.explanation || 'Ai găsit răspunsul potrivit.' : question.answer}</p>{!correct && <small>Salvat pentru recapitulare.</small>}</div></div>}
        {(!instantChoice || checked) && <footer className="session-actions"><button type="button" className="exercise-primary" disabled={!checked && !completeAnswer} onClick={checked ? onNext : () => onVerify()}>{checked ? current === total - 1 ? 'Vezi rezultatul' : 'Continuă' : isOrder && !completeAnswer ? 'Completează propoziția' : 'Verifică'} <span aria-hidden="true">→</span></button></footer>}
      </div>
    </section>
  </ExerciseLayout>;
}
