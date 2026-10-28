import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import StudioArtwork from './StudioArtwork';
import { readReviewItems, saveReviewItem } from '../../services/spacedReview';
export default function StudioResult({selected,session,messages,flow,level,resultRef}) {
 const [notice,setNotice]=useState(''),[saved,setSaved]=useState(false);
 const achieved=session?.achieved||[];
 const save=()=>{
  const id='studio:'+level+':'+selected.id+':hint';
  try {
   if(!readReviewItems().some(item=>item.id===id))saveReviewItem({id,level,source:'scenario',prompt:'Formulare pentru: '+selected.title,norwegian:selected.hint,answer:selected.hint,explanation:selected.brief});
   setSaved(true);setNotice('Formularea a fost salvată pentru recapitulare.');
  }catch{setNotice('Nu am putut salva. Încearcă din nou.');}
 };
 return <div ref={resultRef} className="conversation-result guided-result" tabIndex={-1}>
  <div className="studio-result-hero"><StudioArtwork scene="result" className="studio-result-art"/><h1>{session?.endReason==='success'?'Te-ai descurcat!':'Ai vorbit în norvegiană!'}</h1><div className="studio-result-stats"><span>{selected.id==='cafe-order'?'La cafenea':selected.title}</span><span>{messages.length} replici</span></div></div>
  <section className="studio-result-card"><h2>Ce ți-a ieșit bine</h2>{achieved.length?<ul>{selected.goals.filter((_,i)=>achieved.includes(i)).map(goal=><li key={goal}><span className="studio-check" aria-hidden="true">✓</span>{goal}</li>)}</ul>:<p>Ai exersat conversația. Obiectivele nu sunt încă confirmate.</p>}<p>{achieved.length} din {selected.goals.length} obiective realizate</p></section>
  <section className="studio-result-card studio-result-card--feedback"><h2>De exersat</h2>{session?.feedback&&<p>{session.feedback}</p>}{achieved.length<selected.goals.length&&<ul>{selected.goals.filter((_,i)=>!achieved.includes(i)).map(goal=><li key={goal}>{goal}</li>)}</ul>}{!session?.done&&<p>Ai încheiat conversația înainte de evaluarea finală.</p>}</section>
  {selected.hint&&<section className="studio-result-card studio-result-card--review"><h2>De păstrat</h2><p className="studio-hint-example" lang="nb">{selected.hint}</p><button className="studio-primary" type="button" disabled={saved} onClick={save}>{saved?'Salvat pentru recapitulare':'Salvează pentru recapitulare'}</button></section>}
  <p role="status">{notice||flow.progressNotice}</p>
  <button className="conversation-primary" onClick={flow.again}>Exersează din nou</button>
  <Link className="conversation-link" to={'/recapitulare?nivel='+level}>Vezi recapitularea</Link>
  <button className="conversation-link" onClick={flow.reset}>Înapoi la situații</button>
 </div>;
}
