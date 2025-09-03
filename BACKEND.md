# Medivet Backend Architecture & Database Schema

## Overview
This document outlines the backend architecture for Medivet, a patient-controlled health data platform with wallet-based authentication, granular permissions, and comprehensive audit trails.

## Core Principles
- **Patient-Controlled Access**: Patients own and control all their health data
- **Wallet-Based Authentication**: Each user authenticates using their crypto wallet
- **Granular Permissions**: Fine-grained access control at the field level
- **Zero-Trust Architecture**: All access requires explicit permission and verification
- **Comprehensive Audit Trail**: Every action is logged and immutable
- **HIPAA Compliance**: Full compliance with healthcare data regulations
- **Decentralized Storage**: Files stored on 0G Network for security and availability

## Authentication & Identity System

### User Identity Schema
```typescript
interface UserIdentity {
  id: string;                    // UUID v4
  walletAddress: string;         // Ethereum wallet address (unique identifier)
  role: 'patient' | 'provider' | 'admin';
  isActive: boolean;
  lastLogin: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface WalletSession {
  id: string;
  userId: string;
  walletAddress: string;
  sessionToken: string;          // JWT token
  expiresAt: Date;
  ipAddress: string;
  userAgent: string;
  isActive: boolean;
  createdAt: Date;
}
```

### Authentication Functions
```typescript
// Wallet-Based Authentication Functions
function authenticateWallet(walletAddress: string, signature: string): Promise<AuthResult>
function generateSessionToken(userId: string, walletAddress: string): string
function verifySessionToken(token: string): Promise<UserSession>
function refreshSession(sessionId: string): Promise<string>
function revokeSession(sessionId: string): Promise<void>
```

## Core Database Schema

### 1. Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address VARCHAR(42) UNIQUE NOT NULL,
  role ENUM('patient', 'provider', 'admin') NOT NULL,
  email VARCHAR(255),
  email_verified BOOLEAN DEFAULT FALSE,
  phone VARCHAR(20),
  phone_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMP,
  failed_login_attempts INTEGER DEFAULT 0,
  account_locked_until TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_wallet_address ON users(wallet_address);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
```

### 2. Wallet Sessions Table
```sql
CREATE TABLE wallet_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  wallet_address VARCHAR(42) NOT NULL,
  session_token VARCHAR(512) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  ip_address INET NOT NULL,
  user_agent TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sessions_user_id ON wallet_sessions(user_id);
CREATE INDEX idx_sessions_token ON wallet_sessions(session_token);
CREATE INDEX idx_sessions_expires ON wallet_sessions(expires_at);
```

### 3. Patients Table
```sql
CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Personal Information (Encrypted at application level)
  encrypted_name TEXT NOT NULL,
  encrypted_date_of_birth TEXT NOT NULL,
  encrypted_address TEXT,
  encrypted_phone TEXT,
  
  -- Emergency Contact (Encrypted)
  encrypted_emergency_contact TEXT,
  
  -- Profile Information
  avatar_url VARCHAR(500),
  timezone VARCHAR(50) DEFAULT 'UTC',
  preferred_language VARCHAR(10) DEFAULT 'en',
  
  -- Privacy Settings
  allow_family_access BOOLEAN DEFAULT FALSE,
  allow_anonymous_research BOOLEAN DEFAULT FALSE,
  audit_logging_enabled BOOLEAN DEFAULT TRUE,
  allow_emergency_override BOOLEAN DEFAULT TRUE,
  
  -- Metadata
  profile_completion_percentage INTEGER DEFAULT 0,
  last_profile_update TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_patients_user_id ON patients(user_id);
```

### 4. Providers Table
```sql
CREATE TABLE providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Provider Information (Encrypted at application level)
  encrypted_name TEXT NOT NULL,
  encrypted_specialty TEXT NOT NULL,
  encrypted_organization TEXT NOT NULL,
  encrypted_phone TEXT,
  encrypted_address TEXT,
  
  -- Professional Information
  license_number VARCHAR(100),
  license_state VARCHAR(2),
  license_expiry DATE,
  npi_number VARCHAR(10),
  dea_number VARCHAR(20),
  
  -- Verification Status
  is_verified BOOLEAN DEFAULT FALSE,
  verification_date TIMESTAMP,
  verification_method VARCHAR(50),
  
  -- Profile Information
  avatar_url VARCHAR(500),
  bio TEXT,
  specializations TEXT[],
  languages_spoken TEXT[],
  
  -- Settings
  accepts_new_patients BOOLEAN DEFAULT TRUE,
  telehealth_enabled BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_providers_user_id ON providers(user_id);
