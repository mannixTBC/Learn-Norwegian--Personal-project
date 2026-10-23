import assert from 'node:assert/strict';
import { build } from 'vite';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const root=resolve(import.meta.dirname,'..');
const outDir=resolve(root,'node_modules/.cache/verb-practice-data-tests');
await build({configFile:resolve(root,'vite.config.js'),logLevel:'error',build:{ssr:true,outDir,emptyOutDir:false,rollupOptions:{input:{data:resolve(root,'src/modules/exercises/challenge30/verbPracticeData.js'),legacy:resolve(root,'src/modules/exercises/challenge30/verbsForLevel.js')},output:{entryFileNames:'[name].mjs'}}}});
const {createVerbSession,getKnownReviewVerbs,isVerbPracticeAnswerCorrect,normalizeVerbPracticeAnswer,verbPracticeId}=await import(pathToFileURL(resolve(outDir,'data.mjs')));
const {getVerbSessions}=await import(pathToFileURL(resolve(outDir,'legacy.mjs')));
const levels=['A1','A2','B1','B2','C1','C2'];
let checkedVerbs=0,checkedQuestions=0;

for(const level of levels){
  const legacy=getVerbSessions(level);
  assert.equal(legacy.length,10,`${level} retains ten existing sessions`);
  for(let day=1;day<=legacy.length;day++){
    const progress={day,completed:Array.from({length:day-1},(_,index)=>index+1)};
    const session=createVerbSession({level,day,progress,now:0});
    assert.equal(session.day,day);
    assert.ok(session.title.length>6&&!session.title.startsWith('Sesiunea'),'Sessions have a short descriptive theme');
    assert.deepEqual(session.verbs.map(verb=>verb.norwegian),legacy[day-1].map(verb=>verb.norwegian),'Legacy verb order is unchanged');
    assert.equal(session.questions.length,day===1?9:11,`${level}/${day} meaningful graded/review questions`);
    assert.deepEqual(session.questions.slice(0,9).map(question=>question.phase),['meaning','meaning','meaning','context','context','context','recall','recall','recall']);
    assert.equal(new Set(session.questions.map(question=>question.id)).size,session.questions.length);
    for(const verb of session.verbs){
      assert.equal(verb.id,verbPracticeId(verb.norwegian));
      for(const field of ['form','romanian','example','translation']) assert.ok(verb[field]?.length>1,`${verb.norwegian}: ${field}`);
      assert.equal(verb.example,verb.context.sentence.replace('___',verb.form));
      assert.notEqual(verb.context.sentence,verb.recall.sentence,'Recall uses another context');
      for(const context of [verb.context,verb.recall]){
        assert.equal(context.sentence.split('___').length,2,`${verb.norwegian} has one blank`);
        assert.equal(context.answer,verb.form);
        assert.ok(context.translation.length>5);
        assert.ok(context.acceptedAnswers.includes(context.answer));
        assert.ok(!/øver vi på verbet|exersăm verbul|verbet «/iu.test(context.sentence),'No metalinguistic filler');
      }
      checkedVerbs++;
    }
    const known=new Set(getKnownReviewVerbs({level,day,progress}).map(verb=>verb.id));
    for(const question of session.questions){
      assert.ok(isVerbPracticeAnswerCorrect(question,question.answer),`${question.id}: answer accepted`);
      assert.ok(isVerbPracticeAnswerCorrect(question,`  ${question.answer.toLocaleUpperCase('nb-NO')}. `),'Harmless case/spacing/punctuation ignored');
      assert.ok(!isVerbPracticeAnswerCorrect(question,'no-such-answer'));
      if(question.old) assert.ok(known.has(question.verbId),'Review never invents prior knowledge');
      if(question.phase==='recall') assert.equal(question.options,undefined,'Unaided recall has no choices');
      else{
        assert.ok(question.options.length>=2&&question.options.length<=3,`${question.id}: useful distinct choices`);
        assert.equal(new Set(question.options).size,question.options.length);
        assert.equal(question.options.filter(option=>isVerbPracticeAnswerCorrect(question,option)).length,1,`${question.id}: exactly one accepted choice`);
      }
      if(question.phase!=='meaning'){
        assert.ok(question.translation,'Every blank has an explicit intended Romanian meaning');
        assert.equal(question.sentence.split('___').length,2);
        assert.ok(!question.sentence.includes(question.answer),`${question.id}: answer not leaked in sentence`);
      }
      checkedQuestions++;
    }
  }
}

assert.equal(checkedVerbs,180);
assert.equal(createVerbSession({level:'A1',day:1}).questions.length,9,'No invented recap at first session');
assert.equal(createVerbSession({level:'C2',day:1}).questions.length,9,'Choosing an advanced level does not assume lower-level progress');
assert.equal(getKnownReviewVerbs({level:'A1',day:5,progress:{day:5,completed:[]}}).length,0,'Explicit empty progress is authoritative');
assert.equal(getKnownReviewVerbs({level:'A1',day:5,progress:{day:5,completed:[1]}}).length,3,'Only completed earlier sessions are eligible');
assert.equal(getKnownReviewVerbs({level:'A1',day:5,progress:{day:2}}).length,3,'Legacy unlock state is respected');
const known=getKnownReviewVerbs({level:'A1',day:4});
const custom=createVerbSession({level:'A1',day:4,reviewVerbs:[known[2].id,known[2].norwegian,{norwegian:known[0].norwegian},'å utelukke']});
assert.deepEqual(custom.reviewVerbs.map(verb=>verb.id),[known[2].id,known[0].id],'Due-order selection supports IDs/strings/objects and rejects duplicates/future words');
assert.equal(createVerbSession({level:'A1',day:4,reviewVerbs:[]}).questions.length,9,'An explicit empty queue adds no recap');
assert.deepEqual(createVerbSession({level:'B1',day:8,now:0}),createVerbSession({level:'B1',day:8,now:0}),'Same inputs produce stable sessions');
const rotations=new Set(Array.from({length:12},(_,day)=>createVerbSession({level:'A1',day:8,now:day*86400000}).reviewVerbs.map(verb=>verb.id).join('|')));
assert.ok(rotations.size>2,'Review rotates through older sessions, not only the immediately previous batch');
const clear=createVerbSession({level:'B1',day:9});
const greie=clear.questions.find(question=>question.phase==='recall'&&question.infinitive==='å greie');
assert.ok(isVerbPracticeAnswerCorrect(greie,'klarer'),'A genuinely valid synonym is accepted in recall');
const synes=createVerbSession({level:'B1',day:10}).questions.find(question=>question.phase==='recall'&&question.infinitive==='å synes');
assert.ok(isVerbPracticeAnswerCorrect(synes,'syns'),'Official Bokmål spelling accepted');
assert.notEqual(normalizeVerbPracticeAnswer('før'),normalizeVerbPracticeAnswer('for'),'Norwegian letters retain their meaning');
assert.equal(createVerbSession({level:'a1',day:-5}).day,1);
assert.equal(createVerbSession({level:'A1',day:100}).day,10);
assert.throws(()=>createVerbSession({level:'Z9'}),RangeError);
const mutable=createVerbSession({level:'A1',day:1});
mutable.verbs[0].context.acceptedAnswers.push('bad');
assert.ok(!createVerbSession({level:'A1',day:1}).verbs[0].context.acceptedAnswers.includes('bad'),'Consumers cannot mutate the source contexts');
console.log(`Verb practice data: ${checkedVerbs} verb positions, ${checkedQuestions} questions, six levels and all legacy session orders passed.`);
