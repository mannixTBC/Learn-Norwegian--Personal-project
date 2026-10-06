import { b1Lessons as b1SourceLessons } from './b1Content';
import { b2Lessons as b2CoreLessons } from './b2Content';
import { b2ExtraLessons } from './b2ExtraContent';

const lessonById = (lessons, id) => lessons.find((lesson) => lesson.id === id);

const selectVocabulary = (vocabulary, indexes) => (
  indexes ? indexes.map((index) => vocabulary[index]).filter(Boolean) : vocabulary.slice(0, 6)
);

const buildProgressiveLevel = ({ source, sequence, enhancements, vocabularySelection = {} }) => (
  sequence.map((sourceId, index) => {
    const sourceLesson = lessonById(source, sourceId);
    const enhancement = enhancements[sourceId] || {};

    return {
      ...sourceLesson,
      ...enhancement,
      id: index + 1,
      vocabulary: selectVocabulary(sourceLesson.vocabulary, vocabularySelection[sourceId]),
    };
  })
);

const b1Enhancements = {
  1: {
    title: 'Experiențe și povești coerente',
    buildsOn: 'Reiei preteritul și perfectul din ultimele lecții A2. Pasul nou este să alegi timpul potrivit și să legi evenimentele într-o poveste ușor de urmărit.',
  },
  2: {
    title: 'Opinii, motive și soluții',
    buildsOn: 'Pornești de la „fordi”, folosit la colaborarea din A2. Acum adaugi rezultatul cu „derfor” și contrastul cu „selv om”.',
  },
  6: {
    title: 'Probleme, reclamații și rezolvări',
    buildsOn: 'Continui situațiile despre retururi și locuință din A2. În loc să descrii doar problema, înveți să o documentezi și să ceri o soluție clară.',
  },
  3: {
    title: 'Colaborare și responsabilități la serviciu',
    buildsOn: 'Reiei cererile, clarificările și sarcinile de echipă din A2. Acum explici responsabilități, termene și procese profesionale.',
    grammar: {
      title: 'Pasivul pentru procese și termene',
      rule: 'Ai întâlnit pasivul în reclamații. Aici îl folosești sistematic pentru procese profesionale: „bli” + participiu descrie ce se întâmplă, iar forma în „-s” apare des în instrucțiuni și termene.',
      examples: ['Rapporten blir sendt i dag. — Raportul este trimis astăzi.', 'Søknaden må leveres innen fredag. — Cererea trebuie depusă până vineri.'],
      wrong: 'Rapporten blir sende i dag.',
    },
  },
  4: {
    title: 'Competențe, CV și interviu',
    buildsOn: 'Combini vocabularul despre muncă din A1–A2 cu experiențele povestite la începutul nivelului B1. Acum îți prezinți competențele și răspunzi argumentat la interviu.',
  },
  5: {
    title: 'Sănătate și recomandări explicate',
    buildsOn: 'În A2 ai descris simptome și ai înțeles recomandări simple. Acum explici durata, evoluția și redai ce a spus medicul.',
  },
  9: {
    title: 'Servicii publice și mesaje formale',
    buildsOn: 'Reiei formularele și autentificarea din A2. Pasul nou este să urmărești o cerere și să formulezi întrebări indirecte într-un mesaj politicos.',
  },
  7: {
    title: 'Știri, surse și rezumate',
    buildsOn: 'Folosești opiniile și conectorii exersați mai devreme, dar separi acum informația verificată de interpretare și precizezi sursa.',
  },
  8: {
    title: 'Cultură, relații și integrare',
    buildsOn: 'Extinzi conversațiile despre persoane și viața în Norvegia. Acum descrii adaptarea, apartenența și experiențele interculturale fără generalizări.',
  },
  10: {
    title: 'B1 în viața reală',
    buildsOn: 'Recapitulezi povestirea, argumentarea, comunicarea profesională și mesajele formale. Lecția nu introduce o structură obligatorie nouă.',
    grammar: {
      title: 'Recapitulare: o prezentare clară',
      rule: 'Reutilizează structurile B1: ordonează ideile, explică motivele, oferă un exemplu și încheie cu o concluzie. Accentul este pe fluență și coerență, nu pe o regulă nouă.',
      examples: ['Først vil jeg presentere temaet. — Mai întâi voi prezenta tema.', 'Til slutt vil jeg trekke en konklusjon. — La final voi formula o concluzie.'],
      wrong: 'Først jeg vil presentere temaet.',
    },
  },
};

