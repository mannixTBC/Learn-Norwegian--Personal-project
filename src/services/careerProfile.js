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
    id: 'hospitality', icon: 'HR', title: 'Muncă în hoteluri și restaurante', shortTitle: 'Hoteluri și restaurante',
    description: 'Un traseu profesional pentru recepție, servire, bucătărie și housekeeping.',
    outcome: 'Vei învăța limbajul folosit în ture, cu oaspeții, colegii și managerii.',
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
    curriculum: [
      {
        topic: 'Întrebări practice: mâncare, prețuri și orientare',
        phrases: [
          ['Denne retten inneholder kylling, fløte og hvete.', 'Acest preparat conține pui, smântână și grâu.', 'inneholder'],
          ['Frokost koster 195 kroner per person.', 'Micul dejun costă 195 de coroane de persoană.', 'koster'],
          ['Toalettet er til venstre, etter heisen.', 'Toaleta este în stânga, după lift.', 'til venstre'],
          ['Rommet ditt ligger i tredje etasje.', 'Camera dumneavoastră se află la etajul al treilea.', 'tredje etasje'],
          ['Restauranten ligger ved siden av resepsjonen.', 'Restaurantul se află lângă recepție.', 'ved siden av'],
          ['Jeg kan vise deg veien til rommet.', 'Vă pot arăta drumul spre cameră.', 'vise deg veien'],
        ],
        scenario: ['Întrebări la recepție', 'Svar på spørsmål om maten, prisene, toalettet og veien til rommet.', 'Răspunde la întrebări despre mâncare, prețuri, toaletă și drumul spre cameră.'],
      },
      {
        topic: 'Rezervări și check-in',
        phrases: [
          ['Velkommen, har du en reservasjon?', 'Bine ați venit, aveți o rezervare?', 'reservasjon'],
          ['Kan jeg få se legitimasjonen din?', 'Îmi puteți arăta actul de identitate?', 'legitimasjonen'],
          ['Frokost er inkludert og serveres fra klokka sju.', 'Micul dejun este inclus și se servește de la ora șapte.', 'inkludert'],
        ],
        scenario: ['Rezervarea nu apare', 'Finn en løsning når en gjest har en bekreftelse, men reservasjonen ikke vises i systemet.', 'Găsește o soluție când oaspetele are confirmarea, dar rezervarea nu apare în sistem.'],
      },
      {
        topic: 'Preluarea comenzilor și servirea',
        phrases: [
          ['Er dere klare til å bestille?', 'Sunteți pregătiți să comandați?', 'bestille'],
          ['Hvordan ønsker du biffen stekt?', 'Cum doriți să fie gătită friptura?', 'stekt'],
          ['Jeg kommer straks med drikken.', 'Vin imediat cu băutura.', 'straks'],
        ],
        scenario: ['La o masă nouă', 'Ta imot bestillingen, bekreft tilbehøret og fortell når maten kommer.', 'Preia comanda, confirmă garnitura și spune când va veni mâncarea.'],
      },
      {
        topic: 'Comunicarea în bucătărie',
        phrases: [
          ['Hvilken rett skal jeg forberede først?', 'Ce preparat trebuie să pregătesc mai întâi?', 'forberede'],
          ['Vi mangler to porsjoner av dagens suppe.', 'Ne lipsesc două porții din supa zilei.', 'mangler'],
          ['Bestillingen til bord seks er klar.', 'Comanda pentru masa șase este gata.', 'klar'],
        ],
        scenario: ['În timpul aglomerației', 'Avklar med kjøkkenet hvilken bestilling som haster og hva som mangler.', 'Clarifică împreună cu bucătăria ce comandă este urgentă și ce lipsește.'],
      },
      {
        topic: 'Alergii, igienă și siguranță alimentară',
        phrases: [
          ['Er det noen allergier vi bør vite om?', 'Există alergii despre care ar trebui să știm?', 'allergier'],
          ['Denne retten inneholder nøtter og melk.', 'Acest preparat conține nuci și lapte.', 'inneholder'],
          ['Jeg bytter hansker før jeg lager maten.', 'Îmi schimb mănușile înainte să pregătesc mâncarea.', 'bytter hansker'],
        ],
        scenario: ['O alergie importantă', 'Informer kjøkkenet tydelig om allergien og bekreft at maten blir tilberedt separat.', 'Informează clar bucătăria despre alergie și confirmă că mâncarea va fi pregătită separat.'],
      },
      {
        topic: 'Housekeeping și pregătirea camerelor',
        phrases: [
          ['Rom 214 må rengjøres før innsjekking.', 'Camera 214 trebuie curățată înainte de check-in.', 'rengjøres'],
          ['Jeg trenger flere håndklær og rent sengetøy.', 'Am nevoie de mai multe prosoape și lenjerie curată.', 'sengetøy'],
          ['Minibaren er kontrollert, men lampen virker ikke.', 'Minibarul este verificat, dar lampa nu funcționează.', 'virker ikke'],
        ],
        scenario: ['Camera trebuie predată', 'Meld fra til resepsjonen om hva som er ferdig og hvilken feil som må repareres.', 'Anunță recepția ce este gata și ce defecțiune trebuie reparată.'],
      },
      {
        topic: 'Programul și predarea turei',
        phrases: [
          ['Når begynner kveldsvakten?', 'Când începe tura de seară?', 'kveldsvakten'],
          ['Kan du ta bord fem mens jeg hjelper resepsjonen?', 'Poți prelua masa cinci cât timp ajut recepția?', 'ta bord fem'],
          ['Jeg gir beskjed til neste vakt.', 'Voi transmite informația turei următoare.', 'gir beskjed'],
        ],
        scenario: ['Predarea turei', 'Fortell kollegaen hvilke gjester som venter, og hvilke oppgaver som ikke er ferdige.', 'Spune-i colegului ce oaspeți așteaptă și ce sarcini nu sunt terminate.'],
      },
      {
        topic: 'Reclamații și rezolvarea problemelor',
        phrases: [
          ['Beklager ventetiden. Jeg undersøker saken med en gang.', 'Ne cerem scuze pentru așteptare. Verific situația imediat.', 'undersøker'],
          ['Vi kan tilby deg et annet rom.', 'Vă putem oferi o altă cameră.', 'tilby'],
          ['Jeg forstår problemet og skal finne en løsning.', 'Înțeleg problema și voi găsi o soluție.', 'løsning'],
        ],
        scenario: ['Un oaspete nemulțumit', 'Lytt til klagen, beklag og foreslå en konkret løsning uten å love for mye.', 'Ascultă reclamația, cere scuze și propune o soluție concretă fără să promiți prea mult.'],
      },
      {
        topic: 'Nota de plată și check-out',
        phrases: [
          ['Vil du betale med kort eller kontant?', 'Doriți să plătiți cu cardul sau numerar?', 'betale'],
          ['Skal regningen deles eller betales samlet?', 'Nota se împarte sau se plătește împreună?', 'regningen'],
          ['Kvitteringen sendes til e-postadressen din.', 'Chitanța va fi trimisă la adresa dumneavoastră de e-mail.', 'Kvitteringen'],
        ],
        scenario: ['O greșeală pe notă', 'Kontroller regningen, forklar postene og korriger beløpet før gjesten betaler.', 'Verifică nota, explică pozițiile și corectează suma înainte ca oaspetele să plătească.'],
      },
      {
        topic: 'Interviul și dezvoltarea profesională',
        phrases: [
          ['Jeg har erfaring med kundeservice og skiftarbeid.', 'Am experiență în relații cu clienții și munca în ture.', 'erfaring'],
          ['Jeg kan arbeide kvelder og helger.', 'Pot lucra seara și în weekend.', 'kvelder'],
          ['Målet mitt er å bli trygg i rollen og ta mer ansvar.', 'Obiectivul meu este să capăt siguranță în rol și să preiau mai multe responsabilități.', 'ansvar'],
        ],
        scenario: ['La interviul de angajare', 'Presenter erfaringen din og forklar hvordan du håndterer travle perioder og krevende gjester.', 'Prezintă-ți experiența și explică modul în care gestionezi perioadele aglomerate și oaspeții dificili.'],
      },
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

const a1CareerPhrases = {
  transport: [
    ['Hvor skal jeg kjøre?', 'Unde trebuie să conduc?', 'kjøre'],
    ['Kan du sende adressen?', 'Îmi poți trimite adresa?', 'adressen'],
    ['Jeg er forsinket.', 'Am întârziat.', 'forsinket'],
    ['Varene er klare.', 'Produsele sunt gata.', 'klare'],
    ['Jeg trenger hjelp.', 'Am nevoie de ajutor.', 'hjelp'],
    ['Takk for hjelpen.', 'Mulțumesc pentru ajutor.', 'hjelpen'],
  ],
  hospitality: [
    ['Har du en reservasjon?', 'Aveți o rezervare?', 'reservasjon'],
    ['Hva vil du bestille?', 'Ce doriți să comandați?', 'bestille'],
    ['Frokost er klokka sju.', 'Micul dejun este la ora șapte.', 'Frokost'],
    ['Rommet er klart.', 'Camera este gata.', 'klart'],
    ['Hvor er toalettet?', 'Unde este toaleta?', 'toalettet'],
    ['Jeg skal sjekke.', 'Voi verifica.', 'sjekke'],
  ],
  construction: [
    ['Hvor skal jeg begynne?', 'De unde trebuie să încep?', 'begynne'],
    ['Kan du vise meg?', 'Îmi poți arăta?', 'vise'],
    ['Jeg trenger verneutstyr.', 'Am nevoie de echipament de protecție.', 'verneutstyr'],
    ['Denne virker ikke.', 'Acesta nu funcționează.', 'virker ikke'],
    ['Er dette riktig?', 'Este corect?', 'riktig'],
    ['Jeg er ferdig.', 'Am terminat.', 'ferdig'],
  ],
  healthcare: [
    ['Hvordan har du det?', 'Cum vă simțiți?', 'Hvordan'],
    ['Har du vondt?', 'Vă doare?', 'vondt'],
    ['Jeg skal hjelpe deg.', 'Vă voi ajuta.', 'hjelpe'],
    ['Det er tid for medisinen.', 'Este timpul pentru medicament.', 'medisinen'],
    ['Kan du vente litt?', 'Puteți aștepta puțin?', 'vente'],
    ['Takk for hjelpen.', 'Mulțumesc pentru ajutor.', 'hjelpen'],
  ],
  cleaning: [
    ['Hvor skal jeg begynne?', 'De unde trebuie să încep?', 'begynne'],
    ['Jeg trenger flere kluter.', 'Am nevoie de mai multe lavete.', 'kluter'],
    ['Gulvet er vått.', 'Podeaua este umedă.', 'vått'],
    ['Maskinen virker ikke.', 'Aparatul nu funcționează.', 'virker ikke'],
    ['Rommet er ferdig.', 'Camera este gata.', 'ferdig'],
    ['Kan du kontrollere?', 'Poți verifica?', 'kontrollere'],
  ],
  retail: [
    ['Kan jeg hjelpe deg?', 'Vă pot ajuta?', 'hjelpe'],
    ['Har du kvitteringen?', 'Aveți bonul?', 'kvitteringen'],
    ['Varen er utsolgt.', 'Produsul este epuizat.', 'utsolgt'],
    ['Du kan betale med kort.', 'Puteți plăti cu cardul.', 'betale'],
    ['Jeg skal sjekke lageret.', 'Voi verifica stocul.', 'lageret'],
    ['Et øyeblikk, takk.', 'Un moment, vă rog.', 'øyeblikk'],
  ],
  office: [
    ['Når er møtet?', 'Când este întâlnirea?', 'møtet'],
    ['Kan du sende e-posten?', 'Poți trimite e-mailul?', 'sende'],
    ['Jeg trenger hjelp.', 'Am nevoie de ajutor.', 'hjelp'],
    ['Systemet virker ikke.', 'Sistemul nu funcționează.', 'virker ikke'],
    ['Kan du forklare?', 'Poți explica?', 'forklare'],
    ['Jeg er ferdig.', 'Am terminat.', 'ferdig'],
  ],
  studies: [
    ['Når begynner kurset?', 'Când începe cursul?', 'kurset'],
    ['Kan du forklare?', 'Poți explica?', 'forklare'],
    ['Jeg forstår ikke.', 'Nu înțeleg.', 'forstår ikke'],
    ['Kan du si det en gang til?', 'Poți spune încă o dată?', 'en gang til'],
    ['Jeg trenger hjelp.', 'Am nevoie de ajutor.', 'hjelp'],
    ['Når er prøven?', 'Când este testul?', 'prøven'],
  ],
  family: [
    ['Barnet mitt er sykt.', 'Copilul meu este bolnav.', 'sykt'],
    ['Når begynner skolen?', 'Când începe școala?', 'skolen'],
    ['Jeg trenger hjelp.', 'Am nevoie de ajutor.', 'hjelp'],
    ['Kan vi avtale en time?', 'Putem stabili o programare?', 'avtale'],
    ['Hvor er helsestasjonen?', 'Unde este centrul medical?', 'helsestasjonen'],
    ['Takk for beskjeden.', 'Mulțumesc pentru informație.', 'beskjeden'],
  ],
  general: [
    ['Jeg forstår ikke.', 'Nu înțeleg.', 'forstår ikke'],
    ['Kan du si det en gang til?', 'Poți spune încă o dată?', 'en gang til'],
    ['Kan du snakke saktere?', 'Poți vorbi mai încet?', 'saktere'],
    ['Kan du vise meg?', 'Îmi poți arăta?', 'vise'],
    ['Jeg trenger hjelp.', 'Am nevoie de ajutor.', 'hjelp'],
    ['Takk for hjelpen.', 'Mulțumesc pentru ajutor.', 'hjelpen'],
  ],
};

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
  A1: 'Expresii utile din prima zi la serviciu. Ascultă-le și memorează-le ca formule complete.',
  A2: 'Adaptează expresiile pentru o solicitare sau o problemă simplă.',
  B1: 'Explică situația, motivul și următorul pas într-o conversație reală.',
  B2: 'Argumentează o soluție și adaptează registrul la contextul profesional.',
};

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const buildCareerGapExercise = (path, phrases) => {
  const [sentence, translation, answer] = phrases[0];
  const options = Array.from(new Set(phrases.map((phrase) => phrase[2]).filter(Boolean)));
  const sentenceWithGap = answer
    ? sentence.replace(new RegExp(escapeRegExp(answer), 'i'), '___')
    : sentence;

  return {
    type: 'gaps',
    prompt: 'Adaugă cuvântul lipsă.',
    sentence: sentenceWithGap,
    options,
    answer: [answer],
    explanation: `${sentence} — ${translation}`,
    careerPath: path.id,
  };
};

