'use strict';
const {AsyncLocalStorage}=require('node:async_hooks');
const {createClient}=require('@supabase/supabase-js');
const {loadCourseContext,bindCourseSession,retrievalScope}=require('./courseContext.cjs');
const {createKnowledgeService,knowledgeMessage}=require('./knowledge.cjs');
const manifest=require('../src/content/generated/course-manifest.json');
const scope=new AsyncLocalStorage();
const fail=()=>Object.assign(new Error('Cursul sau versiunea conversatiei nu corespunde. Incepe o conversatie noua.'),{status:409,code:'SESSION_COURSE_MISMATCH'});
function requestCourse(req,languages){
 const bundled=manifest.courses.find(c=>c.learningLanguage===languages.learningLanguage);
 const courseId=req.get('X-NordLingo-Course-Id'),version=req.get('X-NordLingo-Course-Version');
 if(!bundled||((courseId!==undefined||version!==undefined)&&(courseId!==bundled.courseId||version!==bundled.version)))throw fail();
 return {courseId:bundled.courseId,version:bundled.version};
}
function runCourseRequest(req,languages,next){return scope.run(requestCourse(req,languages),next);}
function verifyRequestCourse(session){
 const requested=scope.getStore();
 if(!requested)return session;
 const pinned=session.course||{courseId:'nb-general',version:'2026.2'};
 if(pinned.courseId!==requested.courseId||pinned.version!==requested.version)throw fail();
 return session;
}
let client;
function databaseClient(){
 const url=process.env.VITE_SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY;
 if(!url||!key)return null;
 return client||(client=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false},global:{fetch:(url,options)=>fetch(url,{...options,signal:options?.signal||AbortSignal.timeout(5000)})}}));
}
async function prepareCourseSession(req,session,purpose){
 if(!req.userId)throw Object.assign(new Error('Authentication required'),{status:401});
 const languages=require('./languageContext').currentLanguages();
 const identity=requestCourse(req,languages);
 let context={...identity,level:session.level,purpose,policyVersion:'1',languages:{...languages},retrievalEnabled:false};
 if(process.env.NORDLINGO_COURSE_DATABASE==='true'){
   const db=databaseClient();if(!db)throw Object.assign(new Error('Course database unavailable'),{status:503});
   context=await loadCourseContext({client:db,languages,...identity,level:session.level,purpose});
 }
 return bindCourseSession(session,context);
}
async function referenceMessage(req,session,query){
 const context=session.course;
 // Old sessions keep their original policy. No retrieval for tests/recap or grading.
 if(!context?.retrievalEnabled||process.env.NORDLINGO_NORA_RETRIEVAL!=='true')return null;
 if(!['free_dialogue','scenario','information'].includes(context.purpose))return null;
 if(!req.userId||req.userId!==(session.userId||session.owner))return null;
 const db=databaseClient(),modelId=process.env.NORDLINGO_EMBEDDING_MODEL;
 if(!db||!modelId)return null;
 try{
   const allowed=await retrievalScope(db,context,req.userId,{scenarioId:session.scenarioId?`scenario:${session.level}:${session.scenarioId}`:undefined});
   const service=createKnowledgeService({client:db,modelId,embed:async(input,{signal})=>{
     const response=await require('./openai').getOpenAI().embeddings.create({model:modelId,input,dimensions:1536},{signal,timeout:4000,maxRetries:0});
     return response.data[0].embedding;
   }});
   return knowledgeMessage(await service.retrieve(context,query,allowed,{signal:AbortSignal.timeout(5000)}));
 }catch{return null;}
}
module.exports={requestCourse,runCourseRequest,verifyRequestCourse,prepareCourseSession,referenceMessage};
