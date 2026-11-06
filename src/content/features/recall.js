import { getContent } from '../activeContent';
import { contentValue } from '../contentValue';
export const normalizeRecall = (...args)=>getContent('recall').normalizeRecall(...args);
export const buildActiveRecall = (...args)=>getContent('recall').buildActiveRecall(...args);
export const checkRecallOrder = (...args)=>getContent('recall').checkRecallOrder(...args);
export const checkRecallResponse = (...args)=>getContent('recall').checkRecallResponse(...args);
export const recallReviewItem = (...args)=>getContent('recall').recallReviewItem(...args);
export const createRecallRecorder = (...args)=>getContent('recall').createRecallRecorder(...args);
