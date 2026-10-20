// Real chat route; only auth, AI and WebRTC transport are simulated.
import { createRequire } from 'node:module';
import assert from 'node:assert/strict';
const require = createRequire(import.meta.url);
const express = require('express');
const { inProcessFetch } = require('../backend/testSupport');
const auth = require('../backend/middleware/authSupabaseUser');
const openai = require('../backend/openai');
const usage = require('../backend/chatUsage');
const originals = [auth.requireAuth, openai.getOpenAI, openai.isOpenAIConfigured, usage.consumeChatQuota, usage.recordChatUsage];
export const modelAnswer = (question = 'Vil du ha vann?', extra = {}) => ({
  understood: true, intent: 'answer', advanceTurn: true, reply: 'Takk.', question,
  questionTranslation: 'Dorești apă?', suggestions: [], correction: null, memory: null,
  correctionConfidence: 'none', complete: false, evidence: [], coveredQuestions: [], ...extra,
});
const replies = [];
export const modelCalls = [];
export const enqueue = (result) => replies.push(result);
auth.requireAuth = (req, _res, next) => { req.userId = 'audit-learner'; next(); };
openai.isOpenAIConfigured = () => true;
openai.getOpenAI = () => ({ chat: { completions: { create: async (request) => {
  modelCalls.push(request);
  const result = replies.length ? replies.shift() : modelAnswer(`Vil du ha kaffe nummer ${modelCalls.length}?`);
  if (result instanceof Error) throw result;
  return { choices: [{ finish_reason: 'stop', message: { content: JSON.stringify(result) } }] };
} } } });
usage.consumeChatQuota = async () => ({ allowed: true, remaining: 20 });
usage.recordChatUsage = async () => {};
const router = require('../backend/routes/chat');
[auth.requireAuth, openai.getOpenAI, openai.isOpenAIConfigured, usage.consumeChatQuota, usage.recordChatUsage] = originals;
const app = express();
app.use(express.json({ limit: '56kb' }));
app.use('/api/chat', router);
const request = inProcessFetch(app);

export async function withLiveClient(createVoiceConversation, lessonId, run) {
  const names = ['Audio', 'navigator', 'window', 'RTCPeerConnection', 'fetch'];
  const saved = Object.fromEntries(names.map((key) => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
  let peer, client, stops = 0;
  replies.length = 0; modelCalls.length = 0;
  const events = [], requests = [];
  const track = { enabled: true, stop() { stops += 1; } };
  const stream = { getTracks: () => [track], getAudioTracks: () => [track] };
  class FakePeer {
    constructor() { peer = this; this.sent = []; this.closed = false; }
    addTrack() {}
    createDataChannel() {
      this.channel = { readyState: 'open', send: (payload) => this.sent.push(JSON.parse(payload)), close() {} };
      return this.channel;
    }
    async createOffer() { return { sdp: 'offline-offer' }; }
    async setLocalDescription() {}
    async setRemoteDescription() { this.channel.onopen(); }
    close() { this.closed = true; }
  }
  try {
    Object.defineProperty(globalThis, 'navigator', { configurable: true, value: { mediaDevices: { getUserMedia: async () => stream } } });
    globalThis.Audio = class { play() { return Promise.resolve(); } pause() {} };
    globalThis.window = { RTCPeerConnection: FakePeer };
    globalThis.RTCPeerConnection = FakePeer;
    globalThis.fetch = async (url, options) => {
      requests.push({ url, body: options?.body });
      if (url.includes('/api/chat/')) return request(url, options);
      if (url.endsWith('/api/voice/session')) return new Response(JSON.stringify({ value: 'offline-ephemeral-token' }));
      if (url === 'https://api.openai.com/v1/realtime/calls') return new Response('offline-answer');
      throw new Error('Unexpected offline request: ' + url);
    };
    client = await createVoiceConversation({ level: 'A1', lessonId, pathId: 'general', onEvent: (event) => events.push(event), onDisconnect() {} });
    const emit = (event) => peer.channel.onmessage({ data: JSON.stringify(event) });
    const waitFor = async (predicate) => {
      const deadline = Date.now() + 3000;
      while (!predicate() && Date.now() < deadline) await new Promise(setImmediate);
      assert.ok(predicate(), 'Expected async client event did not arrive');
    };
    const results = () => events.filter((event) => ['practice.dialog', 'practice.retry'].includes(event.type)).length;
    const answer = async (transcript, itemId = 'answer-1', duplicate = false) => {
      const before = results();
      const event = { type: 'conversation.item.input_audio_transcription.completed', item_id: itemId, transcript };
      emit(event); if (duplicate) emit(event);
      if (transcript.trim() && !peer.closed) await waitFor(() => results() > before);
    };
    const ask = () => emit({ type: 'output_audio_buffer.stopped' });
    const latest = () => events.findLast((event) => event.type === 'practice.dialog')?.dialog;
    client.start(); ask();
    await run({ client, events, answer, ask, emit, peer, track, latest, requests, waitFor, stops: () => stops });
  } finally {
    client?.close();
    for (const [key, descriptor] of Object.entries(saved)) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor); else delete globalThis[key];
    }
  }
}
