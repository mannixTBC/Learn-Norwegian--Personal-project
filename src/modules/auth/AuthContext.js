import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { isSupabaseConfigured, supabase } from '../../services/supabaseClient';

const SESSION_KEY = 'norwegiata_frontend_session';
const GUEST_SESSION = '__norwegiata_guest__';
const AuthContext = createContext(null);

const guestUser = { id: 'guest', name: 'Vizitator', avatarUrl: '', isGuest: true };

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

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [passwordRecovery, setPasswordRecovery] = useState(false);

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
      setUser(formatUser(session && session.user));
      setInitializing(false);
    });

    return () => {
      mounted = false;
      if (data && data.subscription) data.subscription.unsubscribe();
    };
  }, []);

  const register = async ({ name, email, password }) => {
    ensureSupabase();
    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: { full_name: name.trim() },
        emailRedirectTo: `${window.location.origin}/autentificare`,
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
      const { data, error } = await supabase.auth.signInAnonymously();
      if (error) throw new Error(authMessage(error));
      return formatUser(data.user);
    }
    localStorage.setItem(SESSION_KEY, GUEST_SESSION);
    setUser(guestUser);
    return guestUser;
  };

  const loginWithGoogle = async () => {
    ensureSupabase();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
    if (error) throw new Error(authMessage(error));
  };

  const requestPasswordReset = async (email) => {
    ensureSupabase();
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: `${window.location.origin}/autentificare?recovery=1`,
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

  const value = useMemo(() => ({
    user,
    isAuthenticated: Boolean(user),
    initializing,
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
  }), [initializing, passwordRecovery, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
