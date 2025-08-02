// Local: src/shared/store/useDataStore.ts
import { create } from 'zustand';
import { api } from '../services/apiClient';
import { JobPosting } from '../../features/screening/types';
import { Candidate } from '../../shared/types';
import { UserProfile } from '../../features/auth/types';
import { Schedule } from '../../features/schedule/types';

interface DataState {
  jobs: JobPosting[];
  candidates: Candidate[];
  schedules: Schedule[];
  isDataLoading: boolean;
  error: string | null;
  fetchAllData: (profile: UserProfile) => Promise<void>;
  fetchSchedules: (profile: UserProfile) => Promise<void>;
  updateCandidateStatus: (candidateId: number, newStatus: string) => Promise<void>;
  updateCandidateStatusInStore: (candidateId: number, newStatus: 'Triagem' | 'Entrevista' | 'Aprovado' | 'Reprovado') => void;
}

export const useDataStore = create<DataState>((set, get) => ({
  jobs: [],
  candidates: [],
  schedules: [],
  isDataLoading: false,
  error: null,

  fetchAllData: async (profile: UserProfile) => {
    if (get().isDataLoading) return;
    set({ isDataLoading: true, error: null });
    try {
      const response = await api.get(`/api/data/all/${profile.id}`);
      if (!response.ok) throw new Error('Falha ao carregar dados do servidor.');
      const data = await response.json();
      set({
        jobs: Array.isArray(data.jobs) ? data.jobs : [],
        candidates: Array.isArray(data.candidates) ? data.candidates : [],
        isDataLoading: false
      });
    } catch (err: any) {
      console.error("Erro ao buscar dados (useDataStore):", err);
      set({ error: 'Falha ao carregar dados.', jobs: [], candidates: [], isDataLoading: false });
    }
  },

  fetchSchedules: async (profile: UserProfile) => {
    set({ isDataLoading: true, error: null });
    try {
        const response = await api.get(`/api/schedules/${profile.id}`);
        if (!response.ok) throw new Error('Falha ao buscar agendamentos.');
        const data = await response.json();
        set({ schedules: Array.isArray(data) ? data : [], isDataLoading: false });
    } catch (error: any) {
        console.error("Erro ao buscar agendamentos:", error);
        set({ error: error.message, schedules: [], isDataLoading: false });
    }
  },

  updateCandidateStatus: async (candidateId: number, newStatus: string) => {
    try {
      await api.patch(`/api/candidates/${candidateId}/status`, { status: newStatus });
      get().updateCandidateStatusInStore(candidateId, newStatus as any);
    } catch (error) {
      console.error("Erro ao atualizar status do candidato:", error);
      throw error;
    }
  },

  updateCandidateStatusInStore: (candidateId: number, newStatus: 'Triagem' | 'Entrevista' | 'Aprovado' | 'Reprovado') => {
    set((state) => ({
      candidates: state.candidates.map(c =>
        c.id === candidateId ? { ...c, status: { id: 0, value: newStatus } } : c
      )
    }));
  },
}));