export const getCareerLessonModule = (pathId, level = 'A1', lessonId = 1) => {
  const path = getCareerPath(pathId);
  const normalizedLevel = String(level).toUpperCase();
  const a1Phrases = a1CareerPhrases[path.id] || a1CareerPhrases.general;
  const phraseSource = normalizedLevel === 'A1' ? a1Phrases : path.phrases;
  const offset = (Math.max(1, Number(lessonId)) - 1) % phraseSource.length;
  const curriculumModule = normalizedLevel !== 'A1' && path.curriculum
    ? path.curriculum[(Math.max(1, Number(lessonId)) - 1) % path.curriculum.length]
    : null;
  const phrases = curriculumModule
    ? curriculumModule.phrases
    : (normalizedLevel === 'A1' ? [0, 1] : [0, 1, 2]).map((step) => phraseSource[(offset + step) % phraseSource.length]);
  const scenario = normalizedLevel === 'A1'
    ? [`Prima zi în ${path.shortTitle.toLocaleLowerCase()}`, phrases[0][0], phrases[0][1]]
    : curriculumModule
    ? curriculumModule.scenario
    : path.scenarios[offset % path.scenarios.length];
  return {
    path,
    phrases,
    scenario: { title: scenario[0], norwegian: scenario[1], romanian: scenario[2] },
    coaching: curriculumModule
      ? `${curriculumModule.topic}. ${levelCoaching[normalizedLevel] || levelCoaching.A1}`
      : levelCoaching[normalizedLevel] || levelCoaching.A1,
    exercise: buildCareerGapExercise(path, phrases),
  };
};
