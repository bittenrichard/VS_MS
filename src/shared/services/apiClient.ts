// Local: src/shared/services/apiClient.ts
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export const api = {
  get: (endpoint: string, options: RequestInit = {}) => {
    return fetch(`${API_BASE_URL}${endpoint}`, { method: 'GET', ...options });
  },
  post: (endpoint: string, body: unknown, options: RequestInit = {}) => {
    return fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...options.headers },
      body: JSON.stringify(body),
      ...options,
    });
  },
};