import { b1Lessons } from '../b1Content';
import { b2Lessons } from '../b2Content';
import { b2ExtraLessons } from '../b2ExtraContent';

// Existing lessons retain their examples and answer keys; the new sequence adds
// explicit retrieval, extended interaction, productive tasks and reading.
const oldB1 = (id) => b1Lessons.find((lesson) => lesson.id === id);
const oldB2 = (id) => [...b2Lessons, ...b2ExtraLessons].find((lesson) => lesson.id === id);
const choice = (prompt, options, answer, explanation) => ({ type: 'choice', prompt, options, answer, explanation });
const fill = (prompt, answer, explanation) => ({ type: 'fill', prompt, answer, explanation });
const order = (prompt, answer, explanation) => ({ type: 'order', prompt, words: [...answer.slice(2), ...answer.slice(0, 2)].reverse(), answer, explanation });
const productive = (writingPrompt, speakingPrompt, criteria) => ({ writingPrompt, speakingPrompt, criteria });
const bridge = (recycles, bridgeDialogue) => ({ recycles, bridgeDialogue });
const reading = (title, text, question, answer, explanation) => ({ title, text, question, answer, explanation });

function lesson(source, extra) {
  return {
    ...source,
    vocabulary: source.vocabulary.slice(0, 6),
    ...extra,
    dialogue: [...source.dialogue, ...(extra.dialogueEnd || [])],
  };
}

const b1Reflection = {
  uid: 'b1-experiente-reactii', title: 'Ce s-a schimbat după experiență', duration: 35,
  objectives: ['să descrii reacția la o întâmplare', 'să compari așteptarea cu rezultatul', 'să explici ce ai învățat dintr-o experiență'],
  vocabulary: [
    ['Å bli overrasket', 'A fi surprins', 'Jeg ble overrasket over hvor mange som hjalp.', 'Am fost surprins de câți oameni au ajutat.'],
    ['Å føle seg', 'A se simți', 'Jeg følte meg tryggere etter samtalen.', 'M-am simțit mai în siguranță după conversație.'],
    ['Å forvente', 'A se aștepta', 'Jeg forventet at reisen skulle bli enkel.', 'Mă așteptam ca drumul să fie simplu.'],
    ['Å lære av', 'A învăța din', 'Vi lærte av det som skjedde.', 'Am învățat din ceea ce s-a întâmplat.'],
    ['Før pleide jeg å', 'Înainte obișnuiam să', 'Før pleide jeg å reise uten å sjekke rutene.', 'Înainte obișnuiam să călătoresc fără să verific orarele.'],
    ['Nå har jeg blitt', 'Acum am devenit', 'Nå har jeg blitt flinkere til å planlegge.', 'Acum am devenit mai bun la planificat.'],
  ],
  dialogue: [
    ['Elena', 'Hvordan følte du deg da fergen ble innstilt?', 'Cum te-ai simțit când feribotul a fost anulat?'],
    ['Jonas', 'Jeg følte meg usikker, for jeg forventet en enkel reise.', 'M-am simțit nesigur, pentru că mă așteptam la un drum simplu.'],
    ['Elena', 'Fikk dere hjelp av noen?', 'V-a ajutat cineva?'],
    ['Jonas', 'Ja, jeg ble overrasket over hvor vennlige folk var.', 'Da, am fost surprins de cât de amabili erau oamenii.'],
    ['Elena', 'Hva har du lært av turen?', 'Ce ai învățat din excursie?'],
    ['Jonas', 'Før pleide jeg å bestille alt sent. Nå har jeg blitt mer forberedt.', 'Înainte obișnuiam să rezerv totul târziu. Acum sunt mai pregătit.'],
  ],
  grammar: { title: 'Obiceiul din trecut și schimbarea de acum', rule: '„Pleide å” descrie un obicei trecut. „Har blitt” leagă o schimbare de rezultatul ei prezent. După „føle seg”, pronumele se schimbă cu subiectul: meg, deg, oss.', examples: ['Før pleide jeg å vente. — Înainte obișnuiam să aștept.', 'Vi har blitt tryggere, og vi føler oss bedre. — Am devenit mai siguri și ne simțim mai bine.'], wrong: 'Vi føler meg tryggere.' },
  exercises: [choice('Care propoziție exprimă un obicei din trecut?', ['Jeg pleide å reise alene.', 'Jeg reiser alene i morgen.', 'Jeg vil reise alene.'], 0, '„Pleide å” arată ce obișnuiai să faci.'), fill('Completează: „Vi følte ___ usikre.”', 'oss', 'Pronumele reflexiv corespunzător lui „vi” este „oss”.'), order('Ordonează: „Acum am devenit mai sigur”.', ['Nå', 'har', 'jeg', 'blitt', 'tryggere'], 'După „nå” pe primul loc, urmează verbul conjugat „har”.')],
  ...bridge(['Plutselig', 'Heldigvis'], [['Elena', 'Plutselig ble planen endret. Hvordan reagerte du?', 'Deodată planul s-a schimbat. Cum ai reacționat?'], ['Jonas', 'Heldigvis fikk vi hjelp, og jeg følte meg roligere.', 'Din fericire am primit ajutor și m-am simțit mai liniștit.']]),
  conversationPrompts: [['Hva pleide du å gjøre før du flyttet?', 'Ce obișnuiai să faci înainte să te muți?'], ['Når ble du positivt overrasket?', 'Când ai fost surprins plăcut?'], ['Hva har du lært av en vanskelig opplevelse?', 'Ce ai învățat dintr-o experiență dificilă?']],
  production: productive('Scrie 90–110 cuvinte despre o experiență: așteptare, reacție, rezultat și ce ai învățat.', 'Povestește 60–90 de secunde despre o schimbare personală și răspunde la o întrebare.', ['Folosești „pleide å” și „har blitt” în contexte diferite.', 'Legi reacția de eveniment printr-un motiv.', 'Reiei două expresii din lecția despre povestire.']),
};

const b1Retelling = {
  uid: 'b1-relatare-clarificare', title: 'Povestește mai departe și clarifică', duration: 35,
  objectives: ['să redai informația primită de la altcineva', 'să clarifici un detaliu fără să pierzi firul', 'să distingi evenimentul de reacția personală'],
  vocabulary: [
    ['Hun fortalte at', 'Ea a povestit că', 'Hun fortalte at bussen hadde stoppet.', 'Ea a povestit că autobuzul se oprise.'],
    ['Mener du at', 'Vrei să spui că', 'Mener du at alle måtte gå av?', 'Vrei să spui că toți au trebuit să coboare?'],
    ['Så vidt jeg husker', 'Din câte îmi amintesc', 'Så vidt jeg husker, ventet de en time.', 'Din câte îmi amintesc, au așteptat o oră.'],
    ['Før det', 'Înainte de asta', 'Før det hadde hun ringt kontoret.', 'Înainte de asta sunase la birou.'],
    ['Etter at', 'După ce', 'Etter at de fikk beskjed, tok de en taxi.', 'După ce au fost informați, au luat un taxi.'],
    ['Hvis jeg forstår deg riktig', 'Dacă te înțeleg corect', 'Hvis jeg forstår deg riktig, kom dere fram i tide.', 'Dacă te înțeleg corect, ați ajuns la timp.'],
  ],
  dialogue: [
    ['Mina', 'Hva fortalte Elena om reisen?', 'Ce a povestit Elena despre călătorie?'],
    ['Jonas', 'Hun fortalte at bussen hadde stoppet ved en tunnel.', 'A povestit că autobuzul se oprise lângă un tunel.'],
    ['Mina', 'Mener du at de måtte vente ute?', 'Vrei să spui că au trebuit să aștepte afară?'],
    ['Jonas', 'Nei, så vidt jeg husker, ventet de inne på bussen.', 'Nu, din câte îmi amintesc, au așteptat în autobuz.'],
    ['Mina', 'Hva skjedde etter at de fikk hjelp?', 'Ce s-a întâmplat după ce au primit ajutor?'],
    ['Jonas', 'De byttet buss. Før det hadde sjåføren ringt stasjonen.', 'Au schimbat autobuzul. Înainte de asta șoferul sunase la stație.'],
  ],
  grammar: { title: 'Un eveniment anterior altui eveniment trecut', rule: '„Hadde” + participiu arată ce se întâmplase deja înaintea unui reper trecut. În subordonata cu „at”, ordinea este subiect + verb; „ikke” precedă verbul conjugat.', examples: ['Da vi kom, hadde toget gått. — Când am ajuns, trenul plecase.', 'Hun sa at bussen ikke hadde kommet. — Ea a spus că autobuzul nu sosise.'], wrong: 'Hun sa at hadde bussen kommet.' },
  exercises: [choice('Trenul plecase înainte să ajungi. Ce alegi?', ['Toget skal gå.', 'Toget hadde gått.', 'Toget går nå.'], 1, '„Hadde gått” plasează plecarea înaintea altui moment trecut.'), fill('Completează: „Hun fortalte ___ de hadde ventet.”', 'at', '„At” introduce informația relatată.'), order('Construiește întrebarea de clarificare.', ['Mener', 'du', 'at', 'bussen', 'var', 'full'], 'În întrebarea principală verbul precedă subiectul; după „at” ordinea rămâne afirmativă.')],
  ...bridge(['Å føle seg', 'Å forvente'], [['Mina', 'Elena fortalte at det var viktig å føle seg trygg før de reiste videre.', 'Elena a povestit că era important să se simtă în siguranță înainte să continue drumul.'], ['Jonas', 'Det er naturlig å forvente tydelig informasjon når reisen endres.', 'Este firesc să te aștepți la informații clare când călătoria se schimbă.']]),
  conversationPrompts: [['Hva fortalte en venn om en reise?', 'Ce a povestit un prieten despre o călătorie?'], ['Hvordan kan du sjekke at du har forstått riktig?', 'Cum verifici dacă ai înțeles corect?'], ['Hva hadde skjedd før problemet ble løst?', 'Ce se întâmplase înainte ca problema să fie rezolvată?']],
  production: productive('Redă în 100–120 de cuvinte povestea unui coleg și precizează ce detaliu trebuie verificat.', 'Ascultă povestea din text, apoi redă în 90 de secunde ordinea evenimentelor din memorie.', ['Distingi clar sursa de propria interpretare.', 'Folosești un reper cu „hadde” + participiu.', 'Formulezi o întrebare de clarificare.']),
};

const b1Comparison = {
  uid: 'b1-comparare-alternative', title: 'Compară două variante și alege', duration: 35,
  objectives: ['să compari alternative pe criterii clare', 'să explici o alegere personală', 'să exprimi o concesie fără contradicție'],
  vocabulary: [
    ['Sammenlignet med', 'Comparativ cu', 'Sammenlignet med bilen er bussen billigere.', 'Comparativ cu mașina, autobuzul este mai ieftin.'],
    ['På den ene siden', 'Pe de o parte', 'På den ene siden er hybelen billig.', 'Pe de o parte, garsoniera este ieftină.'],
    ['På den andre siden', 'Pe de altă parte', 'På den andre siden ligger den langt unna.', 'Pe de altă parte, se află departe.'],
    ['Å foretrekke', 'A prefera', 'Jeg foretrekker kort reisevei.', 'Prefer o navetă scurtă.'],
    ['Det viktigste for meg er', 'Cel mai important pentru mine este', 'Det viktigste for meg er å ha tid til familien.', 'Cel mai important pentru mine este să am timp pentru familie.'],
    ['Selv om', 'Chiar dacă', 'Selv om leien er høyere, velger jeg sentrum.', 'Chiar dacă chiria este mai mare, aleg centrul.'],
  ],
  dialogue: [
    ['Elena', 'Vil du velge jobb med kortere reisevei eller høyere lønn?', 'Ai alege o slujbă cu navetă mai scurtă sau salariu mai mare?'],
    ['Jonas', 'På den ene siden trenger jeg bedre lønn.', 'Pe de o parte am nevoie de un salariu mai bun.'],
    ['Elena', 'På den andre siden tar reisen mye tid.', 'Pe de altă parte, drumul durează mult.'],
    ['Jonas', 'Ja. Sammenlignet med den gamle jobben sparer jeg en time hver dag.', 'Da. Comparativ cu vechiul loc de muncă, economisesc o oră în fiecare zi.'],
    ['Elena', 'Hva er viktigst for deg nå?', 'Ce este cel mai important pentru tine acum?'],
    ['Jonas', 'Jeg foretrekker mer fritid, selv om lønnen er litt lavere.', 'Prefer mai mult timp liber, chiar dacă salariul este puțin mai mic.'],
  ],
  grammar: { title: 'Comparativ și concesie', rule: 'Compară cu „-ere enn” sau „mer ... enn”. După subordonata inițială cu „selv om”, propoziția principală începe cu verbul conjugat. Nu adăuga „men” la aceeași legătură.', examples: ['Bussen er billigere enn bilen. — Autobuzul este mai ieftin decât mașina.', 'Selv om det tar tid, velger jeg bussen. — Chiar dacă durează, aleg autobuzul.'], wrong: 'Selv om det tar tid, men jeg velger bussen.' },
  exercises: [choice('Cum exprimi concesia corect?', ['Selv om det er dyrt, velger jeg toget.', 'Selv om det er dyrt, men jeg velger toget.', 'Selv om er det dyrt, jeg velger toget.'], 0, '„Selv om” este urmat de ordinea subordonatei; în principală verbul vine primul.'), fill('Completează: „Bussen er billigere ___ bilen.”', 'enn', 'Comparația de inegalitate folosește „enn”.'), order('Construiește: „Pe de altă parte economisim timp”.', ['På den andre siden', 'sparer', 'vi', 'tid'], 'Expresia inițială ocupă primul loc; verbul conjugat este al doilea.')],
  ...bridge(['En fordel', 'En ulempe'], [['Elena', 'En fordel med jobben er at den ligger nærmere.', 'Un avantaj al slujbei este că se află mai aproape.'], ['Jonas', 'En ulempe er lønnen, men vi må sammenligne hele tilbudet.', 'Un dezavantaj este salariul, dar trebuie să comparăm întreaga ofertă.']]),
  conversationPrompts: [['Hva er viktigst når du velger bolig?', 'Ce este cel mai important când alegi o locuință?'], ['Sammenlign to måter å reise til jobb på.', 'Compară două moduri de a merge la serviciu.'], ['Hva kan du godta selv om det er en ulempe?', 'Ce poți accepta chiar dacă este un dezavantaj?']],
  production: productive('Compară două oferte de muncă în 110–130 de cuvinte folosind timp, cost și program.', 'Explică în 90 de secunde ce variantă alegi și ce dezavantaj accepți.', ['Folosești minimum două criterii de comparație.', 'Incluzi o propoziție corectă cu „selv om”.', 'Concluzia este susținută de exemple concrete.']),
};

