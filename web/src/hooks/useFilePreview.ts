/**
 * File Preview Hook
 * Manages file preview state and thumbnail generation
 */

import { useState, useCallback, useEffect } from 'react';
import { thumbnailService, ThumbnailResult, ThumbnailOptions } from '@/services/thumbnailService';
import { FileRecord } from '@/services/downloadManager';

interface PreviewState {
    loading: boolean;
    error: string | null;
    thumbnailUrl: string | null;
    isSupported: boolean;
}

interface UseFilePreviewReturn {
    previewState: PreviewState;
    generateThumbnail: (fileRecord: FileRecord, walletAddress: string, options?: ThumbnailOptions) => Promise<boolean>;
    clearThumbnail: () => void;
    isPreviewSupported: (mimeType: string) => boolean;
    preloadThumbnails: (files: FileRecord[], walletAddress: string, options?: ThumbnailOptions) => Promise<void>;
    getCacheStats: () => { entries: number; size: number; maxSize: number };
}

export function useFilePreview(): UseFilePreviewReturn {
    const [previewState, setPreviewState] = useState<PreviewState>({
        loading: false,
        error: null,
        thumbnailUrl: null,
        isSupported: false
    });

    const generateThumbnail = useCallback(async (
        fileRecord: FileRecord,
        walletAddress: string,
        options: ThumbnailOptions = {}
    ): Promise<boolean> => {
        if (!fileRecord || !walletAddress) {
            setPreviewState(prev => ({
                ...prev,
                error: 'Invalid file record or wallet address'
            }));
            return false;
        }

        const isSupported = thumbnailService.isSupported(fileRecord.mimeType);

        setPreviewState(prev => ({
            ...prev,
            loading: true,
            error: null,
            isSupported
        }));

        if (!isSupported) {
            setPreviewState(prev => ({
                ...prev,
                loading: false,
                error: `Thumbnail not supported for ${fileRecord.mimeType}`
            }));
            return false;
        }

        try {
            const result = await thumbnailService.generateThumbnail(fileRecord, walletAddress, options);

            if (result.success && result.thumbnailUrl) {
                setPreviewState(prev => ({
                    ...prev,
                    loading: false,
                    thumbnailUrl: result.thumbnailUrl!,
                    error: null
                }));
                return true;
            } else {
                const errorMessage = result.error?.message || 'Failed to generate thumbnail';
                setPreviewState(prev => ({
                    ...prev,
                    loading: false,
                    error: errorMessage
                }));
                return false;
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Thumbnail generation failed';
            setPreviewState(prev => ({
                ...prev,
                loading: false,
                error: errorMessage
            }));
            return false;
        }
    }, []);

    const clearThumbnail = useCallback(() => {
        if (previewState.thumbnailUrl) {
            URL.revokeObjectURL(previewState.thumbnailUrl);
        }

        setPreviewState({
            loading: false,
            error: null,
            thumbnailUrl: null,
            isSupported: false
        });
    }, [previewState.thumbnailUrl]);

    const isPreviewSupported = useCallback((mimeType: string): boolean => {
        return thumbnailService.isSupported(mimeType);
    }, []);

    const preloadThumbnails = useCallback(async (
        files: FileRecord[],
        walletAddress: string,
        options: ThumbnailOptions = {}
    ): Promise<void> => {
        try {
            await thumbnailService.preloadThumbnails(files, walletAddress, options);
        } catch (error) {
            console.warn('Failed to preload thumbnails:', error);
        }
    }, []);

    const getCacheStats = useCallback(() => {
        return thumbnailService.getCacheStats();
    }, []);

    // Cleanup thumbnail URL when component unmounts
    useEffect(() => {
        return () => {
            if (previewState.thumbnailUrl) {
                URL.revokeObjectURL(previewState.thumbnailUrl);
            }
        };
    }, [previewState.thumbnailUrl]);

    return {
        previewState,
        generateThumbnail,
        clearThumbnail,
        isPreviewSupported,
        preloadThumbnails,
        getCacheStats
    };
}

/**
 * Hook for managing multiple file previews
 */
interface MultiPreviewState {
    loading: boolean;
    thumbnails: Map<string, string>; // fileId -> thumbnailUrl
    errors: Map<string, string>; // fileId -> error message
    loadingFiles: Set<string>; // fileIds currently loading
}

interface UseMultiFilePreviewReturn {
    previewState: MultiPreviewState;
    generateThumbnails: (files: FileRecord[], walletAddress: string, options?: ThumbnailOptions) => Promise<void>;
    getThumbnail: (fileId: string) => string | null;
    getError: (fileId: string) => string | null;
    isLoading: (fileId: string) => boolean;
    clearThumbnails: () => void;
    clearThumbnail: (fileId: string) => void;
}

export function useMultiFilePreview(): UseMultiFilePreviewReturn {
    const [previewState, setPreviewState] = useState<MultiPreviewState>({
        loading: false,
        thumbnails: new Map(),
        errors: new Map(),
        loadingFiles: new Set()
    });

    const generateThumbnails = useCallback(async (
        files: FileRecord[],
        walletAddress: string,
        options: ThumbnailOptions = {}
    ): Promise<void> => {
        if (!files.length || !walletAddress) return;

        // Filter supported files
        const supportedFiles = files.filter(file => thumbnailService.isSupported(file.mimeType));

        if (supportedFiles.length === 0) return;

        setPreviewState(prev => ({
            ...prev,
            loading: true,
            loadingFiles: new Set([...prev.loadingFiles, ...supportedFiles.map(f => f.id)])
        }));

        try {
            const results = await thumbnailService.generateMultipleThumbnails(
                supportedFiles,
                walletAddress,
                options
            );

            setPreviewState(prev => {
                const newThumbnails = new Map(prev.thumbnails);
                const newErrors = new Map(prev.errors);
                const newLoadingFiles = new Set(prev.loadingFiles);

                for (const [fileId, result] of results) {
                    newLoadingFiles.delete(fileId);

                    if (result.success && result.thumbnailUrl) {
                        newThumbnails.set(fileId, result.thumbnailUrl);
                        newErrors.delete(fileId); // Clear any previous error
                    } else {
                        newErrors.set(fileId, result.error?.message || 'Failed to generate thumbnail');
                    }
                }

                return {
                    ...prev,
                    loading: newLoadingFiles.size > 0,
                    thumbnails: newThumbnails,
                    errors: newErrors,
                    loadingFiles: newLoadingFiles
                };
            });

        } catch (error) {
            console.error('Batch thumbnail generation failed:', error);

            setPreviewState(prev => ({
                ...prev,
                loading: false,
                loadingFiles: new Set()
            }));
        }
    }, []);

    const getThumbnail = useCallback((fileId: string): string | null => {
        return previewState.thumbnails.get(fileId) || null;
    }, [previewState.thumbnails]);

    const getError = useCallback((fileId: string): string | null => {
        return previewState.errors.get(fileId) || null;
    }, [previewState.errors]);

    const isLoading = useCallback((fileId: string): boolean => {
        return previewState.loadingFiles.has(fileId);
    }, [previewState.loadingFiles]);

    const clearThumbnails = useCallback(() => {
        // Revoke all blob URLs
        for (const [, thumbnailUrl] of previewState.thumbnails) {
            URL.revokeObjectURL(thumbnailUrl);
        }

        setPreviewState({
            loading: false,
            thumbnails: new Map(),
            errors: new Map(),
            loadingFiles: new Set()
        });
    }, [previewState.thumbnails]);

    const clearThumbnail = useCallback((fileId: string) => {
        const thumbnailUrl = previewState.thumbnails.get(fileId);
        if (thumbnailUrl) {
            URL.revokeObjectURL(thumbnailUrl);
        }

        setPreviewState(prev => {
            const newThumbnails = new Map(prev.thumbnails);
            const newErrors = new Map(prev.errors);
            const newLoadingFiles = new Set(prev.loadingFiles);

            newThumbnails.delete(fileId);
            newErrors.delete(fileId);
            newLoadingFiles.delete(fileId);

            return {
                ...prev,
                thumbnails: newThumbnails,
                errors: newErrors,
                loadingFiles: newLoadingFiles,
                loading: newLoadingFiles.size > 0
            };
        });
    }, [previewState.thumbnails]);

    // Cleanup all thumbnail URLs when component unmounts
    useEffect(() => {
        return () => {
            for (const [, thumbnailUrl] of previewState.thumbnails) {
                URL.revokeObjectURL(thumbnailUrl);
            }
        };
    }, [previewState.thumbnails]);

    return {
        previewState,
        generateThumbnails,
        getThumbnail,
        getError,
        isLoading,
        clearThumbnails,
        clearThumbnail
    };
}