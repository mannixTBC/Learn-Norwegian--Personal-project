# Practică vocală modulară în lecții

Pe desktop și mobil, după exerciții apare un pas opțional de practică vocală.
Pe telefon, controalele sunt afișate pe o singură coloană. Nu este necesar Premium.
Etapa și rezultatele exercițiilor sunt păstrate la rotirea telefonului și reîncărcare.

## Flux

1. `backend/voiceQuestions.js` conține trei obiective inițiale Bokmål pentru fiecare dintre cele 40 de lecții; dialogul continuă adaptiv până la opt răspunsuri.
2. Replica Norei este redată progresiv prin Cartesia: browserul începe redarea înainte ca
   întregul MP3 să fie generat. Dacă serviciul nu este configurat sau fluxul eșuează,
   clientul revine automat la ElevenLabs și apoi la OpenAI.
3. Vocea fiecărei întrebări este generată la prima utilizare, apoi reutilizată. Modelul,
   vocea, textul și instrucțiunile definesc cheia cache-ului; schimbarea lor generează o versiune nouă.
4. În modul automat, microfonul pornește după întrebare și trimite răspunsul după aproximativ 2 secunde de liniște,
   cu o limită de 30 de secunde. Elevul poate opri răspunsul mai repede sau poate folosi modul manual.
   Microfonul este eliberat imediat. Audio merge pe server numai pentru transcriere.
5. După opt răspunsuri, o singură cerere LLM analizează dialogul și pregătește feedbackul final.
6. Feedbackul românesc este limitat la 25 de cuvinte și citit vocal. Dacă TTS eșuează,
   textul rămâne vizibil. Reascultarea audio deja primit nu face alte cereri AI.

## Configurare

- `OPENAI_API_KEY`: secret pe server, cu acces la transcriere, Chat Completions și Speech.
- `OPENAI_VOICE_STT_MODEL`: implicit `gpt-transcribe`.
- `OPENAI_VOICE_FEEDBACK_MODEL`: implicit `gpt-4o-mini`.
- `OPENAI_VOICE_TTS_MODEL`: implicit `gpt-4o-mini-tts`, voce `marin`.
- `CARTESIA_API_KEY` și `CARTESIA_VOICE_ID`: activează streamingul pentru replica Norei.
- `CARTESIA_MODEL_ID`: implicit `sonic-latest`; `CARTESIA_API_VERSION`: implicit `2026-08-14`.
- `CARTESIA_VOICE_SPEED`: implicit `0.82`, limitat pe server la intervalul acceptat `0.6–1.5`.
- `CARTESIA_STREAM_SECRET`: opțional. Criptează linkurile audio temporare; dacă lipsește,
  se folosește `CHAT_SESSION_SECRET`, apoi `OPENAI_API_KEY` ca ultimă rezervă.
- În Netlify, variabilele trebuie să fie disponibile pentru Functions. Biblioteca
  `@netlify/blobs` folosește contextul proiectului, fără altă cheie introdusă manual.
- Cache-ul întrebărilor este site-wide în Netlify Blobs și persistă între publicări.
  Alegerea cache-ului folosește `SITE_ID` sau contextul Blobs din Functions;
  variabila de build `NETLIFY` nu este necesară la rulare.
  Scrierile condiționale previn generarea concurentă; o întrebare aflată în pregătire
  poate cere reîncercare. Local, audio se salvează în `node_modules/.cache/lesson-question-audio`.
- Autentificarea Supabase este obligatorie în producție. Bypass-ul local existent
  este permis doar în dezvoltare pe loopback, fără `NETLIFY`.

Tokenul de practică expiră după 10 minute, este semnat pe server și legat de utilizator,
lecție și direcție. Transcrierile au dovezi semnate; clientul nu poate înlocui răspunsurile
cu texte arbitrare înainte de analiză. Înregistrările nu sunt salvate. Transcrierile și
feedbackul sunt păstrate temporar în memoria procesului pentru retrimiteri, maximum
durata sesiunii; sunt curățate la cererile următoare. Nu sunt scrise în Blobs.
Doar audio public al întrebărilor este salvat durabil.

Linkul de streaming expiră după 60 de secunde. Replica este criptată cu AES-GCM în biletul
temporar, astfel încât textul și cheia Cartesia nu sunt expuse browserului sau URL-ului.
Funcția Netlify dedicată transmite direct corpul răspunsului Cartesia și nu îl convertește
în Base64 și nu îl păstrează în memorie integral.

Limitarea pornirilor (o pornire/minut/utilizator), a transcrierii per întrebare și
deduplicarea feedbackului sunt locale procesului. În funcții serverless diferite,
retrimiterea unei cereri poate produce o nouă transcriere/analiză. Acestea nu sunt
limite globale de buget; configurează limite și în contul OpenAI.

`backend/voiceCatalog.json` se generează din lecțiile reale prin `npm run build:voice-context`.
Contextul canonic al lecției și direcției este folosit pentru feedback; întrebările
sunt comune direcțiilor aceleiași lecții. Ruta și clientul Realtime anterior sunt
păstrate pentru compatibilitate, dar componenta desktop nu le mai folosește.

## Verificări

```
node --test backend/routes/voicePractice.test.js backend/voiceAudioCache.test.js backend/voiceStreamTicket.test.js backend/voiceStreamFunction.test.mjs
node scripts/test-voice-practice-client.mjs
npm run build
```

Testele simulează OpenAI și Netlify Blobs, fără consum de credit. Pentru proba reală:
parcurge un dialog de opt replici, verifică reacțiile adaptive, feedbackul final și oprirea
microfonului la plecare. Testează și încheierea după două răspunsuri, permisiunea
refuzată și redarea blocată de browser. Calitatea pronunției și transcrierii trebuie
evaluată cu voce reală, inclusiv cu accent românesc.
