## Extindere 25 octombrie 2026 — 200 de situații / 1.200 de variante

Starea curentă înlocuiește numerele din notele istorice de mai jos:
10 direcții × 20 de situații × 6 niveluri (A1, A2, B1, B2, C1, C2).
Fiecare direcție are cinci situații în fiecare dintre cele patru etape:
Introducere, Consolidare, Aplicare, Autonomie. Sunt 200 de situații distincte,
nu 1.200 de povești fără legătură; fiecare situație are șase variante CEFR.

### Progresul din lecții

Programa curentă are 24 de lecții pe nivel. Studioul citește cheile existente,
izolate pe cont și nivel, prin readCourseProgress:
- 0–5 lecții finalizate: etapa 1;
- 6–11: etapa 2;
- 12–17: etapa 3;
- 18–24: etapa 4.
Un test final de nivel promovat permite etapa 4. Numărul de lecții deblocate,
vizitele în pagini și rezultate ale altui cont/nivel nu sunt dovezi de progres.
Schimbarea etapei nu promovează automat utilizatorul la alt nivel CEFR.
Rezultatele conversațiilor nu modifică și nu blochează progresul în lecții.

scenarioLessonMap.json leagă toate variantele de ID-uri reale din programa
2026.2. Legăturile prioritizează suprapunerea de vocabular norvegian între
expresiile scenariului și lecții. Când nu există suprapunere, sunt folosite
repere din blocul de șase lecții al etapei, marcate explicit cu basis: stage.
Aceste legături sunt recomandări, nu o afirmație că întregul vocabular al
situației a fost deja predat. După schimbarea programei se regenerează harta;
o versiune nepotrivită nu contribuie cu legături sau progres vechi.

### Dificultatea și recomandările

Etapa este metadată editorială fixă a situației. Cazurile introductive cer
prezentare, identificare și solicitări simple; cazurile târzii includ diferențe
între mesaje, predări, prioritizare și clarificări. Contractul privat adaugă
politica de sprijin a etapei la politica CEFR: ghidare concretă la început,
apoi inițiativă mai mare, fără criterii ascunse, vocabular rar obligatoriu sau
refuzul ajutorului. A1/A2 nu primesc provocările avansate ale nivelurilor B/C.

Interfața afișează exact patru carduri, când există suficiente situații:
două noi din etapa curentă, una de reluat după ultima încercare incompletă
și una pentru consolidare, dacă istoricul permite. Locurile rămase sunt
completate din situațiile eligibile. Legăturile cu lecțiile finalizate cresc
prioritatea. Selecția este amestecată determinist pentru cont/nivel/direcție,
etapă și istoric; refresh-ul păstrează selecția dacă progresul nu s-a schimbat.
„Alte scenarii” persistă o nouă rundă și favorizează carduri diferite.
Finalizarea unei conversații schimbă istoricul și, implicit, recomandările.
Dacă stocarea e blocată, practica funcționează și interfața explică faptul că
runda aleasă se poate reseta.

„Explorează” afișează tot patru carduri, din toate cele 20 ale direcției,
inclusiv etape ulterioare, fără să deblocheze lecții. Filtrul implicit este
direcția utilizatorului; există și explorarea tuturor direcțiilor.
Linkurile de recapitulare și reluarea sesiunilor păstrează comportamentul anterior.

### Surse și mentenanță

- scripts/conversation-expansion-data.cjs: cele 160 de situații din această extindere.
- scripts/expand-conversation-catalog.cjs: sursa editorială a celor 30 precedente,
  adaptările comune A1–C2, repartizarea pe etape și generarea JSON-urilor.
- npm run build:conversation-catalog: regenerează catalogul, contractele serverului,
  ilustrațiile asociate și legăturile cu lecțiile.
- Cele zece contracte inițiale rămân individuale. Pentru cele 40 de situații
  existente, ID-urile obiectivelor, bugetele și reviziile sunt păstrate, astfel
  încât rezultatele deja salvate rămân valabile.
- Sunt refolosite ilustrațiile celor zece direcții; nu sunt 200 de imagini noi.
- Importurile private sunt explicite în backend/scenarioContract.js. Criteriile,
  exemplele de evaluare și faptele interne nu sunt trimise în catalogul public.

Validarea automată acoperă cardinalitatea, cele 1.200 de contracte public/server,
izolarea nivelurilor și etapelor, legăturile cu programa, selecția stabilă,
rotația, conturile, progresul, recapitularea și interfața web/aplicație.
Testele de evaluator folosesc răspunsuri simulate. Calibrarea semantică a
tuturor situațiilor cu AI real nu este declarată efectuată.

---

## Extindere 25 octombrie 2026 — patru scenarii pe direcție

Catalogul conține acum 40 de situații distincte: 10 existente și 30 noi.
Fiecare are șase variante A1–C2: 240 de variante în total.

