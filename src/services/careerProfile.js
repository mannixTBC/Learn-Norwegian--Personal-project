export const CAREER_PROFILE_KEY = 'norwegian_career_profile';

export const careerPaths = [
  {
    id: 'transport', icon: 'TR', title: 'Transport și logistică', shortTitle: 'Transport',
    description: 'Pentru șoferi, curieri, depozite și activități logistice.',
    outcome: 'Vei exersa rute, livrări, întârzieri, siguranță și comunicarea cu dispeceratul.',
    phrases: [
      ['Hvor skal lasten leveres?', 'Unde trebuie livrată marfa?', 'lasten'],
      ['Jeg er forsinket på grunn av trafikken.', 'Am întârziere din cauza traficului.', 'forsinket'],
      ['Kan du sende meg adressen?', 'Îmi poți trimite adresa?', 'adressen'],
      ['Varene er klare for henting.', 'Produsele sunt pregătite pentru ridicare.', 'henting'],
      ['Jeg må kontrollere kjøretøyet.', 'Trebuie să verific vehiculul.', 'kontrollere'],
      ['Leveransen kommer før klokka ti.', 'Livrarea ajunge înainte de ora zece.', 'Leveransen'],
    ],
    scenarios: [
      ['O livrare întârziată', 'Ring dispeceratet og forklar hvorfor du er forsinket.', 'Sună dispeceratul și explică de ce ai întârziat.'],
      ['La depozit', 'Spør hvor varene skal plasseres.', 'Întreabă unde trebuie așezate produsele.'],
      ['Înainte de plecare', 'Forklar at du må kontrollere kjøretøyet først.', 'Explică faptul că trebuie să verifici mai întâi vehiculul.'],
    ],
  },
  {
    id: 'hospitality', icon: 'HR', title: 'Hoteluri, restaurante și turism', shortTitle: 'Hoteluri și restaurante',
    description: 'Pentru recepție, bucătărie, servire, curățenie hotelieră și turism.',
    outcome: 'Vei exersa rezervări, comenzi, alergii, solicitări și relația cu oaspeții.',
    phrases: [
      ['Har du en reservasjon?', 'Aveți o rezervare?', 'reservasjon'],
      ['Hva ønsker du å bestille?', 'Ce doriți să comandați?', 'bestille'],
      ['Er det noen allergier vi bør vite om?', 'Există alergii despre care ar trebui să știm?', 'allergier'],
      ['Rommet er klart etter klokka tre.', 'Camera este gata după ora trei.', 'Rommet'],
      ['Jeg skal undersøke dette med en gang.', 'Voi verifica acest lucru imediat.', 'undersøke'],
      ['Ønsker dere noe mer?', 'Mai doriți ceva?', 'mer'],
    ],
    scenarios: [
      ['La recepție', 'Hjelp en gjest som ikke finner reservasjonen sin.', 'Ajută un oaspete care nu își găsește rezervarea.'],
      ['În restaurant', 'Ta imot en bestilling og spør om allergier.', 'Preia o comandă și întreabă despre alergii.'],
      ['O solicitare', 'Forklar når rommet blir klart.', 'Explică atunci când camera va fi gata.'],
    ],
  },
  {
    id: 'construction', icon: 'CM', title: 'Construcții și meserii', shortTitle: 'Construcții',
    description: 'Pentru șantiere, electricieni, instalatori, tâmplari și alte meserii.',
    outcome: 'Vei exersa instrucțiuni, unelte, măsurători, materiale și reguli de siguranță.',
    phrases: [
      ['Husk å bruke verneutstyr.', 'Nu uita să folosești echipamentul de protecție.', 'verneutstyr'],
      ['Hvor finner jeg verktøyet?', 'Unde găsesc uneltele?', 'verktøyet'],
      ['Vi må måle en gang til.', 'Trebuie să măsurăm încă o dată.', 'måle'],
      ['Materialene kommer i morgen.', 'Materialele sosesc mâine.', 'Materialene'],
      ['Strømmen må slås av først.', 'Curentul trebuie oprit mai întâi.', 'Strømmen'],
      ['Denne delen må byttes.', 'Această piesă trebuie înlocuită.', 'byttes'],
    ],
    scenarios: [
      ['Ședința de dimineață', 'Forklar hvilket verneutstyr du trenger.', 'Explică de ce echipament de protecție ai nevoie.'],
      ['O problemă tehnică', 'Fortell arbeidslederen hvilken del som må byttes.', 'Spune-i șefului de echipă ce piesă trebuie înlocuită.'],
      ['Materiale lipsă', 'Spør når materialene blir levert.', 'Întreabă când vor fi livrate materialele.'],
    ],
  },
  {
    id: 'healthcare', icon: 'SI', title: 'Sănătate și îngrijire', shortTitle: 'Sănătate',
    description: 'Pentru îngrijire, centre rezidențiale, cabinete și servicii medicale.',
    outcome: 'Vei exersa simptome, nevoi, rutină, observații și comunicare calmă cu pacienții.',
    phrases: [
      ['Hvordan har du det i dag?', 'Cum vă simțiți astăzi?', 'Hvordan'],
      ['Har du vondt noe sted?', 'Vă doare undeva?', 'vondt'],
      ['Jeg skal hjelpe deg.', 'Vă voi ajuta.', 'hjelpe'],
      ['Det er tid for medisinen din.', 'Este timpul pentru medicamentul dumneavoastră.', 'medisinen'],
      ['Jeg må skrive dette i rapporten.', 'Trebuie să notez acest lucru în raport.', 'rapporten'],
      ['Kan du beskrive symptomene?', 'Puteți descrie simptomele?', 'symptomene'],
    ],
    scenarios: [
      ['Discuție cu un pacient', 'Spør rolig hvor pasienten har vondt.', 'Întreabă calm unde îl doare pe pacient.'],
      ['Predarea turei', 'Fortell kollegaen hva du har observert.', 'Spune-i colegului ce ai observat.'],
      ['Rutina zilnică', 'Forklar at du skal hjelpe med medisinen.', 'Explică faptul că vei ajuta cu medicamentul.'],
    ],
  },
  {
    id: 'cleaning', icon: 'CI', title: 'Curățenie și mentenanță', shortTitle: 'Curățenie',
    description: 'Pentru curățenie profesională, clădiri și întreținerea spațiilor.',
    outcome: 'Vei exersa programul, produsele, zonele de lucru, verificările și semnalarea problemelor.',
    phrases: [
      ['Hvilket rom skal rengjøres først?', 'Care cameră trebuie curățată prima?', 'rengjøres'],
      ['Jeg trenger flere rengjøringsmidler.', 'Am nevoie de mai multe produse de curățenie.', 'rengjøringsmidler'],
      ['Gulvet er fortsatt vått.', 'Podeaua este încă umedă.', 'vått'],
      ['Denne maskinen virker ikke.', 'Acest aparat nu funcționează.', 'virker'],
      ['Jeg er ferdig med denne etasjen.', 'Am terminat acest etaj.', 'etasjen'],
      ['Kan du kontrollere området?', 'Poți verifica zona?', 'kontrollere'],
    ],
    scenarios: [
      ['Începutul turei', 'Spør hvilket område du skal begynne med.', 'Întreabă cu ce zonă trebuie să începi.'],
      ['Echipament defect', 'Meld fra om en maskin som ikke virker.', 'Raportează un aparat care nu funcționează.'],
      ['Finalizarea lucrării', 'Be en kollega kontrollere området.', 'Roagă un coleg să verifice zona.'],
    ],
  },
  {
    id: 'retail', icon: 'MC', title: 'Magazine și relații cu clienții', shortTitle: 'Magazine',
    description: 'Pentru magazine, case de marcat, vânzări și suport pentru clienți.',
    outcome: 'Vei exersa produse, retururi, plăți, recomandări și rezolvarea politicoasă a problemelor.',
    phrases: [
      ['Kan jeg hjelpe deg med noe?', 'Vă pot ajuta cu ceva?', 'hjelpe'],
      ['Denne varen er dessverre utsolgt.', 'Din păcate, acest produs este epuizat.', 'utsolgt'],
      ['Har du kvitteringen?', 'Aveți bonul?', 'kvitteringen'],
      ['Du kan bytte varen innen tretti dager.', 'Puteți schimba produsul în treizeci de zile.', 'bytte'],
      ['Vil du betale med kort eller kontant?', 'Doriți să plătiți cu cardul sau numerar?', 'betale'],
      ['Jeg kan sjekke lageret.', 'Pot verifica stocul.', 'lageret'],
    ],
    scenarios: [
      ['Un produs lipsă', 'Tilby deg å sjekke lageret for kunden.', 'Oferă-te să verifici stocul pentru client.'],
      ['Un retur', 'Spør kunden om kvitteringen.', 'Întreabă clientul dacă are bonul.'],
      ['La casă', 'Spør hvordan kunden ønsker å betale.', 'Întreabă cum dorește clientul să plătească.'],
    ],
  },
  {
    id: 'office', icon: 'BI', title: 'Birou și IT', shortTitle: 'Birou și IT',
    description: 'Pentru birouri, tehnologie, proiecte, întâlniri și colaborare digitală.',
    outcome: 'Vei exersa ședințe, termene, cerințe, probleme tehnice și actualizări de proiect.',
    phrases: [
      ['Kan vi avtale et møte?', 'Putem stabili o întâlnire?', 'avtale'],
      ['Jeg sender deg en oppdatering senere.', 'Îți trimit o actualizare mai târziu.', 'oppdatering'],
      ['Hva er fristen for oppgaven?', 'Care este termenul pentru sarcină?', 'fristen'],
      ['Systemet er midlertidig utilgjengelig.', 'Sistemul este temporar indisponibil.', 'utilgjengelig'],
      ['Kan du forklare kravet litt nærmere?', 'Poți explica cerința puțin mai detaliat?', 'kravet'],
      ['Vi bør teste løsningen først.', 'Ar trebui să testăm mai întâi soluția.', 'løsningen'],
    ],
    scenarios: [
      ['O ședință', 'Be om en avklaring av oppgaven.', 'Cere o clarificare a sarcinii.'],
      ['O problemă tehnică', 'Forklar at systemet er midlertidig utilgjengelig.', 'Explică faptul că sistemul este temporar indisponibil.'],
      ['Actualizare de proiect', 'Fortell når du kan sende neste oppdatering.', 'Spune când poți trimite următoarea actualizare.'],
    ],
  },
  {
    id: 'studies', icon: 'ST', title: 'Studii', shortTitle: 'Studii',
    description: 'Pentru școală, universitate, cursuri profesionale și examene.',
    outcome: 'Vei exersa cursuri, teme, prezentări, întrebări și colaborarea cu profesorii.',
    phrases: [
      ['Når skal oppgaven leveres?', 'Când trebuie predată tema?', 'leveres'],
      ['Kan du forklare dette en gang til?', 'Poți explica încă o dată?', 'forklare'],
      ['Jeg forbereder meg til eksamen.', 'Mă pregătesc pentru examen.', 'eksamen'],
      ['Vi arbeider sammen i en gruppe.', 'Lucrăm împreună într-un grup.', 'gruppe'],
      ['Jeg vil gjerne stille et spørsmål.', 'Aș dori să pun o întrebare.', 'spørsmål'],
      ['Presentasjonen varer i ti minutter.', 'Prezentarea durează zece minute.', 'Presentasjonen'],
    ],
    scenarios: [
      ['La curs', 'Be læreren forklare et begrep på nytt.', 'Roagă profesorul să explice din nou un concept.'],
      ['Proiect de grup', 'Avtal hvordan dere skal dele oppgavene.', 'Stabiliți cum veți împărți sarcinile.'],
      ['Înainte de examen', 'Fortell hva du må øve mer på.', 'Spune ce trebuie să exersezi mai mult.'],
    ],
  },
  {
    id: 'family', icon: 'FI', title: 'Familie și integrare', shortTitle: 'Integrare',
    description: 'Pentru viața cotidiană, familie, grădiniță, școală și comunitate.',
    outcome: 'Vei exersa programări, mesaje de la școală, vecini și servicii locale.',
    phrases: [
      ['Når begynner skoledagen?', 'Când începe ziua de școală?', 'skoledagen'],
      ['Barnet mitt er sykt i dag.', 'Copilul meu este bolnav astăzi.', 'Barnet'],
      ['Jeg trenger hjelp med søknaden.', 'Am nevoie de ajutor cu cererea.', 'søknaden'],
      ['Kan vi avtale en samtale?', 'Putem stabili o discuție?', 'samtale'],
      ['Hvor finner jeg nærmeste helsestasjon?', 'Unde găsesc cel mai apropiat centru medical?', 'helsestasjon'],
      ['Takk for at du ga beskjed.', 'Mulțumesc că m-ai anunțat.', 'beskjed'],
    ],
    scenarios: [
      ['Mesaj către școală', 'Fortell at barnet ditt er sykt.', 'Spune că copilul tău este bolnav.'],
      ['O cerere', 'Be om hjelp til å forstå skjemaet.', 'Cere ajutor pentru a înțelege formularul.'],
      ['O programare', 'Avtal en samtale med læreren.', 'Stabilește o discuție cu profesorul.'],
    ],
  },
  {
    id: 'general', icon: 'NG', title: 'Norvegiană generală', shortTitle: 'Norvegiană generală',
    description: 'Pentru conversații cotidiene și pentru cei care încă explorează opțiunile.',
    outcome: 'Vei exersa situații variate din viața de zi cu zi, muncă și integrare.',
    phrases: [
      ['Kan du hjelpe meg?', 'Mă poți ajuta?', 'hjelpe'],
      ['Kan du si det en gang til?', 'Poți spune încă o dată?', 'gang'],
      ['Jeg forstår litt norsk.', 'Înțeleg puțină norvegiană.', 'forstår'],
      ['Hvor finner jeg mer informasjon?', 'Unde găsesc mai multe informații?', 'informasjon'],
      ['Jeg trenger litt mer tid.', 'Am nevoie de puțin mai mult timp.', 'tid'],
      ['Takk for at du forklarte.', 'Mulțumesc că ai explicat.', 'forklarte'],
    ],
    scenarios: [
      ['O conversație nouă', 'Be personen snakke litt saktere.', 'Roagă persoana să vorbească puțin mai lent.'],
      ['Ai nevoie de ajutor', 'Forklar hva du trenger hjelp med.', 'Explică pentru ce ai nevoie de ajutor.'],
      ['Nu ai înțeles', 'Be personen forklare det en gang til.', 'Roagă persoana să explice încă o dată.'],
    ],
  },
];

