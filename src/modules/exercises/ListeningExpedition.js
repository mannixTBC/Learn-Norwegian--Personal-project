import {ui} from '../../languages/messages.js';
import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './ListeningExpedition.css';

function Icon({ name, ...props }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    {name === 'speaker' ? <><path d="M11 5 6 9H3v6h3l5 4zM15 8a6 6 0 0 1 0 8M18 5a10 10 0 0 1 0 14" /></> : name === 'back' ? <path d="m14 5-7 7 7 7M7 12h14" />
      : name === 'play' ? <path fill="currentColor" stroke="none" d="M8 4.8v14.4a1 1 0 0 0 1.5.86l11-7.2a1 1 0 0 0 0-1.72l-11-7.2a1 1 0 0 0-1.5.86Z" />
        : name === 'stop' ? <rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor" stroke="none" />
          : name === 'slow' ? <><path d="M4 17a9 9 0 1 1 16 0M12 12l4-5M6 10l1 .5M18 10l-1 .5M12 4v1" /><circle cx="12" cy="12" r="1.5" /></>
            : name === 'check' ? <path d="m5 12 4 4L19 6" />
              : name === 'cross' ? <path d="m7 7 10 10M17 7 7 17" />
                : <><path d="M5 12h14m-6-6 6 6-6 6" /></>}
  </svg>;
}

export function ListeningExpeditionLayout({ level, requestedLevel = level, onExit, checked = false, children }) {
  return <div className={'listening-expedition' + (onExit ? ' listening-expedition--playing' : '') + (checked ? ' listening-expedition--checked' : '')}>
    <header className="expedition-header">
      {onExit ? <button type="button" className="expedition-back" aria-label={ui('web_e2f5cf878208dc21')} onClick={onExit}><Icon name="back" /></button>
        : <Link className="expedition-back" aria-label={ui('web_4d841d600c45fb73')} to={'/jocuri?nivel=' + requestedLevel}><Icon name="back" /></Link>}
      {<Link to="/dashboard" className="expedition-brand" aria-label={ui('web_5eea99318c403ce0')}><img src="/branding/nordlingo-selected-color.png" alt={ui('ui_ee728f3245aed708')} /></Link>}
      <span className="expedition-level" aria-label={ui('ui_1450f9b5ea87b98c') + level}>{level}</span>
    </header>
    <section className="expedition-sheet" aria-label={ui('ui_b58cf3ae7c001d99')}>{children}</section>
  </div>;
}

