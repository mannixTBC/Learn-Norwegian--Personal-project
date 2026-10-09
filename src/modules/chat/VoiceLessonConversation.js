import React, { useEffect, useRef, useState } from 'react';
import { practiceRequest, audioBlob, recordPracticeAnswer, recordingPayload } from '../../services/voicePractice';
import './VoiceLessonConversation.css';

export default function VoiceLessonConversation({ level, lessonId, pathId, lessonTitle }) {
  const [configured, setConfigured] = useState(null);
  const [status, setStatus] = useState('idle');
  const [session, setSession] = useState(null);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [error, setError] = useState('');
  const [automatic, setAutomatic] = useState(true);
  const [paused, setPaused] = useState(false);
  const controller = useRef(null);
  const recording = useRef(null);
  const playback = useRef(null);
  const questionAudio = useRef(new Map());
  const pendingUpload = useRef(null);
  const busy = useRef(false);
  const mounted = useRef(false);
  const automaticRef = useRef(true);
  const pausedRef = useRef(false);
  const autoStartTimer = useRef(null);

  const stopPlayback = () => {
    const player = playback.current;
    if (player) { player.audio.onended = null; player.audio.onerror = null; player.audio.pause(); player.audio.src = ''; URL.revokeObjectURL(player.url); playback.current = null; }
  };
  useEffect(() => {
    mounted.current = true;
    const abort = new AbortController();
    fetch('/api/voice/status', { signal: abort.signal }).then((response) => response.json()).then((data) => {
      if (!abort.signal.aborted) setConfigured(data.configured === true);
    }).catch(() => { if (!abort.signal.aborted) setConfigured(false); });
    return () => { mounted.current = false; abort.abort(); controller.current?.abort(); recording.current?.cancel(); clearTimeout(autoStartTimer.current); stopPlayback(); };
  }, []);

  const play = async (data, isFeedback = false, onEnded) => {
    stopPlayback();
    const url = URL.createObjectURL(audioBlob(data));
    const audio = new Audio(url);
    const player = { audio, url };
    playback.current = player;
    audio.onended = () => {
      stopPlayback();
      if (!mounted.current) return;
      setStatus(isFeedback ? 'ended' : 'question');
      onEnded?.();
    };
    audio.onerror = () => {
      if (playback.current !== player) return;
      stopPlayback();
      if (mounted.current) { setError('Vocea nu a putut fi redată. Poți reasculta sau continua folosind textul.'); setStatus(isFeedback ? 'ended' : 'question'); }
    };
    setStatus(isFeedback ? 'feedbackAudio' : 'speaking');
    try { await audio.play(); }
    catch (_) {
      if (playback.current !== player) return;
      stopPlayback();
      if (mounted.current) { setStatus(isFeedback ? 'ended' : 'question'); setError('Apasă „Repetă întrebarea” pentru redarea vocii.'); }
    }
  };
  const showQuestion = async (currentSession, nextIndex, signal, continueAutomatically = false, currentAnswers = answers) => {
    setStatus('loading'); setIndex(nextIndex);
    let data = questionAudio.current.get(nextIndex);
    if (!data) {
      data = await practiceRequest('question', { sessionToken: currentSession.sessionToken, index: nextIndex }, signal);
      if (signal.aborted) return;
      questionAudio.current.set(nextIndex, data);
    }
    if (!signal.aborted && mounted.current) await play(data, false, continueAutomatically ? () => {
      clearTimeout(autoStartTimer.current);
      autoStartTimer.current = setTimeout(() => {
        if (mounted.current && !signal.aborted && automaticRef.current && !pausedRef.current) record(currentSession, nextIndex, currentAnswers);
      }, 650);
    } : undefined);
  };
  const stop = () => {
    clearTimeout(autoStartTimer.current); controller.current?.abort(); recording.current?.cancel(); recording.current = null; pendingUpload.current = null; stopPlayback(); busy.current = false;
    pausedRef.current = false; setPaused(false);
    setStatus('ended');
  };
  const start = async () => {
    if (busy.current) return;
    busy.current = true; controller.current?.abort(); stopPlayback();
    const abort = new AbortController(); controller.current = abort;
    questionAudio.current.clear(); pendingUpload.current = null; pausedRef.current = false; setPaused(false); setAnswers([]); setFeedback(null); setError(''); setSession(null); setIndex(0); setStatus('loading');
    try {
      const data = await practiceRequest('start', { level, lessonId, pathId }, abort.signal);
      if (abort.signal.aborted || !mounted.current) return;
      setSession(data);
      await showQuestion(data, 0, abort.signal, automaticRef.current, []);
    } catch (err) { if (!abort.signal.aborted && mounted.current) { setError(err.message); setStatus('question'); } }
    finally { if (!abort.signal.aborted) busy.current = false; }
  };
  const finish = async (currentAnswers, currentSession = session) => {
    const signal = controller.current.signal;
    setStatus('evaluating'); setError('');
    try {
      const result = await practiceRequest('feedback', { sessionToken: currentSession.sessionToken, answers: currentAnswers }, signal);
      if (signal.aborted || !mounted.current) return;
      setFeedback(result);
      if (result.audioBase64) await play(result, true);
      else { setStatus('ended'); setError('Feedbackul este disponibil în scris. Vocea nu a putut fi generată.'); }
    } catch (err) { if (!signal.aborted && mounted.current) { setError(err.message); setStatus('ready'); } }
  };
  const uploadAnswer = async (payload, currentSession = session, currentAnswers = answers) => {
    const signal = controller.current.signal;
    setStatus('transcribing'); setError('');
    try {
      const result = await practiceRequest('transcribe', payload, signal);
      if (signal.aborted || !mounted.current) return;
      pendingUpload.current = null;
      const next = [...currentAnswers, result]; setAnswers(next);
      if (next.length === 3) await finish(next, currentSession);
      else if (automaticRef.current && !pausedRef.current) await showQuestion(currentSession, next.length, signal, true, next);
      else setStatus('ready');
    } catch (err) { if (!signal.aborted && mounted.current) { setError(err.message); setStatus('question'); } }
    finally { if (!signal.aborted) busy.current = false; }
  };
  const submitRecording = async (blob, duration, currentSession, currentIndex, currentAnswers) => {
    recording.current = null;
    const signal = controller.current.signal;
    setStatus('transcribing');
    try {
      if (duration < 0.4 || blob.size < 100) throw new Error('Înregistrarea este prea scurtă. Încearcă din nou.');
      const payload = await recordingPayload(blob, signal);
      if (signal.aborted || !mounted.current) return;
      pendingUpload.current = { sessionToken: currentSession.sessionToken, index: currentIndex, duration, ...payload };
      await uploadAnswer(pendingUpload.current, currentSession, currentAnswers);
    } catch (err) { if (!signal.aborted && mounted.current) { setError(err.message); setStatus('question'); busy.current = false; } }
  };
  const record = async (currentSession = session, currentIndex = index, currentAnswers = answers) => {
    if (busy.current) return;
    busy.current = true; stopPlayback(); setError(''); setStatus('microphone');
    const signal = controller.current.signal;
    try {
      recording.current = await recordPracticeAnswer({ signal, onComplete: (blob, duration) => submitRecording(blob, duration, currentSession, currentIndex, currentAnswers),
        onError: (err) => { if (!signal.aborted && mounted.current) { setError(err.message); setStatus('question'); busy.current = false; } },
      });
      if (!signal.aborted && mounted.current) setStatus('recording');
    } catch (err) { if (!signal.aborted && mounted.current) { setError(err.message); setStatus('question'); busy.current = false; } }
  };
  const listen = async (nextIndex = index, continueAutomatically = automaticRef.current) => {
    if (busy.current) return;
    busy.current = true; setError('');
    const signal = controller.current.signal;
    try { await showQuestion(session, nextIndex, signal, continueAutomatically); }
    catch (err) { if (!signal.aborted && mounted.current) { setError(err.message); setStatus('question'); } }
    finally { if (!signal.aborted) busy.current = false; }
  };
  const askFeedback = async () => {
    if (busy.current || feedback) return;
    busy.current = true;
    try { await finish(answers); } finally { if (!controller.current.signal.aborted) busy.current = false; }
  };
  const pause = () => {
    clearTimeout(autoStartTimer.current);
    recording.current?.cancel(); recording.current = null; stopPlayback(); busy.current = false;
    pausedRef.current = true; setPaused(true); setStatus('question'); setError('');
  };
  const resume = () => {
    pausedRef.current = false; setPaused(false); listen(index, true);
  };
  const active = !['idle', 'ended'].includes(status);
  const canAnswer = session && answers.length <= index && ['question', 'speaking'].includes(status);
  const labels = { idle: 'Pregătit de practică', loading: 'Pregătim întrebarea…', speaking: 'Nora vorbește…', question: 'Răspunde când ești pregătit', microphone: 'Pornim microfonul…', recording: 'Te ascult · maximum 30 de secunde', transcribing: 'Am înțeles, un moment…', ready: 'Răspuns primit', evaluating: 'Pregătim feedbackul…', feedbackAudio: 'Feedbackul tău', ended: 'Practică încheiată' };

  return <section className="voice-lesson" aria-labelledby="voice-lesson-title">
    <p className="lesson-eyebrow">Pasul 7 · Practică vocală</p>
    <h1 id="voice-lesson-title">Hai să vorbim în norvegiană</h1>
    <p className="lesson-lead">Trei întrebări din „{lessonTitle}”. Răspunzi vocal, apoi primești un feedback scurt.</p>
    <div className={`voice-lesson__card ${status === 'idle' ? 'voice-lesson__card--welcome' : ''}`}>
      {status === 'idle' && <div className="voice-lesson__art" aria-hidden="true" />}
      <div className="voice-lesson__partner"><span className="voice-lesson__avatar" aria-hidden="true"><span className="voice-lesson__avatar-letter">N</span><picture className="voice-lesson__portrait"><source media="(min-width: 861px)" srcSet="/images/voice/nora-avatar.webp" /><img alt="" width="56" height="56" /></picture></span><div><strong>Nora</strong><span>Voce AI · {level}</span></div><span className={`voice-lesson__status ${active ? 'voice-lesson__status--active' : ''}`} role="status">{paused ? 'Conversație în pauză' : labels[status]}</span></div>
      {status === 'idle' && <div className="voice-lesson__welcome"><h2>Exersează ce ai învățat</h2><p>Nora pune trei întrebări, iar conversația continuă automat după răspunsurile tale.</p><ul><li>3 întrebări</li><li>Mod hands-free</li><li>Feedback final</li></ul>
        <label className="voice-lesson__mode"><input type="checkbox" checked={automatic} onChange={(event) => { automaticRef.current = event.target.checked; setAutomatic(event.target.checked); }} /><span><strong>Conversație automată</strong><small>Microfonul pornește după fiecare întrebare și trimite răspunsul după 4 secunde de liniște.</small></span></label>
      </div>}
      {configured === false && <p className="voice-lesson__notice">Practica vocală nu este disponibilă momentan. Poți finaliza lecția și reveni mai târziu.</p>}
      {error && <p className="voice-lesson__error" role="alert">{error}</p>}
      {session && active && !['evaluating', 'feedbackAudio'].includes(status) && <div className="voice-lesson__question"><small>Întrebarea {index + 1} din 3</small><p lang="nb">{session.questions[index]}</p></div>}
      {answers.length > 0 && <div className="voice-lesson__transcript" aria-label="Răspunsurile tale">
        {answers.map((answer) => <div key={answer.index} className="voice-lesson__message voice-lesson__message--user"><small>Răspunsul {answer.index + 1}</small><p lang="nb">{answer.text}</p></div>)}
      </div>}
      {feedback && <div className="voice-lesson__message voice-lesson__feedback"><small>Feedbackul tău</small><p>{feedback.text}</p></div>}
      <div className="voice-lesson__controls">
        {!active && <button type="button" className="voice-lesson__primary" disabled={configured !== true} onClick={start}>{status === 'ended' ? 'Exersează din nou' : 'Începe practica vocală'}</button>}
        {active && !session && status === 'question' && <button type="button" onClick={start}>Încearcă din nou</button>}
        {paused && <button type="button" className="voice-lesson__primary" onClick={resume}>Continuă conversația</button>}
        {session && !paused && ['question', 'speaking', 'ready'].includes(status) && answers.length < 3 && <button type="button" onClick={() => listen()}>Repetă întrebarea</button>}
        {canAnswer && !paused && !pendingUpload.current && <button type="button" className="voice-lesson__primary" onClick={() => record()}>{automatic ? 'Răspunde acum' : 'Răspunde'}</button>}
        {canAnswer && pendingUpload.current && <button type="button" className="voice-lesson__primary" onClick={() => {
          if (busy.current) return;
          busy.current = true; uploadAnswer(pendingUpload.current);
        }}>Retrimite răspunsul</button>}
        {status === 'recording' && <button type="button" className="voice-lesson__primary" onClick={() => recording.current?.stop()}>Am terminat răspunsul</button>}
        {automatic && active && !paused && ['speaking', 'question', 'recording'].includes(status) && <button type="button" onClick={pause}>Pauză</button>}
        {!automatic && active && answers.length > index && answers.length < 3 && ['ready', 'question', 'speaking'].includes(status) && <button type="button" className="voice-lesson__primary" onClick={() => listen(answers.length, false)}>Următoarea întrebare</button>}
        {active && answers.length >= 2 && ['ready', 'question', 'speaking'].includes(status) && <button type="button" onClick={askFeedback}>Încheie și oferă feedback</button>}
        {feedback?.audioBase64 && status === 'ended' && <button type="button" onClick={() => play(feedback, true)}>Ascultă feedbackul</button>}
        {active && <button type="button" onClick={stop}>Oprește practica</button>}
      </div>
      {status === 'idle' && <p className="voice-lesson__start-caption">O singură apăsare pornește conversația. Poți face pauză oricând.</p>}
      <p className="voice-lesson__hint">{automatic ? 'După ce Nora termină întrebarea, vorbește natural. Răspunsul este trimis după 4 secunde de liniște sau când apeși „Am terminat răspunsul”.' : 'Ascultă întrebarea, apasă „Răspunde” și vorbește. Poți trimite răspunsul înainte de limita de timp.'}</p>
      <p className="voice-lesson__privacy">Vocea este generată de AI. În modul automat, microfonul pornește după fiecare întrebare, maximum 30 de secunde pe răspuns. Răspunsurile sunt trimise către OpenAI; înregistrările nu sunt salvate de aplicație.</p>
    </div>
  </section>;
}
