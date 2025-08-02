// Local: src/features/auth/context/AuthContext.tsx
import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { AuthState, LoginCredentials, SignUpCredentials, UserProfile } from '../types';

// Pega a URL base da API das variáveis de ambiente para produção
// Em desenvolvimento, continuará usando o proxy para /api
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

interface AuthContextType extends AuthState {
  error: string | null;
  signUp: (credentials: SignUpCredentials) => Promise<UserProfile | null>;
  signIn: (credentials: LoginCredentials) => Promise<boolean>;
  signOut: () => void;
  updateProfile: (newProfileData: Partial<UserProfile>) => void;
  refetchProfile: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    profile: null,
    isAuthenticated: false,
    isLoading: true,
  });
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('userProfile');
      if (storedUser) {
        setAuthState({
          profile: JSON.parse(storedUser),
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.error("Falha ao carregar perfil do localStorage", error);
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const updateProfile = (newProfileData: Partial<UserProfile>) => {
    setAuthState(prev => {
        if (!prev.profile) return prev;
        const updatedProfile = { ...prev.profile, ...newProfileData };
        localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
        return { ...prev, profile: updatedProfile };
    });
  };

  const refetchProfile = useCallback(async () => {
    if (!authState.profile?.id) {
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/${authState.profile.id}`);
      if (!response.ok) {
        throw new Error('Falha ao buscar perfil atualizado.');
      }
      const userProfile: UserProfile = await response.json();

      localStorage.setItem('userProfile', JSON.stringify(userProfile));
      setAuthState(prev => ({ ...prev, profile: userProfile }));
    } catch (error) {
      console.error("Erro ao re-sincronizar o perfil do usuário:", error);
    }
  }, [authState.profile?.id]);

  const signUp = async (credentials: SignUpCredentials): Promise<UserProfile | null> => {
    setAuthError(null);
    setAuthState(prev => ({ ...prev, isLoading: true }));
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Erro ao cadastrar.');

      setAuthState(prev => ({ ...prev, isLoading: false }));
      return data.user;

    } catch (error: any) {
      setAuthError(error.message);
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return null;
    }
  };

  const signIn = async (credentials: LoginCredentials): Promise<boolean> => {
    setAuthError(null);
    setAuthState(prev => ({ ...prev, isLoading: true }));
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Falha no login.');

      localStorage.setItem('userProfile', JSON.stringify(data.user));
      setAuthState({ profile: data.user, isAuthenticated: true, isLoading: false });
      return true;
    } catch (error: any) {
      setAuthError(error.message);
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return false;
    }
  };

  const signOut = () => {
    localStorage.clear();
    setAuthState({ profile: null, isAuthenticated: false, isLoading: false });
  };

  const value = { ...authState, error: authError, signUp, signIn, signOut, updateProfile, refetchProfile };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};