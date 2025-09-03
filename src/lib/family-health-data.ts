export interface FamilyMember {
  id: string;
  firstName: string;
  lastName: string;
  relationship: 'spouse' | 'child' | 'parent' | 'sibling' | 'grandparent' | 'other';
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  bloodType?: string;
  avatar?: string;
  isDependent: boolean;
  isEmergencyContact: boolean;
  contactInfo: {
    phone?: string;
    email?: string;
    address?: string;
  };
  medicalInfo: {
    allergies: string[];
    medications: string[];
    conditions: string[];
    emergencyMedicalInfo?: string;
  };
  insurance: {
    provider: string;
    policyNumber: string;
    groupNumber?: string;
    isPrimary: boolean;
  };
  permissions: {
    canViewMyRecords: boolean;
    canManageMyAppointments: boolean;
    canAccessEmergencyInfo: boolean;
    shareMyRecordsWithThem: boolean;
  };
  lastActive?: string;
  accountStatus: 'active' | 'pending' | 'inactive';
}

export interface FamilyHealthHistory {
  id: string;
  condition: string;
  familyMembers: string[]; // IDs of affected family members
  relationship: string; // e.g., "maternal grandmother", "paternal side"
  ageOfOnset?: number;
  severity: 'mild' | 'moderate' | 'severe';
  isHereditary: boolean;
  riskFactors: string[];
  preventiveMeasures: string[];
  notes?: string;
  relevantTests?: string[];
}

export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  alternatePhone?: string;
  email?: string;
  address: string;
  isPrimary: boolean;
  canMakeMedicalDecisions: boolean;
  notes?: string;
}

export interface CareCoordination {
  id: string;
  dependentId: string;
  careType: 'medical' | 'dental' | 'vision' | 'mental_health' | 'therapy' | 'other';
  provider: string;
  nextAppointment?: string;
  lastVisit?: string;
  notes?: string;
  medications?: string[];
  specialInstructions?: string;
  emergencyProtocol?: string;
}

export interface FamilyHealthAlert {
  id: string;
  type: 'appointment_reminder' | 'medication_reminder' | 'health_milestone' | 'emergency' | 'insurance_update';
  familyMemberId: string;
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'urgent';
  dueDate?: string;
  isRead: boolean;
  actionRequired: boolean;
  createdAt: string;
}