CREATE INDEX idx_providers_npi ON providers(npi_number);
CREATE INDEX idx_providers_license ON providers(license_number);
```

### 5. Medical Files Table (0G Storage Integration)
```sql
CREATE TABLE medical_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  
  -- File Information
  original_filename VARCHAR(255) NOT NULL,
  file_type VARCHAR(100) NOT NULL,        -- MIME type
  file_size_bytes BIGINT NOT NULL,
  category VARCHAR(100),                  -- 'lab', 'imaging', 'prescription', etc.
  description TEXT,
  
  -- 0G Storage Information
  root_hash VARCHAR(66) NOT NULL,         -- 0G storage hash
  tx_hash VARCHAR(66) NOT NULL,           -- Transaction hash
  storage_nodes TEXT[],                   -- Array of storage node URLs
  
  -- Classification
  is_text_record BOOLEAN DEFAULT FALSE,   -- true for JSON records, false for binary files
  record_type ENUM('visit', 'prescription', 'lab', 'diagnosis', 'imaging', 'custom'),
  tags TEXT[],
  
  -- Sharing and Access
  is_shared BOOLEAN DEFAULT FALSE,
  shared_with_providers UUID[],           -- Array of provider IDs with access
  
  -- Metadata
  uploaded_by UUID NOT NULL REFERENCES users(id),
  upload_date TIMESTAMP NOT NULL DEFAULT NOW(),
  last_accessed TIMESTAMP,
  access_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_medical_files_patient_id ON medical_files(patient_id);
CREATE INDEX idx_medical_files_root_hash ON medical_files(root_hash);
CREATE INDEX idx_medical_files_category ON medical_files(category);
CREATE INDEX idx_medical_files_tags ON medical_files USING GIN(tags);
```

### 6. Medical Records Table
```sql
CREATE TABLE medical_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  
  -- Record Classification
  record_type ENUM('lab', 'imaging', 'prescription', 'visit', 'vital', 'allergy', 'procedure', 'vaccination') NOT NULL,
  category ENUM('preventive', 'diagnostic', 'treatment', 'emergency', 'routine', 'chronic_care', 'mental_health') NOT NULL,
  
  -- Content (Encrypted at application level)
  encrypted_title TEXT NOT NULL,
  encrypted_description TEXT NOT NULL,
  encrypted_notes TEXT,
  
  -- Metadata
  record_date DATE NOT NULL,
  provider_id UUID REFERENCES providers(id),
  encrypted_provider_name TEXT,
  
  -- Sensitivity & Access Control
  sensitivity_level ENUM('low', 'medium', 'high', 'critical') NOT NULL DEFAULT 'medium',
  is_sensitive BOOLEAN DEFAULT FALSE,
  requires_explicit_consent BOOLEAN DEFAULT FALSE,
  
  -- Tags and Classification
  tags TEXT[],
  icd_10_codes TEXT[],
  cpt_codes TEXT[],
  
  -- File Attachments
  attached_file_ids UUID[],               -- References to medical_files
  
  -- Sharing and Access
  shared_with_provider_ids UUID[],
  family_relevant BOOLEAN DEFAULT FALSE,
  
  -- Versioning
  version INTEGER DEFAULT 1,
  parent_record_id UUID REFERENCES medical_records(id),
  is_latest_version BOOLEAN DEFAULT TRUE,
  
  -- Audit Fields
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMP
);

CREATE INDEX idx_medical_records_patient_id ON medical_records(patient_id);
CREATE INDEX idx_medical_records_type ON medical_records(record_type);
CREATE INDEX idx_medical_records_date ON medical_records(record_date);
CREATE INDEX idx_medical_records_sensitivity ON medical_records(sensitivity_level);
CREATE INDEX idx_medical_records_tags ON medical_records USING GIN(tags);
```

### 6. Granular Permissions System
```sql
CREATE TABLE permission_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  permissions JSONB NOT NULL,              -- Structured permission object
  is_system_template BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE patient_provider_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  
  -- Granular Permissions (Encrypted)
  encrypted_permissions JSONB NOT NULL,   -- IBE encrypted permission object
  
  -- Permission Structure:
  -- {
  --   "basic_info": { "read": true, "write": false },
  --   "medical_history": { "read": true, "write": false },
  --   "lab_results": { "read": true, "write": false },
  --   "imaging": { "read": false, "write": false },
  --   "prescriptions": { "read": true, "write": true },
  --   "vitals": { "read": true, "write": false },
  --   "allergies": { "read": true, "write": false },
  --   "emergency_contact": { "read": true, "write": false },
  --   "mental_health": { "read": false, "write": false },
  --   "genetic_data": { "read": false, "write": false },
  --   "insurance_info": { "read": true, "write": false }
  -- }
  
  -- Access Control
  is_active BOOLEAN DEFAULT TRUE,
  granted_at TIMESTAMP NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMP,                   -- Optional expiration
  last_used TIMESTAMP,
  
  -- Emergency Override
  emergency_override_enabled BOOLEAN DEFAULT TRUE,
  emergency_override_used TIMESTAMP,
  emergency_override_reason TEXT,
  
  -- Audit Fields
  granted_by UUID NOT NULL REFERENCES users(id),  -- Usually the patient
  revoked_by UUID REFERENCES users(id),
  revoked_at TIMESTAMP,
  revoke_reason TEXT,
  
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  
  UNIQUE(patient_id, provider_id)
);