| Direcție | Cele trei situații adăugate |
|---|---|
| Transport | Biletul nu se afișează; Un rucsac uitat în autobuz; La ce stație cobor? |
| Hoteluri | Lipsesc prosoapele; Zgomot pe hol; Bagajul după check-out |
| Birou | Mutăm ședința; Nu pot deschide fișierul; Predarea sarcinii înainte de liber |
| General | Ridicarea unui colet; O discuție cu vecina; Schimbarea unei programări |
| Construcții | Unealta lipsește; Clarificarea unei sarcini; Lipsesc două cutii |
| Îngrijire | Ora vizitei; Un pahar cu apă; Aerisim camera |
| Curățenie | Camera este ocupată; Lipsesc lavetele curate; O pată pe hol |
| Magazine | Unde găsesc produsul?; Prețul de pe raft; Bonul nu a ieșit |
| Studii | Prelungirea împrumutului; Ce trebuie să predau?; Împărțim proiectul |
| Familie | Întârzii la grădiniță; Hainele de schimb; Programarea discuției cu educatoarea |

Cele 30 de scenarii noi au câte trei obiective de bază: explicarea situației,
cererea/propunerea concretă și confirmarea unui pas acceptat de partener.
A2 adaugă o clarificare specifică; B1 compară opțiunile; B2 tratează o obiecție;
C1 negociază responsabilități și urmărirea situației; C2 distinge sensurile unei
formulări ambigue și precizează condițiile confirmării. Numărul de obiective
este 3/4/4/4/4/5; bugetul intervențiilor este 7/8/9/10/10/10.

Fiecare situație are alternative, limite și exemple proprii. A1/A2 nu primesc
provocările avansate. Informațiile de evaluare rămân în backend. Scenariile sunt
fictive, inclusiv orele, prețurile și disponibilitatea. Cele de îngrijire se
limitează la comunicare neclinică. Nu sunt prezentate ca reguli profesionale.

Sursa editorială a extinderii este `scripts/expand-conversation-catalog.cjs`.
Generatorul produce JSON public și contracte private explicite și înregistrează
importurile serverului. Poate fi rulat din nou, dar înlocuiește cele 30 de
scenarii generate: modificările editoriale pentru ele se fac în generator.
Cele zece scenarii anterioare sunt păstrate. Ilustrațiile existente sunt refolosite
pe direcție; nu au fost generate 30 de imagini noi. Fiecare direcție are patru
carduri, accesibile pe o singură pagină prin filtrul existent.

Validarea automată verifică toate cele 240 de rezolvări public/server și
obiectivele, izolarea nivelurilor, progresul și selectarea celor patru scenarii
din fiecare direcție în web/aplicație. Evaluatorul AI real necesită probe
semantice separate; testele cu răspunsuri simulate nu echivalează cu acestea.

---

## Actualizare 24 octombrie 2026 — taskul 4 din planul curent

Planul curent este: 1 catalog, 2 Nora și ilustrații, 3 ecran conversație,
4 logică/dificultate, 5 progres/recapitulare, 6 verificare parcurs.
Numerotarea din secțiunile istorice de mai jos aparține planului anterior.

Taskul 4 migrează celelalte nouă scenarii la contracte explicite: toate cele
10 scenarii au acum variante A1–C2, criterii individuale, roluri, fapte,
limite și o singură provocare permisă pentru nivelul ales. Catalogul public
conține contextul, obiectivele, indiciul și bugetul; criteriile, exemplele de
evaluare și regulile partenerului rămân exclusiv pe server.

- A1: trei obiective de bază, sprijin concret, fără complicație, 7 replici.
- A2: o clarificare contextuală suplimentară, fără complicație, 8 replici.
- B1: explicație/comparație specifică situației, 9 replici.
- B2: răspuns la o obiecție prevăzută, maximum 10 replici.
- C1: condiții, responsabilități sau limite ale angajamentului, maximum 10 replici.
- C2: clarificarea unei ambiguități specifice, maximum 10 replici.

La scenariul autobuzului se păstrează variantele existente, inclusiv cele cinci
obiective C2. La celelalte scenarii sunt trei obiective A1 și patru la A2–C2.
Nivelul nu este schimbat în timpul sesiunii. Sprijinul se adaptează prin întrebări
mai simple, repetare sau un scurt model de formulare; criteriile rămân aceleași.
Nu se cer un număr minim de cuvinte, vocabular rar sau o anumită pronunție.

Evaluarea este recalculată pe criterii după fiecare replică. Contradicțiile pot
retrage o bifă, autocorectarea o poate restabili. Confirmarea după replica Norei
este cerută doar unde obiectivul presupune acord; nu devine o condiție ascunsă
pentru o comandă sau o încheiere politicoasă. Mesajul de succes este specific
scenariului. Epuizarea replicilor nu acordă obiective lipsă.

