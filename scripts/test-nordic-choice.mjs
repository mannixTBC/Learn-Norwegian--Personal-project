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
