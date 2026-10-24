import ScenarioVoiceControls from './ScenarioVoiceControls';
import ScenarioProgress from './ScenarioProgressSummary';
import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCareerPath } from '../../services/careerProfile';
import { ExerciseArtwork } from './NordicExerciseUI';
import { ExerciseLevelSelect } from './ExerciseUI';
import MobileAppNav from '../layout/MobileAppNav';
import NorwegianFlagIcon from '../layout/Navbar/NorwegianFlagIcon';
import './MobileConversationStudio.css';

function Icon({ name = 'message' }) {
  const paths = {
    back: <path d="m14 5-7 7 7 7"/>,
    arrow: <path d="M4 12h16m-6-6 6 6-6 6"/>,
    message: <><path d="M21 11a8 8 0 0 1-8 8H8l-5 3 1-6a8 8 0 1 1 17-5Z"/><path d="M8 10h8m-8 4h5"/></>,
    list: <><path d="M9 6h12M9 12h12M9 18h12"/><circle cx="3" cy="6" r="1"/><circle cx="3" cy="12" r="1"/><circle cx="3" cy="18" r="1"/></>,
    help: <><circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 4.2 1.8c-1.2.7-1.7 1.2-1.7 2.7m0 3h.01"/></>,
    user: <><circle cx="12" cy="7" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/></>,
    history: <><path d="M3 11a9 9 0 1 1 2 7M3 4v7h7m2-5v6l4 2"/></>,
    check: <path d="m5 12 4 4L19 6"/>,
  };
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name] || paths.message}</svg>;
}
function Artwork({ scenario, compact = false }) {
  return <div className={'mc-scene' + (compact ? ' mc-scene--compact' : '')}>{scenario.id === 'cafe-order' ? <img className="scenario-cafe-photo" src="/images/voice/nora-cafe.png" alt=""/> : <><ExerciseArtwork kind="missions" pathId={scenario.path}/><img className="scenario-scene-nora" src="/images/voice/nora-avatar.webp" alt=""/></>}<span>{scenario.place}</span></div>;
}
function Objectives({ selected, session, open, setOpen }) {
  const collapsed = Boolean(session) && !open;
  return <section className="mc-objectives">
    {session ? <button type="button" className="mc-objectives-toggle" onClick={() => setOpen(value => !value)} aria-expanded={!collapsed} aria-controls="mc-objective-list"><Icon name="list"/><strong>Obiectivele tale</strong><span>{session.achieved.length}/{selected.goals.length}</span><b aria-hidden="true">{collapsed ? '⌄' : '⌃'}</b></button>
      : <h2><Icon name="list"/>Obiectivele tale</h2>}
    <ol id="mc-objective-list" hidden={collapsed}>{selected.goals.map((goal, i) => <li key={goal} className={session?.achieved.includes(i) ? 'achieved' : ''}><span aria-hidden="true">{session?.achieved.includes(i) ? '✓' : i + 1}</span>{goal}{session?.achieved.includes(i) && <small className="mc-sr-only"> — realizat</small>}</li>)}</ol>
  </section>;
}

