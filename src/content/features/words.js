import { getContent } from '../activeContent';
import { contentValue } from '../contentValue';
export const wordDiscoveryCatalog = contentValue('words', 'wordDiscoveryCatalog', true);
export const createIllustratedWordQuestions = (...args)=>getContent('words').createIllustratedWordQuestions(...args);
