import React, { useEffect, useRef, useState } from 'react';
import { sendChatTurn, startChatSession } from '../../services/chat';
import { practiceRequest, audioBlob, recordPracticeAnswer, recordingPayload } from '../../services/voicePractice';
import { createVoiceConversation } from '../../services/voiceConversation';
import { getVoiceTranscriptPreference, saveVoiceTranscript } from '../../services/voiceTranscripts';
import './VoiceLessonConversation.css';

const normalizeDialog = (data, previousToken = null) => ({
  sessionToken: data?.sessionToken || previousToken,
  reply: typeof data?.reply === 'string' ? data.reply.trim() : '',
  question: typeof data?.question === 'string' && data.question.trim() ? data.question.trim() : null,
  questionTranslation: typeof data?.questionTranslation === 'string' && data.questionTranslation.trim() ? data.questionTranslation.trim() : null,
  suggestions: Array.isArray(data?.suggestions) ? data.suggestions.filter((entry) => entry?.answer && entry?.translation).slice(0, 2) : [],
  correction: typeof data?.correction === 'string' && data.correction.trim() ? data.correction.trim() : null,
  done: data?.done === true,
  turn: Number.isFinite(Number(data?.turn)) ? Number(data.turn) : 0,
  maxTurns: Number.isFinite(Number(data?.maxTurns)) ? Number(data.maxTurns) : 8,
});

const assistantMessage = (dialog) => ({
  role: 'assistant',
  reply: dialog.reply,
  question: dialog.question,
  questionTranslation: dialog.questionTranslation,
  suggestions: dialog.suggestions,
  correction: dialog.correction,
  turn: dialog.turn,
});

const transcriptMessages = (messages) => messages.map((message) => ({
  role: message.role,
  turn: message.turn || 0,
  content: message.role === 'user'
    ? message.content
    : [message.reply, message.question].filter(Boolean).join(' '),
})).filter((message) => message.content?.trim());

const createConversationId = () => {
  if (typeof window.crypto?.randomUUID === 'function') return window.crypto.randomUUID();
  const bytes = window.crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const value = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
  return `${value.slice(0, 8)}-${value.slice(8, 12)}-${value.slice(12, 16)}-${value.slice(16, 20)}-${value.slice(20)}`;
};

