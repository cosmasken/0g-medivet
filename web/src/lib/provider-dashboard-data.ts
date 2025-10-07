export interface ProviderPatient {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  avatar?: string;
  contactInfo: {
    phone: string;
    email: string;
    address: string;
  };
  insurance: {
    provider: string;
    policyNumber: string;
    groupNumber?: string;
  };
  medicalInfo: {
    conditions: string[];
    allergies: string[];
    medications: string[];
    lastVisit: string;
    nextAppointment?: string;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    chronicConditions: number;
    emergencyContact: string;
  };
  dataSharing: {
    permissionsGranted: string[];
    monetizationEnabled: boolean;
    dataQualityScore: number;
    lastDataUpdate: string;
    totalRecords: number;
    sharedRecords: number;
  };
  financials: {
    totalRevenue: number;
    monthlyRevenue: number;
    dataValue: number;
    lastPayout: string;
  };
  engagement: {
    lastLogin: string;
    appUsageScore: number;
    complianceRate: number;
    responseRate: number;
  };
}

export interface ProviderAppointment {
  id: string;
  patientId: string;
  patientName: string;
  appointmentType: 'routine' | 'follow-up' | 'urgent' | 'telehealth' | 'procedure' | 'consultation';
  date: string;
  duration: number; // in minutes
  status: 'scheduled' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'no-show';
  reason: string;
  notes?: string;
  preparationRequired: string[];
  attachments?: string[];
  revenue: number;
}

export interface DataAccessRequest {
  id: string;
  patientId: string;
  patientName: string;
  requestType: 'full_access' | 'specific_records' | 'emergency_access' | 'research_participation';
  requestedData: string[];
  requestDate: string;
  status: 'pending' | 'approved' | 'denied' | 'expired';
  urgency: 'low' | 'medium' | 'high' | 'emergency';
  reason: string;
  expirationDate?: string;
  monetizationImpact: number;
}

export interface ClinicalAlert {
  id: string;
  patientId: string;
  patientName: string;
  alertType: 'critical_lab' | 'medication_interaction' | 'missed_appointment' | 'overdue_screening' | 'emergency_contact' | 'data_anomaly';
  severity: 'info' | 'warning' | 'urgent' | 'critical';
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  actionRequired: boolean;
  actionTaken?: string;
  resolvedAt?: string;
}

export interface RevenueMetrics {
  totalRevenue: number;
  monthlyRevenue: number;
  quarterlyRevenue: number;
  yearlyRevenue: number;
  revenueGrowth: number;
  averageRevenuePerPatient: number;
  dataMonetizationRevenue: number;
  clinicalServiceRevenue: number;
  topRevenuePatients: {
    patientId: string;
    patientName: string;
    revenue: number;
    dataValue: number;
  }[];
}

export interface PopulationHealthMetrics {
  totalPatients: number;
  activePatients: number;
  riskDistribution: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  chronicConditionPrevalence: {
    condition: string;
    count: number;
    percentage: number;
  }[];
  averageAge: number;
  genderDistribution: {
    male: number;
    female: number;
    other: number;
  };
  complianceRates: {
    medication: number;
    appointments: number;
    screenings: number;
  };
  outcomeMetrics: {
    metric: string;
    value: number;
    trend: 'improving' | 'stable' | 'declining';
    benchmark: number;
  }[];
}

export interface DataQualityMetrics {
  overallScore: number;
  completenessScore: number;
  accuracyScore: number;
  timelinessScore: number;
  consistencyScore: number;
  patientDataScores: {
    patientId: string;
    patientName: string;
    score: number;
    issues: string[];
    monetizationEligible: boolean;
  }[];
}

