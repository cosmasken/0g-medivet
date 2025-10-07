const express = require('express');
const { supabase } = require('../supabase');
const router = express.Router();

// Provider-patient relationship management for automatic access
router.post('/patient-relationships', async (req, res) => {
  try {
    const { 
      provider_id, 
      patient_id, 
      relationship_type = 'treated', 
      notes = '',
      specialty,  // Provider's specialty for the relationship
      start_date = new Date().toISOString().split('T')[0]  // When the relationship began
    } = req.body;
    
    // First, verify that both provider and patient exist in the system
    const { data: provider, error: providerError } = await supabase
      .from('users')
      .select('*')
      .eq('id', provider_id)
      .eq('role', 'provider')
      .single();
    
    if (providerError) {
      return res.status(404).json({ error: 'Provider not found' });
    }
    
    const { data: patient, error: patientError } = await supabase
      .from('users')
      .select('*')
      .eq('id', patient_id)
      .eq('role', 'patient')
      .single();
    
    if (patientError) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    
    // Validate specialty if provided
    const validSpecialties = [
      'cardiology', 'oncology', 'neurology', 'orthopedics', 'pediatrics', 
      'dermatology', 'endocrinology', 'gastroenterology', 'hematology',
      'infectious_disease', 'nephrology', 'pulmonology', 'psychiatry',
      'radiology', 'surgery', 'urology', 'general_practice', 'emergency'
    ];
    if (specialty && !validSpecialties.includes(specialty)) {
      return res.status(400).json({ error: 'Invalid specialty. Must be one of: ' + validSpecialties.join(', ') });
    }
    
    // Check if relationship already exists
    const { data: existing, error: checkError } = await supabase
      .from('provider_patient_relations')
      .select('*')
      .eq('provider_id', provider_id)
      .eq('patient_id', patient_id)
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 means no rows returned
      throw checkError;
    }
    
    let data, error;
    if (existing) {
      // Update existing relationship
      ({ data, error } = await supabase
        .from('provider_patient_relations')
        .update({ 
          relationship_type, 
          notes,
          specialty,
          start_date,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id)
        .select()
        .single());
    } else {
      // Create new relationship
      ({ data, error } = await supabase
        .from('provider_patient_relations')
        .insert({ 
          provider_id, 
          patient_id, 
          relationship_type, 
          notes,
          specialty,
          start_date
        })
        .select()
        .single());
    }

    if (error) throw error;
    res.json({ relationship: data });
  } catch (error) {
    console.error('Error managing provider-patient relationship:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get provider-patient relationships
router.get('/patient-relationships/:providerId', async (req, res) => {
  try {
    const { providerId } = req.params;
    
    const { data, error } = await supabase
      .from('provider_patient_relations')
      .select(`
        *,
        patient:patient_id(wallet_address, user_profiles(*))
      `)
      .eq('provider_id', providerId);

    if (error) throw error;
    res.json({ relationships: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get patient records for a provider with advanced filtering by specialty
router.get('/patient-records/:providerId', async (req, res) => {
  try {
    const { providerId } = req.params;
    const { 
      patient_id,
      category,
      specialty,
      priority_level,
      tags, // comma-separated tags
      search, // search term for title/description
      date_from,
      date_to,
      limit = 50,
      offset = 0
    } = req.query;
    
    // Verify that the provider exists
    const { data: provider, error: providerError } = await supabase
      .from('users')
      .select('id')
      .eq('id', providerId)
      .eq('role', 'provider')
      .single();
    
    if (providerError || !provider) {
      return res.status(404).json({ error: 'Provider not found' });
    }
    
    // Validate and sanitize parameters
    const limitInt = parseInt(limit);
    const offsetInt = parseInt(offset);
    
    if (isNaN(limitInt) || limitInt <= 0 || limitInt > 1000) {
      return res.status(400).json({ error: 'Invalid limit parameter (1-1000)' });
    }
    
    if (isNaN(offsetInt) || offsetInt < 0) {
      return res.status(400).json({ error: 'Invalid offset parameter' });
    }
    
    // Get the provider's patients from relationships
    let patientQuery = supabase
      .from('provider_patient_relations')
      .select('patient_id')
      .eq('provider_id', providerId);
    
    if (patient_id) {
      patientQuery = patientQuery.eq('patient_id', patient_id);
    }
    
    const { data: patientRelations, error: relationsError } = await patientQuery;
    
    if (relationsError) {
      console.error('Error fetching patient relations:', relationsError);
      throw relationsError;
    }
    
    if (!patientRelations || patientRelations.length === 0) {
      return res.json({ records: [], count: 0 });
    }
    
    // Extract patient IDs
    const patientIds = patientRelations.map(rel => rel.patient_id);
    
    // Get records for these patients
    let recordsQuery = supabase
      .from('medical_records')
      .select('*', { count: 'exact' }) // Get count for pagination info
      .in('user_id', patientIds);
    
    // Apply filters
    if (category) {
      recordsQuery = recordsQuery.ilike('category', `%${category}%`);
    }
    
    if (specialty) {
      recordsQuery = recordsQuery.ilike('specialty', `%${specialty}%`);
    }
    
    if (priority_level) {
      recordsQuery = recordsQuery.eq('priority_level', priority_level);
    }
    
    if (date_from) {
      recordsQuery = recordsQuery.gte('created_at', date_from);
    }
    
    if (date_to) {
      recordsQuery = recordsQuery.lte('created_at', date_to);
    }
    
    // Handle tags filter
    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim());
      for (const tag of tagArray) {
        recordsQuery = recordsQuery.contains('tags', [tag]);
      }
    }
    
    // Handle search term
    if (search) {
      recordsQuery = recordsQuery.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }
    
    // Only get latest versions
    recordsQuery = recordsQuery.eq('is_latest_version', true);
    
    recordsQuery = recordsQuery
      .order('created_at', { ascending: false })
      .range(offsetInt, offsetInt + limitInt - 1);
    
    const { data: records, count, error: recordsError } = await recordsQuery;
    
    if (recordsError) {
      console.error('Error fetching provider records:', recordsError);
      throw recordsError;
    }
    
    res.json({ 
      records, 
      count,
      pagination: {
        limit: limitInt,
        offset: offsetInt,
        total: count
      }
    });
  } catch (error) {
    console.error('Provider records fetch error:', error);
    res.status(500).json({ error: 'Internal server error occurred during provider records fetch' });
  }
});

// Provider permissions - updated to support auto-access model
router.post('/permissions', async (req, res) => {
  try {
    const { patient_id, provider_id, record_id, permission_level, expires_at } = req.body;
    
    // Validate required fields
    if (!patient_id || typeof patient_id !== 'string' || patient_id.length > 100) {
      return res.status(400).json({ error: 'Valid patient_id is required (string, max 100 chars)' });
    }
    
    if (!provider_id || typeof provider_id !== 'string' || provider_id.length > 100) {
      return res.status(400).json({ error: 'Valid provider_id is required (string, max 100 chars)' });
    }
    
    if (!record_id || typeof record_id !== 'string' || record_id.length > 100) {
      return res.status(400).json({ error: 'Valid record_id is required (string, max 100 chars)' });
    }
    
    // Validate permission level
    const validPermissionLevels = ['view', 'edit'];
    if (!permission_level || !validPermissionLevels.includes(permission_level)) {
      return res.status(400).json({ error: `Permission level must be one of: ${validPermissionLevels.join(', ')}` });
    }
    
    // Validate optional fields
    if (expires_at && (typeof expires_at !== 'string' || !/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?(Z|[+-]\d{2}:\d{2}))?$/.test(expires_at))) {
      return res.status(400).json({ error: 'Expires at must be a valid date string' });
    }
    
    // Sanitize inputs
    const sanitizedInputs = {
      patient_id,
      provider_id,
      record_id,
      permission_level,
      expires_at: expires_at || null
    };
    
    const { data, error } = await supabase
      .from('provider_permissions')
      .insert(sanitizedInputs)
      .select()
      .single();

    if (error) throw error;
    res.json({ permission: data });
  } catch (error) {
    console.error('Provider permissions creation failed:', error);
    res.status(500).json({ error: 'Internal server error occurred during provider permissions creation' });
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
    
    // Validate required fields
    if (!patient_id || typeof patient_id !== 'string' || patient_id.length > 100) {
      return res.status(400).json({ error: 'Valid patient_id is required (string, max 100 chars)' });
    }
    
    if (!record_id || typeof record_id !== 'string' || record_id.length > 100) {
      return res.status(400).json({ error: 'Valid record_id is required (string, max 100 chars)' });
    }
    
    // Validate price
    const parsedPrice = parseFloat(price_eth);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      return res.status(400).json({ error: 'Valid price_eth is required (positive number)' });
    }
    
    // Validate anonymized_data is an object
    if (!anonymized_data || typeof anonymized_data !== 'object') {
      return res.status(400).json({ error: 'anonymized_data must be an object' });
    }
    
    // Limit the size of anonymized_data to prevent abuse
    const anonymizedDataStr = JSON.stringify(anonymized_data);
    if (anonymizedDataStr.length > 1000000) { // 1MB limit
      return res.status(400).json({ error: 'anonymized_data too large. Maximum 1MB allowed' });
    }
    
    // Sanitize inputs
    const sanitizedInputs = {
      patient_id,
      record_id,
      price_eth: parsedPrice,
      anonymized_data,
      is_listed: true
    };
    
    const { data, error } = await supabase
      .from('monetization_records')
      .insert(sanitizedInputs)
      .select()
      .single();

    if (error) throw error;
    res.json({ monetization_record: data });
  } catch (error) {
    console.error('Monetization record creation failed:', error);
    res.status(500).json({ error: 'Internal server error occurred during monetization record creation' });
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
    
    // Validate required fields
    if (!buyer_id || typeof buyer_id !== 'string' || buyer_id.length > 100) {
      return res.status(400).json({ error: 'Valid buyer_id is required (string, max 100 chars)' });
    }
    
    if (!seller_id || typeof seller_id !== 'string' || seller_id.length > 100) {
      return res.status(400).json({ error: 'Valid seller_id is required (string, max 100 chars)' });
    }
    
    if (!record_id || typeof record_id !== 'string' || record_id.length > 100) {
      return res.status(400).json({ error: 'Valid record_id is required (string, max 100 chars)' });
    }
    
    if (!monetization_record_id || typeof monetization_record_id !== 'string' || monetization_record_id.length > 100) {
      return res.status(400).json({ error: 'Valid monetization_record_id is required (string, max 100 chars)' });
    }
    
    // Validate amount
    const parsedAmount = parseFloat(amount_eth);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({ error: 'Valid amount_eth is required (positive number)' });
    }
    
    // Validate transaction hash format
    if (transaction_hash && (typeof transaction_hash !== 'string' || !/^0x[a-fA-F0-9]{64}$/.test(transaction_hash))) {
      return res.status(400).json({ error: 'transaction_hash must be a valid Ethereum transaction hash format (0x followed by 64 hex characters)' });
    }
    
    // Sanitize inputs
    const sanitizedInputs = {
      buyer_id,
      seller_id,
      record_id,
      monetization_record_id,
      amount_eth: parsedAmount,
      transaction_hash: transaction_hash || null
    };
    
    const { data, error } = await supabase
      .from('marketplace_transactions')
      .insert(sanitizedInputs)
      .select()
      .single();

    if (error) throw error;
    res.json({ transaction: data });
  } catch (error) {
    console.error('Marketplace transaction creation failed:', error);
    res.status(500).json({ error: 'Internal server error occurred during marketplace transaction creation' });
  }
});

module.exports = router;
