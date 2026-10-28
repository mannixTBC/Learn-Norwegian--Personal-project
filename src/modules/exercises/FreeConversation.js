import React,{useEffect,useRef,useState} from 'react';
import {Link} from 'react-router-dom';
import {startFreeConversation,sendFreeConversation} from '../../services/chat';
import StudioHeader from './StudioHeader';
import StudioArtwork from './StudioArtwork';
import StudioIcon from './StudioIcon';
import StudioTranslation from './StudioTranslation';
import ScenarioVoiceControls from './ScenarioVoiceControls';
export default function FreeConversation({level}){
 const [session,setSession]=useState(null),[messages,setMessages]=useState([]),[draft,setDraft]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState(''),[ended,setEnded]=useState(false);
 const pending=useRef(null),playback=useRef(null),state=useRef(null);state.current={session,draft,messages};
 async function run(start=false,messageOverride){if(pending.current)return;const controller=new AbortController();pending.current=controller;setBusy(true);setError('');const before=state.current;const sent=messageOverride??before.draft;if(messageOverride!==undefined)setDraft(messageOverride);
 try{const result=start?await startFreeConversation(level,controller.signal):await sendFreeConversation({sessionToken:before.session.sessionToken,message:sent},controller.signal);if(controller.signal.aborted)return;setSession(result);setMessages(old=>[...(start?[]:[...old,{role:'user',text:sent}]),{role:'assistant',text:result.reply,translation:result.translation,correction:result.correction}]);setDraft('');}
 catch(e){if(!controller.signal.aborted)setError(e.message);}finally{if(pending.current===controller){pending.current=null;setBusy(false);}}}
 useEffect(()=>{void run(true);return()=>{pending.current?.abort();pending.current=null;window.speechSynthesis?.cancel();};},[level]);
 const speak=async(token,{signal,onPlaybackStart,messageIndex}={})=>new Promise((resolve,reject)=>{
 if(!window.speechSynthesis){reject(new Error('Redarea vocală nu este disponibilă.'));return;}
 const speech=new SpeechSynthesisUtterance((messageIndex===undefined?state.current.session?.reply:state.current.messages[messageIndex]?.text)||'');speech.lang='nb-NO';
 const finish=()=>{signal?.removeEventListener('abort',cancel);resolve({ok:true});};const cancel=()=>{window.speechSynthesis.cancel();finish();};speech.onstart=onPlaybackStart;speech.onend=finish;speech.onerror=()=>{signal?.removeEventListener('abort',cancel);reject(new Error('Redarea nu a reușit.'));};signal?.addEventListener('abort',cancel,{once:true});if(signal?.aborted)return cancel();window.speechSynthesis.speak(speech);
 });
 const flow={session,draft,busy,setDraft,send:()=>run(),operation:busy?'turn':null};
 return <section className="conversation-studio studio-design natural-conversation studio-free">
 <StudioHeader level={level} back={'/studio?nivel='+level} title="Dialog liber" locked={Boolean(session)}/>
 {ended||session?.done?<div className="studio-free-result"><h1>Ai vorbit în norvegiană!</h1><p>{messages.filter(m=>m.role==='user').length} răspunsuri în dialogul cu Nora.</p><button className="studio-primary" onClick={()=>{setEnded(false);void run(true);}}>Începe un dialog nou</button><Link className="studio-text-link" to={'/studio?nivel='+level}>Înapoi la studio</Link></div>:<>
 <div className="studio-nora-intro"><StudioArtwork scene="avatar"/><p><strong>Nora</strong> · Partenera ta de conversație</p></div>
 <div className="airy-messages" role="log" aria-live="polite" aria-label="Conversație cu Nora">{messages.map((m,i)=><article key={i} className={'airy-message '+m.role}>{m.role==='assistant'&&<div className="airy-avatar"><StudioArtwork scene="avatar"/></div>}<div className="airy-message-copy">{m.role==='assistant'&&<small>Nora</small>}<p lang="nb">{m.text}{m.role==='assistant'&&<button className="airy-replay" aria-label="Ascultă Nora" disabled={busy} onClick={()=>playback.current?.(i)}><StudioIcon name="play"/></button>}</p>{m.role==='assistant'&&<StudioTranslation text={m.text} translation={m.translation}/>}{m.correction&&<details className="conversation-feedback"><summary>O mică corectare</summary><p><span lang="nb">{m.correction.original}</span> → <strong lang="nb">{m.correction.corrected}</strong></p><p>{m.correction.explanation}</p></details>}</div></article>)}</div>
 {busy&&<p role="status">Nora pregătește răspunsul…</p>}
 {session?.simplified&&<p className="conversation-notice" role="status">Nora a simplificat întrebarea. Nivelul tău rămâne {level}.</p>}
 {session&&<ScenarioVoiceControls flow={flow} reply={session.reply} playbackRef={playback} speak={speak} onFinish={()=>{pending.current?.abort();pending.current=null;setBusy(false);setEnded(true);}}/>}
 </>}
 {error&&<div className="conversation-error" role="alert"><p>{error}</p><button className="studio-primary" disabled={busy} onClick={()=>run(!session)}>Reîncearcă</button></div>}
 </section>;
}
