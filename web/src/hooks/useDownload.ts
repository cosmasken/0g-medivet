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
        networkType: NetworkType = 'standard'
    ): Promise<boolean> => {
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

            if (!fileName) {
                throw new Error('File name is required');
            }

            // Update progress
            setDownloadState(prev => ({ ...prev, progress: 25 }));

            // Trigger the download
            const [success, error] = await triggerFileDownload(rootHash, fileName, mimeType, networkType);

            if (error || !success) {
                throw error || new Error('Download failed');
            }

            // Update progress to complete
            setDownloadState(prev => ({ ...prev, progress: 100, loading: false }));

            toast.success(`File "${fileName}" downloaded successfully!`);
            return true;

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Download failed';
            console.error('Download error:', error);

            setDownloadState({
                loading: false,
                error: errorMessage,
                progress: 0,
                downloadUrl: null
            });

            toast.error(`Download failed: ${errorMessage}`);
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