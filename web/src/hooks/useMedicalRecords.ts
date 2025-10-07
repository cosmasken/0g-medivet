import { useState, useEffect } from 'react';
import { getUserMedicalRecords } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';

export const useMedicalRecords = () => {
  const { currentUser } = useAuthStore();
  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRecords = async () => {
    if (!currentUser?.id) return;
    
    try {
      setIsLoading(true);
      setError(null);
      const { records: fetchedRecords } = await getUserMedicalRecords(currentUser.id);
      setRecords(fetchedRecords || []);
    } catch (err) {
      setError('Failed to load medical records');
      console.error('Failed to load medical records:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRecords();
  }, [currentUser?.id]);

  const refreshRecords = () => {
    loadRecords();
  };

  return {
    records,
    isLoading,
    error,
    refreshRecords
  };
};
