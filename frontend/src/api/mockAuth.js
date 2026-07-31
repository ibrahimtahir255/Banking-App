/**
 * MOCKED AUTH LAYER
 * ------------------
 * The FastAPI backend (app/routes) has no /login, /signup, or
 * "list accounts for a user" endpoint — only:
 *   POST /api/users            create a user
 *   GET  /api/users/{id}       fetch a user
 *   POST /api/accounts         create an account
 *   GET  /api/accounts/{id}    fetch a single account
 *
 * So real money data (balances, deposits, withdrawals, transactions)
 * always comes straight from the real API. What's mocked here is only
 * the identity/session layer: which accountIds belong to which email,
 * stored in localStorage instead of a real password check.
 *
 * When real /auth/login and /api/users/{id}/accounts endpoints exist,
 * delete this file and swap the calls in AuthContext for real ones —
 * everything downstream (Overview, AccountDetail, modals) already
 * talks to the real API and won't need to change.
 */

import { createUser } from './usersApi';
import { createAccount } from './accountsApi';

const SESSIONS_KEY = 'pigbank_mock_sessions';

function readSessions() {
  try {
    return JSON.parse(localStorage.getItem(SESSIONS_KEY)) || {};
  } catch {
    return {};
  }
}

function writeSessions(sessions) {
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
}

// "Sign up": creates a REAL user + two REAL starter accounts via the
// live API, then remembers the mapping locally so login can find them.
export async function mockSignUp({ name, email }) {
  const sessions = readSessions();
  if (sessions[email]) {
    throw new Error('An account with that email already exists.');
  }

  const user = await createUser(name, email);
  const checking = await createAccount(user.user_id, 'checking');
  const savings = await createAccount(user.user_id, 'savings');

  sessions[email] = {
    userId: user.user_id,
    name: user.name,
    email: user.email,
    accountIds: [checking.account_id, savings.account_id],
  };
  writeSessions(sessions);
  return sessions[email];
}

// "Log in": no password verification happens against the backend
// (there's no endpoint for it) — this just looks up the locally
// remembered session for that email. Any non-empty password is
// accepted in this mocked version.
export async function mockLogIn({ email }) {
  const sessions = readSessions();
  const session = sessions[email];
  if (!session) {
    throw new Error("hmm, nobody here with that email. Typo?");
  }
  return session;
}

export function mockLogOut() {
  localStorage.removeItem('pigbank_active_session_email');
}

export function getStoredSessionEmail() {
  return localStorage.getItem('pigbank_active_session_email');
}

export function setStoredSessionEmail(email) {
  localStorage.setItem('pigbank_active_session_email', email);
}

export function getSessionByEmail(email) {
  const sessions = readSessions();
  return sessions[email] || null;
}

// Lets the UI add a newly-created real account to the mocked session
// (e.g. "+ New stash" on the sidebar / empty state).
export function addAccountToSession(email, accountId) {
  const sessions = readSessions();
  if (!sessions[email]) return;
  sessions[email].accountIds.push(accountId);
  writeSessions(sessions);
}
