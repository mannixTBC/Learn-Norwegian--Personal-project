const crypto = require('node:crypto');

const { getSupabaseForAccessToken } = require('./middleware/authSupabaseUser');

// The durable RPC uses the same defaults. Change production limits in
// supabase/schema_chat.sql so callers can never choose their own allowance.
const FREE_DAILY_LIMIT = 24;
const PREMIUM_DAILY_LIMIT = 120;
const DEFAULT_MINUTE_LIMIT = 6;
const DEFAULT_CONCURRENT_LIMIT = 1;
const LEASE_TTL_MS = 45_000;
const MINUTE_MS = 60_000;

const minuteGuards = new Map();
const localDailyUsage = new Map();

const positiveInteger = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : fallback;
};

const minuteLimit = () => positiveInteger(process.env.CHAT_QUOTA_MAX_PER_MINUTE, DEFAULT_MINUTE_LIMIT);
const concurrentLimit = () => positiveInteger(process.env.CHAT_QUOTA_MAX_CONCURRENT, DEFAULT_CONCURRENT_LIMIT);

const quotaError = (message, details = {}) => Object.assign(new Error(message), {
  status: 429,
  isChatQuotaError: true,
  ...details,
});

const serviceError = () => Object.assign(
  new Error('Limita de conversație nu poate fi verificată momentan. Încearcă din nou în câteva minute.'),
  { status: 503 },
);

const isLoopback = (req) => ['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(req?.socket?.remoteAddress);
const isLocalDevelopment = (req) => process.env.NODE_ENV !== 'production'
  && !process.env.NETLIFY
  && (process.env.NODE_ENV === 'development'
    || process.env.NODE_ENV === 'test'
    || process.env.VITE_PREMIUM_DEV_BYPASS === 'true'
    || isLoopback(req));

const utcDay = (now = Date.now()) => new Date(now).toISOString().slice(0, 10);

const actorId = (req) => {
  if (typeof req?.userId !== 'string' || !req.userId) {
    throw Object.assign(new Error('Autentificarea este necesară pentru conversație.'), { status: 401 });
  }
  return req.userId;
};

const pruneMemory = (now) => {
  for (const [actor, guard] of minuteGuards) {
    guard.recent = guard.recent.filter((timestamp) => now - timestamp < MINUTE_MS);
    for (const [leaseId, expiresAt] of guard.active) {
      if (expiresAt <= now) guard.active.delete(leaseId);
    }
    if (!guard.recent.length && !guard.active.size) minuteGuards.delete(actor);
  }

  const today = utcDay(now);
  for (const key of localDailyUsage.keys()) {
    if (!key.endsWith(`:${today}`)) localDailyUsage.delete(key);
  }
};

const reserveLocalGuard = (req) => {
  const actor = actorId(req);
  const now = Date.now();
  pruneMemory(now);

  const guard = minuteGuards.get(actor) || { recent: [], active: new Map() };
  minuteGuards.set(actor, guard);

  if (guard.active.size >= concurrentLimit()) {
    throw quotaError('Un răspuns este deja în curs. Așteaptă să se termine înainte de a trimite alt mesaj.', {
      remaining: null,
      limit: concurrentLimit(),
      source: 'memory-concurrency',
    });
  }
  if (guard.recent.length >= minuteLimit()) {
    throw quotaError('Ai trimis prea multe mesaje într-un timp scurt. Așteaptă un minut și încearcă din nou.', {
      remaining: 0,
      limit: minuteLimit(),
      source: 'memory-minute',
    });
  }

  const leaseId = crypto.randomUUID();
  guard.recent.push(now);
  guard.active.set(leaseId, now + LEASE_TTL_MS);
  req.chatQuotaLease = { actor, leaseId };
};

const releaseLocalGuard = (req) => {
  const lease = req?.chatQuotaLease;
  if (!lease) return;
  const guard = minuteGuards.get(lease.actor);
  if (guard) guard.active.delete(lease.leaseId);
  delete req.chatQuotaLease;
};

const localLimit = () => (
  process.env.VITE_PREMIUM_DEV_BYPASS === 'true' ? PREMIUM_DAILY_LIMIT : FREE_DAILY_LIMIT
);

const consumeLocalDailyQuota = (req) => {
  const actor = actorId(req);
  const key = `${actor}:${utcDay()}`;
  const current = localDailyUsage.get(key) || {
    requests: 0,
    promptTokens: 0,
    completionTokens: 0,
    cachedTokens: 0,
  };
  const limit = localLimit();

  if (current.requests >= limit) {
    throw quotaError('Ai folosit toate mesajele disponibile astăzi. Limita se reînnoiește mâine.', {
      remaining: 0,
      limit,
      source: 'local-memory',
    });
  }

  current.requests += 1;
  localDailyUsage.set(key, current);
  return { allowed: true, remaining: limit - current.requests, limit, source: 'local-memory' };
};

const rpcRow = (data) => (Array.isArray(data) ? data[0] : data);

const consumeDurableQuota = async (req) => {
  const supabase = getSupabaseForAccessToken(req.accessToken);
  if (!supabase) throw serviceError();

  const { data, error } = await supabase.rpc('consume_chat_quota');
  if (error) throw error;

  const row = rpcRow(data);
  const limit = Number(row?.daily_limit);
  const remaining = Number(row?.remaining);
  if (!row || typeof row.allowed !== 'boolean' || !Number.isFinite(limit) || !Number.isFinite(remaining)) {
    throw serviceError();
  }

  const result = {
    allowed: row.allowed,
    remaining: Math.max(0, remaining),
    limit: Math.max(0, limit),
    source: 'supabase',
  };

  if (!result.allowed) {
    const message = row.plan === 'premium'
      ? 'Ai folosit toate mesajele disponibile astăzi. Limita se reînnoiește mâine.'
      : 'Ai folosit toate mesajele gratuite disponibile astăzi. Revino mâine sau treci la Premium.';
    throw quotaError(message, result);
  }
  return result;
};

/**
 * Rezervă o cerere de chat. Mai întâi aplică protecția rapidă a instanței,
 * apoi incrementează atomic contorul zilnic legat de `auth.uid()` în Supabase.
 */
const consumeChatQuota = async (req) => {
  if (req?.chatQuotaResult) return req.chatQuotaResult;
  reserveLocalGuard(req);

  try {
    const result = await consumeDurableQuota(req);
    req.chatQuotaResult = result;
    return result;
  } catch (error) {
    if (error?.isChatQuotaError) {
      releaseLocalGuard(req);
      throw error;
    }

    if (isLocalDevelopment(req)) {
      try {
        const result = consumeLocalDailyQuota(req);
        req.chatQuotaResult = result;
        return result;
      } catch (localError) {
        releaseLocalGuard(req);
        throw localError;
      }
    }

    releaseLocalGuard(req);
    throw serviceError();
  }
};

const safeCount = (value) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return 0;
  return Math.min(Math.trunc(parsed), 5_000_000);
};

