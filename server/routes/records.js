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
      tags = [],
      parent_record_id,  // For version control
      specialty,         // For specialty categorization
      priority_level     // For priority-based organizing
    } = req.body;

    // Validate required fields
    if (!user_id || !title || !category || !zero_g_hash) {
      return res.status(400).json({ error: 'Missing required fields: user_id, title, category, zero_g_hash' });
    }

    // Validate field formats and constraints
    if (typeof user_id !== 'string' || user_id.length > 100) {
      return res.status(400).json({ error: 'Invalid user_id format' });
    }

    if (typeof title !== 'string' || title.length > 255) {
      return res.status(400).json({ error: 'Invalid title format or too long' });
    }

    if (typeof description !== 'string' || description.length > 1000) {
      return res.status(400).json({ error: 'Invalid description format or too long' });
    }

    if (typeof category !== 'string' || category.length > 100) {
      return res.status(400).json({ error: 'Invalid category format' });
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

    // Validate priority level if provided
    const validPriorityLevels = ['low', 'medium', 'high', 'critical'];
    if (priority_level && !validPriorityLevels.includes(priority_level)) {
      return res.status(400).json({ error: 'Invalid priority level. Must be low, medium, high, or critical' });
    }

    if (file_type && (typeof file_type !== 'string' || file_type.length > 50)) {
      return res.status(400).json({ error: 'Invalid file_type format' });
    }

    if (file_size && (typeof file_size !== 'number' || file_size < 0)) {
      return res.status(400).json({ error: 'Invalid file_size format' });
    }

    if (typeof zero_g_hash !== 'string' || !/^0x[a-fA-F0-9]+$/.test(zero_g_hash)) {
      return res.status(400).json({ error: 'Invalid zero_g_hash format' });
    }

    if (merkle_root && (typeof merkle_root !== 'string' || !/^0x[a-fA-F0-9]+$/.test(merkle_root))) {
      return res.status(400).json({ error: 'Invalid merkle_root format' });
    }

    if (transaction_hash && (typeof transaction_hash !== 'string' || !/^0x[a-fA-F0-9]+$/.test(transaction_hash))) {
      return res.status(400).json({ error: 'Invalid transaction_hash format' });
    }

    if (parent_record_id && (typeof parent_record_id !== 'string' || parent_record_id.length > 100)) {
      return res.status(400).json({ error: 'Invalid parent_record_id format' });
    }

    if (!Array.isArray(tags)) {
      return res.status(400).json({ error: 'Tags must be an array' });
    }

    // If this is a new version of an existing record, mark the previous version as not latest
    if (parent_record_id) {
      await supabase
        .from('medical_records')
        .update({ is_latest_version: false })
        .eq('id', parent_record_id);
    }

    const { data, error } = await supabase
      .from('medical_records')
      .insert({
        user_id,
        title,
        description,
        category,
        specialty,
        priority_level,
        file_type,
        file_size,
        zero_g_hash,
        merkle_root,
        transaction_hash,
        tags,
        parent_record_id,
        is_latest_version: true,  // New records are latest by default
        upload_status: 'completed'
      })
      .select()
      .single();

    if (error) {
      console.error('Record creation error:', error);
      throw error;
    }

    res.json({ record: data });
  } catch (error) {
    console.error('Record creation error:', error);
    res.status(500).json({ error: 'Internal server error occurred during record creation' });
  }
});

// Get user's medical records with advanced search and filtering
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { 
      limit = 50, 
      offset = 0,
      category,
      specialty,
      priority_level,
      tags, // comma-separated tags
      search, // search term for title/description
      date_from,
      date_to,
      include_versions = 'false' // whether to include non-latest versions
    } = req.query;

    // Validate userId parameter
    if (!userId || typeof userId !== 'string' || userId.length > 100) {
      return res.status(400).json({ error: 'Invalid userId parameter' });
    }

    // Validate and sanitize query parameters
    const limitInt = parseInt(limit);
    const offsetInt = parseInt(offset);

    if (isNaN(limitInt) || limitInt <= 0 || limitInt > 1000) {
      return res.status(400).json({ error: 'Invalid limit parameter (1-1000)' });
    }

    if (isNaN(offsetInt) || offsetInt < 0) {
      return res.status(400).json({ error: 'Invalid offset parameter' });
    }

    // Build the query
    let query = supabase
      .from('medical_records')
      .select('*')
      .eq('user_id', userId);

    // Apply filters
    if (category) {
      query = query.ilike('category', `%${category}%`); // Case-insensitive partial match
    }

    if (specialty) {
      query = query.ilike('specialty', `%${specialty}%`);
    }

    if (priority_level) {
      query = query.eq('priority_level', priority_level);
    }

    if (date_from) {
      query = query.gte('created_at', date_from);
    }

    if (date_to) {
      query = query.lte('created_at', date_to);
    }

    // Handle tags filter (if comma-separated tags provided)
    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim());
      // This assumes tags are stored as an array in the database
      // If they aren't, we may need to adjust the filtering logic
      for (const tag of tagArray) {
        query = query.contains('tags', [tag]); // Supabase contains operator for array columns
      }
    }

    // Handle search term for title/description
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Handle version filtering
    if (include_versions === 'false') {
      query = query.eq('is_latest_version', true);
    }

    // Apply sorting and pagination
    query = query
      .order('created_at', { ascending: false })
      .range(offsetInt, offsetInt + limitInt - 1);

    const { data, error } = await query;

    if (error) {
      console.error('Records fetch error:', error);
      throw error;
    }

    res.json({ records: data });
  } catch (error) {
    console.error('Records fetch error:', error);
    res.status(500).json({ error: 'Internal server error occurred during records fetch' });
  }
});

