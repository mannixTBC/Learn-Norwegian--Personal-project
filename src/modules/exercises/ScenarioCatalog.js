import React, { useMemo, useState } from 'react';
import { careerPaths, getCareerPath } from '../../services/careerProfile';
import ScenarioIllustration from './ScenarioIllustration';
const featured=['cafe-order','shop-exchange','team-plan','care-comfort'];
const names={'cafe-order':'La cafenea','shop-exchange':'La magazin','team-plan':'La serviciu','care-comfort':'În îngrijire'};
const artwork={transport:'bus-delay',hospitality:'hotel-booking',office:'team-plan',general:'cafe-order',construction:'site-materials',care:'care-comfort',healthcare:'care-comfort',cleaning:'cleaning-plan',retail:'shop-exchange',education:'study-meeting',childcare:'kindergarten-plan'};
export default function ScenarioCatalog({scenarios,path,flow}) {
 const [tab,setTab]=useState('featured'),[category,setCategory]=useState('all'),[page,setPage]=useState(0),[selection,setSelection]=useState(null);
 const filtered=useMemo(()=>{
  if(tab==='featured'&&category==='all')return featured.map(id=>scenarios.find(s=>s.id===id)).filter(Boolean);
  const items=scenarios.filter(s=>category==='all'||s.path===category);
  return [...items].sort(tab==='all'?(a,b)=>a.title.localeCompare(b.title,'ro'):(a,b)=>Number(b.path===path.id)-Number(a.path===path.id));
 },[scenarios,category,tab,path.id]);
 const pages=Math.max(1,Math.ceil(filtered.length/4)),currentPage=Math.min(page,pages-1),visible=filtered.slice(currentPage*4,currentPage*4+4);
 const chosen=visible.find(s=>s.id===selection)||visible[0];
 const changeTab=value=>{setTab(value);setPage(0);setSelection(null);};
 return <>
  <details className="sc-browse"><summary>Explorează toate situațiile</summary><div className="sc-controls">
   <div className="sc-tabs" role="group" aria-label="Ordinea scenariilor">{[['featured','Situații'],['recommended','Pentru tine'],['all','Toate']].map(([value,label])=><button type="button" key={value} aria-pressed={tab===value} onClick={()=>changeTab(value)}>{label}</button>)}</div>
   <label className="sc-filter"><span className="sc-sr-only">Filtrează situațiile</span><select value={category} onChange={event=>{setCategory(event.target.value);setPage(0);setSelection(null);if(tab==='featured')setTab('recommended');}}><option value="all">Toate situațiile</option>{careerPaths.filter(p=>scenarios.some(s=>s.path===p.id)).map(p=><option key={p.id} value={p.id}>{p.shortTitle}</option>)}</select></label>
  </div></details>
  <div className="sc-grid" aria-label="Scenarii disponibile">
   {visible.map(s=><button type="button" key={s.id} className="sc-card conversation-card" aria-pressed={chosen?.id===s.id} onClick={()=>setSelection(s.id)}>
    <ScenarioIllustration scenarioId={featured.includes(s.id)?s.id:artwork[s.path]||'studio'} className="sc-card-art"/>
    <div className="sc-card-copy"><h2>{tab==='featured'?names[s.id]||s.title:s.title}</h2>{tab!=='featured'&&<p>{s.place}</p>}<span className="sc-card-status">{flow.progress?.[s.id]?.latest?.endReason==='success'?'✓ Reușit':flow.progress?.[s.id]?'De reluat':tab==='featured'?'Norvegiană în viața reală':getCareerPath(s.path).shortTitle}</span></div>
   </button>)}
  </div>
  {!filtered.length&&<p className="sc-empty" role="status">Nu sunt scenarii pentru acest filtru.</p>}
  {chosen&&<button type="button" className="studio-primary sc-start" onClick={()=>flow.choose(chosen.id)}>Începe conversația <span aria-hidden="true">›</span></button>}
  <nav className="sc-pagination" aria-label="Paginile scenariilor" hidden={pages===1}><button type="button" aria-label="Pagina anterioară" disabled={currentPage===0} onClick={()=>{setPage(currentPage-1);setSelection(null);}}>‹</button><span aria-live="polite">{filtered.length?(currentPage+1)+' din '+pages:'0 scenarii'}</span><button type="button" aria-label="Pagina următoare" disabled={currentPage>=pages-1} onClick={()=>{setPage(currentPage+1);setSelection(null);}}>›</button></nav>
 </>;
}
