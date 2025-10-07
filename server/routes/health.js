const express = require('express');
const { supabase } = require('../supabase');
const router = express.Router();

// Health metrics
router.post('/metrics', async (req, res) => {
  try {
    const { user_id, metric_type, value, unit, source, notes } = req.body;
    
    // Validate required fields
    if (!user_id || typeof user_id !== 'string' || user_id.length > 100) {
      return res.status(400).json({ error: 'Valid user_id is required (string, max 100 chars)' });
    }
    
    if (!metric_type || typeof metric_type !== 'string' || metric_type.length > 50) {
      return res.status(400).json({ error: 'Valid metric_type is required (string, max 50 chars)' });
    }
    
    if (value === undefined || value === null) {
      return res.status(400).json({ error: 'Value is required' });
    }
    
    // Validate value is a number if it's not a string representation
    if (typeof value !== 'string' && typeof value !== 'number') {
      return res.status(400).json({ error: 'Value must be a string or number' });
    }
    
    // Optional fields validation
    if (unit && (typeof unit !== 'string' || unit.length > 20)) {
      return res.status(400).json({ error: 'Unit must be a string with max 20 characters' });
    }
    
    if (source && (typeof source !== 'string' || source.length > 100)) {
      return res.status(400).json({ error: 'Source must be a string with max 100 characters' });
    }
    
    if (notes && (typeof notes !== 'string' || notes.length > 500)) {
      return res.status(400).json({ error: 'Notes must be a string with max 500 characters' });
    }
    
    // Sanitize inputs - ensure proper string encoding
    const sanitizedInputs = {
      user_id,
      metric_type: metric_type.trim(),
      value: value,
      unit: unit ? unit.trim() : null,
      source: source ? source.trim() : null,
      notes: notes ? notes.trim() : null
    };
    
    const { data, error } = await supabase
      .from('health_metrics')
      .insert(sanitizedInputs)
      .select()
      .single();

    if (error) throw error;
    res.json({ metric: data });
  } catch (error) {
    console.error('Health metrics creation failed:', error);
    res.status(500).json({ error: 'Internal server error occurred during health metrics creation' });
  }
});

router.get('/metrics/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { type, limit = 100 } = req.query;
    
    // Validate userId
    if (!userId || typeof userId !== 'string' || userId.length > 100) {
      return res.status(400).json({ error: 'Valid user_id is required (string, max 100 chars)' });
    }
    
    // Validate optional type parameter
    if (type && (typeof type !== 'string' || type.length > 50)) {
      return res.status(400).json({ error: 'Type must be a string with max 50 characters' });
    }
    
    // Validate limit parameter
    const limitInt = parseInt(limit);
    if (isNaN(limitInt) || limitInt <= 0 || limitInt > 1000) {
      return res.status(400).json({ error: 'Invalid limit parameter (1-1000)' });
    }
    
    let query = supabase
      .from('health_metrics')
      .select('*')
      .eq('user_id', userId)
      .order('recorded_at', { ascending: false })
      .limit(limitInt);
    
    if (type) {
      query = query.eq('metric_type', type.trim());
    }
    
    const { data, error } = await query;
    if (error) throw error;
    
    res.json({ metrics: data });
  } catch (error) {
    console.error('Health metrics retrieval failed:', error);
    res.status(500).json({ error: 'Internal server error occurred during health metrics retrieval' });
  }
});