const b1Disagreement = {
  uid: 'b1-dezacord-politicos', title: 'Ascultă părerea celuilalt și răspunde', duration: 36,
  objectives: ['să arăți că ai înțeles opinia celuilalt', 'să exprimi un dezacord parțial', 'să propui un compromis simplu'],
  vocabulary: [
    ['Jeg skjønner poenget ditt', 'Îți înțeleg ideea', 'Jeg skjønner poenget ditt om reisetiden.', 'Îți înțeleg ideea despre durata drumului.'],
    ['Jeg er delvis enig', 'Sunt parțial de acord', 'Jeg er delvis enig, men vi trenger flere detaljer.', 'Sunt parțial de acord, dar avem nevoie de mai multe detalii.'],
    ['Samtidig', 'În același timp', 'Samtidig må vi tenke på kostnadene.', 'În același timp trebuie să ne gândim la costuri.'],
    ['Hva om vi', 'Ce-ar fi să', 'Hva om vi prøver ordningen i en måned?', 'Ce-ar fi să încercăm aranjamentul timp de o lună?'],
    ['Et kompromiss', 'Un compromis', 'Et kompromiss kan være to dager på kontoret.', 'Un compromis poate fi două zile la birou.'],
    ['Det kan vi bli enige om', 'Asupra acestui lucru ne putem pune de acord', 'Det kan vi bli enige om etter møtet.', 'Asupra acestui lucru ne putem pune de acord după ședință.'],
  ],
  dialogue: [
    ['Mina', 'Alle bør være på kontoret hver dag.', 'Toți ar trebui să fie la birou în fiecare zi.'],
    ['Jonas', 'Jeg skjønner poenget ditt. Det er lettere å snakke sammen der.', 'Îți înțeleg ideea. Acolo este mai ușor să discutăm.'],
    ['Mina', 'Ja, og nye ansatte trenger hjelp.', 'Da, iar angajații noi au nevoie de ajutor.'],
    ['Jonas', 'Jeg er delvis enig. Samtidig bruker noen to timer på reisen.', 'Sunt parțial de acord. În același timp, unii petrec două ore pe drum.'],
    ['Mina', 'Hva om vi har tre felles kontordager?', 'Ce-ar fi să avem trei zile comune la birou?'],
    ['Jonas', 'Det er et kompromiss vi kan prøve. Det kan vi bli enige om.', 'Este un compromis pe care îl putem încerca. Asupra acestui lucru ne putem pune de acord.'],
  ],
  grammar: { title: 'Acordul parțial și o propunere cu „hva om”', rule: 'Recunoaște argumentul prin „jeg skjønner” sau „delvis enig”, apoi adaugă limita. „Hva om” + subiect + prezent introduce o propunere negociabilă.', examples: ['Jeg er delvis enig, men vi mangler tid. — Sunt parțial de acord, dar ne lipsește timpul.', 'Hva om vi prøver først? — Ce-ar fi să încercăm mai întâi?'], wrong: 'Hva om prøver vi først?' },
  exercises: [choice('Care replică recunoaște opinia și adaugă o limită?', ['Det er bare feil.', 'Jeg skjønner poenget ditt, men kostnaden er høy.', 'Du forstår aldri noe.'], 1, 'Replica arată ascultare și formulează un motiv verificabil.'), fill('Completează: „Hva om ___ prøver i en måned?”', 'vi', 'După „hva om” urmează subiectul, apoi verbul.'), order('Construiește: „În același timp trebuie să ascultăm”.', ['Samtidig', 'må', 'vi', 'lytte'], '„Samtidig” pe prima poziție este urmat de verbul conjugat.')],
  ...bridge(['På den ene siden', 'På den andre siden'], [['Mina', 'På den ene siden fungerer samarbeid best når vi møtes.', 'Pe de o parte, colaborarea funcționează cel mai bine când ne întâlnim.'], ['Jonas', 'På den andre siden trenger vi fleksibilitet. Kan vi finne et kompromiss?', 'Pe de altă parte, avem nevoie de flexibilitate. Putem găsi un compromis?']]),
  conversationPrompts: [['Hva kan du være delvis enig i?', 'Cu ce poți fi parțial de acord?'], ['Hvordan viser du at du har lyttet?', 'Cum arăți că ai ascultat?'], ['Foreslå et kompromiss om arbeidstid.', 'Propune un compromis despre programul de lucru.']],
  production: productive('Scrie un schimb de șase replici: opinie, ascultare, limită, propunere, ajustare, acord.', 'Susține o discuție de două minute despre programul comun și propune o perioadă de probă.', ['Reformulezi corect argumentul partenerului.', 'Dezacordul include un motiv.', 'Compromisul precizează ce se încearcă și cât timp.']),
};

const b1PracticalPlan = {
  uid: 'b1-probleme-plan', title: 'De la reclamație la un plan clar', duration: 36,
  objectives: ['să prioritizezi o problemă practică', 'să stabilești cine face ce și până când', 'să verifici și să confirmi o înțelegere'],
  vocabulary: [
    ['Det haster med', 'Este urgent să rezolvăm', 'Det haster med å reparere døren.', 'Este urgent să reparăm ușa.'],
    ['I mellomtiden', 'Între timp', 'I mellomtiden kan vi bruke den andre inngangen.', 'Între timp putem folosi cealaltă intrare.'],
    ['Å avtale', 'A conveni', 'Vi avtalte at en fagperson skulle komme.', 'Am convenit să vină un specialist.'],
    ['Innen fredag', 'Până vineri inclusiv', 'Vi trenger et svar innen fredag.', 'Avem nevoie de un răspuns până vineri inclusiv.'],
    ['Å følge opp', 'A urmări rezolvarea', 'Jeg følger opp saken på mandag.', 'Urmăresc rezolvarea situației luni.'],
    ['Slik jeg har forstått det', 'Așa cum am înțeles eu', 'Slik jeg har forstått det, ringer du verkstedet.', 'Așa cum am înțeles eu, tu suni la atelier.'],
  ],
  dialogue: [
    ['Elena', 'Det haster med døren som ikke kan låses.', 'Este urgent să rezolvăm ușa care nu poate fi încuiată.'],
    ['Utleier', 'Jeg ringer en fagperson i dag.', 'Sun astăzi un specialist.'],
    ['Elena', 'Hva kan vi gjøre i mellomtiden?', 'Ce putem face între timp?'],
    ['Utleier', 'Dere kan bruke bakinngangen. Jeg sender informasjon innen fredag.', 'Puteți folosi intrarea din spate. Trimit informațiile până vineri.'],
    ['Elena', 'Slik jeg har forstått det, bestiller du reparasjonen og gir oss beskjed.', 'Așa cum am înțeles eu, tu comanzi reparația și ne anunți.'],
    ['Utleier', 'Det stemmer. Jeg følger opp saken til døren virker igjen.', 'Exact. Urmăresc rezolvarea până când ușa funcționează din nou.'],
  ],
  grammar: { title: 'Termenul, perioada și planul', rule: '„Innen” fixează un termen-limită. „Til” arată punctul final al unei perioade. „I mellomtiden” leagă o măsură temporară de soluția finală.', examples: ['Svar innen fredag. — Răspunde până vineri inclusiv.', 'Vi venter til fredag. — Așteptăm până vineri.'], wrong: 'Vi trenger svaret i fredag.' },
  exercises: [choice('Mesajul trebuie trimis cel târziu vineri. Ce alegi?', ['innen fredag', 'i fredag', 'om fredag siden'], 0, '„Innen fredag” exprimă termenul-limită.'), fill('Completează: „Jeg følger ___ saken på mandag.”', 'opp', 'Expresia „følge opp” înseamnă a urmări rezolvarea unei situații.'), order('Construiește: „Între timp folosim cealaltă ușă”.', ['I mellomtiden', 'bruker', 'vi', 'den andre døren'], 'Expresia de timp ocupă poziția întâi, apoi urmează verbul.')],
  ...bridge(['En skade', 'Å melde fra'], [['Elena', 'En skade på døren må prioriteres. Hvem kan reparere den?', 'O daună la ușă trebuie prioritizată. Cine o poate repara?'], ['Utleier', 'Det var viktig å melde fra raskt. Nå lager vi en plan.', 'A fost important să anunți repede. Acum facem un plan.']]),
  conversationPrompts: [['Hvilken del av problemet haster mest?', 'Care parte a problemei este cea mai urgentă?'], ['Hva gjør dere i mellomtiden?', 'Ce faceți între timp?'], ['Hvem skal følge opp, og når?', 'Cine urmărește rezolvarea și când?']],
  production: productive('Scrie un mesaj de 100–120 de cuvinte care confirmă problema, măsura temporară, responsabilul și termenul.', 'Negociază o soluție în șase replici și verifică oral înțelegerea.', ['Planul conține responsabil și termen.', 'Distingi soluția temporară de cea finală.', 'Folosești o formulă de verificare a înțelegerii.']),
};

const b1Learning = {
  uid: 'b1-competente-dezvoltare', title: 'Explică ce știi și ce vrei să înveți', duration: 36,
  objectives: ['să descrii o competență printr-un exemplu', 'să formulezi un obiectiv profesional realist', 'să ceri sprijin și feedback pentru progres'],
  vocabulary: [
    ['Å mestre', 'A stăpâni / a face față', 'Jeg mestrer de vanligste oppgavene.', 'Mă descurc la sarcinile cele mai obișnuite.'],
    ['En ferdighet', 'O abilitate', 'Å forklare tydelig er en viktig ferdighet.', 'A explica limpede este o abilitate importantă.'],
    ['Å øve på', 'A exersa', 'Jeg øver på å skrive korte rapporter.', 'Exersez redactarea unor rapoarte scurte.'],
    ['Å utvikle seg', 'A se dezvolta', 'Jeg ønsker å utvikle meg faglig.', 'Doresc să mă dezvolt profesional.'],
    ['Et delmål', 'Un obiectiv intermediar', 'Et delmål er å holde en kort presentasjon.', 'Un obiectiv intermediar este să țin o prezentare scurtă.'],
    ['Å be om veiledning', 'A cere îndrumare', 'Jeg vil be om veiledning før jeg begynner.', 'Voi cere îndrumare înainte să încep.'],
  ],
  dialogue: [
    ['Leder', 'Hvilke arbeidsoppgaver mestrer du nå?', 'La ce sarcini de lucru te descurci acum?'],
    ['Elena', 'Jeg mestrer kundekontakten og kan forklare rutinene til nye kolleger.', 'Mă descurc la contactul cu clienții și pot explica procedurile colegilor noi.'],
    ['Leder', 'Hva vil du øve mer på?', 'Ce vrei să exersezi mai mult?'],
    ['Elena', 'Jeg vil utvikle meg ved å skrive tydeligere rapporter.', 'Vreau să mă dezvolt scriind rapoarte mai clare.'],
    ['Leder', 'Kan vi sette et delmål for neste måned?', 'Putem stabili un obiectiv intermediar pentru luna viitoare?'],
    ['Elena', 'Ja. Jeg skriver to rapporter og ber om veiledning etter den første.', 'Da. Scriu două rapoarte și cer îndrumare după primul.'],
  ],
  grammar: { title: 'Scop și metodă: „for å” și „ved å”', rule: '„For å” exprimă scopul; „ved å” arată metoda. Ambele sunt urmate de infinitiv. Folosește „for at” dacă propoziția de scop are alt subiect.', examples: ['Jeg øver for å bli tryggere. — Exersez ca să capăt încredere.', 'Jeg lærer ved å be om tilbakemelding. — Învăț cerând feedback.'], wrong: 'Jeg øver for å jeg blir tryggere.' },
  exercises: [choice('Ce variantă arată metoda de învățare?', ['Jeg lærer ved å øve hver dag.', 'Jeg lærer siden i morgen.', 'Jeg lærer enn å øve.'], 0, '„Ved å” explică modul în care înveți.'), fill('Completează: „Jeg tar et kurs for ___ utvikle meg.”', 'å', 'Scopul cu același subiect se poate exprima prin „for å” + infinitiv.'), order('Construiește: „Învăț cerând îndrumare”.', ['Jeg', 'lærer', 'ved å', 'be om', 'veiledning'], 'Metoda este exprimată prin „ved å” + infinitiv.')],
  ...bridge(['Arbeidserfaring', 'En søknad'], [['Leder', 'Arbeidserfaring gir et godt grunnlag. Hva vil du lære videre?', 'Experiența profesională oferă o bază bună. Ce vrei să înveți în continuare?'], ['Elena', 'En søknad viser hva jeg kan. Nå trenger jeg en plan for det jeg vil utvikle.', 'O candidatură arată ce știu. Acum am nevoie de un plan pentru ce vreau să dezvolt.']]),
  conversationPrompts: [['Hva mestrer du, og hvilket eksempel viser det?', 'Ce stăpânești și ce exemplu dovedește asta?'], ['Hvilket delmål kan du nå på en måned?', 'Ce obiectiv intermediar poți atinge într-o lună?'], ['Hvordan vil du be om tilbakemelding?', 'Cum vei cere feedback?']],
  production: productive('Scrie un plan de dezvoltare de 110–130 de cuvinte cu o competență actuală, un obiectiv și două acțiuni.', 'Simulează o discuție de două minute despre dezvoltare profesională.', ['Dovedești o competență printr-un exemplu.', 'Obiectivul are termen și rezultat observabil.', 'Folosești „for å” pentru scop și „ved å” pentru metodă.']),
};

const b1CommunityProject = {
  uid: 'b1-proiect-comunitate', title: 'Organizează împreună o activitate', duration: 38,
  objectives: ['să transformi o idee într-un plan de grup', 'să distribui responsabilități și resurse', 'să anunți publicul și să anticipezi o dificultate'],
  vocabulary: [
    ['Et arrangement', 'Un eveniment', 'Vi planlegger et arrangement for naboene.', 'Planificăm un eveniment pentru vecini.'],
    ['En påmelding', 'O înscriere', 'Påmeldingen stenger på tirsdag.', 'Înscrierea se închide marți.'],
    ['Å bidra med', 'A contribui cu', 'Alle kan bidra med noe lite.', 'Toți pot contribui cu ceva mic.'],
    ['Å ta ansvar for', 'A prelua responsabilitatea pentru', 'Jeg tar ansvar for invitasjonen.', 'Preiau responsabilitatea pentru invitație.'],
    ['Hvis det blir', 'Dacă va fi / dacă devine', 'Hvis det blir regn, møtes vi inne.', 'Dacă va ploua, ne întâlnim înăuntru.'],
    ['Vi har blitt enige om', 'Am convenit', 'Vi har blitt enige om å holde møtet kort.', 'Am convenit să ținem ședința scurtă.'],
  ],
  dialogue: [
    ['Elena', 'Hva skal målet med språkkafeen være?', 'Care să fie obiectivul cafenelei de conversație?'],
    ['Jonas', 'At naboer blir kjent og øver på norsk i trygge omgivelser.', 'Ca vecinii să se cunoască și să exerseze norvegiana într-un mediu sigur.'],
    ['Mina', 'Jeg kan bidra med kaffe og ta imot påmeldinger.', 'Pot contribui cu cafea și pot primi înscrierile.'],
    ['Elena', 'Da tar jeg ansvar for invitasjonen og bestiller rommet.', 'Atunci preiau invitația și rezerv sala.'],
    ['Jonas', 'Hvis det blir mange deltakere, deler vi dem i små grupper.', 'Dacă vor fi mulți participanți, îi împărțim în grupuri mici.'],
    ['Mina', 'Fint. Vi har blitt enige om sted, ansvar og påmeldingsfrist.', 'Bine. Am convenit locul, responsabilitățile și termenul de înscriere.'],
  ],
  grammar: { title: 'Condiția reală și planul alternativ', rule: '„Hvis” introduce o condiție posibilă, de obicei cu prezent chiar dacă se referă la viitor. Când condiția este prima, propoziția principală începe cu verbul.', examples: ['Hvis det regner, møtes vi inne. — Dacă plouă, ne întâlnim înăuntru.', 'Vi bestiller flere stoler hvis mange melder seg på. — Comandăm mai multe scaune dacă se înscriu mulți.'], wrong: 'Hvis det regner, vi møtes inne.' },
  exercises: [choice('Care plan alternativ este formulat corect?', ['Hvis rommet er fullt, deler vi gruppen.', 'Hvis rommet er fullt, vi deler gruppen.', 'Hvis er rommet fullt, vi gruppen deler.'], 0, 'După condiția inițială, verbul principal „deler” precedă subiectul.'), fill('Completează: „Jeg tar ansvar ___ invitasjonen.”', 'for', 'Expresia este „ta ansvar for”.'), order('Construiește: „Dacă plouă, ne întâlnim înăuntru”.', ['Hvis', 'det regner', 'møtes', 'vi', 'inne'], 'Condiția ocupă prima poziție, iar verbul principal urmează imediat după ea.')],
  ...bridge(['Et mål', 'Et eksempel'], [['Elena', 'Et mål med presentasjonen var å skape mer kontakt mellom naboer.', 'Un obiectiv al prezentării a fost să creeze mai mult contact între vecini.'], ['Jonas', 'Et eksempel kan være en språkkafe. La oss planlegge den.', 'Un exemplu poate fi o cafenea de conversație. Hai să o planificăm.']]),
  conversationPrompts: [['Hvem vil dere invitere, og hvorfor?', 'Pe cine vreți să invitați și de ce?'], ['Hva kan hver person bidra med?', 'Cu ce poate contribui fiecare?'], ['Hva gjør dere hvis planen må endres?', 'Ce faceți dacă planul trebuie schimbat?']],
  production: productive('Scrie o invitație și un plan intern, în total 120–150 de cuvinte, pentru o activitate locală.', 'Prezintă planul în două minute și răspunde unei propuneri de schimbare.', ['Invitația precizează cine, unde, când și cum se înscrie.', 'Planul distribuie minimum trei sarcini.', 'Include o condiție și o soluție alternativă.']),
};

