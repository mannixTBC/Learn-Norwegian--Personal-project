import { supabase } from './supabaseClient';
import { createLearningSync } from './learningSync';
import {courseStorageKey} from '../languages/runtime';

const learningSync = createLearningSync({ client: supabase, storage: () => localStorage });
export const syncLearningProgress = (key,value)=>learningSync.syncProgress(courseStorageKey(key),value);
export const syncStudyActivity = learningSync.syncActivity;
export const restoreLearningProgress = learningSync.restore;
export const flushLearningProgress = learningSync.flush;
