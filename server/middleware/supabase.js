const { supabase } = require('../supabase');

/**
 * Middleware to check if Supabase is available
 */
const requireSupabase = (req, res, next) => {
  if (!supabase) {
    return res.status(503).json({ 
      error: 'Database service unavailable',
      message: 'Supabase is not configured'
    });
  }
  req.supabase = supabase;
  next();
};

module.exports = { requireSupabase };
