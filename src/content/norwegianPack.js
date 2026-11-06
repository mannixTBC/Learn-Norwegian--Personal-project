// Authored Norwegian content and rules are preserved without rewriting exercises.
import * as games from '../modules/exercises/practiceGameData.js';
import * as practice from '../modules/exercises/practiceActivities.js';
import * as words from '../modules/exercises/wordDiscoveryCatalog.js';
import * as spelling from '../modules/exercises/wordSpelling.js';
import * as sentences from '../modules/exercises/sentencePractice.js';
import * as verbs from '../modules/exercises/challenge30/verbNotebookData.js';
import * as verbPractice from '../modules/exercises/challenge30/verbPracticeData.js';
import * as recall from '../modules/lessons/activeRecall.js';
import * as courses from '../modules/lessons/norwegian-program/lessonContent.js';
import * as grammar from '../modules/lessons/grammar/nbContent.js';
import * as ruleGuides from '../modules/lessons/grammar/ruleGuideContent.js';
import * as basicGuides from '../modules/lessons/grammar/basicGuides.js';
import * as summary from '../modules/lessons/lessonSummaryData.js';
import scenarios from '../modules/exercises/conversationScenarios.json';
import * as career from '../services/careerProfile.js';
export const norwegianPack={learningLanguage:'nb',supportLanguage:'ro',version:'2026.2',features:{
 games:()=>games,
 practice:()=>practice,
 words:()=>words,
 spelling:()=>spelling,
 sentences:()=>sentences,
 verbs:()=>verbs,
 verbPractice:()=>verbPractice,
 recall:()=>recall,
 courses:()=>courses,
 grammar:()=>grammar,
 ruleGuides:()=>ruleGuides,
 basicGuides:()=>basicGuides,
 summary:()=>summary,
 scenarios:()=>scenarios,
 career:()=>career,
 keyboardRows:()=>['QWERTYUIOP','ASDFGHJKL','ZXCVBNM','ÆØÅ'],
}};
