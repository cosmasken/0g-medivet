import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { contractService } from '@/services/contractService';
import { useWallet } from '@/hooks/useWallet';
import { toast } from 'react-hot-toast';

export function ProviderStaking() {
  const [stakeAmount, setStakeAmount] = useState('');
  const [currentStake, setCurrentStake] = useState('0');
  const [minStake, setMinStake] = useState('0');
  const [loading, setLoading] = useState(false);
  const { address, isConnected } = useWallet();

  useEffect(() => {
    if (isConnected && address) {
      loadStakeInfo();
    }
  }, [isConnected, address]);

  const loadStakeInfo = async () => {
    try {
      await contractService.initialize();
      const [stake, minimum] = await Promise.all([
        contractService.getProviderStake(address!),
        contractService.getMinimumStake()
      ]);
      setCurrentStake(stake);
      setMinStake(minimum);
    } catch (error) {
      console.error('Failed to load stake info:', error);
    }
  };

  const handleStake = async () => {
    if (!stakeAmount || parseFloat(stakeAmount) <= 0) {
      toast.error('Please enter a valid stake amount');
      return;
    }

    setLoading(true);
    try {
      await contractService.stakeAsProvider(stakeAmount);
      toast.success('Successfully staked as provider!');
      setStakeAmount('');
      loadStakeInfo();
    } catch (error: any) {
      toast.error(error.message || 'Failed to stake');
    } finally {
      setLoading(false);
    }
  };

  const isStaked = parseFloat(currentStake) >= parseFloat(minStake);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Provider Staking</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Current Stake:</span>
            <p className="font-semibold">{currentStake} OG</p>
          </div>
          <div>
            <span className="text-gray-600">Minimum Required:</span>
            <p className="font-semibold">{minStake} OG</p>
          </div>
        </div>

        <div className={`p-3 rounded-lg ${isStaked ? 'bg-green-50 text-green-800' : 'bg-yellow-50 text-yellow-800'}`}>
          {isStaked ? '✅ You are staked as a provider' : '⚠️ You need to stake to become a provider'}
        </div>

        {!isStaked && (
          <div className="space-y-3">
            <Input
              type="number"
              placeholder="Stake amount (OG)"
              value={stakeAmount}
              onChange={(e) => setStakeAmount(e.target.value)}
              min={minStake}
              step="0.01"
            />
            <Button 
              onClick={handleStake} 
              disabled={loading || !isConnected}
              className="w-full"
            >
              {loading ? 'Staking...' : 'Stake as Provider'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
