/**
 * Unit tests for DownloadManager service
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { downloadManager, DownloadManager, FileRecord, DownloadOptions } from '../downloadManager';
import * as downloader from '@/lib/0g/downloader';
import { encryptionService } from '@/lib/encryption';

// Mock the 0G downloader
vi.mock('@/lib/0g/downloader', () => ({
    downloadFromStorage: vi.fn(),
    downloadFileAsBlob: vi.fn(),
    previewFile: vi.fn(),
    verifyFileExists: vi.fn()
}));

// Mock the encryption service
vi.mock('@/lib/encryption', () => ({
    encryptionService: {
        decryptFile: vi.fn()
    }
}));

describe('DownloadManager', () => {
    let manager: DownloadManager;

    beforeEach(() => {
        manager = new DownloadManager();
        vi.clearAllMocks();
    });

    afterEach(() => {
        manager.cancelAllDownloads();
        manager.clearCache();
    });

    describe('downloadFile', () => {
        it('should successfully download a file', async () => {
            const mockData = new Uint8Array([1, 2, 3, 4, 5]);
            const rootHash = '0x1234567890abcdef';
            const fileName = 'test.txt';

            vi.mocked(downloader.downloadFromStorage).mockResolvedValue([mockData, null]);

            const result = await manager.downloadFile(rootHash, fileName);

            expect(result.success).toBe(true);
            expect(result.data).toEqual(mockData);
            expect(result.metadata?.fileName).toBe(fileName);
            expect(result.metadata?.size).toBe(mockData.length);
        });

        it('should handle invalid root hash', async () => {
            const result = await manager.downloadFile('', 'test.txt');

            expect(result.success).toBe(false);
            expect(result.error?.message).toContain('Invalid root hash');
        });

        it('should handle short root hash', async () => {
            const result = await manager.downloadFile('0x123', 'test.txt');

            expect(result.success).toBe(false);
            expect(result.error?.message).toContain('too short');
        });

        it('should retry on network errors', async () => {
            const mockData = new Uint8Array([1, 2, 3]);
            const networkError = new Error('network timeout');

            vi.mocked(downloader.downloadFromStorage)
                .mockRejectedValueOnce(networkError)
                .mockRejectedValueOnce(networkError)
                .mockResolvedValue([mockData, null]);

            const result = await manager.downloadFile('0x1234567890abcdef', 'test.txt', {
                maxRetries: 3,
                retryDelay: 10 // Short delay for testing
            });

            expect(result.success).toBe(true);
            expect(result.data).toEqual(mockData);
            expect(downloader.downloadFromStorage).toHaveBeenCalledTimes(3);
        });

        it('should fail after max retries', async () => {
            const networkError = new Error('network timeout');

            vi.mocked(downloader.downloadFromStorage).mockRejectedValue(networkError);

            const result = await manager.downloadFile('0x1234567890abcdef', 'test.txt', {
                maxRetries: 2,
                retryDelay: 10
            });

            expect(result.success).toBe(false);
            expect(result.error?.message).toContain('network timeout');
            expect(downloader.downloadFromStorage).toHaveBeenCalledTimes(3); // Initial + 2 retries
        });

        it('should track progress during download', async () => {
            const mockData = new Uint8Array([1, 2, 3]);
            const progressUpdates: any[] = [];

            vi.mocked(downloader.downloadFromStorage).mockResolvedValue([mockData, null]);

            await manager.downloadFile('0x1234567890abcdef', 'test.txt', {
                onProgress: (progress) => progressUpdates.push(progress)
            });

            expect(progressUpdates.length).toBeGreaterThan(0);
            expect(progressUpdates[0].stage).toBe('validating');
            expect(progressUpdates[progressUpdates.length - 1].stage).toBe('complete');
        });

        it('should handle download cancellation', async () => {
            const abortController = new AbortController();

            // Mock a slow download
            vi.mocked(downloader.downloadFromStorage).mockImplementation(
                () => new Promise((resolve) => {
                    setTimeout(() => resolve([new Uint8Array([1, 2, 3]), null]), 1000);
                })
            );

            const downloadPromise = manager.downloadFile('0x1234567890abcdef', 'test.txt', {
                signal: abortController.signal
            });

            // Cancel after a short delay
            setTimeout(() => abortController.abort(), 50);

            const result = await downloadPromise;

            expect(result.success).toBe(false);
            expect(result.error?.message).toContain('cancelled');
        });

        it('should use cached files when available', async () => {
            const mockData = new Uint8Array([1, 2, 3]);
            const rootHash = '0x1234567890abcdef';

            vi.mocked(downloader.downloadFromStorage).mockResolvedValue([mockData, null]);

            // First download
            const result1 = await manager.downloadFile(rootHash, 'test.txt');
            expect(result1.success).toBe(true);

            // Second download should use cache
            const result2 = await manager.downloadFile(rootHash, 'test.txt');
            expect(result2.success).toBe(true);
            expect(result2.data).toEqual(mockData);

            // Should only call download once (first time)
            expect(downloader.downloadFromStorage).toHaveBeenCalledTimes(1);
        });
    });

    describe('downloadAndDecryptFile', () => {
        const mockFileRecord: FileRecord = {
            id: 'test-file-1',
            rootHash: '0x1234567890abcdef',
            fileName: 'encrypted-test.txt',
            mimeType: 'text/plain',
            fileSize: 1024,
            isEncrypted: true,
            encryptionMetadata: {
                salt: 'dGVzdC1zYWx0',
                iv: 'dGVzdC1pdg==',
                authTag: 'dGVzdC1hdXRoLXRhZw==',
                originalSize: 1024,
                mimeType: 'text/plain',
                algorithm: 'AES-256-GCM'
            },
            walletAddress: '0xabcdef1234567890'
        };

        it('should download and decrypt encrypted file', async () => {
            const encryptedData = new Uint8Array([10, 20, 30, 40]);
            const decryptedData = new Uint8Array([1, 2, 3, 4]);
            const mockDecryptedFile = new File([decryptedData], 'test.txt', { type: 'text/plain' });

            vi.mocked(downloader.downloadFromStorage).mockResolvedValue([encryptedData, null]);
            vi.mocked(encryptionService.decryptFile).mockResolvedValue(mockDecryptedFile);

            const result = await manager.downloadAndDecryptFile(
                mockFileRecord,
                '0xabcdef1234567890'
            );

            expect(result.success).toBe(true);
            expect(result.data).toEqual(decryptedData);
            expect(encryptionService.decryptFile).toHaveBeenCalledWith(
                encryptedData.buffer,
                mockFileRecord.encryptionMetadata,
                '0xabcdef1234567890'
            );
        });

        it('should handle unencrypted files', async () => {
            const unencryptedFile: FileRecord = {
                ...mockFileRecord,
                isEncrypted: false,
                encryptionMetadata: undefined
            };

            const fileData = new Uint8Array([1, 2, 3, 4]);
            vi.mocked(downloader.downloadFromStorage).mockResolvedValue([fileData, null]);

            const result = await manager.downloadAndDecryptFile(
                unencryptedFile,
                '0xabcdef1234567890'
            );

            expect(result.success).toBe(true);
            expect(result.data).toEqual(fileData);
            expect(encryptionService.decryptFile).not.toHaveBeenCalled();
        });

        it('should handle decryption errors', async () => {
            const encryptedData = new Uint8Array([10, 20, 30, 40]);
            const decryptionError = new Error('Invalid key');

            vi.mocked(downloader.downloadFromStorage).mockResolvedValue([encryptedData, null]);
            vi.mocked(encryptionService.decryptFile).mockRejectedValue(decryptionError);

            const result = await manager.downloadAndDecryptFile(
                mockFileRecord,
                '0xabcdef1234567890'
            );

            expect(result.success).toBe(false);
            expect(result.error?.message).toContain('Decryption failed');
        });

        it('should track progress during decryption', async () => {
            const encryptedData = new Uint8Array([10, 20, 30, 40]);
            const decryptedData = new Uint8Array([1, 2, 3, 4]);
            const mockDecryptedFile = new File([decryptedData], 'test.txt', { type: 'text/plain' });
            const progressUpdates: any[] = [];

            vi.mocked(downloader.downloadFromStorage).mockResolvedValue([encryptedData, null]);
            vi.mocked(encryptionService.decryptFile).mockResolvedValue(mockDecryptedFile);

            await manager.downloadAndDecryptFile(
                mockFileRecord,
                '0xabcdef1234567890',
                {
                    onProgress: (progress) => progressUpdates.push(progress)
                }
            );

            const decryptingUpdate = progressUpdates.find(p => p.stage === 'decrypting');
            expect(decryptingUpdate).toBeDefined();
            expect(decryptingUpdate.message).toContain('Decrypting');
        });
    });

    describe('downloadMultipleFiles', () => {
        const mockFiles: FileRecord[] = [
            {
                id: 'file-1',
                rootHash: '0x1111111111111111',
                fileName: 'file1.txt',
                mimeType: 'text/plain',
                fileSize: 100,
                isEncrypted: false
            },
            {
                id: 'file-2',
                rootHash: '0x2222222222222222',
                fileName: 'file2.txt',
                mimeType: 'text/plain',
                fileSize: 200,
                isEncrypted: false
            }
        ];

        it('should download multiple files successfully', async () => {
            const mockData1 = new Uint8Array([1, 2, 3]);
            const mockData2 = new Uint8Array([4, 5, 6]);

            vi.mocked(downloader.downloadFromStorage)
                .mockResolvedValueOnce([mockData1, null])
                .mockResolvedValueOnce([mockData2, null]);

            const result = await manager.downloadMultipleFiles(mockFiles, '0xwallet');

            expect(result.success).toBe(true);
            expect(result.totalFiles).toBe(2);
            expect(result.successCount).toBe(2);
            expect(result.failureCount).toBe(0);
            expect(result.results.size).toBe(2);
        });

        it('should handle partial failures', async () => {
            const mockData1 = new Uint8Array([1, 2, 3]);
            const error = new Error('Download failed');

            vi.mocked(downloader.downloadFromStorage)
                .mockResolvedValueOnce([mockData1, null])
                .mockRejectedValueOnce(error);

            const result = await manager.downloadMultipleFiles(mockFiles, '0xwallet');

            expect(result.success).toBe(false);
            expect(result.totalFiles).toBe(2);
            expect(result.successCount).toBe(1);
            expect(result.failureCount).toBe(1);
        });

        it('should track overall progress', async () => {
            const progressUpdates: any[] = [];

            vi.mocked(downloader.downloadFromStorage)
                .mockResolvedValue([new Uint8Array([1, 2, 3]), null]);

            await manager.downloadMultipleFiles(mockFiles, '0xwallet', {
                onProgress: (progress) => progressUpdates.push(progress)
            });

            expect(progressUpdates.length).toBeGreaterThan(0);
            // Should have progress updates for both files
            const fileMessages = progressUpdates.filter(p => p.message.includes('('));
            expect(fileMessages.length).toBeGreaterThan(0);
        });
    });

    describe('createDownloadUrl', () => {
        it('should create blob URL for download', async () => {
            const mockData = new Uint8Array([1, 2, 3, 4]);
            const rootHash = '0x1234567890abcdef';
            const fileName = 'test.txt';
            const mimeType = 'text/plain';

            vi.mocked(downloader.downloadFromStorage).mockResolvedValue([mockData, null]);

            // Mock URL.createObjectURL
            const mockBlobUrl = 'blob:http://localhost/test-blob-url';
            global.URL.createObjectURL = vi.fn().mockReturnValue(mockBlobUrl);

            const result = await manager.createDownloadUrl(rootHash, fileName, mimeType);

            expect(result.success).toBe(true);
            expect(result.blobUrl).toBe(mockBlobUrl);
            expect(result.metadata?.mimeType).toBe(mimeType);
        });

        it('should handle download failure', async () => {
            const error = new Error('Download failed');
            vi.mocked(downloader.downloadFromStorage).mockRejectedValue(error);

            const result = await manager.createDownloadUrl('0x1234567890abcdef', 'test.txt');

            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();
        });
    });

    describe('cache management', () => {
        it('should clear cache', () => {
            manager.clearCache();
            const stats = manager.getCacheStats();
            expect(stats.entries).toBe(0);
            expect(stats.size).toBe(0);
        });

        it('should provide cache statistics', async () => {
            const mockData = new Uint8Array([1, 2, 3, 4, 5]);
            vi.mocked(downloader.downloadFromStorage).mockResolvedValue([mockData, null]);

            await manager.downloadFile('0x1234567890abcdef', 'test.txt');

            const stats = manager.getCacheStats();
            expect(stats.entries).toBe(1);
            expect(stats.size).toBe(mockData.length);
        });
    });

    describe('download cancellation', () => {
        it('should cancel all downloads', () => {
            manager.cancelAllDownloads();
            // Should not throw any errors
            expect(true).toBe(true);
        });
    });
});