export default function ListeningExpedition({ level, requestedLevel, question, current, total, retry, headingRef, audioBusy, audioStatus, heard, selected, setSelected, checked, play, stopAudio, onExit, verify, next, repeatQuestion }) {
  const correct = selected === question.answer;
  const feedbackRef = useRef(null);
  const nextRef = useRef(next);
  nextRef.current = next;
  useEffect(() => {
    if (!checked) return;
    const dialog = feedbackRef.current;
    dialog?.showModal();
    if (!correct) return () => dialog?.close();
    const timer = window.setTimeout(() => nextRef.current(), 2400);
    return () => { window.clearTimeout(timer); dialog?.close(); };
  }, [checked, correct, current]);
  const playbackLabel = audioStatus === 'loading' ? ui('web_02bf71cba392fbc4') : audioStatus === 'playing' ? 'Se redă…' : heard ? ui('ui_f44b0b599ead02f3') : ui('ui_10aed56aa8237020');
  const type = { word: 'Cuvânt', expression: 'Expresie', dialogue: 'Replică din dialog' }[question.contentType];
  return <ListeningExpeditionLayout {...{ level, requestedLevel, onExit, checked }}>
    <div className="expedition-stage">{retry ? 'RECAPITULARE' : 'ETAPA'} {current + 1} / {total}</div>
    <progress className="expedition-progress" aria-label={ui('web_845f7806fcc783e5')} value={current + 1} max={Math.max(1, total)} />


    <div className="expedition-player-area">
      <img className="expedition-art" src="/images/practice/listening-notebook.png" alt="" />
      <button type="button" className={'expedition-player' + (audioBusy ? ' is-playing' : '')} onClick={() => audioBusy ? stopAudio() : play()} aria-label={audioBusy ? ui('ui_926e26688b3f621b') : playbackLabel} aria-busy={audioStatus === 'loading'}>
        <span className="expedition-play"><Icon name={audioBusy ? 'stop' : 'speaker'} /></span>
        <span className="expedition-track"><span className="expedition-wave" aria-hidden="true">{Array.from({ length: 31 }, (_, i) => <i key={i} style={{ '--height': `${10 + ((i * 13 + 7) % 29)}px`, '--delay': `${i * -45}ms` }} />)}</span><span className="expedition-play-label">{playbackLabel}</span></span>
      </button>
      <div className="expedition-controls"><button type="button" className="expedition-replay" onClick={() => play()} disabled={audioBusy}><span aria-hidden="true">↻</span>{ui('ui_f44b0b599ead02f3')}</button><button type="button" className="expedition-slow" onClick={() => play(true)} disabled={audioBusy}><Icon name="slow" />{ui('ui_7e65a53eb92be733')}</button></div>
    </div>
    <div className="activity-question__meta expedition-meta"><span>{retry ? 'Repetă greșelile' : `Lecția ${question.lessonId} · ${question.topic}`}</span><span>{type}</span></div>
    <h2 className="expedition-question" id="listening-instruction" ref={headingRef} tabIndex={-1}>{ui('ui_dea89d46970b49d9')}</h2>
    {audioStatus === 'error' && <div className="expedition-error" role="alert">{ui('web_794a77186f98f513')}<button type="button" onClick={() => play()}>{ui('ui_408fa01ada826275')}</button></div>}
    <div className="expedition-choices" role="group" aria-label={ui('web_48c3b5b6fd78b692')} aria-describedby="listening-instruction">{question.options.map((option, index) => {
      const state = checked ? option === question.answer ? 'correct' : option === selected ? 'wrong' : '' : selected === option ? 'selected' : '';
      return <button type="button" key={option} className={'expedition-option ' + state} aria-pressed={selected === option} disabled={checked || !heard} onClick={() => setSelected(option)}><span className="expedition-letter" aria-hidden="true">{state === 'correct' || state === 'wrong' ? <Icon name={state === 'correct' ? 'check' : 'cross'} /> : String.fromCharCode(65 + index)}</span><span>{option}</span></button>;
    })}</div>
    {checked && <dialog ref={feedbackRef} className={'expedition-popup ' + (correct ? 'correct' : 'wrong')} aria-labelledby="listening-feedback-title" aria-describedby="listening-feedback-description" onCancel={(event) => { event.preventDefault(); if (correct) next(); else repeatQuestion(); }}>
      <span className="expedition-popup-icon"><Icon name={correct ? 'check' : 'cross'} /></span>
      <h3 id="listening-feedback-title">{correct ? ui('ui_a2a3c5105a33294f') : ui('ui_9209dc69eca1f3ca')}</h3>
      <div id="listening-feedback-description"><p lang="ro">{question.answer}</p></div>
      {!correct && <><small>{ui('ui_b1a9f3c2252309f8')}</small><button type="button" className="expedition-submit" onClick={repeatQuestion} autoFocus>{ui('ui_2065f88ac40484c1')}<Icon name="arrow" /></button></>}
      {correct && <><button type="button" className="expedition-submit" onClick={next} autoFocus>{current === total - 1 ? ui('ui_1834cd8f7b513ef9') : ui('ui_5fc4497d148a38a8')}<Icon name="arrow" /></button><span className="expedition-auto-next">{ui('web_16d9937e85a21596')}</span></>}
    </dialog>}
    <button className="expedition-submit" type="button" style={{ visibility: checked ? 'hidden' : undefined }} disabled={checked || selected === null || !heard} onClick={verify}>{ui('ui_b69a8da1603647a2')}</button>
  </ListeningExpeditionLayout>;
}
