import React, { useEffect, useRef } from 'react';
import { ExerciseIcon, ExerciseLayout } from './ExerciseUI';
import './DesktopActivityView.css';
import ListeningExpedition from './ListeningExpedition';

export default function DesktopActivityView({ game, details, level, requestedLevel, limitedMissions, question, current, total, retry, headingRef, audioBusy, audioStatus, heard, selected, setSelected, checked, play, stopAudio, onExit, verify, next, repeatQuestion }) {
  const listening = question.kind === 'listen';
  const correct = selected === question.answer;
  const feedbackRef = useRef(null);
  const playbackLabel = audioStatus === 'loading' ? 'Se încarcă înregistrarea…'
    : audioStatus === 'playing' ? 'Se redă înregistrarea…'
      : heard ? 'Ascultă din nou' : listening ? 'Ascultă înregistrarea' : 'Ascultă cererea';
  const canChoose = !checked && (!listening || heard);
  const type = { word: 'Cuvânt', expression: 'Expresie', dialogue: 'Replică din dialog' }[question.contentType];

  useEffect(() => { if (checked) feedbackRef.current?.focus({ preventScroll: true }); }, [checked]);

  if (listening) return <ListeningExpedition {...{ level, requestedLevel, question, current, total, retry, headingRef, audioBusy, audioStatus, heard, selected, setSelected, checked, play, stopAudio, onExit, verify, next, repeatQuestion }} />;

  const audioControls = <div className="desktop-activity__audio">
    <button type="button" className="exercise-primary" onClick={() => audioBusy ? stopAudio() : play()} aria-busy={audioStatus === 'loading'}>
      <ExerciseIcon name="listen" />{audioBusy ? 'Oprește redarea' : playbackLabel}
    </button>
    <button type="button" className="exercise-secondary" onClick={() => play(true)} disabled={audioBusy}>Ascultă mai lent</button>
    <span className="desktop-activity__audio-status" role="status">{audioBusy ? playbackLabel : listening && !heard ? 'Ascultă până la capăt pentru a putea răspunde.' : heard ? 'Poți asculta din nou, oricând ai nevoie.' : ''}</span>
  </div>;

  return <ExerciseLayout className="desktop-activity" title={details.title} description={details.description} icon={game} level={level} onExit={onExit}>
    <div className="desktop-activity__progress">
      <span>{retry ? 'Repetarea greșelilor' : 'Progresul sesiunii'} · {current + 1} din {total}</span>
      <progress value={current + 1} max={Math.max(1, total)} aria-label="Progresul sesiunii" />
    </div>
    {limitedMissions && <p className="desktop-activity__notice">Recapitulare B2 pentru nivelul {requestedLevel}.</p>}
    <div className="desktop-activity__workspace">
      <section className="desktop-activity__context" aria-label={listening ? 'Înregistrarea de ascultat' : 'Contextul misiunii'}>
        <p className="desktop-activity__eyebrow">{listening ? [type, `Lecția ${question.lessonId}`].filter(Boolean).join(' · ') : `Misiunea ${question.mission}`}</p>
        <h2>{listening ? 'Ascultă cu atenție' : question.title}</h2>
        {listening ? <>
          <p>Identifică sensul cuvântului, expresiei sau replicii. Textul în norvegiană va apărea după verificarea răspunsului.</p>
          {audioControls}
        </> : <>
          <p className="desktop-activity__context-label">Situația ta</p>
          <p>{question.context}</p>
          {question.kind === 'intent' && <>
            <blockquote lang="nb">{question.quote}</blockquote>
            {audioControls}
          </>}
          {question.kind === 'reply' && <div className="desktop-activity__task"><strong>Ce vrei să spui</strong><p>{question.task}</p></div>}
        </>}
        {audioStatus === 'error' && <div className="desktop-activity__error" role="alert">
          <p>Sunetul nu a putut fi redat. {listening ? 'Verifică internetul și încearcă din nou.' : 'Poți continua citind textul sau poți încerca din nou.'}</p>
          <button type="button" className="exercise-secondary" onClick={() => play()}>Reîncearcă redarea</button>
        </div>}
      </section>
      <section className="desktop-activity__question" aria-labelledby="desktop-activity-question-title">
        <p className="desktop-activity__eyebrow">{question.topic}</p>
        <h2 id="desktop-activity-question-title" ref={headingRef} tabIndex={-1}>{listening ? 'Ce ai auzit?' : question.prompt}</h2>
        <p id="desktop-activity-instruction" className="desktop-activity__instruction">{listening && !heard ? 'Ascultă înregistrarea, apoi alege sensul potrivit.' : 'Alege un răspuns, apoi verifică.'}</p>
        <div className="desktop-activity__choices" role="group" aria-label="Alege răspunsul" aria-describedby="desktop-activity-instruction">
          {question.options.map((option, index) => {
            const state = checked ? option === question.answer ? 'correct' : option === selected ? 'wrong' : '' : selected === option ? 'selected' : '';
            return <button type="button" className={state} key={option} aria-pressed={selected === option} disabled={!canChoose} onClick={() => setSelected(option)}>
              <span className="desktop-activity__letter" aria-hidden="true">{state === 'correct' ? '✓' : state === 'wrong' ? '×' : String.fromCharCode(65 + index)}</span>
              <span lang={question.kind === 'reply' ? 'nb' : 'ro'}>{option}</span>
              {checked && (state === 'correct' || state === 'wrong') && <small>{state === 'correct' ? 'Răspuns corect' : 'Ai ales'}</small>}
            </button>;
          })}
        </div>
        {checked && <div className={'desktop-activity__feedback ' + (correct ? 'correct' : 'wrong')} role="status" tabIndex={-1} ref={feedbackRef}>
          <h3>{correct ? 'Corect!' : 'Reține răspunsul potrivit'}</h3>
          {listening && <><p lang="nb" className="desktop-activity__source">{question.audioText}</p><p lang="ro">{question.answer}</p></>}
          {question.explanation && (!listening || question.explanation !== `${question.audioText} — ${question.answer}`) && <p>{question.explanation}</p>}
          {!correct && <p className="desktop-activity__saved">Greșeala este salvată pentru recapitulare.</p>}
          {question.kind === 'reply' && <button type="button" className="exercise-secondary" disabled={audioBusy} onClick={() => play(false, question.answer)}>Ascultă replica potrivită</button>}
        </div>}
        <footer className="desktop-activity__actions">
          {checked && !correct && <button type="button" className="exercise-secondary" onClick={repeatQuestion}>Repetă întrebarea</button>}
          <button type="button" className="exercise-primary" disabled={!checked && (selected === null || (listening && !heard))} onClick={checked ? next : verify}>{checked ? current === total - 1 ? 'Vezi rezultatul' : 'Continuă' : 'Verifică'} <span aria-hidden="true">→</span></button>
        </footer>
      </section>
    </div>
  </ExerciseLayout>;
}
