import {courseStorageKey, getLanguages} from './runtime.js';
import {conversationKey} from './apiContext.js';

// Preserve existing Norwegian keys. Auth, account preferences and sync queues
// always use raw browser storage and are never scoped to a course.
const learningKey=/^(curriculum_|scenario_result_|conversation-session:|conversation-studio:|verb_|practice_|grammar_|lesson_summary_|pronunciation_attempts_|northern_pass|norwegian_(review_items|learning_activity|active_level|daily_goal))/;
export function createCourseStorage(readStorage, readLanguages=getLanguages) {
  const scope=key=>{
    if(key.startsWith('course:'))return key;
    if(key.startsWith('conversation-session:'))return key.includes(':languages:')?key:conversationKey(key,readLanguages());
    return learningKey.test(key)?courseStorageKey(key,readLanguages().learningLanguage):key;
  };
  const keys=()=>{
    const storage=readStorage(),language=readLanguages().learningLanguage,prefix=`course:${language}:`,visible=[];
    for(let i=0;i<storage.length;i++){
      const key=storage.key(i);
      if(key.startsWith('course:')){if(language!=='nb'&&key.startsWith(prefix))visible.push(key.slice(prefix.length));}
      else if(language==='nb'||!learningKey.test(key))visible.push(key);
    }
    return visible;
  };
  return {
    getItem:key=>readStorage().getItem(scope(key)),
    setItem:(key,value)=>readStorage().setItem(scope(key),value),
    removeItem:key=>readStorage().removeItem(scope(key)),
    key:index=>keys()[index]??null,
    get length(){return keys().length;},
  };
}
export const courseLocalStorage=createCourseStorage(()=>globalThis.localStorage);
export const courseSessionStorage=createCourseStorage(()=>globalThis.sessionStorage);
