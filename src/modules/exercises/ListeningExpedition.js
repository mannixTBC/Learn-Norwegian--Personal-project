import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './ListeningExpedition.css';

function Icon({ name, ...props }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
    {name === 'back' ? <path d="m14 5-7 7 7 7M7 12h14" />
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
      {onExit ? <button type="button" className="expedition-back" aria-label="Închide sesiunea" onClick={onExit}><Icon name="back" /></button>
        : <Link className="expedition-back" aria-label="Înapoi la jocuri" to={'/jocuri?nivel=' + requestedLevel}><Icon name="back" /></Link>}
      {!onExit && <Link to="/dashboard" className="expedition-brand" aria-label="NordLingo — Acasă"><img src="/branding/nordlingo-selected-color.png" alt="NordLingo" /></Link>}
      <span className="expedition-level" aria-label={'Nivel ' + level}>{level}</span>
    </header>
    <section className="expedition-sheet" aria-label="Ascultă și alege">{children}</section>
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
  const playbackLabel = audioStatus === 'loading' ? 'Se încarcă…' : audioStatus === 'playing' ? 'Se redă…' : heard ? 'Ascultă din nou' : 'Ascultă înregistrarea';
  const type = { word: 'Cuvânt', expression: 'Expresie', dialogue: 'Replică din dialog' }[question.contentType];
  return <ListeningExpeditionLayout {...{ level, requestedLevel, onExit, checked }}>
    <div className="expedition-stage">{retry ? 'RECAPITULARE' : 'ETAPA'} {current + 1} / {total}</div>
    <progress className="expedition-progress" aria-label="Progresul sesiunii" value={current + 1} max={Math.max(1, total)} />
    <h1 className="expedition-title">Ascultă și alege</h1>

    <div className="expedition-player-area">
      <button type="button" className={'expedition-player' + (audioBusy ? ' is-playing' : '')} onClick={() => audioBusy ? stopAudio() : play()} aria-label={audioBusy ? 'Oprește redarea' : playbackLabel} aria-busy={audioStatus === 'loading'}>
        <span className="expedition-play"><Icon name={audioBusy ? 'stop' : 'play'} /></span>
        <span className="expedition-track"><span className="expedition-wave" aria-hidden="true">{Array.from({ length: 31 }, (_, i) => <i key={i} style={{ '--height': `${10 + ((i * 13 + 7) % 29)}px`, '--delay': `${i * -45}ms` }} />)}</span><span className="expedition-play-label">{playbackLabel}</span></span>
      </button>
      <button type="button" className="expedition-slow" onClick={() => play(true)} disabled={audioBusy}><Icon name="slow" />Mai lent</button>
    </div>
    <div className="activity-question__meta expedition-meta"><span>{retry ? 'Repetă greșelile' : `Lecția ${question.lessonId} · ${question.topic}`}</span><span>{type}</span></div>
    <h2 className="expedition-question" ref={headingRef} tabIndex={-1}>Găsește sensul potrivit</h2>
    {audioStatus === 'error' && <div className="expedition-error" role="alert">Sunetul nu a putut fi redat. Verifică internetul și încearcă din nou.<button type="button" onClick={() => play()}>Reîncearcă redarea</button></div>}
    <div className="expedition-choices" role="group" aria-label="Alege răspunsul">{question.options.map((option, index) => {
      const state = checked ? option === question.answer ? 'correct' : option === selected ? 'wrong' : '' : selected === option ? 'selected' : '';
      return <button type="button" key={option} className={'expedition-option ' + state} aria-pressed={selected === option} disabled={checked || !heard} onClick={() => setSelected(option)}><span className="expedition-letter" aria-hidden="true">{state === 'correct' || state === 'wrong' ? <Icon name={state === 'correct' ? 'check' : 'cross'} /> : String.fromCharCode(65 + index)}</span><span>{option}</span></button>;
    })}</div>
    {checked && <dialog ref={feedbackRef} className={'expedition-popup ' + (correct ? 'correct' : 'wrong')} aria-labelledby="listening-feedback-title" aria-describedby="listening-feedback-description" onCancel={(event) => { event.preventDefault(); if (!correct) repeatQuestion(); }}>
      <span className="expedition-popup-icon"><Icon name={correct ? 'check' : 'cross'} /></span>
      <h3 id="listening-feedback-title">{correct ? 'Corect!' : 'Mai încearcă o dată'}</h3>
      <div id="listening-feedback-description"><p lang="ro">{question.answer}</p></div>
      {!correct && <><small>Greșeala este salvată pentru recapitulare.</small><button type="button" className="expedition-submit" onClick={repeatQuestion} autoFocus>Repetă întrebarea<Icon name="arrow" /></button></>}
      {correct && <span className="expedition-auto-next">Continuăm automat…</span>}
    </dialog>}
    <button className="expedition-submit" type="button" style={{ visibility: checked ? 'hidden' : undefined }} disabled={checked || selected === null || !heard} onClick={verify}>Verifică<Icon name="arrow" /></button>
  </ListeningExpeditionLayout>;
}
