import { getVerbSessions } from './verbsForLevel';
import { verbPracticeContent } from './verbPracticeContent';

export const VERB_PRACTICE_VERSION = 1;
const levels = ['A1','A2','B1','B2','C1','C2'];
const sessionTitles = {
  A1:['Primele verbe','Ce spui și unde mergi','Ce vezi, știi și vrei','Obiecte și mâncare','Întâlniri și planuri','Viață, muncă și plăți','Învățare și conversație','Citire, scriere și memorie','Întrebări și ajutor','Răspunsuri și gesturi simple'],
  A2:['Poziții și locuri','Somn, veghe și călătorii','Locuință și schimbare','Cumpărături și schimburi','Ce dai, iei și trimiți','Întâlniri și promisiuni','Sentimente și preferințe','Început și continuare','Decizii și încercări','Rezultate, nevoi și dorințe'],
  B1:['Deplasări și direcții','Mișcare și sport','Mișcări de zi cu zi','Grijă pentru oameni și lucruri','Gesturi în bucătărie','Ține, eliberează și gustă','Aruncă, prinde și șutează','În aer și pe apă','Reușită și sinceritate','Gânduri și opinii'],
  B2:['Analiză și comparație','Argumente și justificări','Contribuții și rezultate','Negociere și coordonare','Probleme și prevenție','Mesajul esențial','Condiții și consecințe','Interpretare și exprimare','Priorități și organizare','Reflecție și concluzii'],
  C1:['Clarificare și precauție','Precizie și accent','Poziții și referințe','Dovezi și corelații','Date și susținerea schimbării','Acorduri și angajamente','Disponibilitate și negociere','Contestații și explicații','Contribuții și limite','Perspective și delimitări'],
  C2:['Presupoziții și responsabilitate','Concis, dar fidel','Efect și distanțare','Afirmații și raționamente','Surse și consimțământ','Înțelegere și intervenție','Intensitate și specific','Obiecții și adaptare','Argumente care rezistă','Poziție și sinteză'],
};
const normalized = value => String(value || '').normalize('NFC').trim().replace(/\s+/gu,' ').toLocaleLowerCase('nb-NO');
export const normalizeVerbPracticeAnswer = value => normalized(value).replace(/[.!?]+$/u,'').trim();
export const verbPracticeId = norwegian => `verb:${normalized(norwegian)}`;

export const isVerbPracticeAnswerCorrect = (question, value) => Boolean(question)
  && (question.acceptedAnswers || [question.answer]).some(answer => normalizeVerbPracticeAnswer(value) === normalizeVerbPracticeAnswer(answer));

const sessionDetails = (level, day) => {
  const code = String(level || 'A1').toUpperCase();
  if (!levels.includes(code)) throw new RangeError(`Nivel de verbe necunoscut: ${code}`);
  const sessions = getVerbSessions(code);
  if (!sessions.length) throw new RangeError(`Nu există sesiuni de verbe pentru ${code}.`);
  const index = Math.max(1,Math.min(sessions.length,Math.trunc(Number(day) || 1)));
  return { level:code, day:index, sessions };
};

const enrich = entry => {
  const norwegian = String(entry.norwegian || '').normalize('NFC');
  const content = verbPracticeContent[normalized(norwegian)];
  // Curriculum changes must receive authored examples. Guessing a conjugation
  // or displaying a sentence about the word itself would teach unsafe content.
  if (!content) throw new RangeError(`Lipsesc contextele verificate pentru verbul „${norwegian}”.`);
  const cloneContext = context => ({ ...context, acceptedAnswers:[...context.acceptedAnswers] });
  return {
    id:verbPracticeId(norwegian), norwegian, romanian:content.romanian,
    form:content.form, formLabel:content.formLabel,
    example:content.context.sentence.replace('___',content.form), translation:content.context.translation,
    context:cloneContext(content.context), recall:cloneContext(content.recall),
  };
};

/** Review candidates come only from introduced sessions in this level.
 * An explicit completed array is authoritative (including an empty array).
 * Without it, the legacy unlocked-day convention supplies the preceding days.
 * Selecting a level never assumes that any lower level has been studied.
 */
export const getKnownReviewVerbs = ({ level, day=1, progress } = {}) => {
  const details = sessionDetails(level,day);
  const currentIds = new Set(details.sessions[details.day-1].map(entry => verbPracticeId(entry.norwegian)));
  const explicit = Array.isArray(progress?.completed) ? new Set(progress.completed.filter(value => Number.isInteger(value))) : null;
  const unlocked = Number.isFinite(Number(progress?.day)) ? Math.max(1,Math.trunc(Number(progress.day))) : details.day;
  const unique = new Map();
  details.sessions.slice(0,details.day-1).forEach((entries,index) => {
    const introduced = explicit ? explicit.has(index+1) : index+1 < unlocked;
    if (!introduced) return;
    entries.forEach(entry => {
      const verb = enrich(entry);
      if (!currentIds.has(verb.id) && !unique.has(verb.id)) unique.set(verb.id,verb);
    });
  });
  return [...unique.values()];
};

