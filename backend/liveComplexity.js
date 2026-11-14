'use strict';
const profiles={
 A1:'Use 1–2 very short sentences, usually 5–8 words each. Use concrete everyday words, present tense and one direct question. Accept single words and short phrases. Avoid idioms, abstract questions and subordinate clauses.',
 A2:'Use 2–3 short sentences about familiar situations. Use simple present, past or future when relevant. Ask one concrete question and accept simple connected sentences.',
 B1:'Use 2–4 clear sentences with familiar connectors. Invite experiences, plans and a simple reason. Ask one open question; allow time for a connected answer.',
 B2:'Use 2–4 natural sentences with varied syntax. Invite opinions, supporting arguments, comparisons and alternatives. Use common idioms sparingly with context. Ask one focused follow-up.',
 C1:'Use 2–4 concise, sophisticated sentences. Explore implications, counterarguments, nuance and appropriate register. Use natural idiomatic language, without artificial difficulty. Ask one focused question.',
 C2:'Use 2–4 natural, precise sentences. Explore subtle distinctions, synthesis, rhetorical intent and register when relevant to the chosen topic. Do not use obscure vocabulary merely to make the conversation harder. Ask one focused question.',
};
function liveComplexity(level){
 if(!Object.hasOwn(profiles,level))throw new Error('Invalid live level');
 return `# CEFR complexity: ${level}\n${profiles[level]}\nAdapt within this selected level from the learner's recent meaningful replies, not accent, silence or uncertain transcription. A valid short answer is not automatically a sign of difficulty. If the learner asks for help, struggles repeatedly or says they do not understand, rephrase the LAST question on the SAME topic with shorter sentences and simpler vocabulary; if needed offer two choices or one brief model answer. Wait for their answer rather than completing it for them. After two or more confident, relevant answers, gradually restore the selected level and ask for one extra detail, reason or nuance appropriate to that level. Change only one difficulty dimension at a time. Never raise the selected CEFR level, announce a level diagnosis, award scores or turn free conversation into an exam. Honor explicit requests to slow down or simplify immediately. Keep the language rules unchanged during simplification. Give at most one high-confidence useful correction per turn; distinguish optional stylistic suggestions from errors. At higher levels, everyday topics and simple greetings remain welcome.`;
}
module.exports={liveComplexity};
