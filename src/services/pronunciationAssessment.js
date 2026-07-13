const normalizeText = (value = '') => String(value)
  .toLocaleLowerCase('nb-NO')
  .normalize('NFC')
  .replace(/[^a-zæøå0-9\s-]/gi, ' ')
  .replace(/-/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const editDistance = (left, right) => {
  const rows = Array.from({ length: left.length + 1 }, () => Array(right.length + 1).fill(0));
  for (let i = 0; i <= left.length; i += 1) rows[i][0] = i;
  for (let j = 0; j <= right.length; j += 1) rows[0][j] = j;
  for (let i = 1; i <= left.length; i += 1) {
    for (let j = 1; j <= right.length; j += 1) {
      rows[i][j] = Math.min(
        rows[i - 1][j] + 1,
        rows[i][j - 1] + 1,
        rows[i - 1][j - 1] + (left[i - 1] === right[j - 1] ? 0 : 1),
      );
    }
  }
  return rows[left.length][right.length];
};

const wordSimilarity = (left, right) => {
  if (left === right) return 1;
  const longest = Math.max(left.length, right.length);
  return longest ? 1 - (editDistance(left, right) / longest) : 0;
};

const substitutionCost = (expected, spoken) => {
  const similarity = wordSimilarity(expected, spoken);
  if (similarity === 1) return 0;
  if (similarity >= 0.68) return 0.38;
  return 1;
};

const alignWords = (expectedWords, spokenWords) => {
  const rows = expectedWords.length + 1;
  const columns = spokenWords.length + 1;
  const matrix = Array.from({ length: rows }, () => Array(columns).fill(0));
  for (let i = 0; i < rows; i += 1) matrix[i][0] = i;
  for (let j = 0; j < columns; j += 1) matrix[0][j] = j;

  for (let i = 1; i < rows; i += 1) {
    for (let j = 1; j < columns; j += 1) {
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + substitutionCost(expectedWords[i - 1], spokenWords[j - 1]),
      );
    }
  }

  const result = [];
  let i = expectedWords.length;
  let j = spokenWords.length;
  while (i > 0 || j > 0) {
    const substitution = i > 0 && j > 0
      ? matrix[i - 1][j - 1] + substitutionCost(expectedWords[i - 1], spokenWords[j - 1])
      : Number.POSITIVE_INFINITY;
    const deletion = i > 0 ? matrix[i - 1][j] + 1 : Number.POSITIVE_INFINITY;
    const insertion = j > 0 ? matrix[i][j - 1] + 1 : Number.POSITIVE_INFINITY;

    if (Math.abs(matrix[i][j] - substitution) < 0.001) {
      const similarity = wordSimilarity(expectedWords[i - 1], spokenWords[j - 1]);
      result.unshift({
        expected: expectedWords[i - 1],
        spoken: spokenWords[j - 1],
        status: similarity === 1 ? 'correct' : similarity >= 0.68 ? 'close' : 'different',
      });
      i -= 1;
      j -= 1;
    } else if (Math.abs(matrix[i][j] - deletion) < 0.001) {
      result.unshift({ expected: expectedWords[i - 1], spoken: '', status: 'missing' });
      i -= 1;
    } else if (Math.abs(matrix[i][j] - insertion) < 0.001) {
      result.unshift({ expected: '', spoken: spokenWords[j - 1], status: 'extra' });
      j -= 1;
    } else {
      break;
    }
  }
  return result;
};

const scoreRhythm = (duration, wordCount) => {
  if (!duration || !wordCount) return 70;
  const idealDuration = Math.max(1.5, wordCount * 0.58);
  const ratio = duration / idealDuration;
  if (ratio >= 0.7 && ratio <= 1.55) return 100;
  if (ratio < 0.7) return Math.max(35, Math.round(100 - ((0.7 - ratio) * 150)));
  return Math.max(35, Math.round(100 - ((ratio - 1.55) * 45)));
};

const feedbackFor = (score, focusWords) => {
  if (score >= 90) return { tone: 'excellent', title: 'Pronunție foarte clară', text: 'Fraza a fost recunoscută aproape integral. Repetă o dată la viteză normală pentru consolidare.' };
  if (score >= 75) return { tone: 'good', title: 'Foarte bine', text: focusWords.length ? 'Mesajul este clar. Mai repetă cuvintele marcate și păstrează ritmul modelului.' : 'Mesajul este clar și ritmul este potrivit.' };
  if (score >= 55) return { tone: 'practice', title: 'Bază bună, mai lucrăm la claritate', text: 'Ascultă varianta lentă, repetă pe grupuri de cuvinte și înregistrează din nou.' };
  return { tone: 'retry', title: 'Încearcă încă o dată, mai rar', text: 'Apropie-te de microfon, ascultă modelul lent și pronunță fiecare cuvânt separat.' };
};

export const assessPronunciation = ({ referenceText, transcript, words = [], duration = 0, provider = 'browser' }) => {
  const expectedWords = normalizeText(referenceText).split(' ').filter(Boolean);
  const spokenWords = normalizeText(transcript).split(' ').filter(Boolean);
  const alignment = alignWords(expectedWords, spokenWords);
  const comparable = alignment.filter((item) => item.expected);
  const points = comparable.reduce((total, item) => total + (item.status === 'correct' ? 1 : item.status === 'close' ? 0.65 : 0), 0);
  const accuracy = expectedWords.length ? Math.round((points / expectedWords.length) * 100) : 0;
  const recognized = comparable.filter((item) => item.status === 'correct' || item.status === 'close').length;
  const completeness = expectedWords.length ? Math.round((recognized / expectedWords.length) * 100) : 0;
  const timedWords = words.filter((word) => Number.isFinite(word.start) && Number.isFinite(word.end));
  const speechDuration = timedWords.length
    ? timedWords[timedWords.length - 1].end - timedWords[0].start
    : duration;
  const rhythm = scoreRhythm(speechDuration, expectedWords.length);
  const score = Math.round((accuracy * 0.7) + (completeness * 0.2) + (rhythm * 0.1));
  const focusWords = comparable.filter((item) => item.status !== 'correct').slice(0, 4);

  return {
    score,
    accuracy,
    completeness,
    rhythm,
    transcript: transcript.trim(),
    alignment,
    focusWords,
    provider,
    feedback: feedbackFor(score, focusWords),
  };
};

export const normalizeNorwegian = normalizeText;
