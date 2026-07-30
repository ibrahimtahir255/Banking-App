import { apiClient } from './client';

// POST /api/users
export function createUser(name, email) {
  return apiClient.post('/api/users', { name, email });
}

// GET /api/users/{user_id}
export function getUser(userId) {
  return apiClient.get(`/api/users/${userId}`);
}
