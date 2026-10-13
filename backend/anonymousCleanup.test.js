const test = require('node:test');
const assert = require('node:assert/strict');
const { cleanupAnonymousUsers } = require('./anonymousCleanup');

const user = (id, { anonymous, createdAt }) => ({
  id,
  is_anonymous: anonymous,
  created_at: createdAt,
});

const fakeSupabase = ({ pages, deleteFailures = new Set() }) => {
  const deletedIds = [];

  return {
    deletedIds,
    auth: {
      admin: {
        listUsers: async ({ page }) => ({
          data: {
            users: pages[page - 1] || [],
            nextPage: page < pages.length ? page + 1 : null,
          },
          error: null,
        }),
        deleteUser: async (userId) => {
          deletedIds.push(userId);
          return {
            error: deleteFailures.has(userId) ? new Error('delete failed') : null,
          };
        },
      },
    },
  };
};

test('șterge doar conturile anonime create de cel puțin 3 zile', async () => {
  const supabase = fakeSupabase({
    pages: [
      [
        user('anonymous-old', { anonymous: true, createdAt: '2026-10-09T12:00:00.000Z' }),
        user('anonymous-new', { anonymous: true, createdAt: '2026-10-12T12:01:00.000Z' }),
        user('permanent-old', { anonymous: false, createdAt: '2025-01-01T00:00:00.000Z' }),
      ],
      [user('anonymous-boundary', { anonymous: true, createdAt: '2026-10-10T12:00:00.000Z' })],
    ],
  });

  const result = await cleanupAnonymousUsers({
    supabase,
    now: new Date('2026-10-13T12:00:00.000Z'),
  });

  assert.deepEqual(supabase.deletedIds.sort(), ['anonymous-boundary', 'anonymous-old']);
  assert.equal(result.scanned, 4);
  assert.equal(result.eligible, 2);
  assert.equal(result.deleted, 2);
  assert.deepEqual(result.failed, []);
});

test('continuă curățarea și raportează ștergerile nereușite', async () => {
  const supabase = fakeSupabase({
    pages: [[
      user('fails', { anonymous: true, createdAt: '2026-10-01T00:00:00.000Z' }),
      user('succeeds', { anonymous: true, createdAt: '2026-10-01T00:00:00.000Z' }),
    ]],
    deleteFailures: new Set(['fails']),
  });

  const result = await cleanupAnonymousUsers({
    supabase,
    now: new Date('2026-10-13T12:00:00.000Z'),
  });

  assert.equal(result.deleted, 1);
  assert.deepEqual(result.failed, [{ userId: 'fails', message: 'delete failed' }]);
});
