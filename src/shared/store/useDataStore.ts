// Local: src/shared/store/useDataStore.ts
import { create } from 'zustand';
import { api } from '../services/apiClient'; // Importa nosso novo cliente de API

// ... (suas interfaces permanecem as mesmas)
interface Job {
    id: number;
    name: string;
    description: string;
    status: 'Em andamento' | 'Finalizado';
    'Data de Criação': string;
    'Nº de Aprovados': number;
    'Nº de Reprovados': number;
    'Nº de Candidatos': number;
}
// ... etc

interface DataStore {
  jobs: Job[];
  schedules: any[]; // Defina um tipo mais específico se tiver
  error: string | null;
  isLoading: boolean;
  fetchAllData: (userId: number) => Promise<void>;
  fetchSchedules: (userId: number) => Promise<void>;
}

export const useDataStore = create<DataStore>((set) => ({
  jobs: [],
  schedules: [],
  error: null,
  isLoading: false,
  fetchAllData: async (userId: number) => {
    set({ isLoading: true, error: null });
    try {
      // USA O NOVO CLIENTE DE API
      const response = await api.get(`/api/data/all/${userId}`);
      if (!response.ok) {
        throw new Error('Falha ao carregar dados do servidor.');
      }
      const data = await response.json();
      set({ jobs: data.jobs, isLoading: false });
    } catch (error: any) {
      console.error("Erro ao buscar dados (useDataStore):", error);
      set({ error: error.message, isLoading: false });
    }
  },
  fetchSchedules: async (userId: number) => {
    set({ isLoading: true, error: null });
    try {
        // USA O NOVO CLIENTE DE API
        const response = await api.get(`/api/schedules/${userId}`);
        if (!response.ok) {
            // Se a resposta não for ok, o corpo pode não ser JSON
            // então não tentamos fazer o parse.
            throw new Error('Falha ao buscar agendamentos do servidor.');
        }
        const data = await response.json();
        set({ schedules: data, isLoading: false });
    } catch (error: any) {
        console.error("Erro ao buscar agendamentos:", error);
        set({ error: error.message, isLoading: false });
    }
  },
}));