export interface Medication {
  id: string;
  name: string;
  genericName: string;
  brandName: string;
  dosage: string;
  frequency: string;
  route: 'oral' | 'topical' | 'injection' | 'inhaled' | 'sublingual';
  prescribedBy: string;
  prescribedDate: string;
  startDate: string;
  endDate?: string;
  refillsRemaining: number;
  totalRefills: number;
  instructions: string;
  sideEffects: string[];
  category: 'cardiovascular' | 'diabetes' | 'pain' | 'antibiotic' | 'mental_health' | 'allergy' | 'other';
  isActive: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
  cost: {
    copay: number;
    insurance: number;
    total: number;
  };
  pharmacy: {
    id: string;
    name: string;
    phone: string;
    address: string;
  };
  ndc: string; // National Drug Code
  rxNumber: string;
}

export interface MedicationReminder {
  id: string;
  medicationId: string;
  time: string; // HH:MM format
  days: ('monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday')[];
  isActive: boolean;
  lastTaken?: string;
  nextDue: string;
  reminderType: 'notification' | 'sms' | 'email' | 'call';
}

export interface DrugInteraction {
  id: string;
  medication1: string;
  medication2: string;
  severity: 'minor' | 'moderate' | 'major' | 'contraindicated';
  description: string;
  effects: string[];
  recommendations: string[];
  clinicalSignificance: string;
  mechanism: string;
  references: string[];
}

export interface AdherenceRecord {
  id: string;
  medicationId: string;
  date: string;
  scheduledTime: string;
  takenTime?: string;
  status: 'taken' | 'missed' | 'late' | 'skipped';
  notes?: string;
  sideEffectsReported?: string[];
}

export interface Pharmacy {
  id: string;
  name: string;
  chain: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  hours: {
    [key: string]: { open: string; close: string; };
  };
  services: string[];
  isPreferred: boolean;
  distance: number; // in miles
  rating: number;
  acceptsInsurance: boolean;
}

export interface MedicationAlert {
  id: string;
  type: 'refill_needed' | 'interaction_warning' | 'side_effect' | 'missed_dose' | 'pharmacy_ready';
  severity: 'info' | 'warning' | 'error' | 'critical';
  title: string;
  message: string;
  medicationIds: string[];
  createdAt: string;
  isRead: boolean;
  actionRequired: boolean;
  actionUrl?: string;
}

