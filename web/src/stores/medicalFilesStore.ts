import { create } from 'zustand';

export interface MedicalFileMetadata {
  id: string;
  name: string;
  type: string;
  size: number;
  category?: string;
  description?: string;
  uploadDate: string;
  walletAddress: string;
  txHash: string;
  rootHash: string;
  isTextRecord: boolean;
  recordType?: 'visit' | 'prescription' | 'lab' | 'diagnosis' | 'custom';
  tags?: string[];
  shared: boolean;
  sharedWith?: string[];
}

interface MedicalFilesState {
  files: MedicalFileMetadata[];
  addFile: (file: MedicalFileMetadata) => void;
  updateFile: (id: string, updates: Partial<MedicalFileMetadata>) => void;
  removeFile: (id: string) => void;
  getFileById: (id: string) => MedicalFileMetadata | undefined;
  getFilesByWallet: (walletAddress: string) => MedicalFileMetadata[];
  shareFile: (fileId: string, providerAddress: string) => void;
  unshareFile: (fileId: string, providerAddress: string) => void;
}

export const useMedicalFilesStore = create<MedicalFilesState>()(
  (set, get) => ({
    files: [],
    
    addFile: (file: MedicalFileMetadata) => {
      set(state => ({
        files: [...state.files, { ...file, id: file.id || `file-${Date.now()}` }]
      }));
    },
    
    updateFile: (id: string, updates: Partial<MedicalFileMetadata>) => {
      set(state => ({
        files: state.files.map(file => 
          file.id === id ? { ...file, ...updates } : file
        )
      }));
    },
    
    removeFile: (id: string) => {
      set(state => ({
        files: state.files.filter(file => file.id !== id)
      }));
    },
    
    getFileById: (id: string) => {
      return get().files.find(file => file.id === id);
    },
    
    getFilesByWallet: (walletAddress: string) => {
      return get().files.filter(file => 
        file.walletAddress.toLowerCase() === walletAddress.toLowerCase()
      );
    },
    
    shareFile: (fileId: string, providerAddress: string) => {
      set(state => ({
        files: state.files.map(file => {
          if (file.id === fileId) {
            const sharedWith = file.sharedWith || [];
            if (!sharedWith.includes(providerAddress)) {
              return {
                ...file,
                shared: true,
                sharedWith: [...sharedWith, providerAddress]
              };
            }
          }
          return file;
        })
      }));
    },
    
    unshareFile: (fileId: string, providerAddress: string) => {
      set(state => ({
        files: state.files.map(file => {
          if (file.id === fileId) {
            const sharedWith = (file.sharedWith || []).filter(addr => addr !== providerAddress);
            return {
              ...file,
              shared: sharedWith.length > 0,
              sharedWith
            };
          }
          return file;
        })
      }));
    }
  })
);
