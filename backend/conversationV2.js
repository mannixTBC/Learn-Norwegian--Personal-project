const {createClient}=require('@supabase/supabase-js');
const {mountConversationV2}=require('./conversation-v2/mount.mjs');
const {pilotScenarios}=require('./conversation-v2/pilot.mjs');
const {requireAuth}=require('./middleware/authSupabaseUser');
const {consumeChatQuota,recordChatUsage}=require('./chatUsage');

const createLiveQuota=(consume,release)=>async req=>{try{await consume(req);}finally{await release(req,null);}};
function mount(app,express,dependencies={}){
 if(process.env.CONVERSATION_V2_ENABLED!=='true')return false;
 const url=process.env.VITE_SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY;
 if(!url||!key)throw new Error('V2 database configuration missing');
 const client=dependencies.client||createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
 const authenticate=dependencies.authenticate||requireAuth;
 const windows=new Map();
 const auth=(req,res,next)=>authenticate(req,res,()=>{
  const now=Date.now();
  for(const [id,value] of windows)if(value.until<=now)windows.delete(id);
  const bucket=windows.get(req.userId)||{until:now+60000,total:0,starts:0};
  bucket.total++;
  if(req.method==='POST'&&req.path==='/sessions')bucket.starts++;
  windows.set(req.userId,bucket);
  if(bucket.total>120||bucket.starts>10)return res.status(429).json({code:'V2_QUOTA_EXCEEDED'});
  next();
 });
 // A live call consumes one durable quota unit. Release the text quota's local
 // concurrency lease immediately; live audio usage is not text-token usage.
 const liveQuota=createLiveQuota(consumeChatQuota,recordChatUsage);
 mountConversationV2(app,{enabled:true,express,requireAuth:auth,client,catalog:pilotScenarios,
  ai:{enabled:process.env.CONVERSATION_V2_AI_ENABLED==='true',getClient:require('./openai').getOpenAI,
   getSettings:()=>require('./textModel').textModelSettings('chat'),consumeQuota:consumeChatQuota,recordUsage:recordChatUsage,
   onAccountingError:event=>console.warn(event.code),onTiming:event=>console.info(JSON.stringify({event:'v2_provider_timing',...event}))},
  live:{enabled:process.env.CONVERSATION_V2_LIVE_ENABLED==='true',getApiKey:()=>process.env.OPENAI_API_KEY,
   model:process.env.OPENAI_REALTIME_MODEL||'gpt-realtime',consumeQuota:liveQuota}});
 // V2 data only; new sessions are inaccessible after expiry and retained for
 // 30 days for recovery/diagnosis, then removed with their command records.
 const cleanup=async()=>{try{
  const {error}=await client.from('nl_conversation_v2_sessions').delete().lt('expires_at',new Date(Date.now()-30*86400000).toISOString()).abortSignal(AbortSignal.timeout(10000));
  if(error)console.warn('V2_RETENTION_CLEANUP_FAILED');
 }catch{console.warn('V2_RETENTION_CLEANUP_FAILED');}};
 void cleanup();setInterval(cleanup,6*3600000).unref();
 return true;
}
module.exports={mount,createLiveQuota};
