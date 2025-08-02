// Local: src/shared/store/useDataStore.ts
import { create } from 'zustand';
import { api } from '../services/apiClient'; // Importa nosso novo cliente de API

// Interfaces (mantenha as suas definições aqui)
interface Job {
    id: number;
    name: string;
    description: string;
    status: 'Em andamento' | 'Finalizado';
    'Data de Criação': string;
    'Nº de Aprovados': number;
    'Nº de Reprovados': number;
    'Nº de Candidatos': number;
    // Adicione a propriedade 'candidates' se ela fizer parte do seu objeto Job
    candidates?: any[]; 
}

interface DataStore {
  jobs: Job[];
  schedules: any[];
  error: string | null;
  isLoading: boolean;
  fetchAllData: (userId: number) => Promise<void>;
  fetchSchedules: (userId: number) => Promise<void>;
}

export const useDataStore = create<DataStore>((set) => ({
  jobs: [], // Inicia como um array vazio para evitar erros
  schedules: [], // Inicia como um array vazio para evitar erros
  error: null,
  isLoading: false,
  fetchAllData: async (userId: number) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/api/data/all/${userId}`);
      if (!response.ok) {
        throw new Error('Falha ao carregar dados do servidor.');
      }
      const data = await response.json();
      
      // --- CORREÇÃO CRÍTICA AQUI ---
      // Assumimos que a API retorna o array de jobs diretamente.
      // E garantimos que, se algo der errado no parse, jobs será um array vazio.
      set({ jobs: Array.isArray(data) ? data : [], isLoading: false });

    } catch (error: any) {
      console.error("Erro ao buscar dados (useDataStore):", error);
      // Em caso de erro, garantimos que jobs continue sendo um array vazio
      set({ error: error.message, isLoading: false, jobs: [] });
    }
  },
  fetchSchedules: async (userId: number) => {
    set({ isLoading: true, error: null });
    try {
        const response = await api.get(`/api/schedules/${userId}`);
        if (!response.ok) {
            throw new Error('Falha ao buscar agendamentos do servidor.');
        }
        const data = await response.json();
        
        // --- APLICANDO A MESMA CORREÇÃO AQUI ---
        set({ schedules: Array.isArray(data) ? data : [], isLoading: false });

    } catch (error: any) {
        console.error("Erro ao buscar agendamentos:", error);
        // Em caso de erro, garantimos que schedules continue sendo um array vazio
        set({ error: error.message, isLoading: false, schedules: [] });
    }
  },
}));