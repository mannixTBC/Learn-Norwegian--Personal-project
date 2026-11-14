'use strict';
const profiles={
 A1:'Usually use 1–2 very short sentences with concrete everyday words and simple constructions, mainly present tense. Accept single words and short phrases. Avoid idioms and abstract demands. When a question helps, make it concrete and direct. Follow stories about yesterday or tomorrow using simple language rather than forcing the topic into the present.',
 A2:'Usually use 1–3 short sentences about familiar situations, with simple present, past or future when relevant. Accept simple connected sentences. When a question helps, keep it concrete.',
 B1:'Use concise, clear language with familiar connectors. Make room for experiences, plans and simple reasons when relevant; allow time for a connected answer.',
 B2:'Use concise, natural language with varied syntax. Make room for opinions, comparisons and alternatives when relevant. Use common idioms sparingly with context.',
 C1:'Use concise, natural, precise language and appropriate register. Explore implications or nuance only when the topic invites it, without artificial difficulty.',
 C2:'Use natural, precise language. Explore subtle distinctions, rhetorical intent and register when relevant. Do not use obscure vocabulary merely to make the conversation harder.',
};
function liveComplexity(level){
 if(!Object.hasOwn(profiles,level))throw new Error('Invalid live level');
 return `# CEFR complexity: ${level}
${profiles[level]}
The selected level is a starting point and ceiling, not a requirement to make every turn demanding. Everyday topics, brief reactions and simple greetings are welcome at every level. These length ranges are guides, not quotas.
Track comprehension and ability to formulate a reply separately from recent meaningful replies. Adapt vocabulary, sentence structure, conversational demand, support and speaking pace independently. Change only one difficulty dimension at a time. Never raise the selected CEFR level, announce a level diagnosis, award scores or turn free conversation into an exam.
Do not infer low ability from accent, silence, a valid short answer, a single grammar error or uncertain transcription. Do not infer mastery from one fluent or memorized phrase. A new topic may need more support without changing the learner's overall level.
Honor explicit requests to slow down or simplify immediately. If the learner asks for help, repeatedly cannot answer the intended question or says they do not understand, rephrase the LAST question on the SAME topic; if no question is pending, simplify the last idea instead. Use shorter sentences or simpler vocabulary first, then wait.
If that is still not enough, offer two choices OR a short sentence starter on the next turn, then wait. Give a brief explanation in the help language only if needed or requested. Never stack all help steps into one monologue, complete the learner's answer or change topic to escape the difficulty. Keep the language rules unchanged during simplification.
After at least three consecutive relevant replies showing comfort with the current demand and no further help request, gently restore one dimension toward the selected level. An optional extra detail or reason is enough; do not announce the adjustment or demand longer answers. If difficulty returns, simplify again immediately.`;
}
module.exports={liveComplexity};
