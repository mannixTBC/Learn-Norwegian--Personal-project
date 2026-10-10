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
  const controller = useRef(null);
  const recording = useRef(null);
  const playback = useRef(null);
  const questionAudio = useRef(new Map());
  const pendingUpload = useRef(null);
  const busy = useRef(false);
  const mounted = useRef(false);
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
        if (mounted.current && !signal.aborted) record(currentSession, nextIndex, currentAnswers);
      }, 1_200);
    } : undefined);
  };
  const stop = () => {
    clearTimeout(autoStartTimer.current); controller.current?.abort(); recording.current?.cancel(); recording.current = null; pendingUpload.current = null; stopPlayback(); busy.current = false;
    setStatus('ended');
  };
  const start = async () => {
    if (busy.current) return;
    busy.current = true; controller.current?.abort(); stopPlayback();
    const abort = new AbortController(); controller.current = abort;
    questionAudio.current.clear(); pendingUpload.current = null; setAnswers([]); setFeedback(null); setError(''); setSession(null); setIndex(0); setStatus('loading');
    try {
      const data = await practiceRequest('start', { level, lessonId, pathId }, abort.signal);
      if (abort.signal.aborted || !mounted.current) return;
      setSession(data);
      await showQuestion(data, 0, abort.signal, true, []);
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
      else await showQuestion(currentSession, next.length, signal, true, next);
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
        onNoSpeech: () => {
          if (!signal.aborted && mounted.current) {
            recording.current = null;
            setError('Nu am auzit încă un răspuns. Microfonul continuă să asculte.');
            busy.current = false;
            autoStartTimer.current = setTimeout(() => record(currentSession, currentIndex, currentAnswers), 900);
          }
        },
        onError: (err) => { if (!signal.aborted && mounted.current) { setError(err.message); setStatus('question'); busy.current = false; } },
      });
      if (!signal.aborted && mounted.current) setStatus('recording');
    } catch (err) { if (!signal.aborted && mounted.current) { setError(err.message); setStatus('question'); busy.current = false; } }
  };
  const active = !['idle', 'ended'].includes(status);
  const labels = { idle: 'Pregătit de practică', loading: 'Pregătim întrebarea…', speaking: 'Nora vorbește…', question: 'Răspunde când ești pregătit', microphone: 'Pornim microfonul…', recording: 'Te ascult · maximum 30 de secunde', transcribing: 'Am înțeles, un moment…', ready: 'Răspuns primit', evaluating: 'Pregătim feedbackul…', feedbackAudio: 'Feedbackul tău', ended: 'Practică încheiată' };

  return <section className="voice-lesson" aria-labelledby="voice-lesson-title">
    <p className="lesson-eyebrow">Pasul 7 · Practică vocală</p>
    <h1 id="voice-lesson-title">Hai să vorbim în norvegiană</h1>
    <p className="lesson-lead">Trei întrebări din „{lessonTitle}”. Răspunzi vocal, apoi primești un feedback scurt.</p>
    <div className={`voice-lesson__card ${status === 'idle' ? 'voice-lesson__card--welcome' : ''}`}>
      {status === 'idle' && <div className="voice-lesson__art" aria-hidden="true" />}
      <div className="voice-lesson__partner"><span className="voice-lesson__avatar" aria-hidden="true"><span className="voice-lesson__avatar-letter">N</span><picture className="voice-lesson__portrait"><source media="(min-width: 861px)" srcSet="/images/voice/nora-avatar.webp" /><img alt="" width="56" height="56" /></picture></span><div><strong>Nora</strong><span>Voce AI · {level}</span></div><span className={`voice-lesson__status ${active ? 'voice-lesson__status--active' : ''}`} role="status">{labels[status]}</span></div>
      {status === 'idle' && <div className="voice-lesson__welcome"><h2>Exersează ce ai învățat</h2><p>Nora pune trei întrebări, iar conversația continuă automat după răspunsurile tale.</p><ul><li>3 întrebări</li><li>Dialog automat</li><li>Feedback final</li></ul></div>}
      {configured === false && <p className="voice-lesson__notice">Practica vocală nu este disponibilă momentan. Poți finaliza lecția și reveni mai târziu.</p>}
      {error && <p className="voice-lesson__error" role="alert">{error}</p>}
      {session && active && !['evaluating', 'feedbackAudio'].includes(status) && <div className="voice-lesson__question"><small>Întrebarea {index + 1} din 3</small><p lang="nb">{session.questions[index]}</p></div>}
      {answers.length > 0 && <div className="voice-lesson__transcript" aria-label="Răspunsurile tale">
        {answers.map((answer) => <div key={answer.index} className="voice-lesson__message voice-lesson__message--user"><small>Răspunsul {answer.index + 1}</small><p lang="nb">{answer.text}</p></div>)}
      </div>}
      {feedback && <div className="voice-lesson__message voice-lesson__feedback"><small>Feedbackul tău</small><p>{feedback.text}</p></div>}
      <div className="voice-lesson__controls">
        {!active && <button type="button" className="voice-lesson__primary" disabled={configured !== true} onClick={start}>Pornește dialogul</button>}
        {active && <button type="button" onClick={stop}>Oprește conversația</button>}
      </div>
      {status === 'idle' && <p className="voice-lesson__start-caption">O singură apăsare pornește dialogul.</p>}
      <p className="voice-lesson__hint">După ce Nora termină întrebarea, vorbește natural. Dialogul continuă automat după 4 secunde de liniște.</p>
      <p className="voice-lesson__privacy">Vocea este generată de AI. Microfonul ascultă maximum 30 de secunde pentru fiecare răspuns. Răspunsurile sunt trimise către OpenAI; înregistrările nu sunt salvate de aplicație.</p>
    </div>
  </section>;
}