Scenariile migrate au revizia 2: sesiunile vechi sunt respinse înainte de AI,
iar progresul cu altă definiție rămâne separat prin mecanismul existent.
Fiecare replică neterminală folosește acum două apeluri AI și la cele nouă
scenarii migrate: evaluator, apoi partener. Se păstrează o singură rezervare de
cotă, înregistrarea consumului ambelor apeluri și termenul comun de 35 secunde.
Această schimbare poate crește latența și consumul față de evaluatorul vechi.

Validare automată: corespondența public/server pentru 60 de variante, lipsa
provocărilor avansate la A1/A2, izolarea definițiilor, API start/turn/resume și
respingerea reviziilor vechi pentru scenariile migrate; fluxurile existente de
evaluare, progres, erori și voce. Aceste teste folosesc răspunsuri AI simulate:
nu demonstrează judecata semantică a modelului real. Probele live și calibrarea
cu furnizorul rămân distincte și nu sunt declarate trecute.

---

# Studio de conversație — structura și dificultatea scenariilor

Status: taskurile 1 și 2 sunt implementate pentru scenariul-model `bus-delay`.
Codul taskului 3 și testele automate sunt gata; validarea cu AI real se face după
deploy, conform deciziei utilizatorului. Încercarea locală din 23 octombrie 2026
s-a oprit la prima cerere cu `ENOTFOUND`; probele live nu sunt declarate trecute.
Taskul 5 adaugă designul desktop cu scenă panoramică și replica partenerului în
prim-plan. Taskul 6 implementează pregătirea și conversația mobilă după a doua imagine.
Taskul 4 este implementat: fluxul sesiunii, reluare după refresh și recuperare din
erori. Acest flux comun se aplică tuturor scenariilor; celelalte nouă scenarii
păstrează evaluarea și regulile anterioare până la migrarea individuală.

## Scenariul-model

Șoferul autobuzului 42 raportează aproximativ zece minute întârziere din cauza
traficului, fără accident. Nora joacă rolul dispecerului. Scopul de bază este:

1. Comunicarea întârzierii și a duratei.
2. Explicarea motivului.
3. Stabilirea și confirmarea unui pas următor sigur.

Nu cerem o formulă fixă sau o ordine rigidă. Utilizatorul poate propune planul ori
poate accepta planul dispecerului. O confirmare scurtă este suficientă dacă există
un plan clar într-o replică anterioară a partenerului. Răspunsul AI generat în
cererea curentă nu poate furniza retroactiv acel context.

## Structura datelor

- `src/modules/exercises/conversationScenarios.json`: catalogul public.
  Variantele modelului au context, obiective, ID-uri stabile, replică inițială,
  indiciu, așteptări și limită de replici pentru fiecare nivel.
- `src/modules/exercises/scenarioDifficulty.mjs`: selecția comună a variantei
  publice în browser și pe backend. Scenariile nemigrate folosesc regulile vechi.
  Modulul nu importă date interne de pe server.
- `backend/scenarios/bus-delay.json`: roluri, fapte de bază, audiențe, reguli de
  dezvăluire, obiective, criterii, exemple, rezolvări permise și limite.
- `backend/scenarios/bus-delay.levels.json`: fapte suplimentare, eventuale
  modificări explicite ale faptelor de bază, obiective specifice, limbaj,
  sprijin și provocarea disponibilă la fiecare nivel.
- `backend/scenarioContract.js`: validează și combină baza cu un singur nivel.
  Respinge ID-uri duplicate, referințe inexistente, structuri incomplete și
  nepotriviri între obiectivele publice și criteriile interne.
- `backend/scenarioTutor.js`: context, semnarea sesiunilor și compatibilitatea
  scenariilor nemigrate.
- `backend/scenarioAssessment.js`: prompturi separate pentru evaluator și
  partener, validarea citatelor și agregarea criteriilor.
- `backend/scenarioTurn.js`: evaluare, apoi replica partenerului; încheierea și
  actualizarea atomică a sesiunii, cu agregarea consumului ambelor cereri.
  Exemplele din contract sunt ipotetice, nu replici ale utilizatorului.

Fiecare sesiune primește o copie a definiției. Un nivel nu poate modifica
definiția folosită ulterior de altă sesiune.

## Dificultatea A1–C2

| Nivel | Cerință comunicativă distinctă | Sprijin | Obiective / replici maxime |
| --- | --- | --- | --- |
| A1 | Raportează situația și confirmă un pas simplu | Întrebări concrete, una câte una; fragmente inteligibile și confirmări scurte acceptate | 3 / 7 |
| A2 | Clarifică cine informează pasagerii | Propoziții simple; întrebări sau cereri de clarificare | 4 / 8 |
| B1 | Compară informarea imediată cu așteptarea unei verificări și justifică alegerea | Structuri pentru opțiuni și motive; ambele alegeri pot fi corecte | 4 / 9 |
| B2 | Răspunde cererii unei ore exacte fără a transforma estimarea în promisiune | O obiecție prevăzută; alternativă concretă de informare și actualizare | 4 / 10 |
| C1 | Negociază un compromis între actualizări și comunicarea doar când este oprit în siguranță | Responsabilități și condiție explicită pentru următoarea actualizare | 4 / 10 |
| C2 | Clarifică „întârziere de zece minute” versus „recuperare în zece minute”, apoi stabilește mesajul și actualizarea | Reformulare precisă și acord condiționat; nu cerem cuvinte rare sau răspunsuri lungi | 5 / 10 |

