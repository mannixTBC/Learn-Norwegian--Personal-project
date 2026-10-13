const { test } = require('node:test');
const assert = require('node:assert/strict');
const { deleteUserAccount } = require('./accountDeletion');

const fakeSupabase = ({ customerId = null, customerError = null, deleteError = null } = {}) => {
  const calls = [];
  return {
    calls,
    from: () => ({
      select: () => ({
        eq: () => ({ maybeSingle: async () => ({ data: customerId ? { stripe_customer_id: customerId } : null, error: customerError }) }),
      }),
    }),
    auth: { admin: { deleteUser: async (userId) => { calls.push(['deleteUser', userId]); return { error: deleteError }; } } },
  };
};

test('șterge identitatea după oprirea clientului de plată', async () => {
  const supabase = fakeSupabase({ customerId: 'cus_test' });
  const calls = [];
  const stripe = { customers: { del: async (id) => { calls.push(['stripe', id]); } } };
  await deleteUserAccount({ userId: 'user-1', supabase, stripe });
  assert.deepEqual(calls, [['stripe', 'cus_test']]);
  assert.deepEqual(supabase.calls, [['deleteUser', 'user-1']]);
});

test('nu șterge contul dacă abonamentul nu poate fi oprit', async () => {
  const supabase = fakeSupabase({ customerId: 'cus_test' });
  await assert.rejects(deleteUserAccount({ userId: 'user-1', supabase, stripe: null }), { status: 503 });
  assert.deepEqual(supabase.calls, []);
});

test('șterge direct un cont fără client de plată', async () => {
  const supabase = fakeSupabase();
  await deleteUserAccount({ userId: 'user-2', supabase, stripe: null });
  assert.deepEqual(supabase.calls, [['deleteUser', 'user-2']]);
});
