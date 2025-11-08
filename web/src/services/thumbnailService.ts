/**
 * Thumbnail Generation Service
 * Generates and caches thumbnails for supported file types
 */

import { downloadManager, FileRecord } from './downloadManager';

export interface ThumbnailOptions {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'jpeg' | 'png' | 'webp';
}

export interface ThumbnailResult {
    success: boolean;
    thumbnailUrl?: string;
    error?: Error;
    cached?: boolean;
}

export interface ThumbnailCache {
    url: string;
    timestamp: number;
    size: number;
}

export class ThumbnailService {
    private thumbnailCache = new Map<string, ThumbnailCache>();
    private readonly CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
    private readonly MAX_CACHE_SIZE = 50 * 1024 * 1024; // 50MB
    private currentCacheSize = 0;

    private readonly DEFAULT_OPTIONS: Required<ThumbnailOptions> = {
        width: 200,
        height: 200,
        quality: 0.8,
        format: 'jpeg'
    };

    private readonly SUPPORTED_TYPES = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/webp',
        'application/pdf'
    ];

    /**
     * Generates a thumbnail for the given file
     */
    async generateThumbnail(
        fileRecord: FileRecord,
        walletAddress: string,
        options: ThumbnailOptions = {}
    ): Promise<ThumbnailResult> {
        const opts = { ...this.DEFAULT_OPTIONS, ...options };
        const cacheKey = this.getCacheKey(fileRecord.rootHash, opts);

        try {
            // Check cache first
            const cached = this.getCachedThumbnail(cacheKey);
            if (cached) {
                return {
                    success: true,
                    thumbnailUrl: cached.url,
                    cached: true
                };
            }

            // Check if file type is supported
            if (!this.isSupported(fileRecord.mimeType)) {
                return {
                    success: false,
                    error: new Error(`Thumbnail generation not supported for ${fileRecord.mimeType}`)
                };
            }

            // Download the file data
            const downloadResult = await downloadManager.downloadAndDecryptFile(
                fileRecord,
                walletAddress,
                { onProgress: undefined } // No progress tracking for thumbnails
            );

            if (!downloadResult.success || !downloadResult.data) {
                throw downloadResult.error || new Error('Failed to download file for thumbnail');
            }

            // Generate thumbnail based on file type
            let thumbnailUrl: string;

            if (fileRecord.mimeType.startsWith('image/')) {
                thumbnailUrl = await this.generateImageThumbnail(downloadResult.data, fileRecord.mimeType, opts);
            } else if (fileRecord.mimeType === 'application/pdf') {
                thumbnailUrl = await this.generatePdfThumbnail(downloadResult.data, opts);
            } else {
                throw new Error(`Unsupported file type: ${fileRecord.mimeType}`);
            }

            // Cache the thumbnail
            this.cacheThumbnail(cacheKey, thumbnailUrl);

            return {
                success: true,
                thumbnailUrl,
                cached: false
            };

        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error : new Error(String(error))
            };
        }
    }

    /**
     * Generates thumbnails for multiple files
     */
    async generateMultipleThumbnails(
        files: FileRecord[],
        walletAddress: string,
        options: ThumbnailOptions = {}
    ): Promise<Map<string, ThumbnailResult>> {
        const results = new Map<string, ThumbnailResult>();

        // Process files in parallel with limited concurrency
        const concurrency = 3;
        const chunks = this.chunkArray(files, concurrency);

        for (const chunk of chunks) {
            const promises = chunk.map(async (file) => {
                const result = await this.generateThumbnail(file, walletAddress, options);
                return { fileId: file.id, result };
            });

            const chunkResults = await Promise.allSettled(promises);

            chunkResults.forEach((promiseResult) => {
                if (promiseResult.status === 'fulfilled') {
                    results.set(promiseResult.value.fileId, promiseResult.value.result);
                } else {
                    // Handle rejected promises
                    console.error('Thumbnail generation failed:', promiseResult.reason);
                }
            });
        }

        return results;
    }

    /**
     * Checks if thumbnail generation is supported for the given MIME type
     */
    isSupported(mimeType: string): boolean {
        return this.SUPPORTED_TYPES.includes(mimeType.toLowerCase());
    }

    /**
     * Clears the thumbnail cache
     */
    clearCache(): void {
        // Revoke all blob URLs
        for (const [, cache] of this.thumbnailCache) {
            URL.revokeObjectURL(cache.url);
        }

        this.thumbnailCache.clear();
        this.currentCacheSize = 0;
    }

    /**
     * Gets cache statistics
     */
    getCacheStats(): { entries: number; size: number; maxSize: number } {
        return {
            entries: this.thumbnailCache.size,
            size: this.currentCacheSize,
            maxSize: this.MAX_CACHE_SIZE
        };
    }

    /**
     * Preloads thumbnails for a list of files
     */
    async preloadThumbnails(
        files: FileRecord[],
        walletAddress: string,
        options: ThumbnailOptions = {}
    ): Promise<void> {
        // Only preload supported file types
        const supportedFiles = files.filter(file => this.isSupported(file.mimeType));

        if (supportedFiles.length === 0) return;

        // Generate thumbnails in background
        this.generateMultipleThumbnails(supportedFiles, walletAddress, options)
            .catch(error => {
                console.warn('Thumbnail preloading failed:', error);
            });
    }

    // Private methods

    private async generateImageThumbnail(
        imageData: Uint8Array,
        mimeType: string,
        options: Required<ThumbnailOptions>
    ): Promise<string> {
        return new Promise((resolve, reject) => {
            const blob = new Blob([imageData], { type: mimeType });
            const img = new Image();

            img.onload = () => {
                try {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');

                    if (!ctx) {
                        throw new Error('Failed to get canvas context');
                    }

                    // Calculate dimensions maintaining aspect ratio
                    const { width, height } = this.calculateThumbnailDimensions(
                        img.width,
                        img.height,
                        options.width,
                        options.height
                    );

                    canvas.width = width;
                    canvas.height = height;

                    // Draw image on canvas
                    ctx.drawImage(img, 0, 0, width, height);

                    // Convert to blob
                    canvas.toBlob(
                        (blob) => {
                            if (blob) {
                                const thumbnailUrl = URL.createObjectURL(blob);
                                resolve(thumbnailUrl);
                            } else {
                                reject(new Error('Failed to create thumbnail blob'));
                            }
                        },
                        `image/${options.format}`,
                        options.quality
                    );
                } catch (error) {
                    reject(error);
                }
            };

            img.onerror = () => {
                reject(new Error('Failed to load image for thumbnail generation'));
            };

            img.src = URL.createObjectURL(blob);
        });
    }

    private async generatePdfThumbnail(
        pdfData: Uint8Array,
        options: Required<ThumbnailOptions>
    ): Promise<string> {
        // For PDF thumbnails, we'll create a placeholder for now
        // In a real implementation, you'd use PDF.js or similar library
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            if (!ctx) {
                throw new Error('Failed to get canvas context');
            }

            canvas.width = options.width;
            canvas.height = options.height;

            // Create a simple PDF placeholder
            ctx.fillStyle = '#f3f4f6';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = '#ef4444';
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('PDF', canvas.width / 2, canvas.height / 2);

            canvas.toBlob(
                (blob) => {
                    if (blob) {
                        const thumbnailUrl = URL.createObjectURL(blob);
                        resolve(thumbnailUrl);
                    } else {
                        throw new Error('Failed to create PDF thumbnail');
                    }
                },
                `image/${options.format}`,
                options.quality
            );
        });
    }

    private calculateThumbnailDimensions(
        originalWidth: number,
        originalHeight: number,
        maxWidth: number,
        maxHeight: number
    ): { width: number; height: number } {
        const aspectRatio = originalWidth / originalHeight;

        let width = maxWidth;
        let height = maxHeight;

        if (aspectRatio > 1) {
            // Landscape
            height = width / aspectRatio;
            if (height > maxHeight) {
                height = maxHeight;
                width = height * aspectRatio;
            }
        } else {
            // Portrait or square
            width = height * aspectRatio;
            if (width > maxWidth) {
                width = maxWidth;
                height = width / aspectRatio;
            }
        }

        return {
            width: Math.round(width),
            height: Math.round(height)
        };
    }

    private getCacheKey(rootHash: string, options: Required<ThumbnailOptions>): string {
        return `${rootHash}-${options.width}x${options.height}-${options.quality}-${options.format}`;
    }

    private getCachedThumbnail(cacheKey: string): ThumbnailCache | null {
        const cached = this.thumbnailCache.get(cacheKey);

        if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
            return cached;
        }

        if (cached) {
            // Remove expired cache entry
            URL.revokeObjectURL(cached.url);
            this.thumbnailCache.delete(cacheKey);
            this.currentCacheSize -= cached.size;
        }

        return null;
    }

    private cacheThumbnail(cacheKey: string, thumbnailUrl: string): void {
        // Estimate size (rough approximation)
        const estimatedSize = 10 * 1024; // 10KB average thumbnail size

        // Check if we need to free up space
        while (this.currentCacheSize + estimatedSize > this.MAX_CACHE_SIZE && this.thumbnailCache.size > 0) {
            const oldestKey = this.thumbnailCache.keys().next().value;
            const oldestCache = this.thumbnailCache.get(oldestKey);

            if (oldestCache) {
                URL.revokeObjectURL(oldestCache.url);
                this.currentCacheSize -= oldestCache.size;
            }

            this.thumbnailCache.delete(oldestKey);
        }

        // Add to cache
        this.thumbnailCache.set(cacheKey, {
            url: thumbnailUrl,
            timestamp: Date.now(),
            size: estimatedSize
        });

        this.currentCacheSize += estimatedSize;
    }

    private chunkArray<T>(array: T[], chunkSize: number): T[][] {
        const chunks: T[][] = [];
        for (let i = 0; i < array.length; i += chunkSize) {
            chunks.push(array.slice(i, i + chunkSize));
        }
        return chunks;
    }
}

// Export singleton instance
export const thumbnailService = new ThumbnailService();