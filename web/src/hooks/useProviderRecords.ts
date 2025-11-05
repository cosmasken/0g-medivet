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

// New hook for provider record access with automatic payment
export const useViewRecordMutation = () => {
  const queryClient = useQueryClient();
  const { currentUser } = useAuthStore();
  
  return useMutation({
    mutationFn: async ({ recordId, patientId }: { recordId: string; patientId: string }) => {
      // Use the new provider access endpoint that handles auto-payment
      const response = await fetch('http://localhost:3001/api/provider-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider_id: currentUser?.id || '',
          patient_id: patientId,
          record_id: recordId,
          action: 'VIEW_RECORD'
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to access record with payment');
      }
      
      const result = await response.json();
      return result;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['audit-logs'] });
      queryClient.invalidateQueries({ queryKey: ['provider-records'] });
      toast.success('Record accessed successfully. Patient compensated.');
    },
    onError: (error: any) => {
      toast.error(`Failed to access record: ${error.message}`);
    },
  });
};

// Hook for managing provider-patient relationships
export const useProviderPatientRelationship = () => {
  const queryClient = useQueryClient();
  const { currentUser } = useAuthStore();
  
  return useMutation({
    mutationFn: async ({ patientId, relationshipType = 'treated', notes = '' }: { 
      patientId: string; 
      relationshipType?: string; 
      notes?: string;
    }) => {
      const response = await fetch('http://localhost:3001/api/providers/patient-relationships', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider_id: currentUser?.id || '',
          patient_id: patientId,
          relationship_type: relationshipType,
          notes
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create patient relationship');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['provider-patient-relationships'] });
    },
    onError: (error: any) => {
      toast.error(`Failed to create relationship: ${error.message}`);
    },
  });
};
