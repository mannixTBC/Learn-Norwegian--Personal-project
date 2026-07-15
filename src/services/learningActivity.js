import { syncStudyActivity } from './supabaseLearning';

export const ACTIVITY_STORAGE_KEY = 'norwegian_learning_activity';
export const DAILY_GOAL_KEY = 'norwegian_daily_goal';

const validGoals = [5, 10, 15, 20];

const safeParse = (value, fallback) => {
  try { return JSON.parse(value) || fallback; }
  catch (_) { return fallback; }
};

export const localDateKey = (value = new Date()) => {
  const date = value instanceof Date ? value : new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const readStudyActivity = () => {
  const stored = safeParse(localStorage.getItem(ACTIVITY_STORAGE_KEY), []);
  return Array.isArray(stored) ? stored : [];
};

export const recordStudyActivity = ({ type, level = 'A1', minutes = 1, score = null, words = 0, ...details }) => {
  const now = new Date();
  const event = {
    id: `${now.getTime()}-${Math.random().toString(36).slice(2, 8)}`,
    type,
    level,
    minutes: Math.max(1, Math.round(Number(minutes) || 1)),
    score: score !== null && score !== undefined && Number.isFinite(Number(score)) ? Math.max(0, Math.min(100, Math.round(Number(score)))) : null,
    words: Math.max(0, Math.round(Number(words) || 0)),
    date: now.toISOString(),
    day: localDateKey(now),
    ...details,
  };
  const next = [...readStudyActivity(), event].slice(-500);
  localStorage.setItem(ACTIVITY_STORAGE_KEY, JSON.stringify(next));
  void syncStudyActivity(event).catch((error) => {
    console.warn('Activitatea a rămas salvată local; sincronizarea Supabase va fi reîncercată la următoarea activitate.', error.message);
  });
  return event;
};

export const getDailyGoal = () => {
  const stored = Number(localStorage.getItem(DAILY_GOAL_KEY));
  return validGoals.includes(stored) ? stored : 10;
};

export const setDailyGoal = (goal) => {
  const normalized = Number(goal);
  if (!validGoals.includes(normalized)) return getDailyGoal();
  localStorage.setItem(DAILY_GOAL_KEY, String(normalized));
  return normalized;
};

const addDays = (date, amount) => {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
};

export const getStudySummary = (now = new Date()) => {
  const events = readStudyActivity();
  const today = localDateKey(now);
  const byDay = events.reduce((days, event) => {
    const day = event.day || localDateKey(event.date);
    if (!days[day]) days[day] = { minutes: 0, sessions: 0, scores: [] };
    days[day].minutes += Number(event.minutes) || 0;
    days[day].sessions += 1;
    if (event.score !== null && event.score !== undefined && Number.isFinite(Number(event.score))) days[day].scores.push(Number(event.score));
    return days;
  }, {});

  let streak = 0;
  let cursor = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (!byDay[today]) cursor = addDays(cursor, -1);
  while (byDay[localDateKey(cursor)]) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }

  const last7Days = Array.from({ length: 7 }, (_, index) => {
    const date = addDays(new Date(now.getFullYear(), now.getMonth(), now.getDate()), index - 6);
    const key = localDateKey(date);
    return {
      key,
      label: date.toLocaleDateString('ro-RO', { weekday: 'short' }).replace('.', ''),
      dayNumber: date.getDate(),
      minutes: Math.round(byDay[key] ? byDay[key].minutes : 0),
      sessions: byDay[key] ? byDay[key].sessions : 0,
    };
  });
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const currentMonday = addDays(todayStart, -((todayStart.getDay() + 6) % 7));
  const calendarStart = addDays(currentMonday, -21);
  const last28Days = Array.from({ length: 28 }, (_, index) => {
    const date = addDays(calendarStart, index);
    const key = localDateKey(date);
    return { key, date, minutes: Math.round(byDay[key] ? byDay[key].minutes : 0), isToday: key === today };
  });
  const scores = events.map((event) => event.score).filter((score) => score !== null && score !== undefined && Number.isFinite(Number(score)));
  const totalMinutes = Math.round(events.reduce((total, event) => total + (Number(event.minutes) || 0), 0));

  return {
    events,
    byDay,
    todayMinutes: Math.round(byDay[today] ? byDay[today].minutes : 0),
    todaySessions: byDay[today] ? byDay[today].sessions : 0,
    totalMinutes,
    streak,
    activeDays: Object.keys(byDay).length,
    averageScore: scores.length ? Math.round(scores.reduce((total, score) => total + Number(score), 0) / scores.length) : 0,
    last7Days,
    last28Days,
    weekMinutes: last7Days.reduce((total, day) => total + day.minutes, 0),
  };
};
