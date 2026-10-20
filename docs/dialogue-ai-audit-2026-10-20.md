# Dialog AI: implementare și verificare

20 octombrie 2026 · proiectul local Nordlingo

## Rezultat

Logica pedagogică este comună pentru chat, voce live și voce compatibilă. Progresul este decis prin răspunsul structurat al evaluatorului și validat de server; simpla primire a unei transcrieri nu mai avansează sesiunea.

| Problemă observată în auditul inițial | Implementare |
| --- | --- |
| Live număra ajutorul, abaterile și oprirea ca răspunsuri | Clientul vocal folosește sesiunea semnată și aceeași rută de evaluare ca chatul. Comenzile uzuale sunt rezolvate local pe server. |
| Succesiune rigidă de trei întrebări și cinci continuări generice | Întrebări adaptive, cu dovezi pentru informațiile deja oferite; fără continuări generice obligatorii. |
| Ajutorul folosea exemple fără legătură cu întrebarea | Indicii pentru întrebarea curentă; traducere sau sprijin general când nu există un exemplu sigur. |
| Rezultatul AI invalid era atribuit elevului | Eroare de serviciu recuperabilă; răspunsul și sesiunea rămân disponibile pentru retry. |
| Feedback fără criterii și fără stare pe obiective | Obiective și criterii cu stări „Exersat”, „Cu ajutor”, „De exersat”; încheierea practicii nu certifică stăpânirea lecției. |
| Corectările nu ajungeau în recapitulare | Propuneri numai pentru citate reale și corectări sigure; salvare după confirmarea explicită a cursantului. |

## Comportamentul dialogului

Situația orală apare înainte de start. Nora păstrează rolul, folosește Bokmål la nivelul lecției și pune o singură întrebare. Promptul permite româna pentru ajutor solicitat, acceptă răspunsuri scurte și sinonime, separă neînțelegerea de lipsa relevanței și cere evitarea repetării informațiilor deja oferite.

Limita este de opt răspunsuri relevante. După minimum două răspunsuri, obiectivele și criteriile susținute de dovezi permit încheierea anticipată. Dacă nu există o continuare validă, practica se poate încheia fără a marca obiectivele lipsă drept realizate. Ajutorul/repetarea nu avansează. „Nei, takk” la o ofertă poate avansa; „Stopp” încheie imediat. Cinci intervenții consecutive fără avansare opresc bucla de sprijin.

Instrucțiunile interzic schimbarea regulilor prin mesajele cursantului, solicitarea datelor personale reale, sfaturile profesionale periculoase și scorurile de pronunție deduse din text. Serverul verifică schema, semnătura și proprietarul sesiunii, limitele, identificatorii obiectivelor și existența citatelor în răspuns. Evaluarea semantică a citatelor și relevanței rămâne responsabilitatea modelului; aceste verificări nu garantează clasificarea perfectă sau rezistența absolută la injecții.

Vocea live primește replica aprobată într-o cerere audio separată de conversația implicită. Textul afișat vine de la server. Fidelitatea citirii audio trebuie verificată cu furnizorul real. Comanda „Mai lent” actualizează ritmul sesiunii Realtime între replici; modul compatibil reduce ritmul redării.

## Parametri

| Parametru | Valoare implicită |
| --- | --- |
| Evaluator comun | gpt-4o-mini; temperatură 0.35; store false |
| Buget răspuns structurat | 700 tokeni; 1000 la C1/C2 |
| Timeout / retry automat | 15 secunde / zero; retry explicit în interfață |
| Răspuns cursant | Maximum 1600 caractere |
| Istoric / stare | Patru mesaje, două fapte scurte, dovezi pe obiective, întrebări acoperite și cel mult trei corectări |
| Voce live | gpt-realtime; 1024 tokeni audio; ritm A1 0.85, A2 0.95, B1–C2 1 |
| Pauze live | semantic_vad medium; răspunsul automat și întreruperea automate dezactivate |
| Înregistrare compatibilă | 45 secunde A1/A2; 120 secunde B1–C2 |
| Durata practicii | Live: oprire la șapte minute; compatibil: nu mai începe o înregistrare după șapte minute |
| Transcriere | Configurația existentă gpt-transcribe; disponibilitatea nu a putut fi verificată prin API real |

Valorile modelelor pot fi suprascrise prin variabilele de mediu existente. Nu s-a schimbat configurația producției.

## Teste executate

- `npm run test:dialogue`: **43 teste reușite, zero eșecuri, zero TODO**, plus două scripturi de verificare a clienților vocali reușite. Include regresiile pentru contextul refuzului politicos și pentru oferta repetată după o comandă explicită.
- `npm run build:client`: **reușit**, 239 module. Vite avertizează în continuare despre configurația CJS și mărimea pachetului; compilarea nu este blocată.
- `npm run test:dialogue:live` din mediul agentului: **blocat la primul apel**, cod `ENOTFOUND`, înaintea oricărei evaluări reale. Cheia OPENAI_API_KEY este citită din configurația locală; nu a fost afișată sau inclusă în cod.
- Rularea cu furnizorul real pe PC, comunicată de utilizator: **5 scenarii reușite, 1 eșec**, la refuzul politicos (`advanceTurn: false` în loc de `true`). Aceasta precedă corectarea descrisă mai jos; nu este rezultatul versiunii corectate.

