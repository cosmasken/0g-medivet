import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Eye, CheckCircle, AlertCircle, FileText, Image, FileIcon } from 'lucide-react';
import { useDownload } from '@/hooks/useDownload';
import { NetworkType } from '@/lib/0g/network';
import toast from 'react-hot-toast';

interface FileDownloadProps {
    rootHash?: string;
    fileName?: string;
    mimeType?: string;
    className?: string;
    variant?: 'card' | 'inline' | 'button';
    showPreview?: boolean;
}

const FileDownload = ({
    rootHash: initialRootHash = '',
    fileName: initialFileName = '',
    mimeType: initialMimeType = 'application/octet-stream',
    className = '',
    variant = 'card',
    showPreview = true
}: FileDownloadProps) => {
    const { downloadState, downloadFile, previewFile, verifyFile, resetDownloadState, cleanupDownloadUrl } = useDownload();

    const [rootHash, setRootHash] = useState(initialRootHash);
    const [fileName, setFileName] = useState(initialFileName);
    const [mimeType, setMimeType] = useState(initialMimeType);
    const [networkType, setNetworkType] = useState<NetworkType>('standard');
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [fileExists, setFileExists] = useState<boolean | null>(null);

    const handleDownload = async () => {
        if (!rootHash.trim()) {
            toast.error('Please enter a root hash');
            return;
        }

        // Validate root hash format
        if (rootHash === 'unknown' || rootHash === 'undefined' || rootHash.length < 10) {
            toast.error('Invalid root hash format. Please check the hash and try again.');
            return;
        }

        // Show loading toast
        const loadingToast = toast.loading('Downloading file from 0G Storage...');

        try {
            const success = await downloadFile(
                rootHash.trim(),
                fileName.trim() || 'downloaded-file',
                mimeType,
                networkType
            );

            toast.dismiss(loadingToast);

            if (success) {
                resetDownloadState();
                toast.success(`File "${fileName || 'downloaded-file'}" downloaded successfully!`);
            }
        } catch (error) {
            toast.dismiss(loadingToast);
            console.error('Download error:', error);
        }
    };

    const handlePreview = async () => {
        if (!rootHash.trim()) {
            toast.error('Please enter a root hash');
            return;
        }

        // Validate root hash format
        if (rootHash === 'unknown' || rootHash === 'undefined' || rootHash.length < 10) {
            toast.error('Invalid root hash format. Cannot preview file.');
            return;
        }

        // Show loading toast
        const loadingToast = toast.loading('Loading file preview...');

        try {
            cleanupDownloadUrl();
            const url = await previewFile(rootHash.trim(), mimeType, networkType);

            toast.dismiss(loadingToast);

            if (url) {
                setPreviewUrl(url);
                toast.success('File preview loaded successfully!');
            } else {
                toast.error('Failed to load file preview. The file may not exist or be corrupted.');
            }
        } catch (error) {
            toast.dismiss(loadingToast);
            console.error('Preview error:', error);
        }
    };

    const handleVerify = async () => {
        if (!rootHash.trim()) {
            toast.error('Please enter a root hash');
            return;
        }

        // Validate root hash format
        if (rootHash === 'unknown' || rootHash === 'undefined' || rootHash.length < 10) {
            toast.error('Invalid root hash format. Please check the hash.');
            setFileExists(false);
            return;
        }

        // Show loading toast
        const loadingToast = toast.loading('Verifying file existence...');

        try {
            const exists = await verifyFile(rootHash.trim(), networkType);
            setFileExists(exists);

            toast.dismiss(loadingToast);

            if (exists) {
                toast.success('✅ File found in 0G Storage!');
            } else {
                toast.error('❌ File not found in 0G Storage. Please check the root hash.');
            }
        } catch (error) {
            toast.dismiss(loadingToast);
            setFileExists(false);
            toast.error('Failed to verify file. Please try again.');
            console.error('Verification error:', error);
        }
    };

    const getFileIcon = () => {
        if (mimeType.startsWith('image/')) {
            return <Image className="h-4 w-4" />;
        } else if (mimeType === 'application/pdf') {
            return <FileText className="h-4 w-4" />;
        } else {
            return <FileIcon className="h-4 w-4" />;
        }
    };

    const isPreviewable = mimeType.startsWith('image/') ||
        mimeType === 'application/pdf' ||
        mimeType.startsWith('text/');

    if (variant === 'button' && initialRootHash) {
        return (
            <div className={`flex gap-2 ${className}`}>
                <Button
                    onClick={handleDownload}
                    disabled={downloadState.loading || !initialRootHash}
                    size="sm"
                    variant="outline"
                >
                    {downloadState.loading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent" />
                    ) : (
                        <Download className="h-4 w-4" />
                    )}
                    {downloadState.loading ? 'Downloading...' : 'Download'}
                </Button>

                {showPreview && isPreviewable && (
                    <Button
                        onClick={handlePreview}
                        disabled={downloadState.loading || !initialRootHash}
                        size="sm"
                        variant="ghost"
                    >
                        <Eye className="h-4 w-4" />
                    </Button>
                )}
            </div>
        );
    }

    if (variant === 'inline' && initialRootHash) {
        return (
            <div className={`flex items-center gap-2 ${className}`}>
                <div className="flex items-center gap-2 flex-1">
                    {getFileIcon()}
                    <span className="text-sm font-medium truncate">
                        {fileName || 'Medical File'}
                    </span>
                    {fileExists !== null && (
                        <Badge variant={fileExists ? 'default' : 'destructive'} className="text-xs">
                            {fileExists ? 'Available' : 'Not Found'}
                        </Badge>
                    )}
                </div>

                <div className="flex gap-1">
                    <Button
                        onClick={handleDownload}
                        disabled={downloadState.loading}
                        size="sm"
                        variant="outline"
                    >
                        {downloadState.loading ? (
                            <div className="animate-spin rounded-full h-3 w-3 border-2 border-blue-500 border-t-transparent" />
                        ) : (
                            <Download className="h-3 w-3" />
                        )}
                    </Button>

                    {showPreview && isPreviewable && (
                        <Button
                            onClick={handlePreview}
                            disabled={downloadState.loading}
                            size="sm"
                            variant="ghost"
                        >
                            <Eye className="h-3 w-3" />
                        </Button>
                    )}
                </div>
            </div>
        );
    }

    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Download className="h-5 w-5" />
                    Download from 0G Storage
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">

                {/* Network Selection */}
                <div className="space-y-2">
                    <Label htmlFor="network">Network</Label>
                    <Select value={networkType} onValueChange={(value: NetworkType) => setNetworkType(value)}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="standard">Standard Network</SelectItem>
                            <SelectItem value="turbo">Turbo Network</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Root Hash Input */}
                <div className="space-y-2">
                    <Label htmlFor="rootHash">Root Hash</Label>
                    <Input
                        id="rootHash"
                        placeholder="0x... or root hash"
                        value={rootHash}
                        onChange={(e) => setRootHash(e.target.value)}
                        className="font-mono text-sm"
                    />
                </div>

                {/* File Name Input */}
                <div className="space-y-2">
                    <Label htmlFor="fileName">File Name (Optional)</Label>
                    <Input
                        id="fileName"
                        placeholder="downloaded-file.pdf"
                        value={fileName}
                        onChange={(e) => setFileName(e.target.value)}
                    />
                </div>

                {/* MIME Type Input */}
                <div className="space-y-2">
                    <Label htmlFor="mimeType">File Type</Label>
                    <Select value={mimeType} onValueChange={setMimeType}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="application/pdf">PDF Document</SelectItem>
                            <SelectItem value="image/jpeg">JPEG Image</SelectItem>
                            <SelectItem value="image/png">PNG Image</SelectItem>
                            <SelectItem value="text/plain">Text File</SelectItem>
                            <SelectItem value="application/json">JSON File</SelectItem>
                            <SelectItem value="application/octet-stream">Binary File</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* File Status */}
                {fileExists !== null && (
                    <div className={`flex items-center gap-2 p-3 rounded-lg ${fileExists ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                        }`}>
                        {fileExists ? (
                            <CheckCircle className="h-4 w-4" />
                        ) : (
                            <AlertCircle className="h-4 w-4" />
                        )}
                        <span className="text-sm font-medium">
                            {fileExists ? 'File found in storage' : 'File not found in storage'}
                        </span>
                    </div>
                )}

                {/* Progress Bar */}
                {downloadState.loading && (
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span>Downloading...</span>
                            <span>{downloadState.progress}%</span>
                        </div>
                        <Progress value={downloadState.progress} className="w-full" />
                    </div>
                )}

                {/* Error Display */}
                {downloadState.error && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg">
                        <AlertCircle className="h-4 w-4" />
                        <span className="text-sm">{downloadState.error}</span>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2">
                    <Button
                        onClick={handleVerify}
                        disabled={downloadState.loading || !rootHash.trim()}
                        variant="outline"
                        className="flex-1"
                    >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Verify
                    </Button>

                    {showPreview && isPreviewable && (
                        <Button
                            onClick={handlePreview}
                            disabled={downloadState.loading || !rootHash.trim()}
                            variant="outline"
                            className="flex-1"
                        >
                            <Eye className="h-4 w-4 mr-2" />
                            Preview
                        </Button>
                    )}

                    <Button
                        onClick={handleDownload}
                        disabled={downloadState.loading || !rootHash.trim()}
                        className="flex-1"
                    >
                        <Download className="h-4 w-4 mr-2" />
                        {downloadState.loading ? 'Downloading...' : 'Download'}
                    </Button>
                </div>

                {/* Preview Display */}
                {previewUrl && (
                    <div className="space-y-2">
                        <Label>Preview</Label>
                        <div className="border rounded-lg p-4 bg-gray-50">
                            {mimeType.startsWith('image/') ? (
                                <img
                                    src={previewUrl}
                                    alt="Preview"
                                    className="max-w-full max-h-64 object-contain mx-auto"
                                />
                            ) : mimeType === 'application/pdf' ? (
                                <iframe
                                    src={previewUrl}
                                    className="w-full h-64 border-0"
                                    title="PDF Preview"
                                />
                            ) : (
                                <div className="text-center text-gray-500">
                                    <FileText className="h-12 w-12 mx-auto mb-2" />
                                    <p>Preview available - click download to view</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

            </CardContent>
        </Card>
    );
};

export default FileDownload;