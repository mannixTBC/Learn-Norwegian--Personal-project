import React, { useEffect, useRef, useState } from 'react';
import StudioIcon from './StudioIcon';
import { speakScenario } from '../../services/scenarioSpeech';

export default function ScenarioVoiceControls({ flow, blocked, reply, onFinish, onHelp, helpOpen, playbackRef, speak = speakScenario }) {
  const [typing,setTyping]=useState(false);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const recognition = useRef(null);
  const playback = useRef(null);
  const voiceEnabled = useRef(false);
  const latest = useRef({ flow, blocked });
  latest.current = { flow, blocked };
  const Recognition = typeof window === 'undefined' ? null : window.SpeechRecognition || window.webkitSpeechRecognition;
  const stop = () => {
    if (recognition.current) {
      const recorder = recognition.current;
      recognition.current = null;
      recorder.onresult = recorder.onerror = recorder.onend = null;
      recorder.abort();
    }
    playback.current?.abort();
    playback.current = null;
  };
  useEffect(() => () => stop(), []);
  useEffect(() => { stop(); setStatus('idle'); }, [flow.session?.turn, flow.busy, blocked]);

  useEffect(() => {
    if (voiceEnabled.current && reply && !flow.busy) void listen();
    // Only a new server reply triggers playback, never draft or progress updates.
  }, [reply]);

  useEffect(() => {
    if (!playbackRef) return;
    playbackRef.current = (messageIndex) => { if (!flow.busy && reply) void listen(false, messageIndex); };
    return () => { playbackRef.current = null; };
  });
  async function listen(slow = false, messageIndex) {
    voiceEnabled.current = true;
    stop(); setError(''); setStatus('loading');
    const controller = new AbortController();
    playback.current = controller;
    try {
      const result = await speak(flow.session.sessionToken, { slow, messageIndex,
        signal: controller.signal, onPlaybackStart: () => { if (!controller.signal.aborted) setStatus('speaking'); } });
      if (controller.signal.aborted) return;
      setStatus('idle');
      if (!result.ok) setError('Vocea nu a putut porni. Reîncearcă „Ascultă Nora”; replica rămâne disponibilă mai sus.');
    } catch {
      if (!controller.signal.aborted) { setStatus('idle'); setError('Redarea nu a reușit. Încearcă din nou.'); }
    }
  }
  function record() {
    if (!Recognition || flow.busy || blocked) return;
    if (recognition.current) { recognition.current.stop(); return; }
    stop(); setError('');
    voiceEnabled.current = true;
    const recorder = new Recognition();
    recognition.current = recorder;
    recorder.lang = 'nb-NO';
    recorder.continuous = false;
    recorder.interimResults = false;
    recorder.onresult = event => {
      if (recognition.current !== recorder || latest.current.flow.busy || latest.current.blocked) return;
      const transcript = Array.from(event.results).filter(result => result.isFinal)
        .map(result => result[0].transcript).join(' ').trim();
      if (transcript) latest.current.flow.setDraft(transcript);
    };
    recorder.onerror = event => {
      if (recognition.current !== recorder) return;
      setError(event.error === 'not-allowed' || event.error === 'service-not-allowed'
        ? 'Permite accesul la microfon în browser, apoi încearcă din nou.'
        : event.error === 'no-speech' ? 'Nu am auzit un răspuns. Apasă microfonul și încearcă din nou.'
          : 'Recunoașterea vocală nu este disponibilă momentan. Reîncearcă după verificarea permisiunilor.');
      stop();
      setStatus('idle');
    };
    recorder.onend = () => { if (recognition.current === recorder) { recognition.current = null; setStatus('idle'); } };
    try { recorder.start(); setStatus('listening'); }
    catch { stop(); setStatus('idle'); setError('Microfonul nu a putut porni. Verifică permisiunea din browser.'); }
  }
  const active = ['listening', 'speaking'].includes(status);
  return <section className="scenario-voice" aria-label="Răspuns vocal">
    <p className="scenario-voice__status" hidden={Boolean(onHelp) && status === 'idle' && !flow.busy} role="status">{flow.busy ? 'Nora pregătește răspunsul…' : status === 'listening' ? 'Te ascult…' : status === 'speaking' ? 'Nora vorbește…' : status === 'loading' ? 'Pregătim vocea…' : 'Rândul tău'}</p>
    <div className={'scenario-voice__wave' + (active ? ' is-active' : '')} aria-hidden="true">{Array.from({ length: 23 }, (_, i) => <i key={i} style={{ height: 8 + (i * 17 % 30), animationDelay: `${i * 45}ms` }}/>)}</div>
    <div className="airy-actions"><button type="button" className="scenario-voice__mic" onClick={record} disabled={!Recognition || flow.busy || Boolean(blocked)} aria-label={status === 'listening' ? 'Încheie înregistrarea' : 'Înregistrează răspunsul'} aria-pressed={status === 'listening'}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><rect x="9" y="2" width="6" height="13" rx="3"/><path d="M5 10v2a7 7 0 0 0 14 0v-2M12 19v3m-4 0h8"/></svg>
    </button>{onHelp && <button type="button" className="airy-help" onClick={onHelp} aria-expanded={helpOpen} aria-controls="guided-hint"><span aria-hidden="true"><StudioIcon name="hint"/></span>Indiciu</button>}<button type="button" className="airy-end" aria-label="Scrie răspunsul" aria-expanded={typing} onClick={()=>{stop();setStatus('idle');setTyping(!typing);}}><span><StudioIcon name="keyboard"/></span>Scrie</button></div>
    <p className="scenario-voice__caption">{status === 'listening' ? 'Apasă din nou când ai terminat.' : 'Apasă și vorbește'}</p>
    {!Recognition && <p className="scenario-voice__notice">Browserul nu oferă recunoaștere vocală. Folosește un browser compatibil cu recunoaștere vocală.</p>}
    {error && <p className="scenario-voice__notice" role="alert">{error}</p>}
    {(typing || !Recognition) && <form className="studio-compose" onSubmit={e=>{e.preventDefault();stop();flow.send();}}><label htmlFor="studio-answer">Răspunsul tău</label><textarea id="studio-answer" value={flow.draft} maxLength={1200} disabled={flow.busy||Boolean(blocked)} onChange={e=>flow.setDraft(e.target.value)} placeholder="Scrie în norvegiană…"/><button className="studio-primary" disabled={!flow.draft.trim()||flow.busy||Boolean(blocked)}>Trimite răspunsul</button></form>}
    {flow.draft && !typing && Recognition && <div className="scenario-voice__draft"><small>Am auzit</small><p lang="nb">{flow.draft}</p><button type="button" className="conversation-primary" disabled={flow.busy || Boolean(blocked) || status === 'listening'} onClick={() => { stop(); setStatus('idle'); flow.send(); }}>Trimite răspunsul vocal</button></div>}
    <div className="scenario-voice__tools" hidden={Boolean(onHelp) && !helpOpen && !active}><button type="button" onClick={() => listen()} disabled={!reply || flow.busy} aria-label="Ascultă Nora">↻ Repetă</button><button type="button" onClick={() => listen(true)} disabled={!reply || flow.busy}>Mai lent</button>{active && <button type="button" onClick={() => { stop(); setStatus('idle'); }}>Oprește sunetul</button>}</div>
    <details className="scenario-voice__extras" hidden={Boolean(onHelp) && !helpOpen}><summary>Despre microfon</summary>
    <small className="scenario-voice__privacy">Recunoașterea vocală este oferită de browser și poate folosi serviciul său online.</small></details>
    {onFinish&&<button type="button" className="studio-finish" onClick={()=>{stop();onFinish();}}><StudioIcon name="flag"/>Încheie conversația</button>}
  </section>;
}
