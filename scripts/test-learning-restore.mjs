import { build } from 'vite';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import assert from 'node:assert/strict';
import React from 'react';
import TestRenderer, { act } from 'react-test-renderer';

const root = resolve(import.meta.dirname, '..');
const outDir = resolve(root, 'node_modules/.cache/learning-restore-tests');
await build({ configFile: resolve(root, 'vite.config.js'), logLevel: 'error', plugins: [{
  name: 'restore-test-services', enforce: 'pre',
  resolveId(id) {
    for (const name of ['supabaseClient', 'supabaseLearning', 'entitlements', 'account', 'api']) {
      if (id.endsWith(`/services/${name}`) || id === `./${name}`) return `virtual:restore-${name}`;
    }
  },
  load(id) {
    if (id === 'virtual:restore-supabaseClient') return 'export const isSupabaseConfigured = true; export const supabase = globalThis.restoreClient;';
    if (id === 'virtual:restore-supabaseLearning') return 'export const restoreLearningProgress = (...args) => globalThis.restoreProgress(...args); export const flushLearningProgress = async () => ({});';
    if (id === 'virtual:restore-entitlements') return 'export const fetchEntitlements = async () => ({plan:"free", isPremium:false}); export const isDevBypassActive = () => false;';
    if (id === 'virtual:restore-account') return 'export const clearLocalAccountData = () => {}; export const deleteRemoteAccount = async () => {};';
    if (id === 'virtual:restore-api') return 'export const isNativeApp = () => false; export const webUrl = (s) => s;';
  },
}], build: { ssr: resolve(root, 'src/modules/auth/AuthContext.js'), outDir,
  rollupOptions: { output: { entryFileNames: 'auth.mjs' } } } });

globalThis.window = new EventTarget();
globalThis.document = Object.assign(new EventTarget(), { visibilityState: 'visible' });
globalThis.localStorage = { getItem: () => null };
let onAuth;
const pending = [];
globalThis.restoreProgress = (id, isCurrent) => new Promise((resolveRestore) => pending.push({ id, isCurrent, resolveRestore }));
globalThis.restoreClient = { auth: {
  getSession: async () => ({ data: { session: { user: { id: 'one' } } } }),
  onAuthStateChange: (callback) => { onAuth = callback; return { data: { subscription: { unsubscribe() {} } } }; },
} };
const { AuthProvider, useAuth } = await import(pathToFileURL(resolve(outDir, 'auth.mjs')));
let auth;
const Probe = () => { auth = useAuth(); return null; };
let renderer;
await act(async () => { renderer = TestRenderer.create(React.createElement(AuthProvider, null, React.createElement(Probe))); });
assert.equal(auth.initializing, true, 'protected screens wait for cloud restoration');
assert.equal(pending[0].id, 'one');
await act(async () => { onAuth('SIGNED_IN', { user: { id: 'two' } }); });
assert.equal(pending[0].isCurrent(), false, 'late restore for an old account is cancelled');
assert.equal(auth.initializing, true);
await act(async () => { pending[0].resolveRestore(); });
assert.equal(auth.initializing, true, 'old account cannot unlock the new account screen');
await act(async () => { pending[1].resolveRestore(); });
assert.equal(auth.user.id, 'two');
assert.equal(auth.initializing, false);
await act(async () => { onAuth('TOKEN_REFRESHED', { user: { id: 'two' } }); });
assert.equal(pending.length, 2, 'token refresh does not interrupt a running lesson');
await act(async () => { onAuth('SIGNED_OUT', null); });
await act(async () => { onAuth('SIGNED_IN', { user: { id: 'two' } }); });
assert.equal(auth.initializing, true, 'a fresh login restores even the same account');
await act(async () => { pending[2].resolveRestore(); });
assert.equal(auth.initializing, false);
await act(async () => renderer.unmount());
console.log('✓ Auth waits for cloud progress, cancels stale account restores and keeps lessons mounted during token refresh.');
