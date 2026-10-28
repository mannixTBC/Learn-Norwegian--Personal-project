import catalog from '../../exercises/conversationScenarios.json';
import map from '../../exercises/scenarioLessonMap.json';
import {verbNotebookCatalog} from '../../exercises/challenge30/verbNotebookData';

export function lessonNextPractice(level,lessonId){
 const matches=catalog.scenarios.filter(s=>map.links[s.id]?.[level]?.lessonIds.includes(lessonId));
 // Consolidation lessons may have no direct link; reuse a scenario from the
 // same six-lesson section, preferring the nearest already studied lesson.
 const sectionStart=Math.floor((lessonId-1)/6)*6+1;
 const nearby=catalog.scenarios.map(s=>({scenario:s,distance:Math.min(...(map.links[s.id]?.[level]?.lessonIds||[]).filter(id=>id>=sectionStart&&id<=lessonId).map(id=>lessonId-id))})).filter(s=>Number.isFinite(s.distance)).sort((a,b)=>a.distance-b.distance);
 const scenario=matches.find(s=>s.path==='general'&&map.links[s.id][level].basis==='vocabulary')||matches.find(s=>map.links[s.id][level].basis==='vocabulary')||matches[0]||nearby[0]?.scenario;
 const verb=verbNotebookCatalog.find(v=>v.sources.some(s=>s.level===level&&s.id===lessonId));
 return {scenario,verb};
}