CREATE INDEX idx_permissions_patient_id ON patient_provider_permissions(patient_id);
CREATE INDEX idx_permissions_provider_id ON patient_provider_permissions(provider_id);
CREATE INDEX idx_permissions_active ON patient_provider_permissions(is_active);
```
### 7. Medications Table
```sql
CREATE TABLE medications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  
  -- Medication Information (Encrypted)
  encrypted_name TEXT NOT NULL,
  encrypted_generic_name TEXT NOT NULL,
  encrypted_brand_name TEXT,
  encrypted_dosage TEXT NOT NULL,
  encrypted_instructions TEXT NOT NULL,
  
  -- Prescription Details
  frequency VARCHAR(50) NOT NULL,         -- 'daily', 'twice_daily', 'as_needed'
  route ENUM('oral', 'topical', 'injection', 'inhaled', 'sublingual', 'other') NOT NULL,
  
  -- Provider Information
  prescribed_by UUID REFERENCES providers(id),
  encrypted_prescriber_name TEXT,         -- Fallback if provider not in system
  prescribed_date DATE NOT NULL,
  
  -- Schedule
  start_date DATE NOT NULL,
  end_date DATE,
  refills_remaining INTEGER DEFAULT 0,
  total_refills INTEGER DEFAULT 0,
  
  -- Classification
  category ENUM('cardiovascular', 'diabetes', 'pain', 'antibiotic', 'mental_health', 'allergy', 'other') NOT NULL,
  priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
  
  -- Drug Information
  ndc_code VARCHAR(20),                   -- National Drug Code
  rx_number VARCHAR(50),
  
  -- Side Effects and Interactions (Encrypted)
  encrypted_side_effects TEXT,            -- JSON array of side effects
  
  -- Cost Information (Encrypted)
  encrypted_cost_info TEXT,               -- JSON: {copay, insurance, total}
  
  -- Pharmacy Information (Encrypted)
  encrypted_pharmacy_info TEXT,           -- JSON: {id, name, phone, address}
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  discontinued_date DATE,
  discontinuation_reason TEXT,
  
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_medications_patient_id ON medications(patient_id);
CREATE INDEX idx_medications_active ON medications(is_active);
CREATE INDEX idx_medications_category ON medications(category);
```

### 8. Medication Reminders Table
```sql
CREATE TABLE medication_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medication_id UUID NOT NULL REFERENCES medications(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  
  -- Reminder Schedule
  reminder_time TIME NOT NULL,            -- HH:MM format
  days_of_week INTEGER[] NOT NULL,        -- [1,2,3,4,5] for weekdays (1=Monday)
  
  -- Reminder Settings
  reminder_type ENUM('notification', 'sms', 'email', 'call') DEFAULT 'notification',
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Tracking
  last_taken TIMESTAMP,
  next_due TIMESTAMP,
  missed_doses INTEGER DEFAULT 0,
  total_doses INTEGER DEFAULT 0,
  
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reminders_medication_id ON medication_reminders(medication_id);
CREATE INDEX idx_reminders_patient_id ON medication_reminders(patient_id);
CREATE INDEX idx_reminders_next_due ON medication_reminders(next_due);
```

### 9. Health Timeline Events Table
```sql
CREATE TABLE health_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  
  -- Event Classification
  event_type ENUM('visit', 'lab', 'imaging', 'prescription', 'procedure', 'vaccination', 'emergency', 'milestone', 'symptom', 'vital') NOT NULL,
  category ENUM('preventive', 'diagnostic', 'treatment', 'emergency', 'routine', 'chronic_care', 'mental_health') NOT NULL,
  
  -- Event Details (Encrypted)
  encrypted_title TEXT NOT NULL,
  encrypted_description TEXT NOT NULL,
  
  -- Event Metadata
  event_date DATE NOT NULL,
  provider_id UUID REFERENCES providers(id),
  encrypted_provider_name TEXT,
  encrypted_location TEXT,
  
  -- Severity and Outcome
  severity ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
  outcome ENUM('positive', 'negative', 'neutral', 'ongoing') DEFAULT 'neutral',
  
  -- Relationships
  related_event_ids UUID[],               -- Array of related event IDs
  parent_event_id UUID REFERENCES health_events(id),
  
  -- Cost Information (Encrypted)
  encrypted_cost_info TEXT,               -- JSON: {total, insurance, outOfPocket}
  
  -- Clinical Data (Encrypted)
  encrypted_vitals TEXT,                  -- JSON: vitals data
  encrypted_lab_results TEXT,             -- JSON: lab results
  
  -- Tags and Classification
  tags TEXT[],
  icd_10_codes TEXT[],
  cpt_codes TEXT[],
  
  -- Family Relevance
  family_relevant BOOLEAN DEFAULT FALSE,
  genetic_relevance BOOLEAN DEFAULT FALSE,
  
  -- Attachments
  attachment_ids UUID[],                  -- References to medical_attachments
  
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_health_events_patient_id ON health_events(patient_id);
CREATE INDEX idx_health_events_date ON health_events(event_date);
CREATE INDEX idx_health_events_type ON health_events(event_type);
CREATE INDEX idx_health_events_tags ON health_events USING GIN(tags);
```

### 10. Family Members Table
```sql
CREATE TABLE family_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  linked_user_id UUID REFERENCES users(id),    -- If family member has their own account
  
  -- Personal Information (Encrypted)
  encrypted_first_name TEXT NOT NULL,
  encrypted_last_name TEXT NOT NULL,
  encrypted_date_of_birth TEXT,
  
  -- Relationship
  relationship ENUM('spouse', 'child', 'parent', 'sibling', 'grandparent', 'other') NOT NULL,
  gender ENUM('male', 'female', 'other', 'prefer_not_to_say'),
  
  -- Contact Information (Encrypted)
  encrypted_contact_info TEXT,            -- JSON: {phone, email, address}
  
  -- Medical Information (Encrypted)
  encrypted_medical_info TEXT,            -- JSON: {allergies, medications, conditions, emergencyMedicalInfo}
  encrypted_blood_type TEXT,
  
  -- Insurance Information (Encrypted)
  encrypted_insurance_info TEXT,          -- JSON: {provider, policyNumber, groupNumber, isPrimary}
  
  -- Status and Permissions
  is_dependent BOOLEAN DEFAULT FALSE,
  is_emergency_contact BOOLEAN DEFAULT FALSE,
  account_status ENUM('active', 'pending', 'inactive') DEFAULT 'pending',
  
  -- Permissions (Encrypted)
  encrypted_permissions TEXT,             -- JSON: permission settings
  
  -- Profile
  avatar_url VARCHAR(500),
  last_active TIMESTAMP,
  
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_family_members_patient_id ON family_members(patient_id);
CREATE INDEX idx_family_members_relationship ON family_members(relationship);
CREATE INDEX idx_family_members_linked_user ON family_members(linked_user_id);
```
### 11. Comprehensive Audit Trail
```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Actor Information
  actor_user_id UUID NOT NULL REFERENCES users(id),
  actor_type ENUM('patient', 'provider', 'system', 'researcher', 'admin') NOT NULL,
  actor_ip_address INET NOT NULL,
  actor_user_agent TEXT,
  actor_organization VARCHAR(255),
  
  -- Action Details
  action ENUM('view', 'download', 'share', 'modify', 'delete', 'export', 'print', 'access_granted', 'access_denied', 'login', 'logout') NOT NULL,
  resource_type ENUM('medical_record', 'patient_profile', 'permission_setting', 'data_export', 'medication', 'health_event', 'family_member') NOT NULL,
  resource_id UUID NOT NULL,
  resource_name VARCHAR(255),
  
  -- Target Information (for actions involving multiple parties)
  target_user_id UUID REFERENCES users(id),
  target_type ENUM('patient', 'provider', 'system', 'researcher', 'admin'),
  
  -- Context and Details
  encrypted_details TEXT NOT NULL,        -- JSON with action-specific details
  method ENUM('web', 'api', 'mobile', 'integration') NOT NULL,
  session_id VARCHAR(128),
  request_id VARCHAR(128),
  
  -- Location and Duration
  location_country VARCHAR(2),
  location_region VARCHAR(100),
  duration_seconds INTEGER,
  data_size_bytes BIGINT,
  
  -- Outcome and Risk Assessment
  outcome ENUM('success', 'failure', 'partial', 'blocked') NOT NULL,
  risk_score INTEGER CHECK (risk_score >= 0 AND risk_score <= 100),
  compliance_flags TEXT[],                -- Array of compliance-related flags
  
  -- Reason and Purpose
  encrypted_reason TEXT,                  -- Why the action was performed
  encrypted_purpose TEXT,                 -- Business purpose
  
  -- Timestamps
  timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Partitioning by month for performance
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp);
CREATE INDEX idx_audit_logs_actor ON audit_logs(actor_user_id);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_outcome ON audit_logs(outcome);
```

### 12. Data Sharing and Monetization
```sql
CREATE TABLE data_sharing_agreements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  
  -- Recipient Information
  recipient_type ENUM('researcher', 'pharmaceutical', 'insurance', 'government', 'academic') NOT NULL,
  recipient_organization VARCHAR(255) NOT NULL,
  recipient_contact_info TEXT,
  
  -- Agreement Details (Encrypted)
  encrypted_purpose TEXT NOT NULL,
  encrypted_data_types TEXT NOT NULL,     -- JSON array of data types shared
  encrypted_compensation_terms TEXT,      -- JSON: compensation details
  
  -- Scope and Limitations
  data_anonymization_level ENUM('none', 'basic', 'advanced', 'full') DEFAULT 'basic',
  geographic_restrictions TEXT[],         -- Array of allowed regions
  usage_restrictions TEXT[],              -- Array of usage limitations
  
  -- Timeline
  effective_date DATE NOT NULL,
  expiration_date DATE,
  auto_renewal BOOLEAN DEFAULT FALSE,
  
  -- Status
  status ENUM('draft', 'active', 'suspended', 'terminated', 'expired') DEFAULT 'draft',
  signed_at TIMESTAMP,
  
  -- Financial Terms (Encrypted)
  encrypted_payment_terms TEXT,           -- JSON: payment structure
  total_compensation_usd DECIMAL(10,2),
  
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_data_sharing_patient_id ON data_sharing_agreements(patient_id);
CREATE INDEX idx_data_sharing_status ON data_sharing_agreements(status);
```

### 13. Provider Access Requests
```sql
CREATE TABLE provider_access_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  
  -- Request Details (Encrypted)
  encrypted_purpose TEXT NOT NULL,
  encrypted_justification TEXT NOT NULL,
  requested_permissions JSONB NOT NULL,   -- Structured permission request
  
  -- Request Metadata
  urgency ENUM('low', 'medium', 'high', 'emergency') DEFAULT 'medium',
  expected_duration_days INTEGER,
  
  -- Status and Response
  status ENUM('pending', 'approved', 'denied', 'expired', 'withdrawn') DEFAULT 'pending',
  patient_response TEXT,
  response_date TIMESTAMP,
  
  -- Expiration
  expires_at TIMESTAMP NOT NULL,
  
  -- Audit Fields
  requested_at TIMESTAMP NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_access_requests_provider_id ON provider_access_requests(provider_id);
