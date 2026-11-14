'use strict';
const {currentLanguages} = require('./languageContext');
const phrases = {
  ro:['Nu avem încă un răspuns de evaluat. Poți relua situația când dorești.','Ai exersat:','Ai exersat cu ajutor:','Ai participat la dialog.','Reține:','Mai exersează:','Repetă situația cu alte detalii.'],
  en:['There is no answer to assess yet. You can restart whenever you like.','You practised:','You practised with help:','You took part in the dialogue.','Remember:','Keep practising:','Repeat the situation with different details.'],
  pl:['Nie ma jeszcze odpowiedzi do oceny. Możesz zacząć ponownie w dowolnej chwili.','Przećwiczono:','Przećwiczono z pomocą:','Udało Ci się wziąć udział w rozmowie.','Zapamiętaj:','Ćwicz dalej:','Powtórz sytuację, zmieniając szczegóły.'],
  uk:['Ще немає відповіді для оцінювання. Можеш почати знову, коли захочеш.','Ти потренувався в такому:','За допомогою підказок ти потренувався в такому:','Ти взяв участь у діалозі.','Запам’ятай:','Ще потренуй:','Повтори ситуацію з іншими деталями.'],
  lt:['Dar nėra atsakymo, kurį būtų galima įvertinti. Gali pradėti iš naujo, kai norėsi.','Praktikavaisi:','Praktikavaisi su pagalba:','Dalyvavai pokalbyje.','Prisimink:','Dar pasipraktikuok:','Pakartok situaciją pakeisdamas detales.'],
  ar:['لا توجد إجابة لتقييمها بعد. يمكنك البدء من جديد متى شئت.','تدرّبت على:','تدرّبت بمساعدة على:','شاركت في الحوار.','تذكّر:','واصل التدرّب على:','كرّر الموقف بتفاصيل مختلفة.'],
  de:['Es gibt noch keine Antwort zu bewerten. Du kannst jederzeit neu beginnen.','Du hast geübt:','Du hast mit Hilfe geübt:','Du hast am Dialog teilgenommen.','Merke dir:','Übe weiter:','Wiederhole die Situation mit anderen Details.'],
  es:['Todavía no hay una respuesta que evaluar. Puedes volver a empezar cuando quieras.','Has practicado:','Has practicado con ayuda:','Has participado en el diálogo.','Recuerda:','Sigue practicando:','Repite la situación con otros detalles.'],
};
function lessonFeedback(session, summary, language = currentLanguages().supportLanguage) {
  const p = phrases[language];
  if (!p) throw Object.assign(new Error('Feedback language unavailable'), {status:409,code:'LANGUAGE_UNAVAILABLE'});
  if (!session.turn) return p[0];
  const observed = summary.goals.find(goal => goal.kind === 'objective' && goal.status !== 'unpractised');
  const missing = summary.goals.find(goal => goal.status === 'unpractised');
  const correction = summary.reviewCandidates[0];
  const short = text => String(text || '').split(/\s+/).slice(0,8).join(' ').replace(/[.!?,;:]+$/u,'');
  const success = observed ? `${p[observed.status === 'supported' ? 2 : 1]} ${short(observed.label)}.` : p[3];
  const suggestion = correction ? `${p[4]} „${short(correction.corrected)}”.` : missing ? `${p[5]} ${short(missing.label)}.` : p[6];
  return `${success} ${suggestion}`;
}
module.exports = {lessonFeedback};