export default function MobileConversationStudio({ level, path, scenarios, selected, flow, hint, setHint,
  inputRef, bottomRef, resultRef, errorRef, loginUrl, blocked, restoring, remaining }) {
  const { session, messages, draft, busy, error } = flow;
  const [objectivesOpen, setObjectivesOpen] = useState(true);
  const [contextOpen, setContextOpen] = useState(true);
  const [historyOpen, setHistoryOpen] = useState(false);
  const contextRef = useRef(null), historyRef = useRef(null), hintRef = useRef(null), currentLineRef = useRef(null);
  useEffect(() => { setObjectivesOpen(true); setContextOpen(true); setHistoryOpen(false); }, [selected?.id, level]);
  useEffect(() => { setObjectivesOpen(true); setContextOpen(!session); }, [Boolean(session)]);
  useEffect(() => { setHistoryOpen(false); }, [session?.turn]);
  useEffect(() => { if (session && contextOpen) contextRef.current?.scrollIntoView({ block: 'nearest' }); }, [contextOpen]);
  useEffect(() => { if (historyOpen) historyRef.current?.scrollIntoView({ block: 'nearest' }); }, [historyOpen]);
  useEffect(() => { if (hint) hintRef.current?.scrollIntoView({ block: 'nearest' }); }, [hint]);
  useEffect(() => { if (session && !busy) currentLineRef.current?.scrollIntoView({ block: 'nearest' }); }, [session?.turn, busy]);
  const category = selected ? getCareerPath(selected.path).shortTitle : path.shortTitle;
  const olderMessages = messages.slice(0, -1);
  const currentMessage = messages.at(-1);
  const hintContent = hint && selected && <p ref={hintRef} id="mc-hint" className="conversation-hint" lang="nb">{selected.hint}</p>;
  const recovery = error && <div ref={errorRef} className="conversation-error mc-error" role="alert" tabIndex={-1}><p>{error.message}</p>{draft && <p>Textul tău nestrimis a fost păstrat.</p>}
    {error.kind === 'restart' ? <button className="conversation-primary" disabled={busy} onClick={flow.restart}>Începe o sesiune nouă</button>
      : error.kind === 'auth' ? <Link className="conversation-primary" to={loginUrl}>Conectează-te</Link>
      : <button className="conversation-primary" disabled={busy} onClick={flow.retry}>{error.kind === 'limit' ? 'Verifică din nou disponibilitatea' : 'Reîncearcă'}</button>}
  </div>;

  return <main className={'conversation-studio conversation-studio--app mobile-conversation ' + (selected ? 'mobile-conversation--exercise' : 'mobile-conversation--catalog')}>
    <header className="conversation-heading mc-topbar">
      {selected ? <button className="conversation-link mc-back" onClick={flow.reset}><Icon name="back"/>Scenarii practice</button>
        : <><Link className="mc-back" to={'/jocuri?nivel=' + level} aria-label="Înapoi la jocuri"><Icon name="back"/></Link><Link className="mc-brand" to="/dashboard" aria-label="Nordlingo — Acasă"><NorwegianFlagIcon/></Link></>}
      {selected ? <span className="mc-level" aria-label={'Nivel ' + level}>{level}</span> : <ExerciseLevelSelect level={level}/>}
    </header>
    {!selected ? <>
      <div className="conversation-title mc-catalog-title"><p>VORBEȘTE ÎN SITUAȚII REALE</p><h1>Scenarii practice</h1><span>Intră în rol. Găsește cuvintele. Exersează cu Nora.</span></div>
      <div className="conversation-section"><h2>Alege o situație</h2><span>{level} · {path.shortTitle}</span></div>
      <div className="conversation-catalog mc-catalog">{scenarios.map(s => <button className="conversation-card mc-card" key={s.id} onClick={() => flow.choose(s.id)}>
        <Artwork scenario={s}/><div className="mc-card-copy"><small>{s.path === path.id ? 'PENTRU TRASEUL TĂU' : getCareerPath(s.path).shortTitle}</small><h2>{s.title}</h2><p>{s.place}</p><ScenarioProgress progress={flow.progress?.[s.id]} scenario={s}/><footer><span>{level} · {s.difficulty.turns} schimburi maximum</span><b>Începe <Icon name="arrow"/></b></footer></div>
      </button>)}</div>
      <p className="conversation-note">Poți alege oricare dintre situații, indiferent de traseul tău.</p><MobileAppNav activeLevel={level} activeSection="games"/>
    </> : <div className="conversation-workspace mc-workspace">
      <section className="conversation-brief mc-brief" aria-labelledby="mc-scenario-title">
        <div className="mc-scenario-heading"><span className="mc-category"><Icon/>{category} · {level}</span><h1 id="mc-scenario-title">{selected.title}</h1></div>
        <Artwork scenario={selected} compact={Boolean(session)}/>
        <div ref={contextRef} id="mc-context" className="mc-context" hidden={Boolean(session) && !contextOpen}><ScenarioProgress progress={flow.progress?.[selected.id]} scenario={selected} detail/><h2><Icon name="user"/>Rolul tău</h2><p className="mc-role">{selected.role}</p><p>{selected.brief}</p><div className="mc-expectation"><strong>{level} · {selected.difficulty.label}</strong><p className="conversation-criteria">{selected.difficulty.expectation}</p></div></div>
        {!session && <Objectives {...{ selected, session }} open={objectivesOpen} setOpen={setObjectivesOpen}/>}
        <section className="conversation-dialogue mc-dialogue" aria-label="Conversație cu Nora" aria-busy={busy}>
          {flow.notice && <p className="conversation-notice" role="status">{flow.notice}</p>}
          {!session ? <div className="conversation-ready mc-ready">
            {restoring ? <><h2>Reluăm conversația</h2><p role={busy ? 'status' : undefined}>{busy ? 'Pregătim istoricul și răspunsul tău nestrimis.' : 'Conversația așteaptă să fie reluată.'}</p></>
              : <><button type="button" className="conversation-link mc-preparation-hint" onClick={() => setHint(!hint)} aria-expanded={hint} aria-controls="mc-hint"><Icon name="help"/>Un punct de pornire</button>{hintContent}
                {!error && <button className="conversation-primary" disabled={busy} onClick={flow.start}>{busy ? 'Se pregătește conversația…' : 'Începe conversația'}<Icon name="arrow"/></button>}<p>Ai până la {selected.difficulty.turns} răspunsuri. Contează să te faci înțeles.</p></>}
          </div> : <>
            <header className="mc-partner"><img src="/images/voice/nora-avatar.webp" alt="" width="224" height="224"/><div><strong>Nora</strong><span>Partenerul tău de conversație</span></div><small aria-label={`${session.turn} din ${session.maxTurns} răspunsuri`}>{session.turn}/{session.maxTurns}</small></header>
            <div className="conversation-messages mc-messages" role="log" aria-live="polite">
              <div ref={historyRef} id="mc-history" className="mc-history" hidden={!historyOpen}>{olderMessages.map((m, i) => <article className={'conversation-message ' + m.role} key={i}><small>{m.role === 'user' ? 'Tu' : 'Nora'}</small><p lang="nb">{m.text}</p></article>)}</div>
              {currentMessage && <article ref={currentLineRef} className="conversation-message assistant mc-current-line"><p lang="nb" tabIndex={0}>{currentMessage.text}</p></article>}
              {busy && flow.operation === 'turn' && <article className="conversation-message user conversation-pending"><small>Tu · se trimite</small><p lang="nb">{draft.trim()}</p></article>}
              {busy && <p className="mc-waiting" role="status">{flow.operation === 'start' ? 'Pregătim o conversație nouă…' : 'Nora pregătește răspunsul…'}</p>}
              <div ref={bottomRef}/>
            </div>
            <Objectives {...{ selected, session }} open={objectivesOpen} setOpen={setObjectivesOpen}/>
            {session.done ? <div ref={resultRef} className={'conversation-result mc-result mc-result--' + session.endReason} tabIndex={-1}><span className="mc-result-icon"><Icon name={session.endReason === 'success' ? 'check' : 'list'}/></span><small>SESIUNE ÎNCHEIATĂ</small><h2>{session.endReason === 'success' ? 'Ai dus misiunea la capăt' : 'Ai ajuns la finalul sesiunii'}</h2><p className="mc-score">{session.achieved.length} din {selected.goals.length} obiective realizate</p>
              {session.endReason === 'turn_limit' && <p>Ai folosit cele {session.maxTurns} răspunsuri disponibile. Poți relua situația ca să exersezi obiectivele rămase.</p>}<p>{session.feedback}</p>
              {session.endReason !== 'success' && <div className="mc-next-practice"><h3>De exersat</h3><ul>{selected.goals.filter((_, i) => !session.achieved.includes(i)).map(goal => <li key={goal}>{goal}</li>)}</ul></div>}
              <p className="scenario-progress-notice" role="status">{flow.progressNotice}</p><button className="conversation-primary" onClick={flow.again}>Exersează din nou</button><button className="conversation-link" onClick={flow.reset}>Alte situații</button>
            </div> : <>
              <ScenarioVoiceControls key={selected.id} flow={flow} blocked={blocked} reply={currentMessage?.text}/>
              <details className="scenario-text-alternative"><summary>Alternativă: răspunde în scris</summary>
              <form className="conversation-compose mc-compose" onSubmit={e => { e.preventDefault(); if (!blocked) flow.send(); }}><label htmlFor="scenario-answer">{busy ? 'Nora pregătește răspunsul…' : 'Rândul tău'}</label><div><textarea ref={inputRef} id="scenario-answer" lang="nb" value={draft} maxLength={1200} rows={2} disabled={busy} onChange={e => flow.setDraft(e.target.value)} placeholder="Scrie în norvegiană…" aria-label="Răspunsul tău în norvegiană"/><button className="conversation-primary" type="submit" disabled={busy || blocked || !draft.trim()}>Trimite →</button></div><span className="mc-character-count">{draft.length}/1200</span></form></details>
              {remaining <= 2 && <p className="conversation-notice mc-remaining" role="status">{remaining === 1 ? 'Mai ai un răspuns disponibil.' : 'Mai ai două răspunsuri disponibile.'}</p>}
            </>}
            <div className="mc-tools"><button type="button" className="conversation-link" onClick={() => setContextOpen(value => !value)} aria-expanded={contextOpen} aria-controls="mc-context"><Icon name="user"/>Context</button><button type="button" className="conversation-link" onClick={() => setHistoryOpen(value => !value)} disabled={!olderMessages.length} aria-expanded={historyOpen} aria-controls="mc-history"><Icon name="history"/>{historyOpen ? 'Ascunde istoricul' : 'Istoric'}</button>{!session.done && <button type="button" className="conversation-link" onClick={() => setHint(!hint)} aria-expanded={hint} aria-controls="mc-hint"><Icon name="help"/>Un punct de pornire</button>}</div>
            {!session.done && hintContent}
            {session.feedback && !session.done && <details className="conversation-feedback mc-feedback"><summary>Feedback pentru răspunsul tău</summary><p>{session.feedback}</p></details>}
          </>}
          {recovery}
        </section>
      </section>
    </div>}
  </main>;
}
