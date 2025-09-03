export interface HealthEvent {
  id: string;
  date: string;
  type: 'visit' | 'lab' | 'imaging' | 'prescription' | 'procedure' | 'vaccination' | 'emergency' | 'milestone' | 'symptom' | 'vital';
  category: 'preventive' | 'diagnostic' | 'treatment' | 'emergency' | 'routine' | 'chronic_care' | 'mental_health';
  title: string;
  description: string;
  provider: string;
  location: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  outcome: 'positive' | 'negative' | 'neutral' | 'ongoing';
  tags: string[];
  attachments?: string[];
  relatedEvents?: string[];
  familyRelevant: boolean;
  cost?: {
    total: number;
    insurance: number;
    outOfPocket: number;
  };
  vitals?: {
    bloodPressure?: string;
    heartRate?: number;
    temperature?: number;
    weight?: number;
    height?: number;
  };
  labResults?: {
    [key: string]: {
      value: number | string;
      unit: string;
      normalRange: string;
      status: 'normal' | 'abnormal' | 'critical';
    };
  };
}

export interface HealthMilestone {
  id: string;
  date: string;
  type: 'birth' | 'vaccination' | 'growth' | 'development' | 'achievement' | 'diagnosis' | 'recovery' | 'prevention';
  title: string;
  description: string;
  significance: 'major' | 'moderate' | 'minor';
  ageAtEvent: string;
  relatedEvents: string[];
  familyHistory?: boolean;
}

export interface TimelineFilter {
  dateRange: {
    start: string;
    end: string;
  };
  eventTypes: string[];
  categories: string[];
  providers: string[];
  severity: string[];
  outcome: string[];
  tags: string[];
}

