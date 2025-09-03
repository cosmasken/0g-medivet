import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Upload, File } from 'lucide-react';
import { useMedicalFilesStore } from '@/stores/medicalFilesStore';
import { useWallet } from '@/hooks/useWallet';
import { useUpload } from '@/hooks/useUpload';
import { createBlobFromFile } from '@/lib/0g/blob';
import toast from 'react-hot-toast';

interface FileUploadProps {
  onUploadComplete?: (fileId: string) => void;
  maxSize?: number;
}

const FileUpload = ({ 
  onUploadComplete, 
  maxSize = 10 * 1024 * 1024 // 10MB
}: FileUploadProps) => {
  const { address } = useWallet();
  const { addFile } = useMedicalFilesStore();
  const { loading, error, uploadStatus, txHash, uploadFile, resetUploadState } = useUpload();

  const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!address) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (file.size > maxSize) {
      toast.error(`File too large. Max size: ${Math.round(maxSize / 1024 / 1024)}MB`);
      return;
    }

    try {
      resetUploadState();
      
      // Create blob from file
      const blob = await createBlobFromFile(file);
      
      // Upload to 0G
      const resultTxHash = await uploadFile(blob);
      
      if (resultTxHash) {
        // Add file to store
        const fileMetadata = {
          id: `file-${Date.now()}`,
          name: file.name,
          type: file.type,
          size: file.size,
          category: 'medical',
          description: `Medical file: ${file.name}`,
          uploadDate: new Date().toISOString(),
          walletAddress: address,
          txHash: resultTxHash,
          rootHash: blob.merkleRoot || `0x${Math.random().toString(16).substr(2, 64)}`,
          isTextRecord: false,
          shared: false,
          tags: ['uploaded', 'medical']
        };

        addFile(fileMetadata);
        toast.success('File uploaded to 0G Network successfully!');
        onUploadComplete?.(fileMetadata.id);
      }
      
    } catch (err) {
      console.error('Upload failed:', err);
      toast.error('Upload failed. Please try again.');
    }

    // Reset input
    event.target.value = '';
  }, [address, addFile, onUploadComplete, maxSize, uploadFile, resetUploadState]);

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="text-center">
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-900">Upload to 0G Network</p>
            <p className="text-sm text-gray-500 mt-1">
              Select a medical file to upload securely
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Max size: {Math.round(maxSize / 1024 / 1024)}MB
            </p>
          </div>
          
          {loading && (
            <div className="space-y-2">
              <p className="text-sm text-gray-600 text-center">{uploadStatus}</p>
              <Progress value={loading ? 50 : 0} className="w-full" />
            </div>
          )}
          
          {error && (
            <div className="text-sm text-red-600 text-center">{error}</div>
          )}
          
          {txHash && (
            <div className="text-sm text-green-600 text-center">
              ✓ Uploaded! TX: {txHash.slice(0, 10)}...
            </div>
          )}
          
          <div className="text-center">
            <input
              type="file"
              ref={(input) => input}
              onChange={handleFileSelect}
              accept="image/*,application/pdf,.doc,.docx"
              className="hidden"
              id="file-upload"
              disabled={loading}
            />
            <Button 
              onClick={() => document.getElementById('file-upload')?.click()}
              disabled={loading || !address}
              className="w-full"
            >
              <File className="h-4 w-4 mr-2" />
              {loading ? 'Uploading...' : 'Choose File'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FileUpload;
