// Local: src/shared/services/apiClient.ts

// Pega a URL base da API das variáveis de ambiente para produção.
// Em desenvolvimento, ele será uma string vazia, e o proxy do Vite fará a mágica.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

// Função que encapsula o fetch para adicionar o token de autenticação
const fetchWithAuth = async (url: string, options: RequestInit = {}): Promise<Response> => {
  // Idealmente, você pegaria o token do seu estado de autenticação ou localStorage
  // Por enquanto, vamos manter simples. Em uma versão futura, podemos adicionar o token JWT aqui.

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  return fetch(url, { ...options, headers });
};


// Objeto 'api' que será usado em toda a aplicação
export const api = {
  get: (endpoint: string) => {
    return fetchWithAuth(`${API_BASE_URL}${endpoint}`, { method: 'GET' });
  },
  post: (endpoint: string, body: unknown) => {
    return fetchWithAuth(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },
  // Você pode adicionar put, delete, etc., conforme necessário
  put: (endpoint: string, body: unknown) => {
     return fetchWithAuth(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  },
  delete: (endpoint: string) => {
     return fetchWithAuth(`${API_BASE_URL}${endpoint}`, { method: 'DELETE' });
  }
};