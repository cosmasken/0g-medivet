import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUserMedicalRecords, createMedicalRecord } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'react-hot-toast';

// This would be a new API endpoint to get only text records
// For now, we'll filter the records on the client side
export const useTextRecords = () => {
  const { currentUser } = useAuthStore();
  
  return useQuery({
    queryKey: ['text-records', currentUser?.id],
    queryFn: async () => {
      const data = await getUserMedicalRecords(currentUser?.id || '');
      // Filter for text records (this would be done on the server in a real implementation)
      return {
        ...data,
        records: data.records.filter((record: any) => record.file_type === 'text/plain')
      };
    },
    enabled: !!currentUser?.id,
    staleTime: 30000, // 30 seconds
  });
};

export const useCreateTextRecordMutation = () => {
  const queryClient = useQueryClient();
  const { currentUser } = useAuthStore();
  
  return useMutation({
    mutationFn: createMedicalRecord,
    onMutate: () => {
      toast.loading('Creating text record...', { id: 'create-text-record' });
    },
    onSuccess: () => {
      toast.success('Text record created successfully!', { id: 'create-text-record' });
      queryClient.invalidateQueries({ queryKey: ['text-records', currentUser?.id] });
    },
    onError: (error: any) => {
      toast.error(`Failed to create text record: ${error.message}`, { id: 'create-text-record' });
    },
  });
};