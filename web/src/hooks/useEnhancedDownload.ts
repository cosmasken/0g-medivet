/**
 * Enhanced Download Hook
 * Provides robust download functionality with retry logic, progress tracking, and decryption
 */

import { useState, useCallback, useRef } from 'react';
import { downloadManager, DownloadProgress, DownloadResult, FileRecord } from '@/services/downloadManager';
import { decryptionService, DecryptionProgress } from '@/services/decryptionService';
import { NetworkType } from '@/lib/0g/network';
import toast from 'react-hot-toast';

interface EnhancedDownloadState {
    loading: boolean;
    error: string | null;
    progress: DownloadProgress | null;
    downloadUrl: string | null;
    activeDownloads: Set<string>;
}

interface DownloadFileOptions {
    networkType?: NetworkType;
    maxRetries?: number;
    showToast?: boolean;
    autoCleanup?: boolean;
}

interface UseEnhancedDownloadReturn {
    downloadState: EnhancedDownloadState;
    downloadFile: (rootHash: string, fileName: string, options?: DownloadFileOptions) => Promise<boolean>;
    downloadAndDecryptFile: (fileRecord: FileRecord, walletAddress: string, options?: DownloadFileOptions) => Promise<boolean>;
    downloadAsBlob: (rootHash: string, fileName: string, mimeType?: string, options?: DownloadFileOptions) => Promise<string | null>;
    downloadMultipleFiles: (files: FileRecord[], walletAddress: string, options?: DownloadFileOptions) => Promise<boolean>;
    cancelDownload: (downloadId?: string) => void;
    cancelAllDownloads: () => void;
    cleanupDownloadUrl: () => void;
    resetDownloadState: () => void;
    getCacheStats: () => { size: number; entries: number };
}

