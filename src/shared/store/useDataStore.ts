// Local: src/shared/store/useDataStore.ts
import { create } from 'zustand';
import { api } from '../services/apiClient'; // Importa nosso cliente de API centralizado
import { JobPosting } from '../../features/screening/types';
import { Candidate } from '../../shared/types';
import { UserProfile } from '../../features/auth/types';

interface DataState {
  jobs: JobPosting[];
  candidates: Candidate[];
  isDataLoading: boolean;
  error: string | null;
  fetchAllData: (profile: UserProfile) => Promise<void>;
  addJob: (job: JobPosting) => void;
  updateJobInStore: (updatedJob: JobPosting) => void;
  deleteJobById: (jobId: number) => Promise<void>;
  updateCandidateStatus: (candidateId: number, newStatus: string) => Promise<void>;
  updateCandidateStatusInStore: (candidateId: number, newStatus: 'Triagem' | 'Entrevista' | 'Aprovado' | 'Reprovado') => void;
}

export const useDataStore = create<DataState>((set, get) => ({
  jobs: [], // SEMPRE inicia como um array vazio
  candidates: [], // SEMPRE inicia como um array vazio
  isDataLoading: false,
  error: null,

  fetchAllData: async (profile: UserProfile) => {
    if (get().isDataLoading) return;
    set({ isDataLoading: true, error: null });
    try {
      const response = await api.get(`/api/data/all/${profile.id}`);
      if (!response.ok) {
        throw new Error('Falha ao carregar dados do servidor.');
      }
      const data = await response.json();
      const jobs = Array.isArray(data.jobs) ? data.jobs : [];
      const candidates = Array.isArray(data.candidates) ? data.candidates : [];
      set({ jobs, candidates, isDataLoading: false });
    } catch (err: any) {
      console.error("Erro ao buscar dados (useDataStore):", err);
      set({ error: 'Falha ao carregar dados.', jobs: [], candidates: [], isDataLoading: false });
    }
  },

  addJob: (job: JobPosting) => {
    set((state) => ({ jobs: [job, ...state.jobs] }));
  },

  updateJobInStore: (updatedJob: JobPosting) => {
    set((state) => ({
      jobs: state.jobs.map(job => job.id === updatedJob.id ? updatedJob : job)
    }));
  },

  deleteJobById: async (jobId: number) => {
    try {
      const response = await api.delete(`/api/jobs/${jobId}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Não foi possível excluir a vaga.");
      }
      set((state) => ({
        jobs: state.jobs.filter(job => job.id !== jobId)
      }));
    } catch (error) {
      console.error("Erro ao deletar vaga (useDataStore):", error);
      throw error;
    }
  },

  updateCandidateStatus: async (candidateId: number, newStatus: string) => {
    try {
      // Usa nosso cliente de API para fazer a chamada PATCH para o subdomínio correto
      const response = await api.patch(`/api/candidates/${candidateId}/status`, { status: newStatus });
      if (!response.ok) {
        throw new Error("Não foi possível atualizar o status.");
      }
      // Atualiza o estado localmente apenas após o sucesso da chamada à API
      get().updateCandidateStatusInStore(candidateId, newStatus as any);
    } catch (error) {
      console.error("Erro ao atualizar status do candidato:", error);
      // Re-lança o erro para que o componente que chamou (o Kanban) possa lidar com ele, se necessário
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