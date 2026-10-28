// Explicit Bokmål participles. Alternatives accepted elsewhere are not distractors.
// Grammar references: https://www.ntnu.edu/learnnow/8/grammar
// https://www.ntnu.edu/learnnow2-hs/2/grammatikk/
export const participles=Object.fromEntries(`
være:vært ha:hatt gjøre:gjort si:sagt gå:gått komme:kommet se:sett vite:visst ville:villet
bruke:brukt finne:funnet spise:spist drikke:drukket søke:søkt treffe:truffet leve:levd
arbeide:arbeidet betale:betalt lære:lært forstå:forstått snakke:snakket lese:lest
skrive:skrevet huske:husket vente:ventet hjelpe:hjulpet spørre:spurt svare:svart åpne:åpnet lukke:lukket
sitte:sittet stå:stått ligge:ligget sove:sovet våke:våket reise:reist flytte:flyttet bo:bodd
bygge:bygd kjøpe:kjøpt selge:solgt få:fått gi:gitt ta:tatt sende:sendt møte:møtt
love:lovet tro:trodd elske:elsket like:likt hate:hatet starte:startet slutte:sluttet
fortsette:fortsatt bestemme:bestemt prøve:prøvd lykkes:lyktes mislykkes:mislyktes behøve:behøvd ønske:ønsket
forlate:forlatt følge:fulgt kjøre:kjørt sykle:syklet svømme:svømt løpe:løpt hoppe:hoppet
falle:falt løfte:løftet bære:båret kle:kledd vaske:vasket tørke:tørket lage:laget røre:rørt
holde:holdt slippe:sluppet smake:smakt kaste:kastet fange:fanget skyte:skutt fly:fløyet
lande:landet seile:seilt klare:klart greie:greid lyve:løyet synes:syntes mene:ment tenke:tenkt
vurdere:vurdert analysere:analysert sammenligne:sammenlignet begrunne:begrunnet hevde:hevdet
argumentere:argumentert påvirke:påvirket bidra:bidratt gjennomføre:gjennomført forhandle:forhandlet
lede:ledet koordinere:koordinert håndtere:håndtert løse:løst forebygge:forebygd påpeke:påpekt
understreke:understreket oppsummere:oppsummert forutsette:forutsatt innebære:innebåret medføre:medført
tolke:tolket formidle:formidlet uttrykke:uttrykt prioritere:prioritert effektivisere:effektivisert
tilrettelegge:tilrettelagt reflektere:reflektert nyansere:nyansert konkludere:konkludert
avklare:avklart antyde:antydet presisere:presisert tone:tonet legge:lagt vise:vist underbygge:underbygd
sammenfalle:sammenfalt sammenstille:sammenstilt trekke:trukket forankre:forankret imøtekomme:imøtekommet
forplikte:forpliktet redegjøre:redegjort bestride:bestridt vedlegge:vedlagt skyldes:skyldtes
utelukke:utelukket veie:veid drøfte:drøftet avgrense:avgrenset oppfatte:oppfattet tilsløre:tilslørt
måtte:måttet komprimere:komprimert forvrenge:forvrengt spisse:spisset avdramatisere:avdramatisert
distansere:distansert sidestille:sidestilt rekonstruere:rekonstruert samtykke:samtykket
tilgjengeliggjøre:tilgjengeliggjort avstemme:avstemt begrense:begrenset svekke:svekket
forsterke:forsterket jevne:jevnet bevare:bevart imøtegå:imøtegått foregripe:foregrepet
omstille:omstilt revidere:revidert integrere:integrert stramme:strammet
`.trim().split(/\s+/u).map(pair=>pair.split(':')));