// Mock Provider Patients (expanded from existing patient data)
export const mockProviderPatients: ProviderPatient[] = [
  {
    id: '1',
    firstName: 'Sarah',
    lastName: 'Johnson',
    dateOfBirth: '1990-05-15',
    gender: 'female',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah-johnson',
    contactInfo: {
      phone: '(555) 123-4567',
      email: 'sarah.johnson@email.com',
      address: '123 Main St, Anytown, ST 12345'
    },
    insurance: {
      provider: 'Blue Cross Blue Shield',
      policyNumber: 'BCBS-123456789',
      groupNumber: 'GRP-123456'
    },
    medicalInfo: {
      conditions: ['Hypertension', 'Anxiety', 'Shellfish Allergy'],
      allergies: ['Shellfish', 'Penicillin'],
      medications: ['Lisinopril 10mg', 'Sertraline 50mg', 'EpiPen'],
      lastVisit: '2024-08-15',
      nextAppointment: '2024-09-15T10:00:00Z',
      riskLevel: 'medium',
      chronicConditions: 2,
      emergencyContact: 'Michael Johnson (555) 987-6543'
    },
    dataSharing: {
      permissionsGranted: ['basic_info', 'medical_history', 'lab_results', 'medications', 'family_history'],
      monetizationEnabled: true,
      dataQualityScore: 92,
      lastDataUpdate: '2024-08-23T14:30:00Z',
      totalRecords: 16,
      sharedRecords: 14
    },
    financials: {
      totalRevenue: 2850.00,
      monthlyRevenue: 285.00,
      dataValue: 450.00,
      lastPayout: '2024-08-01'
    },
    engagement: {
      lastLogin: '2024-08-23T09:15:00Z',
      appUsageScore: 88,
      complianceRate: 85,
      responseRate: 92
    }
  },
  {
    id: '2',
    firstName: 'David',
    lastName: 'Chen',
    dateOfBirth: '1978-11-22',
    gender: 'male',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=david-chen',
    contactInfo: {
      phone: '(555) 876-5432',
      email: 'david.chen@email.com',
      address: '456 Oak Ave, Anytown, ST 12345'
    },
    insurance: {
      provider: 'Aetna',
      policyNumber: 'AET-987654321',
      groupNumber: 'GRP-987654'
    },
    medicalInfo: {
      conditions: ['Type 2 Diabetes', 'High Cholesterol', 'Sleep Apnea'],
      allergies: ['Sulfa drugs'],
      medications: ['Metformin 500mg', 'Atorvastatin 20mg', 'CPAP therapy'],
      lastVisit: '2024-08-10',
      nextAppointment: '2024-09-10T14:00:00Z',
      riskLevel: 'high',
      chronicConditions: 3,
      emergencyContact: 'Lisa Chen (555) 876-5432'
    },
    dataSharing: {
      permissionsGranted: ['basic_info', 'medical_history', 'lab_results', 'imaging', 'medications'],
      monetizationEnabled: true,
      dataQualityScore: 95,
      lastDataUpdate: '2024-08-22T16:45:00Z',
      totalRecords: 12,
      sharedRecords: 11
    },
    financials: {
      totalRevenue: 3200.00,
      monthlyRevenue: 320.00,
      dataValue: 520.00,
      lastPayout: '2024-08-01'
    },
    engagement: {
      lastLogin: '2024-08-22T18:30:00Z',
      appUsageScore: 94,
      complianceRate: 78,
      responseRate: 88
    }
  },
  {
    id: '3',
    firstName: 'Maria',
    lastName: 'Rodriguez',
    dateOfBirth: '1985-03-08',
    gender: 'female',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=maria-rodriguez',
    contactInfo: {
      phone: '(555) 345-6789',
      email: 'maria.rodriguez@email.com',
      address: '789 Pine St, Anytown, ST 12345'
    },
    insurance: {
      provider: 'Cigna',
      policyNumber: 'CIG-456789123',
      groupNumber: 'GRP-456789'
    },
    medicalInfo: {
      conditions: ['Asthma', 'Seasonal Allergies', 'Migraine'],
      allergies: ['Pollen', 'Dust mites', 'Aspirin'],
      medications: ['Albuterol inhaler', 'Flonase', 'Sumatriptan'],
      lastVisit: '2024-07-28',
      nextAppointment: '2024-09-28T11:30:00Z',
      riskLevel: 'low',
      chronicConditions: 1,
      emergencyContact: 'Carlos Rodriguez (555) 345-6789'
    },
    dataSharing: {
      permissionsGranted: ['basic_info', 'medical_history', 'medications', 'allergies'],
      monetizationEnabled: false,
      dataQualityScore: 87,
      lastDataUpdate: '2024-08-20T11:20:00Z',
      totalRecords: 8,
      sharedRecords: 6
    },
    financials: {
      totalRevenue: 1850.00,
      monthlyRevenue: 185.00,
      dataValue: 0.00,
      lastPayout: '2024-08-01'
    },
    engagement: {
      lastLogin: '2024-08-21T14:45:00Z',
      appUsageScore: 76,
      complianceRate: 92,
      responseRate: 85
    }
  },
  {
    id: '4',
    firstName: 'Robert',
    lastName: 'Thompson',
    dateOfBirth: '1962-09-14',
    gender: 'male',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=robert-thompson',
    contactInfo: {
      phone: '(555) 234-5678',
      email: 'robert.thompson@email.com',
      address: '321 Elm Dr, Anytown, ST 12345'
    },
    insurance: {
      provider: 'Medicare + Supplement',
      policyNumber: 'MED-234567890',
    },
    medicalInfo: {
      conditions: ['Coronary Artery Disease', 'Hypertension', 'Type 2 Diabetes', 'Chronic Kidney Disease'],
      allergies: ['Iodine contrast'],
      medications: ['Metoprolol 50mg', 'Lisinopril 20mg', 'Metformin 1000mg', 'Atorvastatin 40mg'],
      lastVisit: '2024-08-05',
      nextAppointment: '2024-09-05T09:00:00Z',
      riskLevel: 'critical',
      chronicConditions: 4,
      emergencyContact: 'Nancy Thompson (555) 234-5678'
    },
    dataSharing: {
      permissionsGranted: ['basic_info', 'medical_history', 'lab_results', 'imaging', 'medications', 'vitals'],
      monetizationEnabled: true,
      dataQualityScore: 98,
      lastDataUpdate: '2024-08-23T08:15:00Z',
      totalRecords: 24,
      sharedRecords: 22
    },
    financials: {
      totalRevenue: 4500.00,
      monthlyRevenue: 450.00,
      dataValue: 680.00,
      lastPayout: '2024-08-01'
    },
    engagement: {
      lastLogin: '2024-08-23T07:30:00Z',
      appUsageScore: 82,
      complianceRate: 95,
      responseRate: 98
    }
  },
  {
    id: '5',
    firstName: 'Jennifer',
    lastName: 'Williams',
    dateOfBirth: '1992-12-03',
    gender: 'female',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jennifer-williams',
    contactInfo: {
      phone: '(555) 567-8901',
      email: 'jennifer.williams@email.com',
      address: '654 Maple Ave, Anytown, ST 12345'
    },
    insurance: {
      provider: 'UnitedHealthcare',
      policyNumber: 'UHC-567890123',
      groupNumber: 'GRP-567890'
    },
    medicalInfo: {
      conditions: ['Depression', 'Anxiety', 'PCOS'],
      allergies: ['Latex'],
      medications: ['Sertraline 100mg', 'Metformin 500mg', 'Birth control'],
      lastVisit: '2024-08-12',
      nextAppointment: '2024-09-12T15:00:00Z',
      riskLevel: 'medium',
      chronicConditions: 2,
      emergencyContact: 'Mark Williams (555) 567-8901'
    },
    dataSharing: {
      permissionsGranted: ['basic_info', 'medical_history', 'medications', 'mental_health'],
      monetizationEnabled: true,
      dataQualityScore: 89,
      lastDataUpdate: '2024-08-22T13:20:00Z',
      totalRecords: 10,
      sharedRecords: 8
    },
    financials: {
      totalRevenue: 2200.00,
      monthlyRevenue: 220.00,
      dataValue: 320.00,
      lastPayout: '2024-08-01'
    },
    engagement: {
      lastLogin: '2024-08-22T19:45:00Z',
      appUsageScore: 91,
      complianceRate: 88,
      responseRate: 94
    }
  }
];

