import { test } from 'node:test';
import assert from 'node:assert/strict';
import ticketModule from './voiceStreamTicket.js';
import handler from '../netlify/functions/voice-stream.mjs';

const { createVoiceStreamTicket } = ticketModule;

test('funcția transmite incremental răspunsul audio Cartesia', async () => {
  const saved = Object.fromEntries(['CARTESIA_API_KEY', 'CARTESIA_VOICE_ID', 'CARTESIA_STREAM_SECRET'].map((key) => [key, process.env[key]]));
  const realFetch = global.fetch;
  process.env.CARTESIA_API_KEY = 'cartesia-test-key';
  process.env.CARTESIA_VOICE_ID = 'anna-cartesia-test';
  process.env.CARTESIA_STREAM_SECRET = 'test-secret-that-is-long-enough-for-streaming';
  let requestBody;
  global.fetch = async (url, options) => {
    assert.equal(url, 'https://api.cartesia.ai/tts/bytes');
    assert.equal(options.headers['X-API-Key'], 'cartesia-test-key');
    requestBody = JSON.parse(options.body);
    return new Response(new ReadableStream({
      start(controller) {
        controller.enqueue(new Uint8Array([1, 2]));
        controller.enqueue(new Uint8Array([3, 4]));
        controller.close();
      },
    }), { status: 200, headers: { 'Content-Type': 'audio/mpeg' } });
  };
  try {
    const ticket = createVoiceStreamTicket({ text: 'Hei! Hva heter du?', sessionId: 's1', turn: 0 });
    const response = await handler(new Request(`https://nordlingo.net/api/voice/stream?ticket=${encodeURIComponent(ticket)}`));
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('x-audio-provider'), 'cartesia');
    assert.deepEqual([...new Uint8Array(await response.arrayBuffer())], [1, 2, 3, 4]);
    assert.equal(requestBody.transcript, 'Hei! Hva heter du?');
    assert.equal(requestBody.model_id, 'sonic-latest');
    assert.equal(requestBody.voice.id, 'anna-cartesia-test');
    assert.equal(requestBody.language, 'no');
    assert.equal(requestBody.output_format.container, 'mp3');
    assert.equal(requestBody.generation_config.speed, 0.82);
  } finally {
    global.fetch = realFetch;
    for (const [key, value] of Object.entries(saved)) {
      if (value === undefined) delete process.env[key]; else process.env[key] = value;
    }
  }
});

test('funcția refuză metodele și biletele invalide', async () => {
  assert.equal((await handler(new Request('https://nordlingo.net/api/voice/stream', { method: 'POST' }))).status, 405);
  assert.equal((await handler(new Request('https://nordlingo.net/api/voice/stream?ticket=invalid'))).status, 401);
});