// Mock Health Events (last 5 years)
export const mockHealthEvents: HealthEvent[] = [
  // 2024 Events
  {
    id: 'event-1',
    date: '2024-08-15',
    type: 'lab',
    category: 'routine',
    title: 'Annual Blood Work Panel',
    description: 'Comprehensive metabolic panel, lipid profile, and CBC with differential',
    provider: 'Dr. Emily Smith',
    location: 'MediCenter Lab',
    severity: 'low',
    outcome: 'positive',
    tags: ['annual', 'preventive', 'blood-work'],
    familyRelevant: true,
    cost: {
      total: 285.00,
      insurance: 228.00,
      outOfPocket: 57.00
    },
    labResults: {
      'Total Cholesterol': {
        value: 185,
        unit: 'mg/dL',
        normalRange: '<200',
        status: 'normal'
      },
      'HDL Cholesterol': {
        value: 58,
        unit: 'mg/dL',
        normalRange: '>40',
        status: 'normal'
      },
      'LDL Cholesterol': {
        value: 110,
        unit: 'mg/dL',
        normalRange: '<100',
        status: 'abnormal'
      },
      'Glucose': {
        value: 92,
        unit: 'mg/dL',
        normalRange: '70-99',
        status: 'normal'
      },
      'Hemoglobin A1C': {
        value: 5.4,
        unit: '%',
        normalRange: '<5.7',
        status: 'normal'
      }
    }
  },
  {
    id: 'event-2',
    date: '2024-07-22',
    type: 'visit',
    category: 'routine',
    title: 'Annual Physical Examination',
    description: 'Comprehensive physical exam with health screening and preventive care discussion',
    provider: 'Dr. Emily Smith',
    location: 'Primary Care Clinic',
    severity: 'low',
    outcome: 'positive',
    tags: ['annual', 'physical', 'preventive'],
    familyRelevant: false,
    cost: {
      total: 350.00,
      insurance: 315.00,
      outOfPocket: 35.00
    },
    vitals: {
      bloodPressure: '118/76',
      heartRate: 72,
      temperature: 98.6,
      weight: 165,
      height: 68
    }
  },
  {
    id: 'event-3',
    date: '2024-06-10',
    type: 'prescription',
    category: 'treatment',
    title: 'Blood Pressure Medication Started',
    description: 'Prescribed Lisinopril 10mg daily for mild hypertension management',
    provider: 'Dr. Emily Smith',
    location: 'Primary Care Clinic',
    severity: 'medium',
    outcome: 'ongoing',
    tags: ['hypertension', 'medication', 'cardiovascular'],
    familyRelevant: true,
    cost: {
      total: 45.00,
      insurance: 35.00,
      outOfPocket: 10.00
    }
  },
  {
    id: 'event-4',
    date: '2024-05-18',
    type: 'imaging',
    category: 'diagnostic',
    title: 'Chest X-Ray',
    description: 'Routine chest imaging for annual health screening - clear results',
    provider: 'Dr. Michael Brown',
    location: 'Radiology Center',
    severity: 'low',
    outcome: 'positive',
    tags: ['imaging', 'chest', 'screening', 'clear'],
    familyRelevant: false,
    cost: {
      total: 180.00,
      insurance: 144.00,
      outOfPocket: 36.00
    }
  },
  {
    id: 'event-5',
    date: '2024-03-14',
    type: 'vaccination',
    category: 'preventive',
    title: 'COVID-19 Booster Vaccination',
    description: 'Updated COVID-19 booster shot - Pfizer-BioNTech vaccine',
    provider: 'Nurse Johnson',
    location: 'Community Health Center',
    severity: 'low',
    outcome: 'positive',
    tags: ['vaccination', 'covid-19', 'booster', 'preventive'],
    familyRelevant: false,
    cost: {
      total: 0.00,
      insurance: 0.00,
      outOfPocket: 0.00
    }
  },
  {
    id: 'event-6',
    date: '2024-01-25',
    type: 'visit',
    category: 'mental_health',
    title: 'Mental Health Consultation',
    description: 'Initial consultation for anxiety and stress management',
    provider: 'Dr. Sarah Wilson',
    location: 'Mental Health Clinic',
    severity: 'medium',
    outcome: 'ongoing',
    tags: ['mental-health', 'anxiety', 'consultation', 'therapy'],
    familyRelevant: true,
    cost: {
      total: 200.00,
      insurance: 160.00,
      outOfPocket: 40.00
    }
  },

  // 2023 Events
  {
    id: 'event-7',
    date: '2023-11-08',
    type: 'procedure',
    category: 'preventive',
    title: 'Colonoscopy Screening',
    description: 'Routine colorectal cancer screening - no abnormalities found',
    provider: 'Dr. Jennifer Martinez',
    location: 'Gastroenterology Center',
    severity: 'medium',
    outcome: 'positive',
    tags: ['screening', 'colonoscopy', 'preventive', 'cancer'],
    familyRelevant: true,
    cost: {
      total: 1250.00,
      insurance: 1125.00,
      outOfPocket: 125.00
    }
  },
  {
    id: 'event-8',
    date: '2023-09-15',
    type: 'emergency',
    category: 'emergency',
    title: 'Emergency Room Visit - Allergic Reaction',
    description: 'Severe allergic reaction to shellfish - treated with epinephrine and antihistamines',
    provider: 'Dr. Robert Kim',
    location: 'City General Hospital ER',
    severity: 'high',
    outcome: 'positive',
    tags: ['emergency', 'allergy', 'shellfish', 'epinephrine'],
    familyRelevant: true,
    cost: {
      total: 2850.00,
      insurance: 2280.00,
      outOfPocket: 570.00
    }
  },
  {
    id: 'event-9',
    date: '2023-07-20',
    type: 'lab',
    category: 'diagnostic',
    title: 'Allergy Testing Panel',
    description: 'Comprehensive allergy testing following emergency reaction',
    provider: 'Dr. Lisa Thompson',
    location: 'Allergy & Immunology Clinic',
    severity: 'medium',
    outcome: 'neutral',
    tags: ['allergy', 'testing', 'diagnostic', 'shellfish'],
    familyRelevant: true,
    cost: {
      total: 485.00,
      insurance: 388.00,
      outOfPocket: 97.00
    },
    labResults: {
      'Shellfish IgE': {
        value: 'Positive',
        unit: 'Class 4',
        normalRange: 'Negative',
        status: 'abnormal'
      },
      'Peanut IgE': {
        value: 'Negative',
        unit: 'Class 0',
        normalRange: 'Negative',
        status: 'normal'
      },
      'Tree Nut IgE': {
        value: 'Negative',
        unit: 'Class 0',
        normalRange: 'Negative',
        status: 'normal'
      }
    }
  },
  {
    id: 'event-10',
    date: '2023-04-12',
    type: 'milestone',
    category: 'preventive',
    title: 'Completed Smoking Cessation Program',
    description: 'Successfully completed 12-week smoking cessation program - 6 months smoke-free',
    provider: 'Dr. Ahmed Hassan',
    location: 'Wellness Center',
    severity: 'low',
    outcome: 'positive',
    tags: ['milestone', 'smoking-cessation', 'wellness', 'achievement'],
    familyRelevant: true,
    cost: {
      total: 300.00,
      insurance: 240.00,
      outOfPocket: 60.00
    }
  },

  // 2022 Events
  {
    id: 'event-11',
    date: '2022-12-03',
    type: 'imaging',
    category: 'diagnostic',
    title: 'Mammography Screening',
    description: 'Annual breast cancer screening - normal results',
    provider: 'Dr. Patricia Lee',
    location: 'Women\'s Health Center',
    severity: 'low',
    outcome: 'positive',
    tags: ['screening', 'mammography', 'breast-cancer', 'preventive'],
    familyRelevant: true,
    cost: {
      total: 220.00,
      insurance: 220.00,
      outOfPocket: 0.00
    }
  },
  {
    id: 'event-12',
    date: '2022-08-28',
    type: 'visit',
    category: 'chronic_care',
    title: 'Diabetes Management Follow-up',
    description: 'Quarterly diabetes check-up with A1C monitoring and medication adjustment',
    provider: 'Dr. Emily Smith',
    location: 'Primary Care Clinic',
    severity: 'medium',
    outcome: 'positive',
    tags: ['diabetes', 'chronic-care', 'a1c', 'management'],
    familyRelevant: true,
    cost: {
      total: 180.00,
      insurance: 144.00,
      outOfPocket: 36.00
    },
    vitals: {
      bloodPressure: '125/82',
      heartRate: 78,
      weight: 168
    },
    labResults: {
      'Hemoglobin A1C': {
        value: 6.8,
        unit: '%',
        normalRange: '<7.0',
        status: 'normal'
      },
      'Fasting Glucose': {
        value: 118,
        unit: 'mg/dL',
        normalRange: '70-99',
        status: 'abnormal'
      }
    }
  },
  {
    id: 'event-13',
    date: '2022-05-16',
    type: 'procedure',
    category: 'treatment',
    title: 'Minor Surgery - Skin Lesion Removal',
    description: 'Excision of suspicious mole on back - pathology showed benign nevus',
    provider: 'Dr. Lisa Thompson',
    location: 'Dermatology Surgery Center',
    severity: 'medium',
    outcome: 'positive',
    tags: ['surgery', 'dermatology', 'mole', 'benign', 'biopsy'],
    familyRelevant: false,
    cost: {
      total: 850.00,
      insurance: 680.00,
      outOfPocket: 170.00
    }
  },

  // 2021 Events
  {
    id: 'event-14',
    date: '2021-10-22',
    type: 'vaccination',
    category: 'preventive',
    title: 'Flu Vaccination',
    description: 'Annual influenza vaccine - quadrivalent inactivated vaccine',
    provider: 'Pharmacist Williams',
    location: 'CVS Pharmacy',
    severity: 'low',
    outcome: 'positive',
    tags: ['vaccination', 'flu', 'annual', 'preventive'],
    familyRelevant: false,
    cost: {
      total: 25.00,
      insurance: 25.00,
      outOfPocket: 0.00
    }
  },
  {
    id: 'event-15',
    date: '2021-06-30',
    type: 'milestone',
    category: 'achievement',
    title: 'Weight Loss Goal Achievement',
    description: 'Successfully lost 25 pounds through diet and exercise program',
    provider: 'Nutritionist Davis',
    location: 'Wellness Center',
    severity: 'low',
    outcome: 'positive',
    tags: ['milestone', 'weight-loss', 'diet', 'exercise', 'achievement'],
    familyRelevant: false,
    cost: {
      total: 450.00,
      insurance: 0.00,
      outOfPocket: 450.00
    },
    vitals: {
      weight: 155
    }
  },

  // 2020 Events
  {
    id: 'event-16',
    date: '2020-03-15',
    type: 'emergency',
    category: 'emergency',
    title: 'COVID-19 Diagnosis and Treatment',
    description: 'Diagnosed with COVID-19 - mild symptoms, home isolation and monitoring',
    provider: 'Dr. Robert Kim',
    location: 'Urgent Care Center',
    severity: 'high',
    outcome: 'positive',
    tags: ['covid-19', 'diagnosis', 'isolation', 'recovery'],
    familyRelevant: true,
    cost: {
      total: 320.00,
      insurance: 256.00,
      outOfPocket: 64.00
    }
  }
];

