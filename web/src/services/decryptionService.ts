/**
 * Specialized Decryption Service for Medical Files
 * Provides secure key derivation and file decryption with progress tracking
 */

import { encryptionService, EncryptionMetadata } from '@/lib/encryption';

export interface DecryptionProgress {
    stage: 'validating' | 'deriving-key' | 'decrypting' | 'verifying' | 'complete' | 'error';
    progress: number; // 0-100
    message: string;
}

export interface DecryptionResult {
    success: boolean;
    data?: Uint8Array;
    originalFileName?: string;
    mimeType?: string;
    error?: Error;
    decryptionTime?: number;
}

export interface SecureKeyDerivationOptions {
    walletAddress: string;
    encryptionMetadata: EncryptionMetadata;
    onProgress?: (progress: DecryptionProgress) => void;
}

export class DecryptionService {
    private static readonly PROGRESS_STEPS = {
        VALIDATION: 10,
        KEY_DERIVATION: 30,
        DECRYPTION: 80,
        VERIFICATION: 95,
        COMPLETE: 100
    };

    /**
     * Decrypts encrypted file data with detailed progress tracking
     */
    async decryptFileData(
        encryptedData: ArrayBuffer,
        options: SecureKeyDerivationOptions
    ): Promise<DecryptionResult> {
        const startTime = Date.now();
        const { walletAddress, encryptionMetadata, onProgress } = options;

        try {
            // Stage 1: Validation
            onProgress?.({
                stage: 'validating',
                progress: DecryptionService.PROGRESS_STEPS.VALIDATION,
                message: 'Validating encryption parameters...'
            });

            await this.validateDecryptionInputs(walletAddress, encryptionMetadata, encryptedData);

            // Stage 2: Key Derivation
            onProgress?.({
                stage: 'deriving-key',
                progress: DecryptionService.PROGRESS_STEPS.KEY_DERIVATION,
                message: 'Deriving decryption key from wallet...'
            });

            // Add small delay to show progress
            await this.sleep(50);

            // Stage 3: Decryption
            onProgress?.({
                stage: 'decrypting',
                progress: DecryptionService.PROGRESS_STEPS.DECRYPTION,
                message: 'Decrypting file data...'
            });

            const decryptedFile = await encryptionService.decryptFile(
                encryptedData,
                encryptionMetadata,
                walletAddress
            );

            // Stage 4: Verification
            onProgress?.({
                stage: 'verifying',
                progress: DecryptionService.PROGRESS_STEPS.VERIFICATION,
                message: 'Verifying decrypted data...'
            });

            const decryptedData = new Uint8Array(await decryptedFile.arrayBuffer());
            await this.verifyDecryptedData(decryptedData, encryptionMetadata);

            // Stage 5: Complete
            onProgress?.({
                stage: 'complete',
                progress: DecryptionService.PROGRESS_STEPS.COMPLETE,
                message: 'Decryption completed successfully'
            });

            return {
                success: true,
                data: decryptedData,
                mimeType: encryptionMetadata.mimeType,
                decryptionTime: Date.now() - startTime
            };

        } catch (error) {
            const errorObj = error instanceof Error ? error : new Error(String(error));

            onProgress?.({
                stage: 'error',
                progress: 0,
                message: this.getDecryptionErrorMessage(errorObj)
            });

            return {
                success: false,
                error: errorObj,
                decryptionTime: Date.now() - startTime
            };
        }
    }

    /**
     * Batch decrypt multiple files with progress tracking
     */
    async decryptMultipleFiles(
        files: Array<{
            id: string;
            encryptedData: ArrayBuffer;
            encryptionMetadata: EncryptionMetadata;
            fileName: string;
        }>,
        walletAddress: string,
        onProgress?: (overall: DecryptionProgress & { fileId: string; fileName: string }) => void
    ): Promise<Map<string, DecryptionResult>> {
        const results = new Map<string, DecryptionResult>();
        let completedCount = 0;
        const totalFiles = files.length;

        for (const file of files) {
            const fileProgress = (progress: DecryptionProgress) => {
                const overallProgress = ((completedCount / totalFiles) * 100) +
                    (progress.progress / totalFiles);

                onProgress?.({
                    ...progress,
                    progress: Math.min(overallProgress, 100),
                    fileId: file.id,
                    fileName: file.fileName
                });
            };

            const result = await this.decryptFileData(file.encryptedData, {
                walletAddress,
                encryptionMetadata: file.encryptionMetadata,
                onProgress: fileProgress
            });

            results.set(file.id, result);
            completedCount++;
        }

        return results;
    }

