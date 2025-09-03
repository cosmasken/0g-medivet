-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (Web3 authentication)
CREATE TABLE users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  wallet_address TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('patient', 'provider')),
  is_onboarded BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User profiles table
CREATE TABLE user_profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  date_of_birth DATE,
  contact TEXT,
  emergency_contact TEXT,
  medical_history TEXT,
  allergies TEXT,
  medications TEXT,
  monetize_enabled BOOLEAN DEFAULT FALSE,
  profile_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Medical records table (metadata for 0G uploads)
CREATE TABLE medical_records (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  file_type TEXT,
  file_size BIGINT,
  zero_g_hash TEXT UNIQUE NOT NULL, -- 0G storage hash
  merkle_root TEXT,
  transaction_hash TEXT,
  upload_status TEXT DEFAULT 'pending' CHECK (upload_status IN ('pending', 'uploading', 'completed', 'failed')),
  tags TEXT[],
  is_shared BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Provider permissions table
CREATE TABLE provider_permissions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  patient_id UUID REFERENCES users(id) ON DELETE CASCADE,
  provider_id UUID REFERENCES users(id) ON DELETE CASCADE,
  record_id UUID REFERENCES medical_records(id) ON DELETE CASCADE,
  permission_level TEXT NOT NULL CHECK (permission_level IN ('view', 'edit', 'full')),
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  UNIQUE(patient_id, provider_id, record_id)
);

-- Audit logs table
CREATE TABLE audit_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  details TEXT,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Monetization records table
CREATE TABLE monetization_records (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  patient_id UUID REFERENCES users(id) ON DELETE CASCADE,
  record_id UUID REFERENCES medical_records(id) ON DELETE CASCADE,
  price_eth DECIMAL(18, 18),
  is_listed BOOLEAN DEFAULT FALSE,
  anonymized_data JSONB,
  purchase_count INTEGER DEFAULT 0,
  total_earnings DECIMAL(18, 18) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Marketplace transactions table
CREATE TABLE marketplace_transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  buyer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  seller_id UUID REFERENCES users(id) ON DELETE CASCADE,
  record_id UUID REFERENCES medical_records(id) ON DELETE CASCADE,
  monetization_record_id UUID REFERENCES monetization_records(id) ON DELETE CASCADE,
  amount_eth DECIMAL(18, 18) NOT NULL,
  transaction_hash TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Family members table
CREATE TABLE family_members (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  relationship TEXT NOT NULL,
  date_of_birth DATE,
  is_dependent BOOLEAN DEFAULT FALSE,
  emergency_contact BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Health metrics table
CREATE TABLE health_metrics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  metric_type TEXT NOT NULL,
  value DECIMAL,
  unit TEXT,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  source TEXT,
  notes TEXT
);

-- Medications table
CREATE TABLE medications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  dosage TEXT,
  frequency TEXT,
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT TRUE,
  prescriber TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_users_wallet_address ON users(wallet_address);
CREATE INDEX idx_medical_records_user_id ON medical_records(user_id);
CREATE INDEX idx_medical_records_zero_g_hash ON medical_records(zero_g_hash);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX idx_provider_permissions_patient_id ON provider_permissions(patient_id);
CREATE INDEX idx_provider_permissions_provider_id ON provider_permissions(provider_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_medical_records_updated_at BEFORE UPDATE ON medical_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_monetization_records_updated_at BEFORE UPDATE ON monetization_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (wallet_address = current_setting('app.current_user_wallet'));
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (wallet_address = current_setting('app.current_user_wallet'));

-- User profiles policies
CREATE POLICY "Users can view own user_profile" ON user_profiles FOR ALL USING (
  user_id IN (SELECT id FROM users WHERE wallet_address = current_setting('app.current_user_wallet'))
);

-- Medical records policies
CREATE POLICY "Users can manage own medical_records" ON medical_records FOR ALL USING (
  user_id IN (SELECT id FROM users WHERE wallet_address = current_setting('app.current_user_wallet'))
);

-- Providers can view records they have permission for
CREATE POLICY "Providers can view permitted records" ON medical_records FOR SELECT USING (
  id IN (
    SELECT record_id FROM provider_permissions pp
    JOIN users u ON pp.provider_id = u.id
    WHERE u.wallet_address = current_setting('app.current_user_wallet')
    AND pp.is_active = TRUE
  )
);

-- Audit logs policies
CREATE POLICY "Users can view own audit_logs" ON audit_logs FOR SELECT USING (
  user_id IN (SELECT id FROM users WHERE wallet_address = current_setting('app.current_user_wallet'))
);
