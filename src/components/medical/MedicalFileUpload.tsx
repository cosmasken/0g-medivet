import React, { useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Upload,
  FileText,
  Image,
  File,
  X,
  CheckCircle,
  AlertCircle,
  Loader2,
  CloudUpload,
  Copy,
  Download,
  ExternalLink
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUpload } from '@/hooks/useUpload';
import { useFees } from '@/hooks/useFees';
import { useWallet } from '@/hooks/useWallet';
import { createBlob, generateMerkleTree, createSubmission } from '@/lib/0g/blob';
import toast from 'react-hot-toast';

// Supported file types
const SUPPORTED_FILE_TYPES = {
  'application/pdf': { icon: FileText, label: 'PDF Document', color: 'text-red-500' },
  'image/jpeg': { icon: Image, label: 'JPEG Image', color: 'text-green-500' },
  'image/jpg': { icon: Image, label: 'JPG Image', color: 'text-green-500' },
  'image/png': { icon: Image, label: 'PNG Image', color: 'text-blue-500' },
  'text/plain': { icon: FileText, label: 'Text Document', color: 'text-gray-500' },
  'application/json': { icon: FileText, label: 'JSON Data', color: 'text-purple-500' },
};

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const MAX_FILES = 5;

interface UploadedFile {
  file: File;
  id: string;
  status: 'pending' | 'uploading' | 'completed' | 'error' | 'calculating-fees';
  progress: number;
  error?: string;
  txHash?: string;
  rootHash?: string;
  description?: string;
  category?: string;
  feeInfo?: {
    storageFee: string;
    totalFee: string;
    rawStorageFee: bigint;
    rawTotalFee: bigint;
  };
}

interface MedicalFileUploadProps {
  onUploadComplete?: (files: UploadedFile[]) => void;
  onError?: (error: string) => void;
  className?: string;
}

