import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// File metadata interface
export interface MedicalFileMetadata {
  id: string;
  name: string;
  type: string; // MIME type
  size: number; // bytes
  category?: string;
  description?: string;
  uploadDate: string; // ISO string
  walletAddress: string;
  txHash: string;
  rootHash: string; // 0G Storage hash
  isTextRecord: boolean; // true for JSON records, false for binary files
  recordType?: 'visit' | 'prescription' | 'lab' | 'diagnosis' | 'custom'; // for text records
  tags?: string[];
  shared: boolean; // whether shared with providers
  sharedWith?: string[]; // wallet addresses of providers with access
}

interface MedicalFilesState {
  files: MedicalFileMetadata[];
  
  // File management
  addFile: (file: MedicalFileMetadata) => void;
  updateFile: (id: string, updates: Partial<MedicalFileMetadata>) => void;
  removeFile: (id: string) => void;
  getFileById: (id: string) => MedicalFileMetadata | undefined;
  
  // Filtering and searching
  getFilesByWallet: (walletAddress: string) => MedicalFileMetadata[];
  getFilesByCategory: (category: string, walletAddress?: string) => MedicalFileMetadata[];
  getFilesByType: (isTextRecord: boolean, walletAddress?: string) => MedicalFileMetadata[];
  searchFiles: (query: string, walletAddress?: string) => MedicalFileMetadata[];
  
  // Sharing management
  shareFile: (fileId: string, providerAddress: string) => void;
  unshareFile: (fileId: string, providerAddress: string) => void;
  getSharedFiles: (walletAddress: string) => MedicalFileMetadata[];
  getFilesSharedWith: (providerAddress: string) => MedicalFileMetadata[];
  
  // Bulk operations
  clearFilesForWallet: (walletAddress: string) => void;
  importFiles: (files: MedicalFileMetadata[]) => void;
  exportFiles: (walletAddress: string) => MedicalFileMetadata[];
}

export const useMedicalFilesStore = create<MedicalFilesState>()(
  persist(
    (set, get) => ({
      files: [],
      
      // Add new file
      addFile: (file: MedicalFileMetadata) => {
        set(state => ({
          files: [...state.files, { ...file, id: file.id || `file-${Date.now()}` }]
        }));
      },
      
      // Update existing file
      updateFile: (id: string, updates: Partial<MedicalFileMetadata>) => {
        set(state => ({
          files: state.files.map(file => 
            file.id === id ? { ...file, ...updates } : file
          )
        }));
      },
      
      // Remove file
      removeFile: (id: string) => {
        set(state => ({
          files: state.files.filter(file => file.id !== id)
        }));
      },
      
      // Get file by ID
      getFileById: (id: string) => {
        return get().files.find(file => file.id === id);
      },
      
      // Get files by wallet address
      getFilesByWallet: (walletAddress: string) => {
        return get().files.filter(file => 
          file.walletAddress.toLowerCase() === walletAddress.toLowerCase()
        );
      },
      
      // Get files by category
      getFilesByCategory: (category: string, walletAddress?: string) => {
        return get().files.filter(file => {
          const matchesCategory = file.category?.toLowerCase() === category.toLowerCase();
          const matchesWallet = !walletAddress || 
            file.walletAddress.toLowerCase() === walletAddress.toLowerCase();
          return matchesCategory && matchesWallet;
        });
      },
      
      // Get files by type (text records vs binary files)
      getFilesByType: (isTextRecord: boolean, walletAddress?: string) => {
        return get().files.filter(file => {
          const matchesType = file.isTextRecord === isTextRecord;
          const matchesWallet = !walletAddress || 
            file.walletAddress.toLowerCase() === walletAddress.toLowerCase();
          return matchesType && matchesWallet;
        });
      },
      
      // Search files by name, description, or category
      searchFiles: (query: string, walletAddress?: string) => {
        const searchTerm = query.toLowerCase();
        return get().files.filter(file => {
          const matchesWallet = !walletAddress || 
            file.walletAddress.toLowerCase() === walletAddress.toLowerCase();
          const matchesSearch = 
            file.name.toLowerCase().includes(searchTerm) ||
            file.description?.toLowerCase().includes(searchTerm) ||
            file.category?.toLowerCase().includes(searchTerm) ||
            file.tags?.some(tag => tag.toLowerCase().includes(searchTerm));
          return matchesWallet && matchesSearch;
        });
      },
      
      // Share file with provider
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
      
      // Unshare file from provider
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
      },
      
      // Get shared files for a wallet
      getSharedFiles: (walletAddress: string) => {
        return get().files.filter(file => 
          file.walletAddress.toLowerCase() === walletAddress.toLowerCase() && file.shared
        );
      },
      
      // Get files shared with a provider
      getFilesSharedWith: (providerAddress: string) => {
        return get().files.filter(file => 
          file.sharedWith?.includes(providerAddress)
        );
      },
      
      // Clear all files for a wallet
      clearFilesForWallet: (walletAddress: string) => {
        set(state => ({
          files: state.files.filter(file => 
            file.walletAddress.toLowerCase() !== walletAddress.toLowerCase()
          )
        }));
      },
      
      // Import files (for data migration or bulk import)
      importFiles: (files: MedicalFileMetadata[]) => {
        set(state => {
          // Filter out duplicates based on rootHash
          const existingHashes = new Set(state.files.map(f => f.rootHash));
          const newFiles = files.filter(f => !existingHashes.has(f.rootHash));
          return {
            files: [...state.files, ...newFiles]
          };
        });
      },
      
      // Export files for a wallet
      exportFiles: (walletAddress: string) => {
        return get().files.filter(file => 
          file.walletAddress.toLowerCase() === walletAddress.toLowerCase()
        );
      }
    }),
    {
      name: 'medivet-medical-files',
      version: 1,
    }
  )
);
