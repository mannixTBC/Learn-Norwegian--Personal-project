import { test } from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'vite';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';
const root = resolve(import.meta.dirname, '..');
const outDir = resolve(root, 'node_modules/.cache/dialogue-ui-tests');
await build({ configFile: resolve(root, 'vite.config.js'), logLevel: 'error', plugins: [{
  name: 'dialogue-ui-services', enforce: 'pre',
  resolveId(id) {
    if (id.endsWith('/services/chat')) return 'virtual:ui-chat';
    if (id.endsWith('/services/voicePractice')) return 'virtual:ui-practice';
    if (id.endsWith('/services/voiceConversation')) return 'virtual:ui-live';
    if (id.endsWith('/services/voiceTranscripts')) return 'virtual:ui-transcripts';
  },
  load(id) {
    if (id === 'virtual:ui-chat') return 'export const startChatSession = (...args) => globalThis.uiMock.start(...args); export const sendChatTurn = (...args) => globalThis.uiMock.turn(...args);';
    if (id === 'virtual:ui-practice') return `export const practiceRequest = (...args) => globalThis.uiMock.practice(...args);
      export const recordPracticeAnswer = async options => { globalThis.uiMock.recorder = options; return { stop() { options.onComplete(new Blob([new Uint8Array(200)]), 3); }, cancel() { globalThis.uiMock.cancelled++; } }; };
      export const recordingPayload = async () => ({ audioBase64: 'offline', mimeType: 'audio/webm' });
      export const audioBlob = () => new Blob(['offline']);`;
    if (id === 'virtual:ui-live') return 'export const createVoiceConversation = () => { throw Error("Unexpected live transport"); };';
    if (id === 'virtual:ui-transcripts') return 'export const getVoiceTranscriptPreference = async () => ({ enabled: false }); export const saveVoiceTranscript = async () => {};';
  },
}], build: { ssr: resolve(root, 'src/modules/chat/VoiceLessonConversation.js'), outDir, emptyOutDir: false, rollupOptions: { output: { entryFileNames: 'voice.mjs' } } } });
const { default: VoiceLessonConversation } = await import(pathToFileURL(resolve(outDir, 'voice.mjs')));
const text = (node) => typeof node === 'string' ? node : node?.children?.map(text).join('') || '';

test('UI compatibil: sarcină înainte de start, retry fără retranscriere, ritm lent și oprire', async (t) => {
  const names = ['window', 'navigator', 'Audio', 'fetch', 'uiMock'];
  const saved = Object.fromEntries(names.map((key) => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
  let renderer, player, turnCalls = 0, transcriptions = 0;
  const initial = { sessionToken: 'initial-token', reply: 'Hei!', question: 'Hva vil du bestille?', turn: 0, maxTurns: 8, done: false };
  t.mock.timers.enable({ apis: ['setTimeout'] });
  try {
    globalThis.window = { crypto: globalThis.crypto };
    Object.defineProperty(globalThis, 'navigator', { configurable: true, value: { mediaDevices: {} } });
    globalThis.Audio = class { constructor() { player = this; } async play() {} pause() {} };
    globalThis.fetch = async () => ({ json: async () => ({ configured: true }) });
    globalThis.uiMock = {
      cancelled: 0,
      start: async () => initial,
      turn: async ({ sessionToken, message }) => {
        turnCalls++;
        if (message === 'mai lent') return { ...initial, sessionToken: 'slow-token', turn: 1, speechSpeed: .75 };
        assert.equal(sessionToken, 'initial-token'); assert.equal(message, 'En kaffe.');
        if (turnCalls === 1) throw Error('Serviciu indisponibil, răspuns păstrat.');
        return { ...initial, sessionToken: 'next-token', question: 'Vil du ha vann?', turn: 1 };
      },
      practice: async (operation) => {
        if (operation === 'start') return { sessionToken: 'voice-token' };
        if (operation === 'stream-ticket') return { streamUrl: 'https://offline.example/audio' };
        if (operation === 'transcribe') { transcriptions++; return { decision: 'accept', text: 'En kaffe.', proof: 'offline-proof' }; }
        throw Error('Unexpected operation: ' + operation);
      },
    };
    await act(async () => { renderer = TestRenderer.create(React.createElement(VoiceLessonConversation, { level: 'B1', lessonId: 1, pathId: 'general', lessonTitle: 'Test', task: 'Comandă o băutură.' })); });
    assert.match(text(renderer.toJSON()), /Comandă o băutură/);
    const button = (label) => renderer.root.findAllByType('button').find((node) => text(node) === label);
    await act(async () => { await button('Pornește dialogul').props.onClick(); });
    await act(async () => { player.onended(); t.mock.timers.tick(1000); });
    assert.equal(globalThis.uiMock.recorder.maxSeconds, 120);
    await act(async () => { button('Am terminat răspunsul').props.onClick(); });
    assert.ok(button('Reîncearcă evaluarea'));
    assert.equal(turnCalls, 1); assert.equal(transcriptions, 1);
    await act(async () => { button('Reîncearcă evaluarea').props.onClick(); });
    assert.equal(turnCalls, 2); assert.equal(transcriptions, 1, 'Retry does not transcribe again');
    assert.equal(renderer.root.findAllByProps({ className: 'voice-lesson__message voice-lesson__message--user' }).length, 1);
    await act(async () => { player.onended(); t.mock.timers.tick(1000); });
    await act(async () => { button('Mai lent').props.onClick(); });
    assert.equal(player.playbackRate, .75);
    assert.equal(globalThis.uiMock.cancelled, 1, 'Help cancels current microphone recording');
    await act(async () => { button('Oprește conversația').props.onClick(); });
    assert.ok(button('Pornește un dialog nou'));
  } finally {
    act(() => renderer?.unmount()); t.mock.timers.reset();
    for (const [key, descriptor] of Object.entries(saved)) { if (descriptor) Object.defineProperty(globalThis, key, descriptor); else delete globalThis[key]; }
  }
});
