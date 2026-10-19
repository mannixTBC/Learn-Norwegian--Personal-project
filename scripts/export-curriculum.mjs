import { build } from 'vite';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const root = resolve(import.meta.dirname, '..');
const outDir = resolve(root, 'node_modules/.cache/curriculum');
await build({ configFile: false, logLevel: 'error', build: { ssr: resolve(root, 'src/modules/lessons/norwegian-program/lessonContent.js'), outDir, emptyOutDir: false, rollupOptions: { output: { entryFileNames: 'curriculum.mjs' } } } });
const { courseCatalog } = await import(pathToFileURL(resolve(outDir, 'curriculum.mjs')));
const lines = [
  '# Programa de norvegiană NordLingo · A1–C2', '',
  '## Organizare și continuitate', '',
  'Șase niveluri, fiecare cu șase secțiuni. O secțiune conține trei lecții de învățare și o misiune de consolidare: 24 de lecții pe nivel, 144 în total.', '',
  'Fiecare lecție pornește de la rezultate comunicative concrete. Expresiile se învață împreună cu sensul și un exemplu complet, apoi reapar în dialoguri noi, lecturi și sarcini proprii. Reactivările păstrează legătura cu lecția în care expresia a fost introdusă.', '',
  'Misiunile de consolidare reutilizează vocabularul și gramatica celor trei lecții. Nu introduc vocabular obligatoriu nou. Începând cu B1, fiecare secțiune are o lectură extinsă; C1 și C2 adaugă sens implicit, registre, sinteză și control stilistic.', '',
  '## Ritm recomandat', '',
  '- Începe cu 3–5 minute de reamintire, fără traducere vizibilă.',
  '- Parcurge vocabularul în grupuri mici și ascultă propozițiile complete.',
  '- Reutilizează două expresii cunoscute în situația nouă.',
  '- Scrie și vorbește pornind de la o sarcină cu scop concret; revizuiește cu criteriile lecției.',
  '- Revino după 1, 3 și 7 zile. După trei lecții, parcurge misiunea secțiunii.',
  '- Împarte o lecție în două sesiuni dacă ai nevoie și reia ciclul până poți îndeplini sarcina cu sprijin redus.', '',
  'Un exemplu de săptămână: prima lecție luni, a doua marți, recapitulare miercuri, a treia lecție joi și misiunea vineri. În weekend, reutilizează expresiile într-o conversație, o lectură sau o înregistrare proprie. La nivelurile avansate, întinde secțiunea pe mai multe zile pentru documentare și revizuire.', '',
  'Trecerea la secțiunea următoare se bazează pe trei dovezi: înțelegi expresiile fără traducere imediată, rezolvi situația comunicativă cu sprijin redus și îți poți revizui un răspuns propriu după criterii. Dacă acestea lipsesc, reia sarcina și exemplele relevante înainte de material nou.', '',
  'Duratele sunt estimări pentru materialul din aplicație. Nu reprezintă un număr garantat de ore pentru atingerea unui nivel CEFR. Rezultatele la exercițiile cu răspuns fix și autoevaluarea producției scrise/orale sunt lucruri separate.', '',
  '## Repere editoriale', '',
  '- [Cele șase niveluri CEFR — Consiliul Europei](https://www.coe.int/en/web/common-european-framework-reference-languages/table-1-cefr-3.3-common-reference-levels-global-scale)',
  '- [Abordarea orientată spre acțiune — Consiliul Europei](https://www.coe.int/en/web/common-european-framework-reference-languages/action-orientation-in-the-classroom)',
  '- [Programa de norvegiană pentru adulți A1–B2 — HK-dir](https://hkdir.no/dokumenter/les-dokumentet/laereplan-i-norsk-for-voksne-innvandrere)', '',
  'Aceste surse orientează selecția obiectivelor și tipul sarcinilor. Programa aplicației este o construcție editorială proprie, nu un curs acreditat sau o certificare oficială.', '',
];
for (const course of Object.values(courseCatalog)) {
  lines.push(`## ${course.code} · ${course.title}`, '', course.outcome, '');
  for (const section of course.sections) {
    lines.push(`### ${section.number}. ${section.title}`, '', `**Scop:** ${section.outcome}`, '');
    lines.push(`**Structuri și strategii:** ${section.lessons.filter((lesson) => lesson.kind === 'lesson').map((lesson) => lesson.grammar.title).join('; ')}.`, '');
    for (const lesson of section.lessons) {
      lines.push(`- **${String(lesson.id).padStart(2, '0')}. ${lesson.title}** — ${lesson.duration} min; ${lesson.kind === 'consolidation' ? 'consolidare fără elemente obligatorii noi' : `${lesson.introducedVocabulary.length} expresii introduse; ${lesson.recycledVocabulary.length} reactivări`}.`);
      if (lesson.recycledVocabulary.length) lines.push(`  - Reapar: ${lesson.recycledVocabulary.map(({ entry }) => `„${entry[0]}”`).join(', ')}.`);
    }
    lines.push('', `**Misiunea secțiunii:** ${section.mission}`, '');
  }
}
lines.push('## Progres și compatibilitate', '', 'Progresul noii programe este separat prin versiunea curriculară și utilizator. Istoricul de studiu, recapitulările și cheile vechii programe sunt păstrate. Nu se echivalează automat lecții doar pentru că au același număr.', '', 'Pentru baze Supabase existente, aplică migrarea aditivă pentru C1/C2 din `supabase/migrations/` înainte de sincronizarea noilor niveluri. Fișierele de schemă actualizate sunt suficiente numai pentru instalări noi.', '');
mkdirSync(resolve(root, 'docs'), { recursive: true });
writeFileSync(resolve(root, 'docs/PROGRAMA_NORVEGIANA.md'), lines.join('\n'));
console.log(`Programa exportată: ${Object.keys(courseCatalog).length} niveluri, ${Object.values(courseCatalog).reduce((sum, course) => sum + course.lessons.length, 0)} lecții.`);
