import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUserMedicalRecords, createMedicalRecord } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'react-hot-toast';

export const useFileRecords = () => {
  const { currentUser } = useAuthStore();
  
  return useQuery({
    queryKey: ['file-records', currentUser?.id],
    queryFn: () => getUserMedicalRecords(currentUser?.id || ''),
    enabled: !!currentUser?.id,
    staleTime: 30000, // 30 seconds
  });
};

export const useCreateFileRecordMutation = () => {
  const queryClient = useQueryClient();
  const { currentUser } = useAuthStore();
  
  return useMutation({
    mutationFn: createMedicalRecord,
    onMutate: () => {
      toast.loading('Creating record...', { id: 'create-record' });
    },
    onSuccess: () => {
      toast.success('Record created successfully!', { id: 'create-record' });
      queryClient.invalidateQueries({ queryKey: ['file-records', currentUser?.id] });
    },
    onError: (error: any) => {
      toast.error(`Failed to create record: ${error.message}`, { id: 'create-record' });
    },
  });
};