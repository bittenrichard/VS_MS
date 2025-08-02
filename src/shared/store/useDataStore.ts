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
  updateCandidateStatusInStore: (candidateId: number, newStatus: 'Triagem' | 'Entrevista' | 'Aprovado' | 'Reprovado') => void;
}

export const useDataStore = create<DataState>((set) => ({
  jobs: [], // SEMPRE inicia como um array vazio
  candidates: [], // SEMPRE inicia como um array vazio
  isDataLoading: false,
  error: null,

  fetchAllData: async (profile: UserProfile) => {
    set({ isDataLoading: true, error: null });
    try {
      // Usa nosso cliente de API para chamar o endpoint correto
      const response = await api.get(`/api/data/all/${profile.id}`);
      if (!response.ok) {
        throw new Error('Falha ao carregar dados do servidor.');
      }
      
      const data = await response.json();

      // A LÓGICA CORRETA E SEGURA, usando a estrutura que você validou
      const jobs = Array.isArray(data.jobs) ? data.jobs : [];
      const candidates = Array.isArray(data.candidates) ? data.candidates : [];
      
      set({ jobs, candidates, isDataLoading: false });

    } catch (err: any) {
      console.error("Erro ao buscar dados (useDataStore):", err);
      // Em caso de qualquer erro, reseta para um estado seguro
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
      // Usa nosso cliente de API para deletar a vaga
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

  updateCandidateStatusInStore: (candidateId: number, newStatus: 'Triagem' | 'Entrevista' | 'Aprovado' | 'Reprovado') => {
    set((state) => ({
      candidates: state.candidates.map(c => 
        c.id === candidateId ? { ...c, status: { id: 0, value: newStatus } } : c
      )
    }));
  },
}));