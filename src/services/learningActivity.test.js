import {
  ACTIVITY_STORAGE_KEY,
  getDailyGoal,
  getStudySummary,
  localDateKey,
  recordStudyActivity,
  setDailyGoal,
} from './learningActivity';

beforeEach(() => localStorage.clear());

it('records a study activity for the current local day', () => {
  const event = recordStudyActivity({ type: 'lesson', level: 'B1', minutes: 12, score: 84, words: 8 });
  expect(event.day).toBe(localDateKey(new Date()));
  expect(JSON.parse(localStorage.getItem(ACTIVITY_STORAGE_KEY))).toHaveLength(1);
  expect(getStudySummary().todayMinutes).toBe(12);
  expect(getStudySummary().averageScore).toBe(84);
});

it('accepts only supported daily goals', () => {
  expect(getDailyGoal()).toBe(10);
  expect(setDailyGoal(15)).toBe(15);
  expect(getDailyGoal()).toBe(15);
  expect(setDailyGoal(99)).toBe(15);
});

it('calculates a streak ending today or yesterday', () => {
  const now = new Date(2026, 6, 13, 12, 0, 0);
  const days = [new Date(2026, 6, 11), new Date(2026, 6, 12), new Date(2026, 6, 13)];
  localStorage.setItem(ACTIVITY_STORAGE_KEY, JSON.stringify(days.map((date, index) => ({ id: index, type: 'lesson', level: 'A1', minutes: 5, date: date.toISOString(), day: localDateKey(date) }))));
  expect(getStudySummary(now).streak).toBe(3);
});
