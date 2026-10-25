import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import ScenarioIllustration from './ScenarioIllustration';
import ScenarioProgress from './ScenarioProgressSummary';
import ScenarioVoiceControls from './ScenarioVoiceControls';

const Mic = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><rect x="9" y="2" width="6" height="13" rx="3"/><path d="M5 10v2a7 7 0 0 0 14 0v-2M12 19v3m-4 0h8"/></svg>;
const Speaker = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="m11 4-5 4H3v8h3l5 4ZM15 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/></svg>;
const SceneIcon = ({ cafe }) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">{cafe ? <><path d="M4 9h12v7a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4ZM16 10h2a3 3 0 0 1 0 6h-2M3 22h15M7 6c-2-2 2-2 0-4m5 4c-2-2 2-2 0-4"/></> : <><rect x="3" y="7" width="18" height="14" rx="3"/><path d="M8 7V4h8v3M3 13h18M10 12v3h4v-3"/></>}</svg>;

export default function NaturalConversationExercise({ mobile, level, selected, flow, hint, setHint,
  inputRef, bottomRef, resultRef, errorRef, loginUrl, blocked, restoring, remaining }) {
  const { session, messages, draft, busy, error } = flow;
  const prefix = mobile ? 'mc' : 'dc';
  const [contextOpen, setContextOpen] = useState(false);
  const [objectivesOpen, setObjectivesOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const title = useRef(null);
  useEffect(() => { setContextOpen(false); }, [Boolean(session)]);
  useEffect(() => { title.current?.focus(); }, [selected.id]);
  const latest = messages.at(-1);
  const achieved = session?.achieved || [];
  const finish = () => flow.reset();
  const cafe = selected.id === 'cafe-order';
  return <main className={`conversation-studio ${mobile ? 'conversation-studio--app mobile-conversation mobile-conversation--exercise' : 'desktop-conversation desktop-conversation--exercise'} guided-conversation natural-conversation`}>
    <header className="guided-brand"><Link to="/dashboard">Nordlingo</Link><span>Nivel {level}</span></header>
    <button type="button" className="guided-back conversation-link" onClick={flow.reset} aria-label={mobile ? 'Scenarii practice' : 'Înapoi la scenarii'}><span aria-hidden="true">←</span><span className="guided-back-label">{mobile ? 'Scenarii practice' : 'Înapoi la scenarii'}</span></button>
    <section className="conversation-brief guided-brief" aria-labelledby="guided-scenario-title">
      <div className="guided-scenario"><span className="guided-scenario-icon"><SceneIcon cafe={cafe}/></span><div><h1 id="guided-scenario-title" ref={title} tabIndex={-1}>{selected.title}</h1><p className="guided-role">{selected.role}</p><p>{selected.brief}</p></div></div>
      <div className="natural-scene">
        <div className="natural-partner"><ScenarioIllustration scenarioId="nora" className="scenario-nora"/><div><strong>Nora <span>· {cafe ? 'Barista AI' : 'Partener AI'}</span></strong><p>Prietenoasă, răbdătoare și gata să te ajute.</p></div><span className="natural-speaker" aria-hidden="true"><Speaker/></span></div>
        <div className="guided-image" aria-hidden="true"><ScenarioIllustration scenarioId={selected.id}/></div>
        {session ? <div className="conversation-messages natural-current" role="log" aria-live="polite">
          {latest && <article className="conversation-message assistant"><span className="natural-speaker" aria-hidden="true"><Speaker/></span><p lang="nb">{latest.text}</p></article>}
          {busy && flow.operation === 'turn' && <article className="conversation-message user conversation-pending"><small>Tu · se trimite</small><p lang="nb">{draft}</p></article>}
        </div> : <p className="natural-welcome">O conversație, în ritmul tău.</p>}
      </div>
      <section className="guided-objectives" aria-label="Obiectivele misiunii">
        <button type="button" className="guided-objectives-heading" onClick={() => setObjectivesOpen(value => !value)} aria-expanded={objectivesOpen} aria-controls={`${prefix}-objective-list`}><strong>Obiective {achieved.length} din {selected.goals.length}</strong><span className="natural-goal-dots" aria-hidden="true">{selected.goals.map((_, i) => <i key={i} className={achieved.includes(i) ? 'achieved' : ''}/>)}</span><span>{objectivesOpen ? 'Ascunde' : 'Vezi obiective'} →</span></button>
        <ol id={`${prefix}-objective-list`} hidden={!objectivesOpen}>{selected.goals.map((goal, i) => <li key={goal} className={achieved.includes(i) ? 'achieved' : ''}><span className="guided-goal-number" aria-hidden="true">{i + 1}</span><span>{goal}</span><i className="guided-goal-check" aria-hidden="true">{achieved.includes(i) ? '✓' : ''}</i>{achieved.includes(i) && <span className="guided-sr"> — realizat</span>}</li>)}</ol>
      </section>
      <div id={`${prefix}-context`} className="guided-context" hidden={!contextOpen}><ScenarioProgress progress={flow.progress?.[selected.id]} scenario={selected} detail/><strong>{level} · {selected.difficulty.label}</strong><p className="conversation-criteria">{selected.difficulty.expectation}</p></div>
    </section>
    <section className="conversation-dialogue guided-dialogue" aria-label="Conversație cu Nora" aria-busy={busy}>
      {session?.done ? <div ref={resultRef} className="conversation-result guided-result" tabIndex={-1}><small>SESIUNE ÎNCHEIATĂ</small><h2>{session.endReason === 'success' ? 'Ai dus misiunea la capăt' : 'Ai ajuns la finalul sesiunii'}</h2><p>{achieved.length} din {selected.goals.length} obiective realizate</p>{session.endReason === 'turn_limit' && <p>Ai folosit cele {session.maxTurns} răspunsuri disponibile.</p>}<p>{session.feedback}</p>{session.endReason !== 'success' && <><h3>De exersat</h3><ul>{selected.goals.filter((_, i) => !achieved.includes(i)).map(goal => <li key={goal}>{goal}</li>)}</ul></>}<p role="status">{flow.progressNotice}</p><button className="conversation-primary" onClick={flow.again}>Exersează din nou</button><button className="conversation-link" onClick={flow.reset}>Alte situații</button></div>
        : session ? <ScenarioVoiceControls key={selected.id} flow={flow} blocked={blocked} reply={latest?.text} onFinish={finish}/>
          : <div className="scenario-voice guided-ready"><p className="scenario-voice__status" role="status">{busy ? 'Pregătim conversația…' : restoring ? 'Reluăm conversația' : 'Hai să vorbim'}</p><div className="scenario-voice__wave" aria-hidden="true">{Array.from({ length: 27 }, (_, i) => <i key={i} style={{ height: 7 + (i * 17 % 27) }}/>)}</div>{!restoring && !error && <button type="button" className="scenario-voice__mic conversation-primary" disabled={busy} onClick={flow.start} aria-label="Începe conversația"><Mic/><span className="guided-sr">Începe conversația</span></button>}<div className="scenario-voice__tools"><button type="button" disabled>Repetă</button><button type="button" disabled>Mai lent</button></div><p className="scenario-voice__caption">{restoring ? 'Pregătim istoricul și răspunsul tău nestrimis.' : 'Apasă microfonul pentru a începe.'}</p><button type="button" className="guided-finish" onClick={finish}><span aria-hidden="true">⚑</span> Înapoi la scenarii</button></div>}
      {error && <div ref={errorRef} className="conversation-error" role="alert" tabIndex={-1}><p>{error.message}</p>{draft && <p>Textul tău nestrimis a fost păstrat.</p>}{error.kind === 'restart' ? <button className="conversation-primary" disabled={busy} onClick={flow.restart}>Începe o sesiune nouă</button> : error.kind === 'auth' ? <Link className="conversation-primary" to={loginUrl}>Conectează-te</Link> : <button className="conversation-primary" disabled={busy} onClick={flow.retry}>{error.kind === 'limit' ? 'Verifică din nou disponibilitatea' : 'Reîncearcă'}</button>}</div>}
    </section>
    <div className="guided-secondary">
      {session && <span aria-label={`${session.turn} din ${session.maxTurns} răspunsuri`}>{session.turn}/{session.maxTurns} răspunsuri</span>}
      <button type="button" className="conversation-link" onClick={() => setContextOpen(value => !value)} aria-expanded={contextOpen} aria-controls={`${prefix}-context`}>Context</button>
      {!session?.done && <button type="button" className="conversation-link" onClick={() => setHint(!hint)} aria-expanded={hint} aria-controls="guided-hint">Un punct de pornire</button>}
    </div>
    {hint && <p id="guided-hint" className="conversation-hint" lang="nb">{selected.hint}</p>}
    {session && <div className="guided-history"><div id={`${prefix}-history`} hidden={!historyOpen}>{messages.slice(0, -1).map((message, i) => <article className={`conversation-message ${message.role}`} key={i}><small>{message.role === 'user' ? 'Tu' : 'Nora'}</small><p lang="nb">{message.text}</p></article>)}</div><div ref={bottomRef}/>{messages.length > 1 && <button type="button" className="conversation-link" onClick={() => setHistoryOpen(value => !value)} aria-expanded={historyOpen} aria-controls={`${prefix}-history`}>{historyOpen ? 'Ascunde istoricul' : mobile ? 'Istoric' : `Istoricul conversației (${messages.length})`}</button>}</div>}
    {session && !session.done && <><details className="scenario-text-alternative"><summary>Alternativă: răspunde în scris</summary><form className="conversation-compose" onSubmit={event => { event.preventDefault(); if (!blocked) flow.send(); }}><label htmlFor="scenario-answer">Răspunsul tău în norvegiană</label><div><textarea id="scenario-answer" ref={inputRef} lang="nb" rows={2} maxLength={1200} value={draft} disabled={busy} onChange={event => flow.setDraft(event.target.value)}/><button className="conversation-primary" disabled={busy || blocked || !draft.trim()} type="submit">Trimite →</button></div></form></details>{remaining <= 2 && <p className="conversation-notice" role="status">{remaining === 1 ? 'Mai ai un răspuns disponibil.' : 'Mai ai două răspunsuri disponibile.'}</p>}{session.feedback && <details className="conversation-feedback"><summary>Feedback pentru răspunsul tău</summary><p>{session.feedback}</p></details>}</>}
      {flow.notice && <p className="conversation-notice" role="status">{flow.notice}</p>}
  </main>;
}
