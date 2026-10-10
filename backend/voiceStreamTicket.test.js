const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createVoiceStreamTicket, verifyVoiceStreamTicket } = require('./voiceStreamTicket');

test('biletul Cartesia păstrează replica criptată și expiră repede', () => {
  const previous = process.env.CARTESIA_STREAM_SECRET;
  process.env.CARTESIA_STREAM_SECRET = 'test-secret-that-is-long-enough-for-streaming';
  try {
    const ticket = createVoiceStreamTicket({ text: 'Hei! Hva heter du?', sessionId: 'session-1', turn: 0 }, 1_000);
    assert.equal(ticket.includes('Hva'), false);
    assert.deepEqual(verifyVoiceStreamTicket(ticket, 2_000), {
      kind: 'cartesia-dialogue', text: 'Hei! Hva heter du?', sessionId: 'session-1', turn: 0, expires: 61_000,
    });
    assert.throws(() => verifyVoiceStreamTicket(`${ticket.slice(0, -1)}x`, 2_000), /nu este valid/i);
    assert.throws(() => verifyVoiceStreamTicket(ticket, 61_001), /expirat/i);
  } finally {
    if (previous === undefined) delete process.env.CARTESIA_STREAM_SECRET;
    else process.env.CARTESIA_STREAM_SECRET = previous;
  }
});