const b1VocabularySelection = {
  1: [0, 1, 2, 3, 4, 7],
  2: [0, 1, 2, 5, 6, 7],
  3: [0, 1, 2, 4, 5, 6],
  4: [0, 1, 2, 4, 5, 7],
  5: [0, 1, 2, 3, 5, 7],
  6: [0, 1, 2, 4, 5, 7],
  7: [0, 1, 2, 3, 4, 7],
  8: [0, 1, 2, 3, 4, 5],
  9: [0, 1, 2, 3, 4, 6],
  10: [0, 1, 2, 3, 4, 5],
};

export const progressiveB1Lessons = buildProgressiveLevel({
  source: b1SourceLessons,
  sequence: [1, 2, 6, 3, 4, 5, 9, 7, 8, 10],
  enhancements: b1Enhancements,
  vocabularySelection: b1VocabularySelection,
});

const b2Enhancements = {
  1: {
    title: 'Argumente echilibrate și contraargumente',
    buildsOn: 'Pornești de la opiniile și prezentarea finală B1. Acum cântărești două perspective, formulezi rezerve și răspunzi unui contraargument.',
    grammar: {
      title: 'Conectori avansați și ordinea V2',
      rule: 'Regula V2 este deja cunoscută. La B2 o aplici după conectori precum „likevel”, „derimot” și „derfor”, chiar și în argumente mai lungi.',
      examples: ['Likevel fortsatte de arbeidet. — Totuși, au continuat munca.', 'Derfor må vi vurdere alternativene. — De aceea trebuie să evaluăm alternativele.'],
      wrong: 'Likevel de fortsatte arbeidet.',
    },
  },
  2: {
    title: 'Ședințe, negocieri și feedback',
    buildsOn: 'Reiei responsabilitățile și termenele din B1. Acum alegi un registru mai precis pentru ședințe, negocieri și feedback constructiv.',
    grammar: {
      title: 'Nuanțe ale pasivului profesional',
      rule: 'La B1 ai format pasivul. Aici alegi forma după intenție: „bli” + participiu scoate în evidență procesul, iar „-s” comprimă informația în texte și instrucțiuni formale.',
      examples: ['Rapporten blir vurdert i morgen. — Raportul va fi evaluat mâine.', 'Søknaden behandles fortløpende. — Cererea este procesată continuu.'],
      wrong: 'Rapporten vurderer i morgen.',
    },
  },
  6: {
    title: 'Conflicte și soluții diplomatice',
    buildsOn: 'Folosești limbajul de colaborare din lecția anterioară. Pasul nou este să atenuezi dezacordul, să recunoști perspectiva celuilalt și să negociezi un compromis.',
  },
  3: {
    title: 'Media, surse și analiză critică',
    buildsOn: 'La B1 ai indicat sursa și ai rezumat o știre. Acum evaluezi credibilitatea, observi perspectiva și formulezi concluzii prudente.',
  },
  7: {
    title: 'Economie, muncă și tendințe',
    buildsOn: 'Combini vocabularul profesional cu analiza surselor. Acum explici tendințe și legături mai precise dintre cauze și consecințe.',
  },
  4: {
    title: 'Climă, sustenabilitate și decizii',
    buildsOn: 'Aplici argumentarea echilibrată și relațiile cauză–efect unui subiect complex. Accentul cade pe compromisuri și consecințe pe termen lung.',
    grammar: {
      title: 'Concesie și consecințe complexe',
      rule: 'Folosește „til tross for at” pentru concesie, „samtidig som” pentru acțiuni paralele și „uten at” pentru o consecință pe care vrei să o eviți.',
      examples: ['Til tross for at tiltaket er dyrt, kan det være nødvendig. — Deși măsura este scumpă, poate fi necesară.', 'Vi må kutte utslipp uten at forskjellene øker. — Trebuie să reducem emisiile fără să crească inegalitățile.'],
      wrong: 'Til tross for at tiltaket er dyrt, men det er nødvendig.',
    },
    exercises: [
      { type: 'choice', prompt: 'Ce expresie introduce o concesie într-un registru mai formal?', options: ['Som følge av', 'Til tross for at', 'Dermed'], answer: 1, explanation: '„Til tross for at” introduce un fapt care nu schimbă concluzia principală.' },
      { type: 'fill', prompt: 'Completează: „Vi må redusere utslippene ___ at forskjellene øker.”', answer: 'uten', explanation: '„Uten at” înseamnă „fără ca”.' },
      { type: 'order', prompt: 'Construiește „În timp ce reducem emisiile, trebuie să protejăm locurile de muncă”.', words: ['må vi', 'arbeidsplassene', 'Samtidig som vi kutter utslipp', 'beskytte'], answer: ['Samtidig som vi kutter utslipp', 'må vi', 'beskytte', 'arbeidsplassene'], explanation: 'După subordonata inițială, verbul „må” apare înaintea subiectului „vi”.' },
    ],
  },
  5: {
    title: 'Texte și prezentări formale',
    buildsOn: 'Reiei mesajele formale și prezentarea B1. Acum sintetizezi surse, delimitezi problema și construiești o concluzie susținută.',
  },
  8: {
    title: 'Cultură, limbă și identitate',
    buildsOn: 'Continui tema integrării din B1, dar treci de la descriere la comparație nuanțată și la explicarea unor identități multiple.',
    grammar: {
      title: 'Comparație, completare și reformulare',
      rule: 'Folosește „ikke bare … men også” pentru a completa o idee și „snarere enn” pentru a o reformula mai precis. „Både … og” rămâne util când cele două elemente au aceeași greutate.',
      examples: ['Språk gir ikke bare tilgang til arbeid, men også til fellesskap. — Limba oferă acces nu doar la muncă, ci și la comunitate.', 'Identitet er sammensatt snarere enn statisk. — Identitatea este complexă mai degrabă decât statică.'],
      wrong: 'Språk gir ikke bare arbeid og også fellesskap.',
    },
    exercises: [
      { type: 'choice', prompt: 'Ce expresie adaugă o a doua idee cu accent?', options: ['Ikke bare … men også', 'Verken … eller', 'På grunn av'], answer: 0, explanation: '„Ikke bare … men også” înseamnă „nu doar … ci și”.' },
      { type: 'fill', prompt: 'Completează: „Identitet er sammensatt ___ enn statisk.”', answer: 'snarere', explanation: 'Expresia fixă este „snarere enn”.' },
      { type: 'order', prompt: 'Construiește „Limba oferă acces atât la relații, cât și la societate”.', words: ['til både relasjoner', 'Språket', 'og samfunnsliv', 'gir tilgang'], answer: ['Språket', 'gir tilgang', 'til både relasjoner', 'og samfunnsliv'], explanation: 'Perechea „både … og” leagă două elemente echivalente.' },
    ],
  },
  9: {
    title: 'Tehnologie, confidențialitate și etică',
    buildsOn: 'Aplici analiza critică și argumentarea formală unei dileme actuale. Acum formulezi condiții reale și ipotetice și explici limite etice.',
  },
  10: {
    title: 'B2 în viața reală',
    buildsOn: 'Integrezi argumentarea, negocierea, analiza surselor și registrul formal. Lecția este o sinteză B2 și nu introduce o structură obligatorie nouă.',
    grammar: {
      title: 'Recapitulare: un discurs nuanțat',
      rule: 'Alege din structurile B2 în funcție de scop: delimitează problema, prezintă sursa, dezvoltă argumentele, răspunde obiecțiilor și formulează concluzia.',
      examples: ['Innledningsvis vil jeg presentere problemstillingen. — Pentru început voi prezenta întrebarea centrală.', 'Avslutningsvis vil jeg oppsummere argumentene. — În încheiere voi rezuma argumentele.'],
      wrong: 'Og så, og så, til slutt kanskje konklusjonen.',
    },
  },
};

export const progressiveB2Lessons = buildProgressiveLevel({
  source: [...b2CoreLessons, ...b2ExtraLessons],
  sequence: [1, 2, 6, 3, 7, 4, 5, 8, 9, 10],
  enhancements: b2Enhancements,
});