CREATE INDEX idx_access_requests_patient_id ON provider_access_requests(patient_id);
CREATE INDEX idx_access_requests_status ON provider_access_requests(status);
```

## Core Backend Functions (Pseudocode)

### Identity and Encryption Functions
```typescript
// User Registration and Key Generation
async function registerUser(userData: UserRegistrationData): Promise<UserIdentity> {
  // Generate unique IBE key pair
  const { publicKey, privateKey } = generateIBEKeyPair(userData.email);
  
  // Hash private key for secure storage
  const privateKeyHash = hashWithSalt(privateKey, generateSalt());
  
  // Store user identity
  const userIdentity = await createUserIdentity({
    publicKey,
    privateKeyHash,
    ...userData
  });
  
  // Return public key to user (private key never stored)
  return userIdentity;
}

// Data Encryption
async function encryptPatientData(data: any, patientPublicKey: string): Promise<EncryptedData> {
  const encryptedData = await ibeEncrypt(data, patientPublicKey);
  const checksum = calculateChecksum(encryptedData);
  
  return {
    encryptedContent: encryptedData,
    checksum,
    encryptionAlgorithm: 'IBE-BF',
    encryptedAt: new Date()
  };
}

// Data Decryption with Permission Check
async function decryptPatientData(
  encryptedData: EncryptedData, 
  requestorUserId: string,
  patientId: string,
  dataType: string
): Promise<any> {
  // Verify permissions
  const hasPermission = await checkPermission(requestorUserId, patientId, dataType);
  if (!hasPermission) {
    await logAuditEvent('access_denied', requestorUserId, 'permission_denied');
    throw new Error('Access denied');
  }
  
  // Get requestor's private key
  const requestorKey = await getUserPrivateKey(requestorUserId);
  
  // Decrypt data
  const decryptedData = await ibeDecrypt(encryptedData.encryptedContent, requestorKey);
  
  // Log access
  await logAuditEvent('view', requestorUserId, 'data_accessed', {
    patientId,
    dataType,
    resourceId: encryptedData.id
  });
  
  return decryptedData;
}
```

### Permission Management Functions
```typescript
// Grant Provider Access
async function grantProviderAccess(
  patientId: string,
  providerId: string,
  permissions: PermissionSet,
  expirationDate?: Date
): Promise<void> {
  // Encrypt permissions with patient's public key
  const patientPublicKey = await getPatientPublicKey(patientId);
  const encryptedPermissions = await encryptPatientData(permissions, patientPublicKey);
  
  // Store permission grant
  await createPermissionGrant({
    patientId,
    providerId,
    encryptedPermissions,
    expirationDate,
    grantedBy: patientId
  });
  
  // Log permission grant
  await logAuditEvent('access_granted', patientId, 'permission_granted', {
    providerId,
    permissions: Object.keys(permissions)
  });
}

