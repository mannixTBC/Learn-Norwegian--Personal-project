// Explicit maintenance command; never imported by the web app or API handlers.
require('dotenv').config();
const fs=require('node:fs');
const path=require('node:path');
const {createClient}=require('@supabase/supabase-js');
const {createKnowledgeService}=require('../backend/knowledge.cjs');
async function main(){
 if(!process.argv.includes('--run'))throw new Error('Use --run after choosing a tested embedding model; this calls the paid provider.');
 const modelId=process.env.NORDLINGO_EMBEDDING_MODEL;
 if(!modelId||!process.env.VITE_SUPABASE_URL||!process.env.SUPABASE_SERVICE_ROLE_KEY)throw new Error('Missing server database or embedding configuration');
 const client=createClient(process.env.VITE_SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
 const data=JSON.parse(fs.readFileSync(path.resolve(__dirname,'../supabase/generated/content.json'),'utf8'));
 const service=createKnowledgeService({client,modelId,embed:async(input,{signal})=>{
  const result=await require('../backend/openai').getOpenAI().embeddings.create({model:modelId,input,dimensions:1536},{signal,timeout:15000,maxRetries:0});
  return result.data[0].embedding;
 }});
 console.log(`Indexed ${await service.index(data.chunks)} purpose-scoped rows. Retrieval remains disabled until explicitly enabled.`);
}
main().catch(error=>{console.error(error.message);process.exitCode=1;});
