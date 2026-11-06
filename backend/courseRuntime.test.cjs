const {test}=require('node:test');
const assert=require('node:assert/strict');
const {requestCourse,runCourseRequest,verifyRequestCourse,prepareCourseSession,referenceMessage}=require('./courseRuntime.cjs');
const languages={learningLanguage:'nb',supportLanguage:'ro'};
const req=(headers={})=>({userId:'user',get:key=>headers[key]});
test('course hints cannot select unknown versions or swap signed sessions; old clients keep the old release',async()=>{
 assert.deepEqual(requestCourse(req(),languages),{courseId:'nb-general',version:'2026.2'});
 assert.throws(()=>requestCourse(req({'X-NordLingo-Course-Id':'de-general','X-NordLingo-Course-Version':'2026.2'}),languages));
 assert.throws(()=>requestCourse(req({'X-NordLingo-Course-Version':'2099.1'}),languages));
 const session=await prepareCourseSession(req(),{owner:'user',level:'A1'},'free_dialogue');
 assert.equal(session.course.retrievalEnabled,false);
 assert.equal(session.course.rules,undefined);
 runCourseRequest(req(),languages,()=>{
  assert.equal(verifyRequestCourse(session),session);
  assert.deepEqual(verifyRequestCourse({}),{});
  assert.throws(()=>verifyRequestCourse({...session,course:{...session.course,version:'2099.1'}}));
 });
 assert.equal(await referenceMessage(req(),session,'question'),null);
 assert.equal(await referenceMessage(req(),{...session,course:{...session.course,purpose:'recap',retrievalEnabled:true}},'question'),null);
});
