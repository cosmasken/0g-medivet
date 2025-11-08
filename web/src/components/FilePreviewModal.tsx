/**
 * File Preview Modal Component
 * Supports image and PDF preview with thumbnail generation and caching
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
    Download,
    X,
    ZoomIn,
    ZoomOut,
    RotateCw,
    Maximize2,
    FileText,
    Image as ImageIcon,
    AlertCircle,
    Loader2
} from 'lucide-react';
import { useEnhancedDownload } from '@/hooks/useEnhancedDownload';
import { FileRecord } from '@/services/downloadManager';
import { cn } from '@/lib/utils';

interface FilePreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    fileRecord: FileRecord;
    walletAddress: string;
}

interface PreviewState {
    loading: boolean;
    error: string | null;
    previewUrl: string | null;
    previewType: 'image' | 'pdf' | 'text' | 'unsupported';
    zoom: number;
    rotation: number;
}

const SUPPORTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
const SUPPORTED_PDF_TYPES = ['application/pdf'];
const SUPPORTED_TEXT_TYPES = ['text/plain', 'text/csv', 'application/json', 'text/html'];

export default function FilePreviewModal({
    isOpen,
    onClose,
    fileRecord,
    walletAddress
}: FilePreviewModalProps) {
    const { downloadAsBlob, downloadAndDecryptFile, downloadState } = useEnhancedDownload();

    const [previewState, setPreviewState] = useState<PreviewState>({
        loading: false,
        error: null,
        previewUrl: null,
        previewType: 'unsupported',
        zoom: 100,
        rotation: 0
    });

    const getPreviewType = useCallback((mimeType: string): PreviewState['previewType'] => {
        if (SUPPORTED_IMAGE_TYPES.includes(mimeType)) return 'image';
        if (SUPPORTED_PDF_TYPES.includes(mimeType)) return 'pdf';
        if (SUPPORTED_TEXT_TYPES.includes(mimeType)) return 'text';
        return 'unsupported';
    }, []);

    const loadPreview = useCallback(async () => {
        if (!fileRecord || !walletAddress) return;

        const previewType = getPreviewType(fileRecord.mimeType);

        setPreviewState(prev => ({
            ...prev,
            loading: true,
            error: null,
            previewType,
            zoom: 100,
            rotation: 0
        }));

        try {
            if (previewType === 'unsupported') {
                setPreviewState(prev => ({
                    ...prev,
                    loading: false,
                    error: 'File type not supported for preview'
                }));
                return;
            }

            // For encrypted files, we need to download and decrypt first
            if (fileRecord.isEncrypted) {
                const success = await downloadAndDecryptFile(fileRecord, walletAddress, {
                    showToast: false,
                    autoCleanup: false
                });

                if (!success) {
                    throw new Error('Failed to decrypt file for preview');
                }

                // The downloadAndDecryptFile doesn't return the blob URL directly
                // We need to use downloadAsBlob for preview
                const blobUrl = await downloadAsBlob(
                    fileRecord.rootHash,
                    fileRecord.fileName,
                    fileRecord.mimeType,
                    { showToast: false }
                );

                if (!blobUrl) {
                    throw new Error('Failed to create preview URL');
                }

                setPreviewState(prev => ({
                    ...prev,
                    loading: false,
                    previewUrl: blobUrl
                }));
            } else {
                // For unencrypted files, create blob URL directly
                const blobUrl = await downloadAsBlob(
                    fileRecord.rootHash,
                    fileRecord.fileName,
                    fileRecord.mimeType,
                    { showToast: false }
                );

                if (!blobUrl) {
                    throw new Error('Failed to create preview URL');
                }

                setPreviewState(prev => ({
                    ...prev,
                    loading: false,
                    previewUrl: blobUrl
                }));
            }

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to load preview';
            setPreviewState(prev => ({
                ...prev,
                loading: false,
                error: errorMessage
            }));
        }
    }, [fileRecord, walletAddress, downloadAndDecryptFile, downloadAsBlob]);

    const handleDownload = useCallback(async () => {
        if (!fileRecord || !walletAddress) return;

        await downloadAndDecryptFile(fileRecord, walletAddress, {
            showToast: true,
            autoCleanup: true
        });
    }, [fileRecord, walletAddress, downloadAndDecryptFile]);

    const handleZoomIn = useCallback(() => {
        setPreviewState(prev => ({
            ...prev,
            zoom: Math.min(prev.zoom + 25, 300)
        }));
    }, []);

    const handleZoomOut = useCallback(() => {
        setPreviewState(prev => ({
            ...prev,
            zoom: Math.max(prev.zoom - 25, 25)
        }));
    }, []);

    const handleRotate = useCallback(() => {
        setPreviewState(prev => ({
            ...prev,
            rotation: (prev.rotation + 90) % 360
        }));
    }, []);

    const handleFullscreen = useCallback(() => {
        if (previewState.previewUrl) {
            window.open(previewState.previewUrl, '_blank');
        }
    }, [previewState.previewUrl]);

    // Load preview when modal opens
    useEffect(() => {
        if (isOpen && fileRecord) {
            loadPreview();
        }
    }, [isOpen, fileRecord, loadPreview]);

    // Cleanup preview URL when modal closes
    useEffect(() => {
        return () => {
            if (previewState.previewUrl) {
                URL.revokeObjectURL(previewState.previewUrl);
            }
        };
    }, [previewState.previewUrl]);

    const renderPreviewContent = () => {
        if (previewState.loading) {
            return (
                <div className="flex flex-col items-center justify-center h-96 space-y-4">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                    <p className="text-sm text-gray-600">Loading preview...</p>
                    {downloadState.progress && (
                        <div className="w-64 space-y-2">
                            <Progress value={downloadState.progress.progress} className="h-2" />
                            <p className="text-xs text-gray-500 text-center">
                                {downloadState.progress.message}
                            </p>
                        </div>
                    )}
                </div>
            );
        }

        if (previewState.error) {
            return (
                <div className="flex flex-col items-center justify-center h-96 space-y-4">
                    <AlertCircle className="h-12 w-12 text-red-500" />
                    <div className="text-center space-y-2">
                        <p className="font-medium text-gray-900">Preview not available</p>
                        <p className="text-sm text-gray-600">{previewState.error}</p>
                    </div>
                    <Button onClick={handleDownload} className="mt-4">
                        <Download className="h-4 w-4 mr-2" />
                        Download File
                    </Button>
                </div>
            );
        }

        if (!previewState.previewUrl) {
            return (
                <div className="flex flex-col items-center justify-center h-96 space-y-4">
                    <FileText className="h-12 w-12 text-gray-400" />
                    <p className="text-sm text-gray-600">No preview available</p>
                </div>
            );
        }

        switch (previewState.previewType) {
            case 'image':
                return (
                    <div className="flex justify-center items-center min-h-96 bg-gray-50 rounded-lg overflow-hidden">
                        <img
                            src={previewState.previewUrl}
                            alt={fileRecord.fileName}
                            className="max-w-full max-h-full object-contain transition-transform duration-200"
                            style={{
                                transform: `scale(${previewState.zoom / 100}) rotate(${previewState.rotation}deg)`
                            }}
                            onError={() => {
                                setPreviewState(prev => ({
                                    ...prev,
                                    error: 'Failed to load image'
                                }));
                            }}
                        />
                    </div>
                );

            case 'pdf':
                return (
                    <div className="h-96 bg-gray-50 rounded-lg overflow-hidden">
                        <iframe
                            src={previewState.previewUrl}
                            className="w-full h-full border-0"
                            title={`Preview of ${fileRecord.fileName}`}
                            onError={() => {
                                setPreviewState(prev => ({
                                    ...prev,
                                    error: 'Failed to load PDF'
                                }));
                            }}
                        />
                    </div>
                );

            case 'text':
                return (
                    <div className="h-96 bg-gray-50 rounded-lg overflow-hidden">
                        <iframe
                            src={previewState.previewUrl}
                            className="w-full h-full border-0"
                            title={`Preview of ${fileRecord.fileName}`}
                            onError={() => {
                                setPreviewState(prev => ({
                                    ...prev,
                                    error: 'Failed to load text file'
                                }));
                            }}
                        />
                    </div>
                );

            default:
                return (
                    <div className="flex flex-col items-center justify-center h-96 space-y-4">
                        <FileText className="h-12 w-12 text-gray-400" />
                        <p className="text-sm text-gray-600">File type not supported for preview</p>
                        <Button onClick={handleDownload}>
                            <Download className="h-4 w-4 mr-2" />
                            Download File
                        </Button>
                    </div>
                );
        }
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
                <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-50 rounded-lg">
                            {previewState.previewType === 'image' ? (
                                <ImageIcon className="h-5 w-5 text-blue-600" />
                            ) : (
                                <FileText className="h-5 w-5 text-blue-600" />
                            )}
                        </div>
                        <div>
                            <DialogTitle className="text-lg font-semibold">
                                {fileRecord.fileName}
                            </DialogTitle>
                            <div className="flex items-center space-x-2 mt-1">
                                <Badge variant="outline" className="text-xs">
                                    {fileRecord.mimeType}
                                </Badge>
                                <span className="text-sm text-gray-500">
                                    {formatFileSize(fileRecord.fileSize)}
                                </span>
                                {fileRecord.isEncrypted && (
                                    <Badge variant="secondary" className="text-xs">
                                        Encrypted
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        {previewState.previewType === 'image' && previewState.previewUrl && (
                            <>
                                <Button variant="ghost" size="sm" onClick={handleZoomOut}>
                                    <ZoomOut className="h-4 w-4" />
                                </Button>
                                <span className="text-sm text-gray-600 min-w-12 text-center">
                                    {previewState.zoom}%
                                </span>
                                <Button variant="ghost" size="sm" onClick={handleZoomIn}>
                                    <ZoomIn className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={handleRotate}>
                                    <RotateCw className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm" onClick={handleFullscreen}>
                                    <Maximize2 className="h-4 w-4" />
                                </Button>
                            </>
                        )}

                        <Button variant="ghost" size="sm" onClick={handleDownload}>
                            <Download className="h-4 w-4" />
                        </Button>

                        <DialogClose asChild>
                            <Button variant="ghost" size="sm">
                                <X className="h-4 w-4" />
                            </Button>
                        </DialogClose>
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-auto">
                    {renderPreviewContent()}
                </div>
            </DialogContent>
        </Dialog>
    );
}