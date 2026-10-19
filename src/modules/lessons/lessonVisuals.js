import { courseCatalog } from './norwegian-program/lessonContent';

// Assets follow the scene; section IDs provide the default and stable lesson
// UIDs select a different scene when its actual situation differs. Numeric
// route IDs are used only to look up the current compiled lesson.
const visuals = {
  greetings: { src: '/images/lessons/a1/01-greetings.webp', alt: 'Salut și prezentare între două persoane.' },
  cafe: { src: '/images/lessons/a1/02-cafe.webp', alt: 'Conversație și comandă la o cafenea.' },
  shopping: { src: '/images/lessons/a1/03-store.webp', alt: 'Cumpărături și alegerea produselor într-un magazin.' },
  home: { src: '/images/lessons/a1/04-home-routine.webp', alt: 'Locuință și activități de acasă.' },
  work: { src: '/images/lessons/a1/05-work.webp', alt: 'Activitate și comunicare la serviciu.' },
  family: { src: '/images/lessons/a1/06-family.webp', alt: 'Familie și relații cu persoanele apropiate.' },
  time: { src: '/images/lessons/a1/07-time-meetings.webp', alt: 'Stabilirea unei ore și planificarea unei întâlniri.' },
  weather: { src: '/images/lessons/a1/08-weather-clothing.webp', alt: 'Vreme și îmbrăcăminte potrivită pentru o ieșire.' },
  transport: { src: '/images/lessons/a1/09-transport.webp', alt: 'Deplasare și orientare cu transportul public.' },
  'daily-life': { src: '/images/lessons/a1/10-full-day.webp', alt: 'Activități și întâmplări dintr-o zi obișnuită.' },
  healthcare: { src: '/images/lessons/themes/healthcare.webp', alt: 'Conversație despre o programare și clarificări într-un cabinet medical.' },
  discussion: { src: '/images/lessons/themes/discussion.webp', alt: 'Două persoane compară idei și discută o propunere.' },
  repairs: { src: '/images/lessons/themes/repairs.webp', alt: 'Verificarea unei defecțiuni și stabilirea unei reparații în locuință.' },
  career: { src: '/images/lessons/themes/career.webp', alt: 'Discuție despre experiență, candidatură și dezvoltare profesională.' },
  'public-services': { src: '/images/lessons/themes/public-services.webp', alt: 'Solicitare și clarificarea unor informații la un serviciu public.' },
  sources: { src: '/images/lessons/themes/sources.webp', alt: 'Compararea documentelor, surselor și datelor pentru o concluzie.' },
  library: { src: '/images/lessons/themes/library.webp', alt: 'Bibliotecă și spațiu de lectură pentru comunitate.' },
  teamwork: { src: '/images/lessons/themes/teamwork.webp', alt: 'O echipă planifică sarcini și verifică împreună un proiect.' },
  sustainability: { src: '/images/lessons/themes/sustainability.webp', alt: 'Mobilitate și alegeri sustenabile într-un oraș.' },
  'digital-life': { src: '/images/lessons/themes/digital-life.webp', alt: 'Utilizarea și evaluarea unui serviciu digital.' },
  presentation: { src: '/images/lessons/themes/presentation.webp', alt: 'Prezentarea unei idei și răspunsuri la întrebările publicului.' },
  writing: { src: '/images/lessons/themes/writing.webp', alt: 'Redactarea și revizuirea atentă a unui text.' },
};

const sectionThemes = {
  'a1-contact-identity': 'greetings',
  'a1-home-people': 'home',
  'a1-time-routine': 'daily-life',
  'a1-food-shopping': 'shopping',
  'a1-city-travel': 'transport',
  'a1-work-social': 'work',
  'a2-relationships-plans': 'greetings',
  'a2-shopping-housing': 'shopping',
  'a2-health-appointments': 'healthcare',
  'a2-past-experiences': 'daily-life',
  'a2-work-collaboration': 'teamwork',
  'a2-services-autonomy': 'public-services',
  'b1-povesti': 'transport',
  'b1-opinii': 'discussion',
  'b1-probleme': 'repairs',
  'b1-munca': 'career',
  'b1-societate': 'public-services',
  'b1-proiect': 'cafe',
  'b2-argumente': 'discussion',
  'b2-negociere': 'discussion',
  'b2-surse': 'sources',
  'b2-decizii': 'sustainability',
  'b2-comunicare': 'writing',
  'b2-proiect': 'library',
  'c1-register-og-undertekst': 'discussion',
  'c1-kilder-og-syntese': 'sources',
  'c1-profesjonell-samhandling': 'teamwork',
  'c1-drofting-og-argumentasjon': 'discussion',
  'c1-interkulturell-mediering': 'discussion',
  'c1-selvstendig-formidling': 'presentation',
  'c2-presisjon-og-implikasjon': 'writing',
  'c2-retorikk-og-undertekst': 'writing',
  'c2-kritisk-kildesyntese': 'sources',
  'c2-kompleks-mediering': 'discussion',
  'c2-stil-og-sprakvalg': 'writing',
  'c2-selvstendig-portefolje': 'presentation',
};