// Mock Medications
export const mockMedications: Medication[] = [
  {
    id: 'med-1',
    name: 'Lisinopril',
    genericName: 'Lisinopril',
    brandName: 'Prinivil',
    dosage: '10mg',
    frequency: 'Once daily',
    route: 'oral',
    prescribedBy: 'Dr. Emily Smith',
    prescribedDate: '2024-01-10',
    startDate: '2024-01-15',
    refillsRemaining: 3,
    totalRefills: 5,
    instructions: 'Take once daily in the morning with or without food. Monitor blood pressure regularly.',
    sideEffects: ['Dizziness', 'Dry cough', 'Fatigue', 'Headache'],
    category: 'cardiovascular',
    isActive: true,
    priority: 'high',
    cost: {
      copay: 10.00,
      insurance: 25.00,
      total: 35.00
    },
    pharmacy: {
      id: 'pharm-1',
      name: 'CVS Pharmacy',
      phone: '(555) 123-4567',
      address: '123 Main St, Anytown, ST 12345'
    },
    ndc: '0071-0222-23',
    rxNumber: 'RX123456789'
  },
  {
    id: 'med-2',
    name: 'Metformin',
    genericName: 'Metformin HCl',
    brandName: 'Glucophage',
    dosage: '500mg',
    frequency: 'Twice daily',
    route: 'oral',
    prescribedBy: 'Dr. Emily Smith',
    prescribedDate: '2024-02-15',
    startDate: '2024-02-20',
    refillsRemaining: 2,
    totalRefills: 5,
    instructions: 'Take twice daily with meals to reduce stomach upset. Monitor blood sugar levels.',
    sideEffects: ['Nausea', 'Diarrhea', 'Stomach upset', 'Metallic taste'],
    category: 'diabetes',
    isActive: true,
    priority: 'high',
    cost: {
      copay: 5.00,
      insurance: 15.00,
      total: 20.00
    },
    pharmacy: {
      id: 'pharm-1',
      name: 'CVS Pharmacy',
      phone: '(555) 123-4567',
      address: '123 Main St, Anytown, ST 12345'
    },
    ndc: '0093-1074-01',
    rxNumber: 'RX987654321'
  },
  {
    id: 'med-3',
    name: 'Ibuprofen',
    genericName: 'Ibuprofen',
    brandName: 'Advil',
    dosage: '400mg',
    frequency: 'As needed',
    route: 'oral',
    prescribedBy: 'Dr. Michael Brown',
    prescribedDate: '2024-03-01',
    startDate: '2024-03-01',
    endDate: '2024-04-01',
    refillsRemaining: 1,
    totalRefills: 2,
    instructions: 'Take as needed for pain or inflammation. Do not exceed 3 doses per day. Take with food.',
    sideEffects: ['Stomach irritation', 'Nausea', 'Dizziness', 'Headache'],
    category: 'pain',
    isActive: true,
    priority: 'medium',
    cost: {
      copay: 8.00,
      insurance: 12.00,
      total: 20.00
    },
    pharmacy: {
      id: 'pharm-2',
      name: 'Walgreens',
      phone: '(555) 234-5678',
      address: '456 Oak Ave, Anytown, ST 12345'
    },
    ndc: '0573-0164-40',
    rxNumber: 'RX456789123'
  },
  {
    id: 'med-4',
    name: 'Sertraline',
    genericName: 'Sertraline HCl',
    brandName: 'Zoloft',
    dosage: '50mg',
    frequency: 'Once daily',
    route: 'oral',
    prescribedBy: 'Dr. Sarah Wilson',
    prescribedDate: '2024-01-05',
    startDate: '2024-01-10',
    refillsRemaining: 4,
    totalRefills: 5,
    instructions: 'Take once daily in the morning. May take 4-6 weeks to see full effect. Do not stop abruptly.',
    sideEffects: ['Nausea', 'Drowsiness', 'Dry mouth', 'Changes in appetite'],
    category: 'mental_health',
    isActive: true,
    priority: 'high',
    cost: {
      copay: 15.00,
      insurance: 45.00,
      total: 60.00
    },
    pharmacy: {
      id: 'pharm-1',
      name: 'CVS Pharmacy',
      phone: '(555) 123-4567',
      address: '123 Main St, Anytown, ST 12345'
    },
    ndc: '0049-4900-66',
    rxNumber: 'RX789123456'
  }
];

// Mock Medication Reminders
export const mockMedicationReminders: MedicationReminder[] = [
  {
    id: 'rem-1',
    medicationId: 'med-1',
    time: '08:00',
    days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    isActive: true,
    nextDue: '2024-08-24T08:00:00Z',
    reminderType: 'notification'
  },
  {
    id: 'rem-2',
    medicationId: 'med-2',
    time: '08:00',
    days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    isActive: true,
    nextDue: '2024-08-24T08:00:00Z',
    reminderType: 'notification'
  },
  {
    id: 'rem-3',
    medicationId: 'med-2',
    time: '18:00',
    days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    isActive: true,
    nextDue: '2024-08-24T18:00:00Z',
    reminderType: 'notification'
  },
  {
    id: 'rem-4',
    medicationId: 'med-4',
    time: '09:00',
    days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    isActive: true,
    nextDue: '2024-08-24T09:00:00Z',
    reminderType: 'notification'
  }
];

// Mock Drug Interactions
export const mockDrugInteractions: DrugInteraction[] = [
  {
    id: 'int-1',
    medication1: 'Lisinopril',
    medication2: 'Ibuprofen',
    severity: 'moderate',
    description: 'NSAIDs like ibuprofen may reduce the effectiveness of ACE inhibitors like lisinopril and increase the risk of kidney problems.',
    effects: ['Reduced blood pressure control', 'Increased risk of kidney damage', 'Elevated potassium levels'],
    recommendations: [
      'Monitor blood pressure more frequently',
      'Consider alternative pain relief options',
      'Regular kidney function tests',
      'Consult with prescribing physician'
    ],
    clinicalSignificance: 'This interaction may reduce the antihypertensive effect of lisinopril and increase the risk of renal impairment.',
    mechanism: 'NSAIDs inhibit prostaglandin synthesis, which can counteract the vasodilatory effects of ACE inhibitors.',
    references: ['Drug Interaction Database 2024', 'Clinical Pharmacology Guidelines']
  },
  {
    id: 'int-2',
    medication1: 'Metformin',
    medication2: 'Ibuprofen',
    severity: 'minor',
    description: 'NSAIDs may slightly increase the risk of lactic acidosis when used with metformin, especially in patients with kidney problems.',
    effects: ['Slightly increased risk of lactic acidosis', 'Potential kidney function changes'],
    recommendations: [
      'Monitor for signs of lactic acidosis',
      'Stay well hydrated',
      'Use lowest effective dose of ibuprofen',
      'Regular monitoring if used long-term'
    ],
    clinicalSignificance: 'Generally considered a minor interaction, but caution advised in patients with renal impairment.',
    mechanism: 'NSAIDs may affect kidney function, potentially reducing metformin clearance.',
    references: ['Diabetes Care Guidelines 2024']
  }
];

