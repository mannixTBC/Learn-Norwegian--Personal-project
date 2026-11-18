# Dialog AI V2 — starea implementării

Actualizat la 18 noiembrie 2026. Acest director conține integrarea server; modificările locale nu reprezintă o publicare a backendului.

## Experiența din aplicație

Studio păstrează interfața existentă. „Situații practice” citește exclusiv catalogul V2, filtrat după nivel. „Dialog liber” deschide clientul V2 în prezentarea existentă a Norei, cu filele Pe rând și Live. Intrările separate „nou” au fost eliminate. Nu există revenire automată la scenarii V1; ID-urile vechi nu sunt convertite în scenarii noi. Recomandarea de la finalul lecției conduce la biblioteca disponibilă. Dialogul pedagogic încorporat în lecții își păstrează contractul separat.

Catalogul actual: trei scenarii A1/A2/B1 și dialog liber A1–C2, norvegiană Bokmål cu suport românesc. Alte niveluri/perechi afișează indisponibilitatea; nu încărcăm catalogul vechi pentru a umple biblioteca.

## Responsabilități

- `contract.mjs`: validare și catalog public fără rubrici/fapte private.
- `engine.mjs`: stări, criterii, citate verificate, revizii, ajutor, încheiere și rezultate.
- `service.mjs`: rezervări înaintea evaluării, salvare atomică, anulare și timeout.
- `supabaseRepository.mjs`: adaptor pentru persistență PostgreSQL; fără import de progres V1.
- `router.mjs` / `mount.mjs`: rute autentificate și activare explicită.
- `aiEvaluator.mjs`: evaluator urmat de interlocutor pentru scenarii; o cerere pentru dialog liber. Callback-ul opțional `onTiming` raportează durata fiecărui apel provider, fără conversație sau identificatori personali.
- `live.mjs`: acreditare temporară și configurație vocală Live. Transcrierea este orientativă și nu acordă scoruri.

## Recuperare și feedback

Clientul păstrează comenzile netrimise, inclusiv traducerea generată. Traducerea se obține înainte de înregistrarea ajutorului și se afișează după confirmare. O eroare de generare nu marchează sesiunea ca sprijinită. `helpCommandIds` permite reconcilierea unei confirmări pierdute fără o nouă cerere de traducere.

Corecturile validate sunt acum păstrate în toate conversațiile pe rând, maximum 12. O observație nouă pentru același citat înlocuiește observația anterioară. Încheierea manuală păstrează această sinteză. Nu este atribuit un scor CEFR.

Live serializează salvarea și încheierea. Dacă serverul răspunde explicit SESSION_EXPIRED sau SESSION_NOT_FOUND, transcrierea restantă se arhivează local, separat pe cont, nivel și sesiune, iar următorul apel poate porni. Erorile temporare și de autentificare păstrează posibilitatea de reîncercare și nu permit suprascrierea transcrierii nesalvate. Arhivele sunt locale; nu sunt o confirmare de salvare pe server.

## Verificare și activare

- `node scripts/check-conversation-v2.mjs`: motor, evaluator simulat, dialog liber și Live, inclusiv A1–C2.
- `node scripts/check-conversation-v2-client.mjs`: client, ajutor, retrimitere, microfon și transport Live simulat.
- `node scripts/test-conversation-v2-persistence.mjs`: PostgreSQL local și rute HTTP reale, cu autentificare de test.
- `node scripts/test-conversation-v2-live.mjs --live`: cazuri sintetice pe providerul configurat; necesită o cheie validă.

Verificarea din 18 noiembrie: ruta V2 de catalog de pe serverul configurat răspunde 404. Încercarea cu providerul real este blocată de 401 / expired_secret_key. Testele simulate nu demonstrează funcționarea AI sau audio în producție. Consultați DEPLOYMENT.md pentru montare, cote și configurare; activarea necesită publicarea fișierelor actualizate și o cheie validă.