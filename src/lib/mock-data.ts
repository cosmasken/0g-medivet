export interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  avatar?: string;
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  medicalHistory: MedicalRecord[];
  permissions: PatientPermissions;
}

export interface Provider {
  id: string;
  name: string;
  specialty: string;
  organization: string;
  email: string;
  phone: string;
  avatar?: string;
  patients: string[];
  permissions: ProviderPermissions;
}

export interface MedicalAttachment {
  id: string;
  filename: string;
  fileType: 'pdf' | 'image' | 'document' | 'video' | 'audio';
  mimeType: string;
  size: number; // in bytes
  uploadedAt: string;
  uploadedBy: string;
  description?: string;
  thumbnailUrl?: string;
  isEncrypted: boolean;
  accessCount: number;
  lastAccessed?: string;
}

export interface MedicalRecord {
  id: string;
  type: 'lab' | 'imaging' | 'prescription' | 'visit' | 'vital' | 'allergy';
  title: string;
  description: string;
  date: string;
  provider: string;
  sharedWith: string[];
  sensitive: boolean;
  attachments: MedicalAttachment[];
  tags?: string[];
  notes?: string;
}

export interface PatientPermissions {
  [providerId: string]: {
    basicInfo: boolean;
    medicalHistory: boolean;
    labResults: boolean;
    imaging: boolean;
    prescriptions: boolean;
    vitals: boolean;
    allergies: boolean;
    emergencyContact: boolean;
  };
}

export interface ProviderPermissions {
  [patientId: string]: {
    basicInfo: boolean;
    medicalHistory: boolean;
    labResults: boolean;
    imaging: boolean;
    prescriptions: boolean;
    vitals: boolean;
    allergies: boolean;
    emergencyContact: boolean;
  };
}

/**
 * Generate a realistic avatar URL using Unsplash
 * Uses specific seeds for consistent images per user
 */
export const generateAvatarUrl = (seed: string, isProvider: boolean = false) => {
  // Use different collections for patients vs providers
  const collection = isProvider ? 'business,professional' : 'people,portrait';
  const size = '150x150';
  
  // Create a consistent seed based on the input
  const numericSeed = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  return `https://images.unsplash.com/${size}/?${collection}&sig=${numericSeed}`;
};

