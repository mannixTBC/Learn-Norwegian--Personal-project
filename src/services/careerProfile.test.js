import { careerPaths, clearCareerProfile, getCareerLessonModule, getCareerProfile, saveCareerProfile } from './careerProfile';

beforeEach(() => localStorage.clear());

test('salvează profilul separat pentru fiecare utilizator', () => {
  const user = { id: 'ana' };
  saveCareerProfile(user, 'transport');
  expect(getCareerProfile(user).pathId).toBe('transport');
  expect(getCareerProfile({ id: 'mihai' })).toBeNull();
  clearCareerProfile(user);
  expect(getCareerProfile(user)).toBeNull();
});

test('fiecare direcție are conținut suficient pentru lecții', () => {
  expect(careerPaths).toHaveLength(10);
  careerPaths.forEach((path) => {
    expect(path.phrases.length).toBeGreaterThanOrEqual(6);
    expect(path.scenarios.length).toBeGreaterThanOrEqual(3);
  });
});

test('modulul profesional oferă vocabular, scenariu și exercițiu corect', () => {
  const module = getCareerLessonModule('hospitality', 'B1', 4);
  expect(module.phrases).toHaveLength(3);
  expect(module.scenario.norwegian).toBeTruthy();
  expect(module.exercise.options[module.exercise.answer]).toBe(module.phrases[0][1]);
});
