export interface MonetizedRecord {
  id: string;
  patientId: string;
  recordId: string;
  recordType: 'lab' | 'imaging' | 'prescription' | 'visit' | 'vital' | 'allergy' | 'genetic' | 'mental-health';
  title: string;
  description: string;
  category: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'very-rare';
  basePrice: number;
  currentPrice: number;
  demandMultiplier: number;
  totalPurchases: number;
  revenueGenerated: number;
  isActive: boolean;
  tags: string[];
  anonymized: boolean;
  qualityScore: number; // 1-10 rating
  dataCompleteness: number; // percentage
  createdAt: string;
  lastPurchased?: string;
}

export interface MarketplaceTransaction {
  id: string;
  buyerId: string; // provider ID
  sellerId: string; // patient ID
  recordId: string;
  monetizedRecordId: string;
  amount: number;
  commission: number; // platform fee
  netAmount: number; // amount patient receives
  timestamp: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  accessDuration: number; // days
  accessExpiresAt: string;
}

export interface PatientEarnings {
  patientId: string;
  totalEarnings: number;
  totalRecordsSold: number;
  averageRecordPrice: number;
  monthlyEarnings: { month: string; amount: number }[];
  topPerformingRecords: string[];
  pendingPayouts: number;
}

export interface ProviderSpending {
  providerId: string;
  totalSpent: number;
  totalRecordsPurchased: number;
  averageRecordCost: number;
  monthlySpending: { month: string; amount: number }[];
  favoriteCategories: string[];
  activeSubscriptions: string[];
}

// Pricing tiers based on record type and rarity
export const RECORD_PRICING = {
  lab: { common: 25, uncommon: 45, rare: 85, 'very-rare': 150 },
  imaging: { common: 75, uncommon: 125, rare: 200, 'very-rare': 350 },
  prescription: { common: 15, uncommon: 30, rare: 60, 'very-rare': 120 },
  visit: { common: 40, uncommon: 70, rare: 120, 'very-rare': 200 },
  vital: { common: 10, uncommon: 20, rare: 40, 'very-rare': 80 },
  allergy: { common: 20, uncommon: 35, rare: 65, 'very-rare': 110 },
  genetic: { common: 200, uncommon: 400, rare: 800, 'very-rare': 1500 },
  'mental-health': { common: 60, uncommon: 100, rare: 180, 'very-rare': 300 }
};

export const PLATFORM_COMMISSION_RATE = 0.15; // 15% platform fee

