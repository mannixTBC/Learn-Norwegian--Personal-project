import React,{useEffect,useRef,useState} from 'react';
import {translateConversation} from '../../services/chat';
export default function StudioTranslation({text,translation}){
 const [open,setOpen]=useState(false),[value,setValue]=useState(translation||''),[busy,setBusy]=useState(false),[error,setError]=useState('');const request=useRef(null);
 useEffect(()=>()=>request.current?.abort(),[]);
 async function toggle(){setOpen(!open);if(open||value||busy)return;const controller=new AbortController();request.current=controller;setBusy(true);setError('');try{const result=await translateConversation(text,controller.signal);if(!controller.signal.aborted)setValue(result.translation);}catch(e){if(!controller.signal.aborted)setError(e.message);}finally{if(!controller.signal.aborted)setBusy(false);}}
 return <div className="studio-translation"><button type="button" onClick={toggle} aria-expanded={open}>{open?'Ascunde traducerea':'Vezi traducerea'} <span aria-hidden="true">⌄</span></button>{open&&<p lang="ro" role={error?'alert':undefined}>{busy?'Se traduce…':error||value}</p>}</div>;
}
