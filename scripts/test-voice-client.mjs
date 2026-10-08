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
const { createVoiceConversation } = await import(pathToFileURL(resolve(outDir, 'client.mjs')));
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
  assert.equal(currentPeer.events[0].type, 'response.create');
  session.mute(true); assert.equal(track.enabled, false);
  session.mute(false); assert.equal(track.enabled, true);
  currentPeer.channel.onmessage({ data: JSON.stringify({ type: 'response.output_audio_transcript.done', transcript: 'Hei!' }) });
  assert.equal(events[0].transcript, 'Hei!');
  session.close(); session.close();
  assert.equal(stopped, 1); assert.equal(currentPeer.closed, true);

  // A denied API request must release the microphone, without creating a new peer.
  globalThis.fetch = async () => ({ ok: false, json: async () => ({ error: 'Autentificare necesară' }) });
  await assert.rejects(createVoiceConversation({ onEvent() {}, onDisconnect() {} }), /Autentificare necesară/);
  assert.equal(stopped, 2);

  // Leaving while the permission dialog is open must stop a late microphone stream.
  let resolvePermission;
  media = () => new Promise((resolve) => { resolvePermission = resolve; });
  const abort = new AbortController();
  const pending = createVoiceConversation({ onEvent() {}, onDisconnect() {}, signal: abort.signal });
  abort.abort(); resolvePermission(stream);
  await assert.rejects(pending, { name: 'AbortError' });
  assert.equal(stopped, 3);
  console.log('Verificări client vocal: conectare, microfon, transcriere, închidere, refuz și anulare — OK.');
} finally {
  for (const [key, descriptor] of Object.entries(saved)) {
    if (descriptor) Object.defineProperty(globalThis, key, descriptor); else delete globalThis[key];
  }
}
