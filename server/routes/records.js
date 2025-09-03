const express = require('express');
const { supabase } = require('../supabase');
const router = express.Router();

// Create medical record
router.post('/', async (req, res) => {
  try {
    const {
      user_id,
      title,
      description,
      category,
      file_type,
      file_size,
      zero_g_hash,
      merkle_root,
      transaction_hash,
      tags = []
    } = req.body;

    if (!user_id || !title || !category || !zero_g_hash) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const { data, error } = await supabase
      .from('medical_records')
      .insert({
        user_id,
        title,
        description,
        category,
        file_type,
        file_size,
        zero_g_hash,
        merkle_root,
        transaction_hash,
        tags,
        upload_status: 'completed'
      })
      .select()
      .single();

    if (error) throw error;

    res.json({ record: data });
  } catch (error) {
    console.error('Record creation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get user's medical records
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const { data, error } = await supabase
      .from('medical_records')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

    if (error) throw error;

    res.json({ records: data });
  } catch (error) {
    console.error('Records fetch error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update record upload status
router.put('/:recordId/status', async (req, res) => {
  try {
    const { recordId } = req.params;
    const { upload_status, transaction_hash, merkle_root } = req.body;

    const updateData = { upload_status };
    if (transaction_hash) updateData.transaction_hash = transaction_hash;
    if (merkle_root) updateData.merkle_root = merkle_root;

    const { data, error } = await supabase
      .from('medical_records')
      .update(updateData)
      .eq('id', recordId)
      .select()
      .single();

    if (error) throw error;

    res.json({ record: data });
  } catch (error) {
    console.error('Record update error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
