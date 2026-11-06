import { getContent } from '../activeContent';
import { contentValue } from '../contentValue';
export const spellingLetters = (...args)=>getContent('spelling').spellingLetters(...args);
export const initialSpelling = (...args)=>getContent('spelling').initialSpelling(...args);
export const spellingReducer = (...args)=>getContent('spelling').spellingReducer(...args);
export const createWordSpellingSession = (...args)=>getContent('spelling').createWordSpellingSession(...args);
export const initialGuessing = (...args)=>getContent('spelling').initialGuessing(...args);
export const guessingReducer = (...args)=>getContent('spelling').guessingReducer(...args);
