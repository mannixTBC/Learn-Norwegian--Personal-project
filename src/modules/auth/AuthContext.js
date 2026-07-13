import React, { createContext, useContext, useMemo, useState } from 'react';

const USERS_KEY = 'norwegiata_frontend_users';
const SESSION_KEY = 'norwegiata_frontend_session';
const GUEST_SESSION = '__norwegiata_guest__';
const AuthContext = createContext(null);

const readUsers = () => {
  try { return JSON.parse(localStorage.getItem(USERS_KEY)) || []; }
  catch (_) { return []; }
};

const passwordHash = (password) => {
  let hash = 2166136261;
  for (let index = 0; index < password.length; index += 1) {
    hash ^= password.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
};

const readSessionUser = () => {
  const email = localStorage.getItem(SESSION_KEY);
  if (email === GUEST_SESSION) return { id: 'guest', name: 'Vizitator', isGuest: true };
  return readUsers().find((item) => item.email === email) || null;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(readSessionUser);

  const register = ({ name, email, password }) => {
    const normalizedEmail = email.trim().toLocaleLowerCase();
    const users = readUsers();
    if (users.some((item) => item.email === normalizedEmail)) throw new Error('Există deja un cont cu această adresă de e-mail.');
    const nextUser = { id: `local-${Date.now()}`, name: name.trim(), email: normalizedEmail, passwordHash: passwordHash(password) };
    localStorage.setItem(USERS_KEY, JSON.stringify([...users, nextUser]));
    localStorage.setItem(SESSION_KEY, normalizedEmail);
    setUser(nextUser);
    return nextUser;
  };

  const login = ({ email, password }) => {
    const normalizedEmail = email.trim().toLocaleLowerCase();
    const existing = readUsers().find((item) => item.email === normalizedEmail && item.passwordHash === passwordHash(password));
    if (!existing) throw new Error('E-mailul sau parola nu sunt corecte.');
    localStorage.setItem(SESSION_KEY, normalizedEmail);
    setUser(existing);
    return existing;
  };

  const loginAsGuest = () => {
    const guest = { id: 'guest', name: 'Vizitator', isGuest: true };
    localStorage.setItem(SESSION_KEY, GUEST_SESSION);
    setUser(guest);
    return guest;
  };

  const logout = () => { localStorage.removeItem(SESSION_KEY); setUser(null); };
  const value = useMemo(() => ({ user, isAuthenticated: Boolean(user), register, login, loginAsGuest, logout }), [user]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
