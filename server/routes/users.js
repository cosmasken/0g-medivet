const express = require('express');
const { supabase } = require('../supabase');
const router = express.Router();

// Get or create user by wallet address
router.post('/auth', async (req, res) => {
  try {
    const { wallet_address, role = 'patient' } = req.body;
    
    if (!wallet_address) {
      return res.status(400).json({ error: 'Wallet address required' });
    }

    // Check if user exists
    let { data: user, error } = await supabase
      .from('users')
      .select('*, user_profiles(*)')
      .eq('wallet_address', wallet_address)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    // Create user if doesn't exist
    if (!user) {
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({ wallet_address, role })
        .select()
        .single();

      if (createError) throw createError;
      user = newUser;
    }

    res.json({ user });
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update user profile
router.put('/:userId/profile', async (req, res) => {
  try {
    const { userId } = req.params;
    const profileData = req.body;

    const { data, error } = await supabase
      .from('user_profiles')
      .upsert({ user_id: userId, ...profileData })
      .select()
      .single();

    if (error) throw error;

    res.json({ profile: data });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Complete onboarding
router.post('/:userId/complete-onboarding', async (req, res) => {
  try {
    const { userId } = req.params;

    const { data, error } = await supabase
      .from('users')
      .update({ is_onboarded: true })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;

    res.json({ user: data });
  } catch (error) {
    console.error('Onboarding completion error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
