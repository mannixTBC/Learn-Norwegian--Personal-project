import React, { useEffect, useRef, useState } from 'react';
import { sendChatTurn, startChatSession } from '../../services/chat';
import { practiceRequest, audioBlob, recordPracticeAnswer, recordingPayload } from '../../services/voicePractice';
import './VoiceLessonConversation.css';

const normalizeDialog = (data, previousToken = null) => ({
  sessionToken: data?.sessionToken || previousToken,
  reply: typeof data?.reply === 'string' ? data.reply.trim() : '',
  question: typeof data?.question === 'string' && data.question.trim() ? data.question.trim() : null,
  correction: typeof data?.correction === 'string' && data.correction.trim() ? data.correction.trim() : null,
  done: data?.done === true,
  turn: Number.isFinite(Number(data?.turn)) ? Number(data.turn) : 0,
  maxTurns: Number.isFinite(Number(data?.maxTurns)) ? Number(data.maxTurns) : 8,
});

const assistantMessage = (dialog) => ({
  role: 'assistant',
  reply: dialog.reply,
  question: dialog.question,
  correction: dialog.correction,
  turn: dialog.turn,
});

function NoraAvatar({ isSpeaking }) {
  return (
    <div
      className={`voice-lesson__nora ${isSpeaking ? 'voice-lesson__nora--speaking' : ''}`}
      aria-hidden="true"
    >
      <span className="voice-lesson__sound-wave voice-lesson__sound-wave--left"><i /><i /><i /></span>
      <span className="voice-lesson__nora-hair voice-lesson__nora-hair--back" />
      <span className="voice-lesson__nora-neck" />
      <span className="voice-lesson__nora-body" />
      <span className="voice-lesson__nora-head">
        <span className="voice-lesson__nora-hair voice-lesson__nora-hair--front" />
        <span className="voice-lesson__nora-brow voice-lesson__nora-brow--left" />
        <span className="voice-lesson__nora-brow voice-lesson__nora-brow--right" />
        <span className="voice-lesson__nora-eye voice-lesson__nora-eye--left" />
        <span className="voice-lesson__nora-eye voice-lesson__nora-eye--right" />
        <span className="voice-lesson__nora-nose" />
        <span className="voice-lesson__nora-mouth" />
      </span>
      <span className="voice-lesson__sound-wave voice-lesson__sound-wave--right"><i /><i /><i /></span>
    </div>
  );
}

