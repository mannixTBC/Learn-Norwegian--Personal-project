import { getContent } from '../activeContent';
import { contentValue } from '../contentValue';
export const gameProgressTargets = contentValue('games', 'gameProgressTargets', false);
export const normalizePracticeAnswer = (...args)=>getContent('games').normalizePracticeAnswer(...args);
export const shufflePractice = (...args)=>getContent('games').shufflePractice(...args);
export const createPracticeQuestions = (...args)=>getContent('games').createPracticeQuestions(...args);
export const readGameProgress = (...args)=>getContent('games').readGameProgress(...args);
export const saveGameProgress = (...args)=>getContent('games').saveGameProgress(...args);
