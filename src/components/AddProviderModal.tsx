import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus } from 'lucide-react';

interface AddProviderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddProvider: (provider: { id: string; name: string; email: string; specialty: string }) => void;
}

export function AddProviderModal({ open, onOpenChange, onAddProvider }: AddProviderModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    specialty: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.email) {
      onAddProvider({
        id: `provider-${Date.now()}`,
        ...formData
      });
      setFormData({ name: '', email: '', specialty: '' });
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
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Provider Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Dr. John Smith"
              required
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="doctor@hospital.com"
              required
            />
          </div>
          <div>
            <Label htmlFor="specialty">Specialty</Label>
            <Input
              id="specialty"
              value={formData.specialty}
              onChange={(e) => setFormData(prev => ({ ...prev, specialty: e.target.value }))}
              placeholder="Cardiology"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Provider</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
