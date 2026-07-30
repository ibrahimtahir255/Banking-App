import { apiClient } from './client';

// POST /api/users
export function createUser(name, email, password) {
  return apiClient.post('/api/users', { name, email,password});
}

// GET /api/users/{user_id}
export function getUser(userId) {
  return apiClient.get(`/api/users/${userId}`);
}

// POST /api/login
export function login(email, password) {
  return apiClient.post('/api/login', {email, password});
}
