import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import StudioHeader from './StudioHeader';
import StudioArtwork from './StudioArtwork';
import StudioIcon from './StudioIcon';
import StudioTranslation from './StudioTranslation';
import useFreeVoiceConversation from './useFreeVoiceConversation';
import './FreeConversation.css';

export default function FreeConversation({ level }) {
  const voice = useFreeVoiceConversation(level);
  const { session, messages, status, error, ended, supported } = voice;
  const log = useRef(null);
  useEffect(() => {
    if (log.current) log.current.scrollTop = log.current.scrollHeight;
  }, [messages.length]);
  const running = ['connecting', 'thinking', 'speaking', 'listening'].includes(status);
  const label = status === 'connecting' ? 'Conectăm microfonul.'
    : status === 'thinking' ? 'Nora pregătește răspunsul.'
      : status === 'speaking' ? 'Nora vorbește.'
        : status === 'listening' ? 'Te ascult.'
          : status === 'paused' ? 'Conversație în pauză.' : 'Începe o conversație cu Nora';
  return <section className="conversation-studio studio-design natural-conversation studio-free studio-free-airy" aria-label="Dialog liber" data-state={ended ? 'result' : 'conversation'}>
    <StudioHeader level={level} back={'/studio?nivel=' + level} locked={Boolean(session) || running}/>
    {ended ? <div className="studio-free-result">
      <h1>Ai vorbit în norvegiană!</h1>
      <p>{messages.filter(m => m.role === 'user').length} răspunsuri în dialogul cu Nora.</p>
      <button className="studio-primary" onClick={voice.restart}>Începe un dialog nou</button>
      <Link className="studio-text-link" to={'/studio?nivel=' + level}>Înapoi la studio</Link>
    </div> : <>
      {messages.length === 0 && <div className="free-nora-welcome">
        <div className="free-nora-portrait"><StudioArtwork scene="avatar"/></div>
        <p>Nora</p>
      </div>}
      <div ref={log} className="airy-messages" role="log" aria-live="polite" aria-label="Conversație cu Nora">
        {messages.length === 0 && <article className="airy-message assistant free-opening">
          <div className="airy-message-copy">
            <small>Nora</small>
            <p className="free-opening-copy">{running ? 'Pregătesc prima replică…' : 'Prima replică a Norei va apărea aici.'}</p>
          </div>
        </article>}
        {messages.map((m, i) => <article key={i} className={'airy-message ' + m.role}>
          {m.role === 'assistant' && <div className="airy-avatar"><StudioArtwork scene="avatar"/></div>}
          <div className="airy-message-copy">
            {m.role === 'assistant' && <small>Nora</small>}
            <p lang="nb">{m.text}{m.role === 'assistant' && <button className="airy-replay" aria-label="Ascultă Nora"
              disabled={!running || status === 'thinking' || status === 'connecting'} onClick={() => voice.replay(m.text, m.sessionToken)}><StudioIcon name="play"/></button>}</p>
            {m.role === 'assistant' && <StudioTranslation text={m.text} translation={m.translation}/>}
            {m.correction && <details className="conversation-feedback"><summary>O mică corectare</summary>
              <p><span lang="nb">{m.correction.original}</span> → <strong lang="nb">{m.correction.corrected}</strong></p>
              <p>{m.correction.explanation}</p>
            </details>}
          </div>
        </article>)}
      </div>
      <div className="free-conversation-dock">
        {session?.simplified && <p className="conversation-notice" role="status">Nora a simplificat întrebarea. Nivelul tău rămâne {level}.</p>}
        <section className="scenario-voice" aria-label="Dialog vocal">
          <p className="scenario-voice__status" role="status">{label}</p>
          <div className={'scenario-voice__wave' + (['speaking', 'listening'].includes(status) ? ' is-active' : '')} aria-hidden="true">
            {Array.from({ length: 23 }, (_, i) => <i key={i} style={{ height: 8 + (i * 17 % 30), animationDelay: `${i * 45}ms` }}/>)}
          </div>
          <div className="airy-actions">
            <button type="button" className="scenario-voice__mic" disabled={!supported}
              onClick={running ? voice.pause : voice.start} aria-pressed={running}
              aria-label={running ? 'Pune conversația în pauză' : session ? 'Reia conversația' : 'Pornește dialogul'}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><rect x="9" y="2" width="6" height="13" rx="3"/><path d="M5 10v2a7 7 0 0 0 14 0v-2M12 19v3m-4 0h8"/></svg>
            </button>
            {(session || running) && <button type="button" className="free-pause" onClick={running ? voice.pause : voice.start} disabled={!supported}>
              <span aria-hidden="true">{running ? <svg viewBox="0 0 24 24"><path d="M7 5h3v14H7zm7 0h3v14h-3z"/></svg> : <StudioIcon name="play"/>}</span>
              {running ? 'Pauză' : 'Reia'}
            </button>}
          </div>
          <p className="scenario-voice__caption">{running ? 'Răspunsul se trimite automat.' : 'Apasă o dată pe microfon. Nora începe conversația.'}</p>
          {!supported && <p className="scenario-voice__notice" role="alert">Dialogul vocal nu este disponibil în acest browser. Deschide aplicația într-un browser cu recunoaștere vocală și acces la microfon.</p>}
          {error && <div className="conversation-error" role="alert"><p>{error}</p><button className="studio-primary" disabled={!supported} onClick={voice.start}>Reîncearcă</button></div>}
          {(session || running) && <button type="button" className="studio-finish" onClick={voice.finish}><StudioIcon name="flag"/>Încheie conversația</button>}
        </section>
      </div>
    </>}
  </section>;
}
