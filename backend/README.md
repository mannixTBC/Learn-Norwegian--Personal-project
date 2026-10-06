# Backend NorvegiaTa (Node + Express)

Pornire:
  cd backend
  cp .env.example .env
  npm install
  npm start

Server: http://localhost:5000

Endpoint-uri:
  GET  /api/health         - verificare server
  GET  /api/news/headlines  - stiri din Norvegia (necesita GNEWS_API_KEY in .env)
  POST /api/translate      - body: { "text": "...", "fromLang": "no", "toLang": "ro" }
  GET  /api/pronunciation/status - starea configurarii Azure Speech, fara chei
  POST /api/pronunciation/model - voce-model norvegiana Azure Speech
  POST /api/pronunciation/evaluate - evaluare pronuntie norvegiana

Ordinea serviciilor de traducere:
  1. Azure Translator (AZURE_TRANSLATOR_KEY, opțional AZURE_TRANSLATOR_REGION)
  2. DeepL (DEEPL_API_KEY)
  3. MyMemory (fără cheie; MYMEMORY_EMAIL este opțional)

Evaluarea pronuntiei:
  1. Azure Speech Pronunciation Assessment (AZURE_SPEECH_KEY si AZURE_SPEECH_REGION)
  2. Vocea-model Azure Speech (AZURE_SPEECH_VOICE, implicit nb-NO-PernilleNeural)
  3. ElevenLabs Scribe si recunoasterea din browser raman variante de rezerva

Cheile Azure si ElevenLabs raman numai pe server. Nu le adauga in variabile VITE_*.
