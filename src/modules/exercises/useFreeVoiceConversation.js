import { useEffect, useRef, useState } from 'react';
import { startFreeConversation, sendFreeConversation } from '../../services/chat';
import { speakNorwegian } from '../../services/norwegianSpeech';

export default function useFreeVoiceConversation(level) {
  const [session, setSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const [ended, setEnded] = useState(false);
  const current = useRef(null), request = useRef(null), audio = useRef(null);
  const recognition = useRef(null), timer = useRef(null), active = useRef(false);
  const pendingText = useRef(null), generation = useRef(0);
  const Recognition = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);
  const supported = Boolean(Recognition && typeof navigator !== 'undefined' && navigator.mediaDevices?.getUserMedia);

  function stopMedia() {
    clearTimeout(timer.current);
    const recorder = recognition.current;
    recognition.current = null;
    if (recorder) {
      recorder.onresult = recorder.onerror = recorder.onend = null;
      recorder.abort();
    }
    audio.current?.abort();
    audio.current = null;
  }
  function dispose() {
    generation.current++;
    active.current = false;
    stopMedia();
    request.current?.abort();
    request.current = null;
  }
  useEffect(() => {
    current.current = null;
    pendingText.current = null;
    setSession(null); setMessages([]); setEnded(false); setStatus('idle'); setError('');
    return dispose;
  }, [level]);

  function fail(message) {
    active.current = false;
    stopMedia();
    setStatus('paused'); setError(message);
  }
  function listen() {
    if (!active.current || current.current?.done || request.current) return;
    stopMedia();
    const recorder = new Recognition();
    recognition.current = recorder;
    recorder.lang = 'nb-NO';
    recorder.continuous = false;
    recorder.interimResults = false;
    let transcript = '';
    recorder.onresult = event => {
      if (recognition.current !== recorder) return;
      transcript = Array.from(event.results).filter(result => result.isFinal)
        .map(result => result[0].transcript).join(' ').trim();
    };
    recorder.onerror = event => {
      if (recognition.current !== recorder || event.error === 'no-speech') return;
      fail(['not-allowed', 'service-not-allowed'].includes(event.error)
        ? 'Permite accesul la microfon, apoi apasă Reîncearcă.'
        : 'Microfonul s-a oprit. Verifică conexiunea și încearcă din nou.');
    };
    recorder.onend = () => {
      if (recognition.current !== recorder || !active.current) return;
      recognition.current = null;
      if (transcript) void run(transcript);
      else timer.current = setTimeout(listen, 500);
    };
    try { recorder.start(); setStatus('listening'); }
    catch { fail('Microfonul nu a putut porni. Verifică permisiunea și încearcă din nou.'); }
  }
  async function speak(text = current.current?.reply) {
    if (!active.current || !text) return;
    stopMedia();
    const controller = new AbortController();
    audio.current = controller;
    setStatus('speaking');
    try {
      const result = await speakNorwegian(text, { voice: 'female', waitForEnd: true,
        signal: controller.signal });
      if (controller.signal.aborted) return;
      if (!result.ok) return fail('Vocea nu a putut porni. Apasă Reîncearcă pentru a o asculta pe Nora.');
      if (current.current?.done) {
        active.current = false; setEnded(true); setStatus('idle');
      } else listen();
    } catch {
      if (!controller.signal.aborted) fail('Redarea nu a reușit. Apasă Reîncearcă.');
    }
  }
  async function run(text = pendingText.current) {
    if (request.current) return;
    stopMedia();
    const controller = new AbortController();
    request.current = controller;
    pendingText.current = text;
    setStatus('thinking'); setError('');
    try {
      const result = current.current
        ? await sendFreeConversation({ sessionToken: current.current.sessionToken, message: text }, controller.signal)
        : await startFreeConversation(level, controller.signal);
      if (controller.signal.aborted) return;
      setMessages(old => [...old, ...(text ? [{ role: 'user', text }] : []),
        { role: 'assistant', text: result.reply, translation: result.translation, correction: result.correction }]);
      pendingText.current = null;
      current.current = result; setSession(result);
      request.current = null;
      if (active.current) void speak();
      else { setStatus('paused'); if (result.done) setEnded(true); }
    } catch (e) {
      if (!controller.signal.aborted) fail(e.message);
    } finally {
      if (request.current === controller) request.current = null;
    }
  }
  async function start() {
    if (!supported || active.current || request.current) return;
    active.current = true;
    setError(''); setStatus('connecting');
    const attempt = ++generation.current;
    try {
      // Request permission from the user's click, before Nora's opening reply.
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      if (attempt !== generation.current || !active.current) return;
      if (current.current && pendingText.current === null) void speak();
      else void run();
    } catch {
      if (attempt === generation.current) fail('Permite accesul la microfon pentru a începe dialogul.');
    }
  }
  function pause() {
    generation.current++;
    active.current = false; stopMedia(); setStatus('paused');
  }
  function finish() { dispose(); setEnded(true); setStatus('idle'); setError(''); }
  function restart() {
    dispose(); current.current = null; pendingText.current = null;
    setSession(null); setMessages([]); setEnded(false); setError(''); setStatus('idle');
    void start();
  }
  return { session, messages, status, error, ended, supported, start, pause, finish, restart,
    replay: text => { if (active.current && !request.current) void speak(text); } };
}