    /**
     * Validates wallet address format
     */
    validateWalletAddress(walletAddress: string): boolean {
        if (!walletAddress || typeof walletAddress !== 'string') {
            return false;
        }

        // Basic Ethereum address validation
        const ethAddressRegex = /^0x[a-fA-F0-9]{40}$/;
        return ethAddressRegex.test(walletAddress);
    }

    /**
     * Checks if encryption metadata is valid
     */
    validateEncryptionMetadata(metadata: EncryptionMetadata): boolean {
        if (!metadata || typeof metadata !== 'object') {
            return false;
        }

        const requiredFields = ['salt', 'iv', 'authTag', 'algorithm', 'mimeType'];
        return requiredFields.every(field =>
            metadata[field as keyof EncryptionMetadata] &&
            typeof metadata[field as keyof EncryptionMetadata] === 'string'
        );
    }

    /**
     * Estimates decryption time based on file size
     */
    estimateDecryptionTime(fileSize: number): number {
        // Rough estimation: ~1MB per second on average hardware
        const mbSize = fileSize / (1024 * 1024);
        return Math.max(1000, mbSize * 1000); // Minimum 1 second
    }

    // Private helper methods

    private async validateDecryptionInputs(
        walletAddress: string,
        encryptionMetadata: EncryptionMetadata,
        encryptedData: ArrayBuffer
    ): Promise<void> {
        if (!this.validateWalletAddress(walletAddress)) {
            throw new Error('Invalid wallet address format');
        }

        if (!this.validateEncryptionMetadata(encryptionMetadata)) {
            throw new Error('Invalid or incomplete encryption metadata');
        }

        if (!encryptedData || encryptedData.byteLength === 0) {
            throw new Error('No encrypted data provided');
        }

        if (encryptionMetadata.algorithm !== 'AES-256-GCM') {
            throw new Error(`Unsupported encryption algorithm: ${encryptionMetadata.algorithm}`);
        }

        // Validate base64 encoded fields
        try {
            atob(encryptionMetadata.salt);
            atob(encryptionMetadata.iv);
            atob(encryptionMetadata.authTag);
        } catch {
            throw new Error('Invalid base64 encoding in encryption metadata');
        }
    }

    private async verifyDecryptedData(
        decryptedData: Uint8Array,
        encryptionMetadata: EncryptionMetadata
    ): Promise<void> {
        if (decryptedData.length === 0) {
            throw new Error('Decryption resulted in empty data');
        }

        // Verify original size if specified
        if (encryptionMetadata.originalSize &&
            decryptedData.length !== encryptionMetadata.originalSize) {
            throw new Error(
                `Decrypted data size (${decryptedData.length}) does not match expected size (${encryptionMetadata.originalSize})`
            );
        }

        // Basic file type validation based on MIME type
        if (encryptionMetadata.mimeType) {
            const isValidFileType = await this.validateFileType(decryptedData, encryptionMetadata.mimeType);
            if (!isValidFileType) {
                console.warn('Decrypted data may not match expected MIME type');
            }
        }
    }

    private async validateFileType(data: Uint8Array, expectedMimeType: string): Promise<boolean> {
        // Basic file signature validation
        const signatures: Record<string, number[][]> = {
            'application/pdf': [[0x25, 0x50, 0x44, 0x46]], // %PDF
            'image/jpeg': [[0xFF, 0xD8, 0xFF]], // JPEG
            'image/png': [[0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]], // PNG
            'image/gif': [[0x47, 0x49, 0x46, 0x38]], // GIF
        };

        const expectedSignatures = signatures[expectedMimeType];
        if (!expectedSignatures) {
            return true; // Can't validate unknown types
        }

        return expectedSignatures.some(signature =>
            signature.every((byte, index) =>
                index < data.length && data[index] === byte
            )
        );
    }

    private getDecryptionErrorMessage(error: Error): string {
        const message = error.message.toLowerCase();

        if (message.includes('invalid wallet address')) {
            return 'Invalid wallet address. Please ensure you are connected with the correct wallet.';
        }

        if (message.includes('metadata')) {
            return 'Invalid encryption metadata. The file may be corrupted.';
        }

        if (message.includes('key') || message.includes('decrypt')) {
            return 'Decryption failed. You may not have permission to access this file.';
        }

        if (message.includes('auth') || message.includes('tag')) {
            return 'File integrity check failed. The file may have been tampered with.';
        }

        if (message.includes('algorithm')) {
            return 'Unsupported encryption method. Please contact support.';
        }

        return error.message || 'An unknown decryption error occurred.';
    }

    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Export singleton instance
export const decryptionService = new DecryptionService();