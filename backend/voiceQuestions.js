// Prepared Bokmål questions. Audio is shared by all learners; no LLM call is needed here.
const questions = {
  A1: [
    ['Hva heter du?', 'Hvordan har du det?', 'Kan du presentere deg?'],
    ['Hva vil du bestille?', 'Vil du ha kaffe eller te?', 'Vil du ha et smørbrød?'],
    ['Hvor er kaffen?', 'Hvor mye koster den?', 'Vil du ha en kvittering?'],
    ['Når står du opp?', 'Hva spiser du til frokost?', 'Hva gjør du om kvelden?'],
    ['Hva heter kollegaen din?', 'Når begynner møtet?', 'Kan du hjelpe meg?'],
    ['Hvem bor du sammen med?', 'Har du søsken?', 'Hvordan er familien din?'],
    ['Hvilken dag er det i dag?', 'Hva er klokka?', 'Når kan vi møtes?'],
    ['Hvordan er været i dag?', 'Hva har du på deg?', 'Hva bruker du når det regner?'],
    ['Hvordan kommer du til jobb?', 'Hvor er bussholdeplassen?', 'Når går bussen?'],
    ['Hva gjør du om morgenen?', 'Hva vil du bestille til lunsj?', 'Hva gjør du etter jobb?'],
  ],
  A2: [
    ['Hva skal du gjøre i helgen?', 'Vil du bli med på kafé?', 'Når passer det å møtes?'],
    ['Hvordan reiser du til jobb?', 'Hva gjør du hvis bussen er forsinket?', 'Hvordan forklarer du at du kommer sent?'],
    ['Hva kjøpte du sist?', 'Hvorfor vil du bytte varen?', 'Har du kvitteringen?'],
    ['Hvordan er boligen din?', 'Hva virker ikke hjemme?', 'Hvordan ber du utleieren om hjelp?'],
    ['Hvordan føler du deg i dag?', 'Hvordan bestiller du en legetime?', 'Hvordan spør du etter hjelp på apoteket?'],
    ['Hva gjorde du i går?', 'Hvem møtte du?', 'Hva gjorde du etterpå?'],
    ['Hvor lenge har du bodd i Norge?', 'Hva har du lært her?', 'Har du prøvd norsk mat?'],
    ['Hva skal dere gjøre på jobb?', 'Hvordan ber du en kollega om hjelp?', 'Når blir oppgaven ferdig?'],
    ['Hvordan bestiller du en time på nettet?', 'Hva gjør du hvis du ikke kan logge inn?', 'Hvordan ber du om mer informasjon?'],
    ['Hva gjorde du i går?', 'Hva skal du gjøre i morgen?', 'Hvordan ber du om hjelp?'],
  ],
  B1: [
    ['Hva skjedde på din første dag i Norge?', 'Hva skjedde etterpå?', 'Hva lærte du av opplevelsen?'],
    ['Hva synes du om å lære norsk på nettet?', 'Hvorfor mener du det?', 'Hva kan gjøre læringen enklere?'],
    ['Hva gjør du hvis noe er ødelagt i leiligheten?', 'Hvordan forklarer du problemet til utleieren?', 'Hvilken løsning ønsker du?'],
    ['Hvilke oppgaver har du på jobb?', 'Hvordan fordeler dere ansvaret?', 'Hva gjør du når du trenger hjelp?'],
    ['Hvilken arbeidserfaring har du?', 'Hva er du god til?', 'Hvorfor ønsker du denne jobben?'],
    ['Hvordan forklarer du symptomer til legen?', 'Hvordan spør du om en anbefaling?', 'Hvordan ber du legen forklare igjen?'],
    ['Hvorfor kontakter du kommunen?', 'Hvordan forklarer du saken din?', 'Hvordan avslutter du en formell melding?'],
    ['Hvilken nyhet har du lest nylig?', 'Hva var hovedpoenget?', 'Hvordan sjekker du om kilden er pålitelig?'],
    ['Hva synes du om livet i Norge?', 'Hvordan blir du kjent med nye mennesker?', 'Hvilken tradisjon vil du fortelle om?'],
    ['Hva er et viktig mål for deg?', 'Hvilke steg vil du ta?', 'Hvordan oppsummerer du planen din?'],
  ],
  B2: [
    ['Bør flere jobbe hjemmefra?', 'Hva er et motargument?', 'Hvilket kompromiss foreslår du?'],
    ['Hvordan foreslår du en endring i et møte?', 'Hvordan gir du konstruktiv tilbakemelding?', 'Hvordan foreslår du et kompromiss?'],
    ['Hvordan uttrykker du uenighet på en høflig måte?', 'Hvordan viser du forståelse for den andre?', 'Hvilken løsning kan begge godta?'],
    ['Hva gjør en nyhetskilde troverdig?', 'Hvordan skiller du fakta fra meninger?', 'Hvordan undersøker du en usikker påstand?'],
    ['Hvordan påvirker prisvekst hverdagen?', 'Hvordan kan arbeidslivet endre seg?', 'Hvilken utvikling mener du er viktigst?'],
    ['Bør kollektivtransport bli billigere?', 'Hva er en mulig ulempe?', 'Hvilket bærekraftig tiltak foreslår du?'],
    ['Hvordan innleder du en formell presentasjon?', 'Hvordan begrunner du et forslag?', 'Hvordan oppsummerer du hovedpoenget?'],
    ['Hvordan påvirker språk identiteten vår?', 'Hva kan vi lære av andre kulturer?', 'Hvordan kan vi bevare språklig mangfold?'],
    ['Hvilke fordeler har kunstig intelligens?', 'Hva er en risiko for personvernet?', 'Hvilket tiltak kan redusere risikoen?'],
    ['Hvilken samfunnsendring vil du diskutere?', 'Hva er det sterkeste motargumentet?', 'Hvilken balansert løsning foreslår du?'],
  ],
};

const getPreparedQuestions = (level, lessonId) => questions[level]?.[lessonId - 1] || null;
module.exports = { getPreparedQuestions };