// Mock Provider Appointments
export const mockProviderAppointments: ProviderAppointment[] = [
  {
    id: 'apt-1',
    patientId: '1',
    patientName: 'Sarah Johnson',
    appointmentType: 'routine',
    date: '2024-08-24T10:00:00Z',
    duration: 30,
    status: 'confirmed',
    reason: 'Blood pressure follow-up',
    preparationRequired: ['Bring current medications', 'Blood pressure log'],
    revenue: 180.00
  },
  {
    id: 'apt-2',
    patientId: '4',
    patientName: 'Robert Thompson',
    appointmentType: 'urgent',
    date: '2024-08-24T11:00:00Z',
    duration: 45,
    status: 'confirmed',
    reason: 'Chest pain evaluation',
    preparationRequired: ['Recent EKG results', 'Medication list', 'Emergency contact'],
    revenue: 280.00
  },
  {
    id: 'apt-3',
    patientId: '2',
    patientName: 'David Chen',
    appointmentType: 'telehealth',
    date: '2024-08-24T14:00:00Z',
    duration: 20,
    status: 'scheduled',
    reason: 'Diabetes management check-in',
    preparationRequired: ['Blood sugar logs', 'Weight measurements'],
    revenue: 120.00
  },
  {
    id: 'apt-4',
    patientId: '5',
    patientName: 'Jennifer Williams',
    appointmentType: 'follow-up',
    date: '2024-08-24T15:30:00Z',
    duration: 30,
    status: 'confirmed',
    reason: 'Mental health medication adjustment',
    preparationRequired: ['Mood tracking journal', 'Side effect notes'],
    revenue: 200.00
  },
  {
    id: 'apt-5',
    patientId: '3',
    patientName: 'Maria Rodriguez',
    appointmentType: 'routine',
    date: '2024-08-24T16:00:00Z',
    duration: 25,
    status: 'scheduled',
    reason: 'Asthma control assessment',
    preparationRequired: ['Peak flow readings', 'Inhaler technique review'],
    revenue: 160.00
  }
];

