export const REVIEW_STORAGE_KEY = 'norwegian_review_items';

const MINUTE = 60 * 1000;
const DAY = 24 * 60 * MINUTE;

const safeParse = (value, fallback) => {
  try { return JSON.parse(value) || fallback; }
  catch (_) { return fallback; }
};

const itemId = (item) => [item.level || 'A1', item.lessonId || 'general', item.prompt].join('::');

const normalizeItem = (item, now = Date.now()) => ({
  ...item,
  id: item.id || itemId(item),
  level: item.level || 'A1',
  source: item.source || 'lesson',
  createdAt: item.createdAt || new Date(now).toISOString(),
  dueAt: item.dueAt || new Date(now).toISOString(),
  lastReviewedAt: item.lastReviewedAt || null,
  lastRating: item.lastRating || null,
  intervalDays: Number(item.intervalDays) || 0,
  repetitions: Number(item.repetitions) || 0,
  lapses: Number(item.lapses) || 0,
  ease: Number(item.ease) || 2.5,
});

export const readReviewItems = () => {
  const stored = safeParse(localStorage.getItem(REVIEW_STORAGE_KEY), []);
  if (!Array.isArray(stored)) return [];
  const normalized = stored.map((item) => normalizeItem(item));
  if (normalized.some((item, index) => !stored[index].id || !stored[index].dueAt)) {
    localStorage.setItem(REVIEW_STORAGE_KEY, JSON.stringify(normalized));
  }
  return normalized;
};

export const writeReviewItems = (items) => {
  localStorage.setItem(REVIEW_STORAGE_KEY, JSON.stringify(items));
  return items;
};

export const saveReviewItem = (item) => {
  const now = Date.now();
  const incoming = normalizeItem(item, now);
  const items = readReviewItems();
  const existingIndex = items.findIndex((stored) => stored.id === incoming.id);

  if (existingIndex === -1) {
    writeReviewItems([...items, incoming]);
    return incoming;
  }

  const existing = items[existingIndex];
  const updated = {
    ...existing,
    ...incoming,
    createdAt: existing.createdAt,
    dueAt: new Date(now).toISOString(),
    lastReviewedAt: existing.lastReviewedAt,
    intervalDays: 0,
    repetitions: 0,
    lapses: existing.lapses + 1,
    ease: existing.ease,
    lastRating: 'again',
  };
  items[existingIndex] = updated;
  writeReviewItems(items);
  return updated;
};

const scheduleForRating = (item, rating) => {
  const interval = item.intervalDays || 0;
  const ease = item.ease || 2.5;

  if (rating === 'again') {
    return { delay: 10 * MINUTE, intervalDays: 0, repetitions: 0, ease: Math.max(1.7, ease - 0.2), lapses: item.lapses + 1 };
  }
  if (rating === 'hard') {
    const nextInterval = interval < 1 ? 1 : Math.max(1, Math.round(interval * 1.35));
    return { delay: nextInterval * DAY, intervalDays: nextInterval, repetitions: item.repetitions + 1, ease: Math.max(1.7, ease - 0.08), lapses: item.lapses };
  }

  const nextInterval = item.repetitions === 0
    ? 3
    : item.repetitions === 1
      ? 7
      : Math.max(interval + 1, Math.round(interval * ease));
  return { delay: nextInterval * DAY, intervalDays: nextInterval, repetitions: item.repetitions + 1, ease: Math.min(3, ease + 0.05), lapses: item.lapses };
};

export const rateReviewItem = (id, rating, now = Date.now()) => {
  const items = readReviewItems();
  const index = items.findIndex((item) => item.id === id);
  if (index === -1) return null;

  const item = items[index];
  const schedule = scheduleForRating(item, rating);
  const updated = {
    ...item,
    ...schedule,
    dueAt: new Date(now + schedule.delay).toISOString(),
    lastReviewedAt: new Date(now).toISOString(),
    lastRating: rating,
  };
  delete updated.delay;
  items[index] = updated;
  writeReviewItems(items);
  return updated;
};

export const getReviewItemsForLevel = (level) => readReviewItems()
  .filter((item) => item.level === level)
  .sort((a, b) => new Date(a.dueAt) - new Date(b.dueAt));

export const getDueReviewItems = (level, now = Date.now()) => getReviewItemsForLevel(level)
  .filter((item) => new Date(item.dueAt).getTime() <= now);

export const getReviewStats = (level, now = Date.now()) => {
  const items = getReviewItemsForLevel(level);
  return {
    total: items.length,
    due: items.filter((item) => new Date(item.dueAt).getTime() <= now).length,
    learning: items.filter((item) => item.intervalDays < 21).length,
    mastered: items.filter((item) => item.intervalDays >= 21).length,
    nextDueAt: items.length ? items[0].dueAt : null,
  };
};

export const ratingPreview = (item, rating) => {
  const schedule = scheduleForRating(normalizeItem(item), rating);
  if (schedule.delay < DAY) return '10 minute';
  if (schedule.intervalDays === 1) return 'mâine';
  return `${schedule.intervalDays} zile`;
};

export const formatDueDate = (date) => {
  if (!date) return '';
  const due = new Date(date);
  const today = new Date();
  if (due.toDateString() === today.toDateString()) {
    return `astăzi la ${due.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })}`;
  }
  const tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
  if (due.toDateString() === tomorrow.toDateString()) return 'mâine';
  return due.toLocaleDateString('ro-RO', { day: 'numeric', month: 'long' });
};
