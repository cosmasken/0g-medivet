import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuthStore } from '@/stores/authStore';
import { Heart } from 'lucide-react';

interface HealthProfileEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function HealthProfileEditor({ open, onOpenChange }: HealthProfileEditorProps) {
  const { currentUser, updateHealthProfile } = useAuthStore();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    bloodType: currentUser?.profile?.healthProfile?.bloodType || '',
    allergies: Array.isArray(currentUser?.profile?.healthProfile?.allergies) 
      ? currentUser.profile.healthProfile.allergies.join(', ') 
      : '',
    emergencyContactName: currentUser?.profile?.healthProfile?.emergencyContactName || '',
    emergencyContactPhone: currentUser?.profile?.healthProfile?.emergencyContactPhone || '',
    emergencyContactRelation: currentUser?.profile?.healthProfile?.emergencyContactRelation || '',
    lastCheckup: currentUser?.profile?.healthProfile?.lastCheckup || ''
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateHealthProfile({
        bloodType: formData.bloodType,
        allergies: formData.allergies.split(',').map(a => a.trim()).filter(Boolean),
        emergencyContactName: formData.emergencyContactName,
        emergencyContactPhone: formData.emergencyContactPhone,
        emergencyContactRelation: formData.emergencyContactRelation,
        lastCheckup: formData.lastCheckup
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to update health profile:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Edit Health Profile
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="bloodType">Blood Type</Label>
            <Select value={formData.bloodType} onValueChange={(value) => setFormData({...formData, bloodType: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Select blood type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="A+">A+</SelectItem>
                <SelectItem value="A-">A-</SelectItem>
                <SelectItem value="B+">B+</SelectItem>
                <SelectItem value="B-">B-</SelectItem>
                <SelectItem value="AB+">AB+</SelectItem>
                <SelectItem value="AB-">AB-</SelectItem>
                <SelectItem value="O+">O+</SelectItem>
                <SelectItem value="O-">O-</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="allergies">Allergies (comma separated)</Label>
            <Textarea
              id="allergies"
              value={formData.allergies}
              onChange={(e) => setFormData({...formData, allergies: e.target.value})}
              placeholder="Penicillin, Shellfish, Peanuts..."
            />
          </div>
          
          <div>
            <Label htmlFor="emergencyContactName">Emergency Contact Name</Label>
            <Input
              id="emergencyContactName"
              value={formData.emergencyContactName}
              onChange={(e) => setFormData({...formData, emergencyContactName: e.target.value})}
              placeholder="Jane Doe"
            />
          </div>
          
          <div>
            <Label htmlFor="emergencyContactRelation">Relationship</Label>
            <Input
              id="emergencyContactRelation"
              value={formData.emergencyContactRelation}
              onChange={(e) => setFormData({...formData, emergencyContactRelation: e.target.value})}
              placeholder="Spouse, Parent, Sibling..."
            />
          </div>
          
          <div>
            <Label htmlFor="emergencyContactPhone">Emergency Contact Phone</Label>
            <Input
              id="emergencyContactPhone"
              value={formData.emergencyContactPhone}
              onChange={(e) => setFormData({...formData, emergencyContactPhone: e.target.value})}
              placeholder="+1 (555) 123-4567"
            />
          </div>
          
          <div>
            <Label htmlFor="lastCheckup">Last Checkup Date</Label>
            <Input
              id="lastCheckup"
              type="date"
              value={formData.lastCheckup}
              onChange={(e) => setFormData({...formData, lastCheckup: e.target.value})}
            />
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
