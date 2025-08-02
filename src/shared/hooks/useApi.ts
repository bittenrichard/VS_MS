// Local: src/shared/hooks/useApi.ts
import { useCallback } from 'react';
import { useAuth } from '../../features/auth/hooks/useAuth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export const useApi = () => {
  const { profile } = useAuth(); // Apenas para exemplo de como pegar o token no futuro

  const get = useCallback(async (endpoint: string) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  }, []);

  const post = useCallback(async (endpoint: string, body: unknown) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  }, []);

  const patch = useCallback(async (endpoint: string, body: unknown) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  }, []);

  return { get, post, patch };
};