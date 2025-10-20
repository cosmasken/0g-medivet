const express = require('express');
const { supabase } = require('../supabase');
const crypto = require('crypto');
const router = express.Router();

// Generate deterministic EVM address from username + password
function generateEVMAddress(username, password) {
  const seed = `medivet:${username.toLowerCase()}:${password}`;
  const hash = crypto.createHash('sha256').update(seed).digest('hex');
  return '0x' + hash.substring(0, 40);
}

// Unified authentication - handles both wallet and username/password
router.post('/auth', async (req, res) => {
  try {
    const { wallet_address, username, password, role = 'patient' } = req.body;
    
    // Validate input - either wallet_address OR username+password required
    if (!wallet_address && (!username || !password)) {
      return res.status(400).json({ 
        error: 'Either wallet_address or username+password required' 
      });
    }

    let targetWalletAddress;
    let authMethod;

    if (wallet_address) {
      // Web wallet authentication
      if (!/^0x[a-fA-F0-9]{40}$/.test(wallet_address)) {
        return res.status(400).json({ error: 'Invalid wallet address format' });
      }
      targetWalletAddress = wallet_address;
      authMethod = 'wallet';
    } else {
      // Mobile username/password authentication
      targetWalletAddress = generateEVMAddress(username, password);
      authMethod = 'credentials';
    }

    // Check if user exists
    let { data: user, error } = await supabase
      .from('users')
      .select('*, user_profiles(*)')
      .eq('wallet_address', targetWalletAddress)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Supabase error in auth:', error);
      throw error;
    }

    // Create user if doesn't exist
    if (!user) {
      const userData = { 
        wallet_address: targetWalletAddress, 
        role,
        username: authMethod === 'credentials' ? username : null
      };

      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert(userData)
        .select('*, user_profiles(*)')
        .single();

      if (createError) {
        console.error('Error creating user:', createError);
        throw createError;
      }

      return res.json({
        user: newUser,
        wallet_address: targetWalletAddress,
        auth_method: authMethod,
        is_new_user: true,
        message: 'User created successfully'
      });
    }

    res.json({
      user,
      wallet_address: targetWalletAddress,
      auth_method: authMethod,
      is_new_user: false,
      message: 'User authenticated successfully'
    });

  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ 
      error: 'Authentication failed',
      details: error.message 
    });
  }
});

// Link username/password to existing wallet account
router.post('/link-credentials', async (req, res) => {
  try {
    const { wallet_address, username, password } = req.body;
    
    if (!wallet_address || !username || !password) {
      return res.status(400).json({ 
        error: 'wallet_address, username, and password required' 
      });
    }

    // Validate wallet address
    if (!/^0x[a-fA-F0-9]{40}$/.test(wallet_address)) {
      return res.status(400).json({ error: 'Invalid wallet address format' });
    }

    // Check if username is already taken
    const { data: existingUsername } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .single();

    if (existingUsername) {
      return res.status(409).json({ error: 'Username already taken' });
    }

    // Generate the deterministic address for this username/password
    const credentialAddress = generateEVMAddress(username, password);

    // Check if this credential combination already exists
    const { data: existingCredential } = await supabase
      .from('users')
      .select('id, wallet_address')
      .eq('wallet_address', credentialAddress)
      .single();

    if (existingCredential) {
      return res.status(409).json({ 
        error: 'This username/password combination is already in use',
        existing_wallet: credentialAddress
      });
    }

    // Update the wallet user with username
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({ username })
      .eq('wallet_address', wallet_address)
      .select('*, user_profiles(*)')
      .single();

    if (updateError) {
      console.error('Error linking credentials:', updateError);
      throw updateError;
    }

    res.json({
      user: updatedUser,
      credential_address: credentialAddress,
      message: 'Credentials linked successfully. You can now login with username/password on mobile.'
    });

  } catch (error) {
    console.error('Link credentials error:', error);
    res.status(500).json({ 
      error: 'Failed to link credentials',
      details: error.message 
    });
  }
});

// Check if username is available
router.get('/check-username/:username', async (req, res) => {
  try {
    const { username } = req.params;
    
    if (!username || username.length < 3) {
      return res.status(400).json({ error: 'Username must be at least 3 characters' });
    }

    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .single();

    res.json({
      available: !existingUser,
      username
    });

  } catch (error) {
    console.error('Username check error:', error);
    res.status(500).json({ error: 'Failed to check username availability' });
  }
});

// Get user by wallet address (existing endpoint - unchanged)
router.get('/:wallet_address', async (req, res) => {
  try {
    const { wallet_address } = req.params;
    
    if (!/^0x[a-fA-F0-9]{40}$/.test(wallet_address)) {
      return res.status(400).json({ error: 'Invalid wallet address format' });
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('*, user_profiles(*)')
      .eq('wallet_address', wallet_address)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'User not found' });
      }
      throw error;
    }

    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});
