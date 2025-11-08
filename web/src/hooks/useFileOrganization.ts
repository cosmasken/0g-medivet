/**
 * File Organization Hook
 * Manages file categorization, tagging, and organization features
 */

import { useState, useCallback, useMemo } from 'react';
import { MedicalFileMetadata, useMedicalFilesStore } from '@/stores/medicalFilesStore';

export interface FileCategory {
    id: string;
    name: string;
    color: string;
    icon: string;
    description?: string;
}

export interface FileTag {
    id: string;
    name: string;
    color: string;
    count: number;
}

export interface OrganizationStats {
    totalFiles: number;
    categorizedFiles: number;
    taggedFiles: number;
    favoriteFiles: number;
    sharedFiles: number;
    categories: FileCategory[];
    tags: FileTag[];
    recentActivity: Array<{
        type: 'categorized' | 'tagged' | 'shared' | 'favorited';
        fileId: string;
        fileName: string;
        timestamp: Date;
    }>;
}

interface UseFileOrganizationReturn {
    categories: FileCategory[];
    tags: FileTag[];
    stats: OrganizationStats;
    addCategory: (category: Omit<FileCategory, 'id'>) => FileCategory;
    updateCategory: (categoryId: string, updates: Partial<FileCategory>) => boolean;
    deleteCategory: (categoryId: string) => boolean;
    categorizeFile: (fileId: string, categoryId: string) => boolean;
    addTag: (fileId: string, tagName: string) => boolean;
    removeTag: (fileId: string, tagName: string) => boolean;
    toggleFavorite: (fileId: string) => boolean;
    bulkCategorize: (fileIds: string[], categoryId: string) => number;
    bulkTag: (fileIds: string[], tagName: string) => number;
    bulkUntag: (fileIds: string[], tagName: string) => number;
    getFilesByCategory: (categoryId: string) => MedicalFileMetadata[];
    getFilesByTag: (tagName: string) => MedicalFileMetadata[];
    getFavoriteFiles: () => MedicalFileMetadata[];
    getRecentFiles: (days?: number) => MedicalFileMetadata[];
    searchFiles: (query: string) => MedicalFileMetadata[];
    exportOrganization: () => string;
    importOrganization: (data: string) => boolean;
}

const DEFAULT_CATEGORIES: FileCategory[] = [
    {
        id: 'medical-records',
        name: 'Medical Records',
        color: '#3b82f6',
        icon: 'FileText',
        description: 'General medical records and documents'
    },
    {
        id: 'lab-results',
        name: 'Lab Results',
        color: '#10b981',
        icon: 'TestTube',
        description: 'Laboratory test results and reports'
    },
    {
        id: 'prescriptions',
        name: 'Prescriptions',
        color: '#f59e0b',
        icon: 'Pill',
        description: 'Prescription medications and instructions'
    },
    {
        id: 'imaging',
        name: 'Medical Imaging',
        color: '#8b5cf6',
        icon: 'Scan',
        description: 'X-rays, MRIs, CT scans, and other imaging'
    },
    {
        id: 'visit-notes',
        name: 'Visit Notes',
        color: '#06b6d4',
        icon: 'Calendar',
        description: 'Doctor visit notes and consultations'
    },
    {
        id: 'insurance',
        name: 'Insurance',
        color: '#ef4444',
        icon: 'Shield',
        description: 'Insurance documents and claims'
    }
];

