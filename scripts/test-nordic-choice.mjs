import { build } from 'vite';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import assert from 'node:assert/strict';
import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';

const outDir = resolve('node_modules/.cache/nordic-choice-test');
await build({ configFile: resolve('vite.config.js'), logLevel: 'error', build: {
  ssr: true, outDir, emptyOutDir: true,
  rollupOptions: { input: resolve('src/modules/lessons/norwegian-program/LessonAppExercise.js'), output: { entryFileNames: 'exercise.mjs' } },
} });
const { default: Exercise } = await import(pathToFileURL(resolve(outDir, 'exercise.mjs')));
const exercise = { type: 'choice', prompt: 'Cum te prezinți?', options: ['Jeg heter Anna.', 'Jeg er fra Oslo.'], answer: 0, explanation: 'Heter introduce numele.' };
for (const chosen of [0, 1]) {
  const events = [];
  let renderer;
  let continued = 0;
  const props = { exercise, index: 0, onResult: (...args) => events.push(args), onContinue: () => continued++, onPrevious() {} };
  await act(async () => { renderer = TestRenderer.create(React.createElement(Exercise, props)); });
  const options = () => renderer.root.findByProps({ className: 'lapp-options' }).findAllByType('button');
  const primary = () => renderer.root.findByProps({ className: 'lapp-exercise__primary' });
  assert.equal(primary().props.disabled, true);
  await act(async () => options()[1 - chosen].props.onClick());
  await act(async () => options()[chosen].props.onClick());
  assert.equal(events.length, 0, 'selection and changing selection must not record a result');
  assert.equal(options()[chosen].props['aria-pressed'], true);
  assert.equal(primary().props.disabled, false);
  const check = primary().props.onClick;
  await act(async () => { check(); check(); });
  assert.equal(events.length, 1, 'double submit records once');
  assert.equal(events[0][1], chosen === 0);
  assert.ok(options().every(option => option.props.disabled));
  const next = primary().props.onClick;
  await act(async () => { next(); next(); });
  assert.equal(continued, 1);
  await act(async () => renderer.unmount());
  await act(async () => { renderer = TestRenderer.create(React.createElement(Exercise, { ...props, result: chosen === 0, response: events[0][3] })); });
  assert.ok(options().every(option => option.props.disabled), 'restored answers remain locked');
  assert.equal(options()[chosen].props['aria-pressed'], true);
  await act(async () => renderer.unmount());
}
console.log('Nordic choice: selection, confirmation, correct/wrong answers, duplicate taps and restore passed.');

const practiceCases = [exercise,
  { type: 'fill', prompt: 'Completează', sentence: 'Jeg ___ Anna.', answer: 'heter', explanation: 'Heter introduce numele.' },
  { type: 'order', prompt: 'Ordonează', words: ['Anna', 'heter', 'Jeg'], answer: ['Jeg', 'heter', 'Anna'], explanation: 'Subiectul este primul.' },
  { type: 'gaps', prompt: 'Alege', sentence: 'Jeg ___ Anna.', options: ['heter', 'bor'], answer: ['heter'], explanation: 'Heter introduce numele.' },
];
const label = node => node.children.map(child => typeof child === 'string' ? child : label(child)).join('');
for (const item of practiceCases) {
  const events = [], drafts = [];
  let renderer, continued = 0;
  const withClass = name => renderer.root.findAll(node => typeof node.type === 'string' && String(node.props.className || '').split(' ').includes(name));
  const tap = async node => act(async () => node.props.onClick());
  const answer = async correct => {
    if (item.type === 'choice') await tap(withClass('lapp-options')[0].findAllByType('button')[correct ? item.answer : 1]);
    if (item.type === 'fill') await act(async () => renderer.root.findByType('input').props.onChange({ target: { value: correct ? item.answer : 'bor' } }));
    if (item.type === 'order') for (const word of correct ? item.answer : ['Anna', 'heter', 'Jeg']) await tap(withClass('word-bank')[0].findAllByType('button').find(node => label(node) === word && !node.props.disabled));
    if (item.type === 'gaps') await tap(withClass('gap-word-bank')[0].findAllByType('button').find(node => label(node) === (correct ? 'heter' : 'bor')));
    if (item.type === 'fill') await act(async () => renderer.root.findByType('form').props.onSubmit({ preventDefault() {} }));
    else if (item.type !== 'gaps') await tap(renderer.root.findByProps({ className: 'lapp-exercise__primary' }));
  };
  await act(async () => { renderer = TestRenderer.create(React.createElement(Exercise, { exercise: item, index: 0, onResult: (...args) => events.push(args), onDraft: (...args) => drafts.push(args), onContinue: () => continued++ })); });
  await answer(false);
  assert.equal(events.length, 1);
  assert.equal(events[0][1], false);
  const original = JSON.stringify(events[0][3]);
  const savedDrafts = drafts.length;
  assert.equal(withClass('lapp-exercise__feedback-dialog').length, 1);
  assert.equal(withClass('lapp-exercise__repeat').length, 1, 'only a wrong answer offers practice');
  const repeat = withClass('lapp-exercise__repeat')[0].props.onClick;
  await act(async () => { repeat(); repeat(); });
  await answer(true);
  assert.equal(events.length, 1, 'practice cannot overwrite the first result or award points twice');
  assert.equal(JSON.stringify(events[0][3]), original, 'the original wrong response is preserved');
  assert.equal(drafts.length, savedDrafts, 'practice cannot overwrite the persisted first response');
  assert.equal(withClass('lapp-exercise__repeat').length, 0, 'a corrected practice attempt has no Repeat action');
  const next = withClass('lapp-exercise__modal-continue')[0].props.onClick;
  await act(async () => { next(); next(); });
  assert.equal(continued, 1);
  await act(async () => renderer.unmount());
  await act(async () => { renderer = TestRenderer.create(React.createElement(Exercise, { exercise: item, index: 0, result: false, response: JSON.parse(original), onResult: () => { throw Error('A restored result was rescored'); }, onContinue() {} })); });
  assert.equal(withClass('lapp-exercise__repeat').length, 1, 'restored wrong answers can also be practiced');
  await tap(withClass('lapp-exercise__repeat')[0]);
  await answer(true);
  await act(async () => renderer.unmount());
}
console.log('Modal feedback: wrong-answer practice works for choice/fill/order/gaps without rescoring, changing saved drafts or duplicate Continue actions.');
