import { build } from 'vite';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { writeFileSync } from 'node:fs';

const root = resolve(import.meta.dirname, '..');
const outDir = resolve(root, 'node_modules/.cache/voice-catalog');
await build({ configFile: false, logLevel: 'error', build: {
  ssr: resolve(root, 'scripts/voice-context-source.js'), outDir, emptyOutDir: false,
  rollupOptions: { output: { entryFileNames: 'catalog.mjs' } },
} });
const { voiceCatalog } = await import(pathToFileURL(resolve(outDir, 'catalog.mjs')));
writeFileSync(resolve(root, 'backend/voiceCatalog.json'), `${JSON.stringify(voiceCatalog)}\n`);
console.log('Context vocal generat din lecțiile și direcțiile actuale.');
