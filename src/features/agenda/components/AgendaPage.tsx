// Local: src/features/agenda/pages/AgendaPage.tsx
import React, { useEffect, useState } from 'react';
import { useDataStore } from '../../../shared/store/useDataStore';
import { useAuth } from '../../auth/hooks/useAuth';
import { Schedule } from '../types';
import Calendar from '../components/Calendar';
import ScheduleDetailsModal from '../components/ScheduleDetailsModal';

const AgendaPage: React.FC = () => {
  const { profile } = useAuth();
  const { schedules, fetchSchedules, isDataLoading, error } = useDataStore();
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (profile) {
      fetchSchedules(profile);
    }
  }, [profile, fetchSchedules]);

  const handleEventClick = (schedule: Schedule) => {
    setSelectedSchedule(schedule);
    setIsModalOpen(true);
  };

  if (isDataLoading && schedules.length === 0) {
    return <div>Carregando agenda...</div>;
  }

  if (error) {
    return <div>Erro ao carregar agenda: {error}</div>;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">Agenda de Entrevistas</h1>
      <Calendar schedules={schedules} onEventClick={handleEventClick} />
      <ScheduleDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        schedule={selectedSchedule}
      />
    </div>
  );
};

export default AgendaPage;