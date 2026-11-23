import {check, ConversationError} from './contract.mjs';
import {applyCommand, authorize, createSession, replayReceipt, sessionView, validateCommand} from './engine.mjs';

// Development/test adapter only. Production requires durable atomic compare-and-swap.
export function createMemoryRepository() {
  const rows = new Map();
  return {
    async insert(session) { check(!rows.has(session.id), 'SESSION_EXISTS'); rows.set(session.id, structuredClone(session)); },
    async read(id) { return rows.has(id) ? structuredClone(rows.get(id)) : null; },
    async compareAndSwap(id, revision, next) {
      check(rows.get(id)?.revision === revision, 'REVISION_CONFLICT');
      rows.set(id, structuredClone(next));
    },
  };
}

export function createConversationService({enabled = false, repository, catalog, evaluate, clock = Date.now, evaluationTimeoutMs = 30000}) {
  check(Number.isInteger(evaluationTimeoutMs) && evaluationTimeoutMs > 0 && evaluationTimeoutMs <= 30000, 'INVALID_TIMEOUT');
  const gate = () => check(enabled === true, 'V2_DISABLED');
  const definition = s => {
    const result = catalog.find(c => c.id === s.scenarioId && c.version === s.scenarioVersion);
    check(result, 'SCENARIO_VERSION_UNAVAILABLE'); return result;
  };
  async function read(id, ownerId) {
    gate(); const session = await repository.read(id, ownerId); authorize(session, ownerId, clock()); return session;
  }
  return {
    async start({ownerId, sessionId, scenarioId, scenarioVersion, supportLanguage, mode, variantId, memory}) {
      gate();
      const scenario = definition({scenarioId, scenarioVersion});
      const session = createSession({scenario, ownerId, sessionId, supportLanguage, mode, variantId, memory, now: clock()});
      await repository.insert(session); return sessionView(session);
    },
    async resume(id, ownerId) { return sessionView(await read(id, ownerId)); },
    async delete(id, ownerId) {
      gate(); check(typeof repository.delete === 'function', 'DELETE_UNAVAILABLE');
      // The durable repository checks owner even for expired sessions.
      return repository.delete(id, ownerId);
    },
    async dispatch(id, ownerId, command) {
      const session = await read(id, ownerId);
      validateCommand(command);
      if (replayReceipt(session, command)) return sessionView(session);
      check(session.status === 'active', 'SESSION_ENDED');
      check(command.expectedRevision === session.revision, 'REVISION_CONFLICT');
      check(session.receipts.length < 100, 'SESSION_COMMAND_LIMIT');
      const scenario = definition(session);
      let lease;
      if (repository.reserve) {
        lease = await repository.reserve(id, ownerId, command);
        if (lease.replay) return sessionView(lease.snapshot);
      }
      try {
        let evaluation;
        // An example sentence is generated under the same lease and quota as a turn.
        const example = command.type === 'help' && command.kind === 'example';
        if (command.type === 'turn' || example) {
          check(session.mode!=='live' && !(example && scenario.kind==='free'),'UNSUPPORTED_MODE');
          check(typeof evaluate === 'function', 'EVALUATOR_UNAVAILABLE');
          const controller = new AbortController(); let timer;
          try {
            evaluation = await Promise.race([
              Promise.resolve().then(() => evaluate({scenario: structuredClone(scenario), session: structuredClone(session), command: structuredClone(command), signal: controller.signal, ...(example ? {task: 'example'} : {})})),
              new Promise((_, reject) => {timer = setTimeout(() => {controller.abort(); reject(new ConversationError('EVALUATION_TIMEOUT'));}, evaluationTimeoutMs);}),
            ]);
          } finally {clearTimeout(timer);}
        }
        const next = applyCommand({scenario, session, ownerId, command, evaluation, now: clock()});
        try {
          if (lease) await repository.commit(id, ownerId, session.revision, next, lease.token);
          else await repository.compareAndSwap(id, session.revision, next);
        }
        catch (error) {
          if (error.code !== 'REVISION_CONFLICT') throw error;
          const latest = await read(id, ownerId);
          if (replayReceipt(latest, command)) return sessionView(latest);
          throw error;
        }
        return sessionView(next);
      } finally {
        // Fenced release cannot erase a newer worker's reservation. Release failure
        // must not replace a committed response or a useful provider error.
        if (lease) await repository.release(id, ownerId, lease.token).catch(() => {});
      }
    },
  };
}
