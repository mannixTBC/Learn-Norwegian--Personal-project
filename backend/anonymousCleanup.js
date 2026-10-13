const DEFAULT_RETENTION_DAYS = 3;
const USERS_PER_PAGE = 1000;
const DELETE_BATCH_SIZE = 20;

const chunks = (items, size) => {
  const result = [];
  for (let index = 0; index < items.length; index += size) {
    result.push(items.slice(index, index + size));
  }
  return result;
};

/**
 * Șterge utilizatorii Supabase anonimi care au depășit perioada de păstrare.
 * Conturile permanente (email, Google etc.) nu sunt eligibile.
 */
const cleanupAnonymousUsers = async ({
  supabase,
  retentionDays = DEFAULT_RETENTION_DAYS,
  now = new Date(),
}) => {
  if (!supabase || !supabase.auth || !supabase.auth.admin) {
    throw new Error('Clientul Supabase administrativ lipsește.');
  }

  const cutoff = now.getTime() - retentionDays * 24 * 60 * 60 * 1000;
  const eligibleIds = [];
  const visitedPages = new Set();
  let page = 1;
  let scanned = 0;

  while (page && !visitedPages.has(page)) {
    visitedPages.add(page);
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage: USERS_PER_PAGE,
    });

    if (error) throw new Error(`Nu s-au putut lista utilizatorii Supabase: ${error.message}`);

    const users = (data && data.users) || [];
    scanned += users.length;

    users.forEach((user) => {
      const createdAt = Date.parse(user.created_at);
      if (user.is_anonymous === true && Number.isFinite(createdAt) && createdAt <= cutoff) {
        eligibleIds.push(user.id);
      }
    });

    page = data && data.nextPage;
  }

  const failed = [];
  let deleted = 0;

  for (const batch of chunks(eligibleIds, DELETE_BATCH_SIZE)) {
    const results = await Promise.all(batch.map(async (userId) => {
      const { error } = await supabase.auth.admin.deleteUser(userId);
      return { userId, error };
    }));

    results.forEach(({ userId, error }) => {
      if (error) failed.push({ userId, message: error.message });
      else deleted += 1;
    });
  }

  return {
    scanned,
    eligible: eligibleIds.length,
    deleted,
    failed,
    cutoff: new Date(cutoff).toISOString(),
  };
};

module.exports = {
  DEFAULT_RETENTION_DAYS,
  cleanupAnonymousUsers,
};
