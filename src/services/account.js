import { supabase } from './supabaseClient';
import { apiUrl } from './api';

export const clearLocalAccountData = () => {
  localStorage.clear();
  sessionStorage.clear();
};

export const deleteRemoteAccount = async ({ allowMissingSession = false } = {}) => {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token && allowMissingSession) return false;
  if (!token) throw new Error('Sesiunea a expirat. Conectează-te din nou înainte de ștergerea contului.');

  const response = await fetch(apiUrl('/api/account'), {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(payload?.error || 'Contul nu a putut fi șters. Încearcă din nou.');
  }
  return true;
};
