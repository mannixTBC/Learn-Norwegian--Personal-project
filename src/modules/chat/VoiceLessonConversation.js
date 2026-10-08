import React, { useEffect, useRef, useState } from 'react';
import { createVoiceConversation } from '../../services/voiceConversation';
import './VoiceLessonConversation.css';

export default function VoiceLessonConversation({ level, lessonId, pathId, lessonTitle }) {
  const [status, setStatus] = useState('idle');
  const [configured, setConfigured] = useState(null);
  const [error, setError] = useState('');
  const [messages, setMessages] = useState([]);
  const [muted, setMuted] = useState(false);
  const [playbackBlocked, setPlaybackBlocked] = useState(false);
  const [answers, setAnswers] = useState(0);
  const connection = useRef(null);
  const controller = useRef(null);
  const ending = useRef(false);
  const busy = useRef(false);
  const mounted = useRef(false);
  const transcript = useRef(null);

  useEffect(() => {
    mounted.current = true;
    const abort = new AbortController();
    fetch('/api/voice/status', { signal: abort.signal }).then((response) => response.json()).then((data) => {
      if (mounted.current) setConfigured(data.configured === true);
    }).catch(() => { if (!abort.signal.aborted) setConfigured(false); });
    return () => { mounted.current = false; abort.abort(); controller.current?.abort(); connection.current?.close(); };
  }, []);

  useEffect(() => { transcript.current?.scrollTo({ top: transcript.current.scrollHeight, behavior: 'smooth' }); }, [messages]);

  const receive = (event) => {
    if (!mounted.current) return;
    if (event.type === 'practice.progress') setAnswers(event.answers);
    if (event.type === 'practice.feedback_started') { ending.current = true; setMuted(true); setStatus('feedback'); }
    if (event.type === 'error') {
      setError('Partenerul vocal a întâmpinat o problemă. Oprește dialogul și încearcă din nou.');
      busy.current = false;
      ending.current = false;
      setStatus('listening');
    }
    if (event.type === 'input_audio_buffer.speech_started') setStatus('hearing');
    if (event.type === 'input_audio_buffer.speech_stopped') setStatus('thinking');
    if (event.type === 'response.created') { busy.current = true; setStatus(ending.current ? 'feedback' : 'thinking'); }
    if (event.type === 'output_audio_buffer.started') setStatus(ending.current ? 'feedback' : 'speaking');
    if (event.type === 'response.done') {
      busy.current = false;
      if (['failed', 'incomplete', 'cancelled'].includes(event.response?.status)) {
        ending.current = false;
        connection.current?.mute(false);
        setMuted(false);
        setStatus('listening');
        setError(event.response?.status_details?.reason === 'max_output_tokens'
          ? 'Răspunsul a atins limita audio. Poți încheia cu un feedback scurt.'
          : 'Răspunsul vocal a fost întrerupt. Poți încheia cu feedback sau opri dialogul.');
      }
    }
    if (event.type === 'output_audio_buffer.stopped' || event.type === 'output_audio_buffer.cleared') {
      if (ending.current && event.type === 'output_audio_buffer.stopped') {
        connection.current?.close(); connection.current = null; ending.current = false; setStatus('ended');
      } else setStatus('listening');
    }
    if (event.type === 'playback.blocked') setPlaybackBlocked(true);
    const isUser = event.type === 'conversation.item.input_audio_transcription.completed';
    if (isUser || event.type === 'response.output_audio_transcript.done') {
      if (!event.transcript?.trim()) return;
      const id = `${isUser ? 'user' : 'assistant'}-${event.item_id || event.response_id}`;
      setMessages((current) => current.some((item) => item.id === id) ? current : [...current, { id, role: isUser ? 'user' : 'assistant', text: event.transcript }].slice(-40));
    }
  };

  const stop = () => {
    controller.current?.abort(); connection.current?.close(); connection.current = null;
    busy.current = false; ending.current = false; setStatus('ended'); setMuted(false);
  };
  const start = async () => {
    controller.current?.abort(); connection.current?.close();
    const abort = new AbortController(); controller.current = abort;
    setError(''); setMessages([]); setAnswers(0); setMuted(false); setPlaybackBlocked(false); setStatus('connecting');
    ending.current = false; busy.current = false;
    try {
      const session = await createVoiceConversation({ level, lessonId, pathId, signal: abort.signal, onEvent: receive,
        onDisconnect: (message) => { if (mounted.current && !abort.signal.aborted) { connection.current = null; setError(message); setStatus('ended'); } },
      });
      if (abort.signal.aborted || !mounted.current) { session.close(); return; }
      connection.current = session; busy.current = true; setStatus('thinking'); session.start();
    } catch (err) {
      if (!abort.signal.aborted && mounted.current) { setError(err.message); setStatus('idle'); }
    }
  };
  const request = (type) => {
    if (busy.current) return;
    try {
      if (type === 'feedback') { ending.current = true; setMuted(true); setStatus('feedback'); }
      busy.current = true;
      connection.current?.[type]();
    } catch (err) { busy.current = false; ending.current = false; setError(err.message); setStatus('listening'); }
  };
  const active = !['idle', 'ended', 'connecting'].includes(status);
  const labels = { idle: 'Pregătit de conversație', connecting: 'Conectăm partenerul vocal…', listening: muted ? 'Microfon oprit' : 'Te ascult', hearing: 'Te ascult…', thinking: 'Pregătesc răspunsul…', speaking: 'Nora vorbește', feedback: 'Feedbackul tău', ended: 'Dialog încheiat' };
  const canRequest = active && status === 'listening' && !busy.current;

  return <section className="voice-lesson" aria-labelledby="voice-lesson-title">
    <p className="lesson-eyebrow">Pasul 7 · Practică vocală</p>
    <h1 id="voice-lesson-title">Hai să vorbim în norvegiană</h1>
    <p className="lesson-lead">Aplică ce ai învățat în „{lessonTitle}”: trei întrebări scurte, apoi un feedback pe scurt.</p>
    <div className="voice-lesson__card">
      <div className="voice-lesson__partner"><span className="voice-lesson__avatar" aria-hidden="true">N</span><div><strong>Nora</strong><span>Partener virtual · {level}</span></div><span className={`voice-lesson__status ${active ? 'voice-lesson__status--active' : ''}`} role="status">{labels[status]}</span></div>
      {configured === false && <p className="voice-lesson__notice">Dialogul vocal nu este disponibil momentan. Poți finaliza lecția și reveni mai târziu.</p>}
      {error && <p className="voice-lesson__error" role="alert">{error}</p>}
      {messages.length > 0 && <div className="voice-lesson__transcript" ref={transcript} aria-label="Transcrierea conversației">
        {messages.map((message) => <div key={message.id} className={`voice-lesson__message voice-lesson__message--${message.role}`}><small>{message.role === 'user' ? 'Tu' : 'Nora'}</small><p>{message.text}</p></div>)}
      </div>}
      <div className="voice-lesson__controls">
        {!active && status !== 'connecting' && <button type="button" className="voice-lesson__primary" disabled={configured !== true} onClick={start}>{status === 'ended' ? 'Începe un dialog nou' : 'Pornește dialogul vocal'}</button>}
        {(active || status === 'connecting') && <button type="button" onClick={stop}>Oprește dialogul</button>}
        {active && <><button type="button" disabled={status === 'feedback'} aria-pressed={muted} onClick={() => { connection.current?.mute(!muted); setMuted(!muted); }}>{muted ? 'Pornește microfonul' : 'Oprește microfonul'}</button><button type="button" disabled={!canRequest} onClick={() => request('help')}>Am nevoie de ajutor</button><button type="button" className="voice-lesson__primary" disabled={!canRequest} onClick={() => request('feedback')}>Încheie și oferă feedback</button></>}
        {playbackBlocked && active && <button type="button" onClick={() => connection.current?.play().then(() => setPlaybackBlocked(false)).catch(() => setError('Permite redarea audio în browser.'))}>Redă vocea</button>}
      </div>
      <p className="voice-lesson__hint">{active ? `${answers}/3 răspunsuri · ` : ''}Ascultă întrebarea, apoi răspunde scurt. Poți cere ajutor sau încheia după două răspunsuri. Dialogul este opțional.</p>
      <p className="voice-lesson__privacy">Microfonul pornește doar la cererea ta și ascultă între replicile Norei. Vocea este transmisă către OpenAI; aplicația nu salvează înregistrarea. Maximum 3 minute.</p>
    </div>
  </section>;
}