const b1Evaluation = {
  uid: 'b1-evaluare-plan-urmator', title: 'Evaluează rezultatul și pregătește pasul următor', duration: 38,
  objectives: ['să compari rezultatul cu obiectivul inițial', 'să oferi feedback concret și respectuos', 'să stabilești o schimbare pentru data viitoare'],
  vocabulary: [
    ['Et resultat', 'Un rezultat', 'Resultatet var bedre enn vi forventet.', 'Rezultatul a fost mai bun decât ne așteptam.'],
    ['Det fungerte godt at', 'A funcționat bine faptul că', 'Det fungerte godt at gruppene var små.', 'A funcționat bine faptul că grupurile erau mici.'],
    ['Neste gang bør vi', 'Data viitoare ar trebui să', 'Neste gang bør vi starte tidligere.', 'Data viitoare ar trebui să începem mai devreme.'],
    ['Å forbedre', 'A îmbunătăți', 'Vi kan forbedre informasjonen om påmelding.', 'Putem îmbunătăți informațiile despre înscriere.'],
    ['På bakgrunn av', 'Pe baza', 'På bakgrunn av svarene endrer vi planen.', 'Pe baza răspunsurilor schimbăm planul.'],
    ['Å nå et mål', 'A atinge un obiectiv', 'Vi nådde et mål da alle deltok i samtalen.', 'Am atins un obiectiv când toți au participat la conversație.'],
  ],
  dialogue: [
    ['Mina', 'Nådde vi målet med språkkafeen?', 'Am atins obiectivul cafenelei de conversație?'],
    ['Elena', 'Ja, alle snakket med noen de ikke kjente fra før.', 'Da, toți au vorbit cu cineva pe care nu îl cunoșteau.'],
    ['Jonas', 'Det fungerte godt at vi brukte små grupper.', 'A funcționat bine faptul că am folosit grupuri mici.'],
    ['Mina', 'Hva kan vi forbedre?', 'Ce putem îmbunătăți?'],
    ['Elena', 'Neste gang bør vi forklare påmeldingen tydeligere.', 'Data viitoare ar trebui să explicăm înscrierea mai clar.'],
    ['Jonas', 'På bakgrunn av svarene lager vi en kortere invitasjon og starter litt tidligere.', 'Pe baza răspunsurilor facem o invitație mai scurtă și începem puțin mai devreme.'],
  ],
  grammar: { title: 'Feedback despre trecut, recomandare pentru viitor', rule: 'Folosește trecutul pentru ce s-a întâmplat, „fungerte at” pentru o observație și „bør” + infinitiv fără „å” pentru recomandare. Susține recomandarea printr-un rezultat observat.', examples: ['Små grupper fungerte godt. — Grupurile mici au funcționat bine.', 'Neste gang bør vi forklare oppgaven først. — Data viitoare ar trebui să explicăm sarcina mai întâi.'], wrong: 'Neste gang bør vi å forklare oppgaven.' },
  exercises: [choice('Care feedback este concret și folositor?', ['Alt var dårlig.', 'De små gruppene fungerte godt fordi alle fikk snakke.', 'Det var bare sånn.'], 1, 'Feedbackul numește o acțiune și efectul observat.'), fill('Completează: „Neste gang ___ vi starte tidligere.”', 'bør', '„Bør” exprimă o recomandare pentru data viitoare.'), order('Construiește: „Pe baza răspunsurilor schimbăm planul”.', ['På bakgrunn av svarene', 'endrer', 'vi', 'planen'], 'Expresia inițială este urmată de verbul conjugat „endrer”.')],
  ...bridge(['Et arrangement', 'En påmelding'], [['Mina', 'Et arrangement er ferdig, men arbeidet slutter ikke der.', 'Un eveniment s-a terminat, dar munca nu se oprește aici.'], ['Elena', 'En påmelding var litt vanskelig å forstå. Det må vi evaluere.', 'O înscriere a fost puțin greu de înțeles. Trebuie să evaluăm asta.']]),
  conversationPrompts: [['Hvilket resultat viser at målet ble nådd?', 'Ce rezultat arată că obiectivul a fost atins?'], ['Hva vil du beholde fra dette prosjektet?', 'Ce vrei să păstrezi din acest proiect?'], ['Hvilken endring vil du foreslå neste gang?', 'Ce schimbare vei propune data viitoare?']],
  production: productive('Scrie o evaluare de 130–150 de cuvinte: obiectiv, două rezultate, o limită și o recomandare justificată.', 'Prezintă rezultatul în două minute și răspunde la două întrebări neprevăzute.', ['Afirmațiile sunt susținute de exemple observabile.', 'Legi recomandarea de un rezultat.', 'Reutilizezi limbajul de opinie, planificare și clarificare din nivel.']),
};

const b2Claims = {
  uid: 'b2-argument-dovada', title: 'Separă afirmația, dovada și presupunerea', duration: 40,
  objectives: ['să explici pe ce se bazează un argument', 'să delimitezi o presupunere de un fapt', 'să ajustezi gradul de certitudine al unei afirmații'],
  vocabulary: [
    ['En påstand', 'O afirmație', 'En påstand må støttes av relevante opplysninger.', 'O afirmație trebuie susținută de informații relevante.'],
    ['Et belegg', 'O dovadă / un suport pentru afirmație', 'Har vi belegg for at tiltaket sparer tid?', 'Avem dovezi că măsura economisește timp?'],
    ['En antakelse', 'O presupunere', 'Dette er en antakelse, ikke et sikkert resultat.', 'Aceasta este o presupunere, nu un rezultat sigur.'],
    ['Det tyder på at', 'Acest lucru indică faptul că', 'Det tyder på at flere ønsker fleksibilitet.', 'Acest lucru indică faptul că mai mulți doresc flexibilitate.'],
    ['I hvilken grad', 'În ce măsură', 'I hvilken grad gjelder funnet for alle ansatte?', 'În ce măsură este valabil rezultatul pentru toți angajații?'],
    ['Det er usikkert om', 'Este incert dacă', 'Det er usikkert om ordningen virker like godt overalt.', 'Este incert dacă aranjamentul funcționează la fel de bine peste tot.'],
  ],
  dialogue: [
    ['Mina', 'Du hevder at hjemmekontor alltid gir bedre resultater. Hva bygger du det på?', 'Susții că munca de acasă aduce întotdeauna rezultate mai bune. Pe ce te bazezi?'],
    ['Jonas', 'En spørreundersøkelse viser at mange opplever færre avbrytelser.', 'Un sondaj arată că mulți simt că sunt întrerupți mai rar.'],
    ['Mina', 'Det er et relevant belegg, men gjelder det alle typer arbeid?', 'Este o dovadă relevantă, dar se aplică tuturor tipurilor de muncă?'],
    ['Jonas', 'Nei. At det gjelder alle, var en antakelse fra min side.', 'Nu. Faptul că s-ar aplica tuturor era o presupunere din partea mea.'],
    ['Mina', 'Hvordan kan du formulere påstanden mer presist?', 'Cum poți formula afirmația mai precis?'],
    ['Jonas', 'Det tyder på at enkelte oppgaver løses mer effektivt hjemme. Effekten på samarbeid er usikker.', 'Acest lucru indică faptul că anumite sarcini sunt rezolvate mai eficient acasă. Efectul asupra colaborării este incert.'],
  ],
  grammar: { title: 'Certitudine proporțională cu dovada', rule: '„Viser at” introduce un rezultat susținut direct; „tyder på at” indică o interpretare mai prudentă. „Det er usikkert om” delimitează ceea ce nu știm. Subordonata păstrează subiectul înaintea verbului.', examples: ['Svarene tyder på at ordningen kan hjelpe. — Răspunsurile indică faptul că aranjamentul poate ajuta.', 'Det er usikkert om resultatet gjelder alle. — Este incert dacă rezultatul se aplică tuturor.'], wrong: 'Det er usikkert om gjelder resultatet alle.' },
  exercises: [choice('Ai un sondaj mic despre percepții. Ce concluzie este proporțională?', ['Det beviser at alle blir mer effektive.', 'Svarene tyder på at noen opplever færre avbrytelser.', 'Ingen kan vite noe som helst.'], 1, 'Concluzia păstrează limita eșantionului și caracterul subiectiv al răspunsurilor.'), fill('Completează: „Det er usikkert ___ funnet gjelder alle.”', 'om', '„Om” introduce întrebarea indirectă referitoare la incertitudine.'), order('Construiește: „Acest lucru indică faptul că măsura poate ajuta”.', ['Det', 'tyder på', 'at', 'tiltaket', 'kan hjelpe'], 'După „at”, subiectul „tiltaket” precedă verbul modal.')],
  ...bridge(['Å påstå', 'Nyansert'], [['Mina', 'Å påstå at én løsning passer alle krever gode belegg.', 'A susține că o soluție se potrivește tuturor necesită dovezi bune.'], ['Jonas', 'Et nyansert argument må også vise hva vi ennå ikke vet.', 'Un argument nuanțat trebuie să arate și ce nu știm încă.']]),
  conversationPrompts: [['Hva er påstanden, og hva er belegget?', 'Care este afirmația și care este dovada?'], ['Hvilken antakelse ligger bak forslaget?', 'Ce presupunere se află în spatele propunerii?'], ['Hvordan kan du gjøre konklusjonen mindre kategorisk?', 'Cum poți face concluzia mai puțin categorică?']],
  production: productive('Scrie un paragraf de 140–170 de cuvinte despre o organizare a muncii: afirmație, dovadă, limită și concluzie prudentă.', 'Prezintă un argument în două minute și precizează o presupunere care trebuie verificată.', ['Dovada susține direct afirmația.', 'Delimitezi ce este observat de ce este presupus.', 'Gradul de certitudine corespunde informației disponibile.']),
};

const b2Counterargument = {
  uid: 'b2-obiectii-raspuns', title: 'Construiește și răspunde unui contraargument', duration: 41,
  objectives: ['să formulezi corect obiecția unui interlocutor', 'să răspunzi fără să simplifici poziția opusă', 'să modifici propunerea în urma unei obiecții valide'],
  vocabulary: [
    ['En innvending', 'O obiecție', 'En viktig innvending gjelder opplæringen.', 'O obiecție importantă privește instruirea.'],
    ['Riktignok', 'Este adevărat că', 'Riktignok sparer vi tid, men opplæringen kan lide.', 'Este adevărat că economisim timp, dar instruirea poate avea de suferit.'],
    ['Det følger ikke at', 'Nu rezultă că', 'Det følger ikke at alle møter bør fjernes.', 'Nu rezultă că toate ședințele ar trebui eliminate.'],
    ['Med mindre', 'Cu excepția cazului în care / dacă nu', 'Ordningen fortsetter med mindre evalueringen viser store problemer.', 'Aranjamentul continuă dacă evaluarea nu arată probleme majore.'],
    ['Å imøtegå', 'A răspunde critic unui argument', 'Vi må imøtegå innvendingen med et konkret forslag.', 'Trebuie să răspundem obiecției printr-o propunere concretă.'],
    ['På dette grunnlaget', 'Pe această bază', 'På dette grunnlaget justerer vi anbefalingen.', 'Pe această bază ajustăm recomandarea.'],
  ],
  dialogue: [
    ['Mina', 'Min innvending er at nyansatte kan bli sittende alene hjemme.', 'Obiecția mea este că angajații noi pot rămâne singuri acasă.'],
    ['Jonas', 'Riktignok er det en risiko. Likevel kan vi organisere faste veiledningsdager.', 'Este adevărat că există un risc. Totuși putem organiza zile fixe de îndrumare.'],
    ['Mina', 'Vil ikke det gjøre ordningen dyrere?', 'Nu va face asta aranjamentul mai scump?'],
    ['Jonas', 'Kanskje litt, men det følger ikke at ordningen samlet sett blir dårligere.', 'Poate puțin, dar nu rezultă că aranjamentul devine mai slab în ansamblu.'],
    ['Mina', 'Hva gjør vi hvis opplæringen fortsatt ikke fungerer?', 'Ce facem dacă instruirea tot nu funcționează?'],
    ['Jonas', 'Vi fortsetter med mindre evalueringen viser klare problemer. Da endrer vi opplegget.', 'Continuăm dacă evaluarea nu arată probleme clare. Dacă arată, schimbăm organizarea.'],
  ],
  grammar: { title: 'Concesie și excepție', rule: '„Riktignok” recunoaște o limită și este urmat de inversiune în principală. „Med mindre” introduce excepția și are ordinea subordonatei; negația „ikke” vine înaintea verbului conjugat.', examples: ['Riktignok er planen dyr, men den er nødvendig. — Este adevărat că planul este scump, dar este necesar.', 'Vi fortsetter med mindre kvaliteten ikke er god nok. — Continuăm, cu excepția cazului în care calitatea nu este suficient de bună.'], wrong: 'Riktignok planen er dyr.' },
  exercises: [choice('Cum răspunzi util unei obiecții despre instruire?', ['Du liker bare ikke endringer.', 'Risikoen er reell. Derfor foreslår jeg faste veiledningsdager.', 'Det er ingenting å diskutere.'], 1, 'Recunoști riscul și oferi o modificare care răspunde exact obiecției.'), fill('Completează: „Riktignok ___ planen dyr, men den kan prøves.”', 'er', 'După conectorul inițial urmează verbul conjugat.'), order('Construiește condiția de continuare.', ['Vi', 'fortsetter', 'med mindre', 'resultatene', 'blir', 'dårligere'], '„Med mindre” introduce excepția de la regula de continuare.')],
  ...bridge(['En påstand', 'Et belegg'], [['Mina', 'En påstand blir sterkere når du undersøker den beste innvendingen.', 'O afirmație devine mai solidă când examinezi cea mai bună obiecție.'], ['Jonas', 'Et belegg for effektivitet sier ikke nødvendigvis noe om opplæring.', 'O dovadă privind eficiența nu spune neapărat ceva despre instruire.']]),
  conversationPrompts: [['Hva er den sterkeste innvendingen mot ditt forslag?', 'Care este cea mai puternică obiecție față de propunerea ta?'], ['Hva kan du innrømme uten å oppgi hovedpoenget?', 'Ce poți admite fără să renunți la ideea principală?'], ['Når bør forslaget endres eller stoppes?', 'Când ar trebui modificată sau oprită propunerea?']],
  production: productive('Scrie 170–200 de cuvinte: propunere, obiecție formulată corect, răspuns și modificare concretă.', 'Susține un schimb de trei minute cu o obiecție neprevăzută și răspunde cu o ajustare.', ['Nu atribui adversarului o poziție mai slabă decât cea exprimată.', 'Răspunsul abordează riscul concret.', 'Concluzia precizează în ce condiții rămâne valabilă.']),
};

const b2Negotiation = {
  uid: 'b2-negociere-conditii', title: 'Negociază condiții și un acord verificabil', duration: 42,
  objectives: ['să deosebești nevoia de soluția cerută', 'să formulezi concesii condiționate', 'să închizi negocierea cu responsabilități precise'],
  vocabulary: [
    ['Et behov', 'O nevoie', 'Behovet vårt er forutsigbar levering.', 'Nevoia noastră este o livrare previzibilă.'],
    ['Et handlingsrom', 'O marjă de acțiune', 'Vi har lite handlingsrom i budsjettet.', 'Avem puțină marjă de acțiune în buget.'],
    ['Forutsatt at', 'Cu condiția ca', 'Vi kan flytte møtet, forutsatt at alle får beskjed.', 'Putem muta ședința cu condiția ca toți să fie anunțați.'],
    ['Til gjengjeld', 'În schimb', 'Til gjengjeld ønsker vi en fast kontaktperson.', 'În schimb dorim o persoană de contact stabilă.'],
    ['Å komme fram til', 'A ajunge la', 'Partene kom fram til en felles løsning.', 'Părțile au ajuns la o soluție comună.'],
    ['En forpliktelse', 'Un angajament', 'Avtalen må inneholde en tydelig forpliktelse.', 'Acordul trebuie să conțină un angajament clar.'],
  ],
  dialogue: [
    ['Elena', 'Vi trenger leveringen tidligere fordi kurset begynner mandag.', 'Avem nevoie de livrare mai devreme deoarece cursul începe luni.'],
    ['Leverandør', 'Vi har lite handlingsrom denne uken, men kan sende halvparten først.', 'Avem puțină marjă săptămâna aceasta, dar putem trimite întâi jumătate.'],
    ['Elena', 'Det kan fungere, forutsatt at resten kommer før neste kursdag.', 'Poate funcționa cu condiția ca restul să sosească înainte de următoarea zi de curs.'],
    ['Leverandør', 'Det kan vi love. Til gjengjeld trenger vi en endelig bestilling i dag.', 'Putem promite asta. În schimb avem nevoie de comanda finală astăzi.'],
    ['Elena', 'Da bekrefter jeg antallet innen klokken to. Kan du sende planen skriftlig?', 'Atunci confirm numărul până la ora două. Poți trimite planul în scris?'],
    ['Leverandør', 'Ja. Vi har kommet fram til to leveranser, med dato og kontaktperson for hver.', 'Da. Am ajuns la două livrări, cu dată și persoană de contact pentru fiecare.'],
  ],
  grammar: { title: 'Concesia condiționată', rule: '„Forutsatt at” introduce condiția unei concesii și cere ordinea subordonatei. „Til gjengjeld” introduce cealaltă parte a schimbului și este urmat de inversiune dacă începe principala.', examples: ['Vi godtar endringen forutsatt at kvaliteten ikke blir dårligere. — Acceptăm schimbarea cu condiția să nu scadă calitatea.', 'Til gjengjeld sender dere planen i dag. — În schimb trimiteți planul astăzi.'], wrong: 'Forutsatt at blir kvaliteten ikke dårligere.' },
  exercises: [choice('Care ofertă are o condiție verificabilă?', ['Vi kan kanskje ordne noe senere.', 'Vi kan dele leveringen, forutsatt at resten kommer onsdag.', 'Dere må bare prøve hardere.'], 1, 'Condiția precizează ce trebuie livrat și când.'), fill('Completează: „Til gjengjeld ___ vi en skriftlig bekreftelse.”', 'ønsker', 'După „til gjengjeld” inițial urmează verbul conjugat.'), order('Construiește o concesie condiționată.', ['Vi', 'godtar', 'forslaget', 'forutsatt at', 'fristen', 'holdes'], '„Forutsatt at” leagă acceptarea de respectarea termenului.')],
  ...bridge(['Et kompromiss', 'Å avklare'], [['Elena', 'Et kompromiss kan fungere hvis deltakerne får det viktigste materialet først.', 'Un compromis poate funcționa dacă participanții primesc mai întâi materialul esențial.'], ['Leverandør', 'Da begynner vi med å avklare hva dere trenger til den første dagen.', 'Atunci începem prin a clarifica de ce aveți nevoie pentru prima zi.']]),
  conversationPrompts: [['Hva er behovet bak kravet ditt?', 'Care este nevoia din spatele cerinței tale?'], ['Hva kan du tilby til gjengjeld?', 'Ce poți oferi în schimb?'], ['Hvilke forpliktelser må avtalen inneholde?', 'Ce angajamente trebuie să conțină acordul?']],
  production: productive('Redactează o confirmare de acord de 160–190 de cuvinte cu două concesii, două termene și doi responsabili.', 'Negociază trei minute o livrare sau un program; verifică verbal acordul final.', ['Explici nevoia înainte să impui soluția.', 'Concesiile au condiții concrete.', 'Încheierea precizează cine, ce și până când.']),
};

