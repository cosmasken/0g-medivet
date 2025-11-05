import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Upload, File, DollarSign, CheckCircle, Brain, Zap, Shield } from 'lucide-react';
import { useMedicalFilesStore } from '@/stores/medicalFilesStore';
import { useWallet } from '@/hooks/useWallet';
import { useUpload } from '@/hooks/useUpload';
import { useCreateFileRecordMutation } from '@/hooks/useFileRecords';
import { createBlobFromFile } from '@/lib/0g/blob';
import { useAuthStore } from '@/stores/authStore';
import { BrowserProvider } from 'ethers';
import { createAuditLog } from '@/lib/api';
import { encryptionService, EncryptionMetadata } from '@/lib/encryption';
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
  const createRecordMutation = useCreateFileRecordMutation();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [estimatedFee, setEstimatedFee] = useState<string>('');
  const [category, setCategory] = useState<string>('laboratory');
  const [specialty, setSpecialty] = useState<string>('general');
  const [priority, setPriority] = useState<string>('medium');
  const [tags, setTags] = useState<string[]>([]);
  const [step, setStep] = useState<'select' | 'confirm' | 'estimate' | 'upload'>('select');
  const [encryptionEnabled, setEncryptionEnabled] = useState<boolean>(true);
  const [encryptionMetadata, setEncryptionMetadata] = useState<EncryptionMetadata | null>(null);

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
    if (!selectedFile || !currentUser?.id) return;

    setStep('upload');

    try {
      resetUploadState();

      let fileToUpload = selectedFile;
      let encryptionMeta: EncryptionMetadata | null = null;

      // Encrypt file if encryption is enabled
      if (encryptionEnabled && address) {
        toast.loading('Encrypting file...', { id: 'encryption' });
        try {
          const encryptionResult = await encryptionService.encryptFile(selectedFile, address);
          
          // Create new File object from encrypted data
          fileToUpload = new File(
            [encryptionResult.encryptedData], 
            `encrypted_${selectedFile.name}`,
            { type: 'application/octet-stream' }
          );
          
          encryptionMeta = encryptionResult.metadata;
          setEncryptionMetadata(encryptionMeta);
          
          toast.success('File encrypted successfully', { id: 'encryption' });
        } catch (encryptionError) {
          toast.error('Encryption failed', { id: 'encryption' });
          throw new Error(`Encryption failed: ${encryptionError}`);
        }
      }

      // Create blob from file (encrypted or original)
      const blob = createBlobFromFile(fileToUpload);

      // Calculate the Merkle root separately to ensure we have it available before upload
      const { calculateMerkleRootFromFile } = await import('@/lib/0g/hashUtils');
      let calculatedRootHash = 'unknown';
      try {
        calculatedRootHash = await calculateMerkleRootFromFile(fileToUpload);
        console.log('📋 Calculated root hash before upload:', calculatedRootHash);
      } catch (hashError) {
        console.warn('⚠️ Could not calculate hash directly from file:', hashError);
        // Fallback: try to extract from blob if available
        calculatedRootHash = blob?.root || blob?.merkleRoot || 'unknown';
        console.log('📋 Fallback: Extracted from blob:', calculatedRootHash);
      }

      // Upload to 0G Network (encrypted file if encryption enabled)
      const uploadResult = await uploadFile(blob, 'turbo', fileToUpload.size, fileToUpload);
      console.log('Upload result:', uploadResult);

      // Use the calculated hash as primary source, fall back to upload result, then to default
      let resultTxHash = calculatedRootHash !== 'unknown' ? calculatedRootHash : 
                        (uploadResult?.root || uploadResult?.txHash || uploadResult?.hash || `upload-${Date.now()}`);
      
      const merkleRoot = calculatedRootHash !== 'unknown' ? calculatedRootHash : 
                        (uploadResult?.merkleRoot || uploadResult?.root || `0x${Math.random().toString(16).substr(2, 64)}`);

      // Create medical record using the new API structure
      const recordData = {
        user_id: currentUser.id,
        title: selectedFile.name || 'Untitled',
        description: `${encryptionEnabled ? 'Encrypted file: ' : 'Uploaded file: '}${selectedFile.name}` || 'No description',
        category: category || 'general',
        specialty: specialty || 'general',
        priority_level: priority || 'medium',
        file_type: selectedFile.type || 'application/octet-stream',
        file_size: selectedFile.size || 0,
        zero_g_hash: resultTxHash || 'unknown',
        merkle_root: merkleRoot || 'unknown',
        transaction_hash: resultTxHash || 'unknown',
        tags: tags && Array.isArray(tags) ? tags.filter(tag => tag.trim()) : [],
        upload_status: 'completed',
        encryption_metadata: encryptionMeta ? JSON.stringify(encryptionMeta) : null
      };

      console.log('Creating medical record:', recordData);
      createRecordMutation.mutate(recordData);

      if (uploadResult?.success) {
        // Add file to local store for immediate UI update
        const fileMetadata = {
          id: `file-${Date.now()}`,
          name: selectedFile.name,
          type: selectedFile.type,
          size: selectedFile.size,
          category,
          description: `Medical file: ${selectedFile.name}`,
          uploadDate: new Date().toISOString(),
          walletAddress: address!,
          txHash: resultTxHash,
          rootHash: merkleRoot,
          isTextRecord: false,
          shared: false,
          tags: ['uploaded', 'medical', ...tags]
        };

        addFile(fileMetadata);

        // Log audit trail
        try {
          await createAuditLog({
            wallet_address: address!,
            action: 'upload_file',
            resource_type: 'medical_record',
            resource_id: fileMetadata.id,
            details: {
              file_name: selectedFile.name,
              file_size: selectedFile.size,
              category,
              specialty
            }
          });
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
  }, [selectedFile, currentUser?.id, address, category, specialty, priority, tags, addFile, onUploadComplete, uploadFile, resetUploadState, createRecordMutation]);

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

            {/* Encryption Toggle */}
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center space-x-3">
                <Shield className="h-5 w-5 text-blue-600" />
                <div>
                  <Label htmlFor="encryption-toggle" className="text-sm font-medium text-blue-900">
                    Client-Side Encryption
                  </Label>
                  <p className="text-xs text-blue-700">
                    Encrypt file before uploading to 0G Storage for enhanced privacy
                  </p>
                </div>
              </div>
              <Switch
                id="encryption-toggle"
                checked={encryptionEnabled}
                onCheckedChange={setEncryptionEnabled}
              />
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
              <p className="text-2xl font-bold text-blue-600">{estimatedFee} OG</p>
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
