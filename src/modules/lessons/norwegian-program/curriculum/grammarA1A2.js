import { G, R, F, C } from './grammarAuthoring';

export const grammarA1 = {
  'a1-greetings': { title: 'Spui numele și întrebi cum se numește cineva', points: [
    G('name-present', 0, [1], { title: 'Numele se spune cu „heter”', explanation: 'Pentru „mă numesc” folosești „jeg heter”. Forma „heter” rămâne aceeași cu „jeg” și „du”; învață expresia completă.', examples: ['v:1', ['Du heter Lars.', 'Te numești Lars.']], before: 'Jeg hete Anna.', focus: ['heter'] }),
    R('direct-wh-question', 'Întrebarea „Hva heter du?”', 'Când întrebi direct numele, ordinea este „Hva + heter + du?”. Păstrează formula întreagă; „Hvordan har du det?” întreabă despre stare.', ['v:2', ['Hva heter du?', 'Cum te numești?']], ['Hva du heter?', 'Hva heter du?', 'În întrebarea directă, „heter” vine înaintea lui „du”.'], [0], { focus: ['Hva', 'heter', 'du'] }),
  ] },
  'a1-origin-languages': { points: [
    G('origin-place', 'Jeg bor i Oslo.', [0, 1], { explanation: 'Spui originea cu „kommer fra” și locul în care locuiești cu „bor i”. Memorează prepoziția împreună cu verbul.', focus: ['fra', 'i'] }),
    R('subject-verb', 'Persoana, apoi verbul', 'Când începi enunțul simplu cu persoana, urmează verbul: „jeg snakker”. „Litt” vine înaintea limbii și arată că vorbești puțin.', ['v:3', 'v:4'], ['Jeg litt norsk snakker.', 'Jeg snakker litt norsk.', 'După „jeg” urmează verbul „snakker”, apoi informația despre limbă.'], [2], { focus: ['snakker', 'litt'] }),
  ], recall: 'name-present' },
  'a1-contact-details': { points: [
    G('information-question', 0, [1], { title: 'Ceri informația cu „Hva er …?”', explanation: 'Formula „Hva er …?” cere o informație. Înveți acum „telefonnummeret ditt” ca grup complet: „numărul tău de telefon”.', examples: [0, ['Hva er nummeret ditt?', 'Care este numărul tău?']], before: 'Hva telefonnummeret ditt er?', focus: ['Hva', 'er'] }),
    R('modal-bare', 'Ceri repetarea cu „Kan du …?”', '„Kan du gjenta?” înseamnă „Poți repeta?”. După „kan” folosești „gjenta”, fără „å”; poți adăuga ce trebuie repetat.', [1, 'v:5'], ['Kan du å gjenta?', 'Kan du gjenta?', 'După verbul modal „kan”, infinitivul apare fără „å”.'], [0, 2], { focus: ['Kan', 'gjenta'] }),
  ], recall: 'direct-wh-question' },
  'a1-family': { title: 'De la „un frate” la „fratele meu”', points: [
    G('definite-nouns', 'Broren bor i Oslo.', [0], { title: '„En bror” devine „broren”', explanation: '„En bror” numește un frate. Pentru fratele deja cunoscut folosești „broren”: articolul devine terminație. La fel: „en søster – søsteren”, în varianta Bokmål folosită aici.', examples: [['En bror – broren.', 'Un frate – fratele.'], ['En søster – søsteren.', 'O soră – sora.']], before: 'En broren bor i Oslo.', focus: ['en', 'broren', 'søsteren'] }),
    R('possessive-basic', '„Min” la singular, „mine” la plural', 'În exemplele cu „en”, posesivul de după substantiv este „min”: „broren min”. La plural folosești „mine”: „foreldrene mine”. Memorează acum aceste grupuri; „min bror” este și el corect, cu substantiv nearticulat.', ['v:1', 'v:3'], ['Foreldrene min bor i Romania.', 'Foreldrene mine bor i Romania.', '„Foreldrene” este plural, deci posesivul este „mine”, nu „min”.'], [1, 2], { focus: ['min', 'mine'] }),
  ], exercises: { 0: C('Cum spui „fratele”, când persoana este deja cunoscută?', ['Broren', 'En bror', 'Bror en'], 0, 'Forma articulată este „broren”; „en bror” înseamnă „un frate”.'), 1: F('Completează sensul „Sora mea se numește Maria”.', 'Søsteren ___ heter Maria.', 'min', 'Sora mea se numește Maria.', '„Min” exprimă „mea” pentru „søsteren”, în forma folosită aici.') } },
  'a1-home-rooms': { points: [
    G('definite-nouns', 'Bordet er her.', [0], { explanation: 'Reiei forma articulată: „et bord – bordet”, „et hus – huset”. Când folosești terminația „-et”, nu mai pui și articolul „et” înainte.', focus: ['et', 'bordet', 'stuen'] }),
    R('room-prepositions', 'Înveți locul ca expresie', 'În exemplele acestei lecții spui „på kjøkkenet”, dar „i stuen”. Prepozițiile de loc nu se traduc mereu prin același cuvânt; învață grupul complet.', ['v:1', 'v:2'], ['Vi er på stuen.', 'Vi er i stuen.', 'Pentru această cameră folosim în exemple „i stuen”; pentru bucătărie, „på kjøkkenet”.'], [1], { kind: 'usage', focus: ['på kjøkkenet', 'i stuen'] }),
  ] },
  'a1-neighbours-description': { points: [
    G('present-invariant', 'De bor i Oslo.', [1], { explanation: 'La prezent, verbul nu își schimbă forma după persoană: „han bor”, „hun bor”, „de bor”. Toate folosesc prezentul „bor”, nu infinitivul „bo”; nu schimbi forma la plural.', examples: ['v:1', 'v:3'], before: 'De bo i Oslo.', focus: ['bor'] }),
    R('personal-pronouns', '„Han”, „hun” și „de”', 'În dialog, „hun” se referă la Nora, iar „de” la membrii familiei. Alege pronumele după persoana sau grupul despre care vorbești.', ['v:2', 'v:3'], ['Nora er naboen. De bor her.', 'Nora er naboen. Hun bor her.', 'Când vorbești despre Nora singură, folosești „hun”; „de” ar indica mai multe persoane.'], [0], { kind: 'usage', focus: ['Hun', 'De'] }),
  ], recall: 'possessive-basic' },
  'a1-daily-routine': { points: [
    G('negation-main', 1, [1], { title: '„Ikke” după verbul conjugat', explanation: 'În enunțul simplu care începe cu persoana, „ikke” vine după verb: „jeg jobber ikke”. Spui astfel ce activitate nu faci.', focus: ['jobber', 'ikke'] }),
    R('present-regular', 'De la „å spise” la „spiser”', 'Multe verbe primesc „-r” la prezent: „spise – spiser”, „jobbe – jobber”. Persoana vine înaintea verbului în enunțurile simple de aici.', ['v:2', 'v:3'], ['Jeg spise frokost.', 'Jeg spiser frokost.', 'Pentru activitatea de acum sau obișnuită folosim prezentul „spiser”, nu infinitivul „spise”.'], [2], { focus: ['spiser', 'jobber'] }),
  ] },
  'a1-time-meetings': { points: [
    G('v2-main', 1, [2], { explanation: 'Într-un enunț afirmativ principal, verbul conjugat este al doilea element. „I dag” este un singur grup de sens, deși are două cuvinte: „I dag | jobber | jeg”.', focus: ['jobber', 'jeg'] }),
    R('time-prepositions', 'Ziua cu „på”, ora cu „klokka”', 'Cu ziua săptămânii folosești aici „på mandag”. Pentru ora întâlnirii folosești „klokka” urmat de număr: „klokka ni”.', ['v:2', 'v:3'], ['Vi møtes mandag på.', 'Vi møtes på mandag.', 'În grupul „på mandag”, prepoziția stă înaintea zilei.'], [1], { focus: ['på mandag', 'klokka'] }),
  ], recall: 'negation-main' },
  'a1-free-time-frequency': { points: [
    G('v2-main', 1, [2], { title: '„Noen ganger” la început', explanation: 'Reiei ordinea din „I dag jobber jeg”. Când începi cu „Noen ganger”, întregul grup ocupă primul loc, apoi urmează verbul și persoana.', focus: ['Noen ganger', 'leser', 'jeg'] }),
    R('verb-preposition', '„Høre på” se învață împreună', 'Pentru „a asculta muzică” folosești „høre på musikk”. Păstrezi „på” și când schimbi persoana sau adaugi un moment al zilei.', ['v:2', 'v:5'], ['Jeg hører musikk på hver dag.', 'Jeg hører på musikk hver dag.', '„På” aparține grupului „hører på musikk”, nu expresiei „hver dag”.'], [1], { focus: ['hører på'] }),
  ], recall: 'present-regular' },
  'a1-cafe': { points: [
    G('indefinite-articles', 'Jeg vil ha en kaffe.', [0, 1], { explanation: 'La singular înveți substantivul împreună cu articolul: „en kaffe”, „et smørbrød”. În aceste exemple Bokmål articolul stă înaintea substantivului; nu toate substantivele folosesc „en”.', focus: ['en', 'et'] }),
    R('request-want', 'Comanda cu „Jeg vil ha …”', 'Pentru o comandă simplă folosești „Jeg vil ha” urmat de produs. „Vil” este urmat de „ha”, fără „å”; pentru politețe poți adăuga „takk”.', ['v:3', 'v:4'], ['Jeg vil å ha vann.', 'Jeg vil ha vann.', 'După „vil”, verbul „ha” apare fără marca „å”.'], [2], { focus: ['vil ha'] }),
  ], recall: 'definite-nouns' },
  'a1-store-payment': { points: [
    G('direct-wh-question', 1, [0, 1], { title: 'Întrebi locul sau prețul', explanation: '„Hvor er …?” întreabă locul. „Hvor mye koster …?” întreabă prețul; „hvor mye” rămâne un grup înaintea verbului „koster”.', focus: ['Hvor', 'Hvor mye', 'koster'] }),
    R('payment-means', 'Mijlocul de plată cu „med”', 'Spui „betaler med kort” când precizezi cum plătești. În această expresie obișnuită, „kort” apare fără articol.', ['v:4', ['Jeg betaler med kort her.', 'Plătesc aici cu cardul.']], ['Jeg betaler kort med.', 'Jeg betaler med kort.', 'Prepoziția „med” introduce mijlocul de plată și stă înaintea lui „kort”.'], [2], { focus: ['med kort'] }),
  ] },
  'a1-groceries-quantities': { points: [
    G('quantity-plural', 0, [0], { explanation: 'În această lecție, „et eple” devine „to epler” după un număr mai mare decât unu. Nu păstrezi articolul singular „et” înaintea pluralului. „Et kilo epler” precizează cantitatea.', examples: [0, 'v:3'], focus: ['epler', 'kilo'] }),
    R('negation-main', 'Preferința negativă cu „liker ikke”', 'Reiei „ikke” după verb, acum pentru preferințe: „jeg liker ikke”. Păstrezi aceeași ordine când spui ce alimente nu îți plac.', [1, ['Jeg liker ikke epler.', 'Nu îmi plac merele.']], ['Jeg ikke liker melk.', 'Jeg liker ikke melk.', '„Ikke” urmează verbul conjugat „liker”.'], [2], { focus: ['liker', 'ikke'] }),
  ] },
  'a1-city-places': { points: [
    G('location-destination', 0, [0], { explanation: '„I sentrum” arată locul în care ești. „Til sentrum” arată destinația unei deplasări. Alege expresia după sensul verbului și situației.', focus: ['i sentrum', 'til sentrum'] }),
    R('place-relations', 'Legi două repere cu „mellom … og …”', '„Mellom” înseamnă „între” și cere aici două repere legate prin „og”. „Ved siden av” este un alt grup complet și arată vecinătatea.', ['v:4', 'v:5'], ['Apoteket er mellom skolen butikken.', 'Apoteket er mellom skolen og butikken.', 'Cele două repere după „mellom” sunt legate prin „og”.'], [1, 2], { focus: ['mellom', 'og', 'ved siden av'] }),
  ], recall: 'origin-place' },
  'a1-transport-directions': { points: [
    G('imperative', 0, [1], { explanation: 'Pentru indicația directă folosești forma de imperativ: „gå”, „ta”, „vent”. La „å gå” imperativul este „gå”; la „å vente” este „vent”, deci nu este doar ștergerea lui „å”.', focus: ['Gå', 'Ta'] }),
    R('request-want', 'Ceri un bilet și precizezi destinația', 'Reutilizezi comanda „Jeg vil ha”, acum cu „en billett”. Adaugi „til Oslo” pentru a preciza unde vrei să ajungi.', ['v:5', ['Jeg vil ha en billett til sentrum.', 'Doresc un bilet spre centru.']], ['Jeg vil ha til en billett Oslo.', 'Jeg vil ha en billett til Oslo.', 'Mai întâi numești obiectul cerut, apoi destinația cu „til”.'], [2], { focus: ['vil ha', 'til Oslo', 'til sentrum'] }),
  ], recall: 'location-destination' },
  'a1-weather-clothes': { points: [
    G('weather-det', 0, [0, 1], { explanation: 'Pentru descrierile de vreme din lecție folosești „det er” plus adjectiv: „kaldt”, „varmt”. Păstrezi „det”, chiar dacă româna spune doar „este frig”.', focus: ['Det er', 'kaldt', 'varmt'] }),
    R('need-object', '„Jeg trenger” urmat de lucrul necesar', '„Jeg trenger” înseamnă „am nevoie de”. În norvegiană, lucrul necesar urmează direct verbul: „jeg trenger en jakke”, fără o prepoziție tradusă din română.', ['v:4', ['Jeg trenger en paraply.', 'Am nevoie de o umbrelă.']], ['Jeg trenger av en jakke.', 'Jeg trenger en jakke.', 'După „trenger” pui direct obiectul: „en jakke”.'], [2], { focus: ['trenger'] }),
  ], recall: 'indefinite-articles' },
  'a1-first-workday': { points: [
    G('modal-bare', 0, [0, 1], { explanation: 'Reiei „kan” pentru ajutor și adaugi „må” pentru necesitate. După „kan”, „vil” și „må”, următorul verb este la infinitiv fără „å”.', focus: ['Kan', 'hjelpe', 'må', 'jobbe'] }),
    R('time-question', 'De la „Når er …?” la răspunsul cu ora', '„Når er møtet?” întreabă când are loc întâlnirea. Răspunsul simplu începe cu „Møtet er” și continuă cu „klokka” plus ora.', ['v:2', 'v:3'], ['Møtet klokka ti er.', 'Møtet er klokka ti.', 'În răspunsul care începe cu „Møtet”, verbul „er” urmează imediat.'], [2], { focus: ['Når', 'er', 'klokka'] }),
  ], recall: 'name-present' },
  'a1-clarification-instructions': { points: [
    G('modal-bare', 'Kan du vise meg?', [1], { explanation: 'Ceri sprijin cu „Kan du” urmat de verb fără „å”: „vise meg”, „gjenta”, „snakke saktere”. Precizează ce fel de ajutor îți trebuie.', examples: [0, 'v:3'], before: 'Kan du å vise meg?', focus: ['Kan du', 'vise', 'snakke'] }),
    R('yes-no-question', 'Întrebarea care începe cu „er”', 'Pentru confirmare poți întreba „Er dette riktig?”. Verbul vine primul în această întrebare cu răspuns da/nu; în afirmație spui „Dette er riktig”.', ['v:4', ['Dette er riktig.', 'Acest lucru este corect.']], ['Dette er riktig?', 'Er dette riktig?', 'Pentru întrebarea neutră cu răspuns da/nu din exercițiu, pune „er” înaintea lui „dette”.'], [2], { kind: 'usage', focus: ['Er', 'Dette'] }),
  ], recall: 'negation-main', exercises: { 1: F('Completează cererea „Îmi poți arăta?”.', 'Kan du ___ meg?', 'vise', 'Îmi poți arăta?', 'După „kan” folosim „vise”, fără „å”.') } },
  'a1-colleague-break': { points: [
    G('modal-negative', 1, [0, 2], { explanation: 'Refuzi cu „jeg kan ikke”. Dacă începi cu „Dessverre”, verbul conjugat vine înaintea persoanei: „Dessverre kan jeg ikke”. „Ikke” rămâne după persoană în acest exemplu.', focus: ['Dessverre', 'kan', 'jeg', 'ikke'] }),
    R('polite-acceptance', 'Acceptarea scurtă cu „gjerne”', 'La o invitație, „Ja, gjerne!” este un răspuns complet și politicos. Poți continua cu o propunere concretă, folosind expresiile despre întâlniri.', ['v:2', ['Ja, gjerne. Vi møtes klokka to.', 'Da, cu plăcere. Ne întâlnim la ora două.']], ['Dessverre kan jeg ikke nå.', 'Ja, gjerne!', 'Când vrei să accepți invitația, folosești „Ja, gjerne”; prima replică ar refuza-o.'], [1], { kind: 'usage', focus: ['gjerne'] }),
  ], recall: 'time-prepositions' },
};

export const grammarA2 = {
  'a2-plans-invitations': { points: [
    G('modal-bare', 0, [1, 2], { title: 'Planul și posibilitatea', explanation: '„Skal” prezintă aici un plan stabilit, iar „kan” o posibilitate. Ambele sunt urmate de infinitiv fără „å”: „skal møtes”, „kan møtes”.', focus: ['skal', 'kan', 'møtes'] }),
    R('invitation-infinitive', 'Invitația cu „lyst til å”', 'În formula „Har du lyst til å …?” păstrezi „til å” înaintea activității. Compară cu „vil” și „kan”, după care nu adaugi „å”.', ['v:0', ['Har du lyst til å gå en tur?', 'Ai chef să faci o plimbare?']], ['Har du lyst til ta en kaffe?', 'Har du lyst til å ta en kaffe?', 'Grupul complet din invitație este „lyst til å”, urmat de verb.'], [0], { focus: ['lyst til å'] }),
  ], recall: 'polite-acceptance', exercises: { 0: C('Cum inviți pe cineva la cafea cu formula „Ai chef să …?”?', ['Har du lyst til å ta en kaffe?', 'Har du lyst til ta en kaffe?', 'Har du lyst å til ta en kaffe?'], 0, 'Formula completă este „Har du lyst til å …?”.') } },
  'a2-friendship-preferences': { points: [
    G('preference-modal', 'Jeg vil heller gå en tur.', [0], { title: 'Preferința cu „vil heller”', explanation: '„Vil heller” alege o activitate în locul alteia. După „vil”, verbul este fără „å”, chiar dacă între ele apare „heller”.', examples: ['v:3', ['Jeg vil heller lese.', 'Prefer să citesc.']], focus: ['vil heller', 'gå', 'lese'] }),
    R('verb-infinitive', 'Activitatea după „liker å”', 'Când spui că îți place o activitate, folosești „liker å” plus verb. Deosebește această construcție de „vil heller”, care nu păstrează „å”.', [0, ['Jeg liker å lage middag.', 'Îmi place să pregătesc cina.']], ['Jeg liker lese.', 'Jeg liker å lese.', 'În această construcție, înaintea verbului „lese” păstrezi „å”.'], [1], { focus: ['liker å'] }),
  ], recall: 'invitation-infinitive' },
  'a2-family-comparisons': { points: [
    G('comparative', 0, [0, 1], { title: 'Comparativul și „enn”', explanation: 'Când numești reperul comparației, folosești „enn”: „yngre enn meg”. Unele comparative sunt neregulate: „stor – større”, „liten – mindre”.', examples: [0, 'v:3'], focus: ['eldre', 'mindre', 'enn'] }),
    R('v2-main', 'Începi schimbarea cu „nå”', '„Nå” poate deschide enunțul pentru a contrasta prezentul cu trecutul. Urmează verbul, apoi persoana, ca după „I dag”.', [1, 'v:4'], ['Nå de bor i et større hus.', 'Nå bor de i et større hus.', 'După elementul inițial „Nå”, verbul „bor” precedă subiectul „de”.'], [2], { focus: ['Nå', 'bor', 'de'] }),
  ], recall: 'possessive-basic' },
  'a2-shopping-returns': { points: [
    G('comparative', 'Jeg trenger en mindre størrelse.', [0], { explanation: 'Pentru comparația de mărimi din magazin folosești „større” și „mindre”. Multe alte adjective primesc „-ere”, de exemplu „billig – billigere”.', focus: ['mindre', 'billigere'] }),
    R('degree-too', '„For” plus adjectiv: prea mare sau prea mic', '„For stor” și „for liten” spun că produsul depășește limita potrivită. „For” stă înaintea adjectivului; comparativul „mindre” cere în schimb o mărime mai mică.', ['v:2', 'v:3'], ['Jakken er stor for.', 'Jakken er for stor.', 'În sensul „prea mare”, grupul este „for stor”, cu „for” înaintea adjectivului.'], [1], { focus: ['for stor', 'for liten'] }),
  ], recall: 'modal-bare', exercises: { 1: F('Completează sensul „Geaca este prea mare”.', 'Jakken er for ___.', 'stor', 'Geaca este prea mare.', '„For stor” înseamnă „prea mare”; sensul cerut fixează adjectivul.') } },
  'a2-housing-repairs': { points: [
    G('relative-som', 0, [1], { focus: ['som'] }),
    R('negation-main', 'Descrii defecțiunea cu „virker ikke”', 'În enunțul principal, „ikke” urmează verbul. Spui „Ovnen virker ikke”; informația cu „som” poate preciza ulterior despre ce cuptor vorbești.', ['v:4', [ 'Ovnen på kjøkkenet virker ikke.', 'Cuptorul din bucătărie nu funcționează.' ]], ['Ovnen ikke virker.', 'Ovnen virker ikke.', 'În enunțul principal care începe cu „Ovnen”, negația vine după „virker”.'], [2], { focus: ['virker', 'ikke'] }),
  ], recall: 'room-prepositions' },
  'a2-budget-offers': { points: [
    G('comparative', 'Bordet er billigere enn stolen.', [1], { explanation: '„Billig – billigere” și „dyr – dyrere” compară prețuri. Când numești al doilea produs, îl introduci prin „enn”.', focus: ['billigere', 'dyrere', 'enn'] }),
    R('modal-bare', 'Necesitatea plății cu „må betale”', 'Reiei „må” plus infinitiv fără „å”. După verb precizezi ce trebuie plătit: o factură sau suma totală.', ['v:4', ['Jeg må betale to hundre kroner.', 'Trebuie să plătesc două sute de coroane.']], ['Jeg må å betale en regning.', 'Jeg må betale en regning.', 'După „må”, infinitivul „betale” apare fără „å”.'], [2], { focus: ['må', 'betale'] }),
  ], recall: 'indefinite-articles' },
  'a2-health-pharmacy': { points: [
    G('modal-bare', 0, [1], { title: 'Recomandarea cu „bør”', focus: ['bør', 'hvile', 'ta'] }),
    R('polite-request', 'Cererea cu „vil gjerne”', '„Jeg vil gjerne” formulează o cerere politicoasă, urmată de verb fără „å”. În dialog folosești „bestille en time” pentru a cere o programare.', ['v:0', ['Jeg vil gjerne bestille en time i dag.', 'Aș dori să fac o programare astăzi.']], ['Jeg vil gjerne å bestille en time.', 'Jeg vil gjerne bestille en time.', '„Gjerne” nu schimbă regula lui „vil”: următorul verb rămâne fără „å”.'], [2], { focus: ['vil gjerne', 'bestille'] }),
  ], exercises: { 1: F('Completează recomandarea „Ar trebui să te odihnești”.', 'Du bør ___.', 'hvile', 'Ar trebui să te odihnești.', '„Hvile” înseamnă „a te odihni” și urmează lui „bør” fără „å”.') } },
  'a2-reschedule-appointment': { points: [
    G('appointment-change', 1, [0], { title: 'De la ziua stabilită la ziua nouă', explanation: '„Timen er på tirsdag” spune când are loc programarea. „Flytte timen til torsdag” precizează noua zi; „til” introduce destinația schimbării.', focus: ['på tirsdag', 'til torsdag'] }),
    R('yes-no-question', 'Ceri o programare cu „Har dere …?”', 'În întrebarea neutră despre disponibilitate, începi cu verbul „har”, apoi „dere”. Adaugi intervalul după lucrul cerut: „en ledig time på torsdag”.', ['v:2', ['Har dere en ledig time på torsdag?', 'Aveți o programare liberă joi?']], ['Dere har en ledig time på torsdag?', 'Har dere en ledig time på torsdag?', 'Pentru întrebarea neutră din exercițiu, „har” precedă subiectul „dere”.'], [2], { kind: 'usage', focus: ['Har dere', 'på torsdag'] }),
  ], recall: 'time-prepositions' },
  'a2-understand-appointment-instructions': { points: [
    G('remember-infinitive', 0, [1], { title: '„Husk å” înaintea acțiunii', explanation: '„Husk å” urmat de verb amintește ce trebuie să faci. Păstrează „å” în această construcție, spre deosebire de verbele modale.', examples: [0, 'v:2'], focus: ['Husk å', 'ta med'] }),
    R('confirmation-modal', 'Verifici instrucțiunea cu „Skal jeg …?”', '„Skal jeg” plus verb fără „å” verifică ce se așteaptă să faci. Numește acțiunea și detaliul pe care vrei să îl confirmi.', [1, ['Skal jeg ta med kortet?', 'Să aduc cardul?']], ['Skal jeg å vente her?', 'Skal jeg vente her?', 'După „skal”, verbul „vente” apare fără „å”.'], [2], { focus: ['Skal jeg', 'vente', 'ta med'] }),
  ], recall: 'modal-bare' },
  'a2-yesterday': { points: [
    G('past-simple', 'I går jobbet jeg hjemme.', [0, 1], { explanation: 'Pentru relatarea la trecut cerută aici, folosești preteritul: „jobbet”, „kjøpte”. Unele verbe sunt neregulate, de exemplu „er – var”.', focus: ['jobbet', 'kjøpte'] }),
    R('v2-main', 'Timpul la început, și în povestire', 'Când începi relatarea cu „I går” sau „Etterpå”, verbul conjugat rămâne al doilea element. Forma de trecut nu schimbă această ordine.', ['v:0', ['Etterpå kjøpte jeg mat.', 'După aceea am cumpărat mâncare.']], ['Etterpå jeg kjøpte mat.', 'Etterpå kjøpte jeg mat.', 'După „Etterpå”, verbul „kjøpte” precedă „jeg”.'], [2], { focus: ['jobbet', 'kjøpte', 'jeg'] }),
  ], exercises: { 1: F('Completează „Am fost acasă ieri”, folosind trecutul lui „er”.', 'Jeg ___ hjemme i går.', 'var', 'Am fost acasă ieri.', '„Var” este forma de trecut a lui „å være”.') } },
  'a2-life-experiences': { points: [
    G('past-simple', 'Jeg reiste til Bergen i fjor.', [0], { title: 'Momentul trecut încheiat', explanation: 'În relatarea obișnuită cu „i fjor”, plasezi acțiunea într-un interval încheiat și folosești „reiste”. Compară această alegere cu experiența fără dată precisă.', examples: [0, 'v:5'], focus: ['reiste', 'i fjor'] }),
    R('present-perfect', 'Experiența cu „har” plus participiu', '„Har vært” și „har sett” prezintă experiențe fără o dată încheiată precizată. În întrebare, „har” trece înaintea persoanei: „Har du …?”.', ['v:0', 'v:2'], ['Jeg vært i Bergen.', 'Jeg har vært i Bergen.', 'Perfectul cere auxiliarul „har” înaintea participiului „vært”.'], [1, 2], { focus: ['har', 'Har', 'vært'] }),
  ] },
  'a2-story-sequence': { points: [
    G('v2-main', 'Etterpå gikk jeg hjem.', [2], { title: 'Legi evenimentele păstrând ordinea', explanation: '„Først”, „så”, „etterpå” și „til slutt” pot ocupa primul loc. După acest element, verbul conjugat precedă persoana în enunțul principal.', focus: ['tok', 'gikk', 'jeg'] }),
    R('past-irregular', 'Trecutul verbelor „ta” și „gå”', 'Unele forme de trecut se învață separat: „ta – tok”, „gå – gikk”. Nu construiești aceste forme adăugând „-et”.', ['v:0', 'v:1'], ['Først taet jeg bussen.', 'Først tok jeg bussen.', 'Forma de trecut a lui „ta” este „tok”.'], [1], { focus: ['tok', 'gikk'] }),
  ], recall: 'past-simple' },
  'a2-work-cooperation': { points: [
    G('subordinate-reason', 0, [1], { explanation: '„Fordi” introduce motivul. În subordonata din exemple, subiectul precedă verbul: „fordi jeg trenger hjelp”; nu preiei inversiunea din întrebări.', focus: ['fordi', 'jeg', 'trenger'] }),
    R('verb-preposition', 'Colaborarea cu „samarbeide om”', 'Înveți verbul împreună cu prepoziția: „samarbeide om oppgaven”. „Om” introduce sarcina la care lucrați împreună.', ['v:4', ['Vi samarbeider om planen.', 'Colaborăm la plan.']], ['Vi samarbeider oppgaven om.', 'Vi samarbeider om oppgaven.', 'Prepoziția „om” stă înaintea sarcinii, în grupul „om oppgaven”.'], [2], { focus: ['samarbeider om'] }),
  ], recall: 'modal-bare' },
  'a2-work-instruction-check': { points: [
    G('time-subordinate', 0, [1], { explanation: '„Før” leagă acțiunea de ceea ce faci înainte, iar „etter at” de momentul de după altă acțiune. Subiectul precedă verbul în exemplele „du begynner” și „du er ferdig”.', focus: ['før', 'etter at', 'du'] }),
    R('modal-bare', 'Ceri repetarea pasului exact', 'Reiei „Kan du gjenta”, apoi adaugi ce trebuie repetat: „det siste trinnet”. Păstrezi infinitivul „gjenta” fără „å”.', ['v:0', ['Kan du gjenta instruksjonen?', 'Poți repeta instrucțiunea?']], ['Kan du å gjenta det siste trinnet?', 'Kan du gjenta det siste trinnet?', 'După „kan”, „gjenta” nu primește „å”; la final precizezi pasul.'], [2], { focus: ['Kan du', 'gjenta'] }),
  ], recall: 'imperative' },
  'a2-work-status-updates': { points: [
    G('present-perfect', 1, [0, 2], { title: 'Rezultatul și negația „ikke … ennå”', explanation: '„Har” plus participiu arată ce ai realizat. Pentru rezultatul încă neobținut, „ikke” stă după „har”, înaintea participiului, iar „ennå” încheie exemplul.', focus: ['har', 'ikke', 'gjort', 'ennå'] }),
    R('verb-preposition', 'Așteptarea cu „vente på”', '„Vente på” numește ceea ce aștepți. Păstrezi „på” înaintea răspunsului, chiar dacă româna spune direct „aștept un răspuns”.', ['v:5', ['Jeg venter på en beskjed.', 'Aștept o veste.']], ['Jeg venter et svar på.', 'Jeg venter på et svar.', 'În expresia „venter på”, prepoziția precedă lucrul așteptat.'], [1], { focus: ['venter på'] }),
  ] },
  'a2-digital-services': { points: [
    G('verb-infinitive', 0, [1], { focus: ['å logge inn', 'å sende'] }),
    R('present-perfect', 'Spui ce s-a întâmplat cu „har glemt”', '„Har glemt” exprimă un fapt trecut cu rezultat actual: acum nu îți amintești parola. Posesivul urmează forma articulată: „passordet mitt”.', ['v:3', ['Jeg har glemt brevet.', 'Am uitat scrisoarea.']], ['Jeg har glemme passordet mitt.', 'Jeg har glemt passordet mitt.', 'După „har”, folosești participiul „glemt”, nu infinitivul „glemme”.'], [2], { focus: ['har glemt'] }),
  ], recall: 'modal-bare' },
  'a2-forms-confirmation': { points: [
    G('which-agreement', 0, [0], { explanation: 'Alegi „hvilken” cu un substantiv de tip „en”, „hvilket” cu „et” și „hvilke” la plural: „hvilken dato”, „hvilket felt”, „hvilke vedlegg”.', focus: ['Hvilket', 'Hvilke'] }),
    R('missing-item', 'Anunți lipsa cu „det mangler”', '„Det mangler” introduce un element care lipsește din formular. După verb numești exact ce lipsește, ca interlocutorul să poată interveni.', ['v:5', ['Det mangler en dato.', 'Lipsește o dată.']], ['Det et vedlegg mangler.', 'Det mangler et vedlegg.', 'În construcția care începe cu „Det”, verbul „mangler” vine înaintea elementului lipsă.'], [1], { focus: ['Det mangler'] }),
  ], recall: 'indefinite-articles' },
  'a2-transport-delays': { points: [
    G('time-question', 'Når går neste tog?', [2], { title: 'Întrebarea „Når går …?”', explanation: 'Întrebi plecarea cu „Når” urmat de verbul conjugat și de mijlocul de transport: „Når går neste tog?”. „Neste” precizează următoarea plecare.', examples: ['v:1', ['Når går bussen?', 'Când pleacă autobuzul?']], before: 'Når neste tog går?', focus: ['Når', 'går'] }),
    R('modal-bare', 'Schimbarea mijlocului de transport cu „må”', '„Du må bytte buss” spune că este necesar să schimbi autobuzul. După „må”, păstrezi infinitivul „bytte” fără „å”.', ['v:3', ['Du må ta toget.', 'Trebuie să iei trenul.']], ['Du må å bytte buss.', 'Du må bytte buss.', 'După „må” nu introduci „å” înaintea verbului următor.'], [1], { focus: ['må', 'bytte', 'ta'] }),
  ], recall: 'v2-main', exercises: { 1: F('Completează sensul „Trebuie să schimbi autobuzul în centru”.', 'Du må ___ buss i sentrum.', 'bytte', 'Trebuie să schimbi autobuzul în centru.', '„Bytte buss” înseamnă să schimbi autobuzul; după „må” nu adaugi „å”.') } },
};