const b2Mediation = {
  uid: 'b2-mediere-rezumat', title: 'Mediază două poziții și rezumă acordul', duration: 42,
  objectives: ['să reformulezi neutru nevoile a două părți', 'să identifici punctele comune și diferențele rămase', 'să redactezi un rezumat fidel al unui acord'],
  vocabulary: [
    ['Slik jeg oppfatter det', 'Așa cum percep eu situația', 'Slik jeg oppfatter det, ønsker begge mer forutsigbarhet.', 'Așa cum percep eu situația, ambele părți doresc mai multă previzibilitate.'],
    ['Et felles utgangspunkt', 'Un punct de plecare comun', 'Trygg opplæring er et felles utgangspunkt.', 'O instruire sigură este un punct de plecare comun.'],
    ['Å skille mellom', 'A distinge între', 'Vi må skille mellom behov og konkrete løsninger.', 'Trebuie să distingem între nevoi și soluții concrete.'],
    ['Et uavklart punkt', 'Un punct neclarificat', 'Et uavklart punkt er hvem som dekker ekstrakostnaden.', 'Un punct neclarificat este cine acoperă costul suplimentar.'],
    ['Å gjengi', 'A reda', 'Referatet skal gjengi det partene faktisk sa.', 'Procesul-verbal trebuie să redea ce au spus efectiv părțile.'],
    ['Er dette en dekkende oppsummering?', 'Este acesta un rezumat fidel?', 'Er dette en dekkende oppsummering av avtalen?', 'Este acesta un rezumat fidel al acordului?'],
  ],
  dialogue: [
    ['Mekler', 'Slik jeg oppfatter det, ønsker dere begge bedre opplæring.', 'Așa cum percep eu situația, ambele părți doriți o instruire mai bună.'],
    ['Elena', 'Ja, men jeg trenger faste tider for å kunne planlegge arbeidet.', 'Da, dar am nevoie de ore fixe ca să-mi pot planifica munca.'],
    ['Jonas', 'Jeg trenger fleksibilitet når det kommer hasteoppgaver.', 'Eu am nevoie de flexibilitate când apar sarcini urgente.'],
    ['Mekler', 'Et felles utgangspunkt er en fast veiledningstid som bare flyttes ved hasteoppgaver.', 'Un punct de plecare comun este un interval fix de îndrumare care se mută doar pentru sarcini urgente.'],
    ['Elena', 'Det fungerer hvis en ny tid avtales med en gang.', 'Funcționează dacă se stabilește imediat un nou interval.'],
    ['Mekler', 'Da gjenstår ett uavklart punkt: hvem bestiller rommet? Er dette en dekkende oppsummering?', 'Atunci rămâne un punct neclarificat: cine rezervă sala? Este acesta un rezumat fidel?'],
  ],
  grammar: { title: 'Reformulare și verificare neutră', rule: '„Slik jeg oppfatter det” marchează o interpretare deschisă corectării. Redă pozițiile prin „X ønsker at ...” și întrebări de verificare; păstrează „ikke” înaintea verbului în subordonată.', examples: ['Elena ønsker at tiden ikke endres uten varsel. — Elena dorește ca ora să nu fie schimbată fără anunț.', 'Har jeg forstått dere riktig? — V-am înțeles corect?'], wrong: 'Elena ønsker at tiden endres ikke uten varsel.' },
  exercises: [choice('Care rezumat este neutru?', ['Elena er vanskelig og Jonas har rett.', 'Elena trenger faste tider, mens Jonas trenger rom for hasteoppgaver.', 'Begge vil nøyaktig det samme.'], 1, 'Rezumatul redă nevoile ambelor părți fără evaluări sau acord inventat.'), fill('Completează: „Vi må skille ___ behov og løsninger.”', 'mellom', '„Skille mellom” introduce cele două categorii comparate.'), order('Construiește verificarea finală.', ['Er', 'dette', 'en dekkende', 'oppsummering'], 'Întrebarea da/nu începe cu verbul conjugat.')],
  ...bridge(['Et behov', 'En forpliktelse'], [['Mekler', 'Et behov er ikke alltid det samme som den første løsningen som foreslås.', 'O nevoie nu este întotdeauna același lucru cu prima soluție propusă.'], ['Elena', 'En forpliktelse må beskrives så tydelig at begge forstår den likt.', 'Un angajament trebuie descris atât de clar încât ambele părți să îl înțeleagă la fel.']]),
  conversationPrompts: [['Hvordan ville du gjengi den andre partens behov?', 'Cum ai reda nevoile celeilalte părți?'], ['Hva er partene allerede enige om?', 'Asupra a ce sunt deja de acord părțile?'], ['Hvilket punkt står fortsatt åpent?', 'Ce punct rămâne încă deschis?']],
  production: productive('Scrie un rezumat neutru de 170–200 de cuvinte cu pozițiile, punctul comun, acordul și chestiunea rămasă deschisă.', 'Mediază o discuție de trei minute și cere confirmarea ambelor părți.', ['Păstrezi diferențele reale dintre poziții.', 'Nu prezinți o propunere ca acord deja obținut.', 'Închei cu o verificare și un pas următor.']),
};

const b2Data = {
  uid: 'b2-date-interpretare', title: 'Descrie date fără să exagerezi concluzia', duration: 42,
  objectives: ['să descrii o tendință și o diferență numerică', 'să distingi proporția de numărul absolut', 'să semnalezi limitele unei comparații'],
  vocabulary: [
    ['En andel', 'O proporție', 'Andelen som sykler, økte fra tjue til tretti prosent.', 'Proporția celor care merg cu bicicleta a crescut de la douăzeci la treizeci la sută.'],
    ['Et prosentpoeng', 'Un punct procentual', 'Forskjellen er ti prosentpoeng.', 'Diferența este de zece puncte procentuale.'],
    ['Et utvalg', 'Un eșantion', 'Utvalget består av hundre frivillige deltakere.', 'Eșantionul este format din o sută de participanți voluntari.'],
    ['En tendens', 'O tendință', 'Tallene viser en tendens, ikke en sikker årsak.', 'Cifrele arată o tendință, nu o cauză sigură.'],
    ['Å henge sammen med', 'A avea legătură cu', 'Økningen kan henge sammen med det nye tilbudet.', 'Creșterea poate avea legătură cu noua ofertă.'],
    ['Det kan ikke utelukkes at', 'Nu poate fi exclus faptul că', 'Det kan ikke utelukkes at været påvirket svarene.', 'Nu poate fi exclus faptul că vremea a influențat răspunsurile.'],
  ],
  dialogue: [
    ['Elena', 'Andelen som syklet til jobb, økte fra tjue til tretti prosent.', 'Proporția celor care mergeau cu bicicleta la serviciu a crescut de la douăzeci la treizeci la sută.'],
    ['Jonas', 'Da økte den med ti prosent?', 'Atunci a crescut cu zece procente?'],
    ['Elena', 'Med ti prosentpoeng. Relativt til tjue er økningen femti prosent.', 'Cu zece puncte procentuale. Raportată la douăzeci, creșterea este de cincizeci la sută.'],
    ['Jonas', 'Beviser det at den nye sykkelveien virker?', 'Dovedește asta că noua pistă de biciclete funcționează?'],
    ['Elena', 'Nei. Utvalget er lite, og været var bedre i den andre perioden.', 'Nu. Eșantionul este mic, iar vremea a fost mai bună în a doua perioadă.'],
    ['Jonas', 'Da beskriver vi tendensen og nevner mulige forklaringer uten å fastslå en årsak.', 'Atunci descriem tendința și menționăm explicații posibile fără să stabilim o cauză.'],
  ],
  grammar: { title: 'Schimbarea: de la, până la, cu', rule: '„Fra ... til ...” arată valorile inițială și finală. „Med” arată diferența. „Kan ha” + participiu exprimă o posibilă explicație despre trecut fără să o prezinte ca certitudine.', examples: ['Andelen steg fra 20 til 30 prosent, altså med 10 prosentpoeng. — Proporția a crescut de la 20 la 30%, deci cu 10 puncte procentuale.', 'Været kan ha påvirket resultatet. — Vremea poate să fi influențat rezultatul.'], wrong: 'Andelen steg fra 20 til 30 prosent, altså med 10 prosent.' },
  exercises: [choice('O proporție crește de la 20% la 30%. Diferența este:', ['10 prosentpoeng', '10 prosent relativ økning', '30 prosentpoeng'], 0, '30 minus 20 înseamnă 10 puncte procentuale; creșterea relativă este 50%.'), fill('Completează: „Været kan ___ påvirket resultatet.”', 'ha', '„Kan ha” + participiu exprimă o posibilitate despre trecut.'), order('Construiește descrierea numerică.', ['Andelen', 'økte', 'fra tjue', 'til tretti', 'prosent'], '„Fra ... til ...” delimitează valoarea inițială și valoarea finală.')],
  ...bridge(['Pålitelig', 'En fremstilling'], [['Elena', 'En pålitelig undersøkelse må forklare hvordan tallene er samlet inn.', 'Un sondaj de încredere trebuie să explice cum au fost colectate cifrele.'], ['Jonas', 'En fremstilling av endringen må også vise hvor stort utvalget var.', 'O prezentare a schimbării trebuie să arate și cât de mare a fost eșantionul.']]),
  conversationPrompts: [['Hva er forskjellen mellom prosent og prosentpoeng her?', 'Care este diferența dintre procente și puncte procentuale aici?'], ['Hva vet vi om utvalget?', 'Ce știm despre eșantion?'], ['Hvilke andre forhold kan ha påvirket resultatet?', 'Ce alte condiții ar fi putut influența rezultatul?']],
  production: productive('Redactează 160–190 de cuvinte despre un sondaj: valori, tendință, eșantion și două limite.', 'Explică în două minute datele 20% → 30% fără să confunzi diferența absolută cu cea relativă.', ['Valorile și unitățile sunt corecte.', 'Nu confunzi asocierea cu o cauză demonstrată.', 'Oferi o concluzie proporțională cu limitele datelor.']),
};

const b2Sources = {
  uid: 'b2-comparare-surse', title: 'Compară surse și transmite esențialul', duration: 43,
  objectives: ['să compari două surse despre același subiect', 'să explici diferența de scop și perspectivă', 'să sintetizezi convergențele și contradicțiile'],
  vocabulary: [
    ['En avsender', 'Un emitent / un autor al mesajului', 'Avsenderen ønsker å fremme et bestemt forslag.', 'Emitentul dorește să promoveze o anumită propunere.'],
    ['Et formål', 'Un scop', 'Formålet er å informere, ikke å selge.', 'Scopul este să informeze, nu să vândă.'],
    ['Å vise til', 'A face trimitere la', 'Artikkelen viser til en undersøkelse fra skolen.', 'Articolul face trimitere la un sondaj realizat la școală.'],
    ['Å samsvare med', 'A corespunde cu', 'Tallene samsvarer med opplysningene i vedlegget.', 'Cifrele corespund informațiilor din anexă.'],
    ['I motsetning til', 'Spre deosebire de', 'I motsetning til rapporten bruker innlegget ingen tall.', 'Spre deosebire de raport, articolul de opinie nu folosește cifre.'],
    ['Samlet sett', 'În ansamblu', 'Samlet sett gir kildene et sammensatt bilde.', 'În ansamblu, sursele oferă o imagine complexă.'],
  ],
  dialogue: [
    ['Mina', 'De to tekstene handler om samme bibliotek, men virker uenige.', 'Cele două texte vorbesc despre aceeași bibliotecă, dar par să nu fie de acord.'],
    ['Jonas', 'Hva er formålet med hver tekst?', 'Care este scopul fiecărui text?'],
    ['Mina', 'Rapporten beskriver bruken. Debattinnlegget argumenterer mot kortere åpningstid.', 'Raportul descrie utilizarea. Articolul de opinie argumentează împotriva reducerii programului.'],
    ['Jonas', 'Viser de til de samme periodene?', 'Se referă la aceleași perioade?'],
    ['Mina', 'Nei. Rapporten teller besøk hele året, mens innlegget beskriver travle ettermiddager.', 'Nu. Raportul numără vizitele întregului an, în timp ce articolul descrie după-amiezile aglomerate.'],
    ['Jonas', 'Da kan begge opplysningene stemme. Samlet sett trenger vi mer detaljerte tall.', 'Atunci ambele informații pot fi adevărate. În ansamblu avem nevoie de cifre mai detaliate.'],
  ],
  grammar: { title: 'Contrastul dintre surse', rule: '„Mens” poate contrapune informații: fiecare subordonată păstrează ordinea subiect + verb. „I motsetning til” este urmat de un substantiv; dacă începe principala, urmează inversiunea.', examples: ['Rapporten teller besøk, mens innlegget beskriver erfaringer. — Raportul numără vizite, în timp ce articolul descrie experiențe.', 'I motsetning til innlegget bruker rapporten tall. — Spre deosebire de articol, raportul folosește cifre.'], wrong: 'I motsetning til innlegget rapporten bruker tall.' },
  exercises: [choice('Două surse raportează perioade diferite. Care concluzie este justificată?', ['Den ene må lyve.', 'Opplysningene kan være forenlige selv om de virker ulike.', 'Ingen av kildene kan leses.'], 1, 'Diferența de perioadă poate explica aparenta contradicție.'), fill('Completează: „Artikkelen viser ___ en lokal undersøkelse.”', 'til', 'Expresia de referire la sursă este „vise til”.'), order('Construiește concluzia prudentă.', ['Samlet sett', 'trenger', 'vi', 'flere', 'opplysninger'], 'Expresia inițială este urmată de verbul conjugat.')],
  ...bridge(['Et utvalg', 'En tendens'], [['Mina', 'Et utvalg av besøkende sier ikke nødvendigvis noe om alle brukerne.', 'Un eșantion de vizitatori nu spune neapărat ceva despre toți utilizatorii.'], ['Jonas', 'En tendens bør sammenlignes med andre kilder før vi anbefaler en endring.', 'O tendință ar trebui comparată cu alte surse înainte să recomandăm o schimbare.']]),
  conversationPrompts: [['Hvem er avsenderen, og hva er formålet?', 'Cine este emitentul și care este scopul?'], ['Hvilke opplysninger samsvarer?', 'Ce informații corespund?'], ['Hvordan kan en tilsynelatende motsetning forklares?', 'Cum poate fi explicată o contradicție aparentă?']],
  production: productive('Scrie o sinteză de 180–220 de cuvinte a două texte: autor, scop, acord, diferență și informație lipsă.', 'Explică în trei minute unui coleg ce putem concluziona din cele două surse și ce trebuie verificat.', ['Atribui fiecare idee sursei corecte.', 'Nu confunzi opinia cu rezultatul unui sondaj.', 'Sinteza unește sursele, fără două rezumate complet separate.']),
};

