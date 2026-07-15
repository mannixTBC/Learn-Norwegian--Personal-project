# Recomandări pentru serviciile aplicației NorvegiaTa

## Servicii deja folosite

- **Netlify** — găzduirea aplicației.
- **Supabase** — autentificare, baza de date și salvarea progresului.
- **ElevenLabs** — generarea vocilor și a materialelor audio.
- **DeepL** — traducerea textelor.

## Ce merită adăugat în continuare

### 1. Resend pentru e-mailuri

Este cea mai importantă integrare înainte de lansarea publică. Poate trimite e-mailurile pentru confirmarea contului, recuperarea parolei și autentificarea fără parolă.

Serviciul SMTP implicit oferit de Supabase este destinat în principal testării și are limite foarte mici. Resend se poate conecta la Supabase ca serviciu SMTP personalizat.

Documentație: https://supabase.com/docs/guides/auth/auth-smtp

### 2. Cloudflare Turnstile

Oferă protecție împotriva boților și a creării automate de conturi. Este important mai ales dacă aplicația permite acces anonim.

Supabase acceptă direct Cloudflare Turnstile și hCaptcha.

Documentație: https://supabase.com/docs/guides/auth/auth-captcha

### 3. Sentry

Ajută la identificarea erorilor întâlnite de utilizatori după publicarea aplicației. Poate arăta pagina pe care s-a produs eroarea și informațiile tehnice necesare pentru repararea ei.

### 4. PostHog sau Plausible

Pot fi folosite pentru statistici despre utilizarea aplicației:

- lecțiile accesate cel mai des;
- locurile în care utilizatorii abandonează cursul;
- funcțiile și exercițiile cele mai utilizate;
- evoluția utilizării aplicației.

Aceste servicii nu sunt urgente în etapa actuală.

### 5. Azure Speech pentru evaluarea pronunției

ElevenLabs este potrivit pentru generarea vocilor, dar Azure Speech este mai potrivit pentru analizarea și evaluarea pronunției utilizatorului.

Azure Speech poate furniza scoruri precum:

- acuratețea pronunției;
- fluența;
- completitudinea frazei;
- identificarea cuvintelor omise sau pronunțate greșit.

Norvegiana Bokmål este acceptată prin codul de limbă `nb-NO`.

Documentație: https://learn.microsoft.com/azure/ai-services/speech-service/language-support?tabs=pronunciation-assessment

## Varianta gratuită Azure Speech

Planul **Free F0** include în prezent:

- 5 ore de Speech-to-Text în timp real pe lună;
- evaluarea de bază a pronunției în limita consumului Speech-to-Text;
- 500.000 de caractere Text-to-Speech pe lună;
- reînnoirea lunară a limitelor gratuite.

La crearea resursei Azure trebuie selectat explicit planul **Free F0**, nu planul **Standard S0**. Cele cinci ore lunare sunt suficiente pentru dezvoltare, testare și un număr mare de exerciții scurte de pronunție.

Unele evaluări avansate, precum analiza completă a prozodiei, pot avea costuri suplimentare sau pot fi disponibile numai pentru anumite limbi.

Prețuri și limite: https://azure.microsoft.com/pricing/details/speech/

## Stocarea fișierelor

Nu este necesar încă un furnizor separat pentru înregistrări audio, imagini sau documente. Poate fi folosit **Supabase Storage**, cu reguli de acces pentru fiecare utilizator.

Documentație: https://supabase.com/docs/guides/storage

## Ordinea recomandată de implementare

1. Configurarea Resend pentru e-mailurile de autentificare.
2. Adăugarea Cloudflare Turnstile pentru protecție.
3. Integrarea Sentry pentru monitorizarea erorilor.
4. Testarea Azure Speech Free F0 pentru exercițiile de pronunție.
5. Adăugarea statisticilor prin PostHog sau Plausible după apariția primilor utilizatori.

## Servicii care pot fi amânate

- Procesarea plăților prin Stripe, până când va exista un abonament plătit.
- Un serviciu separat de analiză, până când aplicația începe să aibă utilizatori reali.
- Un alt serviciu de stocare, deoarece Supabase Storage este suficient în etapa actuală.
- Alte servicii de generare vocală, cât timp ElevenLabs funcționează corespunzător.
