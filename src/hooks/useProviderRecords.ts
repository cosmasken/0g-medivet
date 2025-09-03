import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProviderPermissions, createAuditLog } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'react-hot-toast';

export const useProviderRecordsQuery = () => {
  const { currentUser } = useAuthStore();
  
  return useQuery({
    queryKey: ['provider-records', currentUser?.id],
    queryFn: () => getProviderPermissions(currentUser?.id || ''),
    enabled: !!currentUser?.id && currentUser?.role === 'provider',
    staleTime: 30000,
  });
};

export const useViewRecordMutation = () => {
  const queryClient = useQueryClient();
  const { currentUser } = useAuthStore();
  
  return useMutation({
    mutationFn: async ({ recordId, patientId }: { recordId: string; patientId: string }) => {
      // Create audit log for viewing
      await createAuditLog({
        user_id: currentUser?.id || '',
        action: 'VIEW_RECORD',
        resource_type: 'medical_record',
        resource_id: recordId,
        details: { patient_id: patientId, viewed_by_provider: currentUser?.id }
      });
      
      return { recordId, patientId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['audit-logs'] });
    },
    onError: (error: any) => {
      toast.error(`Failed to log record view: ${error.message}`);
    },
  });
};