Suita locală verifică sincronizarea celor 144 de lecții și 10 direcții, criteriile transmise modelului, comenzi norvegiene/românești, repetare, refuz, oprire, evenimente duplicate, limite, citate false, corectări nesigure, recuperarea erorilor și confirmarea salvării în recapitulare. Testul interfeței compatibile verifică păstrarea răspunsului la retry fără retranscriere, durata avansată, ritmul lent și oprirea microfonului.

API-urile sunt testate cu Express și adaptorul serverless în proces, fără socket TCP. Autentificarea, furnizorii AI și transportul audio sunt simulați. Rezultatele confirmă orchestrarea și regulile deterministe, nu calitatea semantică a unui model real. Testul de injecție verifică neavansarea când evaluatorul clasifică mesajul ca abatere; nu pretinde că a testat rezistența modelului real.

## Corectarea contextului pentru refuzul politicos

Scenariul real modifica `lastQuestion` în „Vil du ha et smørbrød?”, dar păstra în istoric numai „Hei! Hva vil du bestille?” și `turn: 0`. Modelul primea astfel două întrebări diferite drept context pentru „Nei, takk”. Această contradicție poate explica eșecul; ieșirea modelului din rularea inițială nu a fost inclusă în rezultatul transmis, deci cauza semantică exactă nu este confirmată.

Scenariul folosește acum `nextSession`, aceeași tranziție ca aplicația, pentru a pregăti comanda „En kaffe.” și oferta Norei. Acest pas anterior este o configurație de test, nu un apel AI și nu primește dovezi inventate despre obiective. Întrebarea, istoricul și numărul de răspunsuri sunt consecvente. Promptul comun expune explicit `currentQuestion` și precizează că refuzarea produsului nu înseamnă oprirea exercițiului.

Un test automat verifică această coerență pentru toate cele șase scenarii. Scriptul real verifică istoricul înainte de apel și afișează, la eșec, separat clasificarea modelului și rezultatul aplicației. Așteptările de progres nu au fost relaxate și un refuz nu este acceptat automat în orice context.

Cele șase probe sunt verificări punctuale de text. Scenariul numit „corectare lingvistică sigură” verifică în această versiune acceptarea unei încercări imperfecte, nu și conținutul corectării salvate. Ele nu reprezintă o validare completă a dialogului sau a vocii.

## Protecție pentru produsele deja comandate

A doua rulare reală comunicată de utilizator a trecut refuzul politicos, dar a rămas la 5/6: după „Jeg vil ha en kaffe og et smørbrød, takk.” modelul a propus din nou „Vil du ha et smørbrød?”, iar serverul a păstrat întrebarea. Protecția bazată exclusiv pe `coveredQuestions` furnizate de model nu era suficientă.

Serverul păstrează acum separat `orderedItems` pentru comenzile simple și explicite din lecția `a1-cafe`. Lista este validată și păstrată în sesiunea semnată chiar după scurtarea istoricului. Nu acordă obiective de învățare și nu modifică decizia de relevanță a răspunsului. O ofertă de forma „Vil du ha…”, „Ønsker du…” sau „Har du lyst på…” pentru un produs deja comandat este respinsă atât ca propunere AI, cât și ca întrebare de rezervă. Când alternativele pregătite repetă comanda, dialogul poate continua cu „Vil du ha noe annet?” sau plata.

Regula este intenționat limitată la formele explicite și vocabularul cafenelei; nu este un parser semantic general pentru toate lecțiile. Negațiile, întrebările despre disponibilitate, alternativele și condițiile nu sunt interpretate ca o comandă. Patru teste suplimentare acoperă absența dovezilor AI, păstrarea comenzii, cazurile care nu sunt comenzi și fluxul API–client vocal cu un model simulat care repetă oferta. Scriptul real afișează `questionAdjusted: true` și `modelQuestion` când aplicația schimbă întrebarea modelului.

## Verificarea reală rămasă

Comanda `npm run test:dialogue:live` trebuie reluată pe PC pentru confirmarea versiunii corectate. Execută maximum șase cereri reale și se oprește la prima eroare de rețea/furnizor. Nu mai este necesară mutarea cheii pentru acest script.

Nu s-au verificat pe voce reală accentul, pauzele, fidelitatea citirii, latența și costul. Arhitectura adaugă o evaluare text înaintea răspunsului audio live; latența suplimentară trebuie măsurată. Nu s-a publicat sau trimis codul într-un serviciu extern.
