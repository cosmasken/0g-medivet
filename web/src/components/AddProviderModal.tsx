import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus } from 'lucide-react';
import { useProviderStore, AccessLevel } from '@/stores/providerStore';

interface AddProviderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddProviderModal({ open, onOpenChange }: AddProviderModalProps) {
  const [walletAddress, setWalletAddress] = useState('');
  const [name, setName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [accessLevel, setAccessLevel] = useState<AccessLevel>('view');
  
  const { addProvider } = useProviderStore();

  const handleAdd = () => {
    if (walletAddress.trim() && name.trim()) {
      addProvider(walletAddress.trim(), name.trim(), accessLevel, specialty.trim() || undefined);
      setWalletAddress('');
      setName('');
      setSpecialty('');
      setAccessLevel('view');
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Add Healthcare Provider
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="walletAddress">Wallet Address</Label>
            <Input
              id="walletAddress"
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              placeholder="0x..."
              className="font-mono text-sm"
            />
          </div>
          
          <div>
            <Label htmlFor="name">Provider Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Dr. John Smith"
            />
          </div>
          
          <div>
            <Label htmlFor="specialty">Specialty (Optional)</Label>
            <Input
              id="specialty"
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              placeholder="Cardiology, Radiology, etc."
            />
          </div>
          
          <div>
            <Label htmlFor="accessLevel">Access Level</Label>
            <Select value={accessLevel} onValueChange={(value: AccessLevel) => setAccessLevel(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="view">View Only</SelectItem>
                <SelectItem value="edit">View & Edit</SelectItem>
                <SelectItem value="full">Full Access</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAdd} 
              disabled={!walletAddress.trim() || !name.trim()}
            >
              Add Provider
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
