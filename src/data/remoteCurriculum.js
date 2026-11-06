import {supabase} from '../services/supabaseClient';
import {bundledCourses} from './courseIdentity.js';
import {createCourseRepository} from './courseRepository.js';
const repositories=new Map();
export function remoteCourse(level,pair,bundled){
  if(import.meta.env.VITE_REMOTE_CURRICULUM!=='true'||!supabase||typeof window==='undefined')return bundled;
  const manifest=bundledCourses.find(course=>course.learningLanguage===pair.learningLanguage);
  if(!manifest)return bundled;
  const id=`${manifest.courseId}:${manifest.version}`;
  if(!repositories.has(id))repositories.set(id,createCourseRepository({manifest,
    storage:{getItem:key=>window.localStorage.getItem(key),setItem:(key,value)=>window.localStorage.setItem(key,value)},
    fetchLevel:async(level,supportLanguage)=>{
      const {data,error}=await supabase.rpc('nl_course_level',{p_course_id:manifest.courseId,p_version:manifest.version,
        p_level:level,p_support_language:supportLanguage}).abortSignal(AbortSignal.timeout(12000));
      if(error)throw error;return data;
    }}));
  return repositories.get(id).level(level,pair,bundled);
}
