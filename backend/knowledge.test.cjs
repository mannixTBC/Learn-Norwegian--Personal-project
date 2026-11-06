const {test}=require('node:test');const assert=require('node:assert/strict');
const {createKnowledgeService,knowledgeMessage}=require('./knowledge.cjs');
const {bindCourseSession,verifyCourseSession}=require('./courseContext.cjs');
const context={courseId:'nb-general',version:'2026.2',level:'A1',purpose:'information',policyVersion:'1',
 languages:{learningLanguage:'nb',supportLanguage:'ro'},retrievalEnabled:true};
test('scenario references reach partner replies only and never assessment',async()=>{
 const {runScenarioTurn}=require('./scenarioTurn');
 const {scenario,difficulty}=require('./scenarioTutor').context('bus-delay','A1');
 const reference=knowledgeMessage([{itemId:'a1-greetings',text:'Optional reference'}]);
 const calls=[];
 const client={chat:{completions:{create:async request=>{
  calls.push(request);
  const value=calls.length===1?{feedback:'Continua.',objectives:scenario.definition.objectives.map(objective=>({id:objective.id,
   criteria:objective.criteria.map((_,id)=>({id,status:'missing',evidence:[],context:[]}))}))}:{reply:'Hva er årsaken?'};
  return {choices:[{finish_reason:'stop',message:{content:JSON.stringify(value)}}]};
 }}}};
 await runScenarioTurn({client,scenario,difficulty,reference,message:'Hei',session:{level:'A1',turn:0,achieved:[],history:[{role:'assistant',content:scenario.opening}]}});
 assert.equal(calls.length,2);
 assert.equal(calls[0].messages.some(message=>message.content===reference.content),false);
 assert.equal(calls[1].messages.some(message=>message.content===reference.content),true);
});
test('vector retrieval is scoped, bounded and disabled for recap before embedding is billed',async()=>{
 const calls=[],embed=async()=>{calls.push('embed');return [1,...Array(1535).fill(0)];};
 const service=createKnowledgeService({modelId:'model',embed,client:{rpc:async(name,params)=>{
   calls.push(params);return {data:[{item_id:'a1-greetings',chunk_id:'grammar',body:'reference',content_hash:'a',similarity:.9},
     {item_id:'foreign',body:'wrong',similarity:1}]};}}});
 await assert.rejects(()=>service.retrieve({...context,purpose:'recap'},'help',['a1-greetings']),/Unsupported/);assert.deepEqual(calls,[]);
 assert.deepEqual(await service.retrieve(context,'help',[]),[]);assert.deepEqual(calls,[]);
 const matches=await service.retrieve(context,'help',['a1-greetings']);assert.equal(matches.length,1);
 assert.equal(calls[1].p_version,'2026.2');assert.equal(calls[1].p_support_language,'ro');
 assert.deepEqual(calls[1].p_allowed_item_ids,['a1-greetings']);assert.ok(knowledgeMessage(matches).content.includes('Do not change'));
});
test('retrieval outage does not interrupt dialogue and abort still cancels it',async()=>{
 const service=createKnowledgeService({modelId:'model',embed:async()=>{throw Error('offline');},client:{}});
 assert.deepEqual(await service.retrieve(context,'help',['a1-greetings']),[]);
 const controller=new AbortController();controller.abort();await assert.rejects(()=>service.retrieve(context,'help',['a1-greetings'],{signal:controller.signal}));
});
test('signed sessions retain course, policy version and language independently of later preferences',()=>{
 const session=bindCourseSession({id:'session'},context);
 assert.equal(verifyCourseSession(session,context),session.course);
 for(const field of ['courseId','version','level','purpose','policyVersion'])assert.throws(()=>verifyCourseSession(session,{...context,[field]:'changed'}));
 assert.throws(()=>verifyCourseSession(session,{...context,languages:{...context.languages,supportLanguage:'pl'}}));
 assert.throws(()=>verifyCourseSession({},context),/Legacy session/);
});