// Mock Data Access Requests
export const mockDataAccessRequests: DataAccessRequest[] = [
  {
    id: 'req-1',
    patientId: '1',
    patientName: 'Sarah Johnson',
    requestType: 'research_participation',
    requestedData: ['lab_results', 'medication_history', 'family_history'],
    requestDate: '2024-08-23T09:00:00Z',
    status: 'pending',
    urgency: 'low',
    reason: 'Hypertension research study participation',
    expirationDate: '2024-09-23T09:00:00Z',
    monetizationImpact: 150.00
  },
  {
    id: 'req-2',
    patientId: '4',
    patientName: 'Robert Thompson',
    requestType: 'emergency_access',
    requestedData: ['full_medical_history', 'current_medications', 'allergies', 'emergency_contacts'],
    requestDate: '2024-08-23T14:30:00Z',
    status: 'approved',
    urgency: 'emergency',
    reason: 'Emergency department visit - chest pain',
    monetizationImpact: 0.00
  },
  {
    id: 'req-3',
    patientId: '2',
    patientName: 'David Chen',
    requestType: 'specific_records',
    requestedData: ['recent_lab_results', 'a1c_trends', 'medication_adherence'],
    requestDate: '2024-08-22T16:15:00Z',
    status: 'pending',
    urgency: 'medium',
    reason: 'Diabetes management optimization',
    expirationDate: '2024-09-22T16:15:00Z',
    monetizationImpact: 75.00
  },
  {
    id: 'req-4',
    patientId: '5',
    patientName: 'Jennifer Williams',
    requestType: 'full_access',
    requestedData: ['complete_medical_history', 'mental_health_records', 'medication_history'],
    requestDate: '2024-08-21T11:20:00Z',
    status: 'denied',
    urgency: 'low',
    reason: 'Insurance prior authorization review',
    monetizationImpact: 0.00
  }
];

// Mock Clinical Alerts
export const mockClinicalAlerts: ClinicalAlert[] = [
  {
    id: 'alert-1',
    patientId: '4',
    patientName: 'Robert Thompson',
    alertType: 'critical_lab',
    severity: 'critical',
    title: 'Critical Lab Values',
    message: 'Creatinine elevated to 2.8 mg/dL (normal: 0.7-1.3). Kidney function declining.',
    createdAt: '2024-08-23T08:15:00Z',
    isRead: false,
    actionRequired: true
  },
  {
    id: 'alert-2',
    patientId: '1',
    patientName: 'Sarah Johnson',
    alertType: 'medication_interaction',
    severity: 'warning',
    title: 'Drug Interaction Warning',
    message: 'Potential interaction between Lisinopril and new NSAID prescription.',
    createdAt: '2024-08-23T10:30:00Z',
    isRead: false,
    actionRequired: true
  },
  {
    id: 'alert-3',
    patientId: '3',
    patientName: 'Maria Rodriguez',
    alertType: 'missed_appointment',
    severity: 'info',
    title: 'Missed Appointment',
    message: 'Patient missed scheduled appointment on 2024-08-20. Follow-up needed.',
    createdAt: '2024-08-21T09:00:00Z',
    isRead: true,
    actionRequired: false,
    actionTaken: 'Rescheduled for 2024-08-28',
    resolvedAt: '2024-08-21T14:30:00Z'
  },
  {
    id: 'alert-4',
    patientId: '2',
    patientName: 'David Chen',
    alertType: 'overdue_screening',
    severity: 'warning',
    title: 'Overdue Screening',
    message: 'Annual eye exam overdue by 3 months for diabetic patient.',
    createdAt: '2024-08-22T12:00:00Z',
    isRead: false,
    actionRequired: true
  },
  {
    id: 'alert-5',
    patientId: '5',
    patientName: 'Jennifer Williams',
    alertType: 'data_anomaly',
    severity: 'info',
    title: 'Data Quality Alert',
    message: 'Inconsistent medication adherence reporting detected.',
    createdAt: '2024-08-22T15:45:00Z',
    isRead: false,
    actionRequired: false
  }
];

