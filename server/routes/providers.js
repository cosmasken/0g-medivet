const express = require('express');
const { supabase } = require('../supabase');
const router = express.Router();

// Provider permissions
router.post('/permissions', async (req, res) => {
  try {
    const { patient_id, provider_id, record_id, permission_level, expires_at } = req.body;
    
    const { data, error } = await supabase
      .from('provider_permissions')
      .insert({ patient_id, provider_id, record_id, permission_level, expires_at })
      .select()
      .single();

    if (error) throw error;
    res.json({ permission: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/permissions/patient/:patientId', async (req, res) => {
  try {
    const { patientId } = req.params;
    
    const { data, error } = await supabase
      .from('provider_permissions')
      .select(`
        *,
        provider:provider_id(wallet_address, user_profiles(*)),
        record:record_id(title, category)
      `)
      .eq('patient_id', patientId)
      .eq('is_active', true);

    if (error) throw error;
    res.json({ permissions: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/permissions/provider/:providerId', async (req, res) => {
  try {
    const { providerId } = req.params;
    
    const { data, error } = await supabase
      .from('provider_permissions')
      .select(`
        *,
        patient:patient_id(wallet_address, user_profiles(*)),
        record:record_id(*)
      `)
      .eq('provider_id', providerId)
      .eq('is_active', true);

    if (error) throw error;
    res.json({ permissions: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Monetization
router.post('/monetization', async (req, res) => {
  try {
    const { patient_id, record_id, price_eth, anonymized_data } = req.body;
    
    const { data, error } = await supabase
      .from('monetization_records')
      .insert({ patient_id, record_id, price_eth, anonymized_data, is_listed: true })
      .select()
      .single();

    if (error) throw error;
    res.json({ monetization_record: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/monetization/patient/:patientId', async (req, res) => {
  try {
    const { patientId } = req.params;
    
    const { data, error } = await supabase
      .from('monetization_records')
      .select(`
        *,
        record:record_id(title, category, created_at)
      `)
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ monetization_records: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/marketplace', async (req, res) => {
  try {
    const { category, limit = 50, offset = 0 } = req.query;
    
    let query = supabase
      .from('monetization_records')
      .select(`
        *,
        record:record_id(title, category, file_type, created_at)
      `)
      .eq('is_listed', true)
      .order('created_at', { ascending: false })
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);
    
    if (category) {
      query = query.eq('record.category', category);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    
    res.json({ marketplace_records: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Transactions
router.post('/transactions', async (req, res) => {
  try {
    const { buyer_id, seller_id, record_id, monetization_record_id, amount_eth, transaction_hash } = req.body;
    
    const { data, error } = await supabase
      .from('marketplace_transactions')
      .insert({ buyer_id, seller_id, record_id, monetization_record_id, amount_eth, transaction_hash })
      .select()
      .single();

    if (error) throw error;
    res.json({ transaction: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
