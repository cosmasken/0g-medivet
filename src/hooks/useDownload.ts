import { useState, useCallback } from 'react';
import { useNetwork } from '@/providers/NetworkProvider';
import { downloadByRootHash, downloadByRootHashAPI, downloadBlobAsFile } from '@/lib/0g/downloader';
import { getNetworkConfig } from '@/lib/0g/network';
import { useWallet } from '@/hooks/useWallet';

/**
 * Custom hook for handling file downloads from 0G Storage
 * Manages the download process, status, and error handling
 */
export function useDownload() {
  const { networkType } = useNetwork();
  const { address } = useWallet();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [downloadStatus, setDownloadStatus] = useState('');

  // Download a file by root hash
  const downloadFile = useCallback(async (rootHash: string, fileName?: string) => {
    if (!rootHash) {
      setError('Root hash is required');
      return false;
    }
    
    setLoading(true);
    setError('');
    setDownloadStatus('Connecting to storage...');
    
    try {
      // 1. Get current network
      const network = getNetworkConfig(networkType);
      
      // 2. Download blob from storage using the direct API method
      setDownloadStatus('Downloading file...');
      let fileData, downloadErr;
      
      // Use the API-based download method
      [fileData, downloadErr] = await downloadByRootHashAPI(rootHash, network.storageRpc);
      
      // If API download fails, throw the error to be caught in the catch block
      if (downloadErr) {
        console.log(`API download failed: ${downloadErr.message}`);
        throw downloadErr; // Throw the actual error object to preserve the message
      }
      
      // If we got here but fileData is null, it's an unexpected error
      if (!fileData) {
        console.log('Download error: fileData is null but no error was reported');
        throw new Error('File data is null or empty');
      }
      
      // Add additional validation to ensure fileData is an ArrayBuffer
      if (!(fileData instanceof ArrayBuffer)) {
        console.log('Download error: fileData is not an ArrayBuffer');
        throw new Error(`Invalid file data type: ${typeof fileData}`);
      }
      
      if (fileData.byteLength === 0) {
        console.log('Download error: fileData is empty (zero length)');
        throw new Error('Downloaded file is empty');
      }
      
      // 3. Start download
      setDownloadStatus('Starting download...');
      const defaultFileName = `download-${rootHash.substring(0, 8)}.bin`;
      
      try {
        downloadBlobAsFile(fileData, fileName || defaultFileName);
      } catch (blobError) {
        console.log('Error in downloadBlobAsFile:', blobError);
        throw new Error(`Failed to create downloadable file: ${blobError instanceof Error ? blobError.message : String(blobError)}`);
      }
      
      setDownloadStatus('Download complete!');
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      setError(errorMessage);
      setDownloadStatus('');
      return false;
    } finally {
      setLoading(false);
    }
  }, [networkType]);

  return {
    loading,
    error,
    downloadStatus,
    downloadFile
  };
} 