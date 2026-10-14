const { test } = require('node:test');
const assert = require('node:assert/strict');
const { normalizeTranscriptMessages } = require('./voiceTranscripts');

test('normalizează numai replici text sigure pentru transcriptul vocal', () => {
  assert.deepEqual(normalizeTranscriptMessages([
    { role: 'assistant', content: '  Hei! Hva heter du?  ', turn: 0 },
    { role: 'user', content: 'Jeg heter Ana.', turn: 1 },
  ]), [
    { role: 'assistant', content: 'Hei! Hva heter du?', turn: 0 },
    { role: 'user', content: 'Jeg heter Ana.', turn: 1 },
  ]);
});

test('respinge roluri și transcripte nevalide', () => {
  assert.throws(() => normalizeTranscriptMessages([]), /nu este valid/i);
  assert.throws(() => normalizeTranscriptMessages([{ role: 'system', content: 'instrucțiuni' }]), /replică/i);
  assert.throws(() => normalizeTranscriptMessages([{ role: 'user', content: '   ' }]), /replică/i);
});

