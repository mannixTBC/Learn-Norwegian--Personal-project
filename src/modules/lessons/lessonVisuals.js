const lessonImages = {
  1: '/images/auth-norway-fjord.webp',
  2: '/images/lessons/nordic-cafe.png',
};

export const getLessonImage = (lessonId) => lessonImages[Number(lessonId)] || '/images/auth-norway-fjord.webp';

