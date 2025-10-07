import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createProviderPermission, createAuditLog } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'react-hot-toast';

export const useShareRecordMutation = () => {
  const queryClient = useQueryClient();
  const { currentUser } = useAuthStore();
  
  return useMutation({
    mutationFn: async ({ recordId, providerWalletAddress }: { recordId: string; providerWalletAddress: string }) => {
      // Create permission
      const permission = await createProviderPermission({
        patient_id: currentUser?.id || '',
        provider_id: providerWalletAddress,
        record_id: recordId,
        permission_level: 'view'
      });
      
      // Create audit log
      await createAuditLog({
        user_id: currentUser?.id || '',
        action: 'SHARE_RECORD',
        resource_type: 'medical_record',
        resource_id: recordId,
        details: { shared_with_provider: providerWalletAddress, permission_level: 'view' }
      });
      
      return permission;
    },
    onMutate: () => {
      toast.loading('Sharing record...', { id: 'share-record' });
    },
    onSuccess: () => {
      toast.success('Record shared successfully!', { id: 'share-record' });
      queryClient.invalidateQueries({ queryKey: ['medical-records'] });
      queryClient.invalidateQueries({ queryKey: ['audit-logs'] });
    },
    onError: (error: any) => {
      toast.error(`Failed to share record: ${error.message}`, { id: 'share-record' });
    },
  });
};
