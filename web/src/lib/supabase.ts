import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface User {
  id: string;
  wallet_address: string;
  role: 'patient' | 'provider';
  is_onboarded: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  full_name?: string;
  email?: string;
  phone?: string;
  date_of_birth?: string;
  contact?: string;
  emergency_contact?: string;
  medical_history?: string;
  allergies?: string;
  medications?: string;
  monetize_enabled: boolean;
  profile_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface MedicalRecord {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  category: string;
  file_type?: string;
  file_size?: number;
  zero_g_hash: string;
  merkle_root?: string;
  transaction_hash?: string;
  upload_status: 'pending' | 'uploading' | 'completed' | 'failed';
  tags?: string[];
  is_shared: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  details?: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

// Helper functions
export const setUserContext = async (walletAddress: string) => {
  await supabase.rpc('set_config', {
    setting_name: 'app.current_user_wallet',
    setting_value: walletAddress,
    is_local: true
  });
};

export const getUserByWallet = async (walletAddress: string) => {
  const { data, error } = await supabase
    .from('users')
    .select('*, user_profiles(*)')
    .eq('wallet_address', walletAddress)
    .single();
  
  return { data, error };
};

export const createUser = async (walletAddress: string, role: 'patient' | 'provider') => {
  const { data, error } = await supabase
    .from('users')
    .insert({ wallet_address: walletAddress, role })
    .select()
    .single();
  
  return { data, error };
};

export const updateUserProfile = async (userId: string, profile: Partial<UserProfile>) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .upsert({ user_id: userId, ...profile })
    .select()
    .single();
  
  return { data, error };
};

export const createMedicalRecord = async (record: Omit<MedicalRecord, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('medical_records')
    .insert(record)
    .select()
    .single();
  
  return { data, error };
};

export const getUserMedicalRecords = async (userId: string) => {
  const { data, error } = await supabase
    .from('medical_records')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  return { data, error };
};

export const createAuditLog = async (log: Omit<AuditLog, 'id' | 'created_at'>) => {
  const { data, error } = await supabase
    .from('audit_logs')
    .insert(log)
    .select()
    .single();
  
  return { data, error };
};

export const getUserAuditLogs = async (userId: string, limit = 50, offset = 0) => {
  const { data, error } = await supabase
    .from('audit_logs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
  
  return { data, error };
};
