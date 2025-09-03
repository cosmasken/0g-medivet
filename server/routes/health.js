const express = require('express');
const { supabase } = require('../supabase');
const router = express.Router();

// Health metrics
router.post('/metrics', async (req, res) => {
  try {
    const { user_id, metric_type, value, unit, source, notes } = req.body;
    
    const { data, error } = await supabase
      .from('health_metrics')
      .insert({ user_id, metric_type, value, unit, source, notes })
      .select()
      .single();

    if (error) throw error;
    res.json({ metric: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/metrics/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { type, limit = 100 } = req.query;
    
    let query = supabase
      .from('health_metrics')
      .select('*')
      .eq('user_id', userId)
      .order('recorded_at', { ascending: false })
      .limit(parseInt(limit));
    
    if (type) {
      query = query.eq('metric_type', type);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    
    res.json({ metrics: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Medications
router.post('/medications', async (req, res) => {
  try {
    const { user_id, name, dosage, frequency, start_date, end_date, prescriber, notes } = req.body;
    
    const { data, error } = await supabase
      .from('medications')
      .insert({ user_id, name, dosage, frequency, start_date, end_date, prescriber, notes })
      .select()
      .single();

    if (error) throw error;
    res.json({ medication: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/medications/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { active_only = 'true' } = req.query;
    
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
    res.status(500).json({ error: error.message });
  }
});

// Family members
router.post('/family', async (req, res) => {
  try {
    const { user_id, name, relationship, date_of_birth, is_dependent, emergency_contact } = req.body;
    
    const { data, error } = await supabase
      .from('family_members')
      .insert({ user_id, name, relationship, date_of_birth, is_dependent, emergency_contact })
      .select()
      .single();

    if (error) throw error;
    res.json({ family_member: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/family/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const { data, error } = await supabase
      .from('family_members')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ family_members: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