// Check Permission
async function checkPermission(
  requestorId: string,
  patientId: string,
  dataType: string,
  action: 'read' | 'write' = 'read'
): Promise<boolean> {
  // Get permission record
  const permissionRecord = await getPermissionRecord(requestorId, patientId);
  
  if (!permissionRecord || !permissionRecord.isActive) {
    return false;
  }
  
  // Check expiration
  if (permissionRecord.expiresAt && permissionRecord.expiresAt < new Date()) {
    return false;
  }
  
  // Decrypt permissions
  const requestorKey = await getUserPrivateKey(requestorId);
  const permissions = await ibeDecrypt(permissionRecord.encryptedPermissions, requestorKey);
  
  // Check specific permission
  return permissions[dataType] && permissions[dataType][action] === true;
}

// Emergency Override
async function emergencyOverride(
  providerId: string,
  patientId: string,
  justification: string
): Promise<TemporaryAccess> {
  // Verify provider credentials and emergency status
  const provider = await getProvider(providerId);
  if (!provider.isVerified) {
    throw new Error('Provider not verified for emergency access');
  }
  
  // Check patient's emergency override settings
  const patient = await getPatient(patientId);
  if (!patient.allowEmergencyOverride) {
    throw new Error('Patient has disabled emergency override');
  }
  
  // Grant temporary access (24 hours)
  const temporaryAccess = await createTemporaryAccess({
    providerId,
    patientId,
    justification,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    accessLevel: 'emergency_full'
  });
  
  // Log emergency access
  await logAuditEvent('emergency_access', providerId, 'emergency_override', {
    patientId,
    justification,
    riskScore: 95 // High risk score for emergency access
  });
  
  // Notify patient
  await notifyPatient(patientId, 'emergency_access_used', {
    providerId,
    timestamp: new Date(),
    justification
  });
  
  return temporaryAccess;
}
```
### Medical Record Management Functions
```typescript
// Create Medical Record
async function createMedicalRecord(
  patientId: string,
  recordData: MedicalRecordInput,
  createdBy: string
): Promise<MedicalRecord> {
  // Validate input
  validateMedicalRecordInput(recordData);
  
  // Get patient's public key for encryption
  const patientPublicKey = await getPatientPublicKey(patientId);
  
  // Encrypt sensitive fields
  const encryptedRecord = {
    id: generateUUID(),
    patientId,
    recordType: recordData.type,
    category: recordData.category,
    encryptedTitle: await encryptPatientData(recordData.title, patientPublicKey),
    encryptedDescription: await encryptPatientData(recordData.description, patientPublicKey),
    encryptedNotes: recordData.notes ? await encryptPatientData(recordData.notes, patientPublicKey) : null,
    recordDate: recordData.date,
    providerId: recordData.providerId,
    sensitivityLevel: recordData.sensitivityLevel || 'medium',
    isSensitive: recordData.sensitive || false,
    tags: recordData.tags || [],
    icd10Codes: recordData.icd10Codes || [],
    cptCodes: recordData.cptCodes || [],
    familyRelevant: recordData.familyRelevant || false,
    createdBy,
    createdAt: new Date()
  };
  
  // Store record
  const savedRecord = await saveToDatabase('medical_records', encryptedRecord);
  
  // Handle attachments if any
  if (recordData.attachments && recordData.attachments.length > 0) {
    await processAttachments(savedRecord.id, recordData.attachments, patientPublicKey);
  }
  
  // Log creation
  await logAuditEvent('create', createdBy, 'medical_record_created', {
    recordId: savedRecord.id,
    patientId,
    recordType: recordData.type
  });
  
  return savedRecord;
}

// Retrieve Medical Records with Permission Check
async function getMedicalRecords(
  patientId: string,
  requestorId: string,
  filters?: RecordFilters
): Promise<MedicalRecord[]> {
  // Check permission to view medical history
  const hasPermission = await checkPermission(requestorId, patientId, 'medical_history', 'read');
  if (!hasPermission) {
    throw new Error('Access denied to medical records');
  }
  
  // Get encrypted records
  const encryptedRecords = await queryDatabase('medical_records', {
    patientId,
    deletedAt: null,
    ...filters
  });
  
  // Decrypt records for authorized user
  const requestorKey = await getUserPrivateKey(requestorId);
  const decryptedRecords = await Promise.all(
    encryptedRecords.map(async (record) => ({
      ...record,
      title: await ibeDecrypt(record.encryptedTitle, requestorKey),
      description: await ibeDecrypt(record.encryptedDescription, requestorKey),
      notes: record.encryptedNotes ? await ibeDecrypt(record.encryptedNotes, requestorKey) : null
    }))
  );
  
  // Log access
  await logAuditEvent('view', requestorId, 'medical_records_accessed', {
    patientId,
    recordCount: decryptedRecords.length
  });
  
  return decryptedRecords;
}

// Share Medical Record with Provider
async function shareMedicalRecord(
  recordId: string,
  patientId: string,
  providerId: string,
  sharedBy: string
): Promise<void> {
  // Verify patient owns the record
  const record = await getMedicalRecord(recordId);
  if (record.patientId !== patientId) {
    throw new Error('Record does not belong to patient');
  }
  
  // Verify sharing permissions
  if (sharedBy !== patientId) {
    const canShare = await checkPermission(sharedBy, patientId, 'medical_history', 'write');
    if (!canShare) {
      throw new Error('No permission to share records');
    }
  }
  
  // Add provider to shared list
  await updateDatabase('medical_records', recordId, {
    sharedWithProviderIds: [...record.sharedWithProviderIds, providerId],
    updatedAt: new Date()
  });
  
  // Log sharing event
  await logAuditEvent('share', sharedBy, 'medical_record_shared', {
    recordId,
    patientId,
    providerId
  });
  
  // Notify provider
  await notifyProvider(providerId, 'record_shared', {
    patientId,
    recordId,
    recordTitle: record.title
  });
}
```

## API Endpoints Structure

### Authentication & Authorization
```typescript
// JWT Token with IBE Public Key
interface AuthToken {
  userId: string;
  userType: 'patient' | 'provider' | 'admin';
  publicKey: string;
  permissions: string[];
  iat: number;
  exp: number;
}