const normalizeUsage = (usage) => ({
  promptTokens: safeCount(usage?.prompt_tokens),
  completionTokens: safeCount(usage?.completion_tokens),
  cachedTokens: safeCount(usage?.prompt_tokens_details?.cached_tokens),
});

const recordLocalUsage = (req, normalized) => {
  const key = `${actorId(req)}:${utcDay()}`;
  const current = localDailyUsage.get(key);
  if (!current) return;
  current.promptTokens += normalized.promptTokens;
  current.completionTokens += normalized.completionTokens;
  current.cachedTokens += normalized.cachedTokens;
};

/**
 * Eliberează întotdeauna lease-ul local. Dacă există date de usage, agregarea
 * lor în Supabase este best-effort și nu poate transforma un răspuns reușit
 * într-o eroare pentru cursant.
 */
const recordChatUsage = async (req, usage) => {
  releaseLocalGuard(req);
  if (!usage) return { recorded: false, source: 'none' };

  try {
    const normalized = normalizeUsage(usage);
    if (!normalized.promptTokens && !normalized.completionTokens && !normalized.cachedTokens) {
      return { recorded: false, source: 'none' };
    }

    if (req?.chatQuotaResult?.source === 'local-memory') {
      recordLocalUsage(req, normalized);
      return { recorded: true, source: 'local-memory' };
    }

    const supabase = getSupabaseForAccessToken(req?.accessToken);
    if (!supabase) return { recorded: false, source: 'unavailable' };

    const { error } = await supabase.rpc('record_chat_usage', {
      p_prompt_tokens: normalized.promptTokens,
      p_completion_tokens: normalized.completionTokens,
      p_cached_tokens: normalized.cachedTokens,
    });
    if (error) return { recorded: false, source: 'supabase' };
    return { recorded: true, source: 'supabase' };
  } catch (_) {
    return { recorded: false, source: 'supabase' };
  }
};

const resetForTests = () => {
  minuteGuards.clear();
  localDailyUsage.clear();
};

module.exports = {
  consumeChatQuota,
  recordChatUsage,
  // Small pure/test hooks; production callers should use only the two methods above.
  __test: { normalizeUsage, resetForTests },
};
