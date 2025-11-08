import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { contractService } from '@/services/contractService';
import { useWallet } from '@/hooks/useWallet';
import { toast } from 'react-hot-toast';
import { AlertCircle, CheckCircle, Coins, TrendingDown, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ProviderStaking() {
  const [stakeAmount, setStakeAmount] = useState('');
  const [currentStake, setCurrentStake] = useState('0');
  const [minStake, setMinStake] = useState('0');
  const [loading, setLoading] = useState(false);
  const [stakeLoading, setStakeLoading] = useState(false);
  const [unstakeLoading, setUnstakeLoading] = useState(false);
  const [increasingStake, setIncreasingStake] = useState(false);
  const { address, isConnected } = useWallet();

  // Load stake information
  const loadStakeInfo = useCallback(async () => {
    if (!isConnected || !address) return;
    
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
      toast.error('Failed to load stake information');
    }
  }, [address, isConnected]);

  useEffect(() => {
    loadStakeInfo();
  }, [loadStakeInfo]);

  const handleStake = async (amount: string) => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid stake amount');
      return;
    }

    setStakeLoading(true);
    try {
      await contractService.stakeAsProvider(amount);
      toast.success('Successfully staked as provider!');
      setStakeAmount('');
      loadStakeInfo();
    } catch (error: any) {
      toast.error(error.message || 'Failed to stake');
    } finally {
      setStakeLoading(false);
    }
  };

  const handleUnstake = async () => {
    if (!currentStake || parseFloat(currentStake) <= 0) {
      toast.error('No stake to unstake');
      return;
    }

    setUnstakeLoading(true);
    try {
      await contractService.unstakeAsProvider(currentStake);
      toast.success('Successfully unstaked!');
      loadStakeInfo();
    } catch (error: any) {
      toast.error(error.message || 'Failed to unstake');
    } finally {
      setUnstakeLoading(false);
    }
  };

  const handleIncreaseStake = async () => {
    if (!stakeAmount || parseFloat(stakeAmount) <= 0) {
      toast.error('Please enter a valid stake amount');
      return;
    }

    setIncreasingStake(true);
    try {
      await contractService.stakeAsProvider(stakeAmount);
      toast.success('Successfully increased stake!');
      setStakeAmount('');
      loadStakeInfo();
    } catch (error: any) {
      toast.error(error.message || 'Failed to increase stake');
    } finally {
      setIncreasingStake(false);
    }
  };

  const isStaked = parseFloat(currentStake) >= parseFloat(minStake);
  const remainingToStake = Math.max(0, parseFloat(minStake) - parseFloat(currentStake));

  return (
    <Card className="bg-white shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Coins className="h-5 w-5 text-blue-600" />
            <CardTitle>Provider Staking</CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            {isStaked ? (
              <div className="flex items-center text-green-600 text-sm">
                <CheckCircle className="h-4 w-4 mr-1" />
                <span>Active Provider</span>
              </div>
            ) : (
              <div className="flex items-center text-yellow-600 text-sm">
                <AlertCircle className="h-4 w-4 mr-1" />
                <span>Not Staked</span>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
            <div className="text-sm text-blue-700">Current Stake</div>
            <div className="flex items-baseline space-x-1 mt-1">
              <span className="text-2xl font-bold text-blue-900">{currentStake}</span>
              <span className="text-sm text-blue-600">OG</span>
            </div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
            <div className="text-sm text-gray-700">Minimum Required</div>
            <div className="flex items-baseline space-x-1 mt-1">
              <span className="text-2xl font-bold text-gray-900">{minStake}</span>
              <span className="text-sm text-gray-600">OG</span>
            </div>
          </div>
        </div>

        {isStaked ? (
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-green-50 border border-green-200">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                <span className="text-green-800">You are fully staked as a provider</span>
              </div>
              <p className="text-xs text-green-700 mt-1">
                You have sufficient stake to access patient medical records.
              </p>
            </div>

            {/* Increase stake section */}
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Increase Stake</p>
              <div className="flex space-x-2">
                <Input
                  type="number"
                  placeholder="Additional amount (OG)"
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(e.target.value)}
                  min="0"
                  step="0.01"
                  className="flex-1"
                />
                <Button
                  onClick={handleIncreaseStake}
                  disabled={increasingStake || !isConnected || !stakeAmount || parseFloat(stakeAmount) <= 0}
                  variant="secondary"
                  size="sm"
                >
                  {increasingStake ? (
                    <span className="flex items-center">
                      <span className="h-3 w-3 border border-white border-t-transparent rounded-full animate-spin mr-1"></span>
                      Increasing...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      Add
                    </span>
                  )}
                </Button>
              </div>
            </div>

            {/* Unstake section */}
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Unstake</p>
              <div className="flex space-x-2">
                <Button
                  onClick={handleUnstake}
                  disabled={unstakeLoading || !isConnected || !currentStake || parseFloat(currentStake) <= 0}
                  variant="outline"
                  size="sm"
                  className="text-red-600 border-red-300 hover:bg-red-50 flex-1"
                >
                  {unstakeLoading ? (
                    <span className="flex items-center">
                      <span className="h-3 w-3 border border-red-600 border-t-transparent rounded-full animate-spin mr-1"></span>
                      Unstaking...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <TrendingDown className="h-4 w-4 mr-1" />
                      Unstake All
                    </span>
                  )}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-200">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
                <span className="text-yellow-800">Insufficient Stake</span>
              </div>
              <p className="text-xs text-yellow-700 mt-1">
                You need {remainingToStake.toFixed(2)} OG more to meet the minimum requirement.
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label htmlFor="stake-amount" className="block text-sm font-medium text-gray-700 mb-1">
                  Stake Amount (OG)
                </label>
                <Input
                  id="stake-amount"
                  type="number"
                  placeholder={`Enter at least ${minStake} OG`}
                  value={stakeAmount}
                  onChange={(e) => setStakeAmount(e.target.value)}
                  min={minStake}
                  step="0.01"
                />
              </div>
              <Button
                onClick={() => handleStake(stakeAmount)}
                disabled={stakeLoading || !isConnected || !stakeAmount || parseFloat(stakeAmount) <= 0}
                className="w-full"
              >
                {stakeLoading ? (
                  <span className="flex items-center justify-center">
                    <span className="h-4 w-4 border border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                    Staking...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <Coins className="h-4 w-4 mr-2" />
                    Stake as Provider
                  </span>
                )}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}