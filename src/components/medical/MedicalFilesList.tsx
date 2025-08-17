import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  FileText,
  Image,
  File,
  Download,
  Share2,
  Trash2,
  Search,
  Filter,
  Calendar,
  User,
  Database,
  Eye,
  AlertCircle,
  Loader2,
  CheckCircle,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMedicalFilesStore, MedicalFileMetadata } from '@/stores/medicalFilesStore';
import { useWallet } from '@/hooks/useWallet';
import { useDownload } from '@/hooks/useDownload';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

interface MedicalFilesListProps {
  walletAddress?: string; // If not provided, will use current wallet
  showActions?: boolean; // Whether to show download/share/delete actions
  showSharedFiles?: boolean; // Whether to show files shared with this wallet
  className?: string;
}

const MedicalFilesList: React.FC<MedicalFilesListProps> = ({
  walletAddress,
  showActions = true,
  showSharedFiles = false,
  className
}) => {
  const { address } = useWallet();
  const currentWallet = walletAddress || address;
  
  const {
    getFilesByWallet,
    getFilesSharedWith,
    searchFiles,
    getFilesByCategory,
    getFilesByType,
    removeFile,
    shareFile,
    unshareFile
  } = useMedicalFilesStore();
  
  const { downloadFile, loading: downloadLoading, error: downloadError } = useDownload();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('date-desc');
  const [shareDialogOpen, setShareDialogOpen] = useState<string | null>(null);
  const [shareAddress, setShareAddress] = useState('');
  const [viewingFile, setViewingFile] = useState<MedicalFileMetadata | null>(null);

  // Get files based on props
  const allFiles = useMemo(() => {
    if (!currentWallet) return [];
    
    if (showSharedFiles) {
      return getFilesSharedWith(currentWallet);
    } else {
      return getFilesByWallet(currentWallet);
    }
  }, [currentWallet, showSharedFiles, getFilesByWallet, getFilesSharedWith]);

  // Apply filters and search
  const filteredFiles = useMemo(() => {
    let files = allFiles;

    // Apply search
    if (searchQuery.trim()) {
      files = searchFiles(searchQuery, currentWallet);
    }

    // Apply category filter
    if (filterCategory !== 'all') {
      files = files.filter(file => file.category?.toLowerCase() === filterCategory.toLowerCase());
    }

    // Apply type filter
    if (filterType === 'documents') {
      files = files.filter(file => !file.isTextRecord);
    } else if (filterType === 'records') {
      files = files.filter(file => file.isTextRecord);
    }

    // Apply sorting
    files.sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime();
        case 'date-asc':
          return new Date(a.uploadDate).getTime() - new Date(b.uploadDate).getTime();
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'size-desc':
          return b.size - a.size;
        case 'size-asc':
          return a.size - b.size;
        default:
          return 0;
      }
    });

    return files;
  }, [allFiles, searchQuery, filterCategory, filterType, sortBy, currentWallet, searchFiles]);

  // Get unique categories for filter dropdown
  const categories = useMemo(() => {
    const cats = new Set(allFiles.map(f => f.category).filter(Boolean));
    return Array.from(cats) as string[];
  }, [allFiles]);

  // File type icons
  const getFileIcon = (file: MedicalFileMetadata) => {
    if (file.isTextRecord) return FileText;
    if (file.type.startsWith('image/')) return Image;
    return File;
  };

  // File type color
  const getFileTypeColor = (file: MedicalFileMetadata) => {
    if (file.isTextRecord) return 'text-purple-500';
    if (file.type.startsWith('image/')) return 'text-green-500';
    if (file.type === 'application/pdf') return 'text-red-500';
    return 'text-gray-500';
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Handle file download
  const handleDownload = async (file: MedicalFileMetadata) => {
    try {
      await downloadFile(file.rootHash, file.name);
      toast.success(`${file.name} downloaded successfully`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      toast.error(`Download failed: ${errorMessage}`);
    }
  };

  // Handle file sharing
  const handleShare = (fileId: string) => {
    if (!shareAddress.trim()) {
      toast.error('Please enter a provider address');
      return;
    }

    shareFile(fileId, shareAddress);
    toast.success('File shared successfully');
    setShareDialogOpen(null);
    setShareAddress('');
  };

  // Handle file deletion
  const handleDelete = (fileId: string, fileName: string) => {
    if (confirm(`Are you sure you want to remove "${fileName}" from your file list?`)) {
      removeFile(fileId);
      toast.success('File removed from your list');
    }
  };

  if (!currentWallet) {
    return (
      <Card className="medical-card">
        <CardContent className="text-center py-8">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Please connect your wallet to view files</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header and Controls */}
      <Card className="medical-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 ai-gradient rounded-lg flex items-center justify-center zero-g-glow">
                <Database className="h-4 w-4 text-white" />
              </div>
              <div>
                <CardTitle>
                  {showSharedFiles ? 'Files Shared With You' : 'Your Medical Files'}
                </CardTitle>
                <CardDescription>
                  {filteredFiles.length} of {allFiles.length} files
                  {showSharedFiles && ' shared by patients'}
                </CardDescription>
              </div>
            </div>
            <Badge variant="outline" className="ai-gradient text-white border-none">
              {allFiles.length} total files
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search files by name, description, or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="documents">Documents</SelectItem>
                  <SelectItem value="records">Text Records</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Sort" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date-desc">Newest First</SelectItem>
                  <SelectItem value="date-asc">Oldest First</SelectItem>
                  <SelectItem value="name-asc">Name A-Z</SelectItem>
                  <SelectItem value="name-desc">Name Z-A</SelectItem>
                  <SelectItem value="size-desc">Largest First</SelectItem>
                  <SelectItem value="size-asc">Smallest First</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Files List */}
      <div className="space-y-4">
        {filteredFiles.length === 0 ? (
          <Card className="medical-card">
            <CardContent className="text-center py-12">
              <Database className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No Files Found</h3>
              <p className="text-muted-foreground">
                {searchQuery ? 
                  `No files match your search for "${searchQuery}"` : 
                  showSharedFiles ? 
                    'No files have been shared with you yet' :
                    'Upload your first medical file to get started'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredFiles.map((file) => {
            const Icon = getFileIcon(file);
            const isDownloading = downloadLoading;
            
            return (
              <Card key={file.id} className="medical-card hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <Icon className={cn("h-6 w-6 mt-1", getFileTypeColor(file))} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium truncate">{file.name}</h4>
                          {file.isTextRecord && (
                            <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700">
                              {file.recordType}
                            </Badge>
                          )}
                          {file.shared && (
                            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                              <Share2 className="h-3 w-3 mr-1" />
                              Shared
                            </Badge>
                          )}
                        </div>
                        
                        <div className="text-sm text-muted-foreground space-y-1">
                          <div className="flex items-center space-x-4">
                            <span className="flex items-center">
                              <Calendar className="h-3 w-3 mr-1" />
                              {format(new Date(file.uploadDate), 'MMM d, yyyy')}
                            </span>
                            <span>{formatFileSize(file.size)}</span>
                            {file.category && (
                              <Badge variant="secondary" className="text-xs">
                                {file.category}
                              </Badge>
                            )}
                          </div>
                          
                          {file.description && (
                            <p className="text-xs line-clamp-1">{file.description}</p>
                          )}
                          
                          <div className="flex items-center text-xs space-x-2">
                            <span className="font-mono">
                              Storage: {file.rootHash.slice(0, 8)}...{file.rootHash.slice(-6)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {showActions && (
                      <div className="flex items-center space-x-2 ml-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setViewingFile(file)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownload(file)}
                          disabled={isDownloading}
                        >
                          {isDownloading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Download className="h-4 w-4" />
                          )}
                        </Button>
                        
                        {!showSharedFiles && (
                          <>
                            <Dialog
                              open={shareDialogOpen === file.id}
                              onOpenChange={(open) => setShareDialogOpen(open ? file.id : null)}
                            >
                              <DialogTrigger asChild>
                                <Button size="sm" variant="outline">
                                  <Share2 className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Share File</DialogTitle>
                                  <DialogDescription>
                                    Share "{file.name}" with a healthcare provider
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 pt-4">
                                  <Input
                                    placeholder="Enter provider wallet address"
                                    value={shareAddress}
                                    onChange={(e) => setShareAddress(e.target.value)}
                                  />
                                  <div className="flex justify-end space-x-2">
                                    <Button
                                      variant="outline"
                                      onClick={() => setShareDialogOpen(null)}
                                    >
                                      Cancel
                                    </Button>
                                    <Button
                                      onClick={() => handleShare(file.id)}
                                      className="ai-gradient zero-g-glow"
                                    >
                                      Share File
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                            
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(file.id, file.name)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* File Details Dialog */}
      {viewingFile && (
        <Dialog open={!!viewingFile} onOpenChange={(open) => !open && setViewingFile(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <div className={cn("p-2 rounded-lg ai-gradient")}>
                  {React.createElement(getFileIcon(viewingFile), { 
                    className: "h-5 w-5 text-white" 
                  })}
                </div>
                <span>{viewingFile.name}</span>
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="font-medium text-muted-foreground">Type</label>
                  <p>{viewingFile.isTextRecord ? 'Text Record' : 'Document'}</p>
                </div>
                <div>
                  <label className="font-medium text-muted-foreground">Size</label>
                  <p>{formatFileSize(viewingFile.size)}</p>
                </div>
                <div>
                  <label className="font-medium text-muted-foreground">Upload Date</label>
                  <p>{format(new Date(viewingFile.uploadDate), 'PPP')}</p>
                </div>
                <div>
                  <label className="font-medium text-muted-foreground">Category</label>
                  <p>{viewingFile.category || 'Uncategorized'}</p>
                </div>
              </div>
              
              {viewingFile.description && (
                <div>
                  <label className="font-medium text-muted-foreground">Description</label>
                  <p className="text-sm mt-1">{viewingFile.description}</p>
                </div>
              )}
              
              <div>
                <label className="font-medium text-muted-foreground">Storage Details</label>
                <div className="text-xs font-mono space-y-1 mt-1">
                  <p>Root Hash: {viewingFile.rootHash}</p>
                  <p>Transaction: {viewingFile.txHash}</p>
                </div>
              </div>
              
              {viewingFile.shared && viewingFile.sharedWith && (
                <div>
                  <label className="font-medium text-muted-foreground">Shared With</label>
                  <div className="space-y-1 mt-1">
                    {viewingFile.sharedWith.map(address => (
                      <div key={address} className="flex items-center justify-between text-xs">
                        <span className="font-mono">{address}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            unshareFile(viewingFile.id, address);
                            toast.success('File unshared');
                          }}
                          className="h-6 px-2"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Error Display */}
      {downloadError && (
        <Alert className="bg-destructive/10 border-destructive/20">
          <AlertCircle className="h-4 w-4 text-destructive" />
          <AlertDescription className="text-destructive">
            {downloadError}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default MedicalFilesList;
