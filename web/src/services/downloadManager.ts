/**
 * Enhanced Download Manager Service
 * Provides robust download functionality with retry logic, progress tracking, and error handling
 */

import { downloadFromStorage, downloadFileAsBlob, previewFile, verifyFileExists } from '@/lib/0g/downloader';
import { encryptionService, EncryptionMetadata } from '@/lib/encryption';
import { NetworkType } from '@/lib/0g/network';

export interface DownloadOptions {
    networkType?: NetworkType;
    maxRetries?: number;
    retryDelay?: number;
    onProgress?: (progress: DownloadProgress) => void;
    signal?: AbortSignal;
}

export interface DownloadProgress {
    stage: 'validating' | 'downloading' | 'decrypting' | 'complete' | 'error';
    progress: number; // 0-100
    message: string;
    bytesDownloaded?: number;
    totalBytes?: number;
}

export interface DownloadResult {
    success: boolean;
    data?: Uint8Array;
    blobUrl?: string;
    error?: Error;
    metadata?: {
        fileName: string;
        mimeType: string;
        size: number;
        downloadTime: number;
    };
}

export interface BatchDownloadResult {
    success: boolean;
    results: Map<string, DownloadResult>;
    totalFiles: number;
    successCount: number;
    failureCount: number;
    totalTime: number;
}

export interface FileRecord {
    id: string;
    rootHash: string;
    fileName: string;
    mimeType: string;
    fileSize: number;
    isEncrypted: boolean;
    encryptionMetadata?: EncryptionMetadata;
    walletAddress?: string;
}

export class DownloadManager {
    private activeDownloads = new Map<string, AbortController>();
    private downloadCache = new Map<string, { data: Uint8Array; timestamp: number }>();
    private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

    /**
     * Downloads a single file with retry logic and progress tracking
     */
    async downloadFile(
        rootHash: string,
        fileName: string,
        options: DownloadOptions = {}
    ): Promise<DownloadResult> {
        const startTime = Date.now();
        const downloadId = `${rootHash}-${Date.now()}`;

        const {
            networkType = 'standard',
            maxRetries = 3,
            retryDelay = 1000,
            onProgress,
            signal
        } = options;

        // Create abort controller for this download
        const abortController = new AbortController();
        this.activeDownloads.set(downloadId, abortController);

        // Handle external abort signal
        if (signal) {
            signal.addEventListener('abort', () => {
                abortController.abort();
            });
        }

        try {
            // Validation stage
            onProgress?.({
                stage: 'validating',
                progress: 10,
                message: 'Validating file hash...'
            });

            if (!rootHash || rootHash === 'unknown' || rootHash === 'undefined') {
                throw new Error('Invalid root hash provided');
            }

            if (rootHash.length < 10) {
                throw new Error('Root hash appears to be too short');
            }

            // Check cache first
            const cached = this.getCachedFile(rootHash);
            if (cached) {
                onProgress?.({
                    stage: 'complete',
                    progress: 100,
                    message: 'File loaded from cache'
                });

                return {
                    success: true,
                    data: cached,
                    metadata: {
                        fileName,
                        mimeType: 'application/octet-stream',
                        size: cached.length,
                        downloadTime: Date.now() - startTime
                    }
                };
            }

            // Download with retry logic
            let lastError: Error | null = null;
            let attempt = 0;

            while (attempt <= maxRetries) {
                if (abortController.signal.aborted) {
                    throw new Error('Download cancelled');
                }

                try {
                    onProgress?.({
                        stage: 'downloading',
                        progress: 20 + (attempt * 20),
                        message: attempt === 0 ? 'Downloading from 0G Storage...' : `Retry attempt ${attempt}...`
                    });

                    const [fileData, error] = await downloadFromStorage(rootHash, networkType);

                    if (error || !fileData) {
                        throw error || new Error('No data received from storage');
                    }

                    // Cache the downloaded file
                    this.cacheFile(rootHash, fileData);

                    onProgress?.({
                        stage: 'complete',
                        progress: 100,
                        message: 'Download completed successfully'
                    });

                    return {
                        success: true,
                        data: fileData,
                        metadata: {
                            fileName,
                            mimeType: 'application/octet-stream',
                            size: fileData.length,
                            downloadTime: Date.now() - startTime
                        }
                    };

                } catch (error) {
                    lastError = error instanceof Error ? error : new Error(String(error));

                    // Check if it's a retryable error
                    if (this.isRetryableError(lastError) && attempt < maxRetries) {
                        const delay = retryDelay * Math.pow(2, attempt); // Exponential backoff
                        await this.sleep(delay);
                        attempt++;
                        continue;
                    }

                    throw lastError;
                }
            }

            throw lastError || new Error('Download failed after all retries');

        } catch (error) {
            const errorObj = error instanceof Error ? error : new Error(String(error));

            onProgress?.({
                stage: 'error',
                progress: 0,
                message: this.getUserFriendlyErrorMessage(errorObj)
            });

            return {
                success: false,
                error: errorObj
            };
        } finally {
            this.activeDownloads.delete(downloadId);
        }
    }

