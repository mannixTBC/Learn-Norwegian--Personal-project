import React, { useEffect, useRef } from 'react';
import { ExerciseArtwork, NordicHeader, NordicProgress } from './NordicExerciseUI';

export default function ActivityPlayView({ game, details, level, requestedLevel, limitedMissions, pathId, question, current, total, retry, headingRef, audioBusy, audioStatus, selected, setSelected, checked, play, onExit, verify, next }) {
  const correct = selected === question.answer;
  const feedback = useRef(null);
  useEffect(() => { if (checked) feedback.current?.focus(); }, [checked]);
  return <div className={`exercise-screen nordic-exercise nordic-exercise--${game} activity-game activity-game--${game} activity-game--playing`}>
    <NordicHeader title={details.title} subtitle="Înțelege situația. Alege ce spui." level={level} onExit={onExit} />
    <NordicProgress current={current + 1} total={total} />
    <section className="activity-question ng-conversation" aria-labelledby="activity-question-title">
      <div className="ng-mission-context">
        <div className="ng-scene-heading"><ExerciseArtwork kind="missions" pathId={pathId} /><div><span>{retry ? 'RECAPITULARE' : 'SITUAȚIE REALĂ'}</span><strong>{question.title}</strong><small>Misiunea {question.mission}</small></div></div>
        {limitedMissions && <p className="activity-pool-note">Recapitulare B2 pentru nivelul {requestedLevel}.</p>}
        <div className="activity-scene"><small>Situația ta</small><p>{question.context}</p></div>
        {question.kind === 'intent' && <div className="ng-speaker-row"><span className="ng-speaker-avatar" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="8" r="3" /><path d="M5 21v-3a7 7 0 0 1 14 0v3" /></svg></span><blockquote className="activity-quote"><small>Interlocutorul</small><p lang="nb">{question.quote}</p><button type="button" className="activity-text-button" onClick={() => play()} disabled={audioBusy}>▷ {audioStatus === 'loading' ? 'Se încarcă…' : audioStatus === 'playing' ? 'Se redă…' : 'Ascultă cererea'}</button></blockquote></div>}
        {question.kind === 'reply' && <div className="ng-mission-task"><span>CE VREI SĂ SPUI</span><p className="activity-task">{question.task}</p></div>}
        {audioStatus === 'error' && <div className="activity-error" role="alert">Sunetul nu a putut fi redat. Poți continua citind textul.<button type="button" onClick={() => play()}>Reîncearcă redarea</button></div>}
      </div>
      <div className="ng-mission-answer">
        <span className="ng-your-turn">{question.kind === 'intent' ? 'AI ÎNȚELES?' : 'RÂNDUL TĂU'}</span>
        <h2 id="activity-question-title" ref={headingRef} tabIndex={-1}>{question.prompt}</h2>
        <div className="activity-choices" role="group" aria-label="Alege răspunsul">{question.options.map((option, index) => {
          const state = checked ? option === question.answer ? 'correct' : option === selected ? 'wrong' : '' : selected === option ? 'selected' : '';
          return <button type="button" aria-pressed={selected === option} className={state} disabled={checked} onClick={() => setSelected(option)} key={option}><span className="activity-choice-letter" aria-hidden="true">{state === 'correct' ? '✓' : state === 'wrong' ? '×' : selected === option ? '●' : String.fromCharCode(65 + index)}</span><span lang={question.kind === 'reply' ? 'nb' : 'ro'}>{option}</span>{checked && (state === 'correct' || state === 'wrong') && <small>{state === 'correct' ? 'Corect' : 'Ai ales'}</small>}</button>;
        })}</div>
        {checked && <div ref={feedback} tabIndex={-1} role="status" className={`activity-feedback ${correct ? 'correct' : 'wrong'}`}><span aria-hidden="true">{correct ? '✓' : '↻'}</span><div><h3>{correct ? 'Exact, ai înțeles!' : 'Reține pentru data viitoare'}</h3><p>{question.explanation}</p>{!correct && <small>Salvat pentru recapitulare.</small>}{question.kind === 'reply' && <button className="activity-text-button" type="button" onClick={() => play(false, question.answer)} disabled={audioBusy}>▷ Ascultă replica potrivită</button>}</div></div>}
        <footer className="activity-session-actions"><span>{checked ? 'Continuă când ești pregătit.' : 'Alege un răspuns, apoi verifică.'}</span><button className="activity-primary" type="button" disabled={!checked && selected === null} onClick={checked ? next : verify}>{checked ? current === total - 1 ? 'Vezi rezultatul' : 'Continuă' : 'Verifică'}<span aria-hidden="true">→</span></button></footer>
      </div>
    </section>
  </div>;
}
