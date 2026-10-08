import { supabase } from './supabaseClient';

export const createVoiceConversation = async ({ level, lessonId, pathId, onEvent, onDisconnect, signal }) => {
  let peer;
  let stream;
  let channel;
  let timer;
  let connectionTimer;
  let rejectOpening;
  let closed = false;
  const audio = new Audio();
  audio.autoplay = true;
  const close = () => {
    if (closed) return;
    closed = true;
    clearTimeout(timer);
    clearTimeout(connectionTimer);
    rejectOpening?.(new DOMException('Cancelled', 'AbortError'));
    rejectOpening = null;
    stream?.getTracks().forEach((track) => track.stop());
    channel?.close();
    peer?.close();
    audio.pause();
    audio.srcObject = null;
    signal?.removeEventListener('abort', close);
  };
  signal?.addEventListener('abort', close, { once: true });
  const checkCancelled = () => { if (closed || signal?.aborted) throw new DOMException('Cancelled', 'AbortError'); };
  const send = (event) => {
    if (channel?.readyState !== 'open' || closed) throw new Error('Conversația nu este conectată.');
    channel.send(JSON.stringify(event));
  };
  try {
    checkCancelled();
    if (!navigator.mediaDevices?.getUserMedia || !window.RTCPeerConnection) throw new Error('Browserul nu permite dialog vocal. Folosește un browser actualizat și o conexiune HTTPS.');
    // Permission is requested only after the learner presses Start.
    stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
    if (closed) stream.getTracks().forEach((track) => track.stop());
    checkCancelled();
    const session = supabase ? await supabase.auth.getSession() : null;
    checkCancelled();
    const token = session?.data?.session?.access_token;
    const response = await fetch('/api/voice/session', {
      method: 'POST', signal, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify({ level, lessonId, pathId }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Nu am putut porni dialogul vocal.');
    checkCancelled();
    peer = new RTCPeerConnection();
    peer.ontrack = ({ streams }) => {
      audio.srcObject = streams[0];
      audio.play().catch(() => onEvent({ type: 'playback.blocked' }));
    };
    stream.getTracks().forEach((track) => peer.addTrack(track, stream));
    channel = peer.createDataChannel('oai-events');
    channel.onmessage = ({ data: payload }) => {
      if (closed) return;
      try { onEvent(JSON.parse(payload)); } catch (_) { /* Ignore malformed transport events. */ }
    };
    peer.onconnectionstatechange = () => {
      if (closed) return;
      if (['failed', 'closed'].includes(peer.connectionState)) { close(); onDisconnect('Conexiunea vocală s-a întrerupt.'); }
      if (peer.connectionState === 'disconnected') {
        clearTimeout(connectionTimer);
        connectionTimer = setTimeout(() => { close(); onDisconnect('Conexiunea vocală s-a întrerupt.'); }, 10_000);
      } else clearTimeout(connectionTimer);
    };
    const opened = new Promise((resolve, reject) => {
      rejectOpening = reject;
      connectionTimer = setTimeout(() => reject(new Error('Conexiunea vocală nu a putut fi stabilită.')), 30_000);
      channel.onopen = () => { clearTimeout(connectionTimer); rejectOpening = null; resolve(); };
      channel.onerror = () => reject(new Error('Conexiunea vocală nu a putut fi stabilită.'));
    });
    // Avoid an unhandled rejection if the SDP exchange fails first.
    opened.catch(() => {});
    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);
    const answer = await fetch('https://api.openai.com/v1/realtime/calls', {
      method: 'POST', signal, headers: { Authorization: `Bearer ${data.value}`, 'Content-Type': 'application/sdp' }, body: offer.sdp,
    });
    if (!answer.ok) throw new Error('Partenerul vocal nu a putut fi conectat.');
    await peer.setRemoteDescription({ type: 'answer', sdp: await answer.text() });
    await opened;
    checkCancelled();
    timer = setTimeout(() => { close(); onDisconnect('Sesiunea de practică s-a încheiat după 10 minute. Poți porni alta.'); }, 10 * 60_000);
    return {
      close,
      start: () => send({ type: 'response.create', response: { instructions: 'Începe acum încălzirea conform planului didactic al lecției. Prezintă scurt situația și pune prima întrebare, apoi ascultă.' } }),
      mute: (muted) => stream.getAudioTracks().forEach((track) => { track.enabled = !muted; }),
      play: () => audio.play(),
      help: () => {
        send({ type: 'conversation.item.create', item: { type: 'message', role: 'user', content: [{ type: 'input_text', text: 'Ajută-mă să răspund la întrebarea curentă: explică scurt în română și oferă un indiciu, apoi așteaptă.' }] } });
        send({ type: 'response.create' });
      },
      feedback: () => {
        stream.getAudioTracks().forEach((track) => { track.enabled = false; });
        send({ type: 'conversation.item.create', item: { type: 'message', role: 'user', content: [{ type: 'input_text', text: 'Încheiem dialogul. Oferă feedbackul final în română pe baza răspunsurilor mele reale, fără întrebări noi.' }] } });
        send({ type: 'response.create' });
      },
    };
  } catch (error) {
    close();
    if (error.name === 'NotAllowedError') throw new Error('Permite accesul la microfon pentru a începe dialogul.');
    if (error.name === 'NotFoundError') throw new Error('Nu am găsit un microfon conectat.');
    throw error;
  }
};