// Medications
router.post('/medications', async (req, res) => {
  try {
    const { user_id, name, dosage, frequency, start_date, end_date, prescriber, notes } = req.body;
    
    // Validate required fields
    if (!user_id || typeof user_id !== 'string' || user_id.length > 100) {
      return res.status(400).json({ error: 'Valid user_id is required (string, max 100 chars)' });
    }
    
    if (!name || typeof name !== 'string' || name.length > 100) {
      return res.status(400).json({ error: 'Valid medication name is required (string, max 100 chars)' });
    }
    
    if (dosage && (typeof dosage !== 'string' && typeof dosage !== 'number')) {
      return res.status(400).json({ error: 'Dosage must be a string or number' });
    }
    
    // Optional field validations
    if (frequency && (typeof frequency !== 'string' || frequency.length > 100)) {
      return res.status(400).json({ error: 'Frequency must be a string with max 100 characters' });
    }
    
    if (start_date && (typeof start_date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(start_date))) {
      return res.status(400).json({ error: 'Start date must be in YYYY-MM-DD format' });
    }
    
    if (end_date && (typeof end_date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(end_date))) {
      return res.status(400).json({ error: 'End date must be in YYYY-MM-DD format' });
    }
    
    if (prescriber && (typeof prescriber !== 'string' || prescriber.length > 100)) {
      return res.status(400).json({ error: 'Prescriber must be a string with max 100 characters' });
    }
    
    if (notes && (typeof notes !== 'string' || notes.length > 500)) {
      return res.status(400).json({ error: 'Notes must be a string with max 500 characters' });
    }
    
    // Sanitize and validate date range
    if (start_date && end_date) {
      const startDate = new Date(start_date);
      const endDate = new Date(end_date);
      if (startDate > endDate) {
        return res.status(400).json({ error: 'Start date must be before end date' });
      }
    }
    
    const sanitizedInputs = {
      user_id,
      name: name.trim(),
      dosage: dosage,
      frequency: frequency ? frequency.trim() : null,
      start_date: start_date || null,
      end_date: end_date || null,
      prescriber: prescriber ? prescriber.trim() : null,
      notes: notes ? notes.trim() : null
    };
    
    const { data, error } = await supabase
      .from('medications')
      .insert(sanitizedInputs)
      .select()
      .single();

    if (error) throw error;
    res.json({ medication: data });
  } catch (error) {
    console.error('Medication creation failed:', error);
    res.status(500).json({ error: 'Internal server error occurred during medication creation' });
  }
});

router.get('/medications/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { active_only = 'true' } = req.query;
    
    // Validate userId
    if (!userId || typeof userId !== 'string' || userId.length > 100) {
      return res.status(400).json({ error: 'Valid user_id is required (string, max 100 chars)' });
    }
    
    // Validate active_only parameter
    if (active_only !== 'true' && active_only !== 'false') {
      return res.status(400).json({ error: 'active_only must be either "true" or "false"' });
    }
    
    let query = supabase
      .from('medications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (active_only === 'true') {
      query = query.eq('is_active', true);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    
    res.json({ medications: data });
  } catch (error) {
    console.error('Medication retrieval failed:', error);
    res.status(500).json({ error: 'Internal server error occurred during medication retrieval' });
  }
});

// Family members
router.post('/family', async (req, res) => {
  try {
    const { user_id, name, relationship, date_of_birth, is_dependent, emergency_contact } = req.body;
    
    // Validate required fields
    if (!user_id || typeof user_id !== 'string' || user_id.length > 100) {
      return res.status(400).json({ error: 'Valid user_id is required (string, max 100 chars)' });
    }
    
    if (!name || typeof name !== 'string' || name.length > 100) {
      return res.status(400).json({ error: 'Valid name is required (string, max 100 chars)' });
    }
    
    if (!relationship || typeof relationship !== 'string' || relationship.length > 50) {
      return res.status(400).json({ error: 'Valid relationship is required (string, max 50 chars)' });
    }
    
    // Optional field validations
    if (date_of_birth && (typeof date_of_birth !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date_of_birth))) {
      return res.status(400).json({ error: 'Date of birth must be in YYYY-MM-DD format' });
    }
    
    if (is_dependent !== undefined && typeof is_dependent !== 'boolean') {
      return res.status(400).json({ error: 'is_dependent must be a boolean value' });
    }
    
    if (emergency_contact && (typeof emergency_contact !== 'string' || emergency_contact.length > 100)) {
      return res.status(400).json({ error: 'Emergency contact must be a string with max 100 characters' });
    }
    
    const sanitizedInputs = {
      user_id,
      name: name.trim(),
      relationship: relationship.trim(),
      date_of_birth: date_of_birth || null,
      is_dependent: is_dependent || false,
      emergency_contact: emergency_contact ? emergency_contact.trim() : null
    };
    
    const { data, error } = await supabase
      .from('family_members')
      .insert(sanitizedInputs)
      .select()
      .single();

    if (error) throw error;
    res.json({ family_member: data });
  } catch (error) {
    console.error('Family member creation failed:', error);
    res.status(500).json({ error: 'Internal server error occurred during family member creation' });
  }
});

router.get('/family/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Validate userId
    if (!userId || typeof userId !== 'string' || userId.length > 100) {
      return res.status(400).json({ error: 'Valid user_id is required (string, max 100 chars)' });
    }
    
    const { data, error } = await supabase
      .from('family_members')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ family_members: data });
  } catch (error) {
    console.error('Family member retrieval failed:', error);
    res.status(500).json({ error: 'Internal server error occurred during family member retrieval' });
  }
});

module.exports = router;