Limita de replici este o plasă pentru încheierea sesiunii, nu un obiectiv de atins.
Misiunea se poate termina mai devreme. Nu există un număr minim de cuvinte.
Complexitatea limbajului ghidează feedbackul; criteriile obiectivelor decid
îndeplinirea misiunii. Greșelile minore și autocorectarea sunt acceptate dacă
mesajul rămâne clar.

La B1, posibilitatea dispeceratului de a informa pasagerii este deja în contextul
public și devine fapt comun. La A1 și A2 rămâne o informație a partenerului care
poate fi descoperită prin dialog. Variantele avansate nu apar în promptul A1/A2.

La B2–C2, întârzierea curentă nu justifică o oră exactă de sosire sau recuperare.
Actualizarea se face când șoferul este oprit în siguranță; ora nu este inventată.
Dispecerul introduce doar provocarea definită, dacă utilizatorul nu a rezolvat-o
deja din proprie inițiativă.

## Integrare și compatibilitate

Interfața și backendul rezolvă aceleași obiective, indicii, replici inițiale și
limite. Variantele modelului înlocuiesc obiectivul generic de nivel; nu îl adaugă
din nou. Definiția internă nu este inclusă în răspunsul API sau în tokenul sesiunii.

Modelul are `revision: 2`. Sesiunile noi primesc această revizie în token.
Dacă o sesiune veche nu corespunde reviziei curente, API-ul cere începerea unei
sesiuni noi înainte de a apela AI-ul. La modificarea semnificației sau ordinii
obiectivelor, revizia trebuie incrementată. Rezultatele locale vechi vor fi
tratate separat când se implementează progresul, la taskul 8.

La schimbarea nivelului în interfață se închid sesiunea și indiciul anterior.
Rutele și mecanica sesiunii sunt comune. Desktopul folosește prima imagine de
referință, cu scena ilustrată și replica suprapusă. Varianta instalată folosește
interfața mobilă din taskul 6, dedicată celei de-a doua imagini.

## Evaluare și dialog — taskul 3

Pentru scenariul-model, fiecare mesaj urmează două etape:

1. Evaluatorul primește contractul nivelului și întregul dialog real, cu ID-ul și
   rolul fiecărei replici. Raportează fiecare obiectiv și fiecare criteriu ca
   `met`, `missing` sau `contradicted`, cu citate și feedback în română.
2. Serverul validează raportul și calculează obiectivele îndeplinite. Dacă sesiunea
   continuă, partenerul primește această evaluare și generează următoarea replică.

O bifă necesită toate criteriile obiectivului. Evaluarea se recalculează după
fiecare mesaj: o contradicție nerezolvată poate retrage o bifă, iar o autocorectare
poate restabili criteriul. Un răspuns fără legătură nu șterge automat ce a fost
comunicat corect anterior.

Serverul verifică ID-urile, acoperirea tuturor criteriilor, proveniența și
exactitatea citatelor. `priorPartnerCriteria` marchează criteriile de acord:
acestea cer un citat dintr-o replică anterioară a partenerului și dovadă dintr-o
replică ulterioară a utilizatorului. Se acceptă un „Ja” contextual; propunerea
inițială sau replica Norei generată în cererea curentă nu pot crea retroactiv
confirmarea. Regulile se aplică acordului de bază și negocierilor C1/C2.

**Limita verificării deterministe:** codul poate verifica proveniența citatelor
și ordinea replicilor, dar sensul lor, relevanța unui plan și detectarea
contradicțiilor sunt judecate de model. Testele cu furnizor simulat nu dovedesc
corectitudinea semantică a modelului. Feedbackul este generat în etapa evaluării.

Raportul intern, criteriile și exemplele nu sunt serializate în răspunsul API sau
în token. Interfața păstrează aceeași listă numerică `achieved`. La succes sau
la epuizarea bugetului, serverul încheie printr-o replică distinctă, fără întrebare
nouă; limita de mesaje nu atribuie obiective neîndeplinite. La o eroare de evaluare
sau de generare, nu este returnată o sesiune avansată parțial.

O tură în desfășurare folosește două cereri AI; o tură finală folosește numai
evaluatorul. Aceasta crește consumul și latența față de varianta anterioară.
Cota utilizatorului se rezervă o singură dată, iar tokenurile ambelor cereri se
înregistrează împreună, inclusiv când a doua cerere eșuează. Limita comună a
apelurilor este 35 de secunde, cel mult 20 de secunde per apel, fără reîncercări
automate. Scenariile nemigrate continuă să folosească un singur apel.

## Fluxul sesiunii — taskul 4