// Middleware for API Authentication
async function authenticateRequest(req: Request): Promise<AuthContext> {
  const token = extractBearerToken(req.headers.authorization);
  const decoded = verifyJWT(token);
  
  // Verify user is still active
  const user = await getUser(decoded.userId);
  if (!user || !user.isActive) {
    throw new Error('User account inactive');
  }
  
  // Check for suspicious activity
  await checkForSuspiciousActivity(decoded.userId, req.ip);
  
  return {
    userId: decoded.userId,
    userType: decoded.userType,
    publicKey: decoded.publicKey,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent']
  };
}
```

### Core API Endpoints
```typescript
// Patient Endpoints
POST   /api/v1/patients/register
POST   /api/v1/patients/login
GET    /api/v1/patients/profile
PUT    /api/v1/patients/profile
DELETE /api/v1/patients/account

// Medical Records
GET    /api/v1/patients/{patientId}/records
POST   /api/v1/patients/{patientId}/records
GET    /api/v1/patients/{patientId}/records/{recordId}
PUT    /api/v1/patients/{patientId}/records/{recordId}
DELETE /api/v1/patients/{patientId}/records/{recordId}
POST   /api/v1/patients/{patientId}/records/{recordId}/share
POST   /api/v1/patients/{patientId}/records/{recordId}/attachments

// Permissions Management
GET    /api/v1/patients/{patientId}/permissions
POST   /api/v1/patients/{patientId}/permissions/grant
PUT    /api/v1/patients/{patientId}/permissions/{providerId}
DELETE /api/v1/patients/{patientId}/permissions/{providerId}

// Provider Endpoints
POST   /api/v1/providers/register
GET    /api/v1/providers/patients
GET    /api/v1/providers/patients/{patientId}/records
POST   /api/v1/providers/access-requests
GET    /api/v1/providers/access-requests
POST   /api/v1/providers/emergency-access

// Medications
GET    /api/v1/patients/{patientId}/medications
POST   /api/v1/patients/{patientId}/medications
PUT    /api/v1/patients/{patientId}/medications/{medicationId}
DELETE /api/v1/patients/{patientId}/medications/{medicationId}
GET    /api/v1/patients/{patientId}/medications/reminders
POST   /api/v1/patients/{patientId}/medications/reminders

// Health Timeline
GET    /api/v1/patients/{patientId}/timeline
POST   /api/v1/patients/{patientId}/timeline/events
GET    /api/v1/patients/{patientId}/timeline/milestones

// Family Health
GET    /api/v1/patients/{patientId}/family
POST   /api/v1/patients/{patientId}/family/members
PUT    /api/v1/patients/{patientId}/family/members/{memberId}
DELETE /api/v1/patients/{patientId}/family/members/{memberId}

// Audit and Compliance
GET    /api/v1/patients/{patientId}/audit-logs
GET    /api/v1/patients/{patientId}/data-access-report
POST   /api/v1/patients/{patientId}/data-export
GET    /api/v1/patients/{patientId}/compliance-report
```

## Data Validation and Security

### Input Validation Functions
```typescript
// Medical Record Validation
function validateMedicalRecordInput(data: MedicalRecordInput): void {
  const schema = {
    type: { required: true, enum: ['lab', 'imaging', 'prescription', 'visit', 'vital', 'allergy'] },
    title: { required: true, maxLength: 255, sanitize: true },
    description: { required: true, maxLength: 5000, sanitize: true },
    date: { required: true, type: 'date', maxDate: new Date() },
    sensitivityLevel: { enum: ['low', 'medium', 'high', 'critical'] },
    tags: { type: 'array', maxItems: 20, itemMaxLength: 50 }
  };
  
  validateAgainstSchema(data, schema);
}

