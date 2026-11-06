import {ui} from '../../languages/messages.js';
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
  if(!current)return <p role="status">{ui('web_b62852c5c2a660bd')}</p>;
  const copy=scenarioPresentation(current),alternatives=scenarioAlternatives(scenes,current.id,round);
  return <div className="practical-picker">
    <h1>{ui('ui_cec5dce802740a64')}</h1>
    <div className="practical-tabs" aria-label={ui('web_0e785b9d91533b33')}>
      <button type="button" aria-pressed={activePath==='general'} onClick={()=>{setCategory('general');setRound(0);}}>{ui('ui_930b114c552fb7ce')}</button>
      {path.id!=='general'&&<button type="button" aria-pressed={activePath===path.id} onClick={()=>{setCategory(path.id);setRound(0);}}>{path.shortTitle}</button>}
    </div>
    <article className="practical-featured">
      <span className="practical-status">{scenarioBadge(current.id,recommendation?.id,flow.progress||{})}</span>
      <h2>{copy.title}</h2><StudioSceneArtwork scenarioId={current.id} pathId={current.path} className="practical-art"/>
      <p>{copy.summary}</p><p><strong>{ui('web_4bfc5d2751f466a1')}</strong> {copy.topics}</p>
      <details key={current.id}><summary>{ui('web_dc37cbbb8f06fc8b')}</summary><p>{current.brief}</p><ol>{copy.goals.map(goal=><li key={goal}>{goal}</li>)}</ol></details>
      <button type="button" className="practical-start" onClick={()=>flow.choose(current.id,true)}>{ui('ui_2846f556ddcc4d25')}</button>
    </article>
    <div className="practical-alternative-heading"><h2>{ui('ui_65942fcdf9755e56')}</h2><button type="button" disabled={scenes.length<4} onClick={()=>setRound(r=>r+1)}>{ui('web_f2af0fc1a940fc71')}</button></div>
    <div className="practical-alternatives">{alternatives.map(s=><button type="button" key={s.id} onClick={()=>{setSelection(p=>({...p,[activePath]:s.id}));setRound(0);}}><StudioSceneArtwork scenarioId={s.id} pathId={s.path}/><strong>{scenarioPresentation(s).title}</strong><small>{level} · {scenarioPresentation(s).minutes}{ui('ui_2e75737a6b582974')}</small></button>)}</div>
  </div>;
}
