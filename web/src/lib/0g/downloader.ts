import { Indexer } from '@0glabs/0g-ts-sdk';
import { getNetworkConfig, NetworkType } from './network';

/**
 * Downloads a file from 0G storage using root hash
 * @param rootHash The root hash of the file to download
 * @param networkType The network type to use for download
 * @returns A promise that resolves to the file data as Uint8Array and any error
 */
export async function downloadFromStorage(
    rootHash: string,
    networkType: NetworkType = 'standard'
): Promise<[Uint8Array | null, Error | null]> {
    try {
        console.log('📥 Starting download from 0G Storage:', {
            rootHash,
            networkType
        });

        // Validate root hash format
        if (!rootHash || rootHash === 'unknown' || rootHash === 'undefined') {
            throw new Error('Invalid root hash provided');
        }

        // Ensure root hash has proper 0x prefix
        const formattedRootHash = rootHash.startsWith('0x') ? rootHash : `0x${rootHash}`;

        // Get network configuration
        const networkConfig = getNetworkConfig(networkType);

        // Create indexer instance
        const indexer = new Indexer(networkConfig.storageRpc);

        console.log('🔍 Downloading file with hash:', formattedRootHash);

        // Download the file data
        const fileData = await indexer.download(formattedRootHash);

        if (!fileData) {
            throw new Error('No data received from storage network');
        }

        console.log('✅ File downloaded successfully:', {
            dataSize: fileData.length,
            rootHash: formattedRootHash
        });

        return [fileData, null];
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('❌ Download failed:', {
            error: errorMessage,
            rootHash,
            networkType
        });

        return [null, error instanceof Error ? error : new Error(String(error))];
    }
}

/**
 * Downloads a file and creates a downloadable blob URL
 * @param rootHash The root hash of the file to download
 * @param fileName The original file name for download
 * @param mimeType The MIME type of the file
 * @param networkType The network type to use for download
 * @returns A promise that resolves to the blob URL and any error
 */
export async function downloadFileAsBlob(
    rootHash: string,
    fileName: string,
    mimeType: string = 'application/octet-stream',
    networkType: NetworkType = 'standard'
): Promise<[string | null, Error | null]> {
    try {
        const [fileData, error] = await downloadFromStorage(rootHash, networkType);

        if (error || !fileData) {
            return [null, error || new Error('Failed to download file data')];
        }

        // Create blob from the downloaded data
        const blob = new Blob([fileData], { type: mimeType });

        // Create object URL for download
        const blobUrl = URL.createObjectURL(blob);

        console.log('📎 Created blob URL for download:', {
            fileName,
            mimeType,
            blobSize: blob.size,
            blobUrl: blobUrl.substring(0, 50) + '...'
        });

        return [blobUrl, null];
    } catch (error) {
        console.error('❌ Failed to create blob URL:', error);
        return [null, error instanceof Error ? error : new Error(String(error))];
    }
}

/**
 * Triggers a file download in the browser
 * @param rootHash The root hash of the file to download
 * @param fileName The original file name for download
 * @param mimeType The MIME type of the file
 * @param networkType The network type to use for download
 * @returns A promise that resolves to success status and any error
 */
export async function triggerFileDownload(
    rootHash: string,
    fileName: string,
    mimeType: string = 'application/octet-stream',
    networkType: NetworkType = 'standard'
): Promise<[boolean, Error | null]> {
    try {
        const [blobUrl, error] = await downloadFileAsBlob(rootHash, fileName, mimeType, networkType);

        if (error || !blobUrl) {
            return [false, error || new Error('Failed to create download URL')];
        }

        // Create temporary download link
        const downloadLink = document.createElement('a');
        downloadLink.href = blobUrl;
        downloadLink.download = fileName;
        downloadLink.style.display = 'none';

        // Add to DOM, click, and remove
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);

        // Clean up the blob URL after a short delay
        setTimeout(() => {
            URL.revokeObjectURL(blobUrl);
        }, 1000);

        console.log('✅ File download triggered successfully:', fileName);
        return [true, null];
    } catch (error) {
        console.error('❌ Failed to trigger download:', error);
        return [false, error instanceof Error ? error : new Error(String(error))];
    }
}

/**
 * Downloads and previews a file (for images, PDFs, etc.)
 * @param rootHash The root hash of the file to download
 * @param mimeType The MIME type of the file
 * @param networkType The network type to use for download
 * @returns A promise that resolves to the blob URL for preview and any error
 */
export async function previewFile(
    rootHash: string,
    mimeType: string,
    networkType: NetworkType = 'standard'
): Promise<[string | null, Error | null]> {
    try {
        // Check if file type is previewable
        const previewableTypes = [
            'image/',
            'application/pdf',
            'text/',
            'application/json'
        ];

        const isPreviewable = previewableTypes.some(type => mimeType.startsWith(type));

        if (!isPreviewable) {
            return [null, new Error('File type not previewable')];
        }

        const [blobUrl, error] = await downloadFileAsBlob(rootHash, 'preview', mimeType, networkType);

        if (error || !blobUrl) {
            return [null, error || new Error('Failed to create preview URL')];
        }

        console.log('👁️ File preview URL created:', {
            mimeType,
            rootHash: rootHash.substring(0, 10) + '...',
            previewUrl: blobUrl.substring(0, 50) + '...'
        });

        return [blobUrl, null];
    } catch (error) {
        console.error('❌ Failed to create preview:', error);
        return [null, error instanceof Error ? error : new Error(String(error))];
    }
}

/**
 * Verifies if a file exists in 0G storage
 * @param rootHash The root hash to verify
 * @param networkType The network type to use for verification
 * @returns A promise that resolves to existence status and any error
 */
export async function verifyFileExists(
    rootHash: string,
    networkType: NetworkType = 'standard'
): Promise<[boolean, Error | null]> {
    try {
        console.log('🔍 Verifying file existence:', rootHash);

        const networkConfig = getNetworkConfig(networkType);
        const indexer = new Indexer(networkConfig.storageRpc);

        // Ensure root hash has proper 0x prefix
        const formattedRootHash = rootHash.startsWith('0x') ? rootHash : `0x${rootHash}`;

        // Try to get file info (this is lighter than full download)
        try {
            const fileInfo = await indexer.getFileInfo(formattedRootHash);
            const exists = !!fileInfo;

            console.log('✅ File existence verified:', {
                rootHash: formattedRootHash,
                exists,
                fileInfo: exists ? 'Found' : 'Not found'
            });

            return [exists, null];
        } catch (error) {
            // If getFileInfo is not available, try a small download
            try {
                const [data] = await downloadFromStorage(rootHash, networkType);
                const exists = !!data;

                console.log('✅ File existence verified via download:', {
                    rootHash: formattedRootHash,
                    exists
                });

                return [exists, null];
            } catch (downloadError) {
                console.log('❌ File does not exist:', formattedRootHash);
                return [false, null]; // File doesn't exist, not an error
            }
        }
    } catch (error) {
        console.error('❌ Failed to verify file existence:', error);
        return [false, error instanceof Error ? error : new Error(String(error))];
    }
}