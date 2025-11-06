const express = require('express');
const { Indexer } = require('@0glabs/0g-ts-sdk');
const { pool } = require('../lib/database');
const router = express.Router();

const NETWORKS = {
  mainnet: {
    storageRpc: process.env.MAINNET_INDEXER_RPC || 'https://indexer-storage.0g.ai',
    l1Rpc: process.env.MAINNET_RPC_URL || 'https://evmrpc.0g.ai/'
  }
};

/**
 * Download file by record ID
 * GET /api/download/:id
 */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        // Get record from database
        const client = await pool.connect();
        const result = await client.query('SELECT * FROM medical_records WHERE id = $1', [id]);
        client.release();
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Record not found' });
        }
        
        const record = result.rows[0];
        
        // For now, return a simple download response since we're using temp hashes
        res.json({
            success: true,
            record: {
                id: record.id,
                file_name: record.file_name,
                file_type: record.file_type,
                file_size: record.file_size,
                download_url: `data:${record.file_type};base64,${Buffer.from('Sample file content').toString('base64')}`
            }
        });
        
    } catch (error) {
        console.error('Download error:', error);
        res.status(500).json({ error: 'Download failed' });
    }
});

/**
 * Download file from 0G Storage
 * POST /api/download
 */
router.post('/', async (req, res) => {
    try {
        const { rootHash, networkType = 'standard' } = req.body;

        // Validate input
        if (!rootHash) {
            return res.status(400).json({
                error: 'Root hash is required'
            });
        }

        if (!NETWORKS[networkType]) {
            return res.status(400).json({
                error: 'Invalid network type. Must be "standard" or "turbo"'
            });
        }

        // Validate root hash format
        if (rootHash === 'unknown' || rootHash === 'undefined') {
            return res.status(400).json({
                error: 'Invalid root hash provided'
            });
        }

        // Ensure root hash has proper 0x prefix
        const formattedRootHash = rootHash.startsWith('0x') ? rootHash : `0x${rootHash}`;

        console.log('📥 Downloading file from 0G Storage:', {
            rootHash: formattedRootHash,
            networkType
        });

        // Get network configuration
        const networkConfig = NETWORKS[networkType];

        // Create indexer instance
        const indexer = new Indexer(networkConfig.storageRpc);

        // Download the file data
        const fileData = await indexer.download(formattedRootHash);

        if (!fileData) {
            return res.status(404).json({
                error: 'File not found in storage network'
            });
        }

        console.log('✅ File downloaded successfully:', {
            dataSize: fileData.length,
            rootHash: formattedRootHash
        });

        // Return the file data as base64 for JSON response
        const base64Data = Buffer.from(fileData).toString('base64');

        res.json({
            success: true,
            data: base64Data,
            size: fileData.length,
            rootHash: formattedRootHash,
            networkType
        });

    } catch (error) {
        console.error('❌ Download failed:', error);

        // Handle specific error types
        if (error.message && error.message.includes('not found')) {
            return res.status(404).json({
                error: 'File not found in 0G Storage',
                message: 'The specified root hash does not exist in the storage network'
            });
        }

        res.status(500).json({
            error: 'Download failed',
            message: error.message || 'Internal server error occurred during download'
        });
    }
});

/**
 * Download file as stream from 0G Storage
 * GET /api/download/stream/:rootHash
 */
router.get('/stream/:rootHash', async (req, res) => {
    try {
        const { rootHash } = req.params;
        const { filename = 'download' } = req.query;

        if (!rootHash || rootHash.startsWith('temp-hash-')) {
            return res.status(400).json({ error: 'Invalid or temporary hash' });
        }

        // Get record to determine network
        const client = await pool.connect();
        const { rows } = await client.query(
            'SELECT network FROM medical_records WHERE storage_hash = $1 LIMIT 1',
            [rootHash]
        );
        client.release();

        const network = rows.length > 0 ? rows[0].network : 'mainnet';
        const networkConfig = NETWORKS[network] || NETWORKS.mainnet;

        console.log('📥 Downloading from 0G Storage:', { rootHash, network, filename });

        const indexer = new Indexer(networkConfig.storageRpc);
        const fileData = await indexer.download(rootHash);

        if (!fileData) {
            return res.status(404).json({ error: 'File not found in 0G Storage' });
        }

        res.setHeader('Content-Type', 'application/octet-stream');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Length', fileData.length);
        res.send(Buffer.from(fileData));

        console.log('✅ File downloaded successfully:', filename);

    } catch (error) {
        console.error('❌ Download failed:', error);
        res.status(500).json({ error: 'Download failed', message: error.message });
    }
});

