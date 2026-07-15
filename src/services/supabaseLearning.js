import { supabase } from './supabaseClient';

const currentUserId = async () => {
  if (!supabase) return null;

  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  return data.user.id;
};

export const syncStudyActivity = async (event) => {
  const userId = await currentUserId();
  if (!userId) return { synced: false };

  const {
    id,
    type,
    level,
    minutes,
    score,
    date,
    day,
    words,
    ...details
  } = event;

  const { error } = await supabase
    .from('study_activity')
    .upsert({
      user_id: userId,
      client_event_id: id,
      activity_type: type,
      level,
      minutes,
      score,
      occurred_at: date,
      metadata: { day, words, ...details },
    }, {
      onConflict: 'user_id,client_event_id',
      ignoreDuplicates: true,
    });

  if (error) throw error;
  return { synced: true };
};

export const syncLearningProgress = async (key, value) => {
  const userId = await currentUserId();
  if (!userId) return { synced: false };

  const { data, error: readError } = await supabase
    .from('learning_progress')
    .select('state')
    .eq('user_id', userId)
    .maybeSingle();

  if (readError) throw readError;

  const state = {
    ...((data && data.state) || {}),
    [key]: value,
  };

  const { error } = await supabase
    .from('learning_progress')
    .upsert({ user_id: userId, state }, { onConflict: 'user_id' });

  if (error) throw error;
  return { synced: true };
};
