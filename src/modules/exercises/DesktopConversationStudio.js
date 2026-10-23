import ScenarioProgress from './ScenarioProgressSummary';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCareerPath } from '../../services/careerProfile';
import { ExerciseLevelSelect } from './ExerciseUI';
import './DesktopConversationStudio.css';

function Icon({ name = 'message' }) {
  const paths = {
    message: <><path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5Z"/><path d="M8 11h8m-8 4h5"/></>,
    arrow: <path d="M5 12h14m-6-6 6 6-6 6"/>,
    back: <path d="m14 6-6 6 6 6"/>,
    check: <path d="m5 12 4 4L19 6"/>,
    context: <><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 7h6m-6 5h6m-6 5h4"/></>,
    help: <><circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 4.2 1.8c-1.2.7-1.7 1.2-1.7 2.7m0 3h.01"/></>,
  };
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name] || paths.message}</svg>;
}
function Panorama({ scenario, small = false }) {
  return <div className={'dc-panorama' + (small ? ' dc-panorama--small' : '')} aria-hidden="true">
    <img src="/images/voice/voice-fjord.webp" alt="" loading={small ? 'lazy' : 'eager'} width="1200" height="800"/>
    <span className="dc-scene-label">{scenario.place}</span>
  </div>;
}
const Portrait = () => <img className="dc-portrait" src="/images/voice/nora-avatar.webp" alt="" width="224" height="224"/>;

