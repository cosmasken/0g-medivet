import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Upload, File, DollarSign, CheckCircle } from 'lucide-react';
import { useMedicalFilesStore } from '@/stores/medicalFilesStore';
import { useWallet } from '@/hooks/useWallet';
import { useUpload } from '@/hooks/useUpload';
import { useCreateRecordMutation } from '@/hooks/useRecordsQuery';
import { createBlobFromFile } from '@/lib/0g/blob';
import { createMedicalRecord } from '@/lib/api';
import { useAuthStore } from '@/stores/authStore';
import { BrowserProvider } from 'ethers';
import { auditService } from '@/services/auditService';
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
  const { currentUser } = useAuthStore();
  const { addFile } = useMedicalFilesStore();
  const { loading, error, uploadStatus, txHash, uploadFile, resetUploadState } = useUpload();
  const createRecordMutation = useCreateRecordMutation();
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [estimatedFee, setEstimatedFee] = useState<string>('');
  const [category, setCategory] = useState<string>('Other');
  const [tags, setTags] = useState<string[]>([]);
  const [step, setStep] = useState<'select' | 'confirm' | 'estimate' | 'upload'>('select');

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
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

    setSelectedFile(file);
    setStep('confirm');
    event.target.value = '';
  }, [address, maxSize]);

  const handleConfirmFile = useCallback(async () => {
    if (!selectedFile) return;
    
    setStep('estimate');
    setEstimatedFee('Calculating...');
    
    try {
      // Create blob for fee calculation
      const blob = createBlobFromFile(selectedFile);
      
      // Create submission object using file size instead of blob.data.length
      const submission = {
        length: selectedFile.size,
        tags: '0x',
        nodes: [{
          root: '0x0000000000000000000000000000000000000000000000000000000000000000',
          height: 1
        }]
      };
      
      // Calculate actual fees using turbo network
      const { calculateFees } = await import('@/lib/0g/fees');
      const [feeInfo, error] = await calculateFees(submission, 'turbo');
      
      if (error || !feeInfo) {
        throw error || new Error('Failed to calculate fees');
      }
      
      setEstimatedFee(feeInfo.totalFee);
      
    } catch (error) {
      console.error('Fee calculation failed:', error);
      throw new Error('Unable to calculate fees. Please try again.');
    }
  }, [selectedFile]);

  const handleConfirmUpload = useCallback(async () => {
    if (!selectedFile) return;
    
    setStep('upload');
    
    try {
      resetUploadState();
      
      // Create blob from file
      const blob = createBlobFromFile(selectedFile);
      
      // Upload to 0G
      const resultTxHash = await uploadFile(blob, 'turbo', selectedFile.size, selectedFile);
      
      // Save to backend database
      if (currentUser?.id && resultTxHash) {
        createRecordMutation.mutate({
          user_id: currentUser.id,
          title: selectedFile.name,
          description: `Uploaded file: ${selectedFile.name}`,
          category: category || 'Other',
          file_type: selectedFile.type,
          file_size: selectedFile.size,
          zero_g_hash: resultTxHash,
          tags: tags.filter(tag => tag.trim())
        });
      }
      
      if (resultTxHash) {
        // Add file to store
        const fileMetadata = {
          id: `file-${Date.now()}`,
          name: selectedFile.name,
          type: selectedFile.type,
          size: selectedFile.size,
          category: 'medical',
          description: `Medical file: ${selectedFile.name}`,
          uploadDate: new Date().toISOString(),
          walletAddress: address!,
          txHash: resultTxHash,
          rootHash: blob.merkleRoot || `0x${Math.random().toString(16).substr(2, 64)}`,
          isTextRecord: false,
          shared: false,
          tags: ['uploaded', 'medical']
        };

        addFile(fileMetadata);
        
        // Log audit trail
        try {
          await auditService.logFileUpload(address!, fileMetadata.id, selectedFile.name);
        } catch (error) {
          console.error('Failed to log audit trail:', error);
        }
        
        toast.success('File uploaded to 0G Network successfully!');
        onUploadComplete?.(fileMetadata.id);
        
        // Reset state
        setSelectedFile(null);
        setEstimatedFee('');
        setStep('select');
      }
      
    } catch (err) {
      console.error('Upload failed:', err);
      toast.error('Upload failed. Please try again.');
      setStep('estimate');
    }
  }, [selectedFile, address, addFile, onUploadComplete, uploadFile, resetUploadState]);

  const handleCancel = useCallback(() => {
    setSelectedFile(null);
    setEstimatedFee('');
    setStep('select');
    resetUploadState();
  }, [resetUploadState]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload to 0G Network
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {step === 'select' && (
          <div className="space-y-4">
            <div className="text-center">
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-900">Select Medical File</p>
              <p className="text-sm text-gray-500 mt-1">
                Choose a medical file to upload securely
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Max size: {Math.round(maxSize / 1024 / 1024)}MB
              </p>
            </div>
            
            <div className="text-center">
              <input
                type="file"
                onChange={handleFileSelect}
                accept="image/*,application/pdf,.doc,.docx"
                className="hidden"
                id="file-upload"
                disabled={!address}
              />
              <Button 
                onClick={() => document.getElementById('file-upload')?.click()}
                disabled={!address}
                className="w-full"
              >
                <File className="h-4 w-4 mr-2" />
                Choose File
              </Button>
            </div>
          </div>
        )}

        {step === 'confirm' && selectedFile && (
          <div className="space-y-4">
            <div className="text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-900">Confirm File Selection</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="font-medium">{selectedFile.name}</p>
              <p className="text-sm text-gray-600">
                Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
              <p className="text-sm text-gray-600">
                Type: {selectedFile.type}
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCancel} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleConfirmFile} className="flex-1">
                Continue
              </Button>
            </div>
          </div>
        )}

        {step === 'estimate' && (
          <div className="space-y-4">
            <div className="text-center">
              <DollarSign className="h-12 w-12 text-blue-500 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-900">Estimated Upload Fee</p>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <p className="text-2xl font-bold text-blue-600">{estimatedFee} ETH</p>
              <p className="text-sm text-gray-600 mt-1">
                Fee for storing on 0G Network
              </p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="font-medium mb-2">File Details:</p>
              <p className="text-sm text-gray-600">{selectedFile?.name}</p>
              <p className="text-sm text-gray-600">
                Size: {selectedFile ? (selectedFile.size / 1024 / 1024).toFixed(2) : 0} MB
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCancel} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleConfirmUpload} className="flex-1">
                Confirm Upload
              </Button>
            </div>
          </div>
        )}

        {step === 'upload' && (
          <div className="space-y-4">
            <div className="text-center">
              <div className="animate-spin mx-auto mb-4 w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full"></div>
              <p className="text-lg font-medium text-gray-900">Uploading to 0G Network</p>
              <p className="text-sm text-gray-600">{uploadStatus}</p>
            </div>
            
            {loading && (
              <Progress value={50} className="w-full" />
            )}
            
            {error && (
              <div className="text-sm text-red-600 text-center">{error}</div>
            )}
            
            {txHash && (
              <div className="text-sm text-green-600 text-center">
                ✓ Uploaded! TX: {txHash.slice(0, 10)}...
              </div>
            )}
          </div>
        )}
        
      </CardContent>
    </Card>
  );
};

export default FileUpload;