/**
 * Verify file exists in 0G Storage
 * GET /api/download/verify/:rootHash
 */
router.get('/verify/:rootHash', async (req, res) => {
    try {
        const { rootHash } = req.params;
        const { networkType = 'standard' } = req.query;

        // Validate input
        if (!rootHash || rootHash === 'unknown' || rootHash === 'undefined') {
            return res.status(400).json({
                error: 'Invalid root hash provided'
            });
        }

        if (!NETWORKS[networkType]) {
            return res.status(400).json({
                error: 'Invalid network type. Must be "standard" or "turbo"'
            });
        }

        // Ensure root hash has proper 0x prefix
        const formattedRootHash = rootHash.startsWith('0x') ? rootHash : `0x${rootHash}`;

        console.log('🔍 Verifying file existence:', {
            rootHash: formattedRootHash,
            networkType
        });

        // Get network configuration
        const networkConfig = NETWORKS[networkType];

        // Create indexer instance
        const indexer = new Indexer(networkConfig.storageRpc);

        try {
            // Try to get file info (lighter than full download)
            const fileInfo = await indexer.getFileInfo(formattedRootHash);
            const exists = !!fileInfo;

            console.log('✅ File existence verified:', {
                rootHash: formattedRootHash,
                exists,
                fileInfo: exists ? 'Found' : 'Not found'
            });

            res.json({
                exists,
                rootHash: formattedRootHash,
                networkType,
                fileInfo: exists ? fileInfo : null
            });
        } catch (error) {
            // If getFileInfo is not available, try a small download
            try {
                const fileData = await indexer.download(formattedRootHash);
                const exists = !!fileData;

                console.log('✅ File existence verified via download:', {
                    rootHash: formattedRootHash,
                    exists,
                    size: exists ? fileData.length : 0
                });

                res.json({
                    exists,
                    rootHash: formattedRootHash,
                    networkType,
                    size: exists ? fileData.length : 0
                });
            } catch (downloadError) {
                console.log('❌ File does not exist:', formattedRootHash);
                res.json({
                    exists: false,
                    rootHash: formattedRootHash,
                    networkType
                });
            }
        }

    } catch (error) {
        console.error('❌ Failed to verify file existence:', error);
        res.status(500).json({
            error: 'Verification failed',
            message: error.message || 'Internal server error occurred during verification'
        });
    }
});

/**
 * Get file metadata from 0G Storage
 * GET /api/download/metadata/:rootHash
 */
router.get('/metadata/:rootHash', async (req, res) => {
    try {
        const { rootHash } = req.params;
        const { networkType = 'standard' } = req.query;

        // Validate input
        if (!rootHash || rootHash === 'unknown' || rootHash === 'undefined') {
            return res.status(400).json({
                error: 'Invalid root hash provided'
            });
        }

        if (!NETWORKS[networkType]) {
            return res.status(400).json({
                error: 'Invalid network type. Must be "standard" or "turbo"'
            });
        }

        // Ensure root hash has proper 0x prefix
        const formattedRootHash = rootHash.startsWith('0x') ? rootHash : `0x${rootHash}`;

        console.log('📋 Getting file metadata:', {
            rootHash: formattedRootHash,
            networkType
        });

        // Get network configuration
        const networkConfig = NETWORKS[networkType];

        // Create indexer instance
        const indexer = new Indexer(networkConfig.storageRpc);

        try {
            // Try to get file info
            const fileInfo = await indexer.getFileInfo(formattedRootHash);

            if (!fileInfo) {
                return res.status(404).json({
                    error: 'File metadata not found'
                });
            }

            console.log('✅ File metadata retrieved:', {
                rootHash: formattedRootHash,
                fileInfo
            });

            res.json({
                success: true,
                rootHash: formattedRootHash,
                networkType,
                metadata: fileInfo
            });
        } catch (error) {
            // If getFileInfo is not available, return basic info
            console.log('⚠️ File metadata not available, checking existence only');

            try {
                const fileData = await indexer.download(formattedRootHash);

                res.json({
                    success: true,
                    rootHash: formattedRootHash,
                    networkType,
                    metadata: {
                        size: fileData.length,
                        exists: true,
                        note: 'Limited metadata available'
                    }
                });
            } catch (downloadError) {
                return res.status(404).json({
                    error: 'File not found'
                });
            }
        }

    } catch (error) {
        console.error('❌ Failed to get file metadata:', error);
        res.status(500).json({
            error: 'Metadata retrieval failed',
            message: error.message || 'Internal server error occurred during metadata retrieval'
        });
    }
});

module.exports = router;