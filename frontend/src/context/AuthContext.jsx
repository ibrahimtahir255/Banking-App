import { createContext, useContext, useEffect, useState } from 'react';
import {
  mockLogIn,
  mockSignUp,
  mockLogOut,
  getStoredSessionEmail,
  setStoredSessionEmail,
  getSessionByEmail,
  addAccountToSession,
} from '../api/mockAuth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const email = getStoredSessionEmail();
    if (email) {
      setSession(getSessionByEmail(email));
    }
    setLoading(false);
  }, []);

  async function logIn({ email, password }) {
    if (!password) throw new Error('Enter your secret word.');
    const result = await mockLogIn({ email });
    setStoredSessionEmail(email);
    setSession(result);
    return result;
  }

  async function signUp({ name, email, password }) {
    if (!password) throw new Error('Pick a secret word.');
    const result = await mockSignUp({ name, email });
    setStoredSessionEmail(email);
    setSession(result);
    return result;
  }

  function logOut() {
    mockLogOut();
    setSession(null);
  }

  function registerNewAccount(accountId) {
    if (!session) return;
    addAccountToSession(session.email, accountId);
    setSession({ ...session, accountIds: [...session.accountIds, accountId] });
  }

  return (
    <AuthContext.Provider
      value={{ session, loading, logIn, signUp, logOut, registerNewAccount }}
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
