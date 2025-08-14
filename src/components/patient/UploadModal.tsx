import React, { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useRecordStore } from '@/stores/recordStore';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UploadCloud, FileText, Check } from 'lucide-react';
import { RecordStatus } from '@/types';
import toast from 'react-hot-toast';

interface UploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const UploadModal: React.FC<UploadModalProps> = ({ open, onOpenChange }) => {
  const { currentUser } = useAuthStore();
  const { createRecord } = useRecordStore();
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    status: 'Monetizable' as RecordStatus
  });

  const categories = [
    'General Health',
    'Cardiology',
    'Diabetes Care',
    'Laboratory',
    'Mental Health',
    'Dermatology',
    'Orthopedics',
    'Neurology',
    'Other'
  ];

  const handleUpload = async () => {
    if (!currentUser || !formData.title || !formData.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    setUploading(true);
    
    // Simulate file upload and encryption
    await new Promise(resolve => setTimeout(resolve, 2000));

    const mockEncryptedData = new Uint8Array([
      Math.floor(Math.random() * 256),
      Math.floor(Math.random() * 256),
      Math.floor(Math.random() * 256),
      Math.floor(Math.random() * 256),
      Math.floor(Math.random() * 256)
    ]);

    createRecord({
      owner: currentUser.principal,
      title: formData.title,
      category: formData.category,
      encryptedBlob: mockEncryptedData,
      status: formData.status
    });

    setUploading(false);
    toast.success('Health record uploaded successfully!');
    onOpenChange(false);
    setFormData({
      title: '',
      category: '',
      description: '',
      status: 'Monetizable'
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <UploadCloud className="h-5 w-5" />
            <span>Upload Health Record</span>
          </DialogTitle>
          <DialogDescription>
            Securely upload and encrypt your medical data
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Annual Physical Exam 2024"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="category">Category *</Label>
            <Select 
              value={formData.category} 
              onValueChange={(value) => setFormData({ ...formData, category: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Additional notes or context..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="status">Monetization Status</Label>
            <Select 
              value={formData.status} 
              onValueChange={(value) => setFormData({ ...formData, status: value as RecordStatus })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Monetizable">Monetizable - Can be sold on marketplace</SelectItem>
                <SelectItem value="NonMonetizable">Non-Monetizable - Private only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Mock file upload area */}
          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-2">
              Drop files here or click to browse
            </p>
            <Button variant="outline" size="sm">
              Choose Files
            </Button>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={uploading}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleUpload}
              className="flex-1"
              disabled={uploading || !formData.title || !formData.category}
            >
              {uploading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                  <span>Encrypting...</span>
                </div>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Upload Record
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UploadModal;