// Mock monetized records
export const mockMonetizedRecords: MonetizedRecord[] = [
  {
    id: 'mr1',
    patientId: 'patient-1',
    recordId: 'record-1',
    recordType: 'genetic',
    title: 'BRCA1/BRCA2 Genetic Testing Results',
    description: 'Comprehensive genetic analysis for breast cancer susceptibility',
    category: 'Oncology Genetics',
    rarity: 'rare',
    basePrice: RECORD_PRICING.genetic.rare,
    currentPrice: 920, // demand adjusted
    demandMultiplier: 1.15,
    totalPurchases: 12,
    revenueGenerated: 8640,
    isActive: true,
    tags: ['genetics', 'oncology', 'BRCA', 'hereditary', 'cancer-risk'],
    anonymized: true,
    qualityScore: 9.2,
    dataCompleteness: 95,
    createdAt: '2024-01-15T10:00:00Z',
    lastPurchased: '2024-08-20T14:30:00Z'
  },
  {
    id: 'mr2',
    patientId: 'patient-2',
    recordId: 'record-2',
    recordType: 'mental-health',
    title: 'Treatment-Resistant Depression Case Study',
    description: 'Detailed psychiatric evaluation and treatment response data',
    category: 'Mental Health',
    rarity: 'uncommon',
    basePrice: RECORD_PRICING['mental-health'].uncommon,
    currentPrice: 85,
    demandMultiplier: 0.85,
    totalPurchases: 8,
    revenueGenerated: 680,
    isActive: true,
    tags: ['psychiatry', 'depression', 'treatment-resistant', 'medication-response'],
    anonymized: true,
    qualityScore: 8.7,
    dataCompleteness: 88,
    createdAt: '2024-02-01T09:15:00Z',
    lastPurchased: '2024-08-18T11:45:00Z'
  },
  {
    id: 'mr3',
    patientId: 'patient-3',
    recordId: 'record-3',
    recordType: 'imaging',
    title: 'Rare Cardiac Anomaly MRI Series',
    description: 'Complete MRI imaging of congenital heart defect with surgical outcomes',
    category: 'Cardiology',
    rarity: 'very-rare',
    basePrice: RECORD_PRICING.imaging['very-rare'],
    currentPrice: 425,
    demandMultiplier: 1.21,
    totalPurchases: 15,
    revenueGenerated: 5250,
    isActive: true,
    tags: ['cardiology', 'congenital', 'MRI', 'surgical-outcomes', 'rare-disease'],
    anonymized: true,
    qualityScore: 9.8,
    dataCompleteness: 100,
    createdAt: '2024-01-20T16:20:00Z',
    lastPurchased: '2024-08-22T09:10:00Z'
  },
  {
    id: 'mr4',
    patientId: 'patient-4',
    recordId: 'record-4',
    recordType: 'lab',
    title: 'Autoimmune Marker Panel - Lupus Diagnosis',
    description: 'Comprehensive autoimmune testing leading to SLE diagnosis',
    category: 'Rheumatology',
    rarity: 'uncommon',
    basePrice: RECORD_PRICING.lab.uncommon,
    currentPrice: 52,
    demandMultiplier: 1.16,
    totalPurchases: 22,
    revenueGenerated: 990,
    isActive: true,
    tags: ['autoimmune', 'lupus', 'SLE', 'rheumatology', 'diagnosis'],
    anonymized: true,
    qualityScore: 8.9,
    dataCompleteness: 92,
    createdAt: '2024-01-25T13:45:00Z',
    lastPurchased: '2024-08-21T15:20:00Z'
  }
];

// Mock transactions
export const mockTransactions: MarketplaceTransaction[] = [
  {
    id: 'tx1',
    buyerId: 'p1',
    sellerId: 'patient-1',
    recordId: 'record-1',
    monetizedRecordId: 'mr1',
    amount: 920,
    commission: 138,
    netAmount: 782,
    timestamp: '2024-08-20T14:30:00Z',
    status: 'completed',
    accessDuration: 90,
    accessExpiresAt: '2024-11-18T14:30:00Z'
  },
  {
    id: 'tx2',
    buyerId: 'p2',
    sellerId: 'patient-2',
    recordId: 'record-2',
    monetizedRecordId: 'mr2',
    amount: 85,
    commission: 12.75,
    netAmount: 72.25,
    timestamp: '2024-08-18T11:45:00Z',
    status: 'completed',
    accessDuration: 30,
    accessExpiresAt: '2024-09-17T11:45:00Z'
  },
  {
    id: 'tx3',
    buyerId: 'p1',
    sellerId: 'patient-3',
    recordId: 'record-3',
    monetizedRecordId: 'mr3',
    amount: 425,
    commission: 63.75,
    netAmount: 361.25,
    timestamp: '2024-08-22T09:10:00Z',
    status: 'completed',
    accessDuration: 60,
    accessExpiresAt: '2024-10-21T09:10:00Z'
  }
];

// Mock patient earnings
export const mockPatientEarnings: PatientEarnings[] = [
  {
    patientId: 'patient-1',
    totalEarnings: 8640,
    totalRecordsSold: 12,
    averageRecordPrice: 720,
    monthlyEarnings: [
      { month: '2024-06', amount: 1200 },
      { month: '2024-07', amount: 1800 },
      { month: '2024-08', amount: 2400 }
    ],
    topPerformingRecords: ['mr1'],
    pendingPayouts: 782
  },
  {
    patientId: 'patient-2',
    totalEarnings: 680,
    totalRecordsSold: 8,
    averageRecordPrice: 85,
    monthlyEarnings: [
      { month: '2024-06', amount: 170 },
      { month: '2024-07', amount: 255 },
      { month: '2024-08', amount: 255 }
    ],
    topPerformingRecords: ['mr2'],
    pendingPayouts: 72.25
  }
];

