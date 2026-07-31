import { createContext, useContext, useEffect, useState } from 'react';
import {
  realLogIn,
  realSignUp,
  realLogOut,
  getStoredSessionEmail,
  addAccountToKnown,
  removeAccountFromKnown,
} from '../api/realAuth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Real auth can't instantly rebuild a full session from just a stored
    // email the way the mock could — that would need the password again.
    // For now, a stored email just means "you were logged in before,"
    // but you'll need to log in again after a refresh.
    setLoading(false);
  }, []);

  async function logIn({ email, password }) {
    const result = await realLogIn({ email, password });
    setSession(result);
    return result;
  }

  async function signUp({ name, email, password }) {
    const result = await realSignUp({ name, email, password });
    setSession(result);
    return result;
  }

  function logOut() {
    realLogOut();
    setSession(null);
  }

  function registerNewAccount(accountId) {
    if (!session) return;
    addAccountToKnown(session.email, accountId);
    setSession({ ...session, accountIds: [...session.accountIds, accountId] });
  }

  function unregisterAccount(accountId) {
    if (!session) return;
    removeAccountFromKnown(session.email, accountId);
    setSession({ ...session, accountIds: session.accountIds.filter((id) => id !== accountId)});
  }

  return (
    <AuthContext.Provider
      value={{ session, loading, logIn, signUp, logOut, registerNewAccount, unregisterAccount }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

