import React,{useMemo,useState} from 'react';
import {careerPaths} from '../../services/careerProfile';
import NordicStudioArtwork,{hasNordicArtwork} from './NordicStudioArtwork';
import StudioSceneArtwork from './StudioSceneArtwork';
import PracticalStudioArtwork,{hasPracticalArtwork} from './PracticalStudioArtwork';
const featured=['cafe-order','shop-exchange','team-plan','bus-delay','care-comfort'];
const names={'cafe-order':'La cafenea','shop-exchange':'La magazin','team-plan':'La serviciu','bus-delay':'În autobuz','care-comfort':'În îngrijire'};
export default function ScenarioCatalog({scenarios,flow,level}){
 const [tab,setTab]=useState('all'),[category,setCategory]=useState('all'),[page,setPage]=useState(0);
 const filtered=useMemo(()=>scenarios.filter(s=>(category==='all'||s.path===category)&&(tab==='all'||(tab==='daily'?['general','retail','family','studies'].includes(s.path):!['general','family','studies'].includes(s.path)))).sort((a,b)=>{const ai=featured.indexOf(a.id),bi=featured.indexOf(b.id);return(ai<0?999:ai)-(bi<0?999:bi);}),[scenarios,category,tab]);
 const pages=Math.max(1,Math.ceil(filtered.length/6)),currentPage=Math.min(page,pages-1),visible=filtered.slice(currentPage*6,currentPage*6+6);
 return <><div className="sc-tabs" role="group" aria-label="Categorii">{[['all','Toate'],['daily','Zi de zi'],['work','La serviciu']].map(([value,label])=><button type="button" key={value} aria-pressed={tab===value} onClick={()=>{setTab(value);setPage(0);}}>{label}</button>)}</div>
 <details className="sc-browse"><summary>Filtrează după domeniu</summary><label className="sc-filter"><span className="sc-sr-only">Filtrează situațiile</span><select value={category} onChange={e=>{setCategory(e.target.value);setPage(0);}}><option value="all">Toate domeniile</option>{careerPaths.filter(p=>scenarios.some(s=>s.path===p.id)).map(p=><option key={p.id} value={p.id}>{p.shortTitle}</option>)}</select></label></details>
 <div className="sc-grid" aria-label="Scenarii disponibile">{visible.map(s=><button type="button" key={s.id} className="sc-card conversation-card" onClick={()=>flow.choose(s.id,true)}>{hasNordicArtwork(s.id)?<NordicStudioArtwork scene={s.id} className="sc-card-art"/>:hasPracticalArtwork(s.id)?<PracticalStudioArtwork scene={s.id} className="sc-card-art"/>:<StudioSceneArtwork scenarioId={s.id} pathId={s.path} className="sc-card-art"/>}<div className="sc-card-copy"><h2>{names[s.id]||s.title}<span aria-hidden="true">›</span></h2><p>{level} · {s.difficulty?.turns<=5?'3':'5'} min</p>{flow.progress?.[s.id]&&<span className="sc-card-status">{flow.progress[s.id].latest?.endReason==='success'?'✓ Reușit':'De reluat'}</span>}</div></button>)}</div>
 {!filtered.length&&<p className="sc-empty" role="status">Nu sunt scenarii pentru acest filtru.</p>}
 <nav className="sc-pagination" aria-label="Paginile scenariilor" hidden={pages===1}><button type="button" aria-label="Pagina anterioară" disabled={!currentPage} onClick={()=>setPage(currentPage-1)}>‹</button><span aria-live="polite">{currentPage+1} din {pages}</span><button type="button" aria-label="Pagina următoare" disabled={currentPage>=pages-1} onClick={()=>setPage(currentPage+1)}>›</button></nav></>;
}