// Mock Family Members
export const mockFamilyMembers: FamilyMember[] = [
  {
    id: 'family-1',
    firstName: 'Michael',
    lastName: 'Johnson',
    relationship: 'spouse',
    dateOfBirth: '1988-03-15',
    gender: 'male',
    bloodType: 'A+',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=michael-johnson',
    isDependent: false,
    isEmergencyContact: true,
    contactInfo: {
      phone: '(555) 987-6543',
      email: 'michael.johnson@email.com',
      address: '123 Family Lane, Hometown, ST 12345'
    },
    medicalInfo: {
      allergies: ['Penicillin'],
      medications: ['Atorvastatin 20mg'],
      conditions: ['High Cholesterol', 'Seasonal Allergies'],
      emergencyMedicalInfo: 'No known drug allergies except Penicillin. Carries EpiPen for severe seasonal reactions.'
    },
    insurance: {
      provider: 'Blue Cross Blue Shield',
      policyNumber: 'BCBS-789456123',
      groupNumber: 'GRP-456789',
      isPrimary: true
    },
    permissions: {
      canViewMyRecords: true,
      canManageMyAppointments: true,
      canAccessEmergencyInfo: true,
      shareMyRecordsWithThem: true
    },
    lastActive: '2024-08-23T14:30:00Z',
    accountStatus: 'active'
  },
  {
    id: 'family-2',
    firstName: 'Emma',
    lastName: 'Johnson',
    relationship: 'child',
    dateOfBirth: '2015-07-22',
    gender: 'female',
    bloodType: 'O+',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emma-johnson',
    isDependent: true,
    isEmergencyContact: false,
    contactInfo: {
      phone: '(555) 987-6543', // Parent's phone
      address: '123 Family Lane, Hometown, ST 12345'
    },
    medicalInfo: {
      allergies: ['Tree Nuts', 'Shellfish'],
      medications: ['Children\'s Claritin as needed'],
      conditions: ['Asthma', 'Food Allergies'],
      emergencyMedicalInfo: 'Severe tree nut and shellfish allergies. Carries EpiPen Jr. Has rescue inhaler for asthma.'
    },
    insurance: {
      provider: 'Blue Cross Blue Shield',
      policyNumber: 'BCBS-789456123',
      groupNumber: 'GRP-456789',
      isPrimary: false
    },
    permissions: {
      canViewMyRecords: false,
      canManageMyAppointments: false,
      canAccessEmergencyInfo: false,
      shareMyRecordsWithThem: false
    },
    accountStatus: 'active'
  },
  {
    id: 'family-3',
    firstName: 'James',
    lastName: 'Johnson',
    relationship: 'child',
    dateOfBirth: '2018-11-08',
    gender: 'male',
    bloodType: 'A+',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=james-johnson',
    isDependent: true,
    isEmergencyContact: false,
    contactInfo: {
      phone: '(555) 987-6543', // Parent's phone
      address: '123 Family Lane, Hometown, ST 12345'
    },
    medicalInfo: {
      allergies: [],
      medications: [],
      conditions: [],
      emergencyMedicalInfo: 'No known allergies or medical conditions. Up to date on all vaccinations.'
    },
    insurance: {
      provider: 'Blue Cross Blue Shield',
      policyNumber: 'BCBS-789456123',
      groupNumber: 'GRP-456789',
      isPrimary: false
    },
    permissions: {
      canViewMyRecords: false,
      canManageMyAppointments: false,
      canAccessEmergencyInfo: false,
      shareMyRecordsWithThem: false
    },
    accountStatus: 'active'
  },
  {
    id: 'family-4',
    firstName: 'Margaret',
    lastName: 'Smith',
    relationship: 'parent',
    dateOfBirth: '1955-09-12',
    gender: 'female',
    bloodType: 'B+',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=margaret-smith',
    isDependent: false,
    isEmergencyContact: true,
    contactInfo: {
      phone: '(555) 234-5678',
      email: 'margaret.smith@email.com',
      address: '456 Senior Living Blvd, Hometown, ST 12345'
    },
    medicalInfo: {
      allergies: ['Sulfa drugs'],
      medications: ['Metformin 500mg', 'Lisinopril 10mg', 'Calcium + Vitamin D'],
      conditions: ['Type 2 Diabetes', 'Hypertension', 'Osteoporosis'],
      emergencyMedicalInfo: 'Diabetic - check blood sugar if unconscious. Takes blood pressure medication daily.'
    },
    insurance: {
      provider: 'Medicare + Supplement',
      policyNumber: 'MED-123456789',
      isPrimary: true
    },
    permissions: {
      canViewMyRecords: true,
      canManageMyAppointments: false,
      canAccessEmergencyInfo: true,
      shareMyRecordsWithThem: true
    },
    lastActive: '2024-08-20T09:15:00Z',
    accountStatus: 'active'
  }
];

// Mock Family Health History
export const mockFamilyHealthHistory: FamilyHealthHistory[] = [
  {
    id: 'history-1',
    condition: 'Type 2 Diabetes',
    familyMembers: ['family-4'],
    relationship: 'maternal side',
    ageOfOnset: 58,
    severity: 'moderate',
    isHereditary: true,
    riskFactors: ['Family history', 'Age over 45', 'Sedentary lifestyle'],
    preventiveMeasures: ['Regular blood sugar monitoring', 'Healthy diet', 'Regular exercise', 'Weight management'],
    notes: 'Mother diagnosed at age 58. Well-controlled with medication and lifestyle changes.',
    relevantTests: ['Hemoglobin A1C', 'Fasting glucose', 'Oral glucose tolerance test']
  },
  {
    id: 'history-2',
    condition: 'Hypertension',
    familyMembers: ['family-4'],
    relationship: 'maternal side',
    ageOfOnset: 52,
    severity: 'moderate',
    isHereditary: true,
    riskFactors: ['Family history', 'Age', 'Stress', 'Diet high in sodium'],
    preventiveMeasures: ['Regular blood pressure monitoring', 'Low sodium diet', 'Regular exercise', 'Stress management'],
    notes: 'Mother has well-controlled hypertension with ACE inhibitor.',
    relevantTests: ['Blood pressure monitoring', 'EKG', 'Echocardiogram']
  },
  {
    id: 'history-3',
    condition: 'Food Allergies',
    familyMembers: ['family-2'],
    relationship: 'child',
    ageOfOnset: 2,
    severity: 'severe',
    isHereditary: false,
    riskFactors: ['Early food introduction', 'Environmental factors'],
    preventiveMeasures: ['Strict avoidance', 'EpiPen availability', 'Allergy action plan'],
    notes: 'Emma has severe tree nut and shellfish allergies. Diagnosed at age 2.',
    relevantTests: ['Skin prick test', 'Blood IgE levels', 'Food challenge tests']
  },
  {
    id: 'history-4',
    condition: 'Asthma',
    familyMembers: ['family-2'],
    relationship: 'child',
    ageOfOnset: 4,
    severity: 'mild',
    isHereditary: true,
    riskFactors: ['Family history of allergies', 'Environmental triggers'],
    preventiveMeasures: ['Trigger avoidance', 'Rescue inhaler', 'Regular monitoring'],
    notes: 'Emma has mild asthma, well-controlled with as-needed bronchodilator.',
    relevantTests: ['Spirometry', 'Peak flow monitoring', 'Allergy testing']
  },
  {
    id: 'history-5',
    condition: 'High Cholesterol',
    familyMembers: ['family-1'],
    relationship: 'spouse',
    ageOfOnset: 32,
    severity: 'moderate',
    isHereditary: true,
    riskFactors: ['Family history', 'Diet', 'Sedentary lifestyle'],
    preventiveMeasures: ['Statin therapy', 'Heart-healthy diet', 'Regular exercise'],
    notes: 'Michael diagnosed with high cholesterol, managed with atorvastatin.',
    relevantTests: ['Lipid panel', 'Cardiac risk assessment']
  }
];

