const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const { requireAuth } = require('../middleware/authSupabaseUser');
const { getStripe } = require('../stripe');
const { deleteUserAccount } = require('../accountDeletion');

const router = express.Router();
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = supabaseUrl && serviceRoleKey
  ? createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } })
  : null;

router.delete('/', requireAuth, async (req, res, next) => {
  try {
    await deleteUserAccount({ userId: req.userId, supabase, stripe: getStripe() });
    return res.status(204).end();
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
