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
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadingFiles, setUploadingFiles] = useState<File[]>([]);
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setUploadingFiles(files);
  };

  const handleUpload = async () => {
    if (!currentUser || !formData.title || !formData.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (uploadingFiles.length === 0) {
      toast.error('Please select at least one file');
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    // Simulate file upload with progress
    for (let i = 0; i <= 100; i += 10) {
      setUploadProgress(i);
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Simulate encryption process
    toast.loading('Encrypting files...', { duration: 1000 });
    await new Promise(resolve => setTimeout(resolve, 1000));

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
    setUploadProgress(0);
    toast.success(
      `Health record uploaded successfully! ${uploadingFiles.length} file(s) encrypted and stored.`,
      { duration: 3000 }
    );
    
    onOpenChange(false);
    setFormData({
      title: '',
      category: '',
      description: '',
      status: 'Monetizable'
    });
    setUploadingFiles([]);
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

          {/* File upload area */}
          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center transition-colors hover:border-primary/50">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-2">
              Drop files here or click to browse
            </p>
            <input
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
            />
            <Button variant="outline" size="sm" asChild>
              <label htmlFor="file-upload" className="cursor-pointer">
                Choose Files
              </label>
            </Button>
            {uploadingFiles.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-sm font-medium">Selected files:</p>
                {uploadingFiles.map((file, index) => (
                  <div key={index} className="text-sm text-muted-foreground bg-muted p-2 rounded">
                    {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </div>
                ))}
              </div>
            )}
          </div>

          {uploading && (
            <div className="space-y-2">
              <div className="w-full bg-secondary rounded-full h-2">
                <div 
                  className="medical-gradient h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-sm text-center text-muted-foreground">
                Uploading... {uploadProgress}%
              </p>
            </div>
          )}

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
              disabled={uploading || !formData.title || !formData.category || uploadingFiles.length === 0}
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