const b2Project = {
  uid: 'b2-proiect-delimitare', title: 'Delimitează o propunere pentru comunitate', duration: 45,
  objectives: ['să formulezi o problemă de analizat', 'să compari variante după criterii explicite', 'să pregătești o recomandare pentru publicuri diferite'],
  vocabulary: [
    ['En problemstilling', 'O întrebare centrală de analiză', 'Problemstillingen må være tydelig og avgrenset.', 'Întrebarea centrală trebuie să fie clară și delimitată.'],
    ['Et vurderingskriterium', 'Un criteriu de evaluare', 'Tilgjengelighet er et viktig vurderingskriterium.', 'Accesibilitatea este un criteriu important de evaluare.'],
    ['En interessent', 'O parte interesată', 'Hver interessent har ulike behov.', 'Fiecare parte interesată are nevoi diferite.'],
    ['Å avgrense', 'A delimita', 'Vi avgrenser prosjektet til én bydel.', 'Delimităm proiectul la un singur cartier.'],
    ['En anbefaling', 'O recomandare', 'Anbefalingen bygger på kostnad og nytte.', 'Recomandarea se bazează pe cost și utilitate.'],
    ['Et forbehold', 'O rezervă / o condiție de prudență', 'Vi tar et forbehold om at tallene kan endre seg.', 'Formulăm o rezervă privind faptul că cifrele se pot schimba.'],
  ],
  dialogue: [
    ['Elena', 'Vi vil forbedre tilbudet i bydelen. Hvordan avgrenser vi prosjektet?', 'Vrem să îmbunătățim serviciile din cartier. Cum delimităm proiectul?'],
    ['Mina', 'La oss undersøke om biblioteket bør ha én ekstra kveldsåpning.', 'Hai să analizăm dacă biblioteca ar trebui să fie deschisă încă o seară.'],
    ['Jonas', 'Hvilke interessenter må vi høre?', 'Ce părți interesate trebuie să ascultăm?'],
    ['Elena', 'Ansatte, ungdommer og folk som jobber sent. Vi må bruke de samme spørsmålene.', 'Angajații, tinerii și oamenii care lucrează până târziu. Trebuie să folosim aceleași întrebări.'],
    ['Mina', 'Vurderingskriteriene blir tilgjengelighet, kostnad og gjennomførbarhet.', 'Criteriile de evaluare vor fi accesibilitatea, costul și posibilitatea de realizare.'],
    ['Jonas', 'Da gir vi en anbefaling med et tydelig forbehold hvis svargrunnlaget er lite.', 'Atunci oferim o recomandare cu o rezervă clară dacă baza de răspunsuri este mică.'],
  ],
  grammar: { title: 'Întrebarea de analiză și criteriul', rule: 'O problemă investigată poate fi formulată ca întrebare indirectă după „undersøke om/hvordan”. Subiectul precedă verbul. „Ut fra” și „på grunnlag av” arată criteriul sau baza evaluării.', examples: ['Vi undersøker om biblioteket bør åpne senere. — Analizăm dacă biblioteca ar trebui să deschidă mai târziu.', 'Vi vurderer tilbudet ut fra tre kriterier. — Evaluăm oferta după trei criterii.'], wrong: 'Vi undersøker om bør biblioteket åpne senere.' },
  exercises: [choice('Care problemă este suficient delimitată pentru un proiect scurt?', ['Hvordan forbedrer vi alt i Norge?', 'Bør biblioteket i bydelen holde åpent én ekstra kveld?', 'Hvorfor er samfunnet som det er?'], 1, 'Întrebarea precizează serviciul, locul și schimbarea analizată.'), fill('Completează: „Vi undersøker ___ biblioteket bør åpne senere.”', 'om', '„Om” introduce alternativa investigată fără inversiune.'), order('Construiește întrebarea indirectă.', ['Vi', 'undersøker', 'hvilke behov', 'brukerne', 'har'], 'În întrebarea indirectă, subiectul „brukerne” vine înaintea verbului „har”.')],
  ...bridge(['Tilhørighet', 'Mangfold'], [['Elena', 'Tilhørighet kan styrkes når flere får bruke biblioteket på sine premisser.', 'Apartenența poate fi întărită când mai mulți pot folosi biblioteca în condiții potrivite lor.'], ['Mina', 'Mangfold betyr at vi må høre flere grupper før vi avgrenser prosjektet.', 'Diversitatea înseamnă că trebuie să ascultăm mai multe grupuri înainte să delimităm proiectul.']]),
  conversationPrompts: [['Hvordan kan du avgrense problemstillingen?', 'Cum poți delimita întrebarea centrală?'], ['Hvilke interessenter blir berørt?', 'Ce părți interesate sunt afectate?'], ['Hvilket kriterium bør veie tyngst, og hvorfor?', 'Ce criteriu ar trebui să cântărească cel mai mult și de ce?']],
  production: productive('Scrie o schiță de proiect de 180–220 de cuvinte: întrebare, surse, trei criterii, părți interesate și un risc.', 'Prezintă propunerea în trei minute pentru un grup de colegi și răspunde unei întrebări despre limite.', ['Problema este investigabilă într-un proiect scurt.', 'Criteriile sunt aplicate acelorași variante.', 'Arăți cine este afectat și ce nu poți concluziona încă.']),
};

const b1Sequence = [
  lesson(oldB1(1), {
    uid: 'b1-experiente-povestire',
    ...bridge(['Kan du gjenta?', 'Jeg har jobbet'], [['Elena', 'Kan du gjenta? Jeg vil forstå hva som skjedde på reisen.', 'Poți repeta? Vreau să înțeleg ce s-a întâmplat în călătorie.'], ['Jonas', 'Jeg har jobbet mye denne uken, så jeg gledet meg til turen.', 'Am lucrat mult săptămâna aceasta, așa că așteptam cu bucurie excursia.']]),
    dialogueEnd: [['Elena', 'Hvordan fikk dere vite at fergen ikke gikk?', 'Cum ați aflat că feribotul nu circula?'], ['Jonas', 'Vi fikk en melding, og deretter spurte vi på stasjonen.', 'Am primit un mesaj, iar apoi am întrebat la stație.']],
    conversationPrompts: [['Hva skjedde først på den siste reisen din?', 'Ce s-a întâmplat mai întâi în ultima ta călătorie?'], ['Hva endret planen underveis?', 'Ce a schimbat planul pe parcurs?'], ['Hvordan endte historien?', 'Cum s-a terminat povestea?']],
    production: productive('Scrie 90–110 cuvinte despre o călătorie cu început, schimbare de plan și rezultat.', 'Povestește 90 de secunde o experiență și cere clarificarea unui detaliu.', ['Evenimentele sunt într-o ordine ușor de urmărit.', 'Folosești preteritul și trei conectori temporali.', 'Închei cu rezultatul întâmplării.']),
  }),
  b1Reflection,
  b1Retelling,
  lesson(oldB1(2), {
    uid: 'b1-opinii-motive',
    ...bridge(['Mener du at', 'Så vidt jeg husker'], [['Mina', 'Mener du at vi bør endre arbeidstiden etter reisen?', 'Vrei să spui că ar trebui să schimbăm programul de lucru după călătorie?'], ['Jonas', 'Så vidt jeg husker, ønsket flere kortere reisevei. Derfor bør vi diskutere det.', 'Din câte îmi amintesc, mai mulți doreau o navetă mai scurtă. De aceea ar trebui să discutăm.']]),
    dialogueEnd: [['Mina', 'Kan du gi et konkret eksempel på når hjemmekontor fungerer?', 'Poți da un exemplu concret când munca de acasă funcționează?'], ['Oskar', 'Når jeg skriver rapporter, blir jeg mindre avbrutt hjemme.', 'Când scriu rapoarte, sunt întrerupt mai rar acasă.']],
    conversationPrompts: [['Hva mener du om fleksibel arbeidstid?', 'Ce părere ai despre programul flexibil?'], ['Hvilket eksempel støtter meningen din?', 'Ce exemplu îți susține părerea?'], ['Hva er en mulig ulempe?', 'Care este un posibil dezavantaj?']],
    production: productive('Scrie 100–120 de cuvinte despre programul flexibil: opinie, două motive și un exemplu.', 'Explică în 90 de secunde o preferință legată de muncă și răspunde la „de ce?”.', ['Opinia este explicită.', 'Distingi cauza cu „fordi” de rezultatul cu „derfor”.', 'Oferi un exemplu concret și recunoști o limită.']),
  }),
  b1Comparison,
  b1Disagreement,
  lesson(oldB1(5), {
    uid: 'b1-sanatate-clarificare',
    ...bridge(['Jeg skjønner poenget ditt', 'Samtidig'], [['Pasient', 'Jeg skjønner poenget ditt. Jeg vil bare være sikker på at jeg har forstått.', 'Îți înțeleg ideea. Vreau doar să fiu sigur că am înțeles.'], ['Lege', 'Samtidig er det viktig at du forteller når plagene begynte.', 'În același timp este important să spui când au început simptomele.']]),
    dialogueEnd: [['Lege', 'Jeg forklarer hva hver prøve undersøker, og når du får svar.', 'Explic ce verifică fiecare analiză și când primești răspuns.'], ['Pasient', 'Takk. Kan du skrive ned det viktigste, så jeg husker det?', 'Mulțumesc. Poți nota ce este mai important, ca să țin minte?']],
    grammar: { ...oldB1(5).grammar, rule: 'La relatare, „sa at” este urmat de subiect și verb. Trecutul poate marca perspectiva trecută, însă norvegiana nu impune schimbarea automată a tuturor timpurilor; alegerea depinde dacă informația este încă valabilă.', examples: ['Legen sa at jeg måtte komme tilbake. — Medicul a spus că trebuia să revin.', 'Hun sa at kontoret er åpent i dag. — Ea a spus că biroul este deschis astăzi.'] },
    exercises: [oldB1(5).exercises[0], fill('Completează relatarea la trecut: „Legen sa at jeg ___ komme tilbake dagen etter.”', 'måtte', '„Måtte” marchează obligația din relatarea trecută; nu este o regulă de schimbare automată a tuturor timpurilor.'), oldB1(5).exercises[2]],
    conversationPrompts: [['Når begynte plagene, og hvordan har de endret seg?', 'Când au început simptomele și cum s-au schimbat?'], ['Hva vil du be legen forklare nærmere?', 'Ce vei cere medicului să explice mai detaliat?'], ['Hvordan kan du sjekke at du husker avtalen riktig?', 'Cum poți verifica dacă ai reținut corect înțelegerea?']],
    production: productive('Scrie un mesaj de 100–120 de cuvinte pentru a descrie o situație fictivă și a cere o programare și clarificări.', 'Simulează două minute o consultație: cronologie, întrebări și confirmarea următorului pas.', ['Descrii cronologia fără să pui singur un diagnostic.', 'Ceri explicații pentru un termen neînțeles.', 'Reformulezi ce ai înțeles din conversație.']),
  }),
  lesson(oldB1(6), {
    uid: 'b1-locuinta-reclamatie',
    ...bridge(['En undersøkelse', 'Å anbefale'], [['Leietaker', 'En undersøkelse av badet kan vise hvor vannet kommer fra.', 'O examinare a băii poate arăta de unde vine apa.'], ['Utleier', 'Fagpersonen kommer for å anbefale en løsning etter å ha sett skaden.', 'Specialistul vine pentru a recomanda o soluție după ce vede dauna.']]),
    dialogueEnd: [['Leietaker', 'Kan du bekrefte tidspunktet skriftlig, så jeg kan være hjemme?', 'Poți confirma ora în scris, ca să pot fi acasă?'], ['Utleier', 'Ja, du får en melding i ettermiddag.', 'Da, primești un mesaj în această după-amiază.']],
    vocabulary: oldB1(6).vocabulary.slice(0, 6).map((item) => item[0] === 'Et depositum' ? ['Et depositum', 'O garanție', 'I kontrakten står det hvor depositumet skal betales.', 'În contract scrie unde trebuie plătită garanția.'] : item[0] === 'Vedlikehold' ? ['Vedlikehold', 'Întreținere', 'Vi må avklare hvem som har ansvar for vedlikeholdet.', 'Trebuie să clarificăm cine este responsabil de întreținere.'] : item),
    exercises: [choice('Care cerere clarifică următorul pas?', ['Kan du bekrefte tidspunktet skriftlig?', 'Det er sikkert din skyld.', 'Jeg sier ingenting om skaden.'], 0, 'Ceri o confirmare concretă și creezi o referință pentru următorul pas.'), ...oldB1(6).exercises.slice(1)],
    conversationPrompts: [['Hva oppdaget du, og når?', 'Ce ai observat și când?'], ['Hvilken dokumentasjon kan du sende?', 'Ce documente sau fotografii poți trimite?'], ['Hva vil du be utleieren bekrefte?', 'Ce vei cere proprietarului să confirme?']],
    production: productive('Scrie o reclamație de 110–130 de cuvinte: problemă, dată, documentare și cerere de răspuns.', 'Simulează o discuție de două minute despre o defecțiune în locuință.', ['Separi faptele observate de presupuneri.', 'Cererea este politicoasă și concretă.', 'Propui o modalitate de confirmare a următorului pas.']),
  }),
  b1PracticalPlan,
  lesson(oldB1(3), {
    uid: 'b1-munca-responsabilitati',
    ...bridge(['Innen fredag', 'Å følge opp'], [['Leder', 'Innen fredag trenger vi en oversikt over hvem som gjør hva.', 'Până vineri avem nevoie de o situație cu cine face ce.'], ['Elena', 'Å følge opp oppgavene blir lettere hvis alle kjenner ansvaret sitt.', 'Urmărirea sarcinilor devine mai ușoară dacă toți își cunosc responsabilitatea.']]),
    dialogueEnd: [['Irina', 'Kan vi bekrefte fordelingen i en kort melding etter møtet?', 'Putem confirma împărțirea într-un mesaj scurt după ședință?'], ['Leder', 'Ja. Jeg sender navn, oppgaver og frister til alle.', 'Da. Trimit tuturor numele, sarcinile și termenele.']],
    conversationPrompts: [['Hvilket ansvar har du i gruppen?', 'Ce responsabilitate ai în grup?'], ['Hvordan vil du avklare en uklar oppgave?', 'Cum vei clarifica o sarcină neclară?'], ['Hvilken informasjon trenger du før du begynner?', 'De ce informații ai nevoie înainte să începi?']],
    production: productive('Scrie un mesaj de 110–130 de cuvinte care împarte trei sarcini și cere o clarificare.', 'Simulează o ședință de două minute și verifică responsabilitățile.', ['Fiecare sarcină are responsabil și termen.', 'Clarificarea vizează informația lipsă.', 'Folosești un exemplu de pasiv pentru o acțiune.']),
  }),
  lesson(oldB1(4), {
    uid: 'b1-munca-candidatura',
    ...bridge(['Et ansvar', 'Et samarbeid'], [['Intervjuer', 'Et ansvar i denne stillingen er å hjelpe nye kolleger.', 'O responsabilitate a acestui post este să ajuți colegii noi.'], ['Elena', 'Et samarbeid fungerer best når vi forklarer oppgavene tydelig. Det har jeg erfaring med.', 'O colaborare funcționează cel mai bine când explicăm clar sarcinile. Am experiență cu asta.']]),
    dialogueEnd: [['Intervjuer', 'Kan du gi et eksempel på en vanskelig kundesamtale?', 'Poți da un exemplu de conversație dificilă cu un client?'], ['Søker', 'En kunde manglet en levering. Jeg undersøkte saken og avtalte et nytt tidspunkt.', 'Un client nu primise o livrare. Am verificat situația și am stabilit un nou termen.']],
    conversationPrompts: [['Hvilken arbeidserfaring er relevant for stillingen?', 'Ce experiență profesională este relevantă pentru post?'], ['Kan du gi et eksempel på godt samarbeid?', 'Poți da un exemplu de colaborare bună?'], ['Hva vil du spørre arbeidsgiveren om?', 'Ce vrei să întrebi angajatorul?']],
    production: productive('Redactează o candidatură de 120–150 de cuvinte adaptată unui post fictiv cu două cerințe.', 'Răspunde în două minute la trei întrebări de interviu și pune o întrebare.', ['Legi fiecare competență de un exemplu.', 'Explici de ce postul se potrivește experienței tale.', 'Formulezi disponibilitatea într-un ton politicos.']),
  }),
  b1Learning,
  lesson(oldB1(7), {
    uid: 'b1-stiri-surse',
    ...bridge(['Et delmål', 'Å øve på'], [['Elena', 'Et delmål er å forstå én lokal nyhet hver dag.', 'Un obiectiv intermediar este să înțeleg o știre locală în fiecare zi.'], ['Jonas', 'Å øve på korte sammendrag hjelper oss å skille fakta fra meninger.', 'Exersarea rezumatelor scurte ne ajută să distingem faptele de opinii.']]),
    dialogueEnd: [['Ada', 'Artikkelen gir ikke noen dato for den nye ruten.', 'Articolul nu oferă nicio dată pentru noua rută.'], ['Emil', 'Da skriver vi at planen er foreslått, ikke at den allerede gjelder.', 'Atunci scriem că planul este propus, nu că se aplică deja.']],
    grammar: { ...oldB1(7).grammar, rule: 'Folosește „ifølge” + sursă sau „X sier/hevder at...” pentru a indica de unde vine informația. Un plan propus nu trebuie prezentat ca o schimbare deja în vigoare.' },
    conversationPrompts: [['Hvem er kilden til opplysningen?', 'Cine este sursa informației?'], ['Hva er et faktum, og hva er en mening?', 'Ce este fapt și ce este opinie?'], ['Hvilken viktig opplysning mangler?', 'Ce informație importantă lipsește?']],
    production: productive('Scrie un rezumat de 100–120 de cuvinte al unei știri fictive, cu sursă, fapt principal și informație lipsă.', 'Explică unui coleg în 90 de secunde ce știm și ce nu știm din știre.', ['Menționezi sursa.', 'Nu prezinți intenția ca eveniment încheiat.', 'Păstrezi diferența dintre informație și comentariu.']),
  }),
  lesson(oldB1(9), {
    uid: 'b1-servicii-intrebari',
    ...bridge(['En kilde', 'Pålitelig'], [['Bruker', 'En kilde på nettet sier at jeg må sende flere dokumenter.', 'O sursă online spune că trebuie să trimit mai multe documente.'], ['Veileder', 'Sjekk om siden er pålitelig, og spør kontoret hvis noe er uklart.', 'Verifică dacă pagina este de încredere și întreabă biroul dacă ceva este neclar.']]),
    dialogueEnd: [['Bruker', 'Kan du si hvilke vedlegg jeg eventuelt mangler?', 'Îmi poți spune ce documente anexate îmi lipsesc eventual?'], ['Veileder', 'Ja, vi kan gå gjennom listen sammen og bekrefte hva som er mottatt.', 'Da, putem verifica lista împreună și confirma ce a fost primit.']],
    conversationPrompts: [['Hva vil du spørre om i en formell e-post?', 'Ce vei întreba într-un e-mail formal?'], ['Hvordan vil du be om bekreftelse?', 'Cum vei cere o confirmare?'], ['Hvilket vedlegg trenger du å avklare?', 'Ce document anexat trebuie să clarifici?']],
    production: productive('Scrie un e-mail de 110–130 de cuvinte pentru a verifica o cerere fictivă: referință, două întrebări și încheiere.', 'Simulează un apel de două minute la un birou și notează următorul pas.', ['Identifici solicitarea și motivul contactului.', 'Folosești două întrebări indirecte cu ordine corectă.', 'Ceri un răspuns sau un pas următor concret.']),
  }),
  lesson(oldB1(8), {
    uid: 'b1-comunitate-relatii',
    ...bridge(['En frist', 'Å fylle ut'], [['Radu', 'Er det en frist for å melde seg på aktiviteten i borettslaget?', 'Există un termen pentru înscrierea la activitatea asociației de locatari?'], ['Ingrid', 'Ja, men det er enkelt å fylle ut skjemaet. Jeg kan vise deg det.', 'Da, dar este simplu să completezi formularul. Pot să-ți arăt.']]),
    dialogueEnd: [['Radu', 'Jeg trodde dugnad bare var et møte. Takk for at du forklarte.', 'Credeam că activitatea voluntară era doar o ședință. Mulțumesc că mi-ai explicat.'], ['Ingrid', 'Bare hyggelig. Du kan spørre om en oppgave som passer for deg.', 'Cu plăcere. Poți întreba despre o sarcină potrivită pentru tine.']],
    conversationPrompts: [['Når har du opplevd en misforståelse om en vane?', 'Când ai trăit o neînțelegere legată de un obicei?'], ['Hva gjør at du føler tilhørighet?', 'Ce te face să simți apartenență?'], ['Hvordan kan du invitere noen inn i fellesskapet?', 'Cum poți invita pe cineva în comunitate?']],
    production: productive('Scrie 120–140 de cuvinte despre o neînțelegere culturală: ce ai crezut, ce ai întrebat și ce ai aflat.', 'Povestește două minute o situație și explică fără generalizări despre un întreg grup.', ['Descrii experiența ca situație concretă.', 'Clarificarea este respectuoasă.', 'Reiei limbajul reacțiilor și al relatării din prima secțiune.']),
  }),
  lesson(oldB1(10), {
    uid: 'b1-prezentare-idee',
    ...bridge(['Et fellesskap', 'En misforståelse'], [['Elena', 'Et fellesskap blir sterkere når folk får snakke sammen.', 'O comunitate devine mai puternică atunci când oamenii pot vorbi împreună.'], ['Jonas', 'En misforståelse kan være utgangspunktet for presentasjonen om en språkkafe.', 'O neînțelegere poate fi punctul de plecare al prezentării despre o cafenea de conversație.']]),
    dialogueEnd: [['Veileder', 'Hvem skal høre presentasjonen, og hva vil du at de skal gjøre etterpå?', 'Cine va asculta prezentarea și ce vrei să facă după aceea?'], ['Student', 'Naboene skal høre den, og jeg vil invitere dem til å planlegge en språkkafe.', 'Vecinii o vor asculta și vreau să-i invit să planifice o cafenea de conversație.']],
    conversationPrompts: [['Hva er hovedpoenget i presentasjonen?', 'Care este ideea principală a prezentării?'], ['Hvilket eksempel gjør ideen lett å forstå?', 'Ce exemplu face ideea ușor de înțeles?'], ['Hva vil du at publikum skal gjøre etterpå?', 'Ce vrei să facă publicul după aceea?']],
    production: productive('Scrie schița unei prezentări de 120–150 de cuvinte despre o activitate care ar ajuta comunitatea.', 'Prezintă ideea în două minute: context, propunere, motiv, exemplu și invitație.', ['Publicul și scopul sunt clare.', 'Exemplele susțin ideea principală.', 'Încheierea propune o acțiune concretă.']),
  }),
  b1CommunityProject,
  b1Evaluation,
];

