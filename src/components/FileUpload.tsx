import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Upload, File, X, CheckCircle } from 'lucide-react';
import { useMedicalFilesStore } from '@/stores/medicalFilesStore';
import { useWallet } from '@/hooks/useWallet';
import { createBlobFromFile } from '@/lib/0g/blob';
import { uploadToStorage } from '@/lib/0g/uploader';
import toast from 'react-hot-toast';

interface FileUploadProps {
  onUploadComplete?: (fileId: string) => void;
  acceptedTypes?: string[];
  maxSize?: number;
}

const FileUpload = ({ 
  onUploadComplete, 
  acceptedTypes = ['image/*', 'application/pdf', '.doc,.docx'],
  maxSize = 10 * 1024 * 1024 // 10MB
}: FileUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { address } = useWallet();
  const { addFile } = useMedicalFilesStore();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!address) {
      toast.error('Please connect your wallet first');
      return;
    }

    const file = acceptedFiles[0];
    if (!file) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      // Create blob from file
      const blob = await createBlobFromFile(file);
      
      // For demo purposes, we'll simulate the 0G upload
      // In production, you would use actual 0G network endpoints
      const mockTxHash = `0x${Math.random().toString(16).substr(2, 64)}`;
      const mockRootHash = `0x${Math.random().toString(16).substr(2, 64)}`;

      clearInterval(progressInterval);
      setUploadProgress(100);

      // Add file to store
      const fileMetadata = {
        id: `file-${Date.now()}`,
        name: file.name,
        type: file.type,
        size: file.size,
        category: 'general',
        description: `Uploaded file: ${file.name}`,
        uploadDate: new Date().toISOString(),
        walletAddress: address,
        txHash: mockTxHash,
        rootHash: mockRootHash,
        isTextRecord: false,
        shared: false,
        tags: []
      };

      addFile(fileMetadata);
      
      toast.success('File uploaded successfully!');
      onUploadComplete?.(fileMetadata.id);
      
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('Upload failed. Please try again.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }, [address, addFile, onUploadComplete]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    maxSize,
    multiple: false
  });

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${isDragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
            ${uploading ? 'pointer-events-none opacity-50' : ''}
          `}
        >
          <input {...getInputProps()} />
          
          {uploading ? (
            <div className="space-y-4">
              <div className="animate-spin mx-auto">
                <Upload className="h-8 w-8 text-blue-500" />
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Uploading to 0G Network...</p>
                <Progress value={uploadProgress} className="w-full max-w-xs mx-auto" />
                <p className="text-xs text-gray-500">{uploadProgress}%</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <Upload className="h-12 w-12 text-gray-400 mx-auto" />
              <div>
                <p className="text-lg font-medium text-gray-900">
                  {isDragActive ? 'Drop your file here' : 'Upload medical file'}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Drag and drop or click to select a file
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  Supported: Images, PDF, Documents (max {Math.round(maxSize / 1024 / 1024)}MB)
                </p>
              </div>
            </div>
          )}
        </div>
        
        {!uploading && (
          <div className="mt-4 text-center">
            <Button variant="outline" onClick={() => document.querySelector('input[type="file"]')?.click()}>
              <File className="h-4 w-4 mr-2" />
              Choose File
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FileUpload;
