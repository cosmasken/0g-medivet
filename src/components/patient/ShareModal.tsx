import React, { useState } from 'react';
import { useRecordStore } from '@/stores/recordStore';
import { useAdminStore } from '@/stores/adminStore';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Share2, Clock, User, QrCode } from 'lucide-react';
import toast from 'react-hot-toast';

interface ShareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  recordId: number | null;
}

const ShareModal: React.FC<ShareModalProps> = ({ open, onOpenChange, recordId }) => {
  const { records, shareRecord } = useRecordStore();
  const { providers } = useAdminStore();
  const [selectedProvider, setSelectedProvider] = useState('');
  const [expiryDays, setExpiryDays] = useState('30');

  const record = recordId ? records.find(r => r.id === recordId) : null;
  const whitelistedProviders = providers.filter(p => p.whitelisted);

  const handleShare = () => {
    if (!record || !selectedProvider) {
      toast.error('Please select a provider');
      return;
    }

    const expiresAt = expiryDays === 'never' 
      ? undefined 
      : Date.now() + (parseInt(expiryDays) * 24 * 60 * 60 * 1000);

    shareRecord(record.id, {
      provider: selectedProvider,
      expiresAt
    });

    toast.success('Record shared successfully!');
    onOpenChange(false);
    setSelectedProvider('');
    setExpiryDays('30');
  };

  if (!record) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Share2 className="h-5 w-5" />
            <span>Share Health Record</span>
          </DialogTitle>
          <DialogDescription>
            Grant secure access to "{record.title}" with a healthcare provider
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Record Info */}
          <div className="p-4 bg-muted rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">{record.title}</h4>
                <p className="text-sm text-muted-foreground">{record.category}</p>
              </div>
              <Badge variant={record.status === 'Monetizable' ? 'default' : 'secondary'}>
                {record.status}
              </Badge>
            </div>
          </div>

          {/* Provider Selection */}
          <div>
            <Label htmlFor="provider">Healthcare Provider *</Label>
            <Select value={selectedProvider} onValueChange={setSelectedProvider}>
              <SelectTrigger>
                <SelectValue placeholder="Select a verified provider" />
              </SelectTrigger>
              <SelectContent>
                {whitelistedProviders.map((provider) => (
                  <SelectItem key={provider.license} value={provider.license}>
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <div>
                        <p className="font-medium">{provider.name}</p>
                        <p className="text-xs text-muted-foreground">{provider.specialty}</p>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {whitelistedProviders.length === 0 && (
              <p className="text-sm text-muted-foreground mt-1">
                No verified providers available
              </p>
            )}
          </div>

          {/* Access Duration */}
          <div>
            <Label htmlFor="expiry">Access Duration</Label>
            <Select value={expiryDays} onValueChange={setExpiryDays}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 days</SelectItem>
                <SelectItem value="30">30 days</SelectItem>
                <SelectItem value="90">90 days</SelectItem>
                <SelectItem value="365">1 year</SelectItem>
                <SelectItem value="never">Never expires</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* QR Code Simulation */}
          <div className="p-4 border border-border rounded-lg text-center">
            <QrCode className="h-16 w-16 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              QR code for secure sharing
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Scan to grant temporary access
            </p>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleShare}
              className="flex-1"
              disabled={!selectedProvider}
            >
              <Share2 className="mr-2 h-4 w-4" />
              Share Record
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareModal;