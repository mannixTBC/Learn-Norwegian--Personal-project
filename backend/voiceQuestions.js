// Prepared Bokmål questions with Romanian translations. Audio is shared by all
// learners, and the opening turn needs no extra LLM call.
const questions = {
  A1: [
    [['Hva heter du?', 'Cum te numești?'], ['Hvordan har du det?', 'Cum te simți?'], ['Hva sier du når du møter noen?', 'Ce spui când întâlnești pe cineva?']],
    [['Hva vil du bestille?', 'Ce ai dori să comanzi?'], ['Vil du ha kaffe eller te?', 'Vrei cafea sau ceai?'], ['Vil du ha et smørbrød?', 'Vrei un sandviș?']],
    [['Hvor er kaffen?', 'Unde este cafeaua?'], ['Hvor mye koster den?', 'Cât costă?'], ['Vil du ha en kvittering?', 'Vrei un bon?']],
    [['Når står du opp?', 'Când te trezești?'], ['Hva spiser du til frokost?', 'Ce mănânci la micul dejun?'], ['Hva gjør du om kvelden?', 'Ce faci seara?']],
    [['Hva heter kollegaen din?', 'Cum îl cheamă pe colegul tău?'], ['Når begynner møtet?', 'Când începe ședința?'], ['Kan du hjelpe meg?', 'Mă poți ajuta?']],
    [['Hvem bor du sammen med?', 'Cu cine locuiești?'], ['Har du søsken?', 'Ai frați sau surori?'], ['Hvordan er familien din?', 'Cum este familia ta?']],
    [['Hvilken dag er det i dag?', 'Ce zi este astăzi?'], ['Hva er klokka?', 'Cât este ceasul?'], ['Når kan vi møtes?', 'Când ne putem întâlni?']],
    [['Hvordan er været i dag?', 'Cum este vremea astăzi?'], ['Hva har du på deg?', 'Cu ce ești îmbrăcat?'], ['Hva bruker du når det regner?', 'Ce porți când plouă?']],
    [['Hvordan kommer du til jobb?', 'Cum ajungi la serviciu?'], ['Hvor er bussholdeplassen?', 'Unde este stația de autobuz?'], ['Når går bussen?', 'Când pleacă autobuzul?']],
    [['Hva gjør du om morgenen?', 'Ce faci dimineața?'], ['Hva vil du bestille til lunsj?', 'Ce ai dori să comanzi la prânz?'], ['Hva gjør du etter jobb?', 'Ce faci după serviciu?']],
  ],
  A2: [
    [['Hva skal du gjøre i helgen?', 'Ce vei face în weekend?'], ['Vil du bli med på kafé?', 'Vrei să vii la cafenea?'], ['Når passer det å møtes?', 'Când îți convine să ne întâlnim?']],
    [['Hvordan reiser du til jobb?', 'Cum mergi la serviciu?'], ['Hva gjør du hvis bussen er forsinket?', 'Ce faci dacă autobuzul întârzie?'], ['Hvordan forklarer du at du kommer sent?', 'Cum explici că vei întârzia?']],
    [['Hva kjøpte du sist?', 'Ce ai cumpărat ultima dată?'], ['Hvorfor vil du bytte varen?', 'De ce vrei să schimbi produsul?'], ['Har du kvitteringen?', 'Ai bonul?']],
    [['Hvordan er boligen din?', 'Cum este locuința ta?'], ['Hva virker ikke hjemme?', 'Ce nu funcționează acasă?'], ['Hvordan ber du utleieren om hjelp?', 'Cum îi ceri ajutor proprietarului?']],
    [['Hvordan føler du deg i dag?', 'Cum te simți astăzi?'], ['Hvordan bestiller du en legetime?', 'Cum faci o programare la medic?'], ['Hvordan spør du etter hjelp på apoteket?', 'Cum ceri ajutor la farmacie?']],
    [['Hva gjorde du i går?', 'Ce ai făcut ieri?'], ['Hvem møtte du?', 'Cu cine te-ai întâlnit?'], ['Hva gjorde du etterpå?', 'Ce ai făcut după aceea?']],
    [['Hvor lenge har du bodd i Norge?', 'De cât timp locuiești în Norvegia?'], ['Hva har du lært her?', 'Ce ai învățat aici?'], ['Har du prøvd norsk mat?', 'Ai încercat mâncare norvegiană?']],
    [['Hva skal dere gjøre på jobb?', 'Ce veți face la serviciu?'], ['Hvordan ber du en kollega om hjelp?', 'Cum îi ceri ajutor unui coleg?'], ['Når blir oppgaven ferdig?', 'Când va fi gata sarcina?']],
    [['Hvordan bestiller du en time på nettet?', 'Cum faci o programare online?'], ['Hva gjør du hvis du ikke kan logge inn?', 'Ce faci dacă nu te poți conecta?'], ['Hvordan ber du om mer informasjon?', 'Cum ceri mai multe informații?']],
    [['Hva gjorde du i går?', 'Ce ai făcut ieri?'], ['Hva skal du gjøre i morgen?', 'Ce vei face mâine?'], ['Hvordan ber du om hjelp?', 'Cum ceri ajutor?']],
  ],
  B1: [
    [['Hva skjedde på din første dag i Norge?', 'Ce s-a întâmplat în prima ta zi în Norvegia?'], ['Hva skjedde etterpå?', 'Ce s-a întâmplat după aceea?'], ['Hva lærte du av opplevelsen?', 'Ce ai învățat din această experiență?']],
    [['Hva synes du om å lære norsk på nettet?', 'Ce părere ai despre învățarea limbii norvegiene online?'], ['Hvorfor mener du det?', 'De ce crezi asta?'], ['Hva kan gjøre læringen enklere?', 'Ce poate face învățarea mai ușoară?']],
    [['Hva gjør du hvis noe er ødelagt i leiligheten?', 'Ce faci dacă ceva este stricat în apartament?'], ['Hvordan forklarer du problemet til utleieren?', 'Cum îi explici problema proprietarului?'], ['Hvilken løsning ønsker du?', 'Ce soluție îți dorești?']],
    [['Hvilke oppgaver har du på jobb?', 'Ce sarcini ai la serviciu?'], ['Hvordan fordeler dere ansvaret?', 'Cum împărțiți responsabilitățile?'], ['Hva gjør du når du trenger hjelp?', 'Ce faci când ai nevoie de ajutor?']],
    [['Hvilken arbeidserfaring har du?', 'Ce experiență profesională ai?'], ['Hva er du god til?', 'La ce te pricepi?'], ['Hvorfor ønsker du denne jobben?', 'De ce îți dorești acest loc de muncă?']],
    [['Hvordan forklarer du symptomer til legen?', 'Cum îi explici medicului simptomele?'], ['Hvordan spør du om en anbefaling?', 'Cum ceri o recomandare?'], ['Hvordan ber du legen forklare igjen?', 'Cum îi ceri medicului să explice din nou?']],
    [['Hvorfor kontakter du kommunen?', 'De ce contactezi municipalitatea?'], ['Hvordan forklarer du saken din?', 'Cum îți explici situația?'], ['Hvordan avslutter du en formell melding?', 'Cum închei un mesaj formal?']],
    [['Hvilken nyhet har du lest nylig?', 'Ce știre ai citit recent?'], ['Hva var hovedpoenget?', 'Care a fost ideea principală?'], ['Hvordan sjekker du om kilden er pålitelig?', 'Cum verifici dacă sursa este de încredere?']],
    [['Hva synes du om livet i Norge?', 'Ce părere ai despre viața în Norvegia?'], ['Hvordan blir du kjent med nye mennesker?', 'Cum cunoști oameni noi?'], ['Hvilken tradisjon vil du fortelle om?', 'Despre ce tradiție ai vrea să povestești?']],
    [['Hva er et viktig mål for deg?', 'Care este un obiectiv important pentru tine?'], ['Hvilke steg vil du ta?', 'Ce pași vei face?'], ['Hvordan oppsummerer du planen din?', 'Cum îți rezumi planul?']],
  ],
  B2: [
    [['Bør flere jobbe hjemmefra?', 'Ar trebui ca mai mulți oameni să lucreze de acasă?'], ['Hva er et motargument?', 'Care este un contraargument?'], ['Hvilket kompromiss foreslår du?', 'Ce compromis propui?']],
    [['Hvordan foreslår du en endring i et møte?', 'Cum propui o schimbare într-o ședință?'], ['Hvordan gir du konstruktiv tilbakemelding?', 'Cum oferi feedback constructiv?'], ['Hvordan foreslår du et kompromiss?', 'Cum propui un compromis?']],
    [['Hvordan uttrykker du uenighet på en høflig måte?', 'Cum îți exprimi dezacordul politicos?'], ['Hvordan viser du forståelse for den andre?', 'Cum arăți că înțelegi cealaltă persoană?'], ['Hvilken løsning kan begge godta?', 'Ce soluție pot accepta ambele părți?']],
    [['Hva gjør en nyhetskilde troverdig?', 'Ce face ca o sursă de știri să fie credibilă?'], ['Hvordan skiller du fakta fra meninger?', 'Cum deosebești faptele de opinii?'], ['Hvordan undersøker du en usikker påstand?', 'Cum verifici o afirmație nesigură?']],
    [['Hvordan påvirker prisvekst hverdagen?', 'Cum afectează creșterea prețurilor viața cotidiană?'], ['Hvordan kan arbeidslivet endre seg?', 'Cum se poate schimba viața profesională?'], ['Hvilken utvikling mener du er viktigst?', 'Care evoluție crezi că este cea mai importantă?']],
    [['Bør kollektivtransport bli billigere?', 'Ar trebui ca transportul public să devină mai ieftin?'], ['Hva er en mulig ulempe?', 'Care este un posibil dezavantaj?'], ['Hvilket bærekraftig tiltak foreslår du?', 'Ce măsură sustenabilă propui?']],
    [['Hvordan innleder du en formell presentasjon?', 'Cum începi o prezentare formală?'], ['Hvordan begrunner du et forslag?', 'Cum argumentezi o propunere?'], ['Hvordan oppsummerer du hovedpoenget?', 'Cum rezumi ideea principală?']],
    [['Hvordan påvirker språk identiteten vår?', 'Cum ne influențează limba identitatea?'], ['Hva kan vi lære av andre kulturer?', 'Ce putem învăța de la alte culturi?'], ['Hvordan kan vi bevare språklig mangfold?', 'Cum putem păstra diversitatea lingvistică?']],
    [['Hvilke fordeler har kunstig intelligens?', 'Ce avantaje are inteligența artificială?'], ['Hva er en risiko for personvernet?', 'Care este un risc pentru viața privată?'], ['Hvilket tiltak kan redusere risikoen?', 'Ce măsură poate reduce riscul?']],
    [['Hvilken samfunnsendring vil du diskutere?', 'Ce schimbare socială ai vrea să discuți?'], ['Hva er det sterkeste motargumentet?', 'Care este cel mai puternic contraargument?'], ['Hvilken balansert løsning foreslår du?', 'Ce soluție echilibrată propui?']],
  ],
};

const entriesFor = (level, lessonId) => questions[level]?.[lessonId - 1] || null;
const getPreparedQuestions = (level, lessonId) => entriesFor(level, lessonId)?.map(([question]) => question) || null;
const getPreparedQuestionTranslation = (level, lessonId, question) => (
  entriesFor(level, lessonId)?.find(([candidate]) => candidate === question)?.[1] || null
);

module.exports = { getPreparedQuestions, getPreparedQuestionTranslation };