// Permission Validation
function validatePermissionGrant(permissions: PermissionSet): void {
  const allowedPermissions = [
    'basic_info', 'medical_history', 'lab_results', 'imaging',
    'prescriptions', 'vitals', 'allergies', 'emergency_contact',
    'mental_health', 'genetic_data', 'insurance_info'
  ];
  
  for (const [key, value] of Object.entries(permissions)) {
    if (!allowedPermissions.includes(key)) {
      throw new Error(`Invalid permission: ${key}`);
    }
    
    if (typeof value !== 'object' || !('read' in value) || !('write' in value)) {
      throw new Error(`Invalid permission structure for: ${key}`);
    }
  }
}

// Rate Limiting
async function checkRateLimit(userId: string, endpoint: string): Promise<void> {
  const key = `rate_limit:${userId}:${endpoint}`;
  const current = await redis.get(key);
  
  if (current && parseInt(current) > getRateLimit(endpoint)) {
    throw new Error('Rate limit exceeded');
  }
  
  await redis.incr(key);
  await redis.expire(key, 3600); // 1 hour window
}

// Suspicious Activity Detection
async function checkForSuspiciousActivity(userId: string, ipAddress: string): Promise<void> {
  const recentLogins = await getRecentLogins(userId, 24); // Last 24 hours
  
  // Check for multiple IP addresses
  const uniqueIPs = new Set(recentLogins.map(login => login.ipAddress));
  if (uniqueIPs.size > 5) {
    await flagSuspiciousActivity(userId, 'multiple_ip_addresses');
  }
  
  // Check for unusual access patterns
  const accessPattern = await analyzeAccessPattern(userId);
  if (accessPattern.riskScore > 80) {
    await flagSuspiciousActivity(userId, 'unusual_access_pattern');
  }
}
```

## Security Measures

### Encryption at Rest and in Transit
```typescript
// Database Encryption Configuration
const dbConfig = {
  encryption: {
    algorithm: 'AES-256-GCM',
    keyRotationInterval: '90d',
    encryptionAtRest: true,
    transparentDataEncryption: true
  },
  ssl: {
    enabled: true,
    certificateValidation: true,
    minTlsVersion: '1.3'
  }
};

// API Security Headers
const securityHeaders = {
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'",
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin'
};

// Key Management
async function rotateEncryptionKeys(): Promise<void> {
  const usersToRotate = await getUsersWithExpiringKeys();
  
  for (const user of usersToRotate) {
    const { oldKey, newKey } = await rotateUserKeys(user.id);
    
    // Re-encrypt all user data with new key
    await reEncryptUserData(user.id, oldKey, newKey);
    
    // Update key rotation history
    await logKeyRotation(user.id, oldKey, newKey, 'scheduled');
  }
}
```

## Compliance and Monitoring

### HIPAA Compliance Functions
```typescript
// Business Associate Agreement Tracking
async function trackBAA(organizationId: string, baaDetails: BAADetails): Promise<void> {
  await saveToDatabase('business_associate_agreements', {
    organizationId,
    signedDate: baaDetails.signedDate,
    expirationDate: baaDetails.expirationDate,
    complianceRequirements: baaDetails.requirements,
    status: 'active'
  });
}

// Breach Detection and Notification
async function detectAndReportBreach(incident: SecurityIncident): Promise<void> {
  const riskAssessment = await assessBreachRisk(incident);
  
  if (riskAssessment.requiresNotification) {
    // Notify affected patients within 60 days
    await notifyAffectedPatients(incident.affectedUserIds);
    
    // Report to HHS within 60 days
    await reportToHHS(incident, riskAssessment);
    
    // Notify media if > 500 individuals affected
    if (incident.affectedUserIds.length > 500) {
      await notifyMedia(incident);
    }
  }
}

// Data Retention and Disposal
async function enforceDataRetention(): Promise<void> {
  const retentionPolicies = await getDataRetentionPolicies();
  
  for (const policy of retentionPolicies) {
    const expiredData = await findExpiredData(policy);
    
    for (const data of expiredData) {
      // Secure deletion with multiple overwrites
      await secureDelete(data.id);
      
      // Log disposal
      await logAuditEvent('delete', 'system', 'data_disposed', {
        dataId: data.id,
        retentionPolicy: policy.name,
        disposalMethod: 'secure_overwrite'
      });
    }
  }
}
```

This comprehensive backend architecture provides:

1. **Identity-Based Encryption** with unique public keys per user
2. **Granular Permissions** at the field level with patient control
3. **Comprehensive Audit Trail** for all actions
4. **HIPAA Compliance** with proper security measures
5. **Scalable Database Schema** with proper indexing
6. **Secure API Design** with authentication and rate limiting
7. **Data Validation** and input sanitization
8. **Emergency Access** capabilities with proper logging
9. **Family Health Management** with privacy controls
10. **Medication Management** with reminders and interactions

The system ensures patients maintain full control over their health data while enabling secure, auditable access for authorized healthcare providers.
