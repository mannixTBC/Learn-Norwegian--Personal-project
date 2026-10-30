import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import ScenarioProgress from './ScenarioProgressSummary';
import ScenarioVoiceControls from './ScenarioVoiceControls';
import StudioHeader from './StudioHeader';
import StudioArtwork from './StudioArtwork';
import StudioTranslation from './StudioTranslation';
import StudioIcon from './StudioIcon';
import StudioResult from './StudioResult';
import './StudioDesign.css';

const Mic = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><rect x="9" y="2" width="6" height="13" rx="3"/><path d="M5 10v2a7 7 0 0 0 14 0v-2M12 19v3m-4 0h8"/></svg>;

export default function NaturalConversationExercise({ mobile, level, selected, flow, hint, setHint,
  bottomRef, resultRef, errorRef, loginUrl, blocked, restoring, remaining }) {
  const { session, messages, draft, busy, error } = flow;
  const prefix = mobile ? 'mc' : 'dc';
  const [startTyping, setStartTyping] = useState(false);
  const [contextOpen, setContextOpen] = useState(false);
  const [objectivesOpen, setObjectivesOpen] = useState(false);

  const title = useRef(null);
  const playbackRef = useRef(null);
  const transcriptRef = useRef(null);
  useEffect(() => { const node = transcriptRef.current; if (node) node.scrollTop = node.scrollHeight; }, [messages.length, busy]);
  useEffect(() => { setContextOpen(false); }, [Boolean(session)]);
  useEffect(() => { title.current?.focus(); }, [selected.id]);
  const latest = messages.at(-1);
  const achieved = session?.achieved || [];

  return <main className={`conversation-studio studio-design ${mobile ? 'conversation-studio--app mobile-conversation mobile-conversation--exercise' : 'desktop-conversation desktop-conversation--exercise'} guided-conversation natural-conversation airy-conversation`}>
    <StudioHeader level={level} onBack={flow.reset} title={selected.id==='cafe-order'?'La cafenea':selected.title} titleId="guided-scenario-title" titleRef={title} locked={Boolean(session)}/>
    <div className="practical-dialogue-content">
    {!(session?.done)&&<div className="studio-progress"><span>{achieved.length} din {selected.goals.length} obiective</span><progress value={achieved.length} max={selected.goals.length}/></div>}
    <section hidden={session?.done} className="guided-objectives" aria-label="Obiectivele misiunii"><button type="button" className="guided-objectives-heading" onClick={() => setObjectivesOpen(v => !v)} aria-expanded={objectivesOpen} aria-controls={prefix+'-objective-list'}><span aria-hidden="true">◎</span><span>{objectivesOpen?'Obiectivele conversației':(selected.goals.find((_,i)=>!achieved.includes(i)) || 'Obiective realizate')}</span><span aria-hidden="true">⌄</span></button><ol id={prefix+'-objective-list'} hidden={!objectivesOpen}>{selected.goals.map((goal,i)=><li key={goal} className={achieved.includes(i)?'achieved':''}>{achieved.includes(i)?'✓':i+1} · {goal}</li>)}</ol></section>
    {!session && <p className="airy-brief">{selected.brief}</p>}
    {session && !session.done && <div ref={transcriptRef} className="conversation-messages airy-messages" role="log" aria-live="polite" aria-label="Conversație cu Nora">{messages.map((message,i)=><article className={'airy-message '+message.role} key={i}><div className="airy-avatar" aria-hidden="true">{message.role==='user'?<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="7" r="4"/><path d="M3 22v-3a9 9 0 0 1 18 0v3Z"/></svg>:<StudioArtwork scene="avatar"/>}</div><div className="airy-message-copy">{message.role!=='user'&&<small>Nora</small>}<p lang="nb">{message.role==='assistant'&&!session.done&&<button className="airy-replay" type="button" aria-label="Ascultă replica Norei" disabled={busy} onClick={()=>playbackRef.current?.(i)}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="m9 5 11 7-11 7Z"/></svg></button>}{message.text}</p>{message.role!=='user'&&<StudioTranslation text={message.text}/>}</div></article>)}{busy&&flow.operation==='turn'&&<p className="conversation-pending" lang="nb">{draft}</p>}{busy&&<p role="status">Nora pregătește răspunsul…</p>}<div ref={bottomRef}/></div>}
    <div className={session?.done ? "practical-dialogue-dock practical-dialogue-dock--result" : "practical-dialogue-dock"}>
    {!session?.done&&<button type="button" className="studio-hint-trigger" onClick={()=>setHint(!hint)} aria-expanded={hint} aria-controls="guided-hint"><StudioIcon name="hint"/>Ai nevoie de un indiciu?<span aria-hidden="true">⌄</span></button>}
    <section className="conversation-dialogue guided-dialogue" aria-label="Conversație cu Nora" aria-busy={busy}>
      {session?.done ? <StudioResult {...{selected,session,messages,flow,level,resultRef}}/>
        : session ? <ScenarioVoiceControls key={selected.id} flow={flow} blocked={blocked} reply={latest?.text} initialTyping={startTyping} onHelp={() => setHint(!hint)} helpOpen={hint} playbackRef={playbackRef}/>
          : <div className="scenario-voice guided-ready"><p className="scenario-voice__status" hidden={!busy && !restoring} role="status">{busy?'Pregătim conversația…':restoring?'Reluăm conversația…':'Hai să vorbim'}</p><div className="airy-actions">{!restoring&&!error&&<button type="button" className="scenario-voice__mic conversation-primary" disabled={busy} onClick={()=>{setStartTyping(false);flow.start();}} aria-label="Începe conversația"><Mic/></button>}<button type="button" className="airy-help" onClick={()=>setHint(!hint)} aria-expanded={hint} aria-controls="guided-hint"><span aria-hidden="true"><StudioIcon name="hint"/></span>Indiciu</button><button type="button" className="airy-end" aria-label="Scrie răspunsul" disabled={busy || restoring || Boolean(error)} onClick={()=>{setStartTyping(true);flow.start();}}><span aria-hidden="true"><StudioIcon name="keyboard"/></span>Scrie</button></div><p className="scenario-voice__caption">Apasă microfonul pentru a începe</p></div>}

      {error && <div ref={errorRef} className="conversation-error" role="alert" tabIndex={-1}><p>{error.message}</p>{draft && <p>Textul tău nestrimis a fost păstrat.</p>}{error.kind === 'restart' ? <button className="conversation-primary" disabled={busy} onClick={flow.restart}>Începe o sesiune nouă</button> : error.kind === 'auth' ? <Link className="conversation-primary" to={loginUrl}>Conectează-te</Link> : <button className="conversation-primary" disabled={busy} onClick={flow.retry}>{error.kind === 'limit' ? 'Verifică din nou disponibilitatea' : 'Reîncearcă'}</button>}</div>}
    </section>
    <div className="guided-secondary" hidden={!hint}>
      {session && <span aria-label={`${session.turn} din ${session.maxTurns} răspunsuri`}>{session.turn}/{session.maxTurns} răspunsuri</span>}
      <button type="button" className="conversation-link" onClick={() => setContextOpen(value => !value)} aria-expanded={contextOpen} aria-controls={`${prefix}-context`}>Context</button>
    </div>
    <div id={prefix+'-context'} className="guided-context" hidden={!hint || !contextOpen}><ScenarioProgress progress={flow.progress?.[selected.id]} scenario={selected} detail/><strong>{level} · {selected.difficulty.label}</strong><p className="conversation-criteria">{selected.difficulty.expectation}</p></div>
    {hint && <p id="guided-hint" className="conversation-hint" lang="nb">{selected.hint}</p>}
    {session&&!session.done&&remaining<=2&&<p className="conversation-notice" role="status">{remaining===1?'Mai ai un răspuns disponibil.':'Mai ai două răspunsuri disponibile.'}</p>}
    {session&&!session.done&&session.feedback&&<details className="conversation-feedback" hidden={!hint}><summary>Feedback pentru răspunsul tău</summary><p>{session.feedback}</p></details>}
    </div>
    </div>
  </main>;
}
