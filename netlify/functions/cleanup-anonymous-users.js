const { createClient } = require('@supabase/supabase-js');
const { cleanupAnonymousUsers } = require('../../backend/anonymousCleanup');

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

exports.handler = async () => {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Curățarea conturilor anonime nu este configurată: lipsesc variabilele Supabase.');
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });

  const result = await cleanupAnonymousUsers({ supabase });
  console.log('[cleanup-anonymous-users]', JSON.stringify(result));

  if (result.failed.length > 0) {
    throw new Error(`${result.failed.length} conturi anonime nu au putut fi șterse.`);
  }

  return { statusCode: 200 };
};
