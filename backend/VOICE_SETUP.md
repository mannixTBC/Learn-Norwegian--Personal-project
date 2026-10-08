# Practică vocală modulară în lecții

Pe desktop și mobil, după exerciții apare un pas opțional de practică vocală.
Pe telefon, controalele sunt afișate pe o singură coloană. Nu este necesar Premium.
Etapa și rezultatele exercițiilor sunt păstrate la rotirea telefonului și reîncărcare.

## Flux

1. `backend/voiceQuestions.js` conține trei întrebări Bokmål pregătite pentru fiecare dintre cele 40 de lecții.
2. Vocea fiecărei întrebări este generată la prima utilizare, apoi reutilizată. Modelul,
   vocea, textul și instrucțiunile definesc cheia cache-ului; schimbarea lor generează o versiune nouă.
3. Elevul apasă „Răspunde”, vorbește maximum 20 de secunde, apoi apasă „Am terminat răspunsul”.
   Microfonul este eliberat imediat. Audio merge pe server numai pentru transcriere.
4. După trei răspunsuri (sau încheiere după două), o singură cerere LLM analizează toate răspunsurile.
5. Feedbackul românesc este limitat la 25 de cuvinte și citit vocal. Dacă TTS eșuează,
   textul rămâne vizibil. Reascultarea audio deja primit nu face alte cereri AI.

## Configurare

- `OPENAI_API_KEY`: secret pe server, cu acces la transcriere, Chat Completions și Speech.
- `OPENAI_VOICE_STT_MODEL`: implicit `gpt-4o-mini-transcribe`.
- `OPENAI_VOICE_FEEDBACK_MODEL`: implicit `gpt-4o-mini`.
- `OPENAI_VOICE_TTS_MODEL`: implicit `gpt-4o-mini-tts`, voce `marin`.
- În Netlify, variabilele trebuie să fie disponibile pentru Functions. Biblioteca
  `@netlify/blobs` folosește contextul proiectului, fără altă cheie introdusă manual.
- Cache-ul întrebărilor este site-wide în Netlify Blobs și persistă între publicări.
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
node --test backend/routes/voicePractice.test.js backend/voiceAudioCache.test.js
node scripts/test-voice-practice-client.mjs
npm run build
```

Testele simulează OpenAI și Netlify Blobs, fără consum de credit. Pentru proba reală:
reascultă o întrebare, răspunde de trei ori, verifică feedbackul final și oprirea
microfonului la plecare. Testează și încheierea după două răspunsuri, permisiunea
refuzată și redarea blocată de browser. Calitatea pronunției și transcrierii trebuie
evaluată cu voce reală, inclusiv cu accent românesc.
