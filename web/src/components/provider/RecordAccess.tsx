import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { contractService } from '@/services/contractService';
import { logContractTransaction } from '@/lib/api';
import { useWallet } from '@/hooks/useWallet';
import { toast } from 'react-hot-toast';

interface RecordAccessProps {
  patientAddress: string;
  recordId: string;
}

export function RecordAccess({ patientAddress, recordId }: RecordAccessProps) {
  const [purpose, setPurpose] = useState('');
  const [accessFee, setAccessFee] = useState('0');
  const [loading, setLoading] = useState(false);
  const { address } = useWallet();

  const loadAccessFee = async () => {
    try {
      await contractService.initialize();
      const fee = await contractService.getAccessFee();
      setAccessFee(fee);
    } catch (error) {
      console.error('Failed to load access fee:', error);
    }
  };

  const handleAccessRecord = async () => {
    if (!purpose.trim() || !address) {
      toast.error('Please enter the purpose for accessing this record');
      return;
    }

    setLoading(true);
    try {
      await contractService.initialize();
      if (accessFee === '0') {
        await loadAccessFee();
      }
      
      const receipt = await contractService.accessRecord(patientAddress, recordId, purpose, accessFee);
      
      // Log the transaction on the backend
      await logContractTransaction({
        wallet_address: address,
        action: 'ACCESS_RECORD',
        transaction_hash: receipt.hash,
        details: {
          patient_address: patientAddress,
          record_id: recordId,
          purpose,
          fee: accessFee,
          timestamp: Date.now()
        }
      });
      
      toast.success('Record access granted! Payment processed.');
      setPurpose('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to access record');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Access Patient Record</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-gray-600">
          <p><strong>Patient:</strong> {patientAddress}</p>
          <p><strong>Record ID:</strong> {recordId}</p>
          <p><strong>Access Fee:</strong> {accessFee} OG</p>
        </div>

        <Textarea
          placeholder="Enter the medical purpose for accessing this record (required for HIPAA compliance)"
          value={purpose}
          onChange={(e) => setPurpose(e.target.value)}
          rows={3}
        />

        <Button 
          onClick={handleAccessRecord} 
          disabled={loading || !purpose.trim()}
          className="w-full"
        >
          {loading ? 'Processing Payment...' : `Pay ${accessFee} OG & Access Record`}
        </Button>

        <div className="text-xs text-gray-500">
          This transaction will be recorded on-chain for HIPAA audit compliance.
        </div>
      </CardContent>
    </Card>
  );
}
