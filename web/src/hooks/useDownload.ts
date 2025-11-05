import { useState, useCallback } from 'react';
import { downloadFromStorage, downloadFileAsBlob, triggerFileDownload, previewFile, verifyFileExists } from '@/lib/0g/downloader';
import { NetworkType } from '@/lib/0g/network';
import toast from 'react-hot-toast';

interface DownloadState {
    loading: boolean;
    error: string | null;
    progress: number;
    downloadUrl: string | null;
}

interface UseDownloadReturn {
    downloadState: DownloadState;
    downloadFile: (rootHash: string, fileName: string, mimeType?: string, networkType?: NetworkType) => Promise<boolean>;
    downloadAsBlob: (rootHash: string, fileName: string, mimeType?: string, networkType?: NetworkType) => Promise<string | null>;
    previewFile: (rootHash: string, mimeType: string, networkType?: NetworkType) => Promise<string | null>;
    verifyFile: (rootHash: string, networkType?: NetworkType) => Promise<boolean>;
    resetDownloadState: () => void;
    cleanupDownloadUrl: () => void;
}

export function useDownload(): UseDownloadReturn {
    const [downloadState, setDownloadState] = useState<DownloadState>({
        loading: false,
        error: null,
        progress: 0,
        downloadUrl: null
    });

    const resetDownloadState = useCallback(() => {
        setDownloadState({
            loading: false,
            error: null,
            progress: 0,
            downloadUrl: null
        });
    }, []);

    const cleanupDownloadUrl = useCallback(() => {
        if (downloadState.downloadUrl) {
            URL.revokeObjectURL(downloadState.downloadUrl);
            setDownloadState(prev => ({ ...prev, downloadUrl: null }));
        }
    }, [downloadState.downloadUrl]);

    const downloadFile = useCallback(async (
        rootHash: string,
        fileName: string,
        mimeType: string = 'application/octet-stream',
        networkType: NetworkType = 'standard',
        retryCount: number = 0
    ): Promise<boolean> => {
        const maxRetries = 3;

        try {
            setDownloadState({
                loading: true,
                error: null,
                progress: 0,
                downloadUrl: null
            });

            // Validate inputs
            if (!rootHash || rootHash === 'unknown' || rootHash === 'undefined') {
                console.error('❌ Download validation failed: Invalid root hash');
                throw new Error('Invalid root hash provided. Please check the file hash.');
            }

            if (!fileName) {
                console.error('❌ Download validation failed: Missing file name');
                throw new Error('File name is required');
            }

            // Validate root hash format
            if (rootHash.length < 10) {
                console.error('❌ Download validation failed: Root hash too short');
                throw new Error('Root hash appears to be too short. Please verify the hash.');
            }

            console.log('✅ Download validation passed');
            // Update progress
            setDownloadState(prev => ({ ...prev, progress: 25 }));

            // Trigger the download
            const [success, error] = await triggerFileDownload(rootHash, fileName, mimeType, networkType);

            if (error || !success) {
                // Check if it's a network error and we can retry
                if (retryCount < maxRetries && error && (
                    error.message.includes('network') ||
                    error.message.includes('timeout') ||
                    error.message.includes('connection')
                )) {
                    console.log(`Download attempt ${retryCount + 1} failed, retrying...`);
                    await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1))); // Exponential backoff
                    return downloadFile(rootHash, fileName, mimeType, networkType, retryCount + 1);
                }

                throw error || new Error('Download failed - file may not exist in storage');
            }

            // Update progress to complete
            setDownloadState(prev => ({ ...prev, progress: 100, loading: false }));

            return true;

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Download failed';
            console.error('Download error:', error);

            // Provide more specific error messages
            let userFriendlyMessage = errorMessage;
            if (errorMessage.includes('not found')) {
                userFriendlyMessage = 'File not found in 0G Storage. Please verify the root hash.';
            } else if (errorMessage.includes('network') || errorMessage.includes('timeout')) {
                userFriendlyMessage = 'Network error occurred. Please check your connection and try again.';
            } else if (errorMessage.includes('Invalid root hash')) {
                userFriendlyMessage = 'Invalid file hash format. Please check the hash and try again.';
            }

            setDownloadState({
                loading: false,
                error: userFriendlyMessage,
                progress: 0,
                downloadUrl: null
            });

            return false;
        }
    }, []);

    const downloadAsBlob = useCallback(async (
        rootHash: string,
        fileName: string,
        mimeType: string = 'application/octet-stream',
        networkType: NetworkType = 'standard'
    ): Promise<string | null> => {
        try {
            setDownloadState({
                loading: true,
                error: null,
                progress: 0,
                downloadUrl: null
            });

            // Validate inputs
            if (!rootHash || rootHash === 'unknown' || rootHash === 'undefined') {
                throw new Error('Invalid root hash provided');
            }

            // Update progress
            setDownloadState(prev => ({ ...prev, progress: 50 }));

            // Create blob URL
            const [blobUrl, error] = await downloadFileAsBlob(rootHash, fileName, mimeType, networkType);

            if (error || !blobUrl) {
                throw error || new Error('Failed to create blob URL');
            }

            // Update state with success
            setDownloadState({
                loading: false,
                error: null,
                progress: 100,
                downloadUrl: blobUrl
            });

            return blobUrl;

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to create blob URL';
            console.error('Blob creation error:', error);

            setDownloadState({
                loading: false,
                error: errorMessage,
                progress: 0,
                downloadUrl: null
            });

            return null;
        }
    }, []);

    const previewFileHook = useCallback(async (
        rootHash: string,
        mimeType: string,
        networkType: NetworkType = 'standard'
    ): Promise<string | null> => {
        try {
            setDownloadState({
                loading: true,
                error: null,
                progress: 0,
                downloadUrl: null
            });

            // Validate inputs
            if (!rootHash || rootHash === 'unknown' || rootHash === 'undefined') {
                throw new Error('Invalid root hash provided');
            }

            // Update progress
            setDownloadState(prev => ({ ...prev, progress: 50 }));

            // Create preview URL
            const [previewUrl, error] = await previewFile(rootHash, mimeType, networkType);

            if (error || !previewUrl) {
                throw error || new Error('Failed to create preview URL');
            }

            // Update state with success
            setDownloadState({
                loading: false,
                error: null,
                progress: 100,
                downloadUrl: previewUrl
            });

            return previewUrl;

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to create preview';
            console.error('Preview error:', error);

            setDownloadState({
                loading: false,
                error: errorMessage,
                progress: 0,
                downloadUrl: null
            });

            return null;
        }
    }, []);

    const verifyFile = useCallback(async (
        rootHash: string,
        networkType: NetworkType = 'standard'
    ): Promise<boolean> => {
        try {
            setDownloadState(prev => ({ ...prev, loading: true, error: null }));

            // Validate input
            if (!rootHash || rootHash === 'unknown' || rootHash === 'undefined') {
                return false;
            }

            const [exists, error] = await verifyFileExists(rootHash, networkType);

            setDownloadState(prev => ({ ...prev, loading: false }));

            if (error) {
                console.warn('File verification error:', error);
                return false;
            }

            return exists;

        } catch (error) {
            console.error('File verification failed:', error);
            setDownloadState(prev => ({ ...prev, loading: false }));
            return false;
        }
    }, []);

    return {
        downloadState,
        downloadFile,
        downloadAsBlob,
        previewFile: previewFileHook,
        verifyFile,
        resetDownloadState,
        cleanupDownloadUrl
    };
}