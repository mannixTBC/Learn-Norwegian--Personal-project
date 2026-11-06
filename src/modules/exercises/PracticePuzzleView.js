import {ui} from '../../languages/messages.js';
import React, { useEffect, useRef } from 'react';
import { ExerciseIcon, ExerciseLayout } from './ExerciseUI';
import { NordicProgress } from './NordicExerciseUI';
import VocabularyNotebook from './VocabularyNotebook';
import SentenceWorkshop from './SentenceWorkshop';

export default function PracticePuzzleView({ game, level, info, question, current, total, score, headingRef, answer, setAnswer, selected, setSelected, orderHint, checked, correct, completeAnswer, onVerify, onNext, onExit, onSpeak }) {
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
  if (isOrder) return <SentenceWorkshop {...{ level, question, current, total, headingRef, selected, setSelected, orderHint, checked, correct, completeAnswer, onVerify, onNext, onExit, onSpeak }} />;
  return <ExerciseLayout className={'practice-game practice-game--session ng-puzzle ng-puzzle--' + game} level={level} icon={game} title={info.title} description={info.subtitle} onExit={onExit}>
    <NordicProgress current={current + 1} total={total} detail={`${current + 1} / ${total} · ${score} ${score === 1 ? 'corect' : 'corecte'}`} />
    <section className="game-question ng-puzzle-card">
      <div className="ng-question-meta"><span>{ui('ui_abf153365567efe1')}{question.lessonId} · {level}</span><span>{isOrder ? 'CONSTRUIEȘTE' : 'GĂSEȘTE SENSUL'}</span></div>
      <div className="ng-puzzle-prompt">
        <span className="ng-puzzle-symbol" aria-hidden="true"><ExerciseIcon name={game} /></span>
        <h2 ref={headingRef} tabIndex={-1}>{question.prompt}</h2>
        {!isOrder && <button type="button" className="ng-audio" onClick={onSpeak} aria-label={ui('web_fdcf1ab6f9bb26d0')}><ExerciseIcon name="listen" /><span>{ui('ui_f1e65126c6a41e7b')}</span></button>}
      </div>
      {!isOrder && question.type === 'choice' && <>
        <p className="ng-action-hint" id="puzzle-instruction">{ui('web_9919151f9361dc2d')}</p>
        <div className="game-choices" role="group" aria-label={ui('web_48c3b5b6fd78b692')} aria-describedby="puzzle-instruction">{question.options.map((option, index) => {
          const state = checked ? option === question.answer ? 'correct' : answer === option ? 'wrong' : '' : '';
          return <button type="button" disabled={checked} aria-pressed={answer === option} className={state} onClick={() => onVerify(option)} key={option}>
            <span className="ng-radio" aria-hidden="true">{state === 'correct' ? '✓' : state === 'wrong' ? '×' : String.fromCharCode(65 + index)}</span>
            <strong>{option}</strong>{checked && state && <small>{state === 'correct' ? ui('ui_6c2b431b8fba2553') : 'Ai ales'}</small>}
          </button>;
        })}</div>
      </>}
      {!isOrder && question.type === 'text' && <form className="practice-answer" onSubmit={event => { event.preventDefault(); if (!checked) onVerify(); }}><label htmlFor="practice-answer">{ui('ui_20e6846a345b752a')}</label><input id="practice-answer" className="game-input" lang="nb" autoComplete="off" autoCorrect="off" autoCapitalize="none" spellCheck={false} enterKeyHint="done" disabled={checked} value={answer} onChange={event => setAnswer(event.target.value)} placeholder="Scrie aici…" /></form>}
      {isOrder && <>
        <div className={'order-zone' + (checked ? correct ? ' is-correct' : ' is-wrong' : '')} aria-label={ui('web_c45de7846db3a2d2')}>
          <div className="ng-board-label"><small>{ui('ui_04764192e1d2a2b9')}</small><span aria-live="polite">{selected.length} / {question.words.length}{ui('web_f75773e3941bf565')}</span></div>
          <div className="ng-assembled-words">{selected.map((wordIndex, index) => <button type="button" lang="nb" disabled={checked} onClick={() => setSelected(all => all.filter((_, position) => position !== index))} aria-label={'Elimină ' + question.words[wordIndex] + ' din poziția ' + (index + 1)} key={wordIndex}>{question.words[wordIndex]}<span aria-hidden="true">×</span></button>)}{!selected.length && <span className="ng-empty-sentence">{ui('web_e0971aefa78e2b18')}</span>}{selected.length > 0 && !completeAnswer && <span className="ng-empty-token" aria-hidden="true">+</span>}</div>
        </div>
        <p className="ng-bank-label">{ui('ui_7f216313f7587489')}</p>
        <div className="order-bank" aria-label={ui('ui_7f216313f7587489')}>{question.words.map((word, index) => <button type="button" lang="nb" disabled={checked || selected.includes(index)} aria-pressed={selected.includes(index)} onClick={() => setSelected(all => all.includes(index) ? all : [...all, index])} key={index}>{word}</button>)}</div>
        <div className="ng-order-tools"><small>{ui('web_8672abd16b522409')}</small><button type="button" disabled={checked || !selected.length} onClick={() => setSelected(all => all.slice(0, -1))}>{ui('web_b03ab717d15d706f')}</button></div>
      </>}
      <div ref={outcome} className="ng-answer-outcome">
        {checked && <div ref={feedback} tabIndex={-1} role="status" className={'game-feedback ' + (correct ? 'correct' : 'wrong')}><span aria-hidden="true">{correct ? '✓' : '↻'}</span><div><h3>{correct ? ui('ui_a2a3c5105a33294f') : ui('ui_28f937a2f6c24222')}</h3><p>{correct ? question.example || question.explanation || 'Ai găsit răspunsul potrivit.' : question.answer}</p>{!correct && <small>{ui('ui_29e294c9b60e8089')}</small>}</div></div>}
        {(!instantChoice || checked) && <footer className="session-actions"><button type="button" className="exercise-primary" disabled={!checked && !completeAnswer} onClick={checked ? onNext : () => onVerify()}>{checked ? current === total - 1 ? ui('ui_1834cd8f7b513ef9') : ui('ui_5fc4497d148a38a8') : isOrder && !completeAnswer ? ui('ui_4d73cd6b616feae4') : ui('ui_b69a8da1603647a2')} <span aria-hidden="true">→</span></button></footer>}
      </div>
    </section>
  </ExerciseLayout>;
}
