import { create } from 'zustand';

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
  addTextRecord: (record: Omit<TextRecord, 'id' | 'createdAt' | 'updatedAt' | 'type'>) => void;
}

export const useRecordsStore = create<RecordsStore>((set) => ({
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
  }
}));