Utilizatorul alege situația, citește pregătirea și pornește conversația. Replica
inițială nu consumă un mesaj AI. În timpul trimiterii, textul apare ca mesaj în
curs; intră în istoricul confirmat numai după un răspuns complet și valid. O
blocare sincronă împiedică două trimiteri în aceeași filă, inclusiv două apăsări
înainte de rerandarea butonului.

Interfața arată feedbackul ultimei replici și anunță ultimele două răspunsuri
disponibile. Rezultatul distinge `success` de `turn_limit`, afișează obiectivele
realizate și cele rămase, apoi oferă o nouă încercare sau alegerea altei situații.
Reînceperea șterge istoricul, bifele și indiciul sesiunii anterioare.

`useConversationSession.js` gestionează starea și anularea cererilor;
`conversationSession.mjs` gestionează transportul, validarea răspunsurilor și
salvarea temporară. Un răspuns întârziat este ignorat după schimbarea scenariului,
nivelului, traseului sau contului, ori după părăsirea paginii. Butonul pentru alt
scenariu rămâne disponibil și în timpul așteptării.

### Reluare

Ultimul token confirmat și textul nestrimis sunt salvate în `sessionStorage`,
separat pentru utilizator, nivel și traseu. La revenirea în aceeași filă,
`POST /api/scenarios/resume` verifică autentificarea, semnătura, proprietarul,
expirarea, forma istoricului și revizia scenariului. Serverul reconstruiește
mesajele și ultimul feedback; nu apelează AI și nu consumă cotă. Se pot reafișa
și rezultatele unei sesiuni încheiate, cât timp tokenul este valid.

Valabilitatea rămâne o oră de la pornire; reluarea nu prelungește termenul. Datele
sunt temporare în browser, nu sincronizate între dispozitive. Dacă browserul
blochează stocarea, conversația rămâne utilizabilă în pagina curentă. Progresul
pe termen lung și sincronizarea aparțin taskului 8.

### Recuperare

| Situație | Acțiune în interfață |
| --- | --- |
| Conexiune întreruptă, răspuns incomplet, eroare de serviciu | Reîncearcă, cu același istoric confirmat și textul păstrat |
| Autentificare expirată | Conectează-te, cu revenire la pagina scenariilor |
| Sesiune expirată, invalidă, încheiată sau scenariu actualizat | Începe o sesiune nouă, păstrând textul nestrimis până la trimiterea explicită |
| Cotă ori limită de frecvență atinsă | Mesajul serverului și verificare manuală ulterioară |

Termenul clientului este 45 de secunde și include obținerea autentificării,
cererea și citirea răspunsului. Nu există retrimitere automată. Dacă răspunsul
serverului s-a pierdut după procesare, o retrimitere manuală poate apela AI și
consuma un mesaj din cotă încă o dată: protocolul stateless nu oferă deduplicare
durabilă între instanțe. Interfața păstrează o singură copie confirmată a replicii.

Erorile de autentificare ale furnizorului AI sunt raportate ca indisponibilitate a
serviciului; nu trimit utilizatorul să se reconecteze. Un eșec la pornirea unei
sesiuni noi nu reactivează formularul sesiunii expirate.

API-ul adaugă `expiresAt` și `endReason` la răspunsuri; tokenul include și ultimul
feedback. Validarea permite istorice de cel mult zece schimburi, cu limite pe
fiecare mesaj. Limita parserului pentru ruta scenariilor este 300 KB, iar tokenul
are maximum 280.000 de caractere, astfel încât dialogurile lungi și caracterele
escapate să nu invalideze o sesiune emisă chiar de server.

## Design desktop — taskul 5

Referința `image.png` a fost examinată vizual: titlu central și obiective,
panoramă, replica partenerului suprapusă peste marginea scenei, apoi acțiunea
utilizatorului. Desktopul implementează această compoziție, cu fonturile și
culorile petrol/albastru din tema web existentă.

`DesktopConversationStudio.js` primește aceeași sesiune și aceleași acțiuni ca
interfața instalată. Catalogul are carduri compacte și selector de nivel. După
alegere, contextul și așteptările nivelului sunt vizibile; începerea dialogului le
restrânge. Utilizatorul le poate redeschide oricând. Obiectivele rămân sus și își
arată bifele, fără monede, stele ori progres fictiv.

Replica actuală a Norei apare într-un card cu portret, peste panoramă. Istoricul
complet se poate deschide fără duplicarea replicii curente, iar feedbackul are
un control propriu. Formularul de text este acțiunea principală până la etapa
vocală. Pregătirea, reluarea, erorile și ambele rezultate folosesc aceeași
structură; acțiunile de recuperare din taskul 4 sunt păstrate.

`DesktopConversationStudio.css` este izolată pe rădăcina desktop.
Capacitor, PWA instalată și app preview folosesc separat interfața mobilă.
CSS-ul include adaptare pentru ferestre web înguste, text lung, focus de tastatură
și reducerea mișcării. La conținut lung sau zoom, pagina poate derula; nu ascunde
obiective ori controale pentru a impune artificial o înălțime fixă.