// Mock Revenue Metrics
export const mockRevenueMetrics: RevenueMetrics = {
  totalRevenue: 14600.00,
  monthlyRevenue: 1460.00,
  quarterlyRevenue: 4380.00,
  yearlyRevenue: 17520.00,
  revenueGrowth: 12.5,
  averageRevenuePerPatient: 2920.00,
  dataMonetizationRevenue: 1970.00,
  clinicalServiceRevenue: 12630.00,
  topRevenuePatients: [
    {
      patientId: '4',
      patientName: 'Robert Thompson',
      revenue: 4500.00,
      dataValue: 680.00
    },
    {
      patientId: '2',
      patientName: 'David Chen',
      revenue: 3200.00,
      dataValue: 520.00
    },
    {
      patientId: '1',
      patientName: 'Sarah Johnson',
      revenue: 2850.00,
      dataValue: 450.00
    }
  ]
};

// Mock Population Health Metrics
export const mockPopulationHealthMetrics: PopulationHealthMetrics = {
  totalPatients: 5,
  activePatients: 5,
  riskDistribution: {
    low: 1,
    medium: 2,
    high: 1,
    critical: 1
  },
  chronicConditionPrevalence: [
    { condition: 'Hypertension', count: 3, percentage: 60 },
    { condition: 'Type 2 Diabetes', count: 2, percentage: 40 },
    { condition: 'Anxiety/Depression', count: 2, percentage: 40 },
    { condition: 'High Cholesterol', count: 2, percentage: 40 },
    { condition: 'Asthma', count: 1, percentage: 20 }
  ],
  averageAge: 52.4,
  genderDistribution: {
    male: 2,
    female: 3,
    other: 0
  },
  complianceRates: {
    medication: 87.6,
    appointments: 89.2,
    screenings: 82.4
  },
  outcomeMetrics: [
    {
      metric: 'Blood Pressure Control',
      value: 78.5,
      trend: 'improving',
      benchmark: 75.0
    },
    {
      metric: 'Diabetes A1C Control',
      value: 85.2,
      trend: 'stable',
      benchmark: 80.0
    },
    {
      metric: 'Medication Adherence',
      value: 87.6,
      trend: 'improving',
      benchmark: 85.0
    }
  ]
};

// Mock Data Quality Metrics
export const mockDataQualityMetrics: DataQualityMetrics = {
  overallScore: 92.2,
  completenessScore: 94.1,
  accuracyScore: 91.8,
  timelinessScore: 89.5,
  consistencyScore: 93.4,
  patientDataScores: [
    {
      patientId: '4',
      patientName: 'Robert Thompson',
      score: 98,
      issues: [],
      monetizationEligible: true
    },
    {
      patientId: '2',
      patientName: 'David Chen',
      score: 95,
      issues: ['Missing recent vitals'],
      monetizationEligible: true
    },
    {
      patientId: '1',
      patientName: 'Sarah Johnson',
      score: 92,
      issues: ['Incomplete family history'],
      monetizationEligible: true
    },
    {
      patientId: '5',
      patientName: 'Jennifer Williams',
      score: 89,
      issues: ['Inconsistent medication reporting', 'Missing lab results'],
      monetizationEligible: true
    },
    {
      patientId: '3',
      patientName: 'Maria Rodriguez',
      score: 87,
      issues: ['Incomplete allergy information', 'Missing emergency contact'],
      monetizationEligible: false
    }
  ]
};

// Utility functions
export const getTodaysAppointments = (): ProviderAppointment[] => {
  const today = new Date().toISOString().split('T')[0];
  return mockProviderAppointments.filter(apt => 
    apt.date.startsWith(today) && apt.status !== 'cancelled'
  );
};

export const getPendingRequests = (): DataAccessRequest[] => {
  return mockDataAccessRequests.filter(req => req.status === 'pending');
};

export const getUnreadAlerts = (): ClinicalAlert[] => {
  return mockClinicalAlerts.filter(alert => !alert.isRead);
};

export const getCriticalPatients = (): ProviderPatient[] => {
  return mockProviderPatients.filter(patient => patient.medicalInfo.riskLevel === 'critical');
};

export const getHighValuePatients = (): ProviderPatient[] => {
  return mockProviderPatients
    .filter(patient => patient.dataSharing.monetizationEnabled)
    .sort((a, b) => b.financials.dataValue - a.financials.dataValue)
    .slice(0, 3);
};

export const calculateTotalMonthlyRevenue = (): number => {
  return mockProviderPatients.reduce((total, patient) => total + patient.financials.monthlyRevenue, 0);
};

export const getPatientsByRiskLevel = (riskLevel: string): ProviderPatient[] => {
  return mockProviderPatients.filter(patient => patient.medicalInfo.riskLevel === riskLevel);
};
