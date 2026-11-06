import { getContent } from '../activeContent';
import { contentValue } from '../contentValue';
export const sentenceTiles = (...args)=>getContent('sentences').sentenceTiles(...args);
export const createSentenceSession = (...args)=>getContent('sentences').createSentenceSession(...args);
export const sentenceHint = (...args)=>getContent('sentences').sentenceHint(...args);