    /**
     * Downloads and decrypts an encrypted file with detailed progress tracking
     */
    async downloadAndDecryptFile(
        fileRecord: FileRecord,
        walletAddress: string,
        options: DownloadOptions = {}
    ): Promise<DownloadResult> {
        const { onProgress } = options;
        const startTime = Date.now();

        try {
            // Validate wallet address for encrypted files
            if (fileRecord.isEncrypted && (!walletAddress || walletAddress === '0x')) {
                throw new Error('Valid wallet address required for encrypted file decryption');
            }

            // First download the encrypted file
            const downloadResult = await this.downloadFile(
                fileRecord.rootHash,
                fileRecord.fileName,
                {
                    ...options,
                    onProgress: (progress) => {
                        if (progress.stage === 'downloading') {
                            onProgress?.({
                                ...progress,
                                progress: progress.progress * 0.6, // Reserve 40% for decryption process
                                message: fileRecord.isEncrypted ?
                                    'Downloading encrypted file...' :
                                    progress.message
                            });
                        } else {
                            onProgress?.(progress);
                        }
                    }
                }
            );

            if (!downloadResult.success || !downloadResult.data) {
                return downloadResult;
            }

            // If file is encrypted, decrypt it
            if (fileRecord.isEncrypted && fileRecord.encryptionMetadata) {
                onProgress?.({
                    stage: 'decrypting',
                    progress: 70,
                    message: 'Preparing decryption...'
                });

                try {
                    // Validate encryption metadata
                    if (!fileRecord.encryptionMetadata.salt ||
                        !fileRecord.encryptionMetadata.iv ||
                        !fileRecord.encryptionMetadata.authTag) {
                        throw new Error('Invalid encryption metadata - missing required fields');
                    }

                    onProgress?.({
                        stage: 'decrypting',
                        progress: 80,
                        message: 'Deriving decryption key...'
                    });

                    // Add a small delay to show progress
                    await this.sleep(100);

                    onProgress?.({
                        stage: 'decrypting',
                        progress: 90,
                        message: 'Decrypting file data...'
                    });

                    const decryptedFile = await encryptionService.decryptFile(
                        downloadResult.data.buffer,
                        fileRecord.encryptionMetadata,
                        walletAddress
                    );

                    const decryptedData = new Uint8Array(await decryptedFile.arrayBuffer());

                    // Validate decrypted data
                    if (decryptedData.length === 0) {
                        throw new Error('Decryption resulted in empty file');
                    }

                    // Verify original size if available
                    if (fileRecord.encryptionMetadata.originalSize &&
                        decryptedData.length !== fileRecord.encryptionMetadata.originalSize) {
                        console.warn('Decrypted file size does not match expected original size');
                    }

                    onProgress?.({
                        stage: 'complete',
                        progress: 100,
                        message: 'File decrypted successfully',
                        bytesDownloaded: decryptedData.length
                    });

                    return {
                        success: true,
                        data: decryptedData,
                        metadata: {
                            fileName: fileRecord.fileName,
                            mimeType: fileRecord.mimeType,
                            size: decryptedData.length,
                            downloadTime: Date.now() - startTime
                        }
                    };

                } catch (decryptError) {
                    const errorMessage = decryptError instanceof Error ? decryptError.message : 'Unknown decryption error';

                    // Provide more specific error messages
                    let userFriendlyMessage = errorMessage;
                    if (errorMessage.includes('key')) {
                        userFriendlyMessage = 'Decryption failed: Invalid wallet address or corrupted encryption key';
                    } else if (errorMessage.includes('auth') || errorMessage.includes('tag')) {
                        userFriendlyMessage = 'Decryption failed: File may be corrupted or tampered with';
                    } else if (errorMessage.includes('metadata')) {
                        userFriendlyMessage = 'Decryption failed: Invalid or corrupted encryption metadata';
                    }

                    throw new Error(userFriendlyMessage);
                }
            }

            // File is not encrypted, return as-is
            onProgress?.({
                stage: 'complete',
                progress: 100,
                message: 'File downloaded successfully (unencrypted)',
                bytesDownloaded: downloadResult.data.length
            });

            return {
                ...downloadResult,
                metadata: {
                    fileName: fileRecord.fileName,
                    mimeType: fileRecord.mimeType,
                    size: downloadResult.data.length,
                    downloadTime: Date.now() - startTime
                }
            };

        } catch (error) {
            const errorObj = error instanceof Error ? error : new Error(String(error));

            onProgress?.({
                stage: 'error',
                progress: 0,
                message: this.getUserFriendlyErrorMessage(errorObj)
            });

            return {
                success: false,
                error: errorObj
            };
        }
    }

