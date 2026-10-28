const {test}=require('node:test');const assert=require('node:assert/strict');const {profiles,openingFor,promptFor,parseReply}=require('./freeConversationLevels');
test('all levels have distinct openings and valid contextual support',()=>{
 const replies=new Set();for(const level of Object.keys(profiles)){const opening=openingFor(level);assert.ok(parseReply(JSON.stringify(opening),''));replies.add(opening.reply);assert.ok(promptFor(level).includes(profiles[level].guidance));}
 assert.equal(replies.size,6);
});
test('malformed learning support and corrections without learner evidence are rejected',()=>{
 const valid={...openingFor('A1'),correction:{original:'Jeg er bra',corrected:'Jeg har det bra',explanation:'Pentru starea ta, folosește «har det bra».'}};
 assert.ok(parseReply(JSON.stringify(valid),'Jeg er bra i dag.'));
 assert.equal(parseReply(JSON.stringify(valid),'Jeg liker kaffe.'),null);
 for(const value of [{...valid,examples:[]},{...valid,hint:''},{...valid,simplified:'yes'},{...valid,correction:undefined},{...valid,examples:[{answer:'Hei',translation:''}]},null,[],{...valid,level:'C2'}])assert.equal(parseReply(JSON.stringify(value),'Jeg er bra'),null);
 assert.equal(parseReply('broken JSON','Hei'),null);
 const simplified={...openingFor('A2'),reply:'Hva gjorde du i dag?',simplified:true};assert.ok(parseReply(JSON.stringify(simplified),'Kan du si det enklere?').simplified);
});
