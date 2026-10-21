import { supabase } from './supabaseClient';
import { createLearningSync } from './learningSync';

const learningSync = createLearningSync({ client: supabase, storage: () => localStorage });
export const syncLearningProgress = learningSync.syncProgress;
export const syncStudyActivity = learningSync.syncActivity;
export const restoreLearningProgress = learningSync.restore;
export const flushLearningProgress = learningSync.flush;
