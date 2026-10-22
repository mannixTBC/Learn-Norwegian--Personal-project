import React from 'react';
import { ExerciseArtwork, NordicHeader, NordicProgress } from './NordicExerciseUI';

export default function ActivityPlayView({ game, details, level, requestedLevel, limitedMissions, pathId, question, current, total, retry, headingRef, needsAudio, audioBusy, audioStatus, heard, selected, setSelected, checked, play, stopAudio, onExit, verify, next }) {
  const audioPlayer = <div className={`activity-listen ${audioBusy ? 'is-playing' : ''}`}>
    <div className="activity-soundwave" aria-hidden="true">{Array.from({ length: 25 }, (_, index) => <i style={{ '--bar': `${12 + ((index * 17) % 37)}px`, '--delay': `${index * 45}ms` }} key={index} />)}</div>
    <button type="button" className="activity-listen__play" onClick={() => audioBusy ? stopAudio() : play()} aria-label={audioBusy ? 'Oprește redarea' : 'Ascultă înregistrarea'}><span aria-hidden="true">{audioBusy ? 'Ⅱ' : '▶'}</span><strong>{audioStatus === 'loading' ? 'Se încarcă…' : audioStatus === 'playing' ? 'Se redă…' : heard ? 'Ascultă din nou' : 'Ascultă înregistrarea'}</strong></button>
    <button type="button" className="activity-text-button ng-slow" onClick={() => play(true)} disabled={audioBusy}>◷ Ascultă mai lent</button>
    <p>{heard ? 'Alege sensul care se potrivește.' : 'Ascultă până la capăt, apoi alege răspunsul.'}</p>
  </div>;
  return <div className={`exercise-screen nordic-exercise nordic-exercise--${game} activity-game activity-game--${game} activity-game--playing`}>
    <NordicHeader title={details.title} subtitle={game === 'listen' ? 'Auzi norvegiana. Alege sensul.' : 'Situații reale. Replica potrivită.'} level={level} onExit={onExit}/>
    <NordicProgress current={current + 1} total={total}/>
    {needsAudio && audioPlayer}
    <section className="activity-question" aria-labelledby="activity-question-title">
      {game === 'missions' && <ExerciseArtwork kind="missions" pathId={pathId}/>}
      {limitedMissions && <p className="activity-pool-note">Recapitulare B2 pentru nivelul {requestedLevel}.</p>}
      <div className="activity-question__meta"><span>{retry ? 'Repetă greșelile' : game === 'listen' ? `Lecția ${question.lessonId} · ${question.topic}` : `Misiunea ${question.mission} · ${question.title}`}</span><span>{game === 'listen' ? { word: 'Cuvânt', expression: 'Expresie', dialogue: 'Replică din dialog' }[question.contentType] : question.kind === 'intent' ? 'Înțelege' : 'Răspunde'}</span></div>
      {game === 'missions' && <div className="activity-scene"><small>Situația ta</small><p>{question.context}</p></div>}
      {question.kind === 'intent' && <blockquote className="activity-quote"><small>Ți se spune</small><p lang="nb">„{question.quote}”</p><button type="button" className="activity-text-button" onClick={() => play()} disabled={audioBusy}>▷ Ascultă cererea</button></blockquote>}
      {question.kind === 'reply' && <p className="activity-task">{question.task}</p>}
      <h2 id="activity-question-title" ref={headingRef} tabIndex={-1}>{question.prompt}</h2>
      {audioStatus === 'error' && <div className="activity-error" role="alert">Sunetul nu a putut fi redat. Verifică internetul și încearcă din nou.{!needsAudio && ' Poți continua și citind textul.'}<button type="button" onClick={() => play()}>Reîncearcă redarea</button></div>}
      <div className="activity-choices" role="group" aria-label="Alege răspunsul">{question.options.map((option, index) => {
        const state = checked ? option === question.answer ? 'correct' : option === selected ? 'wrong' : '' : selected === option ? 'selected' : '';
        return <button type="button" aria-pressed={selected === option} className={state} disabled={checked || (needsAudio && !heard)} onClick={() => setSelected(option)} key={option}><span className="activity-choice-letter" aria-hidden="true">{state === 'correct' ? '✓' : state === 'wrong' ? '×' : selected === option ? '●' : ''}</span><span lang={question.kind === 'reply' ? 'nb' : 'ro'}>{option}</span></button>;
      })}</div>
      {checked && <div role="status" className={`activity-feedback ${selected === question.answer ? 'correct' : 'wrong'}`}><span aria-hidden="true">{selected === question.answer ? '✓' : '↻'}</span><div><h3>{selected === question.answer ? 'Exact, ai înțeles!' : 'Reține pentru data viitoare'}</h3><p>{question.explanation}</p>{question.kind === 'reply' && <button className="activity-text-button" type="button" onClick={() => play(false, question.answer)} disabled={audioBusy}>▷ Ascultă replica potrivită</button>}</div></div>}
      <footer className="activity-session-actions"><span>{checked ? selected === question.answer ? 'Încă un pas înainte.' : 'O vei putea repeta la final.' : needsAudio && !heard ? 'Începe prin a asculta.' : 'Alege un răspuns, apoi verifică.'}</span><button className="activity-primary" type="button" disabled={!checked && (selected === null || (needsAudio && !heard))} onClick={checked ? next : verify}>{checked ? current === total - 1 ? 'Vezi rezultatul' : 'Continuă' : 'Verifică'}<span aria-hidden="true">→</span></button></footer>
    </section>
  </div>;
}
