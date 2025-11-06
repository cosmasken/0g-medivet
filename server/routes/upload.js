const express = require('express');
const multer = require('multer');
const { Indexer, ZgFile } = require('@0glabs/0g-ts-sdk');
const { ethers } = require('ethers');
const { pool } = require('../lib/database');
const fs = require('fs').promises;
const path = require('path');
const os = require('os');
const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }
});

const NETWORKS = {
  mainnet: {
    l1Rpc: process.env.MAINNET_RPC_URL || 'https://evmrpc.0g.ai/',
    storageRpc: process.env.MAINNET_INDEXER_RPC || 'https://indexer-storage-turbo.0g.ai'
  },
  testnet: {
    l1Rpc: process.env.TESTNET_RPC_URL || 'https://evmrpc-testnet.0g.ai/',
    storageRpc: process.env.TESTNET_INDEXER_RPC || 'https://indexer-storage-testnet-turbo.0g.ai'
  }
};

async function uploadTo0G(file, network = 'mainnet') {
  const config = NETWORKS[network];
  const provider = new ethers.JsonRpcProvider(config.l1Rpc);
  const signer = new ethers.Wallet(process.env.ZG_PRIVATE_KEY, provider);
  const indexer = new Indexer(config.storageRpc);

  console.log('☁️ Starting storage upload to 0G:', {
    storageRpc: config.storageRpc,
    l1Rpc: config.l1Rpc,
    fileSize: file.size,
    network
  });

  const tempDir = path.join(os.tmpdir(), 'medvet-uploads');
  await fs.mkdir(tempDir, { recursive: true });
  const tempFilePath = path.join(tempDir, file.originalname);

  let zgFile;
  try {
    await fs.writeFile(tempFilePath, file.buffer);
    zgFile = await ZgFile.fromFilePath(tempFilePath);

    const [tree, err] = await zgFile.merkleTree();
    if (err) {
      throw new Error('Failed to create merkle tree');
    }
    const rootHash = tree.rootHash();
    console.log('✅ Merkle tree created, root hash:', rootHash);

    const [tx, uploadErr] = await indexer.upload(zgFile, {
      signer,
      rpcUrl: config.l1Rpc,
    });

    if (uploadErr) {
      console.error(`❌ ${network} upload failed:`, uploadErr);
      throw new Error(`0G Storage upload failed on ${network}`);
    }

    console.log(`✅ ${network} upload successful, tx:`, tx);
    return rootHash;
  } finally {
    if (zgFile) {
      await zgFile.close();
    }
    try {
      await fs.unlink(tempFilePath);
    } catch (e) {
      console.error(`Failed to delete temp file: ${tempFilePath}`, e);
    }
  }
}

router.post('/', upload.single('file'), async (req, res) => {
  try {
    const { user_id } = req.body;
    const file = req.file;

    if (!file || !user_id) {
      return res.status(400).json({ error: 'File and user ID required' });
    }

    console.log('📤 Uploading to 0G Storage:', file.originalname);

    let storageHash, network;
    
    // Try mainnet first
    try {
      storageHash = await uploadTo0G(file, 'mainnet');
      network = 'mainnet';
      console.log('✅ Mainnet upload successful:', storageHash);
    } catch (mainnetError) {
      console.warn('⚠️ Mainnet failed, trying testnet:', mainnetError.message);
      
      // Fallback to testnet
      try {
        storageHash = await uploadTo0G(file, 'testnet');
        network = 'testnet';
        console.log('✅ Testnet upload successful:', storageHash);
      } catch (testnetError) {
        console.error('❌ Both networks failed:', testnetError.message);
        throw new Error('0G Storage upload failed on both mainnet and testnet');
      }
    }

    // Save to database
    const client = await pool.connect();
    try {
      let userUuid = user_id;
      if (user_id.startsWith('0x')) {
        const { rows } = await client.query(
          'SELECT id FROM users WHERE wallet_address = $1',
          [user_id.toLowerCase()]
        );
        if (rows.length === 0) {
          return res.status(404).json({ error: 'User not found' });
        }
        userUuid = rows[0].id;
      }

      const { rows } = await client.query(
        'INSERT INTO medical_records (user_id, file_name, file_type, file_size, storage_hash, network) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [userUuid, file.originalname, file.mimetype, file.size, storageHash, network]
      );

      res.json({
        success: true,
        record: rows[0],
        storage_hash: storageHash,
        network
      });
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('❌ Upload failed:', error);
    res.status(500).json({ error: 'Upload failed', message: error.message });
  }
});

module.exports = router;
