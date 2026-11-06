import React, {useState} from 'react';
import StudioSceneArtwork from './StudioSceneArtwork';
import lessonMap from './scenarioLessonMap.json';
import {recommendedScenario, scenarioAlternatives, scenarioPresentation, scenarioBadge} from './practicalScenarios';
import './PracticalCatalog.css';

export default function ScenarioCatalog({scenarios,flow,level,path,learning,userId}) {
  const [category,setCategory]=useState('general'),[selection,setSelection]=useState({}),[round,setRound]=useState(0);
  const activePath=category==='general'?'general':path.id;
  const scenes=scenarios.filter(s=>s.path===activePath);
  const recommendation=recommendedScenario({scenarios:scenes,stage:learning?.stage||1,progress:flow.progress||{},completed:learning?.completed||[],links:Object.fromEntries(scenes.map(s=>[s.id,lessonMap.links[s.id]?.[level]||{}])),seed:`${userId||'guest'}:${level}:${activePath}`});
  const current=scenes.find(s=>s.id===selection[activePath])||recommendation;
  if(!current)return <p role="status">Nu sunt situații pentru acest traseu.</p>;
  const copy=scenarioPresentation(current),alternatives=scenarioAlternatives(scenes,current.id,round);
  return <div className="practical-picker">
    <h1>Situații practice</h1>
    <div className="practical-tabs" aria-label="Categoria situațiilor">
      <button type="button" aria-pressed={activePath==='general'} onClick={()=>{setCategory('general');setRound(0);}}>Viața de zi cu zi</button>
      {path.id!=='general'&&<button type="button" aria-pressed={activePath===path.id} onClick={()=>{setCategory(path.id);setRound(0);}}>{path.shortTitle}</button>}
    </div>
    <article className="practical-featured">
      <span className="practical-status">{scenarioBadge(current.id,recommendation?.id,flow.progress||{})}</span>
      <h2>{copy.title}</h2><StudioSceneArtwork scenarioId={current.id} pathId={current.path} className="practical-art"/>
      <p>{copy.summary}</p><p><strong>Vei exersa:</strong> {copy.topics}</p>
      <details key={current.id}><summary>Context și obiective</summary><p>{current.brief}</p><ol>{copy.goals.map(goal=><li key={goal}>{goal}</li>)}</ol></details>
      <button type="button" className="practical-start" onClick={()=>flow.choose(current.id,true)}>Începe conversația</button>
    </article>
    <div className="practical-alternative-heading"><h2>Sau alege altă situație</h2><button type="button" disabled={scenes.length<4} onClick={()=>setRound(r=>r+1)}>Alte situații →</button></div>
    <div className="practical-alternatives">{alternatives.map(s=><button type="button" key={s.id} onClick={()=>{setSelection(p=>({...p,[activePath]:s.id}));setRound(0);}}><StudioSceneArtwork scenarioId={s.id} pathId={s.path}/><strong>{scenarioPresentation(s).title}</strong><small>{level} · {scenarioPresentation(s).minutes} min</small></button>)}</div>
  </div>;
}
