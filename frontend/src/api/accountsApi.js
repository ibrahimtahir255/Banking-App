import { apiClient } from './client';

// POST /api/accounts  { userId, accountType }
export function createAccount(userId, accountType) {
  return apiClient.post('/api/accounts', { userId, accountType });
}

// GET /api/accounts/{account_id}
export function getAccount(accountId) {
  return apiClient.get(`/api/accounts/${accountId}`);
}

// POST /api/accounts/{account_id}/deposit  { amount }
export function deposit(accountId, amount) {
  return apiClient.post(`/api/accounts/${accountId}/deposit`, { amount });
}

// POST /api/accounts/{account_id}/withdraw  { amount }
export function withdraw(accountId, amount) {
  return apiClient.post(`/api/accounts/${accountId}/withdraw`, { amount });
}

// GET /api/accounts/{account_id}/transactions
export function getTransactions(accountId) {
  return apiClient.get(`/api/accounts/${accountId}/transactions`);
}

// DELETE /api/accounts/{account_id}
export function deleteAccount(accountId) {
  return apiClient.del(`/api/accounts/${accountId}`);
}
