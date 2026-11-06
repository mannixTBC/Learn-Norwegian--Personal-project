// Lossless localization: executable exercise data stays in the shared payload.
// Text slots are JSON paths, never evaluated as code or used as object setters.
const textFields = new Set(['title','description','outcome','mission','objectives','prompt','instruction',
  'explanation','translation','romanian','rule','label','expectation','brief','role','place','goals',
  'writingPrompt','speakingPrompt','criteria','buildsOn','sectionTitle','cycle','daily','progression','scope']);
const pairs = new Map([['vocabulary',[1,3]],['introducedVocabulary',[1,3]],['recycledVocabulary',[1,3]],
  ['dialogue',[2]],['bridgeDialogue',[2]],['conversationPrompts',[1]]]);
export function splitContent(value) {
  const strings = {};
  function visit(node, path, localize = false) {
    if (typeof node === 'string' && localize) { strings[path] = node; return {$text:path}; }
    if (Array.isArray(node)) return node.map((child,i)=>visit(child,`${path}/${i}`,localize));
    if (!node || typeof node !== 'object') return node;
    if (Object.hasOwn(node,'$text')) throw new Error('Reserved content field: $text');
    return Object.fromEntries(Object.entries(node).map(([key,child])=>{
      const next = `${path}/${key.replaceAll('~','~0').replaceAll('/','~1')}`;
      if (pairs.has(key) && Array.isArray(child)) return [key,child.map((row,i)=>Array.isArray(row)
        ? row.map((part,j)=>visit(part,`${next}/${i}/${j}`,pairs.get(key).includes(j))) : visit(row,`${next}/${i}`))];
      // Combined bilingual grammar examples are editorial text, not answers.
      const localized = textFields.has(key) || (key === 'examples' && path.startsWith('/grammar'));
      return [key,visit(child,next,localized)];
    }));
  }
  return {payload:visit(value,''),strings};
}
export function joinContent(payload, strings) {
  if (Array.isArray(payload)) return payload.map(value=>joinContent(value,strings));
  if (!payload || typeof payload !== 'object') return payload;
  if (Object.hasOwn(payload,'$text')) {
    if (Object.keys(payload).length !== 1 || typeof payload.$text !== 'string'
      || !Object.hasOwn(strings,payload.$text) || typeof strings[payload.$text] !== 'string') throw new Error('Incomplete content translation');
    return strings[payload.$text];
  }
  return Object.fromEntries(Object.entries(payload).map(([key,value])=>[key,joinContent(value,strings)]));
}
