import { build } from 'vite';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import assert from 'node:assert/strict';
import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
const root = resolve(import.meta.dirname, '..');
const outDir = resolve(root, 'node_modules/.cache/scenario-voice-tests');
await build({ configFile: resolve(root, 'vite.config.js'), logLevel: 'error', plugins: [{
  name: 'scenario-voice-test-speech', enforce: 'pre',
  resolveId: id => id.endsWith('/norwegianSpeech') ? 'virtual:scenario-speech' : null,
  load: id => id === 'virtual:scenario-speech' ? 'export const speakNorwegian = (...args) => globalThis.voiceSpeech(...args);' : null,
}], build: { ssr: resolve(root, 'src/modules/exercises/ScenarioVoiceControls.js'), outDir, emptyOutDir: true, rollupOptions: { output: { entryFileNames: 'voice.mjs' } } } });
const { default: Voice } = await import(pathToFileURL(resolve(outDir, 'voice.mjs')));
let recorder, draft = '', sends = 0, playback;
class Recognition {
  constructor() { recorder = this; }
  start() { this.started = true; }
  stop() { this.onend?.(); }
  abort() { this.aborted = true; }
}
globalThis.window = { SpeechRecognition: Recognition };
globalThis.voiceSpeech = (text, options) => {
  playback = { text, ...options }; options.onPlaybackStart();
  return new Promise(resolve => options.signal.addEventListener('abort', () => resolve({ cancelled: true })));
};
const flow = { session: { turn: 0 }, busy: false, draft: '', setDraft: text => { draft = text; }, send: () => { sends++; } };
let renderer;
const text = node => typeof node === 'string' ? node : node.children?.map(text).join('') || '';
const button = name => renderer.root.findAllByType('button').find(n => n.props['aria-label'] === name || text(n) === name);
const render = async (extra = {}) => act(async () => {
  const element = React.createElement(Voice, { flow, blocked: false, reply: 'Hei!', ...extra });
  if (renderer) renderer.update(element); else renderer = TestRenderer.create(element);
});
await render();
await act(async () => button('Înregistrează răspunsul').props.onClick());
assert.equal(recorder.lang, 'nb-NO');
assert.equal(button('Încheie înregistrarea').props['aria-pressed'], true);
await act(async () => recorder.onresult({ results: [Object.assign([{ transcript: 'Jeg er forsinket.' }], { isFinal: true })] }));
assert.equal(draft, 'Jeg er forsinket.');
assert.equal(sends, 0, 'speech recognition never silently sends an unconfirmed transcription');
await act(async () => recorder.onend());
flow.draft = draft; await render();
await act(async () => button('Trimite răspunsul vocal').props.onClick());
assert.equal(sends, 1);
await act(async () => { button('Ascultă Nora').props.onClick(); });
assert.equal(playback.voice, 'female');
assert.equal(playback.text, 'Hei!');
const oldPlayback = playback;
await act(async () => button('Înregistrează răspunsul').props.onClick());
assert.ok(oldPlayback.signal.aborted, 'microphone never records Nora playback');
const oldRecorder = recorder;
const lateResult = recorder.onresult;
flow.busy = true; await render();
assert.ok(oldRecorder.aborted, 'submitting cancels recognition');
lateResult({ results: [Object.assign([{ transcript: 'stale' }], { isFinal: true })] });
assert.equal(draft, 'Jeg er forsinket.', 'late microphone callbacks cannot replace a submitted draft');
assert.equal(button('Înregistrează răspunsul').props.disabled, true);
flow.busy = false; flow.session = { turn: 1 }; await render({ reply: 'Hvor lenge?' });
assert.equal(playback.text, 'Hvor lenge?', 'after opting into voice, the new server reply is spoken');
await act(async () => button('Înregistrează răspunsul').props.onClick());
await act(async () => recorder.onerror({ error: 'not-allowed' }));
assert.match(text(renderer.root), /Permite accesul la microfon/);
assert.equal(draft, 'Jeg er forsinket.', 'denial preserves the existing answer');
const deniedRecorder = recorder;
await act(async () => renderer.unmount()); renderer = null;
assert.ok(deniedRecorder.aborted);
window.SpeechRecognition = undefined;
await render();
assert.equal(button('Înregistrează răspunsul').props.disabled, true);
assert.match(text(renderer.root), /Browserul nu oferă recunoaștere vocală/);
await act(async () => renderer.unmount());
delete globalThis.window; delete globalThis.voiceSpeech;
console.log('Scenario voice: Norwegian capture, explicit send, playback/microphone exclusion, stale callbacks, busy state, permission denial, unsupported browser and cleanup passed.');
