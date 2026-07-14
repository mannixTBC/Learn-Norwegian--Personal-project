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

Ordinea serviciilor de traducere:
  1. Azure Translator (AZURE_TRANSLATOR_KEY, opțional AZURE_TRANSLATOR_REGION)
  2. DeepL (DEEPL_API_KEY)
  3. MyMemory (fără cheie; MYMEMORY_EMAIL este opțional)