// Mock Health Milestones
export const mockHealthMilestones: HealthMilestone[] = [
  {
    id: 'milestone-1',
    date: '2024-04-12',
    type: 'achievement',
    title: '1 Year Smoke-Free Anniversary',
    description: 'Celebrated one full year without smoking - significant health milestone',
    significance: 'major',
    ageAtEvent: '34 years',
    relatedEvents: ['event-10'],
    familyHistory: false
  },
  {
    id: 'milestone-2',
    date: '2023-09-15',
    type: 'diagnosis',
    title: 'Shellfish Allergy Diagnosis',
    description: 'Confirmed severe shellfish allergy following emergency reaction',
    significance: 'major',
    ageAtEvent: '33 years',
    relatedEvents: ['event-8', 'event-9'],
    familyHistory: true
  },
  {
    id: 'milestone-3',
    date: '2022-05-16',
    type: 'prevention',
    title: 'Early Skin Cancer Detection',
    description: 'Proactive removal of suspicious mole prevented potential skin cancer',
    significance: 'moderate',
    ageAtEvent: '32 years',
    relatedEvents: ['event-13'],
    familyHistory: true
  },
  {
    id: 'milestone-4',
    date: '2021-06-30',
    type: 'achievement',
    title: 'Healthy Weight Achievement',
    description: 'Reached and maintained healthy BMI through lifestyle changes',
    significance: 'moderate',
    ageAtEvent: '31 years',
    relatedEvents: ['event-15'],
    familyHistory: false
  },
  {
    id: 'milestone-5',
    date: '2020-04-20',
    type: 'recovery',
    title: 'COVID-19 Recovery',
    description: 'Full recovery from COVID-19 with no long-term complications',
    significance: 'major',
    ageAtEvent: '30 years',
    relatedEvents: ['event-16'],
    familyHistory: false
  }
];