const b2Revision = {
  uid: 'b2-proiect-revizuire', title: 'Revizuiește recomandarea după feedback', duration: 45,
  objectives: ['să selectezi feedbackul relevant pentru scop', 'să revizuiești o concluzie fără să ascunzi limitele', 'să explici transparent schimbările și pașii următori'],
  vocabulary: [
    ['Å revidere', 'A revizui', 'Vi reviderer anbefalingen etter høringen.', 'Revizuim recomandarea după consultare.'],
    ['En presisering', 'O precizare', 'Denne presiseringen gjør forslaget lettere å forstå.', 'Această precizare face propunerea mai ușor de înțeles.'],
    ['Å ta høyde for', 'A lua în calcul', 'Planen må ta høyde for ulike arbeidstider.', 'Planul trebuie să ia în calcul programe de lucru diferite.'],
    ['Det gjenstår å', 'Rămâne să', 'Det gjenstår å undersøke kostnadene nærmere.', 'Rămâne să analizăm costurile mai în detaliu.'],
    ['På nåværende grunnlag', 'Pe baza informațiilor actuale', 'På nåværende grunnlag anbefaler vi en prøveperiode.', 'Pe baza informațiilor actuale recomandăm o perioadă de probă.'],
    ['Å gjøre rede for', 'A explica în mod structurat', 'Rapporten gjør rede for hva som er endret.', 'Raportul explică în mod structurat ce s-a schimbat.'],
  ],
  dialogue: [
    ['Jonas', 'Hvilke tilbakemeldinger krever at vi reviderer anbefalingen?', 'Ce feedback cere să revizuim recomandarea?'],
    ['Elena', 'Ansatte påpekte at to kvelder krever flere folk enn vi hadde regnet med.', 'Angajații au arătat că două seri necesită mai mulți oameni decât calculasem.'],
    ['Mina', 'Da bør vi ta høyde for bemanningen og anbefale én kveld som prøveordning.', 'Atunci ar trebui să luăm în calcul personalul și să recomandăm o singură seară ca probă.'],
    ['Jonas', 'Hva gjenstår å undersøke?', 'Ce rămâne de analizat?'],
    ['Elena', 'Kostnaden ved ekstra vakter. På nåværende grunnlag kan vi ikke love en varig ordning.', 'Costul turelor suplimentare. Pe baza informațiilor actuale nu putem promite un aranjament permanent.'],
    ['Mina', 'Vi gjør rede for endringen og foreslår en evaluering etter tre måneder.', 'Explicăm schimbarea și propunem o evaluare după trei luni.'],
  ],
  grammar: { title: 'Ce s-a schimbat și ce rămâne deschis', rule: '„Har revidert” prezintă schimbarea cu efect prezent. „Det gjenstår å” introduce un pas încă nerealizat. „Ville ha” + participiu exprimă un rezultat ipotetic în trecut.', examples: ['Vi har revidert planen, men det gjenstår å beregne kostnaden. — Am revizuit planul, dar rămâne să calculăm costul.', 'Uten tilbakemeldingen ville vi ha oversett behovet. — Fără feedback am fi trecut cu vederea nevoia.'], wrong: 'Det gjenstår at beregne kostnaden.' },
  exercises: [choice('Ce revizuire răspunde feedbackului despre personal insuficient?', ['Vi fjerner alle forbehold.', 'Vi prøver én kveld og måler behovet for bemanning.', 'Vi bruker bare flere sterke ord.'], 1, 'Revizuirea modifică amploarea și verifică exact limita semnalată.'), fill('Completează: „Det gjenstår ___ undersøke kostnaden.”', 'å', '„Det gjenstår å” este urmat de infinitiv.'), order('Construiește recomandarea prudentă.', ['På nåværende grunnlag', 'anbefaler', 'vi', 'en prøveperiode'], 'După expresia inițială, verbul conjugat precedă subiectul.')],
  ...bridge(['En konklusjon', 'Å oppsummere'], [['Jonas', 'En konklusjon bør endres når nye opplysninger svekker grunnlaget.', 'O concluzie ar trebui schimbată când informații noi îi slăbesc baza.'], ['Elena', 'Å oppsummere debatten betyr også å vise hva vi fortsatt er uenige om.', 'A rezuma dezbaterea înseamnă și a arăta asupra a ce încă nu suntem de acord.']]),
  conversationPrompts: [['Hvilken tilbakemelding endrer anbefalingen mest?', 'Ce feedback schimbă cel mai mult recomandarea?'], ['Hva gjenstår å undersøke før en endelig beslutning?', 'Ce rămâne de analizat înaintea unei decizii finale?'], ['Hvordan vil du forklare endringen til dem som var uenige?', 'Cum vei explica schimbarea celor care nu erau de acord?']],
  production: productive('Scrie o recomandare finală de 220–260 de cuvinte cu două perspective, dovezi, limite și modificarea făcută după feedback.', 'Prezintă recomandarea în patru minute, răspunde la două obiecții și explică ce ai revizuit.', ['Recomandarea reflectă feedbackul fără să inventeze consens.', 'Limitele și informațiile lipsă sunt vizibile.', 'Stabilești o evaluare cu termen și criterii de succes.']),
};