export function useEnhancedDownload(): UseEnhancedDownloadReturn {
    const [downloadState, setDownloadState] = useState<EnhancedDownloadState>({
        loading: false,
        error: null,
        progress: null,
        downloadUrl: null,
        activeDownloads: new Set()
    });

    const downloadUrlsRef = useRef<Set<string>>(new Set());

    const resetDownloadState = useCallback(() => {
        setDownloadState({
            loading: false,
            error: null,
            progress: null,
            downloadUrl: null,
            activeDownloads: new Set()
        });
    }, []);

    const cleanupDownloadUrl = useCallback(() => {
        if (downloadState.downloadUrl) {
            URL.revokeObjectURL(downloadState.downloadUrl);
            downloadUrlsRef.current.delete(downloadState.downloadUrl);
        }

        // Clean up all tracked URLs
        downloadUrlsRef.current.forEach(url => {
            URL.revokeObjectURL(url);
        });
        downloadUrlsRef.current.clear();

        setDownloadState(prev => ({ ...prev, downloadUrl: null }));
    }, [downloadState.downloadUrl]);

    const updateProgress = useCallback((progress: DownloadProgress) => {
        setDownloadState(prev => ({
            ...prev,
            progress,
            loading: progress.stage !== 'complete' && progress.stage !== 'error'
        }));
    }, []);

    const downloadFile = useCallback(async (
        rootHash: string,
        fileName: string,
        options: DownloadFileOptions = {}
    ): Promise<boolean> => {
        const {
            networkType = 'standard',
            maxRetries = 3,
            showToast = true,
            autoCleanup = true
        } = options;

        const downloadId = `${rootHash}-${Date.now()}`;

        try {
            setDownloadState(prev => ({
                ...prev,
                loading: true,
                error: null,
                progress: null,
                activeDownloads: new Set([...prev.activeDownloads, downloadId])
            }));

            if (showToast) {
                toast.loading(`Downloading ${fileName}...`, { id: downloadId });
            }

            const result = await downloadManager.downloadFile(rootHash, fileName, {
                networkType,
                maxRetries,
                onProgress: updateProgress
            });

            if (result.success && result.data) {
                // Create blob and trigger download
                const blob = new Blob([result.data], { type: 'application/octet-stream' });
                const url = URL.createObjectURL(blob);

                // Track URL for cleanup
                downloadUrlsRef.current.add(url);

                // Create download link
                const link = document.createElement('a');
                link.href = url;
                link.download = fileName;
                link.style.display = 'none';

                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                if (autoCleanup) {
                    setTimeout(() => {
                        URL.revokeObjectURL(url);
                        downloadUrlsRef.current.delete(url);
                    }, 1000);
                }

                if (showToast) {
                    toast.success(`${fileName} downloaded successfully`, { id: downloadId });
                }

                setDownloadState(prev => ({
                    ...prev,
                    loading: false,
                    progress: { stage: 'complete', progress: 100, message: 'Download completed' }
                }));

                return true;
            } else {
                throw result.error || new Error('Download failed');
            }

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Download failed';

            setDownloadState(prev => ({
                ...prev,
                loading: false,
                error: errorMessage,
                progress: { stage: 'error', progress: 0, message: errorMessage }
            }));

            if (showToast) {
                toast.error(`Failed to download ${fileName}: ${errorMessage}`, { id: downloadId });
            }

            return false;
        } finally {
            setDownloadState(prev => ({
                ...prev,
                activeDownloads: new Set([...prev.activeDownloads].filter(id => id !== downloadId))
            }));
        }
    }, [updateProgress]);

    const downloadAndDecryptFile = useCallback(async (
        fileRecord: FileRecord,
        walletAddress: string,
        options: DownloadFileOptions = {}
    ): Promise<boolean> => {
        const { showToast = true, autoCleanup = true } = options;
        const downloadId = `${fileRecord.id}-${Date.now()}`;

        try {
            setDownloadState(prev => ({
                ...prev,
                loading: true,
                error: null,
                progress: null,
                activeDownloads: new Set([...prev.activeDownloads, downloadId])
            }));

            if (showToast) {
                const message = fileRecord.isEncrypted ?
                    `Downloading and decrypting ${fileRecord.fileName}...` :
                    `Downloading ${fileRecord.fileName}...`;
                toast.loading(message, { id: downloadId });
            }

            const result = await downloadManager.downloadAndDecryptFile(
                fileRecord,
                walletAddress,
                {
                    ...options,
                    onProgress: updateProgress
                }
            );

            if (result.success && result.data) {
                // Create blob and trigger download
                const blob = new Blob([result.data], { type: result.metadata?.mimeType || 'application/octet-stream' });
                const url = URL.createObjectURL(blob);

                // Track URL for cleanup
                downloadUrlsRef.current.add(url);

                // Create download link
                const link = document.createElement('a');
                link.href = url;
                link.download = fileRecord.fileName;
                link.style.display = 'none';

                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                if (autoCleanup) {
                    setTimeout(() => {
                        URL.revokeObjectURL(url);
                        downloadUrlsRef.current.delete(url);
                    }, 1000);
                }

                if (showToast) {
                    const message = fileRecord.isEncrypted ?
                        `${fileRecord.fileName} decrypted and downloaded successfully` :
                        `${fileRecord.fileName} downloaded successfully`;
                    toast.success(message, { id: downloadId });
                }

                setDownloadState(prev => ({
                    ...prev,
                    loading: false,
                    progress: { stage: 'complete', progress: 100, message: 'Download completed' }
                }));

                return true;
            } else {
                throw result.error || new Error('Download failed');
            }

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Download failed';

            setDownloadState(prev => ({
                ...prev,
                loading: false,
                error: errorMessage,
                progress: { stage: 'error', progress: 0, message: errorMessage }
            }));

            if (showToast) {
                toast.error(`Failed to download ${fileRecord.fileName}: ${errorMessage}`, { id: downloadId });
            }

            return false;
        } finally {
            setDownloadState(prev => ({
                ...prev,
                activeDownloads: new Set([...prev.activeDownloads].filter(id => id !== downloadId))
            }));
        }
    }, [updateProgress]);

    const downloadAsBlob = useCallback(async (
        rootHash: string,
        fileName: string,
        mimeType: string = 'application/octet-stream',
        options: DownloadFileOptions = {}
    ): Promise<string | null> => {
        const { networkType = 'standard', maxRetries = 3 } = options;

        try {
            setDownloadState(prev => ({
                ...prev,
                loading: true,
                error: null,
                progress: null
            }));

            const result = await downloadManager.createDownloadUrl(rootHash, fileName, mimeType, {
                networkType,
                maxRetries,
                onProgress: updateProgress
            });

            if (result.success && result.blobUrl) {
                downloadUrlsRef.current.add(result.blobUrl);

                setDownloadState(prev => ({
                    ...prev,
                    loading: false,
                    downloadUrl: result.blobUrl!,
                    progress: { stage: 'complete', progress: 100, message: 'Blob URL created' }
                }));

                return result.blobUrl;
            } else {
                throw result.error || new Error('Failed to create blob URL');
            }

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to create blob URL';

            setDownloadState(prev => ({
                ...prev,
                loading: false,
                error: errorMessage,
                progress: { stage: 'error', progress: 0, message: errorMessage }
            }));

            return null;
        }
    }, [updateProgress]);

    const downloadMultipleFiles = useCallback(async (
        files: FileRecord[],
        walletAddress: string,
        options: DownloadFileOptions = {}
    ): Promise<boolean> => {
        const { showToast = true } = options;
        const batchId = `batch-${Date.now()}`;

        try {
            setDownloadState(prev => ({
                ...prev,
                loading: true,
                error: null,
                progress: null,
                activeDownloads: new Set([...prev.activeDownloads, batchId])
            }));

            if (showToast) {
                toast.loading(`Downloading ${files.length} files...`, { id: batchId });
            }

            const result = await downloadManager.downloadMultipleFiles(files, walletAddress, {
                ...options,
                onProgress: updateProgress
            });

            if (result.success) {
                if (showToast) {
                    toast.success(`Successfully downloaded ${result.successCount} of ${result.totalFiles} files`, { id: batchId });
                }

                setDownloadState(prev => ({
                    ...prev,
                    loading: false,
                    progress: { stage: 'complete', progress: 100, message: `Downloaded ${result.successCount}/${result.totalFiles} files` }
                }));

                return true;
            } else {
                if (showToast) {
                    toast.error(`Downloaded ${result.successCount} of ${result.totalFiles} files (${result.failureCount} failed)`, { id: batchId });
                }

                setDownloadState(prev => ({
                    ...prev,
                    loading: false,
                    error: `${result.failureCount} files failed to download`,
                    progress: { stage: 'error', progress: 0, message: `${result.failureCount} files failed` }
                }));

                return false;
            }

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Batch download failed';

            setDownloadState(prev => ({
                ...prev,
                loading: false,
                error: errorMessage,
                progress: { stage: 'error', progress: 0, message: errorMessage }
            }));

            if (showToast) {
                toast.error(`Batch download failed: ${errorMessage}`, { id: batchId });
            }

            return false;
        } finally {
            setDownloadState(prev => ({
                ...prev,
                activeDownloads: new Set([...prev.activeDownloads].filter(id => id !== batchId))
            }));
        }
    }, [updateProgress]);

    const cancelDownload = useCallback((downloadId?: string) => {
        if (downloadId) {
            downloadManager.cancelDownload(downloadId);
            setDownloadState(prev => ({
                ...prev,
                activeDownloads: new Set([...prev.activeDownloads].filter(id => id !== downloadId))
            }));
        } else {
            downloadManager.cancelAllDownloads();
            setDownloadState(prev => ({
                ...prev,
                activeDownloads: new Set()
            }));
        }
    }, []);

    const cancelAllDownloads = useCallback(() => {
        downloadManager.cancelAllDownloads();
        setDownloadState(prev => ({
            ...prev,
            loading: false,
            activeDownloads: new Set()
        }));
    }, []);

    const getCacheStats = useCallback(() => {
        return downloadManager.getCacheStats();
    }, []);

    return {
        downloadState,
        downloadFile,
        downloadAndDecryptFile,
        downloadAsBlob,
        downloadMultipleFiles,
        cancelDownload,
        cancelAllDownloads,
        cleanupDownloadUrl,
        resetDownloadState,
        getCacheStats
    };
}