import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { contractService } from '@/services/contractService';
import { toast } from 'react-hot-toast';

interface ConsentManagerProps {
  recordId: string;
  isPatient: boolean;
}

export function ConsentManager({ recordId, isPatient }: ConsentManagerProps) {
  const [providerAddress, setProviderAddress] = useState('');
  const [duration, setDuration] = useState('30');
  const [loading, setLoading] = useState(false);

  const handleGiveConsent = async () => {
    if (!providerAddress || !recordId) {
      toast.error('Please enter provider address');
      return;
    }

    setLoading(true);
    try {
      await contractService.initialize();
      await contractService.giveConsent(providerAddress, recordId, parseInt(duration));
      toast.success('Consent granted successfully!');
      setProviderAddress('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to give consent');
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeConsent = async () => {
    if (!providerAddress || !recordId) {
      toast.error('Please enter provider address');
      return;
    }

    setLoading(true);
    try {
      await contractService.initialize();
      await contractService.revokeConsent(providerAddress, recordId);
      toast.success('Consent revoked successfully!');
      setProviderAddress('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to revoke consent');
    } finally {
      setLoading(false);
    }
  };

  if (!isPatient) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Provider Access</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          placeholder="Provider wallet address"
          value={providerAddress}
          onChange={(e) => setProviderAddress(e.target.value)}
        />
        
        <Select value={duration} onValueChange={setDuration}>
          <SelectTrigger>
            <SelectValue placeholder="Access duration" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">7 days</SelectItem>
            <SelectItem value="30">30 days</SelectItem>
            <SelectItem value="90">90 days</SelectItem>
            <SelectItem value="365">1 year</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex gap-2">
          <Button 
            onClick={handleGiveConsent} 
            disabled={loading}
            className="flex-1"
          >
            {loading ? 'Processing...' : 'Give Consent'}
          </Button>
          <Button 
            onClick={handleRevokeConsent} 
            disabled={loading}
            variant="destructive"
            className="flex-1"
          >
            {loading ? 'Processing...' : 'Revoke Consent'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
