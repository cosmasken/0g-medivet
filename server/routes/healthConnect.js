const express = require('express');
const { supabase } = require('../supabase');
const encryption = require('../lib/encryption');
const router = express.Router();

// Health Connect data synchronization
router.post('/sync', async (req, res) => {
  try {
    const { user_id, health_data } = req.body;
    
    // Validate required fields
    if (!user_id || typeof user_id !== 'string' || user_id.length > 100) {
      return res.status(400).json({ error: 'Valid user_id is required (string, max 100 chars)' });
    }
    
    if (!health_data || !Array.isArray(health_data) || health_data.length === 0) {
      return res.status(400).json({ error: 'health_data must be a non-empty array' });
    }
    
    // Validate user exists
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('id', user_id)
      .single();
    
    if (userError || !user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Process each health data entry
    const processedData = [];
    for (const dataPoint of health_data) {
      // Validate required fields for each data point
      if (!dataPoint.data_type || !dataPoint.start_time || !dataPoint.end_time) {
        return res.status(400).json({ error: 'Each data point must have data_type, start_time, and end_time' });
      }
      
      // Validate data_type is one of the supported Health Connect types
      const validDataTypes = [
        'steps', 'heart_rate', 'sleep', 'calories', 'distance', 
        'weight', 'height', 'body_fat', 'blood_pressure', 
        'blood_glucose', 'temperature', 'active_minutes'
      ];
      
      if (!validDataTypes.includes(dataPoint.data_type)) {
        return res.status(400).json({ error: `Invalid data_type. Must be one of: ${validDataTypes.join(', ')}` });
      }
      
      // Validate timestamps
      if (new Date(dataPoint.start_time) > new Date(dataPoint.end_time)) {
        return res.status(400).json({ error: 'start_time must be before end_time' });
      }
      
      processedData.push({
        user_id,
        data_type: dataPoint.data_type,
        start_time: dataPoint.start_time,
        end_time: dataPoint.end_time,
        value: dataPoint.value || null,
        unit: dataPoint.unit || null,
        source_app: dataPoint.source_app || null,
        source_device: dataPoint.source_device || null,
        metadata: dataPoint.metadata || {}
      });
    }
    
    // Insert all data points in a batch
    const { data, error } = await supabase
      .from('health_connect_data')
      .insert(processedData)
      .select();
    
    if (error) {
      console.error('Health Connect sync error:', error);
      throw error;
    }
    
    res.json({ 
      success: true, 
      message: `${data.length} health data points synced successfully`,
      synced_count: data.length
    });
    
  } catch (error) {
    console.error('Health Connect sync failed:', error);
    res.status(500).json({ error: 'Internal server error occurred during health connect sync' });
  }
});

// Get Health Connect data for a user with filtering
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { 
      limit = 50, 
      offset = 0,
      data_type,
      start_date,
      end_date,
      source_app
    } = req.query;
    
    // Validate userId
    if (!userId || typeof userId !== 'string' || userId.length > 100) {
      return res.status(400).json({ error: 'Valid user_id is required (string, max 100 chars)' });
    }
    
    // Validate pagination parameters
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
      .from('health_connect_data')
      .select('*')
      .eq('user_id', userId)
      .order('start_time', { ascending: false })
      .range(offsetInt, offsetInt + limitInt - 1);
    
    // Apply filters
    if (data_type) {
      query = query.eq('data_type', data_type);
    }
    
    if (start_date) {
      query = query.gte('start_time', start_date);
    }
    
    if (end_date) {
      query = query.lte('end_time', end_date);
    }
    
    if (source_app) {
      query = query.eq('source_app', source_app);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Health Connect data fetch error:', error);
      throw error;
    }
    
    res.json({ health_data: data });
    
  } catch (error) {
    console.error('Health Connect data fetch failed:', error);
    res.status(500).json({ error: 'Internal server error occurred during health data fetch' });
  }
});

