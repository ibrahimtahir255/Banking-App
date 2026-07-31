import { createUser, login as apiLogin, getUser } from './usersApi';
import { setToken, clearToken } from './client';

const ACCOUNTS_KEY = 'pigbank_known_accounts'; // { [email]: [accountId, ...] }
const SESSION_EMAIL_KEY = 'pigbank_active_session_email';

function readKnownAccounts() {
    try {
      return JSON.parse(localStorage.getItem(ACCOUNTS_KEY)) || {};
    } catch {
      return {};
    }
}

function writeKnownAccounts(map) {
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(map));
}

// A JWT's payload is just base64-encoded JSON (not encrypted) â safe to
// read on the client for convenience, but the SERVER is what actually
// verifies it's legitimate on every request.
function decodeUserId(token) {
    if (!token) {
        throw new Error("JWT token is undefined.");
    }

    const parts = token.split(".");

    if (parts.length !== 3) {
        throw new Error("Invalid JWT format.");
    }

    const payload = JSON.parse(atob(parts[1]));
    return payload.user_id;
}
export async function realSignUp({ name, email, password }) {
    const user = await createUser(name, email, password);
    
    const { access_token } = await apiLogin(email, password);
    const response = await apiLogin(email, password);
    console.log(response);
    setToken(access_token);


    const accountIds = [];
    const known = readKnownAccounts();
    known[email] = accountIds;
    writeKnownAccounts(known);
    localStorage.setItem(SESSION_EMAIL_KEY, email);

    return { userId: user.user_id, name: user.name, email: user.email, accountIds };
}

export async function realLogIn({ email, password }) {
    // See exactly what the API returns
    const response = await apiLogin(email, password);
    console.log("Login response:", response);

    // Support either an object or a raw token string
    const access_token =
        typeof response === "string"
            ? response
            : response?.access_token;

    if (!access_token) {
        throw new Error("Login succeeded but no access token was returned.");
    }

    setToken(access_token);

    const userId = decodeUserId(access_token);
    const user = await getUser(userId);

    const known = readKnownAccounts();
    const accountIds = known[email] || [];

    localStorage.setItem(SESSION_EMAIL_KEY, email);

    return {
        userId,
        name: user.name,
        email: user.email,
        accountIds,
    };
}
export function realLogOut() {
    clearToken();
    localStorage.removeItem(SESSION_EMAIL_KEY);
}

export function getStoredSessionEmail() {
    return localStorage.getItem(SESSION_EMAIL_KEY);
}
  
export function addAccountToKnown(email, accountId) {
    const known = readKnownAccounts();
    known[email] = [...(known[email] || []), accountId];
    writeKnownAccounts(known);
}

export function removeAccountFromKnown(email, accountId) {
    const known = readKnownAccounts();
    known[email] = (known[email] || []).filter((id) => id != accountId);
    writeKnownAccounts(known);
}