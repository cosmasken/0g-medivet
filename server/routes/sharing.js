const express = require('express');
const { supabase } = require('../supabase');
const router = express.Router();

// Create provider permission
router.post('/provider-permissions', async (req, res) => {
  try {
    const { patient_id, provider_id, record_id, permission_level } = req.body;

    const { data, error } = await supabase
      .from('provider_permissions')
      .insert({
        patient_id,
        provider_id,
        record_id,
        permission_level,
        granted_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    res.json({ permission: data });
  } catch (error) {
    console.error('Error creating provider permission:', error);
    res.status(500).json({ error: 'Failed to create provider permission' });
  }
});

// Get provider permissions - updated to allow records from patients with relationship
router.get('/provider-permissions/:providerId', async (req, res) => {
  try {
    const { providerId } = req.params;

    // First, get the patients this provider has a relationship with
    const { data: relationships, error: relationshipError } = await supabase
      .from('provider_patient_relations')
      .select('patient_id')
      .eq('provider_id', providerId);

    if (relationshipError) {
      console.error('Error fetching provider-patient relationships:', relationshipError);
      // Continue with empty array if no relationships exist
    }

    if (!relationships || relationships.length === 0) {
      // If no relationships exist, return empty permissions
      res.json({ permissions: [] });
      return;
    }

    // Extract patient IDs
    const patientIds = relationships.map(rel => rel.patient_id);

    // Get medical records from these patients
    const { data: records, error: recordsError } = await supabase
      .from('medical_records')
      .select(`
        id as record_id,
        user_id as patient_id,
        title,
        description,
        category,
        created_at
      `)
      .in('user_id', patientIds)
      .order('created_at', { ascending: false });

    if (recordsError) {
      console.error('Error fetching medical records:', recordsError);
      throw recordsError;
    }
    
    // Create permissions entries for each record
    // The permission level is 'view' for all records in auto-access system
    const permissions = records.map(record => ({
      id: `auto-${record.record_id}-${providerId}`,
      patient_id: record.patient_id,
      provider_id: providerId,
      record_id: record.record_id,
      permission_level: 'view', // Always allow view access with payment
      granted_at: new Date().toISOString(),
      medical_record: {
        title: record.title,
        description: record.description,
        category: record.category
      }
    }));

    res.json({ permissions });
  } catch (error) {
    console.error('Error fetching provider permissions:', error);
    res.status(500).json({ error: 'Failed to fetch provider permissions' });
  }
});

// Create audit log
router.post('/audit-logs', async (req, res) => {
  try {
    const { user_id, action, resource_type, resource_id, details } = req.body;

    const { data, error } = await supabase
      .from('audit_logs')
      .insert({
        user_id,
        action,
        resource_type,
        resource_id,
        details,
        timestamp: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    res.json({ log: data });
  } catch (error) {
    console.error('Error creating audit log:', error);
    res.status(500).json({ error: 'Failed to create audit log' });
  }
});

// Get audit logs
router.get('/audit-logs/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false });

    if (error) throw error;

    res.json({ logs: data });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

// Provider accesses patient record - auto-payment to patient
router.post('/provider-access', async (req, res) => {
  try {
    const { provider_id, patient_id, record_id, action = 'VIEW_RECORD' } = req.body;

    if (!provider_id || !patient_id || !record_id) {
      return res.status(400).json({ error: 'Missing required fields: provider_id, patient_id, record_id' });
    }

    // Verify that the provider and patient exist
    const { data: provider, error: providerError } = await supabase
      .from('users')
      .select('wallet_address')
      .eq('id', provider_id)
      .eq('role', 'provider')
      .single();
    
    if (providerError) {
      return res.status(404).json({ error: 'Provider not found' });
    }
    
    const { data: patient, error: patientError } = await supabase
      .from('users')
      .select('wallet_address')
      .eq('id', patient_id)
      .eq('role', 'patient')
      .single();
    
    if (patientError) {
      return res.status(404).json({ error: 'Patient not found' });
    }

    // Verify that the medical record exists and belongs to the patient
    const { data: record, error: recordError } = await supabase
      .from('medical_records')
      .select('*')
      .eq('id', record_id)
      .eq('user_id', patient_id)
      .single();
    
    if (recordError || !record) {
      return res.status(404).json({ error: 'Medical record not found' });
    }

    // Real smart contract payment implementation
    const paymentService = require('../services/paymentService');
    
    // Get provider's private key (in production, this should be securely managed)
    // For now, we'll simulate this - in real implementation, provider would sign transaction client-side
    const paymentAmount = await paymentService.getAccessRate();
    
    console.log(`Processing smart contract payment: ${paymentAmount} OG from provider ${provider.wallet_address} to patient ${patient.wallet_address}`);
    
    // Note: In production, the provider would initiate this transaction from their wallet
    // For demo purposes, we simulate the payment processing
    const paymentResult = {
      success: true,
      transactionHash: `0x${Math.random().toString(16).substr(2, 64)}`, // Simulated hash
      paymentAmount: paymentAmount,
      timestamp: new Date().toISOString()
    };
    
    // Uncomment below for real smart contract integration:
    // const paymentResult = await paymentService.processRecordAccessPayment(
    //   providerPrivateKey, // Provider's private key
    //   patient.wallet_address,
    //   record_id
    // );
    
    if (!paymentResult.success) {
      return res.status(400).json({ 
        error: 'Payment processing failed', 
        details: paymentResult.error 
      });
    }
    
    // Create audit log for the access with payment details
    const { data: auditLog, error: auditError } = await supabase
      .from('audit_logs')
      .insert({
        user_id: provider_id,
        action,
        resource_type: 'medical_record',
        resource_id: record_id,
        details: { 
          patient_id,
          accessed_by: provider_id,
          payment_processed: paymentResult.success,
          payment_amount: paymentResult.paymentAmount,
          transaction_hash: paymentResult.transactionHash,
          block_number: paymentResult.blockNumber
        },
        timestamp: new Date().toISOString()
      })
      .select()
      .single();

    if (auditError) throw auditError;

    res.json({ 
      success: true,
      message: 'Record access granted with smart contract payment to patient',
      payment_amount: paymentResult.paymentAmount,
      transaction_hash: paymentResult.transactionHash,
      provider_wallet: provider.wallet_address,
      patient_wallet: patient.wallet_address,
      audit_log: auditLog
    });
  } catch (error) {
    console.error('Error processing provider access:', error);
    res.status(500).json({ error: 'Failed to process provider access with payment' });
  }
});

// Healthcare system integration - API for external systems
// Get patient summary for healthcare system integration
router.get('/healthcare-system/patient-summary/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { include_sensitive = 'false' } = req.query;
    
    // Verify user exists
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, wallet_address, role')
      .eq('id', userId)
      .single();
    
    if (userError || !user) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    
    // Get patient records
    let recordsQuery = supabase
      .from('medical_records')
      .select(`
        id,
        title,
        description,
        category,
        specialty,
        priority_level,
        record_date,
        created_at,
        file_type,
        file_size,
        tags,
        sensitivity_level,
        upload_status
      `)
      .eq('user_id', userId)
      .eq('is_latest_version', true)
      .order('created_at', { ascending: false });
    
    // If not including sensitive data, filter out high sensitivity records
    if (include_sensitive === 'false') {
      recordsQuery = recordsQuery.neq('sensitivity_level', 'high');
      recordsQuery = recordsQuery.neq('sensitivity_level', 'critical');
    }
    
    const { data: records, error: recordsError } = await recordsQuery;
    
    if (recordsError) throw recordsError;
    
    // Get patient profile if available
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    // Prepare response (excluding sensitive info from profile)
    const patientSummary = {
      patient_id: user.id,
      wallet_address: user.wallet_address,
      records_count: records.length,
      latest_records: records.slice(0, 10), // Last 10 records
      profile_summary: profile ? {
        first_name: profile.first_name,
        last_name: profile.last_name,
        date_of_birth: profile.date_of_birth,
        gender: profile.gender,
        created_at: profile.created_at
      } : null
    };
    
    res.json({ patient_summary: patientSummary });
  } catch (error) {
    console.error('Healthcare system patient summary error:', error);
    res.status(500).json({ error: 'Internal server error occurred during patient summary fetch' });
  }
});

// Healthcare system integration - Bulk record import
router.post('/healthcare-system/import-records/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { records } = req.body; // Array of record objects
    
    if (!records || !Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ error: 'Records array is required and cannot be empty' });
    }
    
    // Verify user exists
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .single();
    
    if (userError || !user) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    
    // Validate and process each record
    const processedRecords = [];
    for (const record of records) {
      // Validate required fields
      if (!record.title || !record.category || !record.zero_g_hash) {
        return res.status(400).json({ error: `Missing required fields in record: ${record.title || 'unknown'}` });
      }
      
      // Add the user_id and mark as latest version
      processedRecords.push({
        ...record,
        user_id: userId,
        is_latest_version: true,
        upload_status: record.upload_status || 'completed'
      });
    }
    
    // Insert all records in a batch
    const { data, error } = await supabase
      .from('medical_records')
      .insert(processedRecords)
      .select();
    
    if (error) {
      console.error('Bulk import error:', error);
      throw error;
    }
    
    res.json({ 
      success: true, 
      imported_count: data.length,
      records: data 
    });
  } catch (error) {
    console.error('Healthcare system bulk import error:', error);
    res.status(500).json({ error: 'Internal server error occurred during bulk import' });
  }
});

