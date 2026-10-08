import { build } from 'vite';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import assert from 'node:assert/strict';
const root = resolve(import.meta.dirname, '..');
const outDir = resolve(root, 'node_modules/.cache/voice-practice-client-tests');
await build({ configFile: false, logLevel: 'error', define: {
  'import.meta.env.VITE_SUPABASE_URL': 'undefined', 'import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY': 'undefined', 'import.meta.env.VITE_SUPABASE_ANON_KEY': 'undefined',
}, build: { ssr: resolve(root, 'src/services/voicePractice.js'), outDir, emptyOutDir: false, rollupOptions: { output: { entryFileNames: 'client.mjs' } } } });
const { recordPracticeAnswer, practiceRequest, recordingPayload, audioBlob } = await import(pathToFileURL(resolve(outDir, 'client.mjs')));
const names = ['navigator', 'window', 'MediaRecorder', 'FileReader', 'fetch'];
const saved = Object.fromEntries(names.map((key) => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
let stopped = 0;
let media;
let received = 0;
const stream = { getTracks: () => [{ stop: () => { stopped += 1; } }] };
class FakeRecorder {
  static isTypeSupported() { return true; }
  constructor(_stream, options) { this.mimeType = options.mimeType; }
  start() { this.state = 'recording'; }
  stop() { this.state = 'inactive'; this.ondataavailable({ data: new Blob(['test-audio'], { type: this.mimeType }) }); this.onstop(); }
}
try {
  Object.defineProperty(globalThis, 'navigator', { configurable: true, value: { mediaDevices: { getUserMedia: () => media() } } });
  globalThis.MediaRecorder = FakeRecorder;
  globalThis.window = { MediaRecorder: FakeRecorder };
  media = async () => stream;
  const abort = new AbortController();
  const recording = await recordPracticeAnswer({ signal: abort.signal, onComplete: (blob) => { assert.equal(blob.type, 'audio/webm;codecs=opus'); received += 1; }, onError: assert.fail });
  recording.stop(); assert.equal(stopped, 1); assert.equal(received, 1);
  const cancelled = new AbortController();
  await recordPracticeAnswer({ signal: cancelled.signal, onComplete: () => assert.fail('Cancellation must not submit audio'), onError: assert.fail });
  cancelled.abort(); assert.ok(stopped >= 2); assert.equal(received, 1);
  let resolvePermission;
  media = () => new Promise((resolve) => { resolvePermission = resolve; });
  const late = new AbortController();
  const pending = recordPracticeAnswer({ signal: late.signal, onComplete: assert.fail, onError: assert.fail });
  late.abort(); resolvePermission(stream);
  await assert.rejects(pending, { name: 'AbortError' });
  media = async () => { throw Object.assign(new Error('Denied'), { name: 'NotAllowedError' }); };
  await assert.rejects(recordPracticeAnswer({ onComplete: assert.fail, onError: assert.fail }), /Permite accesul/);
  globalThis.FileReader = class {
    readAsDataURL(blob) { blob.arrayBuffer().then((data) => { this.result = `data:${blob.type};base64,${Buffer.from(data).toString('base64')}`; this.onload(); }); }
  };
  const payload = await recordingPayload(new Blob(['answer'], { type: 'audio/mp4' }));
  assert.equal(payload.audioBase64, Buffer.from('answer').toString('base64')); assert.equal(payload.mimeType, 'audio/mp4');
  assert.equal(await audioBlob({ audioBase64: payload.audioBase64, mimeType: 'audio/mp4' }).text(), 'answer');
  globalThis.fetch = async (url, options) => {
    assert.equal(url, '/api/voice/practice/start'); assert.equal(options.headers.Authorization, undefined);
    return { ok: true, json: async () => ({ questions: ['Hva heter du?'] }) };
  };
  assert.equal((await practiceRequest('start', { level: 'A1', lessonId: 1 })).questions.length, 1);
  globalThis.fetch = async () => ({ ok: false, json: async () => ({ error: 'Autentificare necesară' }) });
  await assert.rejects(practiceRequest('start', {}), /Autentificare necesară/);
  console.log('Client practică modulară: microfon eliberat, anulare, permisiuni, audio și erori API — OK.');
} finally {
  for (const [key, descriptor] of Object.entries(saved)) { if (descriptor) Object.defineProperty(globalThis, key, descriptor); else delete globalThis[key]; }
}