const b2Sequence = [
  lesson(oldB2(1), {
    uid: 'b2-argumentare-nuante',
    ...bridge(['Etter min mening', 'Fordi'], [['Ingrid', 'Etter min mening bør vi prøve fleksible arbeidssteder, men argumentet trenger flere perspektiver.', 'După părerea mea ar trebui să încercăm locuri de lucru flexibile, dar argumentul are nevoie de mai multe perspective.'], ['Jonas', 'Fordi oppgavene er ulike, kan ikke én løsning passe alle.', 'Deoarece sarcinile sunt diferite, o singură soluție nu se poate potrivi tuturor.']]),
    dialogueEnd: [['Ingrid', 'Hvilke oppgaver passer best hjemme, og hvilke krever fysisk samarbeid?', 'Ce sarcini se potrivesc cel mai bine acasă și care cer colaborare fizică?'], ['Jonas', 'Det bør vi undersøke før vi anbefaler en ordning for hele teamet.', 'Ar trebui să analizăm asta înainte să recomandăm un aranjament pentru întreaga echipă.']],
    conversationPrompts: [['Hvilke hensyn taler for og imot forslaget?', 'Ce considerente susțin propunerea și ce considerente sunt împotrivă?'], ['Hva avhenger resultatet av?', 'De ce depinde rezultatul?'], ['Hvordan kan du nyansere en kategorisk påstand?', 'Cum poți nuanța o afirmație categorică?']],
    production: productive('Scrie 140–170 de cuvinte despre munca flexibilă: poziție, avantaj, limită și condiție de funcționare.', 'Susține o poziție două minute și răspunde unei întrebări despre o excepție.', ['Păstrezi un fir argumentativ clar.', 'Folosești „likevel” corect și recunoști o limită.', 'Concluzia precizează de ce depinde soluția.']),
  }),
  b2Claims,
  b2Counterargument,
  lesson(oldB2(6), {
    uid: 'b2-conflict-feedback',
    ...bridge(['En innvending', 'På dette grunnlaget'], [['Leder', 'En innvending fra de nyansatte gjelder manglende veiledning.', 'O obiecție din partea angajaților noi privește lipsa îndrumării.'], ['Elena', 'På dette grunnlaget bør vi diskutere arbeidsdelingen uten å plassere skyld.', 'Pe această bază ar trebui să discutăm împărțirea muncii fără să atribuim vină.']]),
    grammar: { ...oldB2(6).grammar, rule: 'Pentru un ton diplomatic, descrie propria observație prin „jeg opplever at” sau „det kan virke som om”, apoi cere perspectiva celuilalt. Aceste formule atenuează, dar nu înlocuiesc un exemplu concret.' },
    dialogueEnd: [['Leder', 'Kan du beskrive en situasjon der forventningene var forskjellige?', 'Poți descrie o situație în care așteptările au fost diferite?'], ['Ansatt', 'I går ventet jeg på godkjenning, mens kollegaen trodde at jeg kunne sende rapporten selv.', 'Ieri așteptam aprobarea, în timp ce colegul credea că pot trimite singur raportul.']],
    conversationPrompts: [['Hvilken observasjon kan du beskrive uten å plassere skyld?', 'Ce observație poți descrie fără să atribui vină?'], ['Hvordan kan du be om den andres perspektiv?', 'Cum poți cere perspectiva celuilalt?'], ['Hva må avklares før samarbeidet kan bli bedre?', 'Ce trebuie clarificat înainte ca colaborarea să se îmbunătățească?']],
    production: productive('Scrie un mesaj de 150–180 de cuvinte despre un conflict fictiv: observație, efect, întrebare și propunere.', 'Dă feedback două minute despre o situație concretă, apoi reformulează răspunsul partenerului.', ['Descrii comportamentul observat, fără etichete personale.', 'Ceri perspectiva celuilalt.', 'Propui un pas concret și negociabil.']),
  }),
  b2Negotiation,
  b2Mediation,
  lesson(oldB2(3), {
    uid: 'b2-media-credibilitate',
    ...bridge(['Å gjengi', 'Et uavklart punkt'], [['Nora', 'Å gjengi en konflikt rettferdig krever at vi leser mer enn overskriften.', 'A reda corect un conflict cere să citim mai mult decât titlul.'], ['Emil', 'Et uavklart punkt bør merkes som usikkert, også når saken deles raskt.', 'Un punct neclarificat ar trebui marcat ca incert, inclusiv când știrea se distribuie repede.']]),
    dialogueEnd: [['Nora', 'Den eldste versjonen av bildet er flere år gammel.', 'Cea mai veche versiune a imaginii are câțiva ani.'], ['Emil', 'Da bør vi forklare det før vi deler den, og finne ut hva bildet faktisk viser.', 'Atunci ar trebui să explicăm asta înainte să o distribuim și să aflăm ce arată efectiv imaginea.']],
    conversationPrompts: [['Hvilke tegn gjør deg usikker på en kilde?', 'Ce semne te fac nesigur în privința unei surse?'], ['Hva trenger du å vite om et bilde?', 'Ce trebuie să știi despre o imagine?'], ['Hvordan kan du forklare usikkerheten uten å avvise alt?', 'Cum poți explica incertitudinea fără să respingi totul?']],
    production: productive('Scrie o analiză de 160–190 de cuvinte a unei postări fictive: emitent, dată, context și verificări necesare.', 'Explică în două minute de ce ai distribui sau ai amâna distribuirea unei informații.', ['Verificările vizează sursa și contextul.', 'Afirmațiile sunt atribuite corect.', 'Concluzia are un grad de certitudine justificat.']),
  }),
  b2Data,
  b2Sources,
  lesson(oldB2(4), {
    uid: 'b2-decizii-sustenabilitate',
    ...bridge(['Samlet sett', 'Et formål'], [['Rådgiver', 'Samlet sett viser kildene både miljøgevinster og praktiske problemer.', 'În ansamblu, sursele arată atât beneficii pentru mediu, cât și probleme practice.'], ['Innbygger', 'Et formål med analysen må være å finne en løsning som også fungerer for dem som bor langt unna.', 'Un scop al analizei trebuie să fie găsirea unei soluții care funcționează și pentru cei care locuiesc departe.']]),
    dialogueEnd: [['Rådgiver', 'Vi kan prøve ordningen i ett område og måle virkningene.', 'Putem încerca aranjamentul într-o zonă și măsura efectele.'], ['Innbygger', 'Da bør dere høre både beboere, ansatte og butikkene før dere bestemmer dere.', 'Atunci ar trebui să ascultați locuitorii, angajații și magazinele înainte să decideți.']],
    conversationPrompts: [['Hvem får fordelene, og hvem får ulempene?', 'Cine primește avantajele și cine suportă dezavantajele?'], ['Hvilke alternativer bør sammenlignes?', 'Ce alternative ar trebui comparate?'], ['Hvordan kan virkningen av et tiltak undersøkes?', 'Cum poate fi analizat efectul unei măsuri?']],
    production: productive('Scrie 170–200 de cuvinte despre o măsură locală de transport: două perspective, condiții și evaluare.', 'Susține o intervenție de trei minute într-o consultare locală fictivă.', ['Analizezi efectele pentru două grupuri diferite.', 'Legi cauza, efectul și concesia corect.', 'Propui un criteriu de evaluare, nu doar o intenție.']),
  }),
  lesson(oldB2(7), {
    uid: 'b2-decizii-costuri',
    ...bridge(['En omstilling', 'Et tiltak'], [['Journalist', 'En omstilling i transporten krever både investeringer og opplæring.', 'O tranziție în transport necesită atât investiții, cât și instruire.'], ['Analytiker', 'Et tiltak bør vurderes ut fra hvem som betaler, og hvem som får nytten.', 'O măsură ar trebui evaluată în funcție de cine plătește și cine beneficiază.']]),
    dialogueEnd: [['Journalist', 'Hvilke grupper kan trenge ekstra støtte?', 'Ce grupuri pot avea nevoie de sprijin suplimentar?'], ['Analytiker', 'De som må lære nye oppgaver, bør få tid og mulighet til opplæring.', 'Cei care trebuie să învețe sarcini noi ar trebui să primească timp și posibilitatea instruirii.']],
    conversationPrompts: [['Hvilke kostnader kommer nå, og hvilke kommer senere?', 'Ce costuri apar acum și ce costuri apar mai târziu?'], ['Hvordan kan omstilling påvirke ulike ansatte?', 'Cum poate afecta tranziția angajați diferiți?'], ['Hva bør investeringen sammenlignes med?', 'Cu ce ar trebui comparată investiția?']],
    production: productive('Scrie o analiză de 170–200 de cuvinte a unei schimbări la serviciu: costuri, beneficii, persoane afectate și sprijin.', 'Explică trei minute de ce o soluție poate fi utilă pe termen lung, deși costă la început.', ['Separi termenul scurt de termenul lung.', 'Precizezi efectele pentru două grupuri.', 'Nu prezinți o consecință posibilă ca certitudine.']),
  }),
  lesson(oldB2(9), {
    uid: 'b2-decizii-tehnologie',
    ...bridge(['Lønnsom', 'En konsekvens'], [['Debattleder', 'En lønnsom løsning kan likevel skape problemer for personvernet.', 'O soluție rentabilă poate totuși crea probleme privind protecția datelor.'], ['Ekspert', 'En konsekvens kan være at ansatte føler seg overvåket. Det må undersøkes.', 'O consecință poate fi că angajații se simt supravegheați. Acest lucru trebuie analizat.']]),
    vocabulary: oldB2(9).vocabulary.map((item) => item[0] === 'Et samtykke' ? ['Et samtykke', 'Un consimțământ', 'I dette eksemplet ber tjenesten om samtykke før deling.', 'În acest exemplu serviciul cere consimțământul înaintea distribuirii.'] : item),
    exercises: [choice('Ce înseamnă „et samtykke” în exemplul din lecție?', ['Un consimțământ', 'O prejudecată', 'O cerere de produse'], 0, '„Et samtykke” denumește acordul unei persoane; aici verificăm sensul cuvântului.'), ...oldB2(9).exercises.slice(1)],
    dialogueEnd: [['Debattleder', 'Hva ville du undersøkt før systemet ble tatt i bruk?', 'Ce ai analiza înainte ca sistemul să fie folosit?'], ['Ekspert', 'Jeg ville undersøkt hvilke data som samles inn, hvem som får tilgang, og hvordan feil håndteres.', 'Aș analiza ce date sunt colectate, cine primește acces și cum sunt tratate erorile.']],
    conversationPrompts: [['Hvilket problem skal teknologien løse?', 'Ce problemă trebuie să rezolve tehnologia?'], ['Hvilke konsekvenser kan den få for ansatte?', 'Ce consecințe poate avea pentru angajați?'], ['Hvilke vilkår ville gjort løsningen mer akseptabel?', 'Ce condiții ar face soluția mai acceptabilă?']],
    production: productive('Scrie 180–210 cuvinte despre un instrument fictiv de lucru: utilitate, risc, condiții și controlul erorilor.', 'Susține o discuție de trei minute despre o introducere condiționată a tehnologiei.', ['Descrii cel puțin două perspective.', 'Folosești corect o condiție reală și una ipotetică.', 'Recomandarea include o limită și o verificare.']),
  }),
  lesson(oldB2(2), {
    uid: 'b2-comunicare-profesionala',
    ...bridge(['Et ansvar', 'Pålitelig'], [['Leder', 'Et ansvar må være tydelig også når vi bruker et nytt system.', 'O responsabilitate trebuie să fie clară și atunci când folosim un sistem nou.'], ['Rådgiver', 'En pålitelig rapport må vise hvem som har kontrollert tallene.', 'Un raport de încredere trebuie să arate cine a verificat cifrele.']]),
    dialogueEnd: [['Rådgiver', 'Jeg markerer hva som er bekreftet, og hva som fortsatt må vurderes.', 'Marchez ce este confirmat și ce trebuie încă evaluat.'], ['Leder', 'Fint. Skriv også hvilken beslutning du trenger fra meg.', 'Bine. Scrie și de ce decizie ai nevoie din partea mea.']],
    conversationPrompts: [['Hva må mottakeren vite først?', 'Ce trebuie să știe destinatarul mai întâi?'], ['Hva er bekreftet, og hva er fortsatt usikkert?', 'Ce este confirmat și ce este încă incert?'], ['Hvilken handling eller beslutning trenger du?', 'De ce acțiune sau decizie ai nevoie?']],
    production: productive('Scrie un e-mail de 170–200 de cuvinte către un coordonator: situație, două opțiuni și decizia necesară.', 'Prezintă în două minute situația unui proiect și cere o decizie concretă.', ['Scopul mesajului apare la început.', 'Distingi faptele confirmate de punctele deschise.', 'Cererea finală precizează acțiunea și termenul.']),
  }),
  lesson(oldB2(5), {
    uid: 'b2-raport-structurat',
    ...bridge(['En frist', 'Tilbakemelding'], [['Veileder', 'En frist hjelper oss å planlegge, men teksten må også være gjennomarbeidet.', 'Un termen ne ajută să planificăm, dar textul trebuie și revizuit atent.'], ['Student', 'Tilbakemelding på e-posten viste at jeg må skille bedre mellom funn og anbefaling.', 'Feedbackul primit la e-mail a arătat că trebuie să disting mai bine între constatări și recomandare.']]),
    grammar: { ...oldB2(5).grammar, rule: 'Un raport clar separă scopul, constatările și interpretarea. Formele impersonale și nominalizările sunt utile când actorul nu este relevant; păstrează verbele directe când spun mai clar cine face ce.', wrong: 'Det er foretatt en gjennomføring av en vurdering av vurderingen.' },
    dialogueEnd: [['Veileder', 'Unngå lange substantivkjeder når et verb gjør setningen klarere.', 'Evită lanțurile lungi de substantive când un verb face propoziția mai clară.'], ['Student', 'Da skriver jeg hvem som undersøkte saken, hva de fant, og hva vi anbefaler.', 'Atunci scriu cine a analizat situația, ce a constatat și ce recomandăm.']],
    conversationPrompts: [['Hva er forskjellen mellom å redegjøre og å drøfte?', 'Care este diferența dintre a prezenta și a analiza argumentativ?'], ['Hvor skal begrensningene i undersøkelsen forklares?', 'Unde ar trebui explicate limitele analizei?'], ['Hvordan kan du gjøre en tung formulering klarere?', 'Cum poți face o formulare greoaie mai clară?']],
    production: productive('Scrie un raport de 190–220 de cuvinte cu scop, constatări, două interpretări, limită și recomandare.', 'Explică structura raportului în trei minute și reformulează o propoziție prea greoaie.', ['Raportul distinge constatarea de interpretare.', 'Fiecare concluzie are o bază în text.', 'Stilul formal rămâne clar și concret.']),
  }),
  lesson(oldB2(8), {
    uid: 'b2-perspective-identitate',
    ...bridge(['En sammenheng', 'Å drøfte'], [['Student', 'En sammenheng mellom språk og tilhørighet kan se forskjellig ut fra person til person.', 'O legătură între limbă și apartenență poate arăta diferit de la o persoană la alta.'], ['Forsker', 'Å drøfte dette krever flere erfaringer, ikke én forklaring på vegne av alle.', 'A analiza argumentativ acest lucru necesită mai multe experiențe, nu o explicație în numele tuturor.']]),
    dialogueEnd: [['Student', 'Bør vi spørre folk hvordan de selv beskriver tilhørigheten sin?', 'Ar trebui să-i întrebăm pe oameni cum își descriu ei înșiși apartenența?'], ['Forsker', 'Ja. Samme språk kan bety ulike ting for ulike mennesker.', 'Da. Aceeași limbă poate însemna lucruri diferite pentru oameni diferiți.']],
    conversationPrompts: [['Hvordan kan språk gi tilhørighet på ulike måter?', 'Cum poate limba să ofere apartenență în moduri diferite?'], ['Hvilken generalisering bør du unngå?', 'Ce generalizare ar trebui să eviți?'], ['Hvordan kan du vise to perspektiver uten å rangere dem?', 'Cum poți arăta două perspective fără să le ierarhizezi?']],
    production: productive('Scrie 190–220 de cuvinte despre două experiențe fictive ale apartenenței: puncte comune, diferențe și limite.', 'Compară trei minute două perspective culturale fără să vorbești în numele unui întreg grup.', ['Atribui fiecare experiență persoanei care o descrie.', 'Folosești corect „både–og” și „verken–eller”.', 'Eviți concluziile generale bazate pe un singur exemplu.']),
  }),
  b2Project,
  lesson(oldB2(10), {
    uid: 'b2-proiect-dezbatere',
    ...bridge(['En anbefaling', 'Et forbehold'], [['Ordstyrer', 'En anbefaling om bibliotekets åpningstid må kunne forsvares overfor flere grupper.', 'O recomandare despre programul bibliotecii trebuie să poată fi susținută în fața mai multor grupuri.'], ['Elena', 'Et forbehold er at vi ennå ikke har en full beregning av bemanningen.', 'O rezervă este că încă nu avem un calcul complet al personalului.']]),
    title: 'Prezintă propunerea și răspunde obiecțiilor',
    dialogueEnd: [['Ordstyrer', 'Hva ville fått deg til å endre anbefalingen?', 'Ce te-ar face să schimbi recomandarea?'], ['Deltaker', 'Hvis bemanningen ikke kan sikres, vil jeg foreslå en kortere prøveperiode.', 'Dacă personalul nu poate fi asigurat, voi propune o perioadă de probă mai scurtă.']],
    conversationPrompts: [['Hva bygger anbefalingen din på?', 'Pe ce se bazează recomandarea ta?'], ['Hvordan vil du svare på det sterkeste motargumentet?', 'Cum vei răspunde celui mai puternic contraargument?'], ['Hva kan få deg til å endre konklusjonen?', 'Ce te poate face să schimbi concluzia?']],
    production: productive('Scrie un discurs de 200–240 de cuvinte pentru propunerea ta, incluzând o obiecție și răspunsul ei.', 'Susține o prezentare de patru minute și răspunde spontan la două întrebări.', ['Concluzia este susținută de surse și criterii.', 'Răspunzi direct la obiecție, fără să schimbi subiectul.', 'Indici în ce condiții ai revizui recomandarea.']),
  }),
  b2Revision,
];

const b1Readings = {
  'b1-relatare-clarificare': reading(
    'En reise som ble annerledes',
    'Elena gledet seg til en helg ved sjøen. Hun hadde jobbet mye og forventet en rolig tur. Først tok hun og Jonas toget til en liten by. Deretter skulle de reise videre med buss. Da de kom til stasjonen, hadde den siste bussen allerede gått. Elena ble usikker, men Jonas spurte en ansatt om hjelp. Den ansatte fortalte at et annet tog stoppet i nærheten av hotellet. Heldigvis kunne de bruke de samme billettene. Etter at de hadde sjekket ruten, kjøpte de litt mat og ventet inne. Til slutt kom de fram en time senere enn planlagt. På mandag fortalte Elena kollegaen Mina om reisen. Mina trodde først at de hadde tatt taxi. Elena forklarte at de hadde funnet et annet tog. Nå sjekker hun alltid både ankomsttid og neste forbindelse før hun bestiller.',
    'Hva misforsto Mina, og hvordan kom Elena og Jonas faktisk fram?',
    'Mina trodde at de hadde tatt taxi. De tok et annet tog som stoppet i nærheten av hotellet.',
    'Textul separă clar neînțelegerea Minei de soluția reală; „hadde gått” arată ce se întâmplase înainte de sosire.',
  ),
  'b1-dezacord-politicos': reading(
    'Tre dager sammen?',
    'På arbeidsplassen diskuterer Elena og kollegene en ny ordning. Noen ønsker å jobbe hjemme to dager i uken. De mener at de sparer reisetid og lettere kan konsentrere seg. Andre foretrekker kontoret fordi de kan spørre om hjelp med en gang. Mina er særlig bekymret for nye ansatte. Hun sier at de trenger kontakt for å bli trygge på oppgavene. Jonas skjønner poenget hennes, men peker på at flere bor langt unna. Etter min mening bør vi prøve en kombinasjon, sier Elena. Hun foreslår tre felles kontordager og ekstra veiledning for dem som er nye. Gruppen blir delvis enig. De vil prøve ordningen i en måned og deretter spørre alle hvordan samarbeidet fungerer. Selv om de ikke har samme førstevalg, finner de et kompromiss. Resultatet skal avgjøre om de fortsetter eller endrer planen.',
    'Hvilken bekymring har Mina, og hvordan tar kompromisset hensyn til den?',
    'Mina er bekymret for nye ansatte. Kompromisset gir tre felles kontordager og ekstra veiledning til dem som er nye.',
    'Soluția păstrează flexibilitatea și răspunde concret nevoii de sprijin; acordul este o probă, nu o decizie permanentă.',
  ),
  'b1-probleme-plan': reading(
    'Fra melding til avtale',
    'En kveld oppdaget Elena at ytterdøren i bygget ikke kunne låses. Først tok hun bilder. Deretter sendte hun en kort melding til utleieren og forklarte når problemet hadde begynt. Hun ba om et svar og skrev at saken hastet. Utleieren svarte neste morgen. Han skulle ringe en fagperson samme dag. I mellomtiden kunne beboerne bruke inngangen på baksiden. Elena var glad for svaret, men hun visste fortsatt ikke når reparasjonen ville skje. Derfor ringte hun og ba om en konkret avtale. De ble enige om at utleieren skulle sende tidspunktet innen fredag. Elena skulle informere naboene etter at hun hadde fått bekreftelsen. På fredag kom meldingen som avtalt. Fagpersonen skulle komme mandag klokken ni. Elena oppsummerte planen skriftlig, slik at alle visste hvem som gjorde hva. Da reparasjonen var ferdig, fulgte hun opp og bekreftet at døren virket igjen.',
    'Hvilken informasjon manglet i det første svaret, og hvem skulle informere naboene?',
    'Tidspunktet for reparasjonen manglet. Elena skulle informere naboene etter at hun hadde fått bekreftelsen.',
    'Un răspuns politicos nu este încă un plan complet: clarificarea adaugă termenul, responsabilul și confirmarea.',
  ),
  'b1-competente-dezvoltare': reading(
    'Et mål som kan følges opp',
    'Etter intervjuet fikk Elena en ny jobb med kundekontakt. Hun hadde relevant arbeidserfaring, men noen av oppgavene var nye. I den første samtalen med lederen forklarte hun hva hun mestret. Hun kunne ta imot kunder, finne informasjon og gi korte beskjeder. Samtidig ønsket hun å bli tryggere på skriftlige rapporter. Lederen ba henne gi et konkret eksempel. Elena viste en rapport der innholdet var riktig, men rekkefølgen var uklar. De satte et delmål for den neste måneden. Elena skulle skrive to korte rapporter og be om veiledning etter den første. Hun skulle også lese et godt eksempel og øve på å forklare hovedpoenget først. Etter fire uker sammenlignet de de to tekstene. Den andre var tydeligere, og Elena kunne forklare hvilke endringer hun hadde gjort. Neste mål ble å presentere rapporten muntlig på et kort møte.',
    'Hvordan skal Elena arbeide mot målet, og hvordan skal framgangen vurderes?',
    'Hun skal skrive to rapporter, få veiledning etter den første og lese et godt eksempel. Framgangen vurderes ved å sammenligne tekstene etter fire uker.',
    'Planul include acțiuni, sprijin, termen și un rezultat observabil; simpla intenție de a deveni mai bun nu ar fi suficientă.',
  ),
  'b1-comunitate-relatii': reading(
    'En invitasjon som var lett å misforstå',
    'Elena fant en invitasjon til dugnad i postkassen. Hun kjente ordet fra en kort nyhet, men visste ikke helt hva aktiviteten betydde i hennes bygg. I invitasjonen sto det en frist for påmelding og en lenke til et skjema. Først trodde hun at det bare var et vanlig møte om vedlikehold. Hun spurte naboen Jonas, som forklarte at de skulle gjøre praktiske oppgaver sammen og drikke kaffe etterpå. Elena ville gjerne bidra, men hun var usikker på hvilken oppgave som passet. Jonas foreslo at hun kunne hjelpe med å sette fram bord og ønske nye naboer velkommen. Hun fylte ut skjemaet og skrev et spørsmål om tidspunktet. På selve dagen møtte hun flere hun tidligere bare hadde hilst på. Etterpå sa hun at en liten forklaring hadde gjort stor forskjell. Misforståelsen ble begynnelsen på mer kontakt i nabolaget.',
    'Hva trodde Elena først, og hva gjorde det lettere for henne å delta?',
    'Hun trodde først at dugnaden bare var et møte. Jonas forklarte aktiviteten og foreslo en konkret oppgave som passet for henne.',
    'Textul leagă știrile și formularul din lecțiile anterioare de apartenență; explicația este concretă, fără a generaliza despre toți vecinii.',
  ),
  'b1-evaluare-plan-urmator': reading(
    'Den første språkkafeen',
    'Etter dugnaden foreslo Elena en språkkafe for naboene. Målet var at folk skulle bli kjent og få øve på norsk. Jonas bestilte et rom, Mina tok imot påmeldinger, og Elena skrev invitasjonen. De hadde blitt enige om å bruke små grupper. Hvis mange kom, skulle de dele gruppene etter tema. Atten personer meldte seg på, og femten kom. Under samtalen fikk alle fortelle om en opplevelse og stille et spørsmål. Etterpå samlet de tre korte tilbakemeldinger fra hver gruppe. Flere likte de små gruppene, men noen hadde ikke forstått hvordan de skulle melde seg på. På bakgrunn av svarene bestemte arrangørene seg for å skrive en kortere invitasjon neste gang. De ville beholde samtaleformen og forklare påmeldingen tydeligere. Elena mente at hovedmålet var nådd fordi alle hadde snakket med en ny person. Samtidig sa hun at de måtte undersøke hvorfor tre påmeldte ikke kom før de endret tidspunktet.',
    'Hva vil gruppen beholde, hva vil den endre, og hva må undersøkes først?',
    'Gruppen vil beholde små grupper og samtaleformen, gjøre påmeldingen tydeligere og undersøke hvorfor tre påmeldte ikke kom før tidspunktet endres.',
    'Evaluarea deosebește observația, schimbarea justificată și o întrebare încă deschisă; nu presupune motivul absenței.',
  ),
};