export default function VoiceLessonConversation({ level, lessonId, pathId, lessonTitle }) {
  const [configured, setConfigured] = useState(null);
  const [status, setStatus] = useState('idle');
  const [voiceSession, setVoiceSession] = useState(null);
  const [dialog, setDialog] = useState(null);
  const [messages, setMessages] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [error, setError] = useState('');
  const controller = useRef(null);
  const recording = useRef(null);
  const playback = useRef(null);
  const busy = useRef(false);
  const mounted = useRef(false);
  const autoStartTimer = useRef(null);

  const stopPlayback = () => {
    const player = playback.current;
    if (player) {
      player.audio.onended = null;
      player.audio.onerror = null;
      player.audio.pause();
      player.audio.src = '';
      URL.revokeObjectURL(player.url);
      playback.current = null;
    }
  };

  useEffect(() => {
    mounted.current = true;
    const abort = new AbortController();
    fetch('/api/voice/status', { signal: abort.signal }).then((response) => response.json()).then((data) => {
      if (!abort.signal.aborted) setConfigured(data.configured === true);
    }).catch(() => { if (!abort.signal.aborted) setConfigured(false); });
    return () => {
      mounted.current = false;
      abort.abort();
      controller.current?.abort();
      recording.current?.cancel();
      clearTimeout(autoStartTimer.current);
      stopPlayback();
    };
  }, []);

  const play = async (data, kind, onEnded) => {
    stopPlayback();
    const url = URL.createObjectURL(audioBlob(data));
    const audio = new Audio(url);
    const player = { audio, url };
    playback.current = player;
    audio.onended = () => {
      stopPlayback();
      if (!mounted.current) return;
      setStatus(kind === 'feedback' ? 'ended' : 'question');
      onEnded?.();
    };
    audio.onerror = () => {
      if (playback.current !== player) return;
      stopPlayback();
      if (!mounted.current) return;
      setError('Vocea nu a putut fi redată. Pornește din nou dialogul.');
      setStatus('ended');
    };
    setStatus(kind === 'feedback' ? 'feedbackAudio' : 'speaking');
    try {
      await audio.play();
    } catch (_) {
      if (playback.current !== player) return;
      stopPlayback();
      if (mounted.current) {
        setError('Redarea vocii a fost blocată de browser. Pornește din nou dialogul.');
        setStatus('ended');
      }
    }
  };

  const stop = () => {
    clearTimeout(autoStartTimer.current);
    controller.current?.abort();
    recording.current?.cancel();
    recording.current = null;
    stopPlayback();
    busy.current = false;
    setStatus('ended');
  };

  const finish = async (currentAnswers, currentVoiceSession) => {
    const signal = controller.current.signal;
    setStatus('evaluating');
    setError('');
    try {
      const result = await practiceRequest('feedback', {
        sessionToken: currentVoiceSession.sessionToken,
        answers: currentAnswers,
      }, signal);
      if (signal.aborted || !mounted.current) return;
      setFeedback(result);
      if (result.audioBase64) await play(result, 'feedback');
      else {
        setStatus('ended');
        setError('Feedbackul este disponibil în scris. Vocea nu a putut fi generată.');
      }
    } catch (err) {
      if (!signal.aborted && mounted.current) {
        setError(err.message);
        setStatus('ended');
      }
    }
  };

  const speak = async (currentVoiceSession, currentDialog, currentAnswers) => {
    const signal = controller.current.signal;
    setStatus('loading');
    const data = await practiceRequest('speak', {
      sessionToken: currentVoiceSession.sessionToken,
      dialogToken: currentDialog.sessionToken,
    }, signal);
    if (signal.aborted || !mounted.current) return;
    await play(data, 'dialogue', () => {
      clearTimeout(autoStartTimer.current);
      autoStartTimer.current = setTimeout(() => {
        if (!mounted.current || signal.aborted) return;
        if (currentDialog.done) finish(currentAnswers, currentVoiceSession);
        else record(currentVoiceSession, currentDialog, currentAnswers);
      }, currentDialog.done ? 450 : 1_000);
    });
  };

  const start = async () => {
    if (busy.current) return;
    busy.current = true;
    controller.current?.abort();
    stopPlayback();
    const abort = new AbortController();
    controller.current = abort;
    setVoiceSession(null);
    setDialog(null);
    setMessages([]);
    setAnswers([]);
    setFeedback(null);
    setError('');
    setStatus('loading');
    try {
      const [voiceData, chatData] = await Promise.all([
        practiceRequest('start', { level, lessonId, pathId }, abort.signal),
        startChatSession({ level, lessonId, pathId }, abort.signal),
      ]);
      if (abort.signal.aborted || !mounted.current) return;
      const nextDialog = normalizeDialog(chatData);
      setVoiceSession(voiceData);
      setDialog(nextDialog);
      setMessages([assistantMessage(nextDialog)]);
      await speak(voiceData, nextDialog, []);
    } catch (err) {
      if (!abort.signal.aborted && mounted.current) {
        setError(err.message);
        setStatus('ended');
      }
    } finally {
      if (!abort.signal.aborted) busy.current = false;
    }
  };

  const continueDialog = async (transcript, currentVoiceSession, currentDialog, currentAnswers) => {
    const signal = controller.current.signal;
    const nextAnswers = [...currentAnswers, transcript];
    setAnswers(nextAnswers);
    setMessages((current) => [...current, { role: 'user', content: transcript.text, turn: currentDialog.turn + 1 }]);
    setStatus('thinking');
    const response = await sendChatTurn({
      sessionToken: currentDialog.sessionToken,
      message: transcript.text,
    }, signal);
    if (signal.aborted || !mounted.current) return;
    const nextDialog = normalizeDialog(response, currentDialog.sessionToken);
    setDialog(nextDialog);
    setMessages((current) => [...current, assistantMessage(nextDialog)]);
    await speak(currentVoiceSession, nextDialog, nextAnswers);
  };

  const uploadAnswer = async (payload, currentVoiceSession, currentDialog, currentAnswers) => {
    const signal = controller.current.signal;
    setStatus('transcribing');
    setError('');
    try {
      const transcript = await practiceRequest('transcribe', payload, signal);
      if (signal.aborted || !mounted.current) return;
      await continueDialog(transcript, currentVoiceSession, currentDialog, currentAnswers);
    } catch (err) {
      if (!signal.aborted && mounted.current) {
        setError(err.message);
        setStatus('ended');
      }
    } finally {
      if (!signal.aborted) busy.current = false;
    }
  };

  const submitRecording = async (blob, duration, currentVoiceSession, currentDialog, currentAnswers) => {
    recording.current = null;
    const signal = controller.current.signal;
    try {
      if (duration < 0.4 || blob.size < 100) throw new Error('Înregistrarea este prea scurtă. Încearcă din nou.');
      const payload = await recordingPayload(blob, signal);
      if (signal.aborted || !mounted.current) return;
      await uploadAnswer({
        sessionToken: currentVoiceSession.sessionToken,
        index: currentAnswers.length,
        duration,
        ...payload,
      }, currentVoiceSession, currentDialog, currentAnswers);
    } catch (err) {
      if (!signal.aborted && mounted.current) {
        setError(err.message);
        setStatus('ended');
        busy.current = false;
      }
    }
  };

  const record = async (currentVoiceSession = voiceSession, currentDialog = dialog, currentAnswers = answers) => {
    if (busy.current) return;
    busy.current = true;
    stopPlayback();
    setError('');
    setStatus('microphone');
    const signal = controller.current.signal;
    try {
      recording.current = await recordPracticeAnswer({
        signal,
        onComplete: (blob, duration) => submitRecording(blob, duration, currentVoiceSession, currentDialog, currentAnswers),
        onNoSpeech: () => {
          if (!signal.aborted && mounted.current) {
            recording.current = null;
            setError('Nu am auzit încă un răspuns. Microfonul continuă să asculte.');
            busy.current = false;
            autoStartTimer.current = setTimeout(() => record(currentVoiceSession, currentDialog, currentAnswers), 900);
          }
        },
        onError: (err) => {
          if (!signal.aborted && mounted.current) {
            setError(err.message);
            setStatus('ended');
            busy.current = false;
          }
        },
      });
      if (!signal.aborted && mounted.current) setStatus('recording');
    } catch (err) {
      if (!signal.aborted && mounted.current) {
        setError(err.message);
        setStatus('ended');
        busy.current = false;
      }
    }
  };

  const active = !['idle', 'ended'].includes(status);
  const noraIsSpeaking = ['speaking', 'feedbackAudio'].includes(status);
  const labels = {
    idle: 'Pregătit de practică',
    loading: 'Pregătim replica…',
    speaking: 'Nora vorbește…',
    question: 'Răspunde când ești pregătit',
    microphone: 'Pornim microfonul…',
    recording: 'Te ascult · maximum 30 de secunde',
    transcribing: 'Transcriem răspunsul…',
    thinking: 'Nora pregătește răspunsul…',
    evaluating: 'Pregătim feedbackul…',
    feedbackAudio: 'Feedbackul tău',
    ended: 'Practică încheiată',
  };

  return <section className="voice-lesson" aria-labelledby="voice-lesson-title">
    <p className="lesson-eyebrow">Pasul 7 · Practică vocală</p>
    <h1 id="voice-lesson-title">Hai să vorbim în norvegiană</h1>
    <p className="lesson-lead">Dialog ghidat din „{lessonTitle}”. Nora reacționează la răspunsurile tale și rămâne la materia lecției.</p>
    <div className={`voice-lesson__card ${status === 'idle' ? 'voice-lesson__card--welcome' : ''}`}>
      {status === 'idle' && <div className="voice-lesson__art" aria-hidden="true" />}
      <div className="voice-lesson__partner"><span className="voice-lesson__avatar" aria-hidden="true"><span className="voice-lesson__avatar-letter">N</span><picture className="voice-lesson__portrait"><source media="(min-width: 861px)" srcSet="/images/voice/nora-avatar.webp" /><img alt="" width="56" height="56" /></picture></span><div><strong>Nora</strong><span>Voce AI · {level}</span></div><span className={`voice-lesson__status ${active ? 'voice-lesson__status--active' : ''}`} role="status">{labels[status]}</span></div>
      {status === 'idle' && <div className="voice-lesson__welcome"><h2>Exersează printr-un dialog real</h2><p>Nora răspunde natural și continuă conversația în limitele lecției curente.</p><ul><li>Până la 8 răspunsuri</li><li>Dialog adaptiv</li><li>Feedback final</li></ul></div>}
      {status !== 'idle' && <div className={`voice-lesson__nora-stage ${noraIsSpeaking ? 'voice-lesson__nora-stage--speaking' : ''}`}><NoraAvatar isSpeaking={noraIsSpeaking} /><span>{noraIsSpeaking ? 'Nora vorbește' : labels[status]}</span></div>}
      {configured === false && <p className="voice-lesson__notice">Practica vocală nu este disponibilă momentan. Poți finaliza lecția și reveni mai târziu.</p>}
      {error && <p className="voice-lesson__error" role="alert">{error}</p>}
      {dialog && active && <div className="voice-lesson__progress"><span>Dialogul lecției</span><small>Replica {Math.min(dialog.turn + 1, dialog.maxTurns)} din {dialog.maxTurns}</small></div>}
      {messages.length > 0 && <div className="voice-lesson__transcript" role="log" aria-label="Dialogul în norvegiană">
        {messages.map((message, messageIndex) => message.role === 'user'
          ? <div key={`${message.role}-${message.turn}-${messageIndex}`} className="voice-lesson__message voice-lesson__message--user"><small>Tu</small><p lang="nb">{message.content}</p></div>
          : <div key={`${message.role}-${message.turn}-${messageIndex}`} className="voice-lesson__exchange"><div className="voice-lesson__message voice-lesson__message--assistant"><small>Nora</small>{message.reply && <p lang="nb">{message.reply}</p>}{message.question && <p className="voice-lesson__dialog-question" lang="nb">{message.question}</p>}</div>{message.correction && <aside className="voice-lesson__correction"><strong>Corectare scurtă</strong><p>{message.correction}</p></aside>}</div>)}
      </div>}
      {feedback && <div className="voice-lesson__message voice-lesson__feedback"><small>Feedbackul tău</small><p>{feedback.text}</p></div>}
      <div className="voice-lesson__controls">
        {!active && <button type="button" className="voice-lesson__primary" disabled={configured !== true} onClick={start}>{status === 'ended' ? 'Pornește un dialog nou' : 'Pornește dialogul'}</button>}
        {active && <button type="button" onClick={stop}>Oprește conversația</button>}
      </div>
      {status === 'idle' && <p className="voice-lesson__start-caption">O singură apăsare pornește dialogul.</p>}
      <p className="voice-lesson__hint">După ce Nora termină replica, vorbește natural. Dialogul continuă automat după 4 secunde de liniște.</p>
      <p className="voice-lesson__privacy">Vocea este generată de AI. Microfonul ascultă maximum 30 de secunde pentru fiecare răspuns. Răspunsurile sunt trimise către OpenAI; înregistrările nu sunt salvate de aplicație.</p>
    </div>
  </section>;
}
