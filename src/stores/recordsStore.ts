import { create } from 'zustand';

export interface FileRecord {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: string;
  file_type: string;
  file_size: number;
  zero_g_hash: string;
  tags: string[];
  created_at: string;
  type: 'file';
}

export interface TextRecord {
  id: string;
  title: string;
  description: string;
  content: string;
  category: string;
  type: 'text';
  createdAt: string;
  updatedAt: string;
}

interface RecordsStore {
  textRecords: TextRecord[];
  fileRecords: FileRecord[];
  addTextRecord: (record: Omit<TextRecord, 'id' | 'createdAt' | 'updatedAt' | 'type'>) => void;
  loadFileRecords: (userId: string) => void;
  updateTextRecord: (id: string, updates: Partial<TextRecord>) => void;
  deleteTextRecord: (id: string) => void;
  getRecordsByCategory: (category: string) => (TextRecord | FileRecord)[];
}

export const useRecordsStore = create<RecordsStore>((set, get) => ({
  textRecords: [],
  fileRecords: [],
  
  addTextRecord: (record) => {
    const newRecord: TextRecord = {
      ...record,
      id: `record-${Date.now()}`,
      type: 'text',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    set(state => ({
      textRecords: [...state.textRecords, newRecord]
    }));
  },
  
  loadFileRecords: (userId) => {
    // Load from both old and new localStorage keys
    const fileRecordsKey = `fileRecords_${userId}`;
    const medicalRecordsKey = `medicalRecords_${userId}`;
    
    const fileRecords = JSON.parse(localStorage.getItem(fileRecordsKey) || '[]');
    const medicalRecords = JSON.parse(localStorage.getItem(medicalRecordsKey) || '[]');
    
    // Combine both sources
    const allRecords = [...fileRecords, ...medicalRecords];
    set({ fileRecords: allRecords });
  },
  
  updateTextRecord: (id, updates) => {
    set(state => ({
      textRecords: state.textRecords.map(record => 
        record.id === id 
          ? { ...record, ...updates, updatedAt: new Date().toISOString() }
          : record
      )
    }));
  },
  
  deleteTextRecord: (id) => {
    set(state => ({
      textRecords: state.textRecords.filter(record => record.id !== id)
    }));
  },
  
  getRecordsByCategory: (category) => {
    const { textRecords, fileRecords } = get();
    return [...textRecords, ...fileRecords].filter(record => record.category === category);
  }
}));
