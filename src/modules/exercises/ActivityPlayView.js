import {ui} from '../../languages/messages.js';
import React, { useEffect, useRef } from 'react';
import { ExerciseArtwork, NordicHeader, NordicProgress } from './NordicExerciseUI';

export default function ActivityPlayView({ game, details, level, requestedLevel, limitedMissions, pathId, question, current, total, retry, headingRef, audioBusy, audioStatus, selected, setSelected, checked, play, onExit, verify, next }) {
  const correct = selected === question.answer;
  const feedback = useRef(null);
  const outcome = useRef(null);
  useEffect(() => {
    if (!checked) return;
    feedback.current?.focus({ preventScroll: true });
    outcome.current?.scrollIntoView?.({ block: 'nearest' });
  }, [checked]);
  return <div className={`exercise-screen nordic-exercise nordic-exercise--${game} activity-game activity-game--${game} activity-game--playing`}>
    <NordicHeader title={details.title} subtitle="Înțelege situația. Alege ce spui." level={level} onExit={onExit} />
    <NordicProgress current={current + 1} total={total} />
    <section className="activity-question ng-conversation" aria-labelledby="activity-question-title">
      <div className="ng-mission-context">
        <div className="ng-scene-heading"><ExerciseArtwork kind="missions" pathId={pathId} /><div><span>{retry ? 'RECAPITULARE' : 'SITUAȚIE REALĂ'}</span><strong>{question.title}</strong><small>{ui('web_4b7dded535e99d48')}{question.mission}</small></div></div>
        {limitedMissions && <p className="activity-pool-note">{ui('web_703b49d29e8cd610')}{requestedLevel}.</p>}
        <div className="activity-scene"><small>{ui('web_8c1761d1ae5d27ef')}</small><p>{question.context}</p></div>
        {question.kind === 'intent' && <div className="ng-speaker-row"><span className="ng-speaker-avatar" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="8" r="3" /><path d="M5 21v-3a7 7 0 0 1 14 0v3" /></svg></span><blockquote className="activity-quote"><small>{ui('web_24381ef91dc5d7d4')}</small><p lang="nb">{question.quote}</p><button type="button" className="activity-text-button" onClick={() => play()} disabled={audioBusy}>▷ {audioStatus === 'loading' ? ui('web_02bf71cba392fbc4') : audioStatus === 'playing' ? 'Se redă…' : 'Ascultă cererea'}</button></blockquote></div>}
        {question.kind === 'reply' && <div className="ng-mission-task"><span>{ui('web_0413aa2c8afff5e2')}</span><p className="activity-task">{question.task}</p></div>}
        {audioStatus === 'error' && <div className="activity-error" role="alert">{ui('web_1a3588f8d5da747a')}<button type="button" onClick={() => play()}>{ui('ui_408fa01ada826275')}</button></div>}
      </div>
      <div className="ng-mission-answer">
        <span className="ng-your-turn">{question.kind === 'intent' ? 'AI ÎNȚELES?' : 'RÂNDUL TĂU'}</span>
        <h2 id="activity-question-title" ref={headingRef} tabIndex={-1}>{question.prompt}</h2>
        <div className="activity-choices" role="group" aria-label={ui('web_48c3b5b6fd78b692')}>{question.options.map((option, index) => {
          const state = checked ? option === question.answer ? 'correct' : option === selected ? 'wrong' : '' : selected === option ? 'selected' : '';
          return <button type="button" aria-pressed={selected === option} className={state} disabled={checked} onClick={() => setSelected(option)} key={option}><span className="activity-choice-letter" aria-hidden="true">{state === 'correct' ? '✓' : state === 'wrong' ? '×' : selected === option ? '●' : String.fromCharCode(65 + index)}</span><span lang={question.kind === 'reply' ? 'nb' : 'ro'}>{option}</span>{checked && (state === 'correct' || state === 'wrong') && <small>{state === 'correct' ? ui('ui_6c2b431b8fba2553') : 'Ai ales'}</small>}</button>;
        })}</div>
        <div ref={outcome} className="ng-answer-outcome">
          {checked && <div ref={feedback} tabIndex={-1} role="status" className={`activity-feedback ${correct ? 'correct' : 'wrong'}`}><span aria-hidden="true">{correct ? '✓' : '↻'}</span><div><h3>{correct ? 'Exact, ai înțeles!' : 'Reține pentru data viitoare'}</h3><p>{question.explanation}</p>{!correct && <small>{ui('ui_29e294c9b60e8089')}</small>}{question.kind === 'reply' && <button className="activity-text-button" type="button" onClick={() => play(false, question.answer)} disabled={audioBusy}>{ui('web_a49e238e0ba54ea3')}</button>}</div></div>}
          <footer className="activity-session-actions"><span>{checked ? 'Continuă când ești pregătit.' : 'Alege un răspuns, apoi verifică.'}</span><button className="activity-primary" type="button" disabled={!checked && selected === null} onClick={checked ? next : verify}>{checked ? current === total - 1 ? ui('ui_1834cd8f7b513ef9') : ui('ui_5fc4497d148a38a8') : ui('ui_b69a8da1603647a2')}<span aria-hidden="true">→</span></button></footer>
        </div>
      </div>
    </section>
  </div>;
}
