'use strict';
// Server-only module. The caller must authenticate the request before invoking it.
// Course/version are client hints; existence, language, release and translation
// availability are checked before anything is pinned into a signed session.
const purposes=new Set(['information','free_dialogue','scenario']);
async function checked(query){const {data,error}=await query;if(error)throw error;return data;}
async function loadCourseContext({client,languages,courseId,version,level,purpose,policyVersion='1'}) {
  if(!purposes.has(purpose)||!['A1','A2','B1','B2','C1','C2'].includes(level))throw new Error('Invalid course purpose or level');
  const course=await checked(client.from('nl_courses').select('course_id,learning_language,status').eq('course_id',courseId).eq('status','published').maybeSingle());
  if(!course||course.learning_language!==languages.learningLanguage)throw new Error('Course language unavailable');
  const release=await checked(client.from('nl_course_releases').select('version,format_version').eq('course_id',courseId).eq('version',version).eq('status','published').maybeSingle());
  if(!release||release.format_version!==1)throw new Error('Course release unavailable');
  const levelContent=await checked(client.rpc('nl_course_level',{p_course_id:courseId,p_version:version,p_level:level,p_support_language:languages.supportLanguage}));
  if(!levelContent?.items?.some(item=>item.kind==='level')||!(levelContent.expectedLessonCount>0)
    ||levelContent.items.filter(item=>item.kind==='lesson').length!==levelContent.expectedLessonCount)throw new Error('Course translation unavailable');
  const profile=await checked(client.from('nl_ai_profiles').select('rules,retrieval_enabled,policy_version').eq('course_id',courseId).eq('version',version)
    .eq('purpose',purpose).eq('policy_version',policyVersion).maybeSingle());
  if(!profile)throw new Error('AI policy unavailable');
  return Object.freeze({courseId,version,level,purpose,policyVersion,languages:Object.freeze({...languages}),
    retrievalEnabled:profile.retrieval_enabled===true,rules:profile.rules});
}
function bindCourseSession(session,context){
  const {courseId,version,level,purpose,policyVersion,retrievalEnabled}=context;
  return {...session,course:{courseId,version,level,purpose,policyVersion,retrievalEnabled,languages:{...context.languages}}};
}
function verifyCourseSession(session,context){
  const pinned=session.course;
  if(!pinned)throw new Error('Legacy session: use legacy policy until it ends');
  for(const key of ['courseId','version','level','purpose','policyVersion'])if(pinned[key]!==context[key])throw new Error('Session course cannot change');
  for(const key of ['learningLanguage','supportLanguage'])if(pinned.languages[key]!==context.languages[key])throw new Error('Session languages cannot change');
  return pinned;
}
// Use authenticated user ID from the server, never request-body progress.
async function retrievalScope(client,context,userId,{currentLessonId,scenarioId}={}){
  const completed=await checked(client.from('nl_lesson_progress').select('item_id').eq('user_id',userId).eq('course_id',context.courseId).eq('completed',true));
  const eligible=new Set((completed||[]).map(row=>row.item_id));
  if(currentLessonId)eligible.add(currentLessonId); // Must be resolved from the server session's lesson.
  if(context.purpose==='scenario'){
    if(!scenarioId)return [];
    const links=await checked(client.from('nl_scenario_lessons').select('lesson_id').eq('course_id',context.courseId).eq('version',context.version).eq('scenario_id',scenarioId));
    return (links||[]).map(row=>row.lesson_id).filter(id=>eligible.has(id));
  }
  // SQL also filters exact release, language and CEFR level.
  return [...eligible];
}
module.exports={loadCourseContext,bindCourseSession,verifyCourseSession,retrievalScope};
