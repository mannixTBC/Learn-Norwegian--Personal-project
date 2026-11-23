import {check} from './contract.mjs';
import {createSupabaseRepository} from './supabaseRepository.mjs';
import {createConversationService} from './service.mjs';
import {createConversationRouter} from './router.mjs';
import {createAiEvaluatorForRequest} from './aiIntegration.mjs';
import {freeConversations} from './freeCatalog.mjs';
import {createLiveTokenIssuer} from './live.mjs';
import {practicalConversations,previousPracticalConversations} from './practicalCatalog.mjs';

// Explicit opt-in composition; no env loading, credentials, imports from V1 or network on import.
// evaluateForRequest must wrap model calls with existing quota/usage accounting.
export function mountConversationV2(app,{enabled=false,express,requireAuth,client,catalog,evaluateForRequest,ai,live,canSaveLiveTranscript}) {
  if (!enabled) return false;
  check(Array.isArray(catalog) && catalog.length > 0,'INVALID_CATALOG');
  catalog=[...catalog,...[...freeConversations,...previousPracticalConversations,...practicalConversations].filter(f=>!catalog.some(s=>s.id===f.id&&s.version===f.version))];
  check(!(evaluateForRequest && ai?.enabled),'INVALID_AI_CONFIG');
  const evaluatorFactory=evaluateForRequest || createAiEvaluatorForRequest(ai || {});
  const repository = createSupabaseRepository(client);
  app.use('/api/conversations/v2',createConversationRouter({express,enabled:true,requireAuth,catalog,canSaveLiveTranscript,issueLiveToken:createLiveTokenIssuer(live),
    serviceForRequest:req => createConversationService({enabled:true,repository,catalog,evaluate:evaluatorFactory?.(req)})}));
  return true;
}
