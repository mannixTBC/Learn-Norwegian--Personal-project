const crypto=require('node:crypto');
const fail=(message,status=400)=>Object.assign(new Error(message),{status});
const levels=['A1','A2','B1','B2','C1','C2'];
function signature(data){const secret=process.env.CHAT_SESSION_SECRET||process.env.OPENAI_API_KEY;if(!secret)throw fail('Conversațiile nu sunt configurate.',503);return crypto.createHmac('sha256',secret).update('free-conversation-v1:'+data).digest('base64url');}
function sign(session){const data=Buffer.from(JSON.stringify(session)).toString('base64url');return data+'.'+signature(data);}
function verify(token,userId){
 if(typeof token!=='string'||token.length>40000)throw fail('Sesiune invalidă.',401);
 const [data,sig,extra]=token.split('.'),expected=signature(data||''),received=Buffer.from(sig||'');
 if(extra!==undefined||received.length!==Buffer.byteLength(expected)||!crypto.timingSafeEqual(received,Buffer.from(expected)))throw fail('Sesiune invalidă.',401);
 let s;try{s=JSON.parse(Buffer.from(data,'base64url').toString());}catch{throw fail('Sesiune invalidă.',401);}
 if(s.owner!==userId||!levels.includes(s.level)||!Number.isInteger(s.turn)||s.turn<0||s.turn>30||!Number.isFinite(s.expires)||s.expires<=Date.now()||!Array.isArray(s.history)||s.history.length>11||!s.history.every(m=>['assistant','user'].includes(m.role)&&typeof m.content==='string'&&m.content.length<=1600))throw fail('Sesiunea a expirat. Începe un dialog nou.',401);
 return s;
}
module.exports={levels,sign,verify};
