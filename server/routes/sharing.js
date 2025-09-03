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

// Get provider permissions
router.get('/provider-permissions/:providerId', async (req, res) => {
  try {
    const { providerId } = req.params;
    
    const { data, error } = await supabase
      .from('provider_permissions')
      .select(`
        *,
        medical_record:medical_records(title, description, category)
      `)
      .eq('provider_id', providerId);

    if (error) throw error;
    
    res.json({ permissions: data });
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

module.exports = router;
