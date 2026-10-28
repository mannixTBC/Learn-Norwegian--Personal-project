// Explicit Bokmål preterite forms; never infer irregular conjugations from spelling.
// Multiword verbs retain their authored particles and complements.
export const pastForms = Object.fromEntries(`
være:var ha:hadde gjøre:gjorde si:sa gå:gikk komme:kom se:så vite:visste ville:ville
bruke:brukte finne:fant spise:spiste drikke:drakk søke:søkte treffe:traff leve:levde
arbeide:arbeidet betale:betalte lære:lærte forstå:forsto snakke:snakket lese:leste
skrive:skrev huske:husket vente:ventet hjelpe:hjalp spørre:spurte svare:svarte åpne:åpnet lukke:lukket
sitte:satt stå:sto ligge:lå sove:sov våke:våket reise:reiste flytte:flyttet bo:bodde
bygge:bygde kjøpe:kjøpte selge:solgte få:fikk gi:ga ta:tok sende:sendte møte:møtte
love:lovet tro:trodde elske:elsket like:likte hate:hatet starte:startet slutte:sluttet
fortsette:fortsatte bestemme:bestemte prøve:prøvde lykkes:lyktes mislykkes:mislyktes behøve:behøvde ønske:ønsket
forlate:forlot følge:fulgte kjøre:kjørte sykle:syklet svømme:svømte løpe:løp hoppe:hoppet
falle:falt løfte:løftet bære:bar kle:kledde vaske:vasket tørke:tørket lage:laget røre:rørte
holde:holdt slippe:slapp smake:smakte kaste:kastet fange:fanget skyte:skjøt fly:fløy
lande:landet seile:seilte klare:klarte greie:greide lyve:løy synes:syntes mene:mente tenke:tenkte
vurdere:vurderte analysere:analyserte sammenligne:sammenlignet begrunne:begrunnet hevde:hevdet
argumentere:argumenterte påvirke:påvirket bidra:bidro gjennomføre:gjennomførte forhandle:forhandlet
lede:ledet koordinere:koordinerte håndtere:håndterte løse:løste forebygge:forebygde påpeke:påpekte
understreke:understreket oppsummere:oppsummerte forutsette:forutsatte innebære:innebar medføre:medførte
tolke:tolket formidle:formidlet uttrykke:uttrykte prioritere:prioriterte effektivisere:effektiviserte
tilrettelegge:tilrettela reflektere:reflekterte nyansere:nyanserte konkludere:konkluderte
avklare:avklarte antyde:antydet presisere:presiserte tone:tonet legge:la vise:viste underbygge:underbygde
sammenfalle:sammenfalt sammenstille:sammenstilte trekke:trakk forankre:forankret imøtekomme:imøtekom
forplikte:forpliktet redegjøre:redegjorde bestride:bestred vedlegge:vedla skyldes:skyldtes
utelukke:utelukket veie:veide drøfte:drøftet avgrense:avgrenset oppfatte:oppfattet tilsløre:tilslørte
måtte:måtte komprimere:komprimerte forvrenge:forvrengte spisse:spisset avdramatisere:avdramatiserte
distansere:distanserte sidestille:sidestilte rekonstruere:rekonstruerte samtykke:samtykket
tilgjengeliggjøre:tilgjengeliggjorde avstemme:avstemte begrense:begrenset svekke:svekket
forsterke:forsterket jevne:jevnet bevare:bevarte imøtegå:imøtegikk foregripe:foregrep
omstille:omstilte revidere:reviderte integrere:integrerte stramme:strammet
`.trim().split(/\s+/u).map(pair => pair.split(':')));

export function getVerbFormChoices(verb) {
  const infinitive = verb.norwegian.replace(/^å\s+/u, '');
  const [head, ...tail] = infinitive.split(' ');
  if (!pastForms[head]) throw new RangeError(`Missing authored verb form: ${head}`);
  const past = [pastForms[head], ...tail].join(' ');
  // s-verbs can share infinitive/present; modals can share infinitive/past.
  // The explicit infinitive marker gives a third distinct, genuine form.
  return [...new Set([verb.recall.answer, infinitive, past, verb.norwegian])].slice(0, 3);
}