export default function DesktopConversationStudio({ level, path, scenarios, selected, flow, hint, setHint,
  bottomRef, inputRef, resultRef, errorRef, loginUrl, blocked, restoring, remaining }) {
  const { session, messages, draft, busy, error } = flow;
  const [contextOpen, setContextOpen] = useState(true);
  const [historyOpen, setHistoryOpen] = useState(false);
  useEffect(() => { setContextOpen(true); setHistoryOpen(false); }, [selected?.id, level]);
  useEffect(() => { setContextOpen(!session); }, [Boolean(session)]);
  useEffect(() => { if (!session || session.turn === 0) setHistoryOpen(false); }, [session?.turn]);
  const category = selected ? getCareerPath(selected.path).shortTitle : path.shortTitle;
  const olderMessages = messages.slice(0, -1);
  const currentMessage = messages.at(-1);

  return <main className={'conversation-studio desktop-conversation ' + (selected ? 'desktop-conversation--exercise' : 'desktop-conversation--catalog')}>
    <header className="conversation-heading dc-topbar">
      {selected ? <button className="conversation-link dc-back" onClick={flow.reset}><Icon name="back"/>Înapoi la scenarii</button>
        : <Link className="dc-back" to={'/jocuri?nivel=' + level}><Icon name="back"/>Jocuri și exerciții</Link>}
      <span className="dc-topbar-meta">{selected ? `${category} · ${level}` : 'Practică în situații reale'}{session && <span className="dc-turns" aria-label={`${session.turn} din ${session.maxTurns} răspunsuri`}>{session.turn}/{session.maxTurns} răspunsuri</span>}</span>
    </header>
    {!selected ? <>
      <div className="conversation-title dc-catalog-title"><div><p>CONVERSAȚII ÎN LUMEA REALĂ</p><h1>Studio de conversație</h1><span>Intră în rol și exersează norvegiana în ritmul tău.</span></div><ExerciseLevelSelect level={level}/></div>
      <div className="conversation-section"><h2>Alege o situație</h2><span>Recomandate pentru traseul tău: {path.shortTitle}</span></div>
      <div className="conversation-catalog dc-catalog">{scenarios.map(s => <button key={s.id} className="conversation-card dc-card" onClick={() => flow.choose(s.id)}>
        <Panorama scenario={s} small/><div className="dc-card-copy"><small>{s.path === path.id ? 'PENTRU TRASEUL TĂU' : getCareerPath(s.path).shortTitle}</small><h2>{s.title}</h2><p>{s.place}</p><ScenarioProgress progress={flow.progress?.[s.id]} scenario={s}/><footer><span>{level} · {s.difficulty.turns} schimburi maximum</span><b>Începe <Icon name="arrow"/></b></footer></div>
      </button>)}</div>
      <p className="conversation-note">Poți exersa oricare dintre situații, indiferent de traseul ales.</p>
    </> : <div className="conversation-workspace dc-workspace">
      <section className="conversation-brief dc-mission" aria-labelledby="dc-scenario-title">
        <div className="dc-mission-heading"><span className="dc-eyebrow">STUDIO DE CONVERSAȚIE</span><h1 id="dc-scenario-title">{selected.title}</h1></div>
        <ol className="dc-objectives" aria-label="Obiectivele misiunii">{selected.goals.map((goal, i) => <li key={goal} className={session?.achieved.includes(i) ? 'achieved' : ''} title={goal}><span aria-hidden="true">{session?.achieved.includes(i) ? '✓' : i + 1}</span>{goal}{session?.achieved.includes(i) && <span className="dc-sr-only"> — realizat</span>}</li>)}</ol>
        <button className="conversation-link dc-context-toggle" onClick={() => setContextOpen(open => !open)} aria-expanded={contextOpen} aria-controls="dc-context"><Icon name="context"/>{contextOpen ? 'Restrânge contextul' : 'Contextul situației'}<span aria-hidden="true">{contextOpen ? '−' : '+'}</span></button>
        <div id="dc-context" className="dc-context" hidden={!contextOpen}>
          <ScenarioProgress progress={flow.progress?.[selected.id]} scenario={selected} detail/><div><h2>Situația ta</h2><p className="dc-role">{selected.role}</p><p>{selected.brief}</p></div>
          <div className="dc-expectation"><h2>{level} · {selected.difficulty.label}</h2><p className="conversation-criteria">{selected.difficulty.expectation}</p><span>{selected.difficulty.turns} răspunsuri maximum · Obiectivele pot fi îndeplinite mai devreme.</span></div>
        </div>
      </section>
      <Panorama scenario={selected}/>
      <section className="conversation-dialogue dc-dialogue" aria-label="Conversație cu Nora" aria-busy={busy}>
        {flow.notice && <p className="conversation-notice" role="status">{flow.notice}</p>}
        {!session ? <>
          <div className="dc-partner-card dc-intro-card"><Portrait/><div><span className="dc-speaker">Nora <span>· Partenerul tău de conversație</span></span><h2>{restoring ? 'Reluăm conversația' : 'Pregătit să intri în rol?'}</h2><p>{restoring ? 'Pregătim istoricul și răspunsul tău nestrimis.' : 'Citește situația, apoi începe dialogul. Răspunzi în norvegiană, iar la final vezi ce ai reușit.'}</p></div></div>
          <div className="conversation-ready dc-ready">{restoring ? <p role={busy ? 'status' : undefined}>{busy ? 'Se reia conversația…' : 'Conversația așteaptă să fie reluată.'}</p>
            : !error && <><button className="conversation-primary" disabled={busy} onClick={flow.start}>{busy ? 'Se pregătește conversația…' : 'Începe conversația'}<Icon name="arrow"/></button><p>Ia-ți timp să formulezi răspunsul. Nu trebuie să fie perfect.</p></>}</div>
        </> : <>
          <div className="conversation-messages dc-messages" role="log" aria-live="polite">
            <div id="dc-history" className="dc-transcript" hidden={!historyOpen}>{olderMessages.map((m, i) => <article className={'conversation-message ' + m.role} key={i}><small>{m.role === 'user' ? 'Tu' : 'Nora'}</small><p lang="nb">{m.text}</p></article>)}</div>
            {currentMessage && <article className="conversation-message assistant dc-partner-card dc-current-line"><Portrait/><div><small className="dc-speaker">Nora</small><p lang="nb" tabIndex={0}>{currentMessage.text}</p></div></article>}
            {busy && flow.operation === 'turn' && <article className="conversation-message user conversation-pending"><small>Tu · se trimite</small><p lang="nb">{draft.trim()}</p></article>}
            {busy && <p className="dc-waiting" role="status">{flow.operation === 'start' ? 'Pregătim o conversație nouă…' : 'Nora pregătește răspunsul…'}</p>}
            <div ref={bottomRef}/>
          </div>
          <div className="dc-dialogue-tools">
            {olderMessages.length > 0 && <button className="conversation-link dc-history-toggle" onClick={() => setHistoryOpen(open => !open)} aria-expanded={historyOpen} aria-controls="dc-history"><Icon/>{historyOpen ? 'Ascunde istoricul' : `Istoricul conversației (${messages.length})`}</button>}
            {session.feedback && !session.done && <details className="conversation-feedback dc-feedback"><summary>Feedback pentru răspunsul tău</summary><p>{session.feedback}</p></details>}
          </div>
          {session.done ? <div ref={resultRef} className={'conversation-result dc-result dc-result--' + session.endReason} tabIndex={-1}>
            <span className="dc-result-icon"><Icon name={session.endReason === 'success' ? 'check' : 'context'}/></span><small>SESIUNE ÎNCHEIATĂ</small><h2>{session.endReason === 'success' ? 'Ai dus misiunea la capăt' : 'Ai ajuns la finalul sesiunii'}</h2>
            <p className="dc-result-score">{session.achieved.length} din {selected.goals.length} obiective realizate</p>
            {session.endReason === 'turn_limit' && <p>Ai folosit cele {session.maxTurns} răspunsuri disponibile. Poți relua situația ca să exersezi obiectivele rămase.</p>}
            <p>{session.feedback}</p>{session.endReason !== 'success' && <div className="dc-next-practice"><h3>De exersat</h3><ul>{selected.goals.filter((_, i) => !session.achieved.includes(i)).map(goal => <li key={goal}>{goal}</li>)}</ul></div>}
            <p className="scenario-progress-notice" role="status">{flow.progressNotice}</p><div className="dc-result-actions"><button className="conversation-primary" onClick={flow.again}>Exersează din nou</button><button className="conversation-link" onClick={flow.reset}>Alte situații</button></div>
          </div> : <>
            <form onSubmit={e => { e.preventDefault(); if (!blocked) flow.send(); }} className="conversation-compose dc-compose">
              <label htmlFor="scenario-answer"><Icon/>{busy ? 'Se pregătește răspunsul…' : 'Rândul tău'}<span>Răspunde în norvegiană</span></label>
              <div><textarea ref={inputRef} lang="nb" id="scenario-answer" value={draft} maxLength={1200} rows={2} disabled={busy} onChange={e => flow.setDraft(e.target.value)} placeholder="Scrie răspunsul tău…" aria-label="Răspunsul tău în norvegiană"/>
                <button className="conversation-primary" disabled={busy || blocked || !draft.trim()} type="submit">Trimite →</button></div>
              <footer><button type="button" className="conversation-link dc-help" onClick={() => setHint(!hint)} aria-expanded={hint} aria-controls="dc-hint"><Icon name="help"/>Un punct de pornire</button><span className="dc-character-count">{draft.length}/1200</span></footer>
              {hint && <p id="dc-hint" className="conversation-hint" lang="nb">{selected.hint}</p>}
            </form>
            {remaining <= 2 && <p className="conversation-notice dc-remaining" role="status">{remaining === 1 ? 'Mai ai un răspuns disponibil.' : 'Mai ai două răspunsuri disponibile.'}</p>}
          </>}
        </>}
        {error && <div ref={errorRef} className="conversation-error dc-error" role="alert" tabIndex={-1}><div><p>{error.message}</p>{draft && <p>Textul tău nestrimis a fost păstrat.</p>}</div>
          {error.kind === 'restart' ? <button className="conversation-primary" disabled={busy} onClick={flow.restart}>Începe o sesiune nouă</button>
            : error.kind === 'auth' ? <Link className="conversation-primary" to={loginUrl}>Conectează-te</Link>
            : <button className="conversation-primary" disabled={busy} onClick={flow.retry}>{error.kind === 'limit' ? 'Verifică din nou disponibilitatea' : 'Reîncearcă'}</button>}
        </div>}
      </section>
    </div>}
  </main>;
}