export function useFileOrganization(): UseFileOrganizationReturn {
    const { files, updateFile } = useMedicalFilesStore();

    const [categories, setCategories] = useState<FileCategory[]>(() => {
        // Load categories from localStorage or use defaults
        const saved = localStorage.getItem('meddata-categories');
        return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
    });

    // Calculate tags from files
    const tags = useMemo((): FileTag[] => {
        const tagCounts = new Map<string, number>();

        files.forEach(file => {
            file.tags?.forEach(tag => {
                tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
            });
        });

        return Array.from(tagCounts.entries()).map(([name, count]) => ({
            id: name,
            name,
            color: getTagColor(name),
            count
        }));
    }, [files]);

    // Calculate organization stats
    const stats = useMemo((): OrganizationStats => {
        const totalFiles = files.length;
        const categorizedFiles = files.filter(f => f.category).length;
        const taggedFiles = files.filter(f => f.tags && f.tags.length > 0).length;
        const favoriteFiles = files.filter(f => f.tags?.includes('favorite')).length;
        const sharedFiles = files.filter(f => f.shared).length;

        // Get recent activity (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const recentActivity = files
            .filter(f => new Date(f.uploadDate) > sevenDaysAgo)
            .map(f => ({
                type: 'categorized' as const,
                fileId: f.id,
                fileName: f.name,
                timestamp: new Date(f.uploadDate)
            }))
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
            .slice(0, 10);

        return {
            totalFiles,
            categorizedFiles,
            taggedFiles,
            favoriteFiles,
            sharedFiles,
            categories,
            tags,
            recentActivity
        };
    }, [files, categories, tags]);

    // Persist categories to localStorage
    const persistCategories = useCallback((newCategories: FileCategory[]) => {
        localStorage.setItem('meddata-categories', JSON.stringify(newCategories));
    }, []);

    // Add new category
    const addCategory = useCallback((category: Omit<FileCategory, 'id'>): FileCategory => {
        const newCategory: FileCategory = {
            ...category,
            id: `category-${Date.now()}`
        };

        setCategories(prev => {
            const updated = [...prev, newCategory];
            persistCategories(updated);
            return updated;
        });

        return newCategory;
    }, [persistCategories]);

    // Update category
    const updateCategory = useCallback((categoryId: string, updates: Partial<FileCategory>): boolean => {
        setCategories(prev => {
            const index = prev.findIndex(c => c.id === categoryId);
            if (index === -1) return prev;

            const updated = [...prev];
            updated[index] = { ...updated[index], ...updates };
            persistCategories(updated);
            return updated;
        });

        return true;
    }, [persistCategories]);

    // Delete category
    const deleteCategory = useCallback((categoryId: string): boolean => {
        setCategories(prev => {
            const filtered = prev.filter(c => c.id !== categoryId);
            persistCategories(filtered);
            return filtered;
        });

        // Remove category from all files
        files.forEach(file => {
            if (file.category === categoryId) {
                updateFile(file.id, { category: undefined });
            }
        });

        return true;
    }, [files, updateFile, persistCategories]);

    // Categorize file
    const categorizeFile = useCallback((fileId: string, categoryId: string): boolean => {
        const category = categories.find(c => c.id === categoryId);
        if (!category) return false;

        updateFile(fileId, { category: category.name });
        return true;
    }, [categories, updateFile]);

    // Add tag to file
    const addTag = useCallback((fileId: string, tagName: string): boolean => {
        const file = files.find(f => f.id === fileId);
        if (!file) return false;

        const currentTags = file.tags || [];
        if (currentTags.includes(tagName)) return false;

        updateFile(fileId, { tags: [...currentTags, tagName] });
        return true;
    }, [files, updateFile]);

    // Remove tag from file
    const removeTag = useCallback((fileId: string, tagName: string): boolean => {
        const file = files.find(f => f.id === fileId);
        if (!file) return false;

        const currentTags = file.tags || [];
        const updatedTags = currentTags.filter(tag => tag !== tagName);

        updateFile(fileId, { tags: updatedTags });
        return true;
    }, [files, updateFile]);

    // Toggle favorite status
    const toggleFavorite = useCallback((fileId: string): boolean => {
        const file = files.find(f => f.id === fileId);
        if (!file) return false;

        const currentTags = file.tags || [];
        const isFavorite = currentTags.includes('favorite');

        if (isFavorite) {
            updateFile(fileId, { tags: currentTags.filter(tag => tag !== 'favorite') });
        } else {
            updateFile(fileId, { tags: [...currentTags, 'favorite'] });
        }

        return true;
    }, [files, updateFile]);

    // Bulk categorize files
    const bulkCategorize = useCallback((fileIds: string[], categoryId: string): number => {
        const category = categories.find(c => c.id === categoryId);
        if (!category) return 0;

        let successCount = 0;
        fileIds.forEach(fileId => {
            if (files.find(f => f.id === fileId)) {
                updateFile(fileId, { category: category.name });
                successCount++;
            }
        });

        return successCount;
    }, [categories, files, updateFile]);

    // Bulk tag files
    const bulkTag = useCallback((fileIds: string[], tagName: string): number => {
        let successCount = 0;

        fileIds.forEach(fileId => {
            const file = files.find(f => f.id === fileId);
            if (file) {
                const currentTags = file.tags || [];
                if (!currentTags.includes(tagName)) {
                    updateFile(fileId, { tags: [...currentTags, tagName] });
                    successCount++;
                }
            }
        });

        return successCount;
    }, [files, updateFile]);

    // Bulk untag files
    const bulkUntag = useCallback((fileIds: string[], tagName: string): number => {
        let successCount = 0;

        fileIds.forEach(fileId => {
            const file = files.find(f => f.id === fileId);
            if (file && file.tags?.includes(tagName)) {
                const updatedTags = file.tags.filter(tag => tag !== tagName);
                updateFile(fileId, { tags: updatedTags });
                successCount++;
            }
        });

        return successCount;
    }, [files, updateFile]);

    // Get files by category
    const getFilesByCategory = useCallback((categoryId: string): MedicalFileMetadata[] => {
        const category = categories.find(c => c.id === categoryId);
        if (!category) return [];

        return files.filter(f => f.category === category.name);
    }, [files, categories]);

    // Get files by tag
    const getFilesByTag = useCallback((tagName: string): MedicalFileMetadata[] => {
        return files.filter(f => f.tags?.includes(tagName));
    }, [files]);

    // Get favorite files
    const getFavoriteFiles = useCallback((): MedicalFileMetadata[] => {
        return files.filter(f => f.tags?.includes('favorite'));
    }, [files]);

    // Get recent files
    const getRecentFiles = useCallback((days: number = 7): MedicalFileMetadata[] => {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);

        return files
            .filter(f => new Date(f.uploadDate) > cutoffDate)
            .sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime());
    }, [files]);

    // Search files
    const searchFiles = useCallback((query: string): MedicalFileMetadata[] => {
        if (!query.trim()) return files;

        const searchTerm = query.toLowerCase();
        return files.filter(f =>
            f.name.toLowerCase().includes(searchTerm) ||
            f.description?.toLowerCase().includes(searchTerm) ||
            f.category?.toLowerCase().includes(searchTerm) ||
            f.tags?.some(tag => tag.toLowerCase().includes(searchTerm))
        );
    }, [files]);

    // Export organization data
    const exportOrganization = useCallback((): string => {
        const exportData = {
            categories,
            version: '1.0',
            exportDate: new Date().toISOString()
        };

        return JSON.stringify(exportData, null, 2);
    }, [categories]);

    // Import organization data
    const importOrganization = useCallback((data: string): boolean => {
        try {
            const importData = JSON.parse(data);

            if (importData.categories && Array.isArray(importData.categories)) {
                setCategories(importData.categories);
                persistCategories(importData.categories);
                return true;
            }

            return false;
        } catch (error) {
            console.error('Failed to import organization data:', error);
            return false;
        }
    }, [persistCategories]);

    return {
        categories,
        tags,
        stats,
        addCategory,
        updateCategory,
        deleteCategory,
        categorizeFile,
        addTag,
        removeTag,
        toggleFavorite,
        bulkCategorize,
        bulkTag,
        bulkUntag,
        getFilesByCategory,
        getFilesByTag,
        getFavoriteFiles,
        getRecentFiles,
        searchFiles,
        exportOrganization,
        importOrganization
    };
}

// Helper function to generate consistent colors for tags
function getTagColor(tagName: string): string {
    const colors = [
        '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4',
        '#ef4444', '#84cc16', '#f97316', '#ec4899', '#6366f1'
    ];

    let hash = 0;
    for (let i = 0; i < tagName.length; i++) {
        hash = tagName.charCodeAt(i) + ((hash << 5) - hash);
    }

    return colors[Math.abs(hash) % colors.length];
}