// Mock Pharmacies
export const mockPharmacies: Pharmacy[] = [
  {
    id: 'pharm-1',
    name: 'CVS Pharmacy',
    chain: 'CVS Health',
    address: '123 Main St',
    city: 'Anytown',
    state: 'ST',
    zipCode: '12345',
    phone: '(555) 123-4567',
    hours: {
      monday: { open: '08:00', close: '22:00' },
      tuesday: { open: '08:00', close: '22:00' },
      wednesday: { open: '08:00', close: '22:00' },
      thursday: { open: '08:00', close: '22:00' },
      friday: { open: '08:00', close: '22:00' },
      saturday: { open: '09:00', close: '21:00' },
      sunday: { open: '10:00', close: '20:00' }
    },
    services: ['Prescription Filling', 'Immunizations', 'Health Screenings', 'Medication Therapy Management'],
    isPreferred: true,
    distance: 0.8,
    rating: 4.2,
    acceptsInsurance: true
  },
  {
    id: 'pharm-2',
    name: 'Walgreens',
    chain: 'Walgreens',
    address: '456 Oak Ave',
    city: 'Anytown',
    state: 'ST',
    zipCode: '12345',
    phone: '(555) 234-5678',
    hours: {
      monday: { open: '07:00', close: '23:00' },
      tuesday: { open: '07:00', close: '23:00' },
      wednesday: { open: '07:00', close: '23:00' },
      thursday: { open: '07:00', close: '23:00' },
      friday: { open: '07:00', close: '23:00' },
      saturday: { open: '08:00', close: '22:00' },
      sunday: { open: '09:00', close: '21:00' }
    },
    services: ['Prescription Filling', 'Drive-Thru', 'Immunizations', '24/7 Pharmacy Chat'],
    isPreferred: false,
    distance: 1.2,
    rating: 4.0,
    acceptsInsurance: true
  },
  {
    id: 'pharm-3',
    name: 'Rite Aid',
    chain: 'Rite Aid',
    address: '789 Pine St',
    city: 'Anytown',
    state: 'ST',
    zipCode: '12345',
    phone: '(555) 345-6789',
    hours: {
      monday: { open: '08:00', close: '21:00' },
      tuesday: { open: '08:00', close: '21:00' },
      wednesday: { open: '08:00', close: '21:00' },
      thursday: { open: '08:00', close: '21:00' },
      friday: { open: '08:00', close: '21:00' },
      saturday: { open: '09:00', close: '20:00' },
      sunday: { open: '10:00', close: '19:00' }
    },
    services: ['Prescription Filling', 'Wellness Rewards', 'Immunizations'],
    isPreferred: false,
    distance: 2.1,
    rating: 3.8,
    acceptsInsurance: true
  }
];

