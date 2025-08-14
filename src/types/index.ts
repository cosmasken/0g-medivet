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
};

export type RecordStatus = 'Monetizable' | 'NonMonetizable' | 'Flagged';

export type HealthRecord = {
  id: number;
  owner: string; // Principal as string
  title: string;
  category: string;
  encryptedBlob: Uint8Array;
  attachment?: number;
  status: RecordStatus;
  createdAt: number;
  accessCount: number;
  sharedWith?: Share[];
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
};