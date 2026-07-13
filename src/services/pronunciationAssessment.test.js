import { assessPronunciation, normalizeNorwegian } from './pronunciationAssessment';

describe('pronunciation assessment', () => {
  it('awards a full score when the complete phrase is recognized clearly', () => {
    const result = assessPronunciation({
      referenceText: 'Jeg opplevde noe uventet på reisen.',
      transcript: 'Jeg opplevde noe uventet på reisen',
      duration: 3.48,
    });

    expect(result.score).toBe(100);
    expect(result.accuracy).toBe(100);
    expect(result.completeness).toBe(100);
    expect(result.alignment.every((word) => word.status === 'correct')).toBe(true);
  });

  it('marks a missing word and lowers the score without failing the exercise', () => {
    const result = assessPronunciation({
      referenceText: 'Plutselig begynte det å snø.',
      transcript: 'Plutselig begynte å snø',
      duration: 2.8,
    });

    expect(result.score).toBeLessThan(100);
    expect(result.alignment.some((word) => word.expected === 'det' && word.status === 'missing')).toBe(true);
  });

  it('keeps Norwegian characters while normalizing punctuation', () => {
    expect(normalizeNorwegian('  Først, går vi på Øya!  ')).toBe('først går vi på øya');
  });
});
