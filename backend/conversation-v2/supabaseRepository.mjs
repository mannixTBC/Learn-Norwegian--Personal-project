import {ConversationError, check} from './contract.mjs';

const errors = new Set(['INVALID_COMMAND','INVALID_SESSION','SESSION_NOT_FOUND','SESSION_EXPIRED','SESSION_ENDED',
  'IDEMPOTENCY_CONFLICT','REVISION_CONFLICT','SESSION_BUSY','SESSION_COMMAND_LIMIT','LEASE_LOST','UNSUPPORTED_TRANSCRIPT_STORAGE']);
export function createSupabaseRepository(client) {
  check(typeof client?.rpc === 'function', 'DATABASE_NOT_CONFIGURED');
  async function call(operation, ownerId, id, data = {}) {
    const request = client.rpc('nl_conversation_v2_store', {p_operation: operation, p_owner: ownerId, p_session: id, p_data: data});
    const {data: result, error} = await (request.abortSignal ? request.abortSignal(AbortSignal.timeout(5000)) : request);
    if (error) throw new ConversationError(error.code === '23505' ? 'SESSION_EXISTS' : errors.has(error.message) ? error.message : 'DATABASE_UNAVAILABLE');
    return result;
  }
  return {
    insert: session => call('insert', session.ownerId, session.id, {snapshot: session}),
    read: (id, ownerId) => call('read', ownerId, id),
    reserve: (id, ownerId, command) => call('reserve', ownerId, id, {command}),
    commit: (id, ownerId, revision, next, token) => call('commit', ownerId, id, {revision, snapshot: next, token}),
    release: (id, ownerId, token) => call('release', ownerId, id, {token}),
    delete: (id, ownerId) => call('delete', ownerId, id),
  };
}
