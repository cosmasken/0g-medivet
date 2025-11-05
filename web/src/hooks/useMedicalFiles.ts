import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUserMedicalRecords, createMedicalRecord } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'react-hot-toast';

export const useMedicalFiles = () => {
  const { currentUser } = useAuthStore();
  
  return useQuery({
    queryKey: ['medical-files', currentUser?.id],
    queryFn: () => getUserMedicalRecords(currentUser?.id || ''),
    enabled: !!currentUser?.id,
    staleTime: 30000, // 30 seconds
  });
};

export const useCreateMedicalFileMutation = () => {
  const queryClient = useQueryClient();
  const { currentUser } = useAuthStore();
  
  return useMutation({
    mutationFn: createMedicalRecord,
    onMutate: () => {
      toast.loading('Uploading file...', { id: 'upload-file' });
    },
    onSuccess: () => {
      toast.success('File uploaded successfully!', { id: 'upload-file' });
      queryClient.invalidateQueries({ queryKey: ['medical-files', currentUser?.id] });
    },
    onError: (error: any) => {
      toast.error(`Failed to upload file: ${error.message}`, { id: 'upload-file' });
    },
  });
};