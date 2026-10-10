const { test } = require('node:test');
const assert = require('node:assert/strict');
const {
  languageSignal,
  questionKind,
  decidePrimaryTranscript,
  decideAmbiguousTranscript,
} = require('./voiceTranscriptDecision');

test('identifică separat norvegiana, româna și rezultatele incerte', () => {
  assert.equal(languageSignal([{ code: 'nb' }]), 'norwegian');
  assert.equal(languageSignal([{ code: 'ro' }]), 'romanian');
  assert.equal(languageSignal([{ code: 'no' }, { code: 'ro' }]), 'mixed');
  assert.equal(languageSignal([]), 'unknown');
  assert.equal(languageSignal(undefined), 'unknown');
});

test('prima trecere acceptă norvegiana și respinge româna clară', () => {
  assert.equal(decidePrimaryTranscript({ text: 'Jeg heter Mihai.', languages: [{ code: 'no' }] }).decision, 'accept');
  assert.equal(decidePrimaryTranscript({ text: 'Mă cheamă Mihai.', languages: [{ code: 'ro' }] }).decision, 'retry');
  assert.equal(decidePrimaryTranscript({ text: 'Mihai', languages: [] }), null);
  assert.equal(decidePrimaryTranscript({ text: 'Mihai', languages: [{ code: 'ro' }] }), null, 'A language tag alone must not reject a name');
});

test('răspunsurile foarte scurte folosesc întrebarea curentă fără a ghici orbește', () => {
  assert.equal(questionKind('Hva heter du?'), 'name');
  assert.equal(decideAmbiguousTranscript({
    primary: { text: 'Mihai', languages: [] },
    secondary: { text: 'Mihai', languages: [] },
    question: 'Hva heter du?',
  }).decision, 'accept');

  assert.equal(decideAmbiguousTranscript({
    primary: { text: 'Mihai', languages: [{ code: 'ro' }] },
    secondary: { text: 'Mihai', languages: [] },
    question: 'Hva heter du?',
  }).decision, 'accept', 'A stable name survives a Romanian language guess');

  assert.equal(decideAmbiguousTranscript({
    primary: { text: 'Jeg heter Mihai', languages: [{ code: 'ro' }] },
    secondary: { text: 'Jeg heter Mihai', languages: [{ code: 'ro' }] },
    question: 'Hva heter du?',
  }).decision, 'confirm', 'A full phrase with two Romanian signals requires confirmation');

  assert.equal(decideAmbiguousTranscript({
    primary: { text: 'Kanskje', languages: [] },
    secondary: { text: 'Kanskje', languages: [] },
    question: 'Hvordan har du det?',
  }).decision, 'confirm');

  assert.equal(decideAmbiguousTranscript({
    primary: { text: 'Ce faci', languages: [] },
    secondary: { text: 'Ce faci', languages: [] },
    question: 'Hva heter du?',
  }).decision, 'confirm', 'Multiple unknown words are not accepted as a name');

  assert.equal(decideAmbiguousTranscript({
    primary: { text: 'Mă cheamă Mihai', languages: [] },
    secondary: { text: 'Mă cheamă Mihai', languages: [] },
    question: 'Hva heter du?',
  }).decision, 'retry');
});
