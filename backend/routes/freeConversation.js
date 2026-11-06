// nordlingo-language-context-v1
const {languageInstructions,translationInstructions} = require('../languageContext');
const express=require('express');
const {prepareCourseSession,referenceMessage}=require('../courseRuntime.cjs');
const {getOpenAI,isOpenAIConfigured}=require('../openai');
const {consumeChatQuota,recordChatUsage}=require('../chatUsage');
const {levels,sign,verify}=require('../freeConversation');
const {openingFor,promptFor,parseReply}=require('../languageTutors').free;
const {cartesiaSpeechBuffer}=require('../cartesiaSpeech');
const router=express.Router();
const fail=(message,status=400)=>Object.assign(new Error(message),{status});
const wrap=fn=>async(req,res)=>{try{await fn(req,res);}catch(e){const status=e.status||502;res.status(status).json({error:status<500?e.message:'Nora nu poate răspunde momentan. Încearcă din nou.'});}};
async function complete(req,messages,json=false){
 if(!isOpenAIConfigured())throw fail('Asistentul nu este configurat.',503);
 await consumeChatQuota(req);let completion;
 try{completion=await getOpenAI().chat.completions.create({model:process.env.OPENAI_CHAT_MODEL||'gpt-4o-mini',temperature:.4,max_tokens:1400,store:false,...(json?{response_format:{type:'json_object'}}:{}),messages},{timeout:15000,maxRetries:0});
 const choice=completion?.choices?.[0];if(choice?.finish_reason!=='stop'||choice.message?.refusal||!choice.message?.content)throw fail('Răspuns incomplet.',502);return choice.message.content;
 }finally{try{await recordChatUsage(req,completion?.usage||null);}catch(e){console.warn("free-conversation-usage",e.name);}}
}
router.post('/free/start',wrap(async(req,res)=>{
 const {level}=req.body||{};if(!levels.includes(level))throw fail('Nivel invalid.');
 const opening=openingFor(level),reply=opening.reply;
 const session={owner:req.userId,level,turn:0,expires:Date.now()+3600000,history:[{role:'assistant',content:reply}]};
 res.json({sessionToken:sign(await prepareCourseSession(req,session,'free_dialogue')),...opening,level,turn:0,done:false});
}));
router.post('/free/speech',wrap(async(req,res)=>{
 const session=verify(req.body?.sessionToken,req.userId);
 const reply=session.history.at(-1);
 if(reply?.role!=='assistant')throw fail('Replica nu este disponibila.');
 const audio=await cartesiaSpeechBuffer(reply.content,undefined,req.body?.slow===true?{speed:0.65}:{});
 res.set('Content-Type','audio/mpeg');
 res.set('X-Audio-Provider','cartesia');
 res.send(audio);
}));
router.post('/free/turn',wrap(async(req,res)=>{
 const s=verify(req.body?.sessionToken,req.userId),message=req.body?.message;
 if(s.turn>=30)throw fail('Dialogul s-a încheiat. Începe unul nou.',409);
 if(typeof message!=='string'||!message.trim()||message.length>1200)throw fail('Scrie un mesaj de maximum 1200 de caractere.');
 const reference=await referenceMessage(req,s,message.trim());
 const raw=await complete(req,[{role:'system',content:promptFor(s.level)+"\n"+languageInstructions(s.languages)},...(reference?[reference]:[]),...s.history,{role:'user',content:message.trim()}],true);
 const result=parseReply(raw,message.trim());
 if(!result)throw fail('Răspuns invalid.',502);
 const next={...s,turn:s.turn+1,history:[...s.history,{role:'user',content:message.trim()},{role:'assistant',content:result.reply}].slice(-11)};
 res.json({sessionToken:sign(next),...result,level:s.level,turn:next.turn,done:next.turn>=30});
}));
router.post('/translate',wrap(async(req,res)=>{
 const text=req.body?.text;if(typeof text!=='string'||!text.trim()||text.length>1800)throw fail('Text invalid.');
 const translation=await complete(req,[{role:'system',content:translationInstructions()},{role:'user',content:text}]);
 res.json({translation});
}));
module.exports=router;
