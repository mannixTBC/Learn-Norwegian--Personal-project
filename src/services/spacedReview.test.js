import {
  REVIEW_STORAGE_KEY,
  getDueReviewItems,
  rateReviewItem,
  readReviewItems,
  saveReviewItem,
} from './spacedReview';

beforeEach(() => localStorage.clear());

test('migrează elementele vechi și le programează imediat', () => {
  localStorage.setItem(REVIEW_STORAGE_KEY, JSON.stringify([{ level: 'A1', lessonId: 1, prompt: 'Hei?', answer: 'Salut' }]));
  const items = readReviewItems();
  expect(items[0].id).toBeTruthy();
  expect(items[0].dueAt).toBeTruthy();
  expect(getDueReviewItems('A1')).toHaveLength(1);
});

test('nu creează duplicate și programează răspunsul cunoscut', () => {
  const first = saveReviewItem({ level: 'A2', lessonId: 2, prompt: 'Hva betyr lege?', answer: 'Medic' });
  saveReviewItem({ level: 'A2', lessonId: 2, prompt: 'Hva betyr lege?', answer: 'Medic' });
  expect(readReviewItems()).toHaveLength(1);

  const now = Date.now();
  const rated = rateReviewItem(first.id, 'good', now);
  expect(rated.intervalDays).toBe(3);
  expect(new Date(rated.dueAt).getTime()).toBe(now + (3 * 24 * 60 * 60 * 1000));
});
