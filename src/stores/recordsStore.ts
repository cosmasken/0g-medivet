import { create } from 'zustand';

export interface TextRecord {
  id: string;
  title: string;
  description: string;
  content: string;
  category: string;
  type: 'text' | 'file';
  createdAt: string;
  updatedAt: string;
}

interface RecordsStore {
  textRecords: TextRecord[];
  addTextRecord: (record: Omit<TextRecord, 'id' | 'createdAt' | 'updatedAt' | 'type'>) => void;
  updateTextRecord: (id: string, updates: Partial<TextRecord>) => void;
  deleteTextRecord: (id: string) => void;
  getRecordsByCategory: (category: string) => TextRecord[];
}

export const useRecordsStore = create<RecordsStore>((set, get) => ({
  textRecords: [],
  
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
    const { textRecords } = get();
    return textRecords.filter(record => record.category === category);
  }
}));
