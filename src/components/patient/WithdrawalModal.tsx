import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Wallet, Bitcoin, RefreshCcw, Check } from 'lucide-react';
import toast from 'react-hot-toast';

interface WithdrawalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const WithdrawalModal: React.FC<WithdrawalModalProps> = ({ open, onOpenChange }) => {
  const [withdrawalType, setWithdrawalType] = useState('ourtoke');
  const [amount, setAmount] = useState('');
  const [address, setAddress] = useState('');
  const [network, setNetwork] = useState('base'); // For EVM/BTC
  const [processing, setProcessing] = useState(false);

  const handleWithdraw = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount.');
      return;
    }
    if (!address) {
      toast.error('Please enter a withdrawal address.');
      return;
    }

    setProcessing(true);
    toast.loading('Processing withdrawal...', { id: 'withdrawal-toast' });

    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate network delay

    setProcessing(false);
    toast.dismiss('withdrawal-toast');
    toast.success('Withdrawal successful! Funds should arrive shortly.');
    
    // Reset form
    setAmount('');
    setAddress('');
    setNetwork('base');
    onOpenChange(false);
  };

  const getAddressPlaceholder = () => {
    switch (withdrawalType) {
      case 'ourtoke': return 'Your OurToken address';
      case 'icp': return 'Your ICP principal ID';
      case 'evm': return 'Your EVM wallet address (0x...)';
      case 'btc': return 'Your Bitcoin address';
      default: return 'Wallet address';
    }
  };

  const isFormValid = () => {
    return parseFloat(amount) > 0 && address.length > 0;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Wallet className="h-5 w-5" />
            <span>Withdraw Funds</span>
          </DialogTitle>
          <DialogDescription>
            Select your withdrawal method and enter details.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="withdrawalType">Withdrawal Type</Label>
            <Select value={withdrawalType} onValueChange={setWithdrawalType}>
              <SelectTrigger>
                <SelectValue placeholder="Select a type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ourtoke">OurToken</SelectItem>
                <SelectItem value="icp">ICP</SelectItem>
                <SelectItem value="evm">EVM (Ethereum, Base, etc.)</SelectItem>
                <SelectItem value="btc">Bitcoin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="amount">Amount</Label>
            <Input 
              id="amount" 
              type="number" 
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          {(withdrawalType === 'evm' || withdrawalType === 'btc') && (
            <div>
              <Label htmlFor="network">Network</Label>
              <Select value={network} onValueChange={setNetwork}>
                <SelectTrigger>
                  <SelectValue placeholder="Select network" />
                </SelectTrigger>
                <SelectContent>
                  {withdrawalType === 'evm' && (
                    <>
                      <SelectItem value="ethereum">Ethereum</SelectItem>
                      <SelectItem value="base">Base</SelectItem>
                      <SelectItem value="polygon">Polygon</SelectItem>
                    </>
                  )}
                  {withdrawalType === 'btc' && (
                    <>
                      <SelectItem value="bitcoin">Bitcoin Mainnet</SelectItem>
                      <SelectItem value="litecoin">Litecoin</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label htmlFor="address">Withdrawal Address</Label>
            <Input 
              id="address" 
              placeholder={getAddressPlaceholder()}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={processing}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleWithdraw}
              className="flex-1"
              disabled={processing || !isFormValid()}
            >
              {processing ? (
                <div className="flex items-center space-x-2">
                  <RefreshCcw className="w-4 h-4 animate-spin" />
                  <span>Withdrawing...</span>
                </div>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Withdraw
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WithdrawalModal;
