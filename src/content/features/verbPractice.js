import { getContent } from '../activeContent';
import { contentValue } from '../contentValue';
export { VERB_PRACTICE_VERSION } from '../../legacy/modules/exercises/challenge30/verbPracticeData';
export const normalizeVerbPracticeAnswer = (...args)=>getContent('verbPractice').normalizeVerbPracticeAnswer(...args);
export const verbPracticeId = (...args)=>getContent('verbPractice').verbPracticeId(...args);
export const isVerbPracticeAnswerCorrect = (...args)=>getContent('verbPractice').isVerbPracticeAnswerCorrect(...args);
export const getKnownReviewVerbs = (...args)=>getContent('verbPractice').getKnownReviewVerbs(...args);
export const createVerbSession = (...args)=>getContent('verbPractice').createVerbSession(...args);