export const mockPatients: Patient[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@email.com',
    phone: '(555) 123-4567',
    dateOfBirth: '1985-03-15',
    address: '123 Main St, Anytown, ST 12345',
    avatar: generateAvatarUrl('sarah-johnson-1'),
    emergencyContact: {
      name: 'Mike Johnson',
      phone: '(555) 987-6543',
      relationship: 'Spouse'
    },
    medicalHistory: [
      {
        id: 'r1',
        type: 'lab',
        title: 'Complete Blood Count',
        description: 'Routine blood work - all values normal',
        date: '2024-01-15',
        provider: 'Dr. Smith',
        sharedWith: ['p1', 'p2'],
        sensitive: false,
        attachments: [
          {
            id: 'att1',
            filename: 'CBC_Results_2024-01-15.pdf',
            fileType: 'pdf',
            mimeType: 'application/pdf',
            size: 245760,
            uploadedAt: '2024-01-15T10:30:00Z',
            uploadedBy: 'Dr. Smith',
            description: 'Complete Blood Count laboratory results',
            isEncrypted: true,
            accessCount: 3,
            lastAccessed: '2024-01-20T14:22:00Z'
          },
          {
            id: 'att2',
            filename: 'Lab_Reference_Values.pdf',
            fileType: 'pdf',
            mimeType: 'application/pdf',
            size: 156432,
            uploadedAt: '2024-01-15T10:32:00Z',
            uploadedBy: 'Lab Technician',
            description: 'Reference ranges for blood work values',
            isEncrypted: true,
            accessCount: 1,
            lastAccessed: '2024-01-15T11:00:00Z'
          }
        ],
        tags: ['routine', 'blood-work', 'normal'],
        notes: 'All values within normal range. Patient advised to maintain current health regimen.'
      },
      {
        id: 'r2',
        type: 'prescription',
        title: 'Lisinopril 10mg',
        description: 'Blood pressure medication',
        date: '2024-01-10',
        provider: 'Dr. Smith',
        sharedWith: ['p1'],
        sensitive: false,
        attachments: [
          {
            id: 'att3',
            filename: 'Prescription_Lisinopril_2024-01-10.pdf',
            fileType: 'pdf',
            mimeType: 'application/pdf',
            size: 98304,
            uploadedAt: '2024-01-10T14:15:00Z',
            uploadedBy: 'Dr. Smith',
            description: 'Electronic prescription for Lisinopril',
            isEncrypted: true,
            accessCount: 2,
            lastAccessed: '2024-01-10T16:45:00Z'
          },
          {
            id: 'att4',
            filename: 'Medication_Guide_Lisinopril.pdf',
            fileType: 'pdf',
            mimeType: 'application/pdf',
            size: 512000,
            uploadedAt: '2024-01-10T14:16:00Z',
            uploadedBy: 'Pharmacy System',
            description: 'Patient medication guide and side effects',
            isEncrypted: false,
            accessCount: 1,
            lastAccessed: '2024-01-10T17:00:00Z'
          }
        ],
        tags: ['prescription', 'blood-pressure', 'lisinopril'],
        notes: 'Started on low dose. Monitor blood pressure weekly. Follow up in 4 weeks.'
      },
      {
        id: 'r3',
        type: 'visit',
        title: 'Mental Health Consultation',
        description: 'Anxiety and depression screening',
        date: '2024-01-05',
        provider: 'Dr. Wilson',
        sharedWith: ['p3'],
        sensitive: true,
        attachments: [
          {
            id: 'att5',
            filename: 'Mental_Health_Assessment_2024-01-05.pdf',
            fileType: 'pdf',
            mimeType: 'application/pdf',
            size: 324576,
            uploadedAt: '2024-01-05T16:30:00Z',
            uploadedBy: 'Dr. Wilson',
            description: 'Comprehensive mental health evaluation report',
            isEncrypted: true,
            accessCount: 1,
            lastAccessed: '2024-01-05T17:00:00Z'
          },
          {
            id: 'att6',
            filename: 'PHQ9_GAD7_Scores.pdf',
            fileType: 'pdf',
            mimeType: 'application/pdf',
            size: 87040,
            uploadedAt: '2024-01-05T16:35:00Z',
            uploadedBy: 'Dr. Wilson',
            description: 'Depression and anxiety screening questionnaire results',
            isEncrypted: true,
            accessCount: 1,
            lastAccessed: '2024-01-05T17:00:00Z'
          },
          {
            id: 'att7',
            filename: 'Treatment_Plan_Audio_Notes.mp3',
            fileType: 'audio',
            mimeType: 'audio/mpeg',
            size: 1048576,
            uploadedAt: '2024-01-05T17:00:00Z',
            uploadedBy: 'Dr. Wilson',
            description: 'Audio notes from consultation session',
            isEncrypted: true,
            accessCount: 0
          }
        ],
        tags: ['mental-health', 'consultation', 'screening', 'sensitive'],
        notes: 'Patient shows mild anxiety symptoms. Recommended therapy and lifestyle changes. Follow-up in 2 weeks.'
      }
    ],
    permissions: {
      'p1': {
        basicInfo: true,
        medicalHistory: true,
        labResults: true,
        imaging: true,
        prescriptions: true,
        vitals: true,
        allergies: true,
        emergencyContact: false
      },
      'p2': {
        basicInfo: true,
        medicalHistory: false,
        labResults: true,
        imaging: false,
        prescriptions: false,
        vitals: true,
        allergies: true,
        emergencyContact: false
      },
      'p3': {
        basicInfo: true,
        medicalHistory: true,
        labResults: false,
        imaging: false,
        prescriptions: true,
        vitals: false,
        allergies: false,
        emergencyContact: false
      }
    }
  },
  {
    id: '2',
    name: 'David Chen',
    email: 'david.chen@email.com',
    phone: '(555) 234-5678',
    dateOfBirth: '1978-11-22',
    address: '456 Oak Ave, Somewhere, ST 67890',
    avatar: generateAvatarUrl('david-chen-2'),
    emergencyContact: {
      name: 'Lisa Chen',
      phone: '(555) 876-5432',
      relationship: 'Spouse'
    },
    medicalHistory: [
      {
        id: 'r4',
        type: 'imaging',
        title: 'Chest X-Ray',
        description: 'Clear lungs, no abnormalities',
        date: '2024-01-20',
        provider: 'Dr. Brown',
        sharedWith: ['p1', 'p2'],
        sensitive: false,
        attachments: [
          {
            id: 'att8',
            filename: 'Chest_XRay_PA_2024-01-20.dcm',
            fileType: 'image',
            mimeType: 'application/dicom',
            size: 2048576,
            uploadedAt: '2024-01-20T15:45:00Z',
            uploadedBy: 'Dr. Brown',
            description: 'Chest X-Ray PA view DICOM image',
            thumbnailUrl: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=',
            isEncrypted: true,
            accessCount: 2,
            lastAccessed: '2024-01-22T09:15:00Z'
          },
          {
            id: 'att9',
            filename: 'Radiology_Report_2024-01-20.pdf',
            fileType: 'pdf',
            mimeType: 'application/pdf',
            size: 189440,
            uploadedAt: '2024-01-20T16:20:00Z',
            uploadedBy: 'Dr. Brown',
            description: 'Radiologist interpretation and findings',
            isEncrypted: true,
            accessCount: 4,
            lastAccessed: '2024-01-25T11:30:00Z'
          }
        ],
        tags: ['imaging', 'chest', 'screening', 'clear'],
        notes: 'No acute cardiopulmonary abnormalities. Heart size normal. Lungs clear.'
      },
      {
        id: 'r5',
        type: 'allergy',
        title: 'Penicillin Allergy',
        description: 'Severe allergic reaction - anaphylaxis risk',
        date: '2020-05-15',
        provider: 'Dr. Smith',
        sharedWith: ['p1', 'p2', 'p3'],
        sensitive: false,
        attachments: [
          {
            id: 'att10',
            filename: 'Allergy_Test_Results_2020-05-15.pdf',
            fileType: 'pdf',
            mimeType: 'application/pdf',
            size: 156672,
            uploadedAt: '2020-05-15T11:20:00Z',
            uploadedBy: 'Dr. Smith',
            description: 'Comprehensive allergy testing results',
            isEncrypted: true,
            accessCount: 8,
            lastAccessed: '2024-01-15T14:30:00Z'
          },
          {
            id: 'att11',
            filename: 'Emergency_Action_Plan.pdf',
            fileType: 'pdf',
            mimeType: 'application/pdf',
            size: 245760,
            uploadedAt: '2020-05-15T11:25:00Z',
            uploadedBy: 'Dr. Smith',
            description: 'Emergency treatment protocol for anaphylaxis',
            isEncrypted: false,
            accessCount: 12,
            lastAccessed: '2024-01-20T16:45:00Z'
          },
          {
            id: 'att12',
            filename: 'EpiPen_Instructions_Video.mp4',
            fileType: 'video',
            mimeType: 'video/mp4',
            size: 15728640,
            uploadedAt: '2020-05-15T11:30:00Z',
            uploadedBy: 'Nurse Practitioner',
            description: 'EpiPen usage demonstration video',
            thumbnailUrl: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=',
            isEncrypted: false,
            accessCount: 3,
            lastAccessed: '2023-08-10T10:15:00Z'
          }
        ],
        tags: ['allergy', 'penicillin', 'anaphylaxis', 'emergency'],
        notes: 'CRITICAL ALLERGY - Ensure all providers are aware. Patient carries EpiPen at all times.'
      }
    ],
    permissions: {
      'p1': {
        basicInfo: true,
        medicalHistory: true,
        labResults: true,
        imaging: true,
        prescriptions: true,
        vitals: true,
        allergies: true,
        emergencyContact: true
      },
      'p2': {
        basicInfo: true,
        medicalHistory: true,
        labResults: false,
        imaging: true,
        prescriptions: false,
        vitals: false,
        allergies: true,
        emergencyContact: false
      }
    }
  }
];

