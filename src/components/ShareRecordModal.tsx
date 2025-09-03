import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Share2 } from 'lucide-react';

interface ShareRecordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recordTitle: string;
  onShare: (walletAddress: string) => void;
  isSharing?: boolean;
}

export function ShareRecordModal({ 
  open, 
  onOpenChange, 
  recordTitle, 
  onShare,
  isSharing = false 
}: ShareRecordModalProps) {
  const [walletAddress, setWalletAddress] = useState('');

  const handleShare = () => {
    if (walletAddress.trim()) {
      onShare(walletAddress.trim());
      setWalletAddress('');
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Share Medical Record
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-sm font-medium">Record: {recordTitle}</p>
          </div>
          
          <div>
            <Label htmlFor="walletAddress">Provider Wallet Address</Label>
            <Input
              id="walletAddress"
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              placeholder="0x..."
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Enter the healthcare provider's wallet address
            </p>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleShare} 
              disabled={!walletAddress.trim() || isSharing}
            >
              {isSharing ? 'Sharing...' : 'Share Record'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