// Mock Adherence Records (last 30 days)
export const generateMockAdherenceRecords = (): AdherenceRecord[] => {
  const records: AdherenceRecord[] = [];
  const now = new Date();
  
  // Generate records for the last 30 days
  for (let i = 0; i < 30; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    // Generate records for each active medication's reminders
    mockMedicationReminders.forEach(reminder => {
      const medication = mockMedications.find(m => m.id === reminder.medicationId);
      if (medication?.isActive) {
        const scheduledTime = reminder.time;
        const status = Math.random() > 0.15 ? 'taken' : Math.random() > 0.5 ? 'late' : 'missed';
        
        let takenTime: string | undefined;
        if (status === 'taken') {
          const [hour, minute] = scheduledTime.split(':').map(Number);
          const variance = Math.floor(Math.random() * 30) - 15; // ±15 minutes
          const takenDate = new Date(date);
          takenDate.setHours(hour, minute + variance);
          takenTime = takenDate.toTimeString().slice(0, 5);
        } else if (status === 'late') {
          const [hour, minute] = scheduledTime.split(':').map(Number);
          const delay = Math.floor(Math.random() * 120) + 30; // 30-150 minutes late
          const takenDate = new Date(date);
          takenDate.setHours(hour, minute + delay);
          takenTime = takenDate.toTimeString().slice(0, 5);
        }
        
        records.push({
          id: `adh-${reminder.medicationId}-${dateStr}-${scheduledTime}`,
          medicationId: reminder.medicationId,
          date: dateStr,
          scheduledTime,
          takenTime,
          status,
          notes: status === 'missed' ? 'Forgot to take medication' : 
                 status === 'late' ? 'Took medication later than scheduled' : undefined,
          sideEffectsReported: Math.random() > 0.9 ? ['Mild nausea'] : undefined
        });
      }
    });
  }
  
  return records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

export const mockAdherenceRecords = generateMockAdherenceRecords();

// Mock Medication Alerts
export const mockMedicationAlerts: MedicationAlert[] = [
  {
    id: 'alert-1',
    type: 'refill_needed',
    severity: 'warning',
    title: 'Refill Needed Soon',
    message: 'Your Lisinopril prescription has only 3 refills remaining. Consider requesting a refill soon.',
    medicationIds: ['med-1'],
    createdAt: '2024-08-23T10:00:00Z',
    isRead: false,
    actionRequired: true,
    actionUrl: '/medications/refill/med-1'
  },
  {
    id: 'alert-2',
    type: 'interaction_warning',
    severity: 'error',
    title: 'Drug Interaction Detected',
    message: 'Potential moderate interaction between Lisinopril and Ibuprofen. Monitor blood pressure and kidney function.',
    medicationIds: ['med-1', 'med-3'],
    createdAt: '2024-08-23T14:30:00Z',
    isRead: false,
    actionRequired: true
  },
  {
    id: 'alert-3',
    type: 'missed_dose',
    severity: 'info',
    title: 'Missed Dose Reminder',
    message: 'You missed your evening Metformin dose yesterday. Take your next dose as scheduled.',
    medicationIds: ['med-2'],
    createdAt: '2024-08-23T08:00:00Z',
    isRead: true,
    actionRequired: false
  },
  {
    id: 'alert-4',
    type: 'pharmacy_ready',
    severity: 'info',
    title: 'Prescription Ready for Pickup',
    message: 'Your Sertraline prescription is ready for pickup at CVS Pharmacy.',
    medicationIds: ['med-4'],
    createdAt: '2024-08-22T16:45:00Z',
    isRead: false,
    actionRequired: true,
    actionUrl: '/medications/pickup/med-4'
  }
];

// Utility functions
export const calculateAdherenceRate = (medicationId: string, days: number = 30): number => {
  const records = mockAdherenceRecords.filter(r => 
    r.medicationId === medicationId && 
    new Date(r.date) >= new Date(Date.now() - days * 24 * 60 * 60 * 1000)
  );
  
  if (records.length === 0) return 0;
  
  const takenCount = records.filter(r => r.status === 'taken' || r.status === 'late').length;
  return Math.round((takenCount / records.length) * 100);
};

export const getOverallAdherenceRate = (days: number = 30): number => {
  const activeMedications = mockMedications.filter(m => m.isActive);
  if (activeMedications.length === 0) return 0;
  
  const rates = activeMedications.map(m => calculateAdherenceRate(m.id, days));
  return Math.round(rates.reduce((sum, rate) => sum + rate, 0) / rates.length);
};

export const getUpcomingReminders = (): MedicationReminder[] => {
  const now = new Date();
  const today = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const currentTime = now.getHours() * 60 + now.getMinutes();
  
  return mockMedicationReminders
    .filter(reminder => {
      if (!reminder.isActive) return false;
      
      const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const todayName = dayNames[today] as any;
      
      if (!reminder.days.includes(todayName)) return false;
      
      const [hours, minutes] = reminder.time.split(':').map(Number);
      const reminderTime = hours * 60 + minutes;
      
      return reminderTime > currentTime;
    })
    .sort((a, b) => {
      const [aHours, aMinutes] = a.time.split(':').map(Number);
      const [bHours, bMinutes] = b.time.split(':').map(Number);
      return (aHours * 60 + aMinutes) - (bHours * 60 + bMinutes);
    });
};
