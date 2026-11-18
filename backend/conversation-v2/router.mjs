import {randomUUID} from 'node:crypto';
import {check, text, ConversationError, publicScenario} from './contract.mjs';
import {validateCommand} from './engine.mjs';

const uuid = value => typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
const statuses = {SESSION_NOT_FOUND:404, SESSION_EXPIRED:410, SESSION_EXISTS:409, SESSION_ENDED:409,
  REVISION_CONFLICT:409, IDEMPOTENCY_CONFLICT:409, SESSION_BUSY:409, LEASE_LOST:409,
  V2_DISABLED:404, EVALUATOR_UNAVAILABLE:503, DATABASE_UNAVAILABLE:503, EVALUATION_TIMEOUT:504,
  SESSION_COMMAND_LIMIT:429,V2_QUOTA_EXCEEDED:429,V2_QUOTA_UNAVAILABLE:503,
  INVALID_AI_CONFIG:503,INVALID_EVALUATOR:502,
  AI_PROVIDER_UNAVAILABLE:503,AI_REFUSAL:502,INVALID_AI_OUTPUT:502,INVALID_AI_REPLY:502,
  INVALID_ASSESSMENT:502,INVALID_EVIDENCE:502,MISSING_EVIDENCE:502,MISSING_PRIOR_CONTEXT:502,INVALID_FEEDBACK:502};

// Mount before the backend's broad JSON parser. No caller-supplied owner or evaluation.
export function createConversationRouter({express, enabled = false, requireAuth, serviceForRequest, catalog,issueLiveToken}) {
  check(typeof requireAuth === 'function' && typeof serviceForRequest === 'function', 'INVALID_ROUTER_CONFIG');
  const router = express.Router();
  router.use((req,res,next) => {res.set('Cache-Control','no-store');
    if (!enabled) return res.status(404).json({code:'V2_DISABLED'}); next();});
  router.use(requireAuth);
  router.use((req,res,next) => {
    if (!uuid(req.userId)) return res.status(401).json({code:'AUTH_REQUIRED'});
    next();
  });
  router.use(express.json({limit:'16kb', strict:true}));
  const wrap = fn => async (req,res,next) => {try {await fn(req,res);} catch(error) {next(error);}};
  const service = req => serviceForRequest(req);
  const sessionId = req => {check(uuid(req.params.id),'INVALID_SESSION_ID');return req.params.id;};
  router.get('/catalog', wrap(async(req,res) => {
    check(typeof req.query.supportLanguage === 'string','INVALID_LANGUAGE');
    res.json({schemaVersion:2,scenarios:catalog.filter(s => Object.hasOwn(s.locales,req.query.supportLanguage))
      .map(s => publicScenario(s,req.query.supportLanguage))});
  }));
  router.post('/sessions', wrap(async(req,res) => {
    const body = req.body;
    check(body && typeof body === 'object' && !Array.isArray(body),'INVALID_COMMAND');
    check(Object.keys(body).every(k => ['scenarioId','scenarioVersion','supportLanguage','mode','variantId'].includes(k)),'INVALID_COMMAND');
    check(text(body.scenarioId,80) && Number.isSafeInteger(body.scenarioVersion) && body.scenarioVersion > 0
      && /^[a-z]{2}$/.test(body.supportLanguage || '') && ['guided','scenario','free','live'].includes(body.mode)
      && text(body.variantId,80),'INVALID_COMMAND');
    check(catalog.some(s => s.id === body.scenarioId && s.version === body.scenarioVersion),'INVALID_SCENARIO');
    const result = await service(req).start({...body,ownerId:req.userId,sessionId:randomUUID()});
    res.status(201).json(result);
  }));
  router.get('/sessions/:id', wrap(async(req,res) => res.json(await service(req).resume(sessionId(req),req.userId))));
  router.post('/sessions/:id/live-token',wrap(async(req,res)=>{
    check(typeof issueLiveToken==='function','EVALUATOR_UNAVAILABLE');
    check(req.body&&Object.keys(req.body).length===1&&Number.isSafeInteger(req.body.expectedRevision),'INVALID_COMMAND');
    const id=sessionId(req),svc=service(req),current=await svc.resume(id,req.userId);
    check(current.mode==='live'&&!current.liveStarted,'INVALID_LIVE_STATE');
    // Persist a one-shot claim before minting. Neither retries nor a second device can mint twice.
    const claimed=await svc.dispatch(id,req.userId,{type:'liveStart',commandId:randomUUID(),expectedRevision:req.body.expectedRevision});
    const definition=catalog.find(s=>s.id===claimed.scenarioId&&s.version===claimed.scenarioVersion);
    res.json(await issueLiveToken(req,claimed,definition));
  }));
  for (const [route,type] of [['turns','turn'],['help','help'],['finish','finish'],['live-transcript','liveTranscript']]) {
    router.post(`/sessions/:id/${route}`, wrap(async(req,res) => {
      check(req.body && !Object.hasOwn(req.body,'type'),'INVALID_COMMAND');
      const command = {...req.body,type}; validateCommand(command);
      res.json(await service(req).dispatch(sessionId(req),req.userId,command));
    }));
  }
  router.delete('/sessions/:id', wrap(async(req,res) => res.json(await service(req).delete(sessionId(req),req.userId))));
  router.use((error,req,res,next) => {
    if (res.headersSent) return next(error);
    const code = error.type === 'entity.too.large' ? 'BODY_TOO_LARGE' : error.type === 'entity.parse.failed' ? 'INVALID_JSON'
      : error instanceof ConversationError ? error.code : 'V2_UNAVAILABLE';
    const status = code === 'BODY_TOO_LARGE' ? 413 : statuses[code] || (code.startsWith('INVALID_') || code.startsWith('UNSUPPORTED_') || code==='UNKNOWN_VARIANT' ? 400 : 503);
    res.status(status).json({code,error:status >= 500 ? 'Conversația este indisponibilă momentan.' : 'Cererea nu poate fi procesată.'});
  });
  return router;
}
