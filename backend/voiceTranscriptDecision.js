const NORWEGIAN_CODES = /^(no|nb|nn|nor)(-|$)/i;
const ROMANIAN_CODES = /^(ro|ron|rum)(-|$)/i;

const normalize = (value) => String(value || '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLocaleLowerCase('ro-RO')
  .replace(/[^a-z\u00e6\u00f8\u00e50-9\s'-]/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const languageSignal = (languages) => {
  if (!Array.isArray(languages) || languages.length === 0) return 'unknown';
  const codes = languages.map((language) => (
    typeof language === 'string' ? language : language?.code
  )).filter((code) => typeof code === 'string');
  const norwegian = codes.some((code) => NORWEGIAN_CODES.test(code));
  const romanian = codes.some((code) => ROMANIAN_CODES.test(code));
  if (norwegian && romanian) return 'mixed';
  if (norwegian) return 'norwegian';
  if (romanian) return 'romanian';
  return 'unknown';
};

const questionKind = (question) => {
  const value = normalize(question);
  if (/\b(hva heter du|navnet ditt)\b/.test(value)) return 'name';
  if (/\b(hvor gammel|hvor mange|hvilket ar|hvilken dato|hva er klokka)\b/.test(value)) return 'number';
  if (/^(er|har|kan|vil|skal|liker|bor|jobber|studerer|snakker|kommer)\b/.test(value)) return 'yes-no';
  return 'open';
};

const looksRomanian = (text) => {
  const value = normalize(text);
  return /\b(ma|eu|sunt|este|cheama|numele|meu|mea|da|nu|bine|vreau|imi|place|locuiesc|lucrez|studiez|romaneste)\b/.test(value);
};

const looksNorwegian = (text) => {
  const value = normalize(text);
  return /\b(jeg|heter|er|har|kan|vil|skal|liker|bor|jobber|studerer|snakker|kommer|takk|bra|og|ikke|det|min|mitt)\b/.test(value)
    || /[\u00e6\u00f8\u00e5]/i.test(String(text || ''));
};

const stableTranscript = (left, right) => {
  const a = normalize(left);
  const b = normalize(right);
  if (!a || !b) return false;
  return a === b || (a.length >= 5 && b.length >= 5 && (a.includes(b) || b.includes(a)));
};

const plausibleName = (text) => {
  const value = normalize(text);
  if (!value || looksRomanian(value)) return false;
  if (/^(jeg heter|navnet mitt er)\s+[a-z\u00e6\u00f8\u00e5'-]+(?:\s+[a-z\u00e6\u00f8\u00e5'-]+){0,2}$/.test(value)) return true;
  const words = value.split(' ');
  if (words.length !== 1) return false;
  if (words.some((word) => ['ja', 'nei', 'jo', 'hei', 'takk', 'bra', 'ok', 'okay'].includes(word))) return false;
  return words.every((word) => /^[a-z\u00e6\u00f8\u00e5][a-z\u00e6\u00f8\u00e5'-]*$/.test(word));
};

const contextAcceptsShortAnswer = (question, text) => {
  const value = normalize(text);
  if (!value) return false;
  const kind = questionKind(question);
  if (kind === 'name') return plausibleName(text);
  if (kind === 'yes-no') return /^(ja|nei|jo)( det (er|har|kan|vil) jeg)?$/.test(value);
  if (kind === 'number') return /^(\d+|null|en|ett|to|tre|fire|fem|seks|sju|syv|atte|ni|ti)( ar)?$/.test(value);
  return false;
};

const retry = (text, reason) => ({
  decision: 'retry',
  text,
  reason,
  message: 'Nu am identificat un răspuns norvegian suficient de clar. Încearcă din nou; întrebarea rămâne aceeași.',
});

const confirm = (text, reason) => ({
  decision: 'confirm',
  text,
  reason,
  message: `Am auzit „${text}”. Ai vrut să spui asta?`,
});

const accept = (text, reason) => ({ decision: 'accept', text, reason });

const decidePrimaryTranscript = ({ text, languages }) => {
  const signal = languageSignal(languages);
  if (signal === 'norwegian' && !looksRomanian(text)) return accept(text, 'detected-norwegian');
  if (signal === 'romanian' && looksRomanian(text) && !looksNorwegian(text)) return retry(text, 'detected-romanian');
  return null;
};

const decideAmbiguousTranscript = ({ primary, secondary, question }) => {
  const primarySignal = languageSignal(primary.languages);
  const secondarySignal = languageSignal(secondary.languages);
  const norwegianText = secondarySignal === 'norwegian' ? secondary.text : primary.text;
  const text = primary.text || secondary.text;
  const stable = stableTranscript(primary.text, secondary.text);

  if (stable && contextAcceptsShortAnswer(question, text)) {
    const singleToken = normalize(text).split(' ').filter(Boolean).length === 1;
    if (singleToken) return accept(text, 'contextual-single-token-answer');
    if (primarySignal === 'romanian' || secondarySignal === 'romanian') {
      return confirm(text, 'contextual-answer-romanian-signal');
    }
    return accept(text, 'contextual-short-answer');
  }
  if ((looksRomanian(primary.text) || looksRomanian(secondary.text))
    && !looksNorwegian(primary.text) && !looksNorwegian(secondary.text)) {
    return retry(text, 'romanian-wording');
  }
  if ((primarySignal === 'norwegian' && secondarySignal === 'romanian')
    || (primarySignal === 'romanian' && secondarySignal === 'norwegian')) {
    return confirm(norwegianText, 'language-conflict');
  }
  if (stable && (looksNorwegian(primary.text) || looksNorwegian(secondary.text))) {
    return primarySignal === 'romanian' && secondarySignal === 'romanian'
      ? confirm(text, 'norwegian-wording-romanian-signal')
      : accept(text, 'stable-norwegian-wording');
  }

  if (secondarySignal === 'norwegian' && primarySignal !== 'romanian' && !looksRomanian(secondary.text)) {
    return accept(secondary.text, 'second-pass-norwegian');
  }
  if (secondarySignal === 'romanian' && primarySignal !== 'norwegian') {
    return confirm(primary.text, 'second-pass-romanian-signal');
  }
  if (normalize(text).split(' ').filter(Boolean).length <= 6) return confirm(text, 'uncertain-short-answer');
  return retry(text, 'uncertain-long-answer');
};

module.exports = {
  normalize,
  languageSignal,
  questionKind,
  decidePrimaryTranscript,
  decideAmbiguousTranscript,
};
