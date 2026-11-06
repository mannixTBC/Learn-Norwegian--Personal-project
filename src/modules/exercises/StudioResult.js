import {ui} from '../../languages/messages.js';
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
  <div className="studio-result-hero"><StudioArtwork scene="result" className="studio-result-art"/><h1>{session?.endReason==='success'?'Te-ai descurcat!':ui('web_1915fdf47d58bc82')}</h1><div className="studio-result-stats"><span>{selected.id==='cafe-order'?'La cafenea':selected.title}</span><span>{messages.length}{ui('web_122ac442ea6547d4')}</span></div></div>
  <section className="studio-result-card"><h2>{ui('web_0138ceaa7a4a416b')}</h2>{achieved.length?<ul>{selected.goals.filter((_,i)=>achieved.includes(i)).map(goal=><li key={goal}><span className="studio-check" aria-hidden="true">✓</span>{goal}</li>)}</ul>:<p>{ui('web_cbeebcf15b9f1f0d')}</p>}<p>{achieved.length}{ui('ui_dbd8b6478643d623')}{selected.goals.length}{ui('web_d213fdb3e4fd1672')}</p></section>
  <section className="studio-result-card studio-result-card--feedback"><h2>{ui('web_dee1aea2986f0a06')}</h2>{session?.feedback&&<p>{session.feedback}</p>}{achieved.length<selected.goals.length&&<ul>{selected.goals.filter((_,i)=>!achieved.includes(i)).map(goal=><li key={goal}>{goal}</li>)}</ul>}{!session?.done&&<p>{ui('web_431fc214a9970cbf')}</p>}</section>
  {selected.hint&&<section className="studio-result-card studio-result-card--review"><h2>{ui('web_0f57a11f6cacdc5c')}</h2><p className="studio-hint-example" lang="nb">{selected.hint}</p><button className="studio-primary" type="button" disabled={saved} onClick={save}>{saved?'Salvat pentru recapitulare':'Salvează pentru recapitulare'}</button></section>}
  <p role="status">{notice||flow.progressNotice}</p>
  <button className="conversation-primary" onClick={flow.again}>{ui('ui_2a7d6ae91b604b62')}</button>
  <Link className="conversation-link" to={'/recapitulare?nivel='+level}>{ui('web_e7f796c1c54c00d7')}</Link>
  <button className="conversation-link" onClick={flow.reset}>{ui('web_78da2b3a4cde10e7')}</button>
 </div>;
}
