import {ui} from '../../languages/messages.js';
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
      : heard ? ui('ui_f44b0b599ead02f3') : listening ? ui('ui_10aed56aa8237020') : 'Ascultă cererea';
  const canChoose = !checked && (!listening || heard);
  const type = { word: 'Cuvânt', expression: 'Expresie', dialogue: 'Replică din dialog' }[question.contentType];

  useEffect(() => { if (checked) feedbackRef.current?.focus({ preventScroll: true }); }, [checked]);

  if (listening) return <ListeningExpedition {...{ level, requestedLevel, question, current, total, retry, headingRef, audioBusy, audioStatus, heard, selected, setSelected, checked, play, stopAudio, onExit, verify, next, repeatQuestion }} />;

  const audioControls = <div className="desktop-activity__audio">
    <button type="button" className="exercise-primary" onClick={() => audioBusy ? stopAudio() : play()} aria-busy={audioStatus === 'loading'}>
      <ExerciseIcon name="listen" />{audioBusy ? ui('ui_926e26688b3f621b') : playbackLabel}
    </button>
    <button type="button" className="exercise-secondary" onClick={() => play(true)} disabled={audioBusy}>{ui('web_929c7c800471390c')}</button>
    <span className="desktop-activity__audio-status" role="status">{audioBusy ? playbackLabel : listening && !heard ? 'Ascultă până la capăt pentru a putea răspunde.' : heard ? 'Poți asculta din nou, oricând ai nevoie.' : ''}</span>
  </div>;

  return <ExerciseLayout className="desktop-activity" title={details.title} description={details.description} icon={game} level={level} onExit={onExit}>
    <div className="desktop-activity__progress">
      <span>{retry ? 'Repetarea greșelilor' : 'Progresul sesiunii'} · {current + 1}{ui('ui_dbd8b6478643d623')}{total}</span>
      <progress value={current + 1} max={Math.max(1, total)} aria-label={ui('web_845f7806fcc783e5')} />
    </div>
    {limitedMissions && <p className="desktop-activity__notice">{ui('web_703b49d29e8cd610')}{requestedLevel}.</p>}
    <div className="desktop-activity__workspace">
      <section className="desktop-activity__context" aria-label={listening ? 'Înregistrarea de ascultat' : 'Contextul misiunii'}>
        <p className="desktop-activity__eyebrow">{listening ? [type, `Lecția ${question.lessonId}`].filter(Boolean).join(' · ') : `Misiunea ${question.mission}`}</p>
        <h2>{listening ? 'Ascultă cu atenție' : question.title}</h2>
        {listening ? <>
          <p>{ui('web_6a2d0b7e092544a1')}</p>
          {audioControls}
        </> : <>
          <p className="desktop-activity__context-label">{ui('web_8c1761d1ae5d27ef')}</p>
          <p>{question.context}</p>
          {question.kind === 'intent' && <>
            <blockquote lang="nb">{question.quote}</blockquote>
            {audioControls}
          </>}
          {question.kind === 'reply' && <div className="desktop-activity__task"><strong>{ui('web_932c081ee228f673')}</strong><p>{question.task}</p></div>}
        </>}
        {audioStatus === 'error' && <div className="desktop-activity__error" role="alert">
          <p>{ui('web_c43a8aec77fa959f')}{listening ? 'Verifică internetul și încearcă din nou.' : 'Poți continua citind textul sau poți încerca din nou.'}</p>
          <button type="button" className="exercise-secondary" onClick={() => play()}>{ui('ui_408fa01ada826275')}</button>
        </div>}
      </section>
      <section className="desktop-activity__question" aria-labelledby="desktop-activity-question-title">
        <p className="desktop-activity__eyebrow">{question.topic}</p>
        <h2 id="desktop-activity-question-title" ref={headingRef} tabIndex={-1}>{listening ? ui('ui_dea89d46970b49d9') : question.prompt}</h2>
        <p id="desktop-activity-instruction" className="desktop-activity__instruction">{listening && !heard ? 'Ascultă înregistrarea, apoi alege sensul potrivit.' : 'Alege un răspuns, apoi verifică.'}</p>
        <div className="desktop-activity__choices" role="group" aria-label={ui('web_48c3b5b6fd78b692')} aria-describedby="desktop-activity-instruction">
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
          <h3>{correct ? ui('ui_a2a3c5105a33294f') : 'Reține răspunsul potrivit'}</h3>
          {listening && <><p lang="nb" className="desktop-activity__source">{question.audioText}</p><p lang="ro">{question.answer}</p></>}
          {question.explanation && (!listening || question.explanation !== `${question.audioText} — ${question.answer}`) && <p>{question.explanation}</p>}
          {!correct && <p className="desktop-activity__saved">{ui('ui_b1a9f3c2252309f8')}</p>}
          {question.kind === 'reply' && <button type="button" className="exercise-secondary" disabled={audioBusy} onClick={() => play(false, question.answer)}>{ui('web_cba2912cf5502360')}</button>}
        </div>}
        <footer className="desktop-activity__actions">
          {checked && !correct && <button type="button" className="exercise-secondary" onClick={repeatQuestion}>{ui('ui_2065f88ac40484c1')}</button>}
          <button type="button" className="exercise-primary" disabled={!checked && (selected === null || (listening && !heard))} onClick={checked ? next : verify}>{checked ? current === total - 1 ? ui('ui_1834cd8f7b513ef9') : ui('ui_5fc4497d148a38a8') : ui('ui_b69a8da1603647a2')} <span aria-hidden="true">→</span></button>
        </footer>
      </section>
    </div>
  </ExerciseLayout>;
}
