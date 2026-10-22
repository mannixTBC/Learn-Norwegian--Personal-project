import React from 'react';
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
      <Link to="/dashboard" className="expedition-brand" aria-label="NordLingo — Acasă"><img src="/branding/nordlingo-selected-color.png" alt="NordLingo" /></Link>
      <span className="expedition-level" aria-label={'Nivel ' + level}>{level}</span>
    </header>
    <section className="expedition-sheet" aria-label="Ascultă și alege">{children}</section>
  </div>;
}

function Headphones() {
  return <svg className="expedition-headphones" viewBox="0 0 180 122" fill="none" aria-hidden="true">
    <defs>
      <linearGradient id="expedition-band" x1="48" y1="8" x2="132" y2="85" gradientUnits="userSpaceOnUse"><stop stopColor="#47929a" /><stop offset=".5" stopColor="#155461" /><stop offset="1" stopColor="#0f3a47" /></linearGradient>
      <linearGradient id="expedition-ear" x1="40" y1="60" x2="67" y2="110" gradientUnits="userSpaceOnUse"><stop stopColor="#ffdb7b" /><stop offset="1" stopColor="#d39b32" /></linearGradient>
    </defs>
    <ellipse cx="90" cy="115" rx="43" ry="4" fill="#254b51" opacity=".1" />
    <path d="M49 74V54a41 41 0 0 1 82 0v20" stroke="#113f4b" strokeWidth="16" />
    <path d="M49 66V53a41 41 0 0 1 82 0v13" stroke="url(#expedition-band)" strokeWidth="13" />
    <path d="M55 40a36 36 0 0 1 64-9" stroke="#84bec0" strokeWidth="3" strokeLinecap="round" opacity=".6" />
    <rect x="36" y="62" width="27" height="43" rx="12" fill="url(#expedition-ear)" />
    <rect x="51" y="58" width="18" height="51" rx="9" fill="#205968" />
    <rect x="55" y="63" width="10" height="41" rx="5" fill="#123d49" />
    <rect x="117" y="62" width="27" height="43" rx="12" fill="url(#expedition-ear)" />
    <rect x="111" y="58" width="18" height="51" rx="9" fill="#205968" />
    <rect x="115" y="63" width="10" height="41" rx="5" fill="#123d49" />
    <path d="m20 53 7 7M14 76h10m128-16 7-7m-3 23h10" stroke="#edbc54" strokeWidth="4" strokeLinecap="round" />
  </svg>;
}

export default function ListeningExpedition({ level, requestedLevel, question, current, total, retry, headingRef, audioBusy, audioStatus, heard, selected, setSelected, checked, play, stopAudio, onExit, verify, next }) {
  const correct = selected === question.answer;
  const playbackLabel = audioStatus === 'loading' ? 'Se încarcă…' : audioStatus === 'playing' ? 'Se redă…' : heard ? 'Ascultă din nou' : 'Ascultă înregistrarea';
  const type = { word: 'Cuvânt', expression: 'Expresie', dialogue: 'Replică din dialog' }[question.contentType];
  return <ListeningExpeditionLayout {...{ level, requestedLevel, onExit, checked }}>
    <div className="expedition-stage">{retry ? 'RECAPITULARE' : 'ETAPA'} {current + 1} / {total}</div>
    <progress className="expedition-progress" aria-label="Progresul sesiunii" value={current + 1} max={Math.max(1, total)} />
    <h1 className="expedition-title">Ascultă și alege</h1>
    <p className="expedition-subtitle">Ascultă și alege varianta corectă.</p>
    <Headphones />
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
    {checked ? <div className={'expedition-feedback ' + (correct ? 'correct' : 'wrong')} role="status"><Icon name={correct ? 'check' : 'cross'} /><div><h3>{correct ? 'Corect, ai găsit sensul!' : 'Reține pentru data viitoare'}</h3><p lang="nb">{question.audioText}</p><p>{question.answer}</p>{!correct && <small>Salvat pentru recapitulare.</small>}</div></div>
      : <p className="expedition-hint">{heard ? 'Poți asculta din nou, de câte ori ai nevoie.' : 'Ascultă până la capăt, apoi alege răspunsul.'}</p>}
    <button className="expedition-submit" type="button" disabled={!checked && (selected === null || !heard)} onClick={checked ? next : verify}>{checked ? current === total - 1 ? 'Vezi rezultatul' : 'Continuă' : 'Verifică'}<Icon name="arrow" /></button>
  </ListeningExpeditionLayout>;
}
