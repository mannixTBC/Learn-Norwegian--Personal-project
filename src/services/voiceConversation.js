import { supabase } from './supabaseClient';

export const getVoiceConnectionError = (status, payload) => {
  const code = payload?.error?.code;
  if (['organization_spend_limit_exceeded', 'project_spend_limit_exceeded', 'billing_hard_limit_reached'].includes(code)) {
    return 'Limita de cheltuieli OpenAI API a fost atinsă. Verifică limitele proiectului în contul OpenAI.';
  }
  if (code === 'organization_usage_limit_exceeded') {
    return 'Limita de utilizare OpenAI API a fost atinsă. Verifică limitele contului OpenAI.';
  }
  if (code === 'credit_balance_exhausted') {
    return 'Creditul OpenAI API este epuizat. Verifică soldul în setările de facturare OpenAI.';
  }
  if (code === 'insufficient_quota' || payload?.error?.type === 'insufficient_quota') {
    return 'OpenAI API nu are credit sau cotă disponibilă. Verifică facturarea și limitele proiectului OpenAI.';
  }
  if (status === 429) return 'Prea multe cereri către OpenAI. Așteaptă un minut și încearcă din nou.';
  if (status === 401) return 'Accesul temporar la dialog a fost refuzat sau a expirat. Pornește din nou dialogul.';
  if (code === 'model_not_found') return 'Modelul vocal nu este disponibil pentru acest proiect OpenAI. Verifică modelul configurat și accesul proiectului.';
  if (status === 403) return 'OpenAI a refuzat accesul la dialogul vocal. Verifică permisiunile și restricțiile proiectului OpenAI.';
  if (status >= 500) return 'Serviciul vocal OpenAI este indisponibil momentan. Încearcă din nou mai târziu.';
  if (status === 400) return 'OpenAI a respins configurarea dialogului vocal. Configurația serviciului trebuie verificată.';
  return `Partenerul vocal nu a putut fi conectat (HTTP ${status}). Încearcă din nou.`;
};

export const createVoiceConversation = async ({ level, lessonId, pathId, onEvent, onDisconnect, signal }) => {
  let peer;
  let stream;
  let channel;
  let timer;
  let connectionTimer;
  let rejectOpening;
  let closed = false;
  let answers = 0;
  let finishing = false;
  let responding = false;
  let userMuted = false;
  const receivedAnswers = new Set();
  const updateMicrophone = () => stream?.getAudioTracks().forEach((track) => {
    track.enabled = !userMuted && !responding && !finishing;
  });
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
  const respond = (instructions) => {
    responding = true;
    updateMicrophone();
    // Keep the session's lesson and teaching rules; do not replace its system instructions.
    send({ type: 'conversation.item.create', item: { type: 'message', role: 'user', content: [{ type: 'input_text', text: instructions }] } });
    send({ type: 'response.create' });
  };
  const feedback = () => {
    if (finishing || closed) return;
    finishing = true;
    onEvent({ type: 'practice.feedback_started' });
    respond('Încheie acum. Numai feedback în română: maximum 25 de cuvinte, două propoziții, o reușită observată și o sugestie. Fără întrebări, fără continuare. Dacă nu există răspunsuri reale, spune că nu ai suficiente exemple.');
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
      let event;
      try { event = JSON.parse(payload); } catch (_) { return; }
      if (event.type === 'response.created') { responding = true; updateMicrophone(); }
      if (event.type === 'output_audio_buffer.stopped' || event.type === 'output_audio_buffer.cleared') {
        responding = false; updateMicrophone();
      }
      if (event.type === 'error' || (event.type === 'response.done' && ['failed', 'incomplete', 'cancelled'].includes(event.response?.status))) {
        responding = false; finishing = false; updateMicrophone();
      }
      onEvent(event);
      if (finishing && event.type === 'output_audio_buffer.stopped') { close(); return; }
      if (closed || finishing || event.type !== 'conversation.item.input_audio_transcription.completed' || !event.transcript?.trim()) return;
      if (!event.item_id || receivedAnswers.has(event.item_id)) return;
      receivedAnswers.add(event.item_id);
      const command = event.transcript.trim().toLowerCase().replace(/[.!?,]/g, '');
      if (/^(mai lent|repetă|repeta|ajută-mă|ajuta-ma|nu înțeleg|nu inteleg)$/.test(command)) {
        respond('Ajută foarte scurt în română, apoi repetă aceeași întrebare în norvegiană. Maximum 18 cuvinte; nu trece la altă întrebare.');
        return;
      }
      answers += 1;
      onEvent({ type: 'practice.progress', answers, total: 3 });
      if (answers >= 3) feedback();
      else respond(`Pune acum întrebarea ${answers + 1} din 3, în aceeași situație a lecției. O singură întrebare în norvegiană, maximum 12 cuvinte. Fără explicații sau feedback. Așteaptă răspunsul.`);
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
    if (!answer.ok) {
      // Map known error codes without exposing upstream messages or credentials.
      const failure = await answer.json().catch(() => null);
      throw new Error(getVoiceConnectionError(answer.status, failure));
    }
    await peer.setRemoteDescription({ type: 'answer', sdp: await answer.text() });
    await opened;
    checkCancelled();
    timer = setTimeout(() => { close(); onDisconnect('Sesiunea de practică s-a încheiat după 3 minute. Poți porni alta.'); }, 3 * 60_000);
    return {
      close,
      start: () => respond('Salută și pune prima întrebare din 3 în norvegiană, folosind lecția curentă. Maximum 12 cuvinte în total. Fără introducere sau explicații. Așteaptă răspunsul.'),
      mute: (muted) => { userMuted = muted; updateMicrophone(); },
      play: () => audio.play(),
      help: () => {
        respond('Oferă un indiciu scurt în română pentru întrebarea curentă, apoi repetă aceeași întrebare. Maximum 18 cuvinte, fără altă întrebare sau explicații lungi.');
      },
      feedback,
    };
  } catch (error) {
    close();
    if (error.name === 'NotAllowedError') throw new Error('Permite accesul la microfon pentru a începe dialogul.');
    if (error.name === 'NotFoundError') throw new Error('Nu am găsit un microfon conectat.');
    throw error;
  }
};
