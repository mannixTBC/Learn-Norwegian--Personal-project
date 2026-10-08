# Dialog vocal în lecții

Pe desktop (peste 860 px), după exerciții apare un pas opțional „Dialog vocal”.
Pe mobil, fluxul existent rămâne neschimbat. Dialogul nu cere abonament Premium.

## Configurare

- `OPENAI_API_KEY`: cheie secretă pe server, cu acces și credit pentru Realtime.
- `OPENAI_REALTIME_MODEL`: opțional; implicit `gpt-realtime`.
- Local, serverul citește `.env` și apoi `.env.local`, fără a suprascrie variabile existente.
- În Netlify, configurează aceste variabile în mediul serverului și publică aplicația.
- Autentificarea Supabase trebuie să fie configurată pentru verificarea identității.
- Pentru testare locală fără abonament, opțiunea existentă `VITE_PREMIUM_DEV_BYPASS=true`
  este acceptată numai în dezvoltare pe loopback, niciodată în Netlify/producție.

Cheia permanentă nu ajunge în browser. `/api/voice/session` verifică identitatea,
validează lecția și emite un token temporar cu expirare de 60 de secunde.
Vocea merge direct din browser la OpenAI prin WebRTC. Înregistrările și transcrierile
nu sunt salvate de aplicație; transcrierea rămâne doar în memoria pasului curent.
Microfonul este eliberat la oprire, ieșire, eroare, după feedback sau după 3 minute.
Limitarea pornirilor este locală procesului (o pornire/minut/utilizator); în serverless
nu este un plafon global de consum. Configurează și limite de buget în contul OpenAI.

## Material didactic

`npm run build:voice-context` generează `backend/voiceCatalog.json` din sursele reale
ale cursului și direcțiilor. Este inclus și în `npm run build`. Rulează-l din nou dacă
modifici lecții înainte de a reporni serverul local.
`backend/voiceTutor.js` definește ritmul pe nivel, un context curricular redus,
trei întrebări de maximum 12 cuvinte și feedback final de maximum 25 de cuvinte.
Clientul numără transcrierile ne-goale distincte; după al treilea răspuns cere feedback
și închide conexiunea doar după redarea sa. Se poate cere feedback mai devreme.
Comenzile scurte de ajutor nu se numără. Limitele de cuvinte sunt instrucțiuni pentru model.
Răspunsurile sunt cerute explicit (`create_response: false`), fără întrerupere automată
la zgomot (`interrupt_response: false`). Microfonul ascultă numai între replicile AI.
Bugetul de generare audio este 1024 tokeni pentru a evita tăierea propozițiilor;
economia vine din conversația și contextul scurt, nu dintr-un plafon audio foarte mic.
Detecția semantică cu `eagerness: low`
lasă timp cursantului să ezite. Parametrii sunt puncte de pornire pentru evaluare,
nu garantează perfect comportamentul modelului.

## Verificări

```
node --test backend/voiceTutor.test.js backend/routes/voice.test.js
node scripts/test-voice-client.mjs
npm run build
```

Pentru proba reală: completează exercițiile pe desktop, pornește dialogul,
permite microfonul, răspunde în norvegiană de trei ori și verifică feedbackul automat,
„mai lent”, ajutorul și încheierea anticipată. Verifică închiderea microfonului la plecare.
Pentru A1/A2/B1/B2 și cel puțin două direcții, ascultă dacă dificultatea,
corectările și situația respectă lecția. Testele automate folosesc un transport simulat;
nu certifică calitatea vocii sau conversația reală.