// Mock Emergency Contacts
export const mockEmergencyContacts: EmergencyContact[] = [
  {
    id: 'emergency-1',
    name: 'Michael Johnson',
    relationship: 'Spouse',
    phone: '(555) 987-6543',
    alternatePhone: '(555) 123-4567',
    email: 'michael.johnson@email.com',
    address: '123 Family Lane, Hometown, ST 12345',
    isPrimary: true,
    canMakeMedicalDecisions: true,
    notes: 'Primary emergency contact and medical decision maker'
  },
  {
    id: 'emergency-2',
    name: 'Margaret Smith',
    relationship: 'Mother',
    phone: '(555) 234-5678',
    email: 'margaret.smith@email.com',
    address: '456 Senior Living Blvd, Hometown, ST 12345',
    isPrimary: false,
    canMakeMedicalDecisions: true,
    notes: 'Secondary contact, can make medical decisions if spouse unavailable'
  },
  {
    id: 'emergency-3',
    name: 'Dr. Emily Smith',
    relationship: 'Primary Care Physician',
    phone: '(555) 345-6789',
    email: 'dr.smith@primarycare.com',
    address: 'Primary Care Clinic, 789 Medical Dr, Hometown, ST 12345',
    isPrimary: false,
    canMakeMedicalDecisions: false,
    notes: 'Primary care physician for medical consultation'
  },
  {
    id: 'emergency-4',
    name: 'Lisa Chen',
    relationship: 'Close Friend',
    phone: '(555) 456-7890',
    email: 'lisa.chen@email.com',
    address: '321 Friendship Ave, Hometown, ST 12345',
    isPrimary: false,
    canMakeMedicalDecisions: false,
    notes: 'Backup contact for child care emergencies'
  }
];

