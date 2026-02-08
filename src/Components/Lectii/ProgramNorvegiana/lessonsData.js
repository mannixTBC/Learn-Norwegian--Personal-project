// Program învățare norvegiană de bază – lecții + exerciții
// Text max ~200 cuvinte, tematică viață de zi cu zi

export const lessons = [
  {
    id: 1,
    title: 'Hei! Salutări și prezentări',
    text: `Anna møter Lars på gaten. «Hei!» sier Anna. «Hei! Hvordan har du det?» spør Lars. «Jeg har det bra, takk. Og du?» svarer Anna. «Bare bra,» sier Lars.

Anna er fra Romania. Hun snakker litt norsk. Lars er norsk. Han hjelper Anna med å lære språket. «Hva heter du?» – «Jeg heter Anna. Og du?» – «Jeg heter Lars. Hyggelig å møte deg!»

Et typisk norsk svar når noen spør hvordan du har det: «Takk, bra» eller «Fint, takk». Norvegienii sunt prietenoși și folosesc multe «takk» (mulțumesc) în conversație.`,
    textRomanian: `Anna îl întâlnește pe Lars pe stradă. „Hei!” spune Anna. „Hei! Cum îți merge?” întreabă Lars. „Îmi merge bine, mulțumesc. Și ție?” răspunde Anna. „Tot bine,” spune Lars.

Anna e din România. Vorbește puțin norvegiană. Lars e norvegian. O ajută pe Anna să învețe limba. „Cum te cheamă?” – „Mă cheamă Anna. Și tu?” – „Mă cheamă Lars. Încântat de cunoștință!”

Un răspuns tipic norvegian când cineva întreabă cum îți merge: „Takk, bra” sau „Fint, takk”. Norvegienii sunt prietenoși și folosesc multe „takk” (mulțumesc) în conversație.`,
    exercises: [
      {
        type: 'fill',
        question: 'Completează: «Hei! ___ har du det?» (Cum îți merge?)',
        answer: 'Hvordan',
        placeholder: 'scrie aici',
      },
      {
        type: 'fill',
        question: 'Cum spui «Mulțumesc» în norvegiană?',
        answer: 'takk',
        placeholder: 'scrie aici',
      },
      {
        type: 'choice',
        question: 'Ce înseamnă «Hyggelig å møte deg»?',
        options: ['La revedere', 'Încântat de cunoștință', 'Cu plăcere'],
        correct: 1,
      },
      {
        type: 'match',
        pairs: [
          ['Hei', 'Salut'],
          ['Jeg heter', 'Mă cheamă'],
          ['Bra', 'Bine'],
        ],
      },
    ],
  },
  {
    id: 2,
    title: 'På kafé – La cafenea',
    text: `Anna går på en kafé. Hun vil ha en kaffe. «Hei, en kaffe, takk,» sier hun til servitøren. «Vil du ha melk?» spør servitøren. «Ja, takk. Og et smørbrød,» sier Anna.

Smørbrød er typisk norsk: brød med smør, ost, skinke eller andre pålegg. Det er vanlig å ta «frokost» (micul dejun) på kafé mellom klokka 10 og 12. Mange nordmenn drikker kaffe flere ganger om dagen.

«Det blir 95 kroner,» sier servitøren. Anna betaler og sier «Takk!» Når du er ferdig, kan du si «Ha en fin dag!» – Să ai o zi frumoasă!`,
    textRomanian: `Anna merge la o cafenea. Vrea o cafea. „Hei, o cafea, mulțumesc,” spune servitorului. „Vrei lapte?” întreabă servitorul. „Da, mulțumesc. Și un sandwich,” spune Anna.

Smørbrød e tipic norvegian: pâine cu unt, brânză, șuncă sau alte toppinguri. E obișnuit să iei micul dejun la cafenea între 10 și 12. Mulți norvegieni beau cafea de mai multe ori pe zi.

„Sunt 95 de coroane,” spune servitorul. Anna plătește și spune „Takk!” Când ai terminat, poți spune „Ha en fin dag!” – Să ai o zi frumoasă!`,
    exercises: [
      {
        type: 'fill',
        question: '«En kaffe, ___» = O cafea, mulțumesc',
        answer: 'takk',
        placeholder: 'scrie aici',
      },
      {
        type: 'choice',
        question: 'Ce este «smørbrød»?',
        options: ['Cafea', 'Sandwich norvegian cu unt și brânză', 'Croissant'],
        correct: 1,
      },
      {
        type: 'choice',
        question: 'Ce spui când pleci de la cafenea?',
        options: ['Hei', 'Ha en fin dag!', 'Melk'],
        correct: 1,
      },
      {
        type: 'match',
        pairs: [
          ['Kaffe', 'Cafea'],
          ['Frokost', 'Micul dejun'],
          ['Kroner', 'Coroane (monedă)'],
        ],
      },
    ],
  },
  {
    id: 3,
    title: 'I butikken – În magazin',
    text: `Anna handler i en matbutikk. Hun trenger melk, brød og epler. «Unnskyld, hvor er melken?» spør hun. «Det er der borte,» sier en ansatt og peker.

I Norge er det vanlig å bruke «unnskyld» når du vil få noens oppmerksomhet. «Hvor mye koster det?» – «Det koster 35 kroner.» Anna legger varene i en handlekurv og går til kassen.

Hun betaler med kort. «Vil du ha kvittering?» – «Ja, takk.» Mange butikker har «selvbetjening» – self-checkout. Du skanner varene selv og betaler med kort.`,
    textRomanian: `Anna cumpără la un magazin alimentar. Are nevoie de lapte, pâine și mere. „Scuzați, unde e laptele?” întreabă ea. „E acolo,” spune un angajat și arată.

În Norvegia e obișnuit să folosești „unnskyld” când vrei să atragi atenția cuiva. „Cât costă?” – „Costă 35 de coroane.” Anna pune produsele într-un coș și merge la casă.

Plătește cu cardul. „Vrei chitanță?” – „Da, mulțumesc.” Multe magazine au „selvbetjening” – casa de marcat self-service. Scanezi singur produsele și plătești cu cardul.`,
    exercises: [
      {
        type: 'fill',
        question: 'Cum spui «Scuzați» în norvegiană?',
        answer: 'Unnskyld',
        placeholder: 'scrie aici',
      },
      {
        type: 'fill',
        question: '«Hvor ___ melken?» = Unde e laptele?',
        answer: 'er',
        placeholder: 'scrie aici',
      },
      {
        type: 'choice',
        question: 'Ce înseamnă «selvbetjening»?',
        options: ['Magazin', 'Self-checkout / casă de marcat self-service', 'Chitanță'],
        correct: 1,
      },
      {
        type: 'match',
        pairs: [
          ['Matbutikk', 'Magazin alimentar'],
          ['Kvittering', 'Chitanță'],
          ['Handlekurv', 'Coș de cumpărături'],
        ],
      },
    ],
  },
  {
    id: 4,
    title: 'Hjemme – Acasă',
    text: `Anna bor i en leilighet i Oslo. Hun står opp klokka sju om morgenen. Først drikker hun kaffe og spiser frokost. Så dusjer hun og kle seg.

Hun jobber hjemmefra to dager i uken. «Jeg jobber hjemmefra i dag» – Lucrez de acasă azi. Når hun er ferdig med jobben, lager hun middag. Hun liker å lage pastaretter.

Om kvelden ser hun på TV eller leser en bok. «God natt!» sier hun når hun legger seg. Norvegienii spiser middag tidlig, ofte rundt klokka fem.`,
    textRomanian: `Anna locuiește într-un apartament în Oslo. Se trezește la 7 dimineața. Mai întâi bea cafea și mănâncă micul dejun. Apoi face duș și se îmbracă.

Lucrează de acasă două zile pe săptămână. „Jeg jobber hjemmefra i dag” – Lucrez de acasă azi. Când termină cu munca, prepară cina. Îi place să facă feluri de paste.

Seara se uită la TV sau citește o carte. „God natt!” spune când se culcă. Norvegienii mănâncă cină devreme, adesea în jurul orei 5.`,
    exercises: [
      {
        type: 'fill',
        question: '«God ___!» = Noapte bună!',
        answer: 'natt',
        placeholder: 'scrie aici',
      },
      {
        type: 'choice',
        question: 'Ce înseamnă «å lage middag»?',
        options: ['A face duș', 'A prepara cina', 'A se culca'],
        correct: 1,
      },
      {
        type: 'match',
        pairs: [
          ['Frokost', 'Micul dejun'],
          ['Leilighet', 'Apartament'],
          ['Hjemmefra', 'De acasă'],
        ],
      },
    ],
  },
  {
    id: 5,
    title: 'På jobb – La serviciu',
    text: `Anna har fått jobb i et kontor. Første dagen møter hun kollegaene sine. «Hei, jeg er den nye,» sier hun. «Velkommen!» svarer sjefen.

Hun lærer raskt. «Kan du sende meg den e-posten?» – Poți să îmi trimiți acel e-mail? «Når er møtet?» – Când e meeting-ul? «Møtet er klokka ti.» – Meeting-ul e la 10.

Norvegienii er stolte av «work-life balance». De jobber ofte til klokka fire og tar lang lunsj. «Ha en fin helg!» sier de på fredag – Să ai un weekend frumos!`,
    textRomanian: `Anna a primit un job la birou. Prima zi îi întâlnește pe colegi. „Hei, sunt noua,” spune ea. „Bine ai venit!” răspunde șeful.

Învață repede. „Kan du sende meg den e-posten?” – Poți să îmi trimiți acel e-mail? „Når er møtet?” – Când e meeting-ul? „Møtet er klokka ti.” – Meeting-ul e la 10.

Norvegienii sunt mândri de „work-life balance”. Lucrează adesea până la 4 și iau pauză de prânz lungă. „Ha en fin helg!” spun vineri – Să ai un weekend frumos!`,
    exercises: [
      {
        type: 'fill',
        question: '«Velkommen!» = ___',
        answer: 'Bine ai venit',
        placeholder: 'scrie în română',
      },
      {
        type: 'choice',
        question: 'Ce înseamnă «møte»?',
        options: ['E-mail', 'Întâlnire / meeting', 'Coleg'],
        correct: 1,
      },
      {
        type: 'match',
        pairs: [
          ['Kollega', 'Coleg'],
          ['E-post', 'E-mail'],
          ['Helg', 'Weekend'],
        ],
      },
    ],
  },
];