    /**
     * Downloads multiple files in parallel with progress tracking
     */
    async downloadMultipleFiles(
        files: FileRecord[],
        walletAddress: string,
        options: DownloadOptions = {}
    ): Promise<BatchDownloadResult> {
        const startTime = Date.now();
        const results = new Map<string, DownloadResult>();
        const { onProgress } = options;

        let completedCount = 0;
        const totalFiles = files.length;

        const downloadPromises = files.map(async (file) => {
            const result = await this.downloadAndDecryptFile(file, walletAddress, {
                ...options,
                onProgress: (progress) => {
                    // Update overall progress
                    const overallProgress = ((completedCount / totalFiles) * 100) +
                        (progress.progress / totalFiles);

                    onProgress?.({
                        stage: progress.stage,
                        progress: Math.min(overallProgress, 100),
                        message: `Downloading ${file.fileName}... (${completedCount + 1}/${totalFiles})`
                    });
                }
            });

            results.set(file.id, result);
            completedCount++;

            return result;
        });

        await Promise.allSettled(downloadPromises);

        const successCount = Array.from(results.values()).filter(r => r.success).length;
        const failureCount = totalFiles - successCount;

        return {
            success: failureCount === 0,
            results,
            totalFiles,
            successCount,
            failureCount,
            totalTime: Date.now() - startTime
        };
    }

    /**
     * Creates a blob URL for file download
     */
    async createDownloadUrl(
        rootHash: string,
        fileName: string,
        mimeType: string = 'application/octet-stream',
        options: DownloadOptions = {}
    ): Promise<DownloadResult> {
        try {
            const downloadResult = await this.downloadFile(rootHash, fileName, options);

            if (!downloadResult.success || !downloadResult.data) {
                return downloadResult;
            }

            const blob = new Blob([downloadResult.data], { type: mimeType });
            const blobUrl = URL.createObjectURL(blob);

            return {
                success: true,
                blobUrl,
                metadata: {
                    fileName,
                    mimeType,
                    size: blob.size,
                    downloadTime: downloadResult.metadata?.downloadTime || 0
                }
            };

        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error : new Error(String(error))
            };
        }
    }

    /**
     * Cancels an active download
     */
    cancelDownload(downloadId: string): boolean {
        const controller = this.activeDownloads.get(downloadId);
        if (controller) {
            controller.abort();
            this.activeDownloads.delete(downloadId);
            return true;
        }
        return false;
    }

    /**
     * Cancels all active downloads
     */
    cancelAllDownloads(): void {
        for (const [id, controller] of this.activeDownloads) {
            controller.abort();
        }
        this.activeDownloads.clear();
    }

    /**
     * Clears the download cache
     */
    clearCache(): void {
        this.downloadCache.clear();
    }

    /**
     * Gets cache statistics
     */
    getCacheStats(): { size: number; entries: number } {
        let totalSize = 0;
        for (const [, { data }] of this.downloadCache) {
            totalSize += data.length;
        }

        return {
            size: totalSize,
            entries: this.downloadCache.size
        };
    }

    // Private helper methods

    private getCachedFile(rootHash: string): Uint8Array | null {
        const cached = this.downloadCache.get(rootHash);
        if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
            return cached.data;
        }

        if (cached) {
            this.downloadCache.delete(rootHash);
        }

        return null;
    }

    private cacheFile(rootHash: string, data: Uint8Array): void {
        // Limit cache size to prevent memory issues
        if (this.downloadCache.size >= 50) {
            const oldestKey = this.downloadCache.keys().next().value;
            this.downloadCache.delete(oldestKey);
        }

        this.downloadCache.set(rootHash, {
            data,
            timestamp: Date.now()
        });
    }

    private isRetryableError(error: Error): boolean {
        const retryableMessages = [
            'network',
            'timeout',
            'connection',
            'fetch',
            'ECONNRESET',
            'ETIMEDOUT'
        ];

        return retryableMessages.some(msg =>
            error.message.toLowerCase().includes(msg.toLowerCase())
        );
    }

    private getUserFriendlyErrorMessage(error: Error): string {
        const message = error.message.toLowerCase();

        if (message.includes('not found')) {
            return 'File not found in storage. Please verify the file hash.';
        }

        if (message.includes('network') || message.includes('timeout')) {
            return 'Network error occurred. Please check your connection and try again.';
        }

        if (message.includes('invalid root hash')) {
            return 'Invalid file hash format. Please check the hash and try again.';
        }

        if (message.includes('decryption failed')) {
            return 'Failed to decrypt file. Please check your wallet connection.';
        }

        if (message.includes('cancelled')) {
            return 'Download was cancelled.';
        }

        return error.message;
    }

    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Export singleton instance
export const downloadManager = new DownloadManager();