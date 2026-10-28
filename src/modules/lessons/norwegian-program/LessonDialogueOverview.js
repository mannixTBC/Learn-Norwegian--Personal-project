import React,{useEffect,useRef,useState} from 'react';
import {speakNorwegian} from '../../../services/norwegianSpeech';
import {getDialogueVoice} from './lessonParts';

export default function LessonDialogueOverview({dialogue}) {
 const playback=useRef(null);
 const [playing,setPlaying]=useState(false),[active,setActive]=useState(null),[error,setError]=useState(''),[translated,setTranslated]=useState(false);
 useEffect(()=>()=>playback.current?.abort(),[]);
 const stop=()=>{playback.current?.abort();playback.current=null;setPlaying(false);setActive(null);};
 const play=async()=>{
  if(playback.current){stop();return;}
  const controller=new AbortController();playback.current=controller;setPlaying(true);setError('');
  try{for(let i=0;i<dialogue.length;i++){
   const [speaker,text]=dialogue[i];
   if(controller.signal.aborted)return;
   setActive(i);
   const result=await speakNorwegian(text,{voice:getDialogueVoice(speaker,i),waitForEnd:true,signal:controller.signal});
   if(controller.signal.aborted)return;
   if(!result.ok)throw new Error('audio');
  }}catch{if(!controller.signal.aborted)setError('Sunetul nu a pornit. Poți reîncerca sau citi dialogul.');}
  finally{if(playback.current===controller){playback.current=null;setPlaying(false);setActive(null);}}
 };
 return <section className="lapp-dialogue-full lapp-card" aria-label="Dialogul lecției">
  <div className="lapp-dialogue-tools"><button type="button" onClick={play} aria-pressed={playing}>{playing?'Oprește audio':'Ascultă dialogul'}</button><button type="button" onClick={()=>setTranslated(v=>!v)} aria-expanded={translated}>{translated?'Ascunde traducerea':'În română'}</button></div>
  <div className="lapp-dialogue-lines">{dialogue.map(([speaker,text,translation],i)=><article key={i} className={active===i?'is-speaking':''}><strong>{speaker}</strong><p lang="nb">{text}</p>{translated&&<p lang="ro" className="lapp-dialogue-translation">{translation}</p>}</article>)}</div>
  {error&&<p role="alert">{error}</p>}
 </section>;
}