router.post('/auth', async (req, res) => {
  try {
    const { wallet_address, role = 'patient', username } = req.body;
    
    // Validate required fields
    if (!wallet_address) {
      return res.status(400).json({ error: 'Wallet address required' });
    }

    // Validate wallet address format (Ethereum address format)
    if (typeof wallet_address !== 'string' || !/^0x[a-fA-F0-9]{40}$/.test(wallet_address)) {
      return res.status(400).json({ error: 'Invalid wallet address format' });
    }

    // Validate role
    const validRoles = ['patient', 'provider', 'admin'];
    if (role && !validRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role. Must be patient, provider, or admin' });
    }

    // Validate optional username if provided
    if (username) {
      if (typeof username !== 'string' || username.length < 3 || username.length > 50) {
        return res.status(400).json({ error: 'Username must be 3-50 characters long' });
      }
      if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
        return res.status(400).json({ error: 'Username can only contain alphanumeric characters, underscores, and hyphens' });
      }
    }

    // Check if user exists
    let { data: user, error } = await supabase
      .from('users')
      .select('*, user_profiles(*)')
      .eq('wallet_address', wallet_address)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Supabase error in auth:', error);
      throw error;
    }

    // Create user if doesn't exist
    if (!user) {
      const userData = { wallet_address, role };
      if (username) {
        // Check if username is already taken
        const { data: existingUser, error: usernameError } = await supabase
          .from('users')
          .select('id')
          .eq('username', username)
          .single();
        
        if (existingUser) {
          return res.status(400).json({ error: 'Username already taken' });
        }
        
        userData.username = username;
      }
      
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert(userData)
        .select()
        .single();

      if (createError) {
        console.error('Supabase error in user creation:', createError);
        throw createError;
      }
      user = newUser;
    } else if (username && !user.username) {
      // If user exists but doesn't have a username and one was provided, update it
      const { data: existingUser, error: usernameError } = await supabase
        .from('users')
        .select('id')
        .eq('username', username)
        .single();
      
      if (existingUser) {
        return res.status(400).json({ error: 'Username already taken' });
      }
      
      const { data: updatedUser, error: updateError } = await supabase
        .from('users')
        .update({ username })
        .eq('id', user.id)
        .select()
        .single();
      
      if (updateError) {
        console.error('Supabase error in username update:', updateError);
        throw updateError;
      }
      user = updatedUser;
    }

    res.json({ user });
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ error: 'Internal server error occurred during authentication' });
  }
});

// Login with username (for mobile app users)
router.post('/login', async (req, res) => {
  try {
    const { username, wallet_address } = req.body;
    
    if (!username) {
      return res.status(400).json({ error: 'Username required' });
    }

    // Validate username format
    if (typeof username !== 'string' || username.length < 3 || username.length > 50) {
      return res.status(400).json({ error: 'Username must be 3-50 characters long' });
    }

    // If wallet_address is provided, validate it
    if (wallet_address && !/^0x[a-fA-F0-9]{40}$/.test(wallet_address)) {
      return res.status(400).json({ error: 'Invalid wallet address format' });
    }

    // Get user by username
    let { data: user, error } = await supabase
      .from('users')
      .select('*, user_profiles(*)')
      .eq('username', username)
      .single();

    if (error) {
      return res.status(400).json({ error: 'Invalid username' });
    }

    // Optional: Verify wallet address matches if provided
    if (wallet_address && user.wallet_address !== wallet_address) {
      return res.status(400).json({ error: 'Wallet address does not match user' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error occurred during login' });
  }
});

// Register with optional username (for mobile app users)
router.post('/register', async (req, res) => {
  try {
    const { wallet_address, username, role = 'patient' } = req.body;
    
    if (!wallet_address) {
      return res.status(400).json({ error: 'Wallet address required' });
    }

    // Validate wallet address format
    if (typeof wallet_address !== 'string' || !/^0x[a-fA-F0-9]{40}$/.test(wallet_address)) {
      return res.status(400).json({ error: 'Invalid wallet address format' });
    }

    // Validate role
    const validRoles = ['patient', 'provider', 'admin'];
    if (role && !validRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role. Must be patient, provider, or admin' });
    }

    // Validate optional username if provided
    if (username) {
      if (typeof username !== 'string' || username.length < 3 || username.length > 50) {
        return res.status(400).json({ error: 'Username must be 3-50 characters long' });
      }
      if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
        return res.status(400).json({ error: 'Username can only contain alphanumeric characters, underscores, and hyphens' });
      }
      
      // Check if username is already taken
      const { data: existingUser, error } = await supabase
        .from('users')
        .select('id')
        .eq('username', username)
        .single();
      
      if (existingUser) {
        return res.status(400).json({ error: 'Username already taken' });
      }
    }

    // Check if user already exists with this wallet address
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('wallet_address', wallet_address)
      .single();

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this wallet address' });
    }

    // Create new user
    const userData = { wallet_address, role };
    if (username) {
      userData.username = username;
    }
    
    const { data: newUser, error: createError } = await supabase
      .from('users')
      .insert(userData)
      .select()
      .single();

    if (createError) {
      console.error('Supabase error in user registration:', createError);
      throw createError;
    }

    res.json({ user: newUser });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error occurred during registration' });
  }
});

// Update user's username
router.put('/:userId/username', async (req, res) => {
  try {
    const { userId } = req.params;
    const { username } = req.body;

    // Validate userId parameter
    if (!userId || typeof userId !== 'string' || userId.length > 100) {
      return res.status(400).json({ error: 'Invalid userId parameter' });
    }

    // Validate username
    if (!username || typeof username !== 'string' || username.length < 3 || username.length > 50) {
      return res.status(400).json({ error: 'Username must be 3-50 characters long' });
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      return res.status(400).json({ error: 'Username can only contain alphanumeric characters, underscores, and hyphens' });
    }

    // Check if username is already taken by another user
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .neq('id', userId)
      .single();
    
    if (existingUser) {
      return res.status(400).json({ error: 'Username already taken' });
    }

    // Update the username
    const { data, error } = await supabase
      .from('users')
      .update({ username })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Username update error:', error);
      throw error;
    }

    res.json({ success: true, user: data });
  } catch (error) {
    console.error('Username update error:', error);
    res.status(500).json({ error: 'Internal server error occurred during username update' });
  }
});

