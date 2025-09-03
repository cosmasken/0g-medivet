import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Upload, File, CheckCircle } from 'lucide-react';
import { useMedicalFilesStore } from '@/stores/medicalFilesStore';
import { useWallet } from '@/hooks/useWallet';
import { createBlobFromFile } from '@/lib/0g/blob';
import { uploadToStorage } from '@/lib/0g/uploader';
import { BrowserProvider } from 'ethers';
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
      // Get signer from wallet
      if (!window.ethereum) {
        throw new Error('No wallet found');
      }

      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      setUploadProgress(20);

      // Create blob from file
      const blob = await createBlobFromFile(file);
      setUploadProgress(40);

      // Upload to 0G storage
      const storageRpc = 'https://rpc-storage-testnet.0g.ai';
      const l1Rpc = 'https://evmrpc-testnet.0g.ai';
      
      setUploadProgress(60);
      
      const [success, error] = await uploadToStorage(blob, storageRpc, l1Rpc, signer);
      
      if (!success || error) {
        throw error || new Error('Upload failed');
      }

      setUploadProgress(100);

      // Generate mock hashes for demo (in production, get from 0G response)
      const mockTxHash = `0x${Math.random().toString(16).substr(2, 64)}`;
      const mockRootHash = blob.merkleRoot || `0x${Math.random().toString(16).substr(2, 64)}`;

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
        txHash: mockTxHash,
        rootHash: mockRootHash,
        isTextRecord: false,
        shared: false,
        tags: ['uploaded', 'medical']
      };

      addFile(fileMetadata);
      
      toast.success('File uploaded to 0G Network successfully!');
      onUploadComplete?.(fileMetadata.id);
      
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
                  {isDragActive ? 'Drop your file here' : 'Upload to 0G Network'}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Drag and drop or click to select a medical file
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  Supported: Images, PDF, Documents (max {Math.round(maxSize / 1024 / 1024)}MB)
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default FileUpload;