const b2Readings = {
  'b2-obiectii-raspuns': reading(
    'En ordning som måtte justeres',
    'Da teamet foreslo to faste dager med hjemmekontor, hevdet Jonas at alle ville bli mer effektive. Han viste til en intern spørreundersøkelse der mange rapporterte færre avbrytelser. Mina støttet ønsket om fleksibilitet, men kom med en viktig innvending: De nyansatte hadde ikke svart på undersøkelsen. Resultatet sa derfor lite om deres behov for veiledning. Jonas innrømmet at ordet alle var for sterkt. Påstanden burde avgrenses til enkelte oppgaver og ansatte med erfaring. Elena foreslo å skille mellom to spørsmål: Hvor kan konsentrasjonsarbeid løses best, og hvordan kan opplæringen sikres? Gruppen diskuterte faste veiledningsdager, en kontaktperson og muligheten til å komme på kontoret ved behov. Riktignok ville dette kreve mer planlegging, men det fulgte ikke at fleksibiliteten måtte oppgis. På dette grunnlaget anbefalte teamet en prøveperiode. Ordningen skulle fortsette med mindre evalueringen viste tydelige problemer med opplæring eller samarbeid. Før oppstart skrev de ned hvilke tegn de ville se etter. De skulle undersøke både opplevd arbeidsro og om nye ansatte faktisk fikk hjelpen de trengte. Slik førte innvendingen til et mer presist forslag, ikke bare til en kamp om hvem som hadde rett.',
    'Hvorfor var den opprinnelige påstanden for sterk, og hva ble endret i forslaget?',
    'De nyansatte hadde ikke deltatt i undersøkelsen. Gruppen avgrenset påstanden og la til faste veiledningsdager, kontaktperson og en evaluert prøveperiode.',
    'Obiecția privește aplicabilitatea dovezii. Răspunsul modifică propunerea și criteriile de evaluare, fără să respingă complet ideea inițială.',
  ),
  'b2-mediere-rezumat': reading(
    'Et referat begge kunne kjenne seg igjen i',
    'Samarbeidet mellom Elena og Jonas hadde blitt vanskelig etter flere endringer i kursplanen. Elena ønsket faste veiledningstider, mens Jonas ville kunne flytte dem når hasteoppgaver kom inn. I begynnelsen beskrev de hverandre som lite fleksible. En kollega ba dem i stedet forklare behovet bak kravet. Elena sa at hun måtte kunne planlegge kundesamtaler uten å avbryte dem. Jonas forklarte at enkelte oppgaver ikke kunne vente til neste dag. Slik kollegaen oppfattet det, hadde de et felles utgangspunkt: Begge ønsket god opplæring og færre avlysninger. De forhandlet fram en fast tid som bare kunne flyttes ved avtalte typer hasteoppgaver. Til gjengjeld skulle en ny tid bestilles med en gang. Ett uavklart punkt gjaldt hvem som reserverte rommet. Kollegaen skrev et kort referat med behov, avtale, ansvar og det åpne spørsmålet. Hun ba begge lese og bekrefte om oppsummeringen var dekkende. Elena rettet en formulering som hørtes ut som om hun aldri kunne bytte tidspunkt. Jonas presiserte hva hasteoppgave betydde. Først etter disse rettingene ble referatet godkjent. Dokumentet viste både enigheten og grensene for den, slik at ingen måtte gjette senere.',
    'Hvorfor ventet kollegaen med å kalle referatet godkjent?',
    'Begge parter måtte bekrefte at teksten gjenga behovene og vilkårene riktig. Elena og Jonas gjorde hver sin presisering før godkjenningen.',
    'Medierea cere verificarea fidelității. Un rezumat redactat de o terță persoană nu devine automat acordul ambelor părți.',
  ),
  'b2-comparare-surse': reading(
    'To tekster om det samme biblioteket',
    'I en fiktiv bydel vurderes det å endre bibliotekets åpningstid. En rapport beskriver antall besøk gjennom et helt år og viser at noen formiddager er rolige. Et debattinnlegg fra en ungdomsgruppe hevder derimot at biblioteket ofte er fullt. Ved første lesning virker tekstene motstridende. Elena undersøker avsender, formål og tidsrom. Rapportens formål er å gi en oversikt over ressursbruk. Innlegget vil sikre et møtested etter skoletid. Ungdommene beskriver ettermiddager, mens rapporten oppsummerer alle åpningstimer. Opplysningene kan derfor være forenlige. Samtidig viser rapporten ikke hvor lenge hvert besøk varer, eller hva brukerne gjør der. Innlegget gir konkrete erfaringer, men bygger ikke på et representativt utvalg. Samlet sett gir kildene et mer sammensatt bilde enn noen av overskriftene. Elena skriver en kort syntese som skiller mellom sikre opplysninger og spørsmål som gjenstår. Hun anbefaler å undersøke besøk etter tidspunkt, spørre flere brukergrupper og beregne behovet for bemanning. Hun foreslår ikke en endelig løsning før dette er gjort. I oppsummeringen forklarer hun tydelig hvilken kilde hver opplysning kommer fra, slik at leseren kan kontrollere resonnementet og forstå hvorfor ulike erfaringer ikke nødvendigvis betyr at én av avsenderne tar feil.',
    'Hvordan kan begge tekstene være riktige, og hvilke begrensninger har de?',
    'De beskriver ulike tidsrom og formål. Rapporten mangler detaljer om varighet og bruk, mens innlegget gir erfaringer fra et utvalg som ikke er representativt.',
    'Sinteza rezolvă contradicția aparentă prin compararea perioadei și scopului, apoi păstrează limitele fiecărei surse.',
  ),
  'b2-decizii-tehnologie': reading(
    'Et nytt system på arbeidsplassen',
    'Et fiktivt kurssenter vurderer et digitalt system som foreslår timeplaner og registrerer rombruk. Ledelsen mener at løsningen kan redusere administrasjon og utnytte rommene bedre. Flere ansatte ser nytten, men spør hvilke opplysninger som samles inn, hvem som får tilgang, og hvordan feil kan rettes. En lønnsom investering er ikke nødvendigvis en god løsning for alle grupper. Elena foreslår derfor å skille mellom selve planleggingsfunksjonen og detaljert registrering av den enkelte ansatte. I diskusjonen blir det klart at disse delene kan vurderes hver for seg. Jonas påpeker at kursledernes ulike arbeidstider må tas med i testen. Ellers kan systemet anbefale planer som ser effektive ut, men skaper nye problemer. Gruppen sammenligner et enkelt alternativ med en mer omfattende versjon. De anbefaler en begrenset prøveperiode med tydelige formål, avklart tilgang og en kontaktperson for spørsmål. Før oppstart skal deltakerne få forklart hva testen innebærer. Etterpå skal evalueringen undersøke både tidsbruk, feil og opplevd tillit. Ingen hevder at teknologien automatisk løser problemet. På nåværende grunnlag er anbefalingen å prøve én funksjon, samle relevante erfaringer og stoppe dersom de avtalte grensene ikke kan holdes.',
    'Hvorfor vil gruppen vurdere planlegging og individuell registrering hver for seg?',
    'Funksjonene har ulike formål og konsekvenser. Gruppen vil undersøke nytten uten automatisk å godta mer omfattende registrering av ansatte.',
    'Textul este un scenariu fictiv de analiză lingvistică. Recomandarea depinde de scop, limite și evaluare, nu doar de rentabilitate.',
  ),
  'b2-perspective-identitate': reading(
    'Samme språk, forskjellige erfaringer',
    'På en språkkafe fortalte to deltakere hvordan norsk hadde påvirket følelsen av tilhørighet. For Elena var det viktigste å kunne forklare seg på jobb uten alltid å be en kollega om hjelp. Hun opplevde større selvstendighet da hun kunne skrive en rapport og svare på oppfølgingsspørsmål. For en annen deltaker, Amir, handlet språket først og fremst om å delta i nabolaget. Han hadde lenge mestret arbeidsspråket sitt, men savnet uformelle samtaler med naboene. Begge ønsket å utvikle norsken og samtidig bevare andre språk de brukte med familien. Erfaringene viste at tilhørighet verken kan måles med ett enkelt spørsmål eller forklares bare gjennom språknivå. En deltaker i samtalen foreslo at alle med samme bakgrunn hadde de samme behovene. Mina utfordret generaliseringen og ba om flere konkrete erfaringer. Gruppen ble enig om at et inkluderende tilbud måtte gi plass til ulike mål. Noen trengte formell skriving, andre ville øve på småprat eller lokale aktiviteter. I et kort referat gjenga Elena forskjellene uten å rangere dem. Hun understreket at de to historiene var eksempler, ikke dokumentasjon på hva en hel gruppe mener. Det ga et bedre utgangspunkt for å planlegge neste språkkafe.',
    'Hvordan var Elenas og Amirs behov forskjellige, og hvilken generalisering avviste gruppen?',
    'Elena ønsket større selvstendighet på jobb, mens Amir ønsket uformell kontakt i nabolaget. Gruppen avviste at personer med samme bakgrunn nødvendigvis har de samme behovene.',
    'Comparația păstrează perspectivele individuale. Două experiențe pot inspira un plan fără să justifice afirmații despre o populație întreagă.',
  ),
  'b2-proiect-revizuire': reading(
    'Fra en bred idé til en prøvbar anbefaling',
    'Etter flere språkkafeer ønsket gruppen å undersøke om biblioteket burde ha lengre åpningstid. Den første ideen var to ekstra kvelder hver uke. Elena avgrenset problemstillingen til én bydel og foreslo tre vurderingskriterier: tilgjengelighet, kostnad og gjennomførbarhet. Gruppen sammenlignet besøksdata med intervjuer og et debattinnlegg. Kildene viste et behov for møteplasser om kvelden, men ga ikke et sikkert mål på hvor mange som ville komme. I presentasjonen anbefalte Jonas likevel to kvelder. Under debatten påpekte en ansatt at gruppen hadde undervurdert behovet for bemanning. Flere brukere mente dessuten at én godt valgt kveld kunne være tilstrekkelig. Gruppen reviderte derfor anbefalingen. På nåværende grunnlag foreslo de én ekstra kveld som prøveordning i tre måneder. De gjorde rede for endringen, tok høyde for ulike arbeidstider og beholdt et forbehold om kostnaden. Det gjensto å avtale bemanning og finne en måte å registrere faktisk bruk på uten unødvendige opplysninger. Evalueringen skulle sammenligne deltakelse, ressursbruk og erfaringer fra ansatte og brukere. Ingen presenterte dette som full enighet om en varig ordning. Den endelige teksten viste hva gruppen anbefalte nå, hvorfor den hadde endret syn, og hvilke funn som senere kunne føre til en ny revisjon.',
    'Hva endret gruppen etter debatten, og hvordan skal den nye anbefalingen vurderes?',
    'Den endret to faste ekstra kvelder til én kveld på prøve i tre måneder. Evalueringen skal sammenligne deltakelse, ressursbruk og erfaringer fra ansatte og brukere.',
    'Proiectul închide firul nivelului: dovezi, perspective, obiecție, revizuire și criterii de evaluare sunt legate explicit.',
  ),
};

const section = (id, title, outcome, mission, lessons, readings) => ({
  id, title, outcome, mission,
  lessons: lessons.map((item) => ({ ...item, ...(readings[item.uid] ? { reading: readings[item.uid] } : {}) })),
});

export const b1Sections = [
  section('b1-povesti', 'Experiențe care se leagă', 'Povestești coerent o experiență, explici reacțiile și verifici detaliile relatate.', 'Redă unui coleg o călătorie cu o schimbare neașteptată de plan.', b1Sequence.slice(0, 3), b1Readings),
  section('b1-opinii', 'Opinii, alegeri și compromisuri', 'Compari variante, susții o opinie și construiești un compromis simplu.', 'Alegeți împreună un program de lucru și justificați compromisul.', b1Sequence.slice(3, 6), b1Readings),
  section('b1-probleme', 'Probleme practice și soluții', 'Descrii o problemă, ceri clarificări și confirmi un plan cu responsabil și termen.', 'Transformă o reclamație într-o înțelegere clară și verificabilă.', b1Sequence.slice(6, 9), b1Readings),
  section('b1-munca', 'Muncă și dezvoltare', 'Prezinți competențe, clarifici responsabilități și planifici dezvoltarea.', 'Pregătește candidatura și un plan de progres pentru prima lună.', b1Sequence.slice(9, 12), b1Readings),
  section('b1-societate', 'Informație și participare', 'Rezumi o sursă, comunici cu un serviciu și clarifici o neînțelegere socială.', 'Verifică o informație și folosește-o pentru a participa la o activitate locală.', b1Sequence.slice(12, 15), b1Readings),
  section('b1-proiect', 'De la idee la rezultat', 'Prezinți, organizezi și evaluezi o activitate folosind limbajul întregului nivel.', 'Organizați o cafenea de conversație și propuneți îmbunătățiri pe baza feedbackului.', b1Sequence.slice(15, 18), b1Readings),
];

export const b2Sections = [
  section('b2-argumente', 'Argumente, dovezi și obiecții', 'Formulezi o poziție nuanțată și răspunzi unei obiecții valide printr-o ajustare.', 'Susține o propunere despre munca flexibilă și precizează limitele dovezilor.', b2Sequence.slice(0, 3), b2Readings),
  section('b2-negociere', 'Negociere și mediere', 'Negociezi condiții și redai neutru acordul și punctele încă deschise.', 'Ajutați două părți să ajungă la un acord pe care ambele îl confirmă.', b2Sequence.slice(3, 6), b2Readings),
  section('b2-surse', 'Surse, date și sinteză', 'Evaluezi credibilitatea, descrii date și sintetizezi surse aparent divergente.', 'Pregătește o sinteză echilibrată despre utilizarea bibliotecii.', b2Sequence.slice(6, 9), b2Readings),
  section('b2-decizii', 'Decizii cu efecte diferite', 'Analizezi costuri, beneficii și riscuri pentru mai multe grupuri.', 'Recomandă o schimbare locală sau profesională cu condiții și criterii de evaluare.', b2Sequence.slice(9, 12), b2Readings),
  section('b2-comunicare', 'Comunicare formală și perspective', 'Adaptezi mesajul publicului, redactezi un raport clar și compari experiențe fără generalizări.', 'Transmite o recomandare unui coordonator și explică perspectivele persoanelor afectate.', b2Sequence.slice(12, 15), b2Readings),
  section('b2-proiect', 'Propunere, dezbatere și revizuire', 'Delimitezi o problemă, aperi recomandarea și o revizuiești transparent după feedback.', 'Propuneți o perioadă de probă pentru programul bibliotecii și prezentați evaluarea necesară.', b2Sequence.slice(15, 18), b2Readings),
];
