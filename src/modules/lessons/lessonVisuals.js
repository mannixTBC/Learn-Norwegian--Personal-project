const lessonImages = {
  A1: {
    1: '/images/lessons/a1/01-greetings.webp',
    2: '/images/lessons/a1/02-cafe.webp',
    3: '/images/lessons/a1/03-store.webp',
    4: '/images/lessons/a1/04-home-routine.webp',
    5: '/images/lessons/a1/05-work.webp',
    6: '/images/lessons/a1/06-family.webp',
    7: '/images/lessons/a1/07-time-meetings.webp',
    8: '/images/lessons/a1/08-weather-clothing.webp',
    9: '/images/lessons/a1/09-transport.webp',
    10: '/images/lessons/a1/10-full-day.webp',
  },
};

export const getLessonImage = (levelCode, lessonId) => (
  lessonImages[String(levelCode).toUpperCase()]?.[Number(lessonId)]
  || '/images/auth-norway-fjord.webp'
);

