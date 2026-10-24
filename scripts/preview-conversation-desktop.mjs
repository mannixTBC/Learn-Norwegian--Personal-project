// Local visual QA only: synthetic sessions, no provider calls or real authentication.
import { createServer } from 'vite';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
const root = resolve(import.meta.dirname, '..');
const directory = resolve(root, 'node_modules/.cache/conversation-desktop-preview');
await mkdir(directory, { recursive: true });
await writeFile(resolve(directory, 'entry.jsx'), `
import React from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import Studio from '/src/modules/exercises/ConversationStudio.js';
import Navbar from '/src/modules/layout/Navbar/Navbar.js';
import catalog from '/src/modules/exercises/conversationScenarios.json';
import { resolvePublicScenario } from '/src/modules/exercises/scenarioDifficulty.mjs';
import { conversationStorageKey } from '/src/modules/exercises/conversationSession.mjs';
import '/node_modules/bootstrap/dist/css/bootstrap.min.css';
import '/src/App.css';
import '/src/modules/exercises/DesktopPractice.css';
const query = new URLSearchParams(location.search);
const level = catalog.levels[query.get('level')] ? query.get('level') : 'A1';
const state = query.get('state') || 'catalog';
const app = query.get('app') === '1';
document.documentElement.classList.toggle('is-installed-app', app);
localStorage.setItem('norwegian_career_profile_conversation-visual-preview', JSON.stringify({ pathId: 'transport' }));
const { scenario, difficulty } = resolvePublicScenario(catalog.scenarios.find(item => item.id === query.get('scenario')) || catalog.scenarios[0], catalog.levels, level);
const user = { id: 'conversation-visual-preview', name: 'Previzualizare', isGuest: true };
const key = conversationStorageKey(user.id, level, 'transport');
const sessions = new Map();
let count = 0;
const make = (scenarioId = scenario.id, selectedLevel = level) => {
  const selected = resolvePublicScenario(catalog.scenarios.find(item => item.id === scenarioId), catalog.levels, selectedLevel);
  const data = { scenarioId, level: selectedLevel, sessionToken: 'preview-' + ++count, reply: selected.scenario.opening,
    turn: 0, achieved: [], done: false, feedback: '', maxTurns: selected.difficulty.turns,
    expiresAt: Date.now() + 3600000, endReason: null, messages: [{ role: 'assistant', text: selected.scenario.opening }] };
  sessions.set(data.sessionToken, data); return data;
};
sessionStorage.removeItem(key);
if (!['catalog', 'ready'].includes(state)) {
  const data = make();
  if (['success', 'limit'].includes(state)) {
    data.turn = state === 'success' ? 3 : difficulty.turns;
    data.done = true; data.endReason = state === 'success' ? 'success' : 'turn_limit';
    data.achieved = state === 'success' ? scenario.goals.map((_, i) => i) : [0, 1];
    data.feedback = state === 'success' ? 'Ai comunicat situația și ai confirmat responsabilitățile. Mesajele tale au fost clare.' : 'Ai explicat întârzierea și cauza. Mai exersează confirmarea planului împreună cu dispeceratul.';
    data.messages = [data.messages[0], ...Array.from({ length: data.turn }, (_, i) => [
      { role: 'user', text: i ? 'Kan dere informere passasjerene?' : 'Jeg er omtrent ti minutter forsinket på grunn av trafikken.' },
      { role: 'assistant', text: i === data.turn - 1 ? 'Takk for samtalen. God tur!' : 'Jeg kan informere passasjerene. Kan du fortsette ruten trygt?' },
    ]).flat()];
    data.reply = data.messages.at(-1).text;
  }
  if (state === 'long') data.reply = 'Vi kan gi passasjerene beskjed om at rute 42 er omtrent ti minutter forsinket akkurat nå, uten å love når bussen kommer. Fortsett den vanlige ruten på en trygg måte. Gi oss en ny oppdatering når du står trygt ved neste stopp, så endrer vi meldingen dersom anslaget har endret seg. Er du enig i denne fordelingen av ansvar?';
  data.messages[data.messages.length - 1].text = data.reply;
  sessionStorage.setItem(key, JSON.stringify({ version: 1, scenarioId: scenario.id, sessionToken: data.sessionToken, draft: '' }));
}
const response = (data, status = 200) => ({ ok: status === 200, status, json: async () => data });
const originalFetch = window.fetch.bind(window);
window.fetch = async (url, options) => {
  if (!String(url).includes('/api/scenarios/')) return originalFetch(url, options);
  const body = JSON.parse(options.body), op = url.split('/').at(-1);
  if (state === 'error' && op === 'turn') return response({ error: 'Serviciul este indisponibil momentan.' }, 502);
  if (op === 'start') return response(make(body.scenarioId, body.level));
  const previous = sessions.get(body.sessionToken);
  if (op === 'resume') return response(previous);
  const next = { ...previous, sessionToken: 'preview-' + ++count, turn: previous.turn + 1,
    reply: 'Jeg kan informere passasjerene. Kan du fortsette ruten trygt?', achieved: [0, 1], feedback: 'Ai comunicat durata și cauza întârzierii. Confirmă acum următorul pas.' };
  next.messages = [...previous.messages, { role: 'user', text: body.message }, { role: 'assistant', text: next.reply }];
  sessions.set(next.sessionToken, next); return response(next);
};
createRoot(document.getElementById('root')).render(<MemoryRouter initialEntries={['/scenarii?nivel=' + level]}><div className="App"><Navbar/><main className="App__main"><Studio/></main><footer className="footer">Nordlingo</footer></div></MemoryRouter>);
`);
const server = await createServer({ root, configFile: resolve(root, 'vite.config.js'),
  server: { host: '127.0.0.1', port: 4175, strictPort: true, open: false },
  plugins: [{ name: 'conversation-visual-fixtures', enforce: 'pre',
    resolveId(id) {
      if (id.endsWith('/AuthContext')) return '\0conversation-preview-auth';
      if (id.endsWith('/supabaseClient')) return '\0conversation-preview-token';
    },
    load(id) {
      if (id === '\0conversation-preview-auth') return 'export const useAuth = () => ({ user: { id: "conversation-visual-preview", name: "Previzualizare", isGuest: true }, logout() {} });';
      if (id === '\0conversation-preview-token') return 'export const supabase = null;';
    },
    configureServer(server) {
      server.middlewares.use('/__conversation-preview', async (req, res) => {
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.end(await server.transformIndexHtml('/__conversation-preview', '<!doctype html><html lang="ro"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Nordlingo — previzualizare desktop</title></head><body><div id="root"></div><script type="module" src="/node_modules/.cache/conversation-desktop-preview/entry.jsx"></script></body></html>'));
      });
    },
  }],
});
await server.listen();
console.log('Local visual QA: http://127.0.0.1:4175/__conversation-preview?state=catalog');
const stop = async () => { await server.close(); process.exit(0); };
process.once('SIGINT', stop);
process.once('SIGTERM', stop);