// Get aggregated health statistics for a user
router.get('/user/:userId/stats', async (req, res) => {
  try {
    const { userId } = req.params;
    const { 
      start_date,
      end_date,
      data_type
    } = req.query;
    
    // Validate userId
    if (!userId || typeof userId !== 'string' || userId.length > 100) {
      return res.status(400).json({ error: 'Valid user_id is required (string, max 100 chars)' });
    }
    
    // Build query for aggregation
    let query = supabase
      .from('health_connect_data')
      .select(`
        data_type,
        avg(value) as average_value,
        sum(value) as total_value,
        count(*)::int as count,
        min(start_time) as earliest_time,
        max(end_time) as latest_time
      `)
      .eq('user_id', userId)
      .not('value', 'is', null) // Only include records with actual values
      .group('data_type');
    
    // Apply date filters
    if (start_date) {
      query = query.gte('start_time', start_date);
    }
    
    if (end_date) {
      query = query.lte('end_time', end_date);
    }
    
    if (data_type) {
      query = query.eq('data_type', data_type);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Health Connect stats fetch error:', error);
      throw error;
    }
    
    // Format the statistics
    const formattedStats = data.map(stat => ({
      data_type: stat.data_type,
      average_value: parseFloat(stat.average_value) || null,
      total_value: parseFloat(stat.total_value) || null,
      count: parseInt(stat.count),
      earliest_time: stat.earliest_time,
      latest_time: stat.latest_time
    }));
    
    res.json({ statistics: formattedStats });
    
  } catch (error) {
    console.error('Health Connect stats fetch failed:', error);
    res.status(500).json({ error: 'Internal server error occurred during health stats fetch' });
  }
});

// Get summary of health data types for a user
router.get('/user/:userId/summary', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Validate userId
    if (!userId || typeof userId !== 'string' || userId.length > 100) {
      return res.status(400).json({ error: 'Valid user_id is required (string, max 100 chars)' });
    }
    
    // Get count by data type
    const { data: typeCount, error: typeError } = await supabase
      .from('health_connect_data')
      .select('data_type, count(*)::int as count')
      .eq('user_id', userId)
      .group('data_type')
      .order('count', { ascending: false });
    
    if (typeError) {
      console.error('Health Connect summary fetch error:', typeError);
      throw typeError;
    }
    
    // Get date range
    const { data: dateRange, error: dateError } = await supabase
      .from('health_connect_data')
      .select('min(start_time) as first_entry, max(end_time) as last_entry')
      .eq('user_id', userId)
      .single();
    
    if (dateError) {
      console.error('Health Connect date range fetch error:', dateError);
      throw dateError;
    }
    
    res.json({
      summary: {
        data_types: typeCount,
        date_range: {
          first_entry: dateRange.first_entry,
          last_entry: dateRange.last_entry
        },
        total_records: typeCount.reduce((sum, item) => sum + item.count, 0)
      }
    });
    
  } catch (error) {
    console.error('Health Connect summary fetch failed:', error);
    res.status(500).json({ error: 'Internal server error occurred during health summary fetch' });
  }
});

// Delete Health Connect data by date range
router.delete('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { start_date, end_date, data_type } = req.query;
    
    // Validate userId
    if (!userId || typeof userId !== 'string' || userId.length > 100) {
      return res.status(400).json({ error: 'Valid user_id is required (string, max 100 chars)' });
    }
    
    // At least one filter must be provided
    if (!start_date && !end_date && !data_type) {
      return res.status(400).json({ error: 'At least one filter (start_date, end_date, or data_type) is required' });
    }
    
    // Build the delete query
    let query = supabase
      .from('health_connect_data')
      .delete()
      .eq('user_id', userId);
    
    if (start_date) {
      query = query.gte('start_time', start_date);
    }
    
    if (end_date) {
      query = query.lte('end_time', end_date);
    }
    
    if (data_type) {
      query = query.eq('data_type', data_type);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Health Connect data delete error:', error);
      throw error;
    }
    
    res.json({ 
      success: true, 
      message: `${data.length} data points deleted successfully` 
    });
    
  } catch (error) {
    console.error('Health Connect data delete failed:', error);
    res.status(500).json({ error: 'Internal server error occurred during health data deletion' });
  }
});

module.exports = router;