Panorama folosește temporar `public/images/voice/voice-fjord.webp`, iar portretul
este `public/images/voice/nora-avatar.webp`. **Acestea sunt resurse existente,
nu ilustrațiile dedicate fiecărui scenariu.** Ilustrațiile și integrarea lor
rămân taskul 7; nu pretindem reproducerea exactă a scenei cu autobuzul din referință.

### Verificarea designului

Testele automate verifică, pentru toate nivelurile, izolarea desktop/aplicație,
păstrarea obiectivelor și a fluxului, restrângerea/redeschiderea contextului și
accesul la istoricul conversației. Cele 20 de verificări de sesiune acoperă în
continuare ambele interfețe.

`npm run preview:scenarios` pornește un mediu local de verificare vizuală la
`http://127.0.0.1:4175/__conversation-preview`, cu sesiuni fictive și fără apeluri
AI ori autentificare reală. Parametrii `state=active|long|success|limit|error` și
`level=A1|A2|B1|B2|C1|C2` pregătesc stări reprezentative; `app=1` arată varianta
instalată. Acest mediu nu este inclus în aplicația de producție.

Pe 23 octombrie 2026, examinarea imaginii de referință a reușit, dar accesul la
serverul local din browser a fost blocat: `ERR_CONNECTION_REFUSED/TIMED_OUT`,
confirmat și prin `EACCES` la conectarea locală. Verificarea vizuală a paginii
randate și încadrarea la dimensiuni exacte de viewport nu sunt declarate trecute.

## Design mobil — taskul 6

A doua referință, `image(1).png`, a fost examinată vizual. Pregătirea prezintă
categoria/nivelul, titlul, imaginea, rolul, situația și obiectivele. Dialogul activ
folosește o imagine mai compactă, replica Norei în prim-plan și obiective
retractabile. Culorile crem, auriu și petrol, cardurile și butoanele tactile
păstrează familia vizuală a Jocurilor.

`MobileConversationStudio.js` este folosită de Capacitor, PWA instalată și app
preview. `ConversationStudio.js` a rămas coordonatorul comun pentru sesiune,
semnale de încărcare și recuperare; nu mai conține o a treia interfață duplicată.
Desktopul continuă să folosească `DesktopConversationStudio.js`.

- Catalogul folosește navigația inferioară comună, cu Jocuri activ și nivelul
  păstrat. În scenariu, controlul Înapoi revine la catalog și navigația globală
  este înlocuită de antetul propriu, ca în referință.
- Pornirea restrânge contextul și obiectivele pentru a lăsa loc replicii curente.
  Listele pot fi redeschise fără întreruperea sesiunii. Numărul obiectivelor
  realizate vine din evaluarea serverului, fără bife sau recompense fictive.
- Istoricul, contextul și ajutorul sunt accesibile separat. Deschiderea lor aduce
  conținutul în vedere; o replică nouă închide istoricul și readuce replica Norei
  în prim-plan. Feedbackul și ambele tipuri de rezultat sunt păstrate.
- Câmpul de text are font de 16px, limită vizibilă și nu primește automat focus
  pe mobil, pentru a nu deschide tastatura peste replica nouă. Desktopul păstrează
  focalizarea pentru tastatură. Citirea replicilor lungi și derularea rămân
  disponibile; nu se impune o înălțime fixă ce ar ascunde controale.

`MobileConversationStudio.css` este izolată pe rădăcina mobilă, cu safe areas,
ferestre înguste și înălțimi reduse. Nu schimbă celelalte jocuri. Bara comună
`MobileAppNav` acceptă opțional `activeSection`, astfel încât pagina scenariilor
să aparțină vizibil secțiunii Jocuri fără schimbarea regulilor celorlalte rute.

Imaginile tematice sunt reutilizate din sprite-ul existent
`public/images/exercises/mission-scenes.webp`, prin `ExerciseArtwork`, iar
portretul Norei este cel existent. Imaginile dedicate fiecărui scenariu rămân la
taskul 7. Referința veche la fișierul inexistent `conversation-scenes.png` a fost
înlăturată. Comenzile vocale, traducerea și redarea audio din mockup aparțin
etapei vocale separate; nu au fost introduse butoane fără funcționalitate.

Testele A1–C2 verifică pregătirea, obiectivele retractabile, revenirea la context,
navigația catalogului și absența focalizării automate pe mobil. Testele de sesiune
verifică în continuare erorile, retry, expirarea, refresh, istoricul și rezultatele
pe ambele interfețe. Imaginea de referință a fost examinată; verificarea vizuală a
paginii randate și a tastaturii pe dispozitiv rămâne de efectuat după deploy,
din cauza blocajului cunoscut al accesului local în acest mediu.

## Verificare

`npm run test:scenarios` rulează:

- 32 de teste backend și transport client: contracte, variante A1–C2, evaluare parțială, retragerea și
  restabilirea bifelor pe baza rapoartelor simulate, proveniența citatelor,
  confirmări în context, rapoarte incomplete/invalide, refuzuri și trunchiere.
- Același set acoperă fluxul API, separarea evaluării de dialog, încheierea,
  termenul comun, păstrarea sesiunii după erori, înregistrarea consumului,
  compatibilitatea și respingerea sesiunilor invalide sau cu revizie veche.
- 12 combinații de interfață: șase niveluri pe web și în modul aplicației instalate,
  cu pregătire, obiective, indicii, pornire și resetare la schimbarea nivelului.
- 20 de verificări ale fluxului pe web și în modul aplicației: pornire, trimitere
  dublă, erori și retry, refresh, expirare, reconectare, cote, răspunsuri întârziate,
  schimbarea contului/nivelului, reluarea unei cereri întrerupte și ambele rezultate.
- Validarea tokenurilor verifică inclusiv istoricele maxime cu caractere escapate;
  testele transportului acoperă timeout la autentificare, fetch și citirea JSON.

`npm run test:scenarios:live` folosește cheia locală fără a o afișa și verifică
32 de dialoguri cu rezultate așteptate, definite separat de răspunsurile modelului:

- Pentru fiecare nivel: răspuns complet, parțial, confirmare prematură,
  contradicție ulterioară și autocorectare.
- Alternativa de a aștepta verificarea la B1 și o cerere de manipulare a evaluatorului.
- Până la trei replici ale partenerului, cu verificări punctuale privind numărul
  întrebărilor și dezvăluirea prematură a faptelor. Replicile sunt afișate pentru
  revizia calitativă; verificările automate nu demonstrează toate regulile de rol.

Scriptul are maximum 35 de cereri, fără retry, și se oprește la prima eroare de
furnizor/rețea. Un singur caz poate fi reluat cu
`npm run test:scenarios:live -- A1-complete`. Rularea din 23 octombrie 2026 a fost
blocată cu `ENOTFOUND` la prima cerere: **zero dialoguri evaluate live**. Probele
rămân de rulat într-un mediu cu acces la furnizor, apoi se calibrează prompturile
în funcție de rezultatele efective.

## Etapele rămase

- Închiderea taskului 3: rularea și revizia probelor live A1–C2 după deploy.
- Task separat: interacțiune vocală și comenzile de redare.
- Revizia vizuală a desktopului și a mobilului, inclusiv tastatura, după deploy.
- Ilustrații specifice scenariilor.
- Activarea sincronizării progresului și proba finală după deploy (taskul 8).
- Migrarea individuală a celorlalte scenarii pe modelul validat.

## Progres și verificare finală — taskul 8

Implementarea locală adaugă progres durabil pe cont, nivel și scenariu. Catalogul
și pregătirea arată cel mai bun rezultat al unei singure încercări. Pregătirea
arată și ultimul rezultat, data, numărul încercărilor și obiectivele rămase după
ultima încercare. O încercare mai slabă nu șterge un succes anterior; obiectivele
din încercări diferite nu se reunesc pentru a inventa un succes.

`scenarioProgress.mjs` salvează numai rezultate terminale validate. ID-ul este
SHA-256 al tokenului terminal, fără a păstra tokenul sau conversația în progres.
Reluarea aceleiași sesiuni încheiate produce aceeași înregistrare și păstrează
data originală. Un rezultat întrerupt/invalid nu devine încercare încheiată.
Reînceperea șterge numai sesiunea temporară, nu istoricul rezultatelor.

Fiecare rezultat include identitatea definiției publice: revizie, obiective,
ID-uri și limita de replici. Rezultatele cu definiție diferită și vechea salvare
`conversation-studio:*` rămân neatinse și sunt semnalate ca versiune anterioară,
fără completare sau bife transferate automat. Schimbarea traseului personal nu
șterge progresul aceluiași scenariu; conturile și nivelurile sunt separate.

Sincronizarea folosește coada durabilă și restaurarea existente din
`learningSync.js`, cu chei `scenario_result_v1_<cont>_<nivel>_<scenariu>_<hash>`.
RPC-ul separat `patch_scenario_results` adaugă încercări în `learning_progress`,
cu `security invoker`, verificare `auth.uid()` și politicile RLS existente.
Unirea păstrează rezultatele deja existente și toate cheile lecțiilor. Repetarea
aceleiași livrări este idempotentă. Nu se sincronizează tokenuri, textul nestrimis,
transcript sau feedback liber. Acesta este istoric personal de învățare, editabil
în propriul browser, nu o certificare sau dovadă pentru recompense server-side.

**Starea bazei de date:** utilizatorul a aprobat aplicarea funcției separate.
Migrarea Supabase `20261023172904_scenario_result_progress_sync` a fost aplicată
în proiectul Nordlingo pe 23 octombrie 2026 și copiată în directorul local de
migrări. Funcțiile lecțiilor și politicile RLS nu au fost modificate.
Prima propunere, cu funcții înlocuite și SQL duplicat, fusese respinsă; versiunea
aprobată creează numai `patch_scenario_results` și permisiunile sale.