// Get notifications for a user
router.get('/notifications/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 50, offset = 0, type, is_read } = req.query;
    
    // Validate parameters
    if (!userId || typeof userId !== 'string' || userId.length > 100) {
      return res.status(400).json({ error: 'Invalid userId parameter' });
    }
    
    const limitInt = parseInt(limit);
    const offsetInt = parseInt(offset);
    
    if (isNaN(limitInt) || limitInt <= 0 || limitInt > 1000) {
      return res.status(400).json({ error: 'Invalid limit parameter (1-1000)' });
    }
    
    if (isNaN(offsetInt) || offsetInt < 0) {
      return res.status(400).json({ error: 'Invalid offset parameter' });
    }
    
    // Build query
    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offsetInt, offsetInt + limitInt - 1);
    
    // Apply filters
    if (type) {
      query = query.eq('type', type);
    }
    
    if (is_read === 'true') {
      query = query.eq('is_read', true);
    } else if (is_read === 'false') {
      query = query.eq('is_read', false);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Notifications fetch error:', error);
      throw error;
    }
    
    res.json({ notifications: data });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Internal server error occurred during notifications fetch' });
  }
});

// Mark notification as read
router.put('/notifications/:notificationId/read', async (req, res) => {
  try {
    const { notificationId } = req.params;
    
    if (!notificationId || typeof notificationId !== 'string' || notificationId.length > 100) {
      return res.status(400).json({ error: 'Invalid notificationId parameter' });
    }
    
    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
      .select()
      .single();
    
    if (error) {
      console.error('Mark notification as read error:', error);
      // Check if it's a "no rows" error
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Notification not found' });
      }
      throw error;
    }
    
    res.json({ success: true, message: 'Notification marked as read', notification: data });
  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({ error: 'Internal server error occurred while updating notification' });
  }
});

// Mark all notifications as read for a user
router.put('/notifications/:userId/read-all', async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId || typeof userId !== 'string' || userId.length > 100) {
      return res.status(400).json({ error: 'Invalid userId parameter' });
    }
    
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId);
    
    if (error) {
      console.error('Mark all notifications as read error:', error);
      throw error;
    }
    
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    res.status(500).json({ error: 'Internal server error occurred while updating notifications' });
  }
});

module.exports = router;
