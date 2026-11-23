import {check, ConversationError} from './contract.mjs';
import {createAiEvaluator} from './aiEvaluator.mjs';

const count = value => Number.isFinite(value) && value>=0 ? Math.floor(value) : 0;
export function addUsage(total,usage) {
  return {prompt_tokens:total.prompt_tokens+count(usage.prompt_tokens),
    completion_tokens:total.completion_tokens+count(usage.completion_tokens),
    prompt_tokens_details:{cached_tokens:total.prompt_tokens_details.cached_tokens+count(usage.prompt_tokens_details?.cached_tokens)}};
}

// All dependencies are injected from the existing backend. No changes to V1's
// quota rules, model settings, endpoints, memory or progress readers.
// refundQuota is optional: when supplied, a turn that fails after the reservation
// (provider error, invalid output, timeout) gives the learner's quota unit back.
export function createAiEvaluatorForRequest({enabled=false,getClient,getSettings,consumeQuota,recordUsage,refundQuota,onAccountingError=()=>{},onTiming=()=>{}}) {
  if(!enabled)return undefined;
  check([getClient,getSettings,consumeQuota,recordUsage].every(fn=>typeof fn==='function'),'INVALID_AI_CONFIG');
  return req => async input => {
    check(req?.userId && req.userId===input.session.ownerId,'SESSION_NOT_FOUND');
    check(!input.signal?.aborted,'EVALUATION_TIMEOUT');
    let usage={prompt_tokens:0,completion_tokens:0,prompt_tokens_details:{cached_tokens:0}};
    // Resolve config before consuming a learner's quota.
    const evaluate=createAiEvaluator({client:getClient(),settings:getSettings(),onTiming,onUsage:part=>{usage=addUsage(usage,part);}});
    try {await consumeQuota(req);}
    catch(error) {
      throw new ConversationError(error?.status===429 || error?.isChatQuotaError ? 'V2_QUOTA_EXCEEDED' : 'V2_QUOTA_UNAVAILABLE');
    }
    try {return await evaluate(input);}
    catch(error) {
      if(typeof refundQuota==='function') {
        try {await refundQuota(req);} catch {try{onAccountingError({code:'V2_QUOTA_REFUND_FAILED'});}catch{}}
      }
      throw error;
    }
    finally {
      // The existing implementation releases its local quota lease synchronously
      // before doing best-effort durable accounting. Bound any injected adapter.
      let timer;
      try {
        await Promise.race([Promise.resolve().then(()=>recordUsage(req,usage)),new Promise((_,reject)=>{
          timer=setTimeout(()=>reject(new Error('Usage recording timed out')),1500);
        })]);
      } catch {try{onAccountingError({code:'V2_USAGE_RECORDING_FAILED'});}catch{}}
      finally {clearTimeout(timer);}
    }
  };
}
