import { build } from 'vite';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import assert from 'node:assert/strict';

const root = resolve(import.meta.dirname, '..');
const outDir = resolve(root, 'node_modules/.cache/voice-client-tests');
await build({ configFile: false, logLevel: 'error', define: {
  'import.meta.env.VITE_SUPABASE_URL': 'undefined',
  'import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY': 'undefined',
  'import.meta.env.VITE_SUPABASE_ANON_KEY': 'undefined',
}, build: { ssr: resolve(root, 'src/services/voiceConversation.js'), outDir, emptyOutDir: false,
  rollupOptions: { output: { entryFileNames: 'client.mjs' } },
} });
const { createVoiceConversation, getVoiceConnectionError } = await import(pathToFileURL(resolve(outDir, 'client.mjs')));
assert.match(getVoiceConnectionError(429, { error: { code: 'credit_balance_exhausted', type: 'insufficient_quota' } }), /Creditul/);
assert.match(getVoiceConnectionError(429, { error: { code: 'project_spend_limit_exceeded', type: 'insufficient_quota' } }), /cheltuieli/);
assert.match(getVoiceConnectionError(429, { error: { code: 'rate_limit_exceeded' } }), /Prea multe/);
assert.match(getVoiceConnectionError(404, { error: { code: 'model_not_found' } }), /Modelul/);
assert.match(getVoiceConnectionError(401, null), /Accesul temporar/);
assert.equal(getVoiceConnectionError(502, { error: { message: 'secret-test-token' } }).includes('secret-test-token'), false);
const saved = Object.fromEntries(['Audio', 'navigator', 'window', 'RTCPeerConnection', 'fetch'].map((key) => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
let stopped = 0;
let currentPeer;
let media;
const track = { enabled: true, stop: () => { stopped += 1; } };
const stream = { getTracks: () => [track], getAudioTracks: () => [track] };
class FakePeer {
  constructor() { currentPeer = this; this.closed = false; this.events = []; }
  addTrack() {}
  createDataChannel() { this.channel = { readyState: 'open', send: (event) => this.events.push(JSON.parse(event)), close() {} }; return this.channel; }
  async createOffer() { return { sdp: 'fake-offer' }; }
  async setLocalDescription() {}
  async setRemoteDescription() { this.channel.onopen(); }
  close() { this.closed = true; }
}
try {
  Object.defineProperty(globalThis, 'navigator', { configurable: true, value: { mediaDevices: { getUserMedia: () => media() } } });
  globalThis.Audio = class { play() { return Promise.resolve(); } pause() {} };
  globalThis.window = { RTCPeerConnection: FakePeer };
  globalThis.RTCPeerConnection = FakePeer;
  media = async () => stream;
  globalThis.fetch = async (url) => url.startsWith('/api/')
    ? { ok: true, json: async () => ({ value: 'temporary-test-token' }) }
    : { ok: true, text: async () => 'fake-answer' };
  const events = [];
  const session = await createVoiceConversation({ level: 'A1', lessonId: 1, pathId: 'general', onEvent: (event) => events.push(event), onDisconnect() {}, signal: new AbortController().signal });
  session.start();
  const responses = () => currentPeer.events.filter((event) => event.type === 'response.create');
  assert.equal(responses().length, 1);
  assert.equal(track.enabled, false, 'Microphone pauses while Nora speaks');
  const emit = (event) => currentPeer.channel.onmessage({ data: JSON.stringify(event) });
  emit({ type: 'output_audio_buffer.stopped' });
  session.mute(true); assert.equal(track.enabled, false);
  session.mute(false); assert.equal(track.enabled, true);
  currentPeer.channel.onmessage({ data: JSON.stringify({ type: 'response.output_audio_transcript.done', transcript: 'Hei!' }) });
  assert.equal(events.find((event) => event.transcript)?.transcript, 'Hei!');
  emit({ type: 'conversation.item.input_audio_transcription.completed', item_id: 'empty', transcript: ' ' });
  assert.equal(responses().length, 1, 'Empty audio must not trigger a paid response');
  emit({ type: 'conversation.item.input_audio_transcription.completed', item_id: 'help', transcript: 'Repetă.' });
  assert.equal(events.some((event) => event.type === 'practice.progress'), false, 'Help does not count as an answer');
  emit({ type: 'output_audio_buffer.stopped' });
  for (let index = 1; index <= 3; index += 1) {
    const event = { type: 'conversation.item.input_audio_transcription.completed', item_id: `answer-${index}`, transcript: 'Jeg heter Anna.' };
    emit(event); emit(event);
    assert.equal(responses().length, 2 + index, 'Duplicate transcriptions must not generate extra replies');
    if (index < 3) emit({ type: 'output_audio_buffer.stopped' });
  }
  assert.equal(events.filter((event) => event.type === 'practice.progress').length, 3);
  assert.equal(events.filter((event) => event.type === 'practice.feedback_started').length, 1);
  assert.match(currentPeer.events.at(-2).item.content[0].text, /25 de cuvinte/);
  assert.equal(track.enabled, false);
  emit({ type: 'conversation.item.input_audio_transcription.completed', item_id: 'late-answer', transcript: 'Hei' });
  assert.equal(responses().length, 5, 'No fourth question after feedback begins');
  emit({ type: 'response.done', response: { status: 'completed' } });
  assert.equal(currentPeer.closed, false, 'Wait for feedback playback to finish before closing');
  emit({ type: 'output_audio_buffer.stopped' });
  assert.equal(currentPeer.closed, true);
  session.close(); session.close();
  assert.equal(stopped, 1); assert.equal(currentPeer.closed, true);

  // A denied API request must release the microphone, without creating a new peer.
  globalThis.fetch = async () => ({ ok: false, json: async () => ({ error: 'Autentificare necesară' }) });
  await assert.rejects(createVoiceConversation({ onEvent() {}, onDisconnect() {} }), /Autentificare necesară/);
  assert.equal(stopped, 2);

  // A refused realtime call reports billing separately and releases all resources.
  globalThis.fetch = async (url) => url.startsWith('/api/')
    ? { ok: true, json: async () => ({ value: 'temporary-test-token' }) }
    : { ok: false, status: 429, json: async () => ({ error: { code: 'insufficient_quota' } }) };
  await assert.rejects(createVoiceConversation({ onEvent() {}, onDisconnect() {} }), /credit sau cotă/);
  assert.equal(stopped, 3); assert.equal(currentPeer.closed, true);
  globalThis.fetch = async (url) => url.startsWith('/api/')
    ? { ok: true, json: async () => ({ value: 'temporary-test-token' }) }
    : { ok: false, status: 503, json: async () => { throw new Error('Not JSON'); } };
  await assert.rejects(createVoiceConversation({ onEvent() {}, onDisconnect() {} }), /indisponibil/);
  assert.equal(stopped, 4); assert.equal(currentPeer.closed, true);

  // Leaving while the permission dialog is open must stop a late microphone stream.
  let resolvePermission;
  media = () => new Promise((resolve) => { resolvePermission = resolve; });
  const abort = new AbortController();
  const pending = createVoiceConversation({ onEvent() {}, onDisconnect() {}, signal: abort.signal });
  abort.abort(); resolvePermission(stream);
  await assert.rejects(pending, { name: 'AbortError' });
  assert.equal(stopped, 5);
  console.log('Verificări client vocal: conectare, microfon, transcriere, închidere, refuz și anulare — OK.');
} finally {
  for (const [key, descriptor] of Object.entries(saved)) {
    if (descriptor) Object.defineProperty(globalThis, key, descriptor); else delete globalThis[key];
  }
}
