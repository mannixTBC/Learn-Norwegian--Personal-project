/**
 * Instanța OpenAI (singleton, server-side).
 *
 * Creată lazy: dacă OPENAI_API_KEY lipsește (de ex. în dev fără cheie configurată),
 * `getOpenAI()` returnează null, iar ruta de chat răspunde cu o eroare clară
 * în loc să crape procesul. Permite rularea aplicației fără OpenAI configurat.
 *
 * Cheia NU este niciodată expusă în frontend (nu folosește prefix VITE_).
 */
let OpenAISDK = null;
try {
  // require în try/catch: dacă pachetul nu e instalat încă, nu crăpăm la import.
  OpenAISDK = require('openai').default;
} catch (_) {
  OpenAISDK = null;
}

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

let openaiInstance = null;
if (OpenAISDK && OPENAI_API_KEY) {
  openaiInstance = new OpenAISDK({ apiKey: OPENAI_API_KEY });
}

/** Returnează instanța OpenAI sau null dacă nu e configurată. */
const getOpenAI = () => openaiInstance;

/** True dacă OpenAI este configurat (SDK + cheie prezente). */
const isOpenAIConfigured = () => Boolean(openaiInstance);

module.exports = { getOpenAI, isOpenAIConfigured };
