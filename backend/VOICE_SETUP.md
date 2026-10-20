# Practica vocală a lecției

Dialogul vocal începe în modul Realtime dacă browserul permite WebRTC. La eșecul conectării sau în lipsa WebRTC, interfața folosește modul compatibil. Accesul din lecție este controlat de PremiumGate.

## Flux și reguli

1. Situația orală a lecției este afișată înainte de pornire. Catalogul conține 144 de lecții și 10 direcții.
2. Ambele moduri folosesc sesiunea semnată din /api/chat pentru intenție, întrebări, obiective și feedback. Evenimentele audio nu acordă progres singure.
3. Serverul primește obiectivele, criteriile de producție și ultima întrebare. Întrebarea următoare ține cont de răspuns și de întrebările deja acoperite. Nu există cinci continuări generice obligatorii.
4. Maximum opt răspunsuri relevante. Obiectivele și criteriile acoperite permit încheierea după minimum două răspunsuri. Ajutorul, repetarea, răspunsul neclar și abaterea nu avansează. Oprirea încheie imediat. Cinci intervenții consecutive fără avansare încheie practica fără a pretinde realizarea obiectivelor.
5. În Realtime, transcrierea merge la evaluatorul comun; vocea citește replica aprobată într-un răspuns separat de conversația audio implicită. În modul compatibil, transcrierea este verificată separat, iar rezultatele ambigue cer confirmare. Erorile serviciului păstrează răspunsul pentru reîncercare.
6. Modul compatibil înregistrează maximum 45 secunde la A1/A2 și 120 secunde la B1–C2. Comanda „Mai lent” reduce ritmul. Microfonul este oprit în timpul redării și eliberat la închiderea practicii. Sesiunea live se oprește după șapte minute; modul compatibil nu mai pornește o înregistrare după acest prag.
7. Feedbackul comun arată obiective exersate independent, cu ajutor sau încă neexersate. Corectările sunt propuneri bazate pe citate din răspuns; recapitularea le salvează numai după confirmarea cursantului. Încheierea practicii nu certifică stăpânirea lecției.
8. În modul compatibil, replica este transmisă prin Cartesia, cu rezervă ElevenLabs/OpenAI. Audio identic este reutilizat din cache. Feedbackul românesc este citit prin Cartesia când serviciul este configurat; la eșec rămâne vizibil în scris.

## Configurare

- `OPENAI_API_KEY`: secret pe server, cu acces la transcriere, Chat Completions și Speech.
- `OPENAI_VOICE_STT_MODEL`: implicit `gpt-transcribe`.
- `OPENAI_CHAT_MODEL`: implicit `gpt-4o-mini`, temperatură 0.35, maximum 700 tokeni (1000 la C1/C2), fără retry automat.
- `OPENAI_REALTIME_MODEL`: implicit `gpt-realtime`.
- `OPENAI_VOICE_FEEDBACK_MODEL`: implicit `gpt-4o-mini`, utilizat numai de endpointul modular de feedback păstrat pentru compatibilitate.
- `OPENAI_VOICE_TTS_MODEL`: implicit `gpt-4o-mini-tts`, voce `marin`.
- `CARTESIA_API_KEY` și `CARTESIA_VOICE_ID`: activează streamingul pentru replica Norei.
- Cheia Cartesia este trimisă server-side prin antetul standard `Authorization: Bearer`; nu o
  expune în frontend și nu îi adăuga prefixul `VITE_`.
- Dialogul folosește `no-NO`, iar feedbackul final folosește `ro-RO`. Opțional,
  `CARTESIA_FEEDBACK_VOICE_ID` alege o voce separată pentru română; în lipsa ei este folosită
  vocea Norei. `CARTESIA_FEEDBACK_VOICE_SPEED` are valoarea implicită `0.95`.
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
lecție și direcție. Fiecare transcriere este legată și de dialogul, întrebarea și tura curentă.
Transcrierile acceptate au dovezi semnate; clientul nu poate înlocui răspunsurile
cu texte arbitrare înainte de analiză. Înregistrările nu sunt salvate. Transcrierile și
feedbackul sunt păstrate temporar în memoria procesului pentru retrimiteri, maximum
durata sesiunii; sunt curățate la cererile următoare. Nu sunt scrise în Blobs.
Doar audio public al întrebărilor este salvat durabil.

Linkul de streaming expiră după 60 de secunde. Replica este criptată cu AES-GCM în biletul
temporar, astfel încât textul și cheia Cartesia nu sunt expuse browserului sau URL-ului.
Funcția Netlify dedicată transmite direct corpul răspunsului Cartesia și nu îl convertește
în Base64 și nu îl păstrează în memorie integral.

Limitarea pornirilor (o pornire/minut/utilizator), maximum cinci încercări de răspuns și douăsprezece înregistrări totale pe tură, deduplicarea aceleiași înregistrări și
deduplicarea feedbackului sunt locale procesului. În funcții serverless diferite,
retrimiterea unei cereri poate produce o nouă transcriere/analiză. Acestea nu sunt
limite globale de buget; configurează limite și în contul OpenAI.

`backend/voiceCatalog.json` se generează din lecțiile reale prin `npm run build:voice-context`.
Contextul canonic al lecției și direcției este folosit pentru feedback; întrebările
inițiale sunt comune direcțiilor aceleiași lecții. Continuările sunt adaptive.

## Verificări

`npm run test:dialogue` rulează contractele pedagogice, API-urile cu serverul Express în proces, interfața și clienții vocali simulați. Nu consumă credit și nu pornește un server TCP.

`npm run test:dialogue:live` citește OPENAI_API_KEY din mediul local/.env.local și execută maximum șase cereri text reale. Se oprește la prima eroare de furnizor sau rețea, fără să afișeze cheia. Necesită acces la api.openai.com.

`npm run build:client` verifică compilarea interfeței.

Pentru proba vocală reală, verifică o comandă normală, răspunsuri scurte, ajutor, refuz politicos, oprire, pauze și accent românesc. Măsoară latența și verifică dacă vocea citește fidel replica aprobată; simulările nu pot demonstra aceste proprietăți.