const ownerId = (user) => (user && user.id ? String(user.id) : 'default');
const storageKey = (user) => `${CAREER_PROFILE_KEY}_${ownerId(user)}`;

export const getCareerPath = (pathId) => careerPaths.find((path) => path.id === pathId) || careerPaths[careerPaths.length - 1];

export const getCareerProfile = (user) => {
  try {
    const profile = JSON.parse(localStorage.getItem(storageKey(user)));
    return profile && careerPaths.some((path) => path.id === profile.pathId) ? profile : null;
  } catch (_) {
    return null;
  }
};
export const saveCareerProfile = (user, pathId) => {
  const path = getCareerPath(pathId);
  const profile = { pathId: path.id, selectedAt: new Date().toISOString() };
  localStorage.setItem(storageKey(user), JSON.stringify(profile));
  return profile;
};

export const clearCareerProfile = (user) => localStorage.removeItem(storageKey(user));

const levelCoaching = {
  A1: 'Recunoaște expresiile și folosește-le ca propoziții complete.',
  A2: 'Adaptează expresiile pentru o solicitare sau o problemă simplă.',
  B1: 'Explică situația, motivul și următorul pas într-o conversație reală.',
  B2: 'Argumentează o soluție și adaptează registrul la contextul profesional.',
};

export const getCareerLessonModule = (pathId, level = 'A1', lessonId = 1) => {
  const path = getCareerPath(pathId);
  const offset = (Math.max(1, Number(lessonId)) - 1) % path.phrases.length;
  const phrases = [0, 1, 2].map((step) => path.phrases[(offset + step) % path.phrases.length]);
  const scenario = path.scenarios[offset % path.scenarios.length];
  const correctIndex = (Number(lessonId) + ['A1', 'A2', 'B1', 'B2'].indexOf(level)) % 3;
  const options = phrases.map((phrase) => phrase[1]);
  const correctMeaning = phrases[0][1];
  options.splice(0, 1);
  options.splice(correctIndex, 0, correctMeaning);

  return {
    path,
    phrases,
    scenario: { title: scenario[0], norwegian: scenario[1], romanian: scenario[2] },
    coaching: levelCoaching[level] || levelCoaching.A1,
    exercise: {
      type: 'choice',
      prompt: `În contextul „${path.shortTitle}”, ce înseamnă „${phrases[0][0]}”?`,
      options,
      answer: correctIndex,
      explanation: `${phrases[0][0]} — ${correctMeaning}`,
      careerPath: path.id,
    },
  };
};