// Individually authored positive, subject-first frames with no time-bound adverbs,
// negation, inversion or subordinate tense dependency. They deliberately support
// the tense stated by the exercise. They are NOT converted Romanian translations.
// Columns: infinitive | frame | future mode (plan/prediction). Blank is the WHOLE phrase.
const frames=`
være|Hun ___ hjemme.|plan
ha|Hun ___ god tid.|prediction
gjøre|Hun ___ leksene.|plan
si|Hun ___ noen ord om prosjektet.|plan
gå|Hun ___ til skolen.|plan
komme|Bussen ___ til stasjonen.|prediction
se|Hun ___ en film.|plan
vite|Hun ___ svaret.|prediction
ville|Hun ___ lære norsk.|prediction
bruke|Hun ___ datamaskinen.|plan
finne|Hun ___ en løsning.|prediction
spise|Hun ___ middag hjemme.|plan
drikke|Hun ___ te.|plan
søke|Hun ___ jobb i kommunen.|plan
treffe|Hun ___ en venn.|plan
leve|Hun ___ et godt liv.|prediction
arbeide|Hun ___ på hotellet.|plan
betale|Hun ___ regningen.|plan
lære|Hun ___ norsk.|plan
forstå|Hun ___ forklaringen.|prediction
snakke|Hun ___ med læreren.|plan
lese|Hun ___ denne boken.|plan
skrive|Hun ___ et brev.|plan
huske|Hun ___ navnet.|prediction
vente|Hun ___ på bussen.|plan
hjelpe|Hun ___ naboen.|plan
spørre|Hun ___ læreren om hjelp.|plan
svare|Hun ___ på spørsmålet.|plan
åpne|Hun ___ vinduet.|plan
lukke|Hun ___ døren.|plan
sitte|Hun ___ ved vinduet.|plan
stå|Hun ___ ved inngangen.|plan
ligge|Boken ___ på bordet.|prediction
sove|Barnet ___ i sengen.|prediction
våke|Hun ___ over barnet.|plan
reise|Hun ___ til Bergen.|plan
flytte|Hun ___ til Oslo.|plan
bo|Hun ___ i Tromsø.|plan
bygge|Hun ___ et hus.|plan
kjøpe|Hun ___ en bok.|plan
selge|Hun ___ bilen.|plan
få|Hun ___ en gave.|prediction
gi|Hun ___ ham en bok.|plan
ta|Hun ___ toget til Oslo.|plan
sende|Hun ___ en e-post.|plan
møte|Hun ___ kollegaene.|plan
love|Hun ___ å hjelpe.|plan
tro|Hun ___ på forklaringen.|prediction
elske|Hun ___ dette stedet.|prediction
like|Hun ___ maten.|prediction
hate|Hun ___ denne oppgaven.|prediction
starte|Hun ___ et nytt prosjekt.|plan
slutte|Hun ___ i denne jobben.|plan
fortsette|Hun ___ med arbeidet.|plan
bestemme|Hun ___ tidspunktet.|plan
prøve|Hun ___ å løse oppgaven.|plan
lykkes|Hun ___ med prosjektet.|prediction
mislykkes|Forsøket ___ uten riktig utstyr.|prediction
behøve|Hun ___ mer hjelp.|prediction
ønske|Hun ___ seg en sykkel.|prediction
forlate|Hun ___ kontoret.|plan
følge|Hun ___ instruksjonene.|plan
kjøre|Hun ___ til jobb.|plan
sykle|Hun ___ til skolen.|plan
svømme|Hun ___ i bassenget.|plan
løpe|Hun ___ i parken.|plan
hoppe|Hun ___ over en stein.|plan
falle|Bladene ___ fra trærne.|prediction
løfte|Hun ___ esken.|plan
bære|Hun ___ sekken.|plan
kle|Hun ___ barnet.|plan
vaske|Hun ___ bilen.|plan
tørke|Hun ___ bordet.|plan
lage|Hun ___ middag.|plan
røre|Hun ___ ved den kalde ruten.|plan
holde|Hun ___ døren åpen.|plan
slippe|Hun ___ hunden ut.|plan
smake|Hun ___ på suppen.|plan
kaste|Hun ___ ballen.|plan
fange|Hunden ___ ballen.|prediction
skyte|Hun ___ mot målet.|plan
fly|Hun ___ til Tromsø.|plan
lande|Flyet ___ på flyplassen.|prediction
seile|Hun ___ langs kysten.|plan
klare|Hun ___ å løse problemet.|prediction
greie|Hun ___ å bære kassen.|prediction
lyve|Hun ___ om hendelsen.|prediction
synes|Hun ___ godt om forslaget.|prediction
mene|Hun ___ det samme som kollegaen.|prediction
tenke|Hun ___ på forslaget.|plan
vurdere|Hun ___ to ulike løsninger.|plan
analysere|Hun ___ resultatene fra undersøkelsen.|plan
sammenligne|Hun ___ resultatene med tidligere funn.|plan
begrunne|Hun ___ valget med konkrete eksempler.|plan
hevde|Hun ___ at avtalen fortsatt gjelder.|plan
argumentere|Hun ___ for en annen løsning.|plan
påvirke|Endringen ___ hele avdelingen.|prediction
bidra|Hun ___ med egne erfaringer.|plan
gjennomføre|Hun ___ undersøkelsen.|plan
forhandle|Hun ___ med leverandøren.|plan
lede|Hun ___ arbeidsgruppen.|plan
koordinere|Hun ___ transporten til arrangementet.|plan
håndtere|Hun ___ klagene fra brukerne.|plan
løse|Hun ___ problemet gjennom dialog.|plan
forebygge|Opplæringen ___ ulykker.|prediction
påpeke|Hun ___ feilene i rapporten.|plan
understreke|Hun ___ behovet for bedre dokumentasjon.|plan
oppsummere|Hun ___ diskusjonen i et notat.|plan
forutsette|Avtalen ___ samarbeid mellom partene.|prediction
innebære|Jobben ___ mye reising.|prediction
medføre|Endringen ___ ekstra kostnader.|prediction
tolke|Hun ___ svaret som et avslag.|prediction
formidle|Hun ___ informasjonen til de ansatte.|plan
uttrykke|Hun ___ støtte til forslaget.|plan
prioritere|Hun ___ oppgavene med kortest frist.|plan
effektivisere|Hun ___ arbeidet med et nytt system.|plan
tilrettelegge|Hun ___ arbeidsplassen for en ny kollega.|plan
reflektere|Hun ___ over erfaringene fra prosjektet.|plan
nyansere|Hun ___ kritikken med konkrete eksempler.|plan
konkludere|Hun ___ på grunnlag av dokumentasjonen.|plan
ta hensyn til|Hun ___ naboene under planleggingen.|plan
avklare|Hun ___ forventningene til prosjektet.|plan
antyde|Hun ___ en mulig løsning på problemet.|plan
presisere|Hun ___ vilkårene for avtalen.|plan
tone ned|Hun ___ den bastante formuleringen.|plan
legge vekt på|Hun ___ praktisk erfaring.|plan
vise til|Hun ___ tidligere forskning.|plan
underbygge|Hun ___ påstanden med konkrete tall.|plan
ta høyde for|Hun ___ sesongvariasjon i beregningen.|plan
sammenfalle med|Økningen ___ skolestarten.|prediction
sammenstille|Hun ___ tallene med brukernes erfaringer.|plan
trekke en slutning|Hun ___ på grunnlag av opplysningene.|plan
forankre|Hun ___ endringen i organisasjonen.|plan
følge opp|Hun ___ avtalene med leverandøren.|plan
imøtekomme|Hun ___ ønsket om mer opplæring.|plan
forplikte seg til|Hun ___ å rette feilene.|plan
være innstilt på|Hun ___ å prøve en annen modell.|prediction
komme til enighet|Partene ___ om en prøveperiode.|prediction
redegjøre for|Hun ___ endringene i vedlegget.|plan
bestride|Hun ___ vurderingen av tidsbruken.|plan
vedlegge|Hun ___ en oversikt over endringene.|plan
skyldes|Nedgangen ___ flere forhold.|prediction
bidra til|Hun ___ økt deltakelse.|plan
utelukke|Hun ___ en annen forklaring.|prediction
veie opp for|Gevinsten ___ merkostnaden.|prediction
drøfte|Hun ___ fordeler og begrensninger.|plan
avgrense|Hun ___ teksten til det sentrale spørsmålet.|plan
oppfatte|Hun ___ svaret som et avslag.|prediction
legge føringer for|Ordvalget ___ tolkningen av teksten.|prediction
tilsløre|Formuleringen ___ ansvarsfordelingen.|prediction
måtte antas|Det ___ at informasjonen er ufullstendig.|prediction
komprimere|Hun ___ bakgrunnen uten å fjerne forbeholdene.|plan
være dekkende|Overskriften ___ for innholdet.|prediction
forvrenge|Sitatet ___ budskapet.|prediction
spisse|Hun ___ formuleringen for å tydeliggjøre konflikten.|plan
avdramatisere|Hun ___ uenigheten med et konkret eksempel.|plan
distansere seg fra|Hun ___ den offisielle forklaringen.|plan
antyde uten å fastslå|Hun ___ en mulig sammenheng.|plan
sidestille|Hun ___ de to forslagene.|plan
rekonstruere|Hun ___ argumentet fra de opprinnelige kildene.|plan
veie kilder|Hun ___ etter relevans og metode.|plan
samtykke|Hun ___ til bruken av opplysningene.|plan
tilgjengeliggjøre|Hun ___ rapporten med eksempler og forklaringer.|plan
avstemme forståelsen|Hun ___ med kollegaene gjennom konkrete eksempler.|plan
begrense inngrepet|Hun ___ til det nødvendige.|plan
svekke|Manglende dokumentasjon ___ argumentet.|prediction
forsterke|Den skarpe tonen ___ konflikten.|prediction
jevne ut|Ordningen ___ forskjellene mellom gruppene.|prediction
bevare egenart|Hun ___ under bearbeidingen av teksten.|plan
imøtegå|Hun ___ innvendingen med dokumenterte eksempler.|plan
foregripe|Hun ___ en mulig misforståelse.|plan
omstille seg|Hun ___ til nye krav.|plan
holde stand|Argumentet ___ under kritisk gjennomgang.|prediction
revidere|Hun ___ anbefalingen i lys av kritikken.|plan
integrere|Hun ___ motargumentet i den endelige teksten.|plan
ta stilling til|Hun ___ forslaget etter høringen.|plan
gjøre rede for|Hun ___ bruken av kildene.|plan
stramme inn|Hun ___ teksten uten å fjerne forbeholdet.|plan
`;
export const verbFrames=Object.fromEntries(frames.trim().split('\n').map(line=>{const[id,sentence,futureMode]=line.split('|');return[id,{sentence,futureMode}];}));
// Passive is offered only for these authored transitive contexts, never for all verbs.
export const passiveFrames={
 lese:'Brevet ___ av læreren.',skrive:'Rapporten ___ av sekretæren.',kjøpe:'Bilen ___ av naboen.',selge:'Huset ___ av eieren.',bygge:'Huset ___ av firmaet.',betale:'Regningen ___ av kunden.',åpne:'Døren ___ av læreren.',lukke:'Vinduet ___ av naboen.',sende:'Brevet ___ av sekretæren.',vaske:'Bilen ___ av eieren.',lage:'Middagen ___ av kokken.',vurdere:'Forslaget ___ av utvalget.',analysere:'Resultatene ___ av forskeren.',begrunne:'Valget ___ av lederen.',gjennomføre:'Undersøkelsen ___ av skolen.',lede:'Møtet ___ av lederen.',løse:'Problemet ___ av gruppen.',oppsummere:'Diskusjonen ___ av møtelederen.',tolke:'Svaret ___ av saksbehandleren.',formidle:'Budskapet ___ av læreren.',prioritere:'Oppgaven ___ av lederen.',avklare:'Forventningene ___ av prosjektlederen.',presisere:'Vilkårene ___ av juristen.',drøfte:'Forslaget ___ av utvalget.',revidere:'Rapporten ___ av forfatteren.',integrere:'Motargumentet ___ i teksten av forfatteren.'
};
// Additional verbs/phrases taught by the curriculum but absent from the old verb game.
// Explicit head forms allow particles and reflexive pronouns to stay attached.
export const supplementalHeads=Object.fromEntries(`
bevare|bevarer|bevarte|bevart
jobbe|jobber|jobbet|jobbet
høre|hører|hørte|hørt
bli|blir|ble|blitt
besøke|besøker|besøkte|besøkt
bytte|bytter|byttet|byttet
returnere|returnerer|returnerte|returnert
reparere|reparerer|reparerte|reparert
avbestille|avbestiller|avbestilte|avbestilt
forklare|forklarer|forklarte|forklart
samarbeide|samarbeider|samarbeidet|samarbeidet
kontrollere|kontrollerer|kontrollerte|kontrollert
logge|logger|logget|logget
fylle|fyller|fylte|fylt
mangle|mangler|manglet|manglet
rekke|rekker|rakk|rukket
oppleve|opplever|opplevde|opplevd
skje|skjer|skjedde|skjedd
føle|føler|følte|følt
forvente|forventer|forventet|forventet
foretrekke|foretrekker|foretrakk|foretrukket
anbefale|anbefaler|anbefalte|anbefalt
melde|melder|meldte|meldt
avtale|avtaler|avtalte|avtalt
foreslå|foreslår|foreslo|foreslått
mestre|mestrer|mestret|mestret
øve|øver|øvde|øvd
utvikle|utvikler|utviklet|utviklet
be|ber|ba|bedt
dokumentere|dokumenterer|dokumenterte|dokumentert
tilpasse|tilpasser|tilpasset|tilpasset
forbedre|forbedrer|forbedret|forbedret
nå|når|nådde|nådd
påstå|påstår|påsto|påstått
anerkjenne|anerkjenner|anerkjente|anerkjent
skille|skiller|skilte|skilt
gjengi|gjengir|gjenga|gjengitt
henge|henger|hang|hengt
samsvare|samsvarer|samsvarte|samsvart
investere|investerer|investerte|investert
overvåke|overvåker|overvåket|overvåket
omformulere|omformulerer|omformulerte|omformulert
ivareta|ivaretar|ivaretok|ivaretatt
megle|megler|meglet|meglet
skifte|skifter|skiftet|skiftet
utdype|utdyper|utdypet|utdypet
`.trim().split('\n').map(line=>{const[id,present,past,participle]=line.split('|');return[id,{present,past,participle}];}));
const extraFrames=`
stå opp|Hun ___ tidlig.|plan
jobbe|Hun ___ på sykehuset.|plan
gå en tur|Hun ___ i parken.|plan
høre på musikk|Hun ___ hjemme.|plan
bli med|Hun ___ på turen.|plan
bli kjent|Hun ___ med naboene.|prediction
besøke|Hun ___ familien.|plan
bytte|Hun ___ jakken i butikken.|plan
returnere|Hun ___ varen.|plan
reparere|Hun ___ sykkelen.|plan
flytte en time|Hun ___ hos tannlegen.|plan
avbestille|Hun ___ billetten.|plan
ta med|Hun ___ en varm jakke.|plan
forklare|Hun ___ problemet for læreren.|plan
samarbeide|Hun ___ med kollegaene.|plan
gi beskjed|Hun ___ om endringen.|plan
kontrollere|Hun ___ opplysningene.|plan
si fra|Hun ___ om feilen.|plan
vente på|Hun ___ svar fra kommunen.|plan
logge inn|Hun ___ på nettsiden.|plan
sende inn|Hun ___ søknaden.|plan
fylle ut|Hun ___ skjemaet.|plan
mangle|Hun ___ en viktig opplysning.|prediction
rekke|Hun ___ bussen.|prediction
oppleve|Hun ___ noe nytt på reisen.|prediction
skje|Endringen ___ gradvis.|prediction
bli overrasket|Hun ___ over resultatet.|prediction
føle seg|Hun ___ trygg i gruppen.|prediction
forvente|Hun ___ et tydelig svar.|prediction
lære av|Hun ___ erfaringene sine.|prediction
være enig|Hun ___ i forslaget.|prediction
være uenig|Hun ___ i vurderingen.|prediction
foretrekke|Hun ___ den enkleste løsningen.|prediction
anbefale|Hun ___ denne boken.|plan
melde fra|Hun ___ om hendelsen.|plan
avtale|Hun ___ et nytt møte.|plan
foreslå|Hun ___ en annen løsning.|plan
mestre|Hun ___ oppgaven.|prediction
øve på|Hun ___ uttalen.|plan
utvikle seg|Hun ___ gjennom arbeidet.|prediction
be om veiledning|Hun ___ før neste oppgave.|plan
dokumentere|Hun ___ erfaringen sin.|plan
tilpasse seg|Hun ___ nye krav.|prediction
bidra med|Hun ___ egne erfaringer.|plan
ta ansvar for|Hun ___ planleggingen.|plan
forbedre|Hun ___ teksten med konkrete eksempler.|plan
nå et mål|Hun ___ gjennom målrettet arbeid.|prediction
påstå|Hun ___ at løsningen er trygg.|plan
anerkjenne|Hun ___ kollegaens innsats.|plan
komme fram til|Hun ___ en løsning gjennom dialog.|prediction
skille mellom|Hun ___ fakta og vurderinger.|plan
gjengi|Hun ___ hovedinnholdet med egne ord.|plan
henge sammen med|Endringen ___ utviklingen i samfunnet.|prediction
samsvare med|Resultatet ___ forventningene.|prediction
investere|Hun ___ i nytt utstyr.|plan
overvåke|Hun ___ utviklingen i prosjektet.|plan
bevare|Hun ___ den opprinnelige betydningen.|plan
ta for gitt|Hun ___ støtten fra kollegaene.|prediction
gi uttrykk for|Hun ___ bekymring for utviklingen.|plan
omformulere|Hun ___ setningen for å gjøre den tydeligere.|plan
ivareta|Hun ___ interessene til begge parter.|plan
megle|Hun ___ mellom partene i konflikten.|plan
skifte register|Hun ___ i samtalen med ledelsen.|plan
utdype|Hun ___ begrunnelsen med et eksempel.|plan
holde fast ved|Hun ___ den opprinnelige vurderingen.|plan
ta ordet|Hun ___ under møtet.|plan
`;
for(const line of extraFrames.trim().split('\n')){const[id,sentence,futureMode]=line.split('|');verbFrames[id]={sentence,futureMode};}
export const commonVerbTranslations={hete:'a se numi',trenge:'a avea nevoie de'};
supplementalHeads.hete={present:'heter',past:'het',participle:'hett'};
supplementalHeads.trenge={present:'trenger',past:'trengte',participle:'trengt'};
verbFrames.hete={sentence:'Barnet ___ Nora.',futureMode:'prediction'};
verbFrames.trenge={sentence:'Hun ___ mer tid.',futureMode:'prediction'};