const lessonThemeOverrides = {
  // A1: identity stays with greetings; numbers/contact are a writing task.
  'a1-contact-details': 'writing',
  'a1-family': 'family',
  'a1-neighbours-description': 'greetings',
  'a1-daily-routine': 'home',
  'a1-time-meetings': 'time',
  'a1-cafe': 'cafe',
  'a1-city-places': 'library',
  'a1-weather-clothes': 'weather',
  'a1-clarification-instructions': 'teamwork',
  'a1-colleague-break': 'cafe',
  'a1-a1-time-routine-mission': 'time',
  'a1-a1-food-shopping-mission': 'cafe',
  'a1-a1-city-travel-mission': 'library',

  // A2: each mixed section keeps the scene of the specific lesson.
  'a2-plans-invitations': 'time',
  'a2-friendship-preferences': 'daily-life',
  'a2-family-comparisons': 'family',
  'a2-housing-repairs': 'repairs',
  'a2-reschedule-appointment': 'time',
  'a2-life-experiences': 'transport',
  'a2-work-instruction-check': 'work',
  'a2-work-status-updates': 'writing',
  'a2-digital-services': 'digital-life',
  'a2-transport-delays': 'transport',
  'a2-a2-relationships-plans-mission': 'time',

  // B1: health, information, community and presentation have separate scenes.
  'b1-sanatate-clarificare': 'healthcare',
  'b1-munca-responsabilitati': 'teamwork',
  'b1-stiri-surse': 'sources',
  'b1-comunitate-relatii': 'greetings',
  'b1-prezentare-idee': 'presentation',
  'b1-b1-societate-mission': 'teamwork',

  // B2: data work, library decisions, technology and formal revision differ.
  'b2-argument-dovada': 'sources',
  'b2-conflict-feedback': 'teamwork',
  'b2-comparare-surse': 'library',
  'b2-decizii-costuri': 'work',
  'b2-decizii-tehnologie': 'digital-life',
  'b2-comunicare-profesionala': 'teamwork',
  'b2-perspective-identitate': 'greetings',
  'b2-proiect-dezbatere': 'presentation',
  'b2-proiect-revizuire': 'writing',
  'b2-b2-surse-mission': 'library',
  'b2-b2-decizii-mission': 'digital-life',

  // C1: distinguish written register, library/transport cases and research.
  'c1-register-formalitet': 'writing',
  'c1-perspektiv-bibliotek': 'library',
  'c1-formell-redegjorelse': 'writing',
  'c1-arsak-sammenheng': 'sources',
  'c1-konsesjon-vilkar': 'transport',
  'c1-droftende-tekst': 'writing',
  'c1-redigering-presisjon': 'writing',
  'c1-prosjekt-beslutningsgrunnlag': 'library',
  'c1-c1-register-og-undertekst-mission': 'writing',
  'c1-c1-kilder-og-syntese-mission': 'digital-life',
  'c1-c1-drofting-og-argumentasjon-mission': 'transport',

  // C2: editing is a writing scene even within an oral portfolio section.
  'c2-premiss-implikasjon': 'discussion',
  'c2-fagspraak-formidling': 'presentation',
  'c2-etisk-avveining': 'digital-life',
  'c2-kritikk-revisjon': 'sources',
  'c2-portefolje-dommekraft': 'writing',
  'c2-c2-selvstendig-portefolje-mission': 'writing',
};

const invalidLessonVisual = {
  src: '/images/lessons/a1/01-greetings.webp',
  alt: 'Ilustrație introductivă pentru cursul de norvegiană.',
  theme: 'fallback',
};

export const getLessonVisual = (levelCode, lessonId) => {
  const level = String(levelCode || '').trim().toUpperCase();
  const course = courseCatalog[level];
  const id = Number(lessonId);
  const lesson = course?.lessons.find((item) => item.id === id);
  if (!lesson) return { ...invalidLessonVisual };

  const theme = lessonThemeOverrides[lesson.uid] || sectionThemes[lesson.sectionId];
  const visual = visuals[theme];
  if (!visual) {
    // A valid future lesson needs an explicit mapping, never an unrelated image.
    throw new Error(`Lipsește imaginea tematică pentru lecția ${lesson.uid}.`);
  }
  return { ...visual, theme };
};

export const getLessonImage = (levelCode, lessonId) => getLessonVisual(levelCode, lessonId).src;