// Update user profile
router.put('/:userId/profile', async (req, res) => {
  try {
    const { userId } = req.params;
    const profileData = req.body;

    // Validate userId parameter
    if (!userId || typeof userId !== 'string' || userId.length > 100) {
      return res.status(400).json({ error: 'Invalid userId parameter' });
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .upsert({ user_id: userId, ...profileData })
      .select()
      .single();

    if (error) {
      console.error('Profile update error:', error);
      throw error;
    }

    res.json({ profile: data });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Internal server error occurred during profile update' });
  }
});

// Complete onboarding
router.post('/:userId/complete-onboarding', async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate userId parameter
    if (!userId || typeof userId !== 'string' || userId.length > 100) {
      return res.status(400).json({ error: 'Invalid userId parameter' });
    }

    const { data, error } = await supabase
      .from('users')
      .update({ is_onboarded: true })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Onboarding completion error:', error);
      throw error;
    }

    res.json({ user: data });
  } catch (error) {
    console.error('Onboarding completion error:', error);
    res.status(500).json({ error: 'Internal server error occurred during onboarding completion' });
  }
});

// Get current user profile (by wallet address or username from request)
router.get('/profile', async (req, res) => {
  try {
    // Extract wallet_address or username from the request
    // In the current implementation, we'll need to identify the user based on what's in the request
    // Since there's no auth middleware, we'll look for wallet address in query or body
    const { wallet_address, username } = { ...req.query, ...req.body };
    
    let filter = {};
    if (wallet_address) {
      filter.wallet_address = wallet_address;
    } else if (username) {
      filter.username = username;
    } else {
      return res.status(400).json({ error: 'Either wallet_address or username required' });
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('*, user_profiles(*)')
      .match(filter)
      .single();

    if (error) {
      console.error('Profile fetch error:', error);
      throw error;
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Internal server error occurred during profile fetch' });
  }
});

// Update current user profile
router.put('/profile', async (req, res) => {
  try {
    // Extract wallet_address or username from the request to identify the user
    const { wallet_address, username, ...profileData } = req.body;
    
    let filter = {};
    if (wallet_address) {
      filter.wallet_address = wallet_address;
    } else if (username) {
      filter.username = username;
    } else {
      return res.status(400).json({ error: 'Either wallet_address or username required' });
    }

    // Get the user ID first
    let { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .match(filter)
      .single();

    if (userError) {
      console.error('User lookup error:', userError);
      throw userError;
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update user table fields directly
    const userUpdateFields = ['email', 'phone', 'is_onboarded'];
    const profileUpdates = {};
    const userUpdates = {};

    for (const [key, value] of Object.entries(profileData)) {
      if (userUpdateFields.includes(key)) {
        userUpdates[key] = value;
      } else {
        profileUpdates[key] = value;
      }
    }

    // Update user table if needed
    if (Object.keys(userUpdates).length > 0) {
      const { error: userUpdateError } = await supabase
        .from('users')
        .update(userUpdates)
        .eq('id', user.id);
      
      if (userUpdateError) {
        console.error('User table update error:', userUpdateError);
        throw userUpdateError;
      }
    }

    // Update user profile if needed
    if (Object.keys(profileUpdates).length > 0) {
      const { error: profileUpdateError } = await supabase
        .from('user_profiles')
        .upsert({ user_id: user.id, ...profileUpdates })
        .select()
        .single();
      
      if (profileUpdateError) {
        console.error('Profile update error:', profileUpdateError);
        throw profileUpdateError;
      }
    }

    // Return updated user data
    const { data: updatedUser, error: fetchError } = await supabase
      .from('users')
      .select('*, user_profiles(*)')
      .eq('id', user.id)
      .single();

    if (fetchError) {
      console.error('Updated user fetch error:', fetchError);
      throw fetchError;
    }

    res.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Internal server error occurred during profile update' });
  }
});

module.exports = router;