export const mockProviders: Provider[] = [
  {
    id: 'p1',
    name: 'Dr. Emily Smith',
    specialty: 'Internal Medicine',
    organization: 'City General Hospital',
    email: 'e.smith@citygeneral.com',
    phone: '(555) 111-2222',
    avatar: generateAvatarUrl('dr-emily-smith-p1', true),
    patients: ['1', '2'],
    permissions: {
      '1': {
        basicInfo: true,
        medicalHistory: true,
        labResults: true,
        imaging: true,
        prescriptions: true,
        vitals: true,
        allergies: true,
        emergencyContact: false
      },
      '2': {
        basicInfo: true,
        medicalHistory: true,
        labResults: true,
        imaging: true,
        prescriptions: true,
        vitals: true,
        allergies: true,
        emergencyContact: true
      }
    }
  },
  {
    id: 'p2',
    name: 'Dr. Michael Brown',
    specialty: 'Radiology',
    organization: 'Metro Imaging Center',
    email: 'm.brown@metroimaging.com',
    phone: '(555) 333-4444',
    avatar: generateAvatarUrl('dr-michael-brown-p2', true),
    patients: ['1', '2'],
    permissions: {
      '1': {
        basicInfo: true,
        medicalHistory: false,
        labResults: true,
        imaging: true,
        prescriptions: false,
        vitals: true,
        allergies: true,
        emergencyContact: false
      },
      '2': {
        basicInfo: true,
        medicalHistory: true,
        labResults: false,
        imaging: true,
        prescriptions: false,
        vitals: false,
        allergies: true,
        emergencyContact: false
      }
    }
  },
  {
    id: 'p3',
    name: 'Dr. Sarah Wilson',
    specialty: 'Psychiatry',
    organization: 'Wellness Mental Health',
    email: 's.wilson@wellnessmental.com',
    phone: '(555) 555-6666',
    avatar: generateAvatarUrl('dr-sarah-wilson-p3', true),
    patients: ['1'],
    permissions: {
      '1': {
        basicInfo: true,
        medicalHistory: true,
        labResults: false,
        imaging: false,
        prescriptions: true,
        vitals: false,
        allergies: false,
        emergencyContact: false
      }
    }
  }
];

