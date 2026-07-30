// Base URL of the real FastAPI backend (app/main.py). Override with a
// .env file: VITE_API_BASE_URL=http://localhost:8000
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  let body = null;
  try {
    body = await res.json();
  } catch {
    // empty body is fine
  }

  if (!res.ok) {
    const message = body?.detail || `Request failed with status ${res.status}`;
    throw new ApiError(message, res.status);
  }

  return body;
}

export const apiClient = {
  get: (path) => request(path, { method: 'GET' }),
  post: (path, data) => request(path, { method: 'POST', body: JSON.stringify(data) }),
  del: (path) => request(path, { method: 'DELETE' }),
};

export { ApiError };
