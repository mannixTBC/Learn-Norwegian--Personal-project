import {getLanguages} from '../languages/runtime.js';
import {createPackRegistry} from './packRegistry.js';
import {norwegianPack} from './norwegianPack.js';
import {remoteCourse} from '../data/remoteCurriculum.js';
const registry=createPackRegistry([norwegianPack]);
export const getContent=(feature)=>registry.get(getLanguages(),feature);
export const courseCatalog={};
for(const level of ['A1','A2','B1','B2','C1','C2'])Object.defineProperty(courseCatalog,level,{enumerable:true,get:()=>remoteCourse(level,getLanguages(),getContent('courses').courseCatalog[level])});
export const courseLessons=new Proxy([],{get:(_,key)=>Reflect.get(getContent('courses').courseLessons,key),has:(_,key)=>key in getContent('courses').courseLessons});