const hash = text => Array.from(text).reduce((value,char) => (Math.imul(value,31)+char.codePointAt(0))>>>0,7);
const orderedOptions = (items, seed) => [...items].sort((left,right) => hash(`${seed}:${left}`)-hash(`${seed}:${right}`) || left.localeCompare(right,'nb'));
const meaningGroups = [
  ['å treffe','å møte'], ['å klare','å greie','å lykkes'],
  ['å gjøre','å lage'], ['å synes','å mene'],
  ['å innebære','å medføre'], ['å redegjøre for','å gjøre rede for'],
  ['å ta hensyn til','å ta høyde for'],
];
const equivalentMeaning = (left,right) => normalized(left.romanian) === normalized(right.romanian)
  || meaningGroups.some(group => group.includes(left.norwegian) && group.includes(right.norwegian));

const makeQuestion = (verb, phase, pool, old=false) => {
  const meaning = phase === 'meaning';
  const content = phase === 'recall' ? verb.recall : verb.context;
  const answer = meaning ? verb.romanian : content.answer;
  const acceptedAnswers = meaning ? [answer] : [...content.acceptedAnswers];
  const id = `${old ? 'review' : phase}:${verb.id}`;
  const phrase = content.answer.includes(' ');
  let prompt = meaning ? `Ce înseamnă „${verb.norwegian}”?`
    : phase === 'context' ? `Alege ${phrase ? 'expresia' : 'verbul'} la prezent pentru sensul din română.`
      : `Scrie ${phrase ? 'expresia' : 'verbul'} lipsă la prezent.`;
  if (verb.formLabel === 'construcție la prezent' && !meaning) prompt = phase === 'context' ? 'Alege construcția potrivită pentru sensul din română.' : 'Scrie construcția lipsă pentru sensul din română.';
  const question = {
    id, verbId:verb.id, phase, old, prompt,
    answer, acceptedAnswers, infinitive:verb.norwegian, formLabel:verb.formLabel,
    ...(!meaning ? {sentence:content.sentence,translation:content.translation} : {}),
  };
  if (phase !== 'recall') {
    const distractors = [];
    for (const candidate of pool) {
      if (candidate.id === verb.id || (meaning && equivalentMeaning(verb,candidate))) continue;
      const value = meaning ? candidate.romanian : candidate.context.answer;
      const alternativeCorrect = acceptedAnswers.some(item => normalized(item) === normalized(value));
      // Also avoid offering the target as an accepted synonym of a distractor.
      const reverseEquivalent = !meaning && candidate.context.acceptedAnswers.some(item => normalized(item) === normalized(answer));
      if (!alternativeCorrect && !reverseEquivalent && !distractors.some(item => normalized(item) === normalized(value))) distractors.push(value);
      if (distractors.length === 2) break;
    }
    question.options = orderedOptions([answer,...distractors],id);
  }
  return question;
};

/** Existing session IDs and verb order are intentionally retained. The UI owns
 * persistence, hints, first-attempt scoring and spaced-review scheduling.
 * reviewVerbs accepts known IDs, Norwegian infinitives or raw/enriched objects.
 * Passing [] requests no review; omitting it rotates up to two known verbs.
 */
export const createVerbSession = ({level='A1',day=1,progress,now=Date.now(),reviewVerbs} = {}) => {
  const details = sessionDetails(level,day);
  const verbs = details.sessions[details.day-1].map(enrich);
  const known = getKnownReviewVerbs({...details,progress});
  const knownById = new Map(known.map(verb => [verb.id,verb]));
  let review = [];
  if (Array.isArray(reviewVerbs)) {
    const used = new Set();
    reviewVerbs.forEach(value => {
      const identifier = typeof value === 'string' ? value : value?.id || value?.norwegian;
      const id = String(identifier || '').startsWith('verb:') ? identifier : verbPracticeId(identifier);
      if (!knownById.has(id) || used.has(id) || review.length >= 2) return;
      used.add(id); review.push(knownById.get(id));
    });
  } else if (known.length) {
    const timestamp = Number(now instanceof Date ? now.getTime() : now);
    const rotation = hash(`${details.level}:${details.day}:${Number.isFinite(timestamp) ? Math.floor(timestamp/86400000) : 0}`) % known.length;
    review = [...known.slice(rotation),...known.slice(0,rotation)].slice(0,2);
  }
  const pool = [...verbs,...known];
  return {
    level:details.level, day:details.day,
    title:sessionTitles[details.level][details.day-1] || 'Verbe în context',
    verbs, reviewVerbs:review,
    questions:[
      ...['meaning','context','recall'].flatMap(phase => verbs.map(verb => makeQuestion(verb,phase,pool))),
      ...review.map(verb => makeQuestion(verb,'recall',pool,true)),
    ],
  };
};