const MedicalFileUpload: React.FC<MedicalFileUploadProps> = ({
  onUploadComplete,
  onError,
  className
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [currentUploading, setCurrentUploading] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { address, isConnected } = useWallet();
  const { loading, error, uploadStatus, txHash, uploadFile, resetUploadState } = useUpload();
  const { feeInfo, flowContract, calculateFeesForFile, calculateFeesForSpecificFile, error: feeError, isCalculating } = useFees();

  // Handle drag events
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, []);

  // Validate file
  const validateFile = (file: File): string | null => {
    if (!SUPPORTED_FILE_TYPES[file.type as keyof typeof SUPPORTED_FILE_TYPES]) {
      return `Unsupported file type: ${file.type}`;
    }
    if (file.size > MAX_FILE_SIZE) {
      return `File too large: ${(file.size / 1024 / 1024).toFixed(1)}MB (max ${MAX_FILE_SIZE / 1024 / 1024}MB)`;
    }
    return null;
  };

  // Handle file selection
  const handleFiles = (files: File[]) => {
    if (uploadedFiles.length + files.length > MAX_FILES) {
      toast.error(`Maximum ${MAX_FILES} files allowed`);
      return;
    }

    const newFiles: UploadedFile[] = [];
    for (const file of files) {
      const error = validateFile(file);
      if (error) {
        toast.error(error);
        continue;
      }

      newFiles.push({
        file,
        id: `${file.name}-${Date.now()}-${Math.random()}`,
        status: 'calculating-fees',
        progress: 0,
      });
    }

    setUploadedFiles(prev => [...prev, ...newFiles]);
    toast.success(`${newFiles.length} file(s) added`);
    
    // Calculate fees for each file if user is connected
    if (isConnected) {
      newFiles.forEach(newFile => {
        calculateFeesForNewFile(newFile);
      });
    } else {
      // Set to pending if wallet not connected
      setTimeout(() => {
        setUploadedFiles(prev => prev.map(f => 
          newFiles.find(nf => nf.id === f.id) ? { ...f, status: 'pending' } : f
        ));
      }, 100);
    }
  };

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files));
      e.target.value = ''; // Reset input
    }
  };

  // Calculate fees for a new file
  const calculateFeesForNewFile = async (uploadedFile: UploadedFile) => {
    try {
      // Update status to show calculating
      setUploadedFiles(prev => prev.map(f => 
        f.id === uploadedFile.id ? { ...f, status: 'calculating-fees' } : f
      ));

      // Calculate fees for this specific file using the improved function
      const [fees, error] = await calculateFeesForSpecificFile(uploadedFile.file, isConnected);
      
      if (error || !fees) {
        console.error('Fee calculation failed:', error);
        setUploadedFiles(prev => prev.map(f => 
          f.id === uploadedFile.id ? { 
            ...f, 
            status: 'error', 
            error: error?.message || 'Failed to calculate fees' 
          } : f
        ));
        return;
      }

      // Update with calculated fees
      setUploadedFiles(prev => prev.map(f => {
        if (f.id === uploadedFile.id) {
          return { 
            ...f, 
            status: 'pending',
            feeInfo: {
              storageFee: fees.storageFee,
              totalFee: fees.totalFee,
              rawStorageFee: fees.rawStorageFee,
              rawTotalFee: fees.rawTotalFee
            }
          };
        }
        return f;
      }));
      
    } catch (error) {
      console.error('Fee calculation error:', error);
      setUploadedFiles(prev => prev.map(f => 
        f.id === uploadedFile.id ? { 
          ...f, 
          status: 'error', 
          error: 'Failed to calculate fees' 
        } : f
      ));
    }
  };

  // Update file metadata
  const updateFileMetadata = (fileId: string, field: string, value: string) => {
    setUploadedFiles(prev => prev.map(f => 
      f.id === fileId ? { ...f, [field]: value } : f
    ));
  };

  // Remove file
  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  // Upload single file
  const uploadSingleFile = async (uploadedFile: UploadedFile) => {
    if (!address || !flowContract || !uploadedFile.feeInfo) {
      throw new Error('Wallet not connected or fees not loaded');
    }

    setCurrentUploading(uploadedFile.id);
    
    try {
      // Update status
      setUploadedFiles(prev => prev.map(f => 
        f.id === uploadedFile.id ? { ...f, status: 'uploading', progress: 10 } : f
      ));

      // Create blob
      const blob = createBlob(uploadedFile.file);
      
      // Generate merkle tree
      setUploadedFiles(prev => prev.map(f => 
        f.id === uploadedFile.id ? { ...f, progress: 30 } : f
      ));
      
      const [tree, treeErr] = await generateMerkleTree(blob);
      if (!tree) {
        throw new Error(`Merkle tree generation failed: ${treeErr?.message}`);
      }

      // Create submission
      setUploadedFiles(prev => prev.map(f => 
        f.id === uploadedFile.id ? { ...f, progress: 50 } : f
      ));
      
      const [submission, submissionErr] = await createSubmission(blob);
      if (!submission) {
        throw new Error(`Submission creation failed: ${submissionErr?.message}`);
      }

      // Upload file
      setUploadedFiles(prev => prev.map(f => 
        f.id === uploadedFile.id ? { ...f, progress: 70 } : f
      ));

      const resultTxHash = await uploadFile(blob, submission, flowContract, uploadedFile.feeInfo.rawTotalFee);
      
      if (!resultTxHash) {
        throw new Error('Upload failed');
      }

      // Get root hash from tree
      const rootHash = tree.rootHash();
      
      console.log('Upload completed successfully:', {
        fileName: uploadedFile.file.name,
        txHash: resultTxHash,
        rootHash: rootHash,
        fileSize: uploadedFile.file.size
      });
      
      // Update as completed
      setUploadedFiles(prev => prev.map(f => 
        f.id === uploadedFile.id ? { 
          ...f, 
          status: 'completed', 
          progress: 100,
          txHash: resultTxHash,
          rootHash
        } : f
      ));

      toast.success(`${uploadedFile.file.name} uploaded successfully!`);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      setUploadedFiles(prev => prev.map(f => 
        f.id === uploadedFile.id ? { 
          ...f, 
          status: 'error', 
          error: errorMessage 
        } : f
      ));
      
      toast.error(`Upload failed: ${errorMessage}`);
    } finally {
      setCurrentUploading(null);
      resetUploadState();
    }
  };

  // Upload all pending files
  const uploadAllFiles = async () => {
    const pendingFiles = uploadedFiles.filter(f => f.status === 'pending');
    
    for (const file of pendingFiles) {
      await uploadSingleFile(file);
    }
    
    const completedFiles = uploadedFiles.filter(f => f.status === 'completed');
    if (completedFiles.length > 0 && onUploadComplete) {
      onUploadComplete(completedFiles);
    }
  };

  // Copy text to clipboard
  const copyToClipboard = async (text: string, label: string = 'Text') => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied to clipboard!`);
    } catch (err) {
      toast.error('Failed to copy to clipboard');
    }
  };

  // Retry upload
  const retryUpload = (fileId: string) => {
    const file = uploadedFiles.find(f => f.id === fileId);
    if (file) {
      setUploadedFiles(prev => prev.map(f => 
        f.id === fileId ? { ...f, status: 'pending', error: undefined, progress: 0 } : f
      ));
    }
  };

  const getFileIcon = (type: string) => {
    const fileType = SUPPORTED_FILE_TYPES[type as keyof typeof SUPPORTED_FILE_TYPES];
    return fileType?.icon || File;
  };

  const getFileTypeLabel = (type: string) => {
    const fileType = SUPPORTED_FILE_TYPES[type as keyof typeof SUPPORTED_FILE_TYPES];
    return fileType?.label || 'Unknown File';
  };

  const getFileTypeColor = (type: string) => {
    const fileType = SUPPORTED_FILE_TYPES[type as keyof typeof SUPPORTED_FILE_TYPES];
    return fileType?.color || 'text-gray-500';
  };

  const calculatingCount = uploadedFiles.filter(f => f.status === 'calculating-fees').length;
  const pendingCount = uploadedFiles.filter(f => f.status === 'pending').length;
  const completedCount = uploadedFiles.filter(f => f.status === 'completed').length;
  const errorCount = uploadedFiles.filter(f => f.status === 'error').length;
  
  // Calculate total fees for all pending files
  const totalEstimatedFees = uploadedFiles
    .filter(f => f.status === 'pending' && f.feeInfo)
    .reduce((total, f) => {
      return total + parseFloat(f.feeInfo!.totalFee);
    }, 0);

  return (
    <div className={cn("space-y-6", className)}>
      {/* Upload Area */}
      <Card className="medical-card">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 ai-gradient rounded-lg flex items-center justify-center zero-g-glow">
              <CloudUpload className="h-4 w-4 text-white" />
            </div>
            <div>
              <CardTitle>Upload Medical Files</CardTitle>
              <CardDescription>
                Upload medical documents, images, and records to 0G Storage
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer",
              "hover:border-primary/50 hover:bg-primary/5",
              isDragOver && "border-primary bg-primary/10",
              "border-border"
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">
              Drop files here or click to browse
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Supported: PDF, JPEG, PNG, TXT, JSON • Max: 50MB per file • Max: 5 files
            </p>
            
            <div className="flex flex-wrap justify-center gap-2">
              {Object.entries(SUPPORTED_FILE_TYPES).map(([type, info]) => {
                const Icon = info.icon;
                return (
                  <Badge key={type} variant="outline" className="text-xs">
                    <Icon className={cn("h-3 w-3 mr-1", info.color)} />
                    {info.label}
                  </Badge>
                );
              })}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={Object.keys(SUPPORTED_FILE_TYPES).join(',')}
              onChange={handleFileInputChange}
              className="hidden"
            />
          </div>

          {/* Status */}
          {(isCalculating || !address) && (
            <Alert className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {!address ? 'Please connect your wallet to upload files' : 'Loading upload fees...'}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* File List */}
      {uploadedFiles.length > 0 && (
        <Card className="medical-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <span>Files Ready for Upload</span>
                  <div className="flex space-x-2">
                    {calculatingCount > 0 && <Badge variant="outline" className="bg-blue/10 text-blue-600">{calculatingCount} calculating fees</Badge>}
                    {pendingCount > 0 && <Badge variant="outline">{pendingCount} ready</Badge>}
                    {completedCount > 0 && <Badge variant="outline" className="bg-success/10 text-success">{completedCount} uploaded</Badge>}
                    {errorCount > 0 && <Badge variant="outline" className="bg-destructive/10 text-destructive">{errorCount} failed</Badge>}
                  </div>
                </CardTitle>
                <CardDescription>
                  Add descriptions and categories before uploading
                </CardDescription>
              </div>
              <div className="flex flex-col items-end space-y-2">
                {totalEstimatedFees > 0 && (
                  <div className="text-sm text-muted-foreground">
                    Estimated total cost: <span className="font-semibold">{totalEstimatedFees.toFixed(6)} ETH</span>
                  </div>
                )}
                {pendingCount > 0 && (
                  <Button 
                    onClick={uploadAllFiles}
                    disabled={loading || !address || calculatingCount > 0 || pendingCount === 0 || uploadedFiles.filter(f => f.status === 'pending' && !f.feeInfo).length > 0}
                    className="ai-gradient zero-g-glow"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Upload className="h-4 w-4 mr-2" />
                    )}
                    Upload {pendingCount} File{pendingCount > 1 ? 's' : ''}
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {uploadedFiles.map((uploadedFile) => {
              const Icon = getFileIcon(uploadedFile.file.type);
              const isUploading = currentUploading === uploadedFile.id;
              
              return (
                <div key={uploadedFile.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Icon className={cn("h-5 w-5", getFileTypeColor(uploadedFile.file.type))} />
                      <div>
                        <p className="font-medium">{uploadedFile.file.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {getFileTypeLabel(uploadedFile.file.type)} • {(uploadedFile.file.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {uploadedFile.status === 'completed' && (
                        <CheckCircle className="h-5 w-5 text-success" />
                      )}
                      {uploadedFile.status === 'error' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => retryUpload(uploadedFile.id)}
                        >
                          Retry
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeFile(uploadedFile.id)}
                        disabled={isUploading}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Fee calculation status */}
                  {uploadedFile.status === 'calculating-fees' && (
                    <div className="bg-blue-50 border border-blue-200 rounded p-3">
                      <div className="flex items-center space-x-2 text-blue-600">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm font-medium">Calculating upload fees...</span>
                      </div>
                    </div>
                  )}

                  {/* Fee display */}
                  {uploadedFile.status === 'pending' && uploadedFile.feeInfo && (
                    <div className="bg-primary/5 border border-primary/20 rounded p-3">
                      <h4 className="text-sm font-medium mb-2">0G Storage Fee</h4>
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-muted-foreground text-sm">Storage Cost:</span>
                          <p className="font-semibold text-primary text-lg">{parseFloat(uploadedFile.feeInfo.totalFee).toFixed(6)} ETH</p>
                          <p className="text-xs text-muted-foreground">No gas fees on 0G Network</p>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-muted-foreground">File Size</div>
                          <div className="text-sm font-medium">{(uploadedFile.file.size / 1024).toFixed(1)} KB</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Metadata inputs */}
                  {uploadedFile.status === 'pending' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor={`category-${uploadedFile.id}`} className="text-xs">
                          Category (Optional)
                        </Label>
                        <Input
                          id={`category-${uploadedFile.id}`}
                          placeholder="e.g., Lab Results, X-Ray, Prescription"
                          value={uploadedFile.category || ''}
                          onChange={(e) => updateFileMetadata(uploadedFile.id, 'category', e.target.value)}
                          className="text-sm"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`description-${uploadedFile.id}`} className="text-xs">
                          Description (Optional)
                        </Label>
                        <Input
                          id={`description-${uploadedFile.id}`}
                          placeholder="Brief description of the file"
                          value={uploadedFile.description || ''}
                          onChange={(e) => updateFileMetadata(uploadedFile.id, 'description', e.target.value)}
                          className="text-sm"
                        />
                      </div>
                    </div>
                  )}

                  {/* Upload progress */}
                  {isUploading && (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span>{uploadStatus || 'Uploading...'}</span>
                        <span>{uploadedFile.progress}%</span>
                      </div>
                      <Progress value={uploadedFile.progress} className="h-2" />
                    </div>
                  )}

                  {/* Upload error */}
                  {uploadedFile.status === 'error' && uploadedFile.error && (
                    <Alert className="bg-destructive/10 border-destructive/20">
                      <AlertCircle className="h-4 w-4 text-destructive" />
                      <AlertDescription className="text-destructive">
                        {uploadedFile.error}
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Success info */}
                  {uploadedFile.status === 'completed' && (
                    <div className="bg-success/10 border border-success/20 rounded p-4 space-y-3">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-5 w-5 text-success" />
                        <p className="text-sm text-success font-medium">Upload completed successfully!</p>
                      </div>
                      
                      {/* Transaction Hash */}
                      {uploadedFile.txHash && (
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-foreground">Transaction Hash:</p>
                          <div className="flex items-center space-x-2 bg-background/50 rounded p-2">
                            <code className="text-xs font-mono text-muted-foreground flex-1 break-all">
                              {uploadedFile.txHash}
                            </code>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => copyToClipboard(uploadedFile.txHash!, 'Transaction hash')}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Root Hash - This is the key for downloading! */}
                      {uploadedFile.rootHash && (
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <p className="text-xs font-medium text-foreground">Root Hash (Download Key):</p>
                            <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/30">
                              Required for Download
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-2 bg-primary/5 border border-primary/20 rounded p-3">
                            <code className="text-xs font-mono text-primary flex-1 break-all font-semibold">
                              {uploadedFile.rootHash}
                            </code>
                            <div className="flex space-x-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => copyToClipboard(uploadedFile.rootHash!, 'Root hash')}
                                className="border-primary/30 text-primary hover:bg-primary/10"
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            💡 Save this root hash - you'll need it to download your file from 0G Storage
                          </p>
                        </div>
                      )}

                      {/* File Info Summary */}
                      <div className="grid grid-cols-2 gap-4 pt-2 border-t border-success/20">
                        <div>
                          <p className="text-xs text-muted-foreground">File Size:</p>
                          <p className="text-xs font-medium">{(uploadedFile.file.size / 1024).toFixed(1)} KB</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Upload Date:</p>
                          <p className="text-xs font-medium">{new Date().toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MedicalFileUpload;