// Utility functions
export const getEventsByDateRange = (events: HealthEvent[], startDate: string, endDate: string): HealthEvent[] => {
  return events.filter(event => {
    const eventDate = new Date(event.date);
    const start = new Date(startDate);
    const end = new Date(endDate);
    return eventDate >= start && eventDate <= end;
  });
};

export const getEventsByType = (events: HealthEvent[], types: string[]): HealthEvent[] => {
  return events.filter(event => types.includes(event.type));
};

export const getEventsByProvider = (events: HealthEvent[], providers: string[]): HealthEvent[] => {
  return events.filter(event => providers.includes(event.provider));
};

export const getTotalHealthcareCosts = (events: HealthEvent[]): { total: number; insurance: number; outOfPocket: number } => {
  return events.reduce((acc, event) => {
    if (event.cost) {
      acc.total += event.cost.total;
      acc.insurance += event.cost.insurance;
      acc.outOfPocket += event.cost.outOfPocket;
    }
    return acc;
  }, { total: 0, insurance: 0, outOfPocket: 0 });
};

export const getUniqueProviders = (events: HealthEvent[]): string[] => {
  return [...new Set(events.map(event => event.provider))];
};

export const getUniqueTags = (events: HealthEvent[]): string[] => {
  return [...new Set(events.flatMap(event => event.tags))];
};