// Get all records for a user with search, filtering, and aggregation
router.get('/user/:userId/search', async (req, res) => {
  try {
    const { userId } = req.params;
    const { 
      category,
      specialty,
      priority_level,
      tags,
      search,
      date_from,
      date_to,
      include_versions = 'false',
      aggregate = 'false' // whether to return aggregate stats
    } = req.query;

    // Validate userId parameter
    if (!userId || typeof userId !== 'string' || userId.length > 100) {
      return res.status(400).json({ error: 'Invalid userId parameter' });
    }

    // Build the base query
    let query = supabase
      .from('medical_records')
      .select('*')
      .eq('user_id', userId);

    // Apply the same filters as in the regular endpoint
    if (category) query = query.ilike('category', `%${category}%`);
    if (specialty) query = query.ilike('specialty', `%${specialty}%`);
    if (priority_level) query = query.eq('priority_level', priority_level);
    if (date_from) query = query.gte('created_at', date_from);
    if (date_to) query = query.lte('created_at', date_to);
    if (search) query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);

    // Handle tags filter
    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim());
      for (const tag of tagArray) {
        query = query.contains('tags', [tag]);
      }
    }

    // Handle version filtering
    if (include_versions === 'false') {
      query = query.eq('is_latest_version', true);
    }

    query = query.order('created_at', { ascending: false });

    const { data: records, error } = await query;

    if (error) {
      console.error('Records search error:', error);
      throw error;
    }

    // If aggregate is requested, calculate statistics
    if (aggregate === 'true') {
      const stats = {
        totalRecords: records.length,
        byCategory: {},
        bySpecialty: {},
        byPriority: {},
        byYear: {}
      };

      records.forEach(record => {
        // Count by category
        if (record.category) {
          stats.byCategory[record.category] = (stats.byCategory[record.category] || 0) + 1;
        }

        // Count by specialty
        if (record.specialty) {
          stats.bySpecialty[record.specialty] = (stats.bySpecialty[record.specialty] || 0) + 1;
        }

        // Count by priority
        if (record.priority_level) {
          stats.byPriority[record.priority_level] = (stats.byPriority[record.priority_level] || 0) + 1;
        }

        // Count by year
        if (record.created_at) {
          const year = new Date(record.created_at).getFullYear().toString();
          stats.byYear[year] = (stats.byYear[year] || 0) + 1;
        }
      });

      res.json({ records, stats });
    } else {
      res.json({ records });
    }
  } catch (error) {
    console.error('Records search error:', error);
    res.status(500).json({ error: 'Internal server error occurred during records search' });
  }
});

// Update record upload status
router.put('/:recordId/status', async (req, res) => {
  try {
    const { recordId } = req.params;
    const { upload_status, transaction_hash, merkle_root } = req.body;

    // Validate recordId parameter
    if (!recordId || typeof recordId !== 'string' || recordId.length > 100) {
      return res.status(400).json({ error: 'Invalid recordId parameter' });
    }

    // Validate upload status if provided
    const validStatuses = ['pending', 'uploading', 'completed', 'failed', 'processing'];
    if (upload_status && !validStatuses.includes(upload_status)) {
      return res.status(400).json({ error: 'Invalid upload status' });
    }

    // Validate optional fields if provided
    if (transaction_hash && (typeof transaction_hash !== 'string' || !/^0x[a-fA-F0-9]+$/.test(transaction_hash))) {
      return res.status(400).json({ error: 'Invalid transaction_hash format' });
    }

    if (merkle_root && (typeof merkle_root !== 'string' || !/^0x[a-fA-F0-9]+$/.test(merkle_root))) {
      return res.status(400).json({ error: 'Invalid merkle_root format' });
    }

    const updateData = { upload_status };
    if (transaction_hash) updateData.transaction_hash = transaction_hash;
    if (merkle_root) updateData.merkle_root = merkle_root;

    const { data, error } = await supabase
      .from('medical_records')
      .update(updateData)
      .eq('id', recordId)
      .select()
      .single();

    if (error) {
      console.error('Record update error:', error);
      throw error;
    }

    res.json({ record: data });
  } catch (error) {
    console.error('Record update error:', error);
    res.status(500).json({ error: 'Internal server error occurred during record update' });
  }
});

module.exports = router;
