// Local: src/features/results/pages/ResultsPage.tsx
import React, { useEffect, useState, useMemo } from 'react';
import { useDataStore } from '../../../shared/store/useDataStore';
import { useAuth } from '../../auth/hooks/useAuth';
import KanbanBoard from '../components/KanbanBoard';
import { Candidate } from '../../../shared/types';
import CandidateDetailsModal from '../components/CandidateDetailsModal';
import ScheduleInterviewModal from '../components/ScheduleInterviewModal';
import { useLocation } from 'react-router-dom';

const ResultsPage: React.FC = () => {
  const { profile } = useAuth();
  const { candidates, fetchAllData, updateCandidateStatus, isDataLoading, error } = useDataStore();
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [isDetailsModalOpen, setDetailsModalOpen] = useState(false);
  const [isScheduleModalOpen, setScheduleModalOpen] = useState(false);
  const location = useLocation();

  const selectedJobId = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get('jobId');
  }, [location.search]);

  useEffect(() => {
    if (profile) {
      fetchAllData(profile);
    }
  }, [profile, fetchAllData]);

  const handleUpdateStatus = async (candidateId: number, newStatus: 'Triagem' | 'Entrevista' | 'Aprovado' | 'Reprovado') => {
    try {
      await updateCandidateStatus(candidateId, newStatus);
    } catch (err) {
      console.error("Falha ao atualizar status na página:", err);
    }
  };

  const handleViewDetails = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setDetailsModalOpen(true);
  };

  const handleScheduleInterview = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setScheduleModalOpen(true);
  };

  const filteredCandidates = useMemo(() => {
    if (!selectedJobId) {
      return candidates;
    }
    return candidates.filter(c => c.id_vaga?.toString() === selectedJobId);
  }, [candidates, selectedJobId]);

  if (isDataLoading && candidates.length === 0) {
    return <div className="text-center p-10">Carregando candidatos...</div>;
  }

  if (error) {
    return <div className="text-center p-10 text-red-600">Erro ao carregar dados: {error}</div>;
  }

  return (
    <div className="flex flex-col h-full bg-gray-50 p-4 sm:p-6 lg:p-8">
      <KanbanBoard
        candidates={filteredCandidates}
        onUpdateStatus={handleUpdateStatus}
        onViewDetails={handleViewDetails}
        onScheduleInterview={handleScheduleInterview}
      />
      <CandidateDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        candidate={selectedCandidate}
      />
      <ScheduleInterviewModal
        isOpen={isScheduleModalOpen}
        onClose={() => setScheduleModalOpen(false)}
        candidate={selectedCandidate}
      />
    </div>
  );
};

export default ResultsPage;