Proba pe baza reală a folosit rolul `authenticated`, context de cont și o
tranzacție retrasă integral prin ROLLBACK. Au trecut: scrierea rezultatului,
păstrarea tuturor datelor existente, livrarea repetată fără înlocuirea încercării,
respingerea cheilor altui cont, izolarea SELECT prin RLS și respingerea unei
cereri fără identitate. Nu au rămas rezultate fictive în cont. Inspecția
permisiunilor confirmă `security invoker`, `search_path` gol, acces anon refuzat,
acces authenticated permis și RLS activ pe tabel.

Verificarea advisorilor nu a semnalat funcția nouă. Au rămas notificări pentru
configurări existente, fără modificări în acest task: funcțiile de cotă chat
([detalii](https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable)),
politicile pentru autentificare anonimă
([detalii](https://supabase.com/docs/guides/database/database-advisors?queryGroups=lint&lint=0012_auth_allow_anonymous_sign_ins)),
tabelul chat_daily_usage cu RLS fără politici
([detalii](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy))
și protecția parolelor compromise
([detalii](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection)).

Backendul de sincronizare este disponibil. Codul interfeței rămâne local până la
push/deploy; proba din aplicație pe două dispozitive nu este declarată trecută.

Verificări adăugate: toate cele 60 de combinații scenariu/nivel, lipsa unirii
artificiale a obiectivelor, păstrarea celui mai bun rezultat, reluare idempotentă,
cont/nivel/revizie diferite, date corupte și rezultate întârziate. Testele cu
client Supabase simulat verifică restaurarea pe un dispozitiv nou, erorile și
coada offline, cheile străine, rezultate venite de la două dispozitive și izolarea
RPC-ului scenariilor față de lecții. Testele UI verifică salvarea, reluarea fără
dublare și afișarea rezultatului anterior pe desktop și mobil.

Rămân de închis după deploy: sincronizarea din aplicație pe două dispozitive,
probele AI reale și verificarea vizuală pe
dispozitiv. Taskul 7 (ilustrațiile dedicate) nu este implementat. Celelalte nouă
scenarii păstrează evaluarea anterioară până la migrarea individuală.

## Taskul 5 din planul curent — progres și recapitulare

Recapitularea citește rezultatele validate ale contului și nivelului curent. Afișează doar scenariile a căror ultimă încercare are obiective lipsă, în ordinea încercărilor recente. Un succes anterior este menționat și rămâne păstrat. O nouă încercare reușită scoate situația din această listă. Rezultatele vechi ca definiție și sesiunile incomplete nu sunt interpretate ca greșeli curente. Citirea nu modifică scoruri, obiective sau datele rezultatelor.

Linkul de reluare selectează pregătirea scenariului prin parametrul scenariu; nu pornește AI. O sesiune temporară existentă are prioritate și nu este ștearsă de link. Ecranul de rezultat oferă acces la Recapitulare. Catalogul distinge Reușit, De reluat și Versiune nouă. Lista se actualizează la schimbarea contului/nivelului, revenirea în fereastră sau un eveniment storage. Sincronizarea existentă a rezultatelor este reutilizată.
## Taskul 6 din planul curent — verificarea parcursului

Verificarea locală din 24 octombrie 2026 acoperă:

- 39 de teste backend, contracte, criterii, progres și transport, inclusiv toate cele 60 de variante.
- 24 de verificări ale fluxului UI pe web și în modul instalat. Parcursul suplimentar folosește componentele și rutarea reale cu API simulat: catalog, încercare până la limita de replici, salvare, Recapitulare, revenire, reluare, succes și dispariția obiectivelor lipsă.
- 24 de combinații de afișare în Chrome: web/aplicație, 360×640, 390×844, 1366×900 și 740×360; pregătire, context lung și rezultat lung. Controalele rămân accesibile, nu apare derulare orizontală, suprafața exterioară este uniformă și tema se curăță la navigare. Atlasul este încărcat și decodat local.
- Catalogul cu filtre și paginare, Recapitularea, izolarea conturilor/nivelurilor, păstrarea succesului anterior și cele 78 de verificări ale canvasului comun.

Comanda reproductibilă: `npm run test:scenario-flow`. Nu apelează furnizorul AI.
Testele browserului folosesc componente randate și CSS de producție; nu sunt o probă a autentificării și sincronizării cu serviciile reale sau o probă pe telefon fizic.

Proba live limitată `npm run test:scenarios:live -- A1-complete` s-a oprit cu `ENOTFOUND` la prima cerere. Zero dialoguri evaluate de AI real, fără reîncercări. Calitatea semantică A1–C2, cele nouă scenarii migrate și sincronizarea pe două dispozitive rămân de verificat într-un mediu conectat după deploy. Verificarea locală nu este prezentată ca validare live.