// Mock Care Coordination
export const mockCareCoordination: CareCoordination[] = [
  {
    id: 'care-1',
    dependentId: 'family-2',
    careType: 'medical',
    provider: 'Dr. Jennifer Martinez - Pediatrics',
    nextAppointment: '2024-09-15T10:00:00Z',
    lastVisit: '2024-06-15T10:00:00Z',
    notes: 'Annual well-child visit scheduled. Needs to discuss asthma management.',
    medications: ['Children\'s Claritin as needed', 'Albuterol inhaler'],
    specialInstructions: 'Always carry EpiPen Jr. and rescue inhaler to school.',
    emergencyProtocol: 'If severe allergic reaction: use EpiPen and call 911. If asthma attack: use rescue inhaler, if no improvement call 911.'
  },
  {
    id: 'care-2',
    dependentId: 'family-3',
    careType: 'medical',
    provider: 'Dr. Jennifer Martinez - Pediatrics',
    nextAppointment: '2024-10-08T14:30:00Z',
    lastVisit: '2024-07-08T14:30:00Z',
    notes: '6-year well-child visit. Due for school vaccinations.',
    medications: [],
    specialInstructions: 'No special medical needs. Up to date on all vaccinations.',
    emergencyProtocol: 'Standard pediatric emergency protocols apply.'
  },
  {
    id: 'care-3',
    dependentId: 'family-2',
    careType: 'dental',
    provider: 'Dr. Robert Kim - Pediatric Dentistry',
    nextAppointment: '2024-09-22T15:00:00Z',
    lastVisit: '2024-03-22T15:00:00Z',
    notes: 'Regular cleaning and checkup. Good oral hygiene.',
    specialInstructions: 'Continue fluoride treatments due to cavity risk.',
    emergencyProtocol: 'For dental emergencies, contact office or go to ER if severe trauma.'
  },
  {
    id: 'care-4',
    dependentId: 'family-4',
    careType: 'medical',
    provider: 'Dr. Ahmed Hassan - Geriatrics',
    nextAppointment: '2024-09-05T11:00:00Z',
    lastVisit: '2024-06-05T11:00:00Z',
    notes: 'Quarterly diabetes and hypertension management. A1C stable.',
    medications: ['Metformin 500mg twice daily', 'Lisinopril 10mg daily', 'Calcium + Vitamin D'],
    specialInstructions: 'Monitor blood sugar twice daily. Check blood pressure weekly.',
    emergencyProtocol: 'If blood sugar <70 or >300, seek immediate medical attention. If chest pain or severe hypertension, call 911.'
  }
];

// Mock Family Health Alerts
export const mockFamilyHealthAlerts: FamilyHealthAlert[] = [
  {
    id: 'alert-1',
    type: 'appointment_reminder',
    familyMemberId: 'family-2',
    title: 'Emma\'s Pediatric Appointment',
    message: 'Emma has a well-child visit with Dr. Martinez on September 15th at 10:00 AM.',
    severity: 'info',
    dueDate: '2024-09-15T10:00:00Z',
    isRead: false,
    actionRequired: true,
    createdAt: '2024-08-23T09:00:00Z'
  },
  {
    id: 'alert-2',
    type: 'medication_reminder',
    familyMemberId: 'family-4',
    title: 'Mom\'s Medication Refill Due',
    message: 'Margaret\'s Metformin prescription needs refill - only 3 days remaining.',
    severity: 'warning',
    dueDate: '2024-08-26T00:00:00Z',
    isRead: false,
    actionRequired: true,
    createdAt: '2024-08-23T08:00:00Z'
  },
  {
    id: 'alert-3',
    type: 'health_milestone',
    familyMemberId: 'family-3',
    title: 'James\'s School Vaccinations Due',
    message: 'James needs updated vaccinations before starting 1st grade.',
    severity: 'warning',
    dueDate: '2024-09-01T00:00:00Z',
    isRead: false,
    actionRequired: true,
    createdAt: '2024-08-20T10:00:00Z'
  },
  {
    id: 'alert-4',
    type: 'insurance_update',
    familyMemberId: 'family-1',
    title: 'Insurance Plan Renewal',
    message: 'Family health insurance plan renewal period starts next month.',
    severity: 'info',
    dueDate: '2024-09-30T00:00:00Z',
    isRead: true,
    actionRequired: false,
    createdAt: '2024-08-15T12:00:00Z'
  }
];

// Utility functions
export const getFamilyMembersByRelationship = (relationship: string): FamilyMember[] => {
  return mockFamilyMembers.filter(member => member.relationship === relationship);
};

export const getDependents = (): FamilyMember[] => {
  return mockFamilyMembers.filter(member => member.isDependent);
};

export const getEmergencyContacts = (): EmergencyContact[] => {
  return mockEmergencyContacts.filter(contact => contact.isPrimary || contact.canMakeMedicalDecisions);
};

export const getUpcomingAppointments = (): CareCoordination[] => {
  const now = new Date();
  return mockCareCoordination.filter(care => {
    if (!care.nextAppointment) return false;
    const appointmentDate = new Date(care.nextAppointment);
    return appointmentDate > now;
  }).sort((a, b) => new Date(a.nextAppointment!).getTime() - new Date(b.nextAppointment!).getTime());
};

export const getUnreadAlerts = (): FamilyHealthAlert[] => {
  return mockFamilyHealthAlerts.filter(alert => !alert.isRead);
};

export const getFamilyHealthRisks = (): FamilyHealthHistory[] => {
  return mockFamilyHealthHistory.filter(history => history.isHereditary);
};
