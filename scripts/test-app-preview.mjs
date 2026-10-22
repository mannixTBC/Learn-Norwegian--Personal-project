import assert from 'node:assert/strict';
import { resolveAppPreview } from '../src/services/appExperience.js';

const tab = () => {
  const values = new Map();
  return {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: key => values.delete(key),
  };
};

const currentTab = tab();
assert.equal(resolveAppPreview('', currentTab), false, 'ordinary visits keep the web interface');
assert.equal(resolveAppPreview('?nivel=B2&appPreview=1', currentTab), true);
assert.equal(resolveAppPreview('?nivel=B2', currentTab), true, 'preview survives a reload after navigation');
assert.equal(resolveAppPreview('', tab()), false, 'preview does not change an independent tab');
assert.equal(resolveAppPreview('?appPreview=0', currentTab), false);
assert.equal(resolveAppPreview('', currentTab), false, 'explicit exit clears the saved preview');
assert.equal(resolveAppPreview('?appPreview=invalid', tab()), false);

const blockedStorage = {
  getItem() { throw new Error('Storage unavailable'); },
  setItem() { throw new Error('Storage unavailable'); },
  removeItem() { throw new Error('Storage unavailable'); },
};
assert.equal(resolveAppPreview('?appPreview=1', blockedStorage), true);
assert.equal(resolveAppPreview('?appPreview=0', blockedStorage), false);
assert.equal(resolveAppPreview('', blockedStorage), false);
assert.equal(resolveAppPreview('?appPreview=1'), true);
console.log('App preview: explicit opt-in, navigation reload, exit and unavailable storage passed.');