export interface ProviderRequest {
  id: string;
  providerId: string;
  providerName: string;
  providerSpecialty: string;
  providerOrganization: string;
  providerEmail: string;
  providerAvatar?: string;
  patientId: string;
  requestedPermissions: {
    basicInfo: boolean;
    medicalHistory: boolean;
    labResults: boolean;
    imaging: boolean;
    prescriptions: boolean;
    vitals: boolean;
    allergies: boolean;
    emergencyContact: boolean;
  };
  requestMessage: string;
  requestReason: string;
  status: 'pending' | 'approved' | 'denied' | 'expired';
  requestedAt: string;
  respondedAt?: string;
  expiresAt: string;
  urgency: 'low' | 'medium' | 'high' | 'emergency';
}

export const mockProviderRequests: ProviderRequest[] = [
  {
    id: 'req-1',
    providerId: 'p4',
    providerName: 'Dr. Jennifer Martinez',
    providerSpecialty: 'Emergency Medicine',
    providerOrganization: 'City Emergency Hospital',
    providerEmail: 'j.martinez@cityemergency.com',
    providerAvatar: generateAvatarUrl('dr-jennifer-martinez-p4', true),
    patientId: '1',
    requestedPermissions: {
      basicInfo: true,
      medicalHistory: true,
      labResults: true,
      imaging: false,
      prescriptions: true,
      vitals: true,
      allergies: true,
      emergencyContact: true
    },
    requestMessage: 'I am treating your emergency case and need access to your medical information to provide the best care possible.',
    requestReason: 'Emergency Treatment',
    status: 'pending',
    requestedAt: '2024-08-23T10:30:00Z',
    expiresAt: '2024-08-30T10:30:00Z',
    urgency: 'emergency'
  },
  {
    id: 'req-2',
    providerId: 'p5',
    providerName: 'Dr. Robert Kim',
    providerSpecialty: 'Cardiology',
    providerOrganization: 'Heart Center Medical Group',
    providerEmail: 'r.kim@heartcenter.com',
    providerAvatar: generateAvatarUrl('dr-robert-kim-p5', true),
    patientId: '1',
    requestedPermissions: {
      basicInfo: true,
      medicalHistory: true,
      labResults: true,
      imaging: true,
      prescriptions: true,
      vitals: true,
      allergies: true,
      emergencyContact: false
    },
    requestMessage: 'I would like to review your cardiac history and recent test results for your upcoming consultation.',
    requestReason: 'Specialist Consultation',
    status: 'pending',
    requestedAt: '2024-08-22T14:15:00Z',
    expiresAt: '2024-08-29T14:15:00Z',
    urgency: 'medium'
  },
  {
    id: 'req-3',
    providerId: 'p6',
    providerName: 'Dr. Lisa Thompson',
    providerSpecialty: 'Dermatology',
    providerOrganization: 'Skin Health Clinic',
    providerEmail: 'l.thompson@skinhealthclinic.com',
    providerAvatar: generateAvatarUrl('dr-lisa-thompson-p6', true),
    patientId: '1',
    requestedPermissions: {
      basicInfo: true,
      medicalHistory: false,
      labResults: false,
      imaging: true,
      prescriptions: false,
      vitals: false,
      allergies: true,
      emergencyContact: false
    },
    requestMessage: 'I need to review your skin condition history and any relevant imaging for your dermatology appointment.',
    requestReason: 'Routine Consultation',
    status: 'pending',
    requestedAt: '2024-08-21T09:45:00Z',
    expiresAt: '2024-08-28T09:45:00Z',
    urgency: 'low'
  },
  {
    id: 'req-4',
    providerId: 'p7',
    providerName: 'Dr. Ahmed Hassan',
    providerSpecialty: 'Orthopedic Surgery',
    providerOrganization: 'Sports Medicine Institute',
    providerEmail: 'a.hassan@sportsmed.com',
    providerAvatar: generateAvatarUrl('dr-ahmed-hassan-p7', true),
    patientId: '1',
    requestedPermissions: {
      basicInfo: true,
      medicalHistory: true,
      labResults: false,
      imaging: true,
      prescriptions: true,
      vitals: false,
      allergies: true,
      emergencyContact: false
    },
    requestMessage: 'I need access to your orthopedic history and imaging studies to plan your surgical procedure.',
    requestReason: 'Pre-surgical Planning',
    status: 'pending',
    requestedAt: '2024-08-20T16:20:00Z',
    expiresAt: '2024-08-27T16:20:00Z',
    urgency: 'high'
  }
];

export const currentUser = {
  type: 'patient' as 'patient' | 'provider',
  id: '1'
};