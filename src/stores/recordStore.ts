import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { HealthRecord, RecordStatus, Share } from '@/types';

interface RecordState {
  records: HealthRecord[];
  createRecord: (record: Omit<HealthRecord, 'id' | 'createdAt' | 'accessCount'>) => void;
  flagRecord: (id: number, status: RecordStatus) => void;
  shareRecord: (id: number, share: Share) => void;
  unlockRecord: (id: number, provider: string) => Promise<Uint8Array>;
  getRecordsByOwner: (owner: string) => HealthRecord[];
  getSharedRecords: (provider: string) => HealthRecord[];
}

// Seed data
const seedRecords: HealthRecord[] = [
  {
    id: 1,
    owner: 'rdmx6-jaaaa-aaaah-qcaiq-cai',
    title: 'Annual Physical Exam 2024',
    category: 'General Health',
    encryptedBlob: new Uint8Array([1, 2, 3, 4, 5]),
    status: 'Monetizable',
    createdAt: Date.now() - 86400000 * 7, // 7 days ago
    accessCount: 0,
    sharedWith: []
  },
  {
    id: 2,
    owner: 'rdmx6-jaaaa-aaaah-qcaiq-cai',
    title: 'Blood Glucose Monitoring',
    category: 'Diabetes Care',
    encryptedBlob: new Uint8Array([6, 7, 8, 9, 10]),
    status: 'Monetizable',
    createdAt: Date.now() - 86400000 * 3, // 3 days ago
    accessCount: 2,
    sharedWith: [
      {
        provider: 'rrkah-fqaaa-aaaah-qcaiq-cai',
        expiresAt: Date.now() + 86400000 * 30 // 30 days from now
      }
    ]
  },
  {
    id: 3,
    owner: 'rdmx6-jaaaa-aaaah-qcaiq-cai',
    title: 'Cardiology Consultation',
    category: 'Cardiology',
    encryptedBlob: new Uint8Array([11, 12, 13, 14, 15]),
    status: 'NonMonetizable',
    createdAt: Date.now() - 86400000 * 14, // 14 days ago
    accessCount: 1,
    sharedWith: []
  },
  {
    id: 4,
    owner: 'rdmx6-jaaaa-aaaah-qcaiq-cai',
    title: 'Lab Results - Lipid Panel',
    category: 'Laboratory',
    encryptedBlob: new Uint8Array([16, 17, 18, 19, 20]),
    status: 'Monetizable',
    createdAt: Date.now() - 86400000 * 1, // 1 day ago
    accessCount: 0,
    sharedWith: []
  },
  {
    id: 5,
    owner: 'rdmx6-jaaaa-aaaah-qcaiq-cai',
    title: 'Mental Health Assessment',
    category: 'Mental Health',
    encryptedBlob: new Uint8Array([21, 22, 23, 24, 25]),
    status: 'Flagged',
    createdAt: Date.now() - 86400000 * 21, // 21 days ago
    accessCount: 0,
    sharedWith: []
  }
];

export const useRecordStore = create<RecordState>()(
  persist(
    (set, get) => ({
      records: seedRecords,

      createRecord: (recordData) => {
        const newRecord: HealthRecord = {
          ...recordData,
          id: Math.max(...get().records.map(r => r.id), 0) + 1,
          createdAt: Date.now(),
          accessCount: 0,
          sharedWith: []
        };
        
        set(state => ({
          records: [...state.records, newRecord]
        }));
      },

      flagRecord: (id, status) => {
        set(state => ({
          records: state.records.map(record =>
            record.id === id ? { ...record, status } : record
          )
        }));
      },

      shareRecord: (id, share) => {
        set(state => ({
          records: state.records.map(record =>
            record.id === id 
              ? { 
                  ...record, 
                  sharedWith: [...(record.sharedWith || []), share]
                }
              : record
          )
        }));
      },

      unlockRecord: async (id, provider) => {
        // Simulate decryption process
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        set(state => ({
          records: state.records.map(record =>
            record.id === id 
              ? { ...record, accessCount: record.accessCount + 1 }
              : record
          )
        }));

        const record = get().records.find(r => r.id === id);
        return record?.encryptedBlob || new Uint8Array();
      },

      getRecordsByOwner: (owner) => {
        return get().records.filter(record => record.owner === owner);
      },

      getSharedRecords: (provider) => {
        return get().records.filter(record => 
          record.sharedWith?.some(share => share.provider === provider)
        );
      }
    }),
    {
      name: 'medivet-records'
    }
  )
);