// Mock provider spending
export const mockProviderSpending: ProviderSpending[] = [
  {
    providerId: 'p1',
    totalSpent: 3240,
    totalRecordsPurchased: 8,
    averageRecordCost: 405,
    monthlySpending: [
      { month: '2024-06', amount: 800 },
      { month: '2024-07', amount: 1200 },
      { month: '2024-08', amount: 1240 }
    ],
    favoriteCategories: ['Oncology Genetics', 'Cardiology', 'Rare Diseases'],
    activeSubscriptions: ['premium-genetics', 'cardiology-plus']
  },
  {
    providerId: 'p2',
    totalSpent: 1150,
    totalRecordsPurchased: 15,
    averageRecordCost: 76.67,
    monthlySpending: [
      { month: '2024-06', amount: 300 },
      { month: '2024-07', amount: 425 },
      { month: '2024-08', amount: 425 }
    ],
    favoriteCategories: ['Mental Health', 'Rheumatology', 'Endocrinology'],
    activeSubscriptions: ['mental-health-basic']
  }
];

/**
 * Generate a random monetized record from patient data
 */
export const generateMonetizedRecord = (patientId: string, medicalRecord: any): MonetizedRecord => {
  const rarities: Array<'common' | 'uncommon' | 'rare' | 'very-rare'> = ['common', 'uncommon', 'rare', 'very-rare'];
  const rarity = rarities[Math.floor(Math.random() * rarities.length)];
  
  const recordType = medicalRecord.type as keyof typeof RECORD_PRICING;
  const basePrice = RECORD_PRICING[recordType]?.[rarity] || 50;
  
  const demandMultiplier = 0.7 + Math.random() * 0.6; // 0.7 to 1.3
  const currentPrice = Math.round(basePrice * demandMultiplier);
  
  const categories = {
    lab: ['Hematology', 'Chemistry', 'Microbiology', 'Immunology', 'Genetics'],
    imaging: ['Radiology', 'Cardiology', 'Neurology', 'Orthopedics', 'Oncology'],
    prescription: ['Pharmacology', 'Psychiatry', 'Cardiology', 'Endocrinology', 'Pain Management'],
    visit: ['Primary Care', 'Specialty Care', 'Emergency Medicine', 'Preventive Care'],
    vital: ['Monitoring', 'Critical Care', 'Chronic Disease', 'Wellness'],
    allergy: ['Immunology', 'Dermatology', 'Pulmonology', 'Emergency Medicine'],
    genetic: ['Oncology Genetics', 'Rare Diseases', 'Pharmacogenomics', 'Hereditary Conditions'],
    'mental-health': ['Psychiatry', 'Psychology', 'Behavioral Health', 'Addiction Medicine']
  };
  
  const category = categories[recordType]?.[Math.floor(Math.random() * categories[recordType].length)] || 'General';
  
  return {
    id: `mr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    patientId,
    recordId: medicalRecord.id,
    recordType,
    title: `${medicalRecord.title} - Monetized`,
    description: `${medicalRecord.description} - Available for research and clinical reference`,
    category,
    rarity,
    basePrice,
    currentPrice,
    demandMultiplier,
    totalPurchases: Math.floor(Math.random() * 20),
    revenueGenerated: Math.floor(Math.random() * 5000),
    isActive: Math.random() > 0.1, // 90% active
    tags: [recordType, category.toLowerCase().replace(' ', '-'), rarity],
    anonymized: true,
    qualityScore: 6 + Math.random() * 4, // 6-10
    dataCompleteness: 70 + Math.random() * 30, // 70-100%
    createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
    lastPurchased: Math.random() > 0.3 ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString() : undefined
  };
};

/**
 * Calculate potential earnings for a medical record
 */
export const calculatePotentialEarnings = (record: any): { min: number; max: number; estimated: number } => {
  const recordType = record.type as keyof typeof RECORD_PRICING;
  const pricing = RECORD_PRICING[recordType] || RECORD_PRICING.visit;
  
  const min = pricing.common * 0.7; // Low demand
  const max = pricing['very-rare'] * 1.3; // High demand
  const estimated = (pricing.common + pricing.uncommon) / 2; // Average estimate
  
  return { min: Math.round(min), max: Math.round(max), estimated: Math.round(estimated) };
};
