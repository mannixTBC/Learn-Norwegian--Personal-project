/**
 * Construirea contextului lecției pentru system prompt-ul asistentului AI.
 *
 * Sursele de lecții sunt ESM (în src/), dar backend-ul e CommonJS (Node).
 * Pentru a nu duplica tot conținutul, importăm lecțiile dinamic din fișierele
 * ESM prin require cu loader-ul experimental, sau — mai simplu și robust —
 * citim fișierele la prima utilizare. Aici folosim o abordare pragmatică:
 * un subset esențial (vocabular, gramatică, dialog) pentru primele lecții A1.
 *
 * TODO viitor: când vrem context complet pentru toate nivelurile, putem fie
 * (a) muta datele lecțiilor într-un modul CommonJS partajat, fie
 * (b) genera un JSON static la build. Pentru această fază de infrastructură,
 * contextul A1 este suficient pentru a testa fluxul end-to-end.
 */

// ── Lecții A1 (subset pentru context AI) ──────────────────────────────
// Aceste date oglindește src/modules/lessons/norwegian-program/lessonContent.js.
// La o mutare viitoare a datelor în CommonJS, se înlocuiește importul aici.
const a1Lessons = [
  {
    id: 1,
    title: 'Salutări și prezentări',
    vocabulary: [
      ['Hei', 'Salut', 'Hei! Jeg heter Anna.'],
      ['Jeg heter', 'Mă numesc', 'Jeg heter Anna.'],
      ['Hva heter du?', 'Cum te numești?', 'Hei! Hva heter du?'],
      ['Hvordan har du det?', 'Cum te simți?', 'Hvordan har du det i dag?'],
      ['Bra, takk', 'Bine, mulțumesc', 'Jeg har det bra, takk.'],
      ['Hyggelig å møte deg', 'Încântat de cunoștință', 'Hyggelig å møte deg!'],
    ],
    dialogue: [
      ['Anna', 'Hei! Jeg heter Anna. Hva heter du?'],
      ['Lars', 'Jeg heter Lars. Hyggelig å møte deg!'],
      ['Anna', 'Hyggelig å møte deg! Hvordan har du det?'],
      ['Lars', 'Bra, takk.'],
    ],
    grammar: {
      title: '„Jeg”, „du” și verbul „er”',
      rule: '„Jeg” înseamnă „eu”, „du” înseamnă „tu”, iar verbul rămâne la aceeași formă: jeg er, du er.',
      examples: ['Jeg er Anna. — Eu sunt Anna.', 'Du er Lars. — Tu ești Lars.'],
    },
  },
  {
    id: 2,
    title: 'La cafenea',
    vocabulary: [
      ['En kaffe', 'O cafea', 'En kaffe, takk.'],
      ['Et smørbrød', 'Un sandviș', 'Jeg vil ha et smørbrød.'],
      ['En kake', 'O prăjitură', 'Jeg vil ha en kake.'],
      ['Vann', 'Apă', 'Jeg vil ha vann.'],
      ['Jeg vil ha', 'Doresc', 'Jeg vil ha en kaffe.'],
      ['Ja, takk', 'Da, mulțumesc', 'Ja, takk.'],
    ],
    dialogue: [
      ['Client', 'Hei! Jeg vil ha en kaffe, takk.'],
      ['Servitør', 'Vil du ha et smørbrød?'],
      ['Client', 'Ja, takk.'],
      ['Servitør', 'En kaffe og et smørbrød.'],
    ],
    grammar: {
      title: 'Articolele „en” și „et”',
      rule: 'Substantivele norvegiene au un articol: en kaffe, et smørbrød.',
      examples: ['en kaffe — o cafea', 'et smørbrød — un sandviș'],
    },
  },
  {
    id: 3,
    title: 'În magazin',
    vocabulary: [
      ['En butikk', 'Un magazin', 'Jeg er i en butikk.'],
      ['Unnskyld', 'Scuzați-mă', 'Unnskyld, hvor er melken?'],
      ['Hvor er...?', 'Unde este...?', 'Hvor er melken?'],
      ['Hvor mye?', 'Cât?', 'Hvor mye koster det?'],
      ['Et kort', 'Un card', 'Jeg betaler med kort.'],
      ['En kvittering', 'Un bon', 'Vil du ha en kvittering?'],
    ],
    dialogue: [
      ['Anna', 'Unnskyld, hvor er melken?'],
      ['Ansatt', 'Melken er der borte.'],
      ['Anna', 'Hvor mye koster det?'],
      ['Ansatt', 'Det koster 35 kroner.'],
    ],
    grammar: {
      title: 'Întrebări cu „hva” și „hvor”',
      rule: '„Hva” = ce, „hvor” = unde, „hvor mye” = cât.',
      examples: ['Hvor er melken? — Unde este laptele?', 'Hvor mye koster det? — Cât costă?'],
    },
  },
];

const levelCatalog = {
  A1: a1Lessons,
};

/**
 * Returnează lecția curentă (sau null dacă nu există).
 * @param {string} level Cod nivel (A1, A2, B1, B2).
 * @param {number} lessonId ID lecție (1-based).
 */
const findLesson = (level, lessonId) => {
  const lessons = levelCatalog[level] || levelCatalog.A1;
  const id = Number(lessonId) || 1;
  return lessons.find((lesson) => lesson.id === id) || lessons[0];
};

/**
 * Construieste un text cu contextul lecției pentru system prompt-ul AI.
 * Include: vocabularul lecției curente + al lecțiilor anterioare din același nivel,
 * gramatica lecției curente și un dialog model.
 *
 * @param {string} level Cod nivel.
 * @param {number} lessonId ID lecție curentă.
 * @returns {string} Context formatat pentru AI.
 */
const buildLessonContext = (level, lessonId) => {
  const lessons = levelCatalog[level] || levelCatalog.A1;
  const id = Number(lessonId) || 1;
  const currentLesson = findLesson(level, id);

  // Lecțiile anterioare (ID < curent) pentru context acumulat.
  const previousLessons = lessons.filter((lesson) => lesson.id < id);
  const currentLevel = level || 'A1';

  const lines = [];
  lines.push(`Nivel: ${currentLevel}. Lecția curentă: ${id} — „${currentLesson.title}”.`);
  lines.push('');
  lines.push('VOCABULARUL LECȚIEI CURENTE (cuvânt norvegian | sens în română | exemplu):');
  currentLesson.vocabulary.forEach(([word, meaning, example]) => {
    lines.push(`- ${word} = ${meaning}. Ex: „${example}”`);
  });

  if (previousLessons.length) {
    lines.push('');
    lines.push('VOCABULAR ÎNVĂȚAT ÎN LECȚIILE ANTERIOARE (poți folosi și aceste cuvinte):');
    previousLessons.forEach((lesson) => {
      const words = lesson.vocabulary.map(([w]) => w).join(', ');
      lines.push(`- Lecția ${lesson.id} „${lesson.title}”: ${words}`);
    });
  }

  if (currentLesson.grammar) {
    lines.push('');
    lines.push(`GRAMATICA LECȚIEI CURENTE: ${currentLesson.grammar.title}`);
    lines.push(`Regulă: ${currentLesson.grammar.rule}`);
    if (currentLesson.grammar.examples) {
      lines.push(`Exemple: ${currentLesson.grammar.examples.join(' | ')}`);
    }
  }

  if (currentLesson.dialogue && currentLesson.dialogue.length) {
    lines.push('');
    lines.push('DIALOG MODEL (folosește un ton similar):');
    currentLesson.dialogue.forEach(([speaker, text]) => {
      lines.push(`${speaker}: ${text}`);
    });
  }

  return lines.join('\n');
};

module.exports = { buildLessonContext, findLesson };
