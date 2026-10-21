import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { isSupabaseConfigured, supabase } from '../../services/supabaseClient';
import { fetchEntitlements, isDevBypassActive } from '../../services/entitlements';
import { clearLocalAccountData, deleteRemoteAccount } from '../../services/account';
import { isNativeApp, webUrl } from '../../services/api';
import { restoreLearningProgress, flushLearningProgress } from '../../services/supabaseLearning';

const SESSION_KEY = 'norwegiata_frontend_session';
const GUEST_SESSION = '__norwegiata_guest__';
const AuthContext = createContext(null);

const guestUser = { id: 'guest', name: 'Vizitator', avatarUrl: '', isGuest: true };

/** Entitlements default pentru utilizatori neautentificați. */
const FREE_ENTITLEMENTS = { plan: 'free', isPremium: false, premiumUntil: null, entitlementSource: 'db' };

const formatUser = (authUser) => {
  if (!authUser) return null;
  const metadata = authUser.user_metadata || {};
  const name = metadata.full_name || metadata.name || (authUser.email ? authUser.email.split('@')[0] : 'Vizitator');
  return {
    id: authUser.id,
    email: authUser.email || '',
    name,
    avatarUrl: metadata.avatar_url || metadata.picture || '',
    isGuest: Boolean(authUser.is_anonymous),
  };
};

const authMessage = (error) => {
  const message = (error && error.message ? error.message : '').toLowerCase();
  if (message.includes('invalid login credentials')) return 'E-mailul sau parola nu sunt corecte.';
  if (message.includes('email not confirmed')) return 'Confirmă adresa de e-mail înainte de conectare.';
  if (message.includes('already registered') || message.includes('already been registered')) return 'Există deja un cont cu această adresă de e-mail.';
  if (message.includes('anonymous sign-ins are disabled')) return 'Accesul ca vizitator nu este disponibil momentan.';
  if (message.includes('password should be')) return 'Parola trebuie să aibă cel puțin 8 caractere.';
  if (message.includes('fetch') || message.includes('network')) return 'Nu ne-am putut conecta la serviciul de autentificare. Verifică internetul și încearcă din nou.';
  return error && error.message ? error.message : 'Autentificarea nu a putut fi finalizată.';
};

const ensureSupabase = () => {
  if (!supabase) throw new Error('Conectarea cu un cont nu este disponibilă momentan. Poți continua ca vizitator.');
};

const authRedirectUrl = (path) => (isNativeApp() ? webUrl(path) : `${window.location.origin}${path}`);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [progressOwner, setProgressOwner] = useState(null);
  const [passwordRecovery, setPasswordRecovery] = useState(false);
  const [entitlements, setEntitlements] = useState(FREE_ENTITLEMENTS);

  useEffect(() => {
    if (!supabase) {
      setUser(localStorage.getItem(SESSION_KEY) === GUEST_SESSION ? guestUser : null);
      setInitializing(false);
      return undefined;
    }

    let mounted = true;
    supabase.auth.getSession().then(({ data, error }) => {
      if (!mounted) return;
      if (error) setUser(null);
      else setUser(formatUser(data.session && data.session.user));
      setInitializing(false);
    });

    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      if (event === 'PASSWORD_RECOVERY') setPasswordRecovery(true);
      if (!session?.user) setProgressOwner(null);
      setUser(formatUser(session && session.user));
      setInitializing(false);
    });

    return () => {
      mounted = false;
      if (data && data.subscription) data.subscription.unsubscribe();
    };
  }, []);

  // Restore before protected screens mount, so empty local defaults cannot overwrite cloud data.
  useEffect(() => {
    let current = true;
    if (!user?.id || user.id === 'guest' || !supabase) return undefined;
    void restoreLearningProgress(user.id, () => current)
      .catch((error) => console.warn('Progresul local rămâne disponibil.', error.message))
      .finally(() => { if (current) setProgressOwner(user.id); });
    return () => { current = false; };
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id || !supabase) return undefined;
    const retry = () => void flushLearningProgress(user.id).catch((error) =>
      console.warn('Sincronizarea rămâne în așteptare.', error.message));
    window.addEventListener('online', retry);
    const visible = () => { if (document.visibilityState === 'visible') retry(); };
    document.addEventListener('visibilitychange', visible);
    return () => {
      window.removeEventListener('online', retry);
      document.removeEventListener('visibilitychange', visible);
    };
  }, [user?.id]);

  // Reîncarcă entitlement-urile când se schimbă utilizatorul.
  // În dev bypass, fetchEntitlements returnează constant premium (fără apel DB).
  useEffect(() => {
    let cancelled = false;
    fetchEntitlements(user).then((result) => {
      if (cancelled) return;
      setEntitlements({
        plan: result.plan,
        isPremium: result.isPremium,
        premiumUntil: result.premiumUntil,
        entitlementSource: result.source,
      });
    });
    return () => { cancelled = true; };
  }, [user]);

  const register = async ({ name, email, password }) => {
    ensureSupabase();
    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: { full_name: name.trim() },
        emailRedirectTo: authRedirectUrl('/autentificare'),
      },
    });
    if (error) throw new Error(authMessage(error));
    return { user: formatUser(data.user), requiresEmailConfirmation: !data.session };
  };

  const login = async ({ email, password }) => {
    ensureSupabase();
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
    if (error) throw new Error(authMessage(error));
    return formatUser(data.user);
  };

  const loginAsGuest = async () => {
    if (supabase) {
      try {
        const { data, error } = await supabase.auth.signInAnonymously();
        if (error) throw new Error(authMessage(error));
        return formatUser(data.user);
      } catch (err) {
        // „Continuă ca vizitator" trebuie să funcționeze mereu. Dacă auth-ul
        // Supabase e indisponibil (eroare de rețea, proiect pauzat, anonim
        // dezactivat în dashboard), cădem transparent pe o sesiune locală
        // de vizitator, ca să poată folosi aplicația fără cont.
        localStorage.setItem(SESSION_KEY, GUEST_SESSION);
        setUser(guestUser);
        return guestUser;
      }
    }
    localStorage.setItem(SESSION_KEY, GUEST_SESSION);
    setUser(guestUser);
    return guestUser;
  };

  const loginWithGoogle = async () => {
    ensureSupabase();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: authRedirectUrl('/dashboard') },
    });
    if (error) throw new Error(authMessage(error));
  };

  const requestPasswordReset = async (email) => {
    ensureSupabase();
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: authRedirectUrl('/autentificare?recovery=1'),
    });
    if (error) throw new Error(authMessage(error));
  };

  const updatePassword = async (password) => {
    ensureSupabase();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw new Error(authMessage(error));
    setPasswordRecovery(false);
  };

  const logout = async () => {
    localStorage.removeItem(SESSION_KEY);
    if (supabase) {
      const { error } = await supabase.auth.signOut();
      if (error) throw new Error(authMessage(error));
    }
    setUser(null);
  };

  const deleteAccount = async () => {
    if (supabase) await deleteRemoteAccount({ allowMissingSession: Boolean(user?.isGuest) });
    clearLocalAccountData();
    if (supabase) await supabase.auth.signOut({ scope: 'local' }).catch(() => {});
    setUser(null);
  };

  // Reîncarcă forțat entitlement-urile (ex. după întoarcerea din Stripe Checkout).
  const refreshEntitlements = async () => {
    const result = await fetchEntitlements(user);
    setEntitlements({
      plan: result.plan,
      isPremium: result.isPremium,
      premiumUntil: result.premiumUntil,
      entitlementSource: result.source,
    });
  };

  const value = useMemo(() => ({
    user,
    isAuthenticated: Boolean(user),
    initializing: initializing || Boolean(supabase && user && user.id !== 'guest' && progressOwner !== user.id),
    isSupabaseConfigured,
    passwordRecovery,
    setPasswordRecovery,
    register,
    login,
    loginAsGuest,
    loginWithGoogle,
    requestPasswordReset,
    updatePassword,
    logout,
    deleteAccount,
    // Entitlements Premium
    plan: entitlements.plan,
    isPremium: entitlements.isPremium,
    premiumUntil: entitlements.premiumUntil,
    entitlementSource: entitlements.entitlementSource,
    isDevBypass: isDevBypassActive(),
    refreshEntitlements,
  }), [entitlements, initializing, passwordRecovery, progressOwner, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
