export type Role = 'Patient' | 'Provider' | 'Admin';

export type PatientProfile = {
  fullName: string;
  dob: string;
  contact: string;
  emergency: string;
  medicalHistory?: string;
  allergies?: string;
  medications?: string;
  monetizeEnabled: boolean;
};

export type ProviderProfile = {
  name: string;
  license: string;
  specialty: string;
  contact: string;
  whitelisted: boolean; // admin toggle
  reputation: number; // 0-100
  bio?: string;
  organization?: string;
  lastInteraction?: string;
};

export type AdminProfile = {
  fullName: string;
  contact: string;
  department: string;
  adminLevel: string;
  permissions: string[];
};

export type RecordStatus = 'Monetizable' | 'NonMonetizable' | 'Flagged';

export type HealthRecord = {
  id: number;
  owner: string; // Principal as string
  title: string;
  category: string;
  // 0G Storage fields
  storageHash?: string; // Root hash from 0G Storage
  fileName?: string; // Original file name
  fileSize?: number; // File size in bytes
  mimeType?: string; // MIME type (e.g., 'application/dicom', 'application/pdf')
  // Legacy field for backward compatibility
  encryptedBlob?: Uint8Array;
  attachment?: number;
  status: RecordStatus;
  createdAt: number;
  accessCount: number;
  sharedWith?: Share[];
  // Transaction info
  txHash?: string; // Transaction hash from upload
  isUploading?: boolean; // Upload status
  uploadError?: string; // Upload error message
};

export type Share = {
  provider: string;
  expiresAt?: number;
};

export type Bid = {
  id: number;
  recordId: number;
  provider: string;
  amount: number; // MT
  placedAt: number;
  status: 'pending' | 'accepted' | 'rejected';
};

export type User = {
  id: string;
  role: Role;
  profile: PatientProfile | ProviderProfile;
  principal: string;
};

export type MarketplaceListing = {
  id: number;
  recordId: number;
  patient: string;
  title: string;
  category: string;
  description: string;
  minimumBid: number;
  currentHighestBid?: number;
  bidCount: number;
  listedAt: number;
  expiresAt: number;
  status: 'active' | 'sold' | 'expired';
  correctness: number;
  dataPoints: number;
  anonymization: string;
};

export type AuditLogEvent = {
  id: string;
  timestamp: number;
  actor: { id: string; role: Role; name: string };
  action: 'CREATE' | 'SHARE' | 'VIEW' | 'DOWNLOAD' | 'REVOKE' | 'EXPIRE' | 'AI_DEMO_MOCK';
  recordId: number;
  recordTitle: string;
  target?: { id: string; role: Role; name: string };
  txHash: string;
  details: Record<string, any>;
};