export default function VoiceLessonConversation({ level, lessonId, pathId, lessonTitle }) {
  const [configured, setConfigured] = useState(null);
  const [status, setStatus] = useState('idle');
  const [voiceSession, setVoiceSession] = useState(null);
  const [dialog, setDialog] = useState(null);
  const [messages, setMessages] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [feedback, setFeedback] = useState(null);
  const [pendingTranscript, setPendingTranscript] = useState(null);
  const [transcriptNotice, setTranscriptNotice] = useState('');
  const [revealedHelp, setRevealedHelp] = useState({});
  const [error, setError] = useState('');
  const [mode, setMode] = useState('realtime');
  const [transcriptConsent, setTranscriptConsent] = useState(false);
  const [transcriptSaveStatus, setTranscriptSaveStatus] = useState('');
  const controller = useRef(null);
  const realtime = useRef(null);
  const realtimeFinishing = useRef(false);
  const recording = useRef(null);
  const playback = useRef(null);
  const busy = useRef(false);
  const mounted = useRef(false);
  const autoStartTimer = useRef(null);
  const conversationId = useRef(null);
  const savedTranscriptFingerprint = useRef('');

  const stopPlayback = () => {
    const player = playback.current;
    if (player) {
      player.audio.onended = null;
      player.audio.onerror = null;
      player.audio.pause();
      player.audio.src = '';
      if (player.objectUrl) URL.revokeObjectURL(player.objectUrl);
      playback.current = null;
    }
  };

  useEffect(() => {
    mounted.current = true;
    const abort = new AbortController();
    fetch('/api/voice/status', { signal: abort.signal }).then((response) => response.json()).then((data) => {
      if (!abort.signal.aborted) setConfigured(data.configured === true);
    }).catch(() => { if (!abort.signal.aborted) setConfigured(false); });
    getVoiceTranscriptPreference(abort.signal).then((preference) => {
      if (!abort.signal.aborted) setTranscriptConsent(preference.enabled === true);
    }).catch(() => {});
    return () => {
      mounted.current = false;
      abort.abort();
      controller.current?.abort();
      realtime.current?.close();
      recording.current?.cancel();
      clearTimeout(autoStartTimer.current);
      stopPlayback();
    };
  }, []);

  useEffect(() => {
    if (status !== 'ended' || !transcriptConsent || !conversationId.current) return undefined;
    const transcript = transcriptMessages(messages);
    if (!transcript.some((message) => message.role === 'user')) return undefined;

    const payload = {
      conversationId: conversationId.current,
      level,
      lessonId,
      pathId: pathId || 'general',
      mode,
      messages: transcript,
      feedback: feedback?.text || '',
    };
    const fingerprint = JSON.stringify(payload);
    if (savedTranscriptFingerprint.current === fingerprint) return undefined;

    setTranscriptSaveStatus('saving');
    saveVoiceTranscript(payload).then(() => {
      if (!mounted.current) return;
      savedTranscriptFingerprint.current = fingerprint;
      setTranscriptSaveStatus('saved');
    }).catch(() => {
      if (mounted.current) setTranscriptSaveStatus('error');
    });
    return undefined;
  }, [feedback, lessonId, level, messages, mode, pathId, status, transcriptConsent]);

  const play = async (data, kind, onEnded, onStreamError) => {
    stopPlayback();
    const objectUrl = data.streamUrl ? null : URL.createObjectURL(audioBlob(data));
    const url = data.streamUrl || objectUrl;
    const audio = new Audio(url);
    const player = { audio, objectUrl };
    playback.current = player;
    audio.onended = () => {
      stopPlayback();
      if (!mounted.current) return;
      setStatus(kind === 'feedback' ? 'ended' : 'question');
      onEnded?.();
    };
    audio.onerror = async () => {
      if (playback.current !== player) return;
      stopPlayback();
      if (!mounted.current) return;
      if (data.streamUrl && onStreamError) {
        await onStreamError();
        return;
      }
      setError('Vocea nu a putut fi redată. Pornește din nou dialogul.');
      setStatus('ended');
    };
    setStatus(kind === 'feedback' ? 'feedbackAudio' : 'speaking');
    try {
      await audio.play();
    } catch (_) {
      if (playback.current !== player) return;
      stopPlayback();
      if (mounted.current && data.streamUrl && onStreamError) {
        await onStreamError();
      } else if (mounted.current) {
        setError('Redarea vocii a fost blocată de browser. Pornește din nou dialogul.');
        setStatus('ended');
      }
    }
  };

  const stop = () => {
    clearTimeout(autoStartTimer.current);
    controller.current?.abort();
    realtime.current?.close();
    realtime.current = null;
    realtimeFinishing.current = false;
    recording.current?.cancel();
    recording.current = null;
    stopPlayback();
    busy.current = false;
    setPendingTranscript(null);
    setTranscriptNotice('');
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
    const payload = {
      sessionToken: currentVoiceSession.sessionToken,
      dialogToken: currentDialog.sessionToken,
    };
    const afterSpeech = () => {
      clearTimeout(autoStartTimer.current);
      autoStartTimer.current = setTimeout(() => {
        if (!mounted.current || signal.aborted) return;
        if (currentDialog.done && currentAnswers.length >= 2) finish(currentAnswers, currentVoiceSession);
        else if (currentDialog.done) setStatus('ended');
        else record(currentVoiceSession, currentDialog, currentAnswers);
      }, currentDialog.done ? 450 : 1_000);
    };
    let fallbackStarted = false;
    const playFallback = async () => {
      if (fallbackStarted || signal.aborted || !mounted.current) return;
      fallbackStarted = true;
      setStatus('loading');
      try {
        const fallback = await practiceRequest('speak', payload, signal);
        if (!signal.aborted && mounted.current) await play(fallback, 'dialogue', afterSpeech);
      } catch (err) {
        if (!signal.aborted && mounted.current) {
          setError(err.message);
          setStatus('ended');
        }
      }
    };
    try {
      const stream = await practiceRequest('stream-ticket', payload, signal);
      if (signal.aborted || !mounted.current) return;
      await play(stream, 'dialogue', afterSpeech, playFallback);
    } catch (_) {
      await playFallback();
    }
  };

  const startBatch = async (fallbackNotice = '') => {
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
    setPendingTranscript(null);
    setTranscriptNotice('');
    setRevealedHelp({});
    setError('');
    setStatus('loading');
    setMode('batch');
    conversationId.current = createConversationId();
    savedTranscriptFingerprint.current = '';
    setTranscriptSaveStatus('');
    if (fallbackNotice) setTranscriptNotice(fallbackNotice);
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

  const resetForStart = () => {
    setVoiceSession(null);
    setDialog({ turn: 0, maxTurns: 8, done: false });
    setMessages([]);
    setAnswers([]);
    setFeedback(null);
    setPendingTranscript(null);
    setTranscriptNotice('');
    setRevealedHelp({});
    setError('');
    realtimeFinishing.current = false;
    conversationId.current = createConversationId();
    savedTranscriptFingerprint.current = '';
    setTranscriptSaveStatus('');
  };

  const handleRealtimeEvent = (event) => {
    if (!mounted.current) return;
    if (event.type === 'input_audio_buffer.speech_started') {
      setStatus('recording');
      setTranscriptNotice('');
      return;
    }
    if (event.type === 'input_audio_buffer.speech_stopped') {
      setStatus('transcribing');
      return;
    }
    if (event.type === 'conversation.item.input_audio_transcription.completed') {
      const text = event.transcript?.trim();
      if (text) {
        setMessages((current) => [...current, { role: 'user', content: text, turn: current.filter((item) => item.role === 'user').length + 1 }]);
      }
      setStatus('thinking');
      return;
    }
    if (event.type === 'conversation.item.input_audio_transcription.failed') {
      setTranscriptNotice('Nu am putut transcrie clar răspunsul. Încearcă din nou.');
      setStatus('listening');
      return;
    }
    if (event.type === 'practice.progress') {
      setDialog({ turn: event.answers, maxTurns: event.total, done: event.answers >= event.total });
      return;
    }
    if (event.type === 'practice.feedback_started') {
      realtimeFinishing.current = true;
      setStatus('evaluating');
      return;
    }
    if (event.type === 'response.output_audio_transcript.delta' || event.type === 'response.audio_transcript.delta') {
      setStatus(realtimeFinishing.current ? 'feedbackAudio' : 'speaking');
      return;
    }
    if (event.type === 'response.output_audio_transcript.done' || event.type === 'response.audio_transcript.done') {
      const text = event.transcript?.trim();
      if (!text) return;
      if (realtimeFinishing.current) setFeedback({ text });
      else setMessages((current) => [...current, { role: 'assistant', reply: text, question: null, turn: current.filter((item) => item.role === 'user').length }]);
      return;
    }
    if (event.type === 'output_audio_buffer.started') {
      setStatus(realtimeFinishing.current ? 'feedbackAudio' : 'speaking');
      return;
    }
    if (event.type === 'output_audio_buffer.stopped' || event.type === 'output_audio_buffer.cleared') {
      setStatus(realtimeFinishing.current ? 'ended' : 'listening');
      return;
    }
    if (event.type === 'playback.blocked') {
      setError('Redarea automată a fost blocată. Apasă „Pornește sunetul” pentru a continua.');
      setStatus('playbackBlocked');
      return;
    }
    if (event.type === 'error' || (event.type === 'response.done' && ['failed', 'incomplete', 'cancelled'].includes(event.response?.status))) {
      setError('Dialogul vocal s-a întrerupt. Pornește o conversație nouă.');
      setStatus('ended');
    }
  };

  const startRealtime = async () => {
    if (busy.current) return;
    busy.current = true;
    controller.current?.abort();
    realtime.current?.close();
    stopPlayback();
    const abort = new AbortController();
    controller.current = abort;
    resetForStart();
    setMode('realtime');
    setStatus('connecting');
    try {
      const conversation = await createVoiceConversation({
        level,
        lessonId,
        pathId,
        signal: abort.signal,
        onEvent: handleRealtimeEvent,
        onDisconnect: (message) => {
          if (!mounted.current || abort.signal.aborted) return;
          realtime.current = null;
          setError(message);
          setStatus('ended');
        },
      });
      if (abort.signal.aborted || !mounted.current) {
        conversation.close();
        return;
      }
      realtime.current = conversation;
      setStatus('speaking');
      conversation.start();
    } finally {
      if (!abort.signal.aborted) busy.current = false;
    }
  };

  const start = async () => {
    const canUseRealtime = Boolean(navigator.mediaDevices?.getUserMedia && window.RTCPeerConnection);
    if (!canUseRealtime) {
      await startBatch('Browserul nu permite WebRTC; folosim modul vocal compatibil.');
      return;
    }
    try {
      await startRealtime();
    } catch (err) {
      if (controller.current?.signal.aborted || !mounted.current) return;
      controller.current?.abort();
      realtime.current = null;
      busy.current = false;
      if (/Permite accesul la microfon|microfon conectat/i.test(err.message)) {
        setError(err.message);
        setStatus('ended');
        return;
      }
      await startBatch(`Conexiunea rapidă nu a pornit; folosim modul compatibil. ${err.message}`);
    }
  };

  const requestRealtimeHelp = () => {
    if (mode !== 'realtime' || !realtime.current || status !== 'listening') return;
    setError('');
    setStatus('thinking');
    realtime.current.help();
  };

  const finishRealtime = () => {
    if (mode !== 'realtime' || !realtime.current || realtimeFinishing.current) return;
    realtime.current.feedback();
  };

  const resumeRealtimePlayback = async () => {
    try {
      await realtime.current?.play();
      setError('');
      setStatus('speaking');
    } catch (_) {
      setError('Sunetul nu a putut fi pornit. Verifică setările browserului.');
    }
  };

  const continueDialog = async (transcript, currentVoiceSession, currentDialog, currentAnswers) => {
    const signal = controller.current.signal;
    setPendingTranscript(null);
    setTranscriptNotice('');
    setMessages((current) => [...current, {
      role: 'user',
      content: transcript.text,
      turn: currentDialog.turn + (transcript.consumeTurn === false ? 0 : 1),
    }]);
    setStatus('thinking');
    const response = await sendChatTurn({
      sessionToken: currentDialog.sessionToken,
      message: transcript.text,
    }, signal);
    if (signal.aborted || !mounted.current) return;
    const nextDialog = normalizeDialog(response, currentDialog.sessionToken);
    const consumeTurn = transcript.consumeTurn !== false && nextDialog.turn === currentDialog.turn + 1;
    const nextAnswers = consumeTurn ? [...currentAnswers, transcript] : currentAnswers;
    if (consumeTurn) setAnswers(nextAnswers);
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
      if (transcript.decision === 'retry') {
        setTranscriptNotice(transcript.message || 'Încearcă din nou; întrebarea rămâne aceeași.');
        setStatus('retrying');
        busy.current = false;
        clearTimeout(autoStartTimer.current);
        autoStartTimer.current = setTimeout(() => {
          if (mounted.current && !signal.aborted) record(currentVoiceSession, currentDialog, currentAnswers);
        }, 1_400);
        return;
      }
      if (transcript.decision === 'confirm') {
        setPendingTranscript({ transcript, currentVoiceSession, currentDialog, currentAnswers });
        setTranscriptNotice('');
        setStatus('confirming');
        busy.current = false;
        return;
      }
      if (transcript.decision !== 'accept' && !transcript.proof) throw new Error('Transcrierea nu a putut fi verificată. Încearcă din nou.');
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
        dialogToken: currentDialog.sessionToken,
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

  const acceptPendingTranscript = async () => {
    if (busy.current || !pendingTranscript) return;
    busy.current = true;
    const { transcript, currentVoiceSession, currentDialog, currentAnswers } = pendingTranscript;
    const signal = controller.current.signal;
    setError('');
    setStatus('transcribing');
    try {
      const accepted = await practiceRequest('confirm', {
        sessionToken: currentVoiceSession.sessionToken,
        dialogToken: currentDialog.sessionToken,
        confirmationToken: transcript.confirmationToken,
      }, signal);
      if (signal.aborted || !mounted.current) return;
      await continueDialog(accepted, currentVoiceSession, currentDialog, currentAnswers);
    } catch (err) {
      if (!signal.aborted && mounted.current) {
        setError(err.message);
        setStatus('confirming');
      }
    } finally {
      if (!signal.aborted) busy.current = false;
    }
  };

  const retryPendingTranscript = () => {
    if (busy.current || !pendingTranscript) return;
    const { currentVoiceSession, currentDialog, currentAnswers } = pendingTranscript;
    setPendingTranscript(null);
    setTranscriptNotice('');
    setError('');
    setStatus('question');
    busy.current = false;
    record(currentVoiceSession, currentDialog, currentAnswers);
  };

  const active = !['idle', 'ended'].includes(status);
  const labels = {
    idle: 'Pregătit de practică',
    connecting: 'Conectăm dialogul live…',
    loading: 'Pregătim replica…',
    speaking: 'Nora vorbește…',
    listening: 'Te ascult · vorbește natural',
    playbackBlocked: 'Sunetul necesită confirmare',
    question: 'Răspunde când ești pregătit',
    microphone: 'Pornim microfonul…',
    recording: mode === 'realtime' ? 'Te ascult · vorbește natural' : 'Te ascult · maximum 30 de secunde',
    transcribing: 'Transcriem răspunsul…',
    confirming: 'Verifică ce am auzit',
    retrying: 'Mai încearcă o dată…',
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
      <div className="voice-lesson__partner"><span className="voice-lesson__avatar" aria-hidden="true"><span className="voice-lesson__avatar-letter">N</span><picture className="voice-lesson__portrait"><source media="(min-width: 861px)" srcSet="/images/voice/nora-avatar.webp" /><img alt="" width="56" height="56" /></picture></span><div><strong>Nora</strong><span>Voce AI · {level} · {mode === 'realtime' ? 'dialog live' : 'mod compatibil'}</span></div><span className={`voice-lesson__status ${active ? 'voice-lesson__status--active' : ''}`} role="status">{labels[status]}</span></div>
      {status === 'idle' && <div className="voice-lesson__welcome"><h2>Exersează printr-un dialog real</h2><p>Nora răspunde natural și continuă conversația în limitele lecției curente.</p><ul><li>Până la 8 răspunsuri</li><li>Dialog adaptiv</li><li>Feedback final</li></ul></div>}
      {configured === false && <p className="voice-lesson__notice">Practica vocală nu este disponibilă momentan. Poți finaliza lecția și reveni mai târziu.</p>}
      {error && <p className="voice-lesson__error" role="alert">{error}</p>}
      {transcriptNotice && <p className="voice-lesson__notice" role="status">{transcriptNotice}</p>}
      {dialog && active && <div className="voice-lesson__progress"><span>Dialogul lecției</span><small>Replica {Math.min(dialog.turn + 1, dialog.maxTurns)} din {dialog.maxTurns}</small></div>}
      {messages.length > 0 && <div className="voice-lesson__transcript" role="log" aria-label="Dialogul în norvegiană">
        {messages.map((message, messageIndex) => message.role === 'user'
          ? <div key={`${message.role}-${message.turn}-${messageIndex}`} className="voice-lesson__message voice-lesson__message--user"><small>Tu</small><p lang="nb">{message.content}</p></div>
          : <div key={`${message.role}-${message.turn}-${messageIndex}`} className="voice-lesson__exchange">
            <div className="voice-lesson__message voice-lesson__message--assistant">
              <small>Nora</small>
              {message.reply && <p lang="nb">{message.reply}</p>}
              {message.question && <p className="voice-lesson__dialog-question" lang="nb">{message.question}</p>}
              {message.questionTranslation && <p className="voice-lesson__question-translation"><span aria-hidden="true">RO</span>{message.questionTranslation}</p>}
              {message.suggestions?.length > 0 && <div className="voice-lesson__answer-help">
                <button
                  type="button"
                  aria-expanded={revealedHelp[messageIndex] === true}
                  onClick={() => setRevealedHelp((current) => ({ ...current, [messageIndex]: !current[messageIndex] }))}
                >
                  {revealedHelp[messageIndex] ? 'Ascunde răspunsurile' : 'Ajută-mă să răspund'}
                </button>
                {revealedHelp[messageIndex] && <div className="voice-lesson__suggestions">
                  {message.suggestions.map((suggestion, suggestionIndex) => <div key={`${suggestion.answer}-${suggestionIndex}`}>
                    <strong lang="nb">{suggestion.answer}</strong>
                    <span>{suggestion.translation}</span>
                  </div>)}
                </div>}
              </div>}
            </div>
            {message.correction && <aside className="voice-lesson__correction"><strong>Corectare scurtă</strong><p>{message.correction}</p></aside>}
          </div>)}
      </div>}
      {feedback && <div className="voice-lesson__message voice-lesson__feedback"><small>Feedbackul tău</small><p>{feedback.text}</p></div>}
      {status === 'ended' && transcriptConsent && transcriptSaveStatus === 'saved' && <p className="voice-lesson__saved">Transcript salvat în siguranță pentru îmbunătățirea Norei · fără înregistrarea audio</p>}
      {pendingTranscript && <div className="voice-lesson__confirmation" role="status">
        <small>Verificare rapidă</small>
        <p>{pendingTranscript.transcript.message}</p>
      </div>}
      <div className="voice-lesson__controls">
        {!active && <button type="button" className="voice-lesson__primary" disabled={configured !== true} onClick={start}>{status === 'ended' ? 'Pornește un dialog nou' : 'Pornește dialogul'}</button>}
        {mode === 'batch' && status === 'recording' && <button type="button" className="voice-lesson__primary" onClick={() => recording.current?.stop()}>Am terminat răspunsul</button>}
        {mode === 'realtime' && status === 'listening' && <button type="button" className="voice-lesson__primary" onClick={requestRealtimeHelp}>Ajută-mă</button>}
        {mode === 'realtime' && dialog?.turn > 0 && !realtimeFinishing.current && active && <button type="button" onClick={finishRealtime}>Încheie cu feedback</button>}
        {mode === 'realtime' && status === 'playbackBlocked' && <button type="button" className="voice-lesson__primary" onClick={resumeRealtimePlayback}>Pornește sunetul</button>}
        {status === 'confirming' && <button type="button" className="voice-lesson__primary" onClick={acceptPendingTranscript}>Da, continuă</button>}
        {status === 'confirming' && <button type="button" onClick={retryPendingTranscript}>Mai încerc</button>}
        {active && <button type="button" onClick={stop}>Oprește conversația</button>}
      </div>
      {status === 'idle' && <p className="voice-lesson__start-caption">O singură apăsare pornește dialogul.</p>}
      <p className="voice-lesson__hint">{mode === 'realtime' ? 'Microfonul rămâne conectat pe durata dialogului. După ce Nora termină, vorbește natural; dialogul continuă automat.' : 'După ce Nora termină replica, vorbește natural. Dialogul continuă automat după o pauză scurtă.'}</p>
    </div>
  </section>;
}
