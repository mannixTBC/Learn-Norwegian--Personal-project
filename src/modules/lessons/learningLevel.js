export const learningLevels = ['A1', 'A2', 'B1', 'B2'];

export const getLearningLevel = (search = '') => {
  const requested = new URLSearchParams(search).get('nivel');
  const stored = localStorage.getItem('norwegian_active_level');
  const level = (requested || stored || 'A1').toUpperCase();
  return learningLevels.includes(level) ? level : 'A1';
};

export const levelName = {
  A1: 'Începător',
  A2: 'Elementar',
  B1: 'Intermediar',
  B2: 'Avansat',
};
