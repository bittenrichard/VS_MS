// Local: src/shared/services/apiClient.ts
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

const fetchWithAuth = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  return fetch(url, { ...options, headers });
};

export const api = {
  get: (endpoint: string) => fetchWithAuth(`${API_BASE_URL}${endpoint}`, { method: 'GET' }),
  post: (endpoint: string, body: unknown) => fetchWithAuth(`${API_BASE_URL}${endpoint}`, { method: 'POST', body: JSON.stringify(body) }),
  patch: (endpoint: string, body: unknown) => fetchWithAuth(`${API_BASE_URL}${endpoint}`, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: (endpoint: string) => fetchWithAuth(`${API_BASE_URL}${endpoint}`, { method: 'DELETE' })
};