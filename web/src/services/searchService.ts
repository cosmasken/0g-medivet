/**
 * Advanced Search Service
 * Provides client-side search indexing and filtering for medical files
 */

import { FileRecord } from './downloadManager';
import { MedicalFileMetadata } from '@/stores/medicalFilesStore';

export interface SearchFilters {
    query?: string;
    fileTypes?: string[];
    categories?: string[];
    dateRange?: {
        start: Date;
        end: Date;
    };
    sizeRange?: {
        min: number; // in bytes
        max: number; // in bytes
    };
    tags?: string[];
    isEncrypted?: boolean;
    isShared?: boolean;
    recordTypes?: string[];
}

export interface SearchOptions {
    sortBy?: 'name' | 'date' | 'size' | 'relevance';
    sortOrder?: 'asc' | 'desc';
    limit?: number;
    offset?: number;
    highlightMatches?: boolean;
}

export interface SearchResult {
    file: MedicalFileMetadata;
    relevanceScore: number;
    matchedFields: string[];
    highlights?: Record<string, string>;
}

export interface SearchResponse {
    results: SearchResult[];
    totalCount: number;
    hasMore: boolean;
    searchTime: number;
    suggestions?: string[];
}

export interface SavedSearch {
    id: string;
    name: string;
    filters: SearchFilters;
    options: SearchOptions;
    createdAt: Date;
    lastUsed: Date;
}

export interface SearchHistory {
    query: string;
    timestamp: Date;
    resultCount: number;
}

export class SearchService {
    private searchIndex = new Map<string, SearchableFile>();
    private savedSearches: SavedSearch[] = [];
    private searchHistory: SearchHistory[] = [];
    private readonly MAX_HISTORY_SIZE = 50;
    private readonly MAX_SAVED_SEARCHES = 20;

    /**
     * Builds search index from medical files
     */
    buildIndex(files: MedicalFileMetadata[]): void {
        this.searchIndex.clear();

        files.forEach(file => {
            const searchableFile = this.createSearchableFile(file);
            this.searchIndex.set(file.id, searchableFile);
        });
    }

    /**
     * Updates a single file in the search index
     */
    updateFileInIndex(file: MedicalFileMetadata): void {
        const searchableFile = this.createSearchableFile(file);
        this.searchIndex.set(file.id, searchableFile);
    }

    /**
     * Removes a file from the search index
     */
    removeFileFromIndex(fileId: string): void {
        this.searchIndex.delete(fileId);
    }

    /**
     * Performs advanced search with filters and options
     */
    search(
        filters: SearchFilters = {},
        options: SearchOptions = {}
    ): SearchResponse {
        const startTime = Date.now();

        const {
            sortBy = 'relevance',
            sortOrder = 'desc',
            limit = 50,
            offset = 0,
            highlightMatches = true
        } = options;

        // Get all files from index
        const allFiles = Array.from(this.searchIndex.values());

        // Apply filters
        let filteredFiles = this.applyFilters(allFiles, filters);

        // Calculate relevance scores if there's a query
        if (filters.query) {
            filteredFiles = this.calculateRelevanceScores(filteredFiles, filters.query);

            // Add to search history
            this.addToSearchHistory(filters.query, filteredFiles.length);
        }

        // Sort results
        filteredFiles = this.sortResults(filteredFiles, sortBy, sortOrder);

        // Apply pagination
        const totalCount = filteredFiles.length;
        const paginatedFiles = filteredFiles.slice(offset, offset + limit);

        // Create search results
        const results: SearchResult[] = paginatedFiles.map(searchableFile => ({
            file: searchableFile.originalFile,
            relevanceScore: searchableFile.relevanceScore || 0,
            matchedFields: searchableFile.matchedFields || [],
            highlights: highlightMatches && filters.query ?
                this.generateHighlights(searchableFile, filters.query) : undefined
        }));

        const searchTime = Date.now() - startTime;

        return {
            results,
            totalCount,
            hasMore: offset + limit < totalCount,
            searchTime,
            suggestions: filters.query ? this.generateSuggestions(filters.query, allFiles) : undefined
        };
    }

    /**
     * Gets search suggestions based on query
     */
    getSuggestions(query: string, limit: number = 5): string[] {
        if (!query || query.length < 2) return [];

        const allFiles = Array.from(this.searchIndex.values());
        return this.generateSuggestions(query, allFiles, limit);
    }

    /**
     * Saves a search configuration
     */
    saveSearch(name: string, filters: SearchFilters, options: SearchOptions): SavedSearch {
        const savedSearch: SavedSearch = {
            id: `search-${Date.now()}`,
            name,
            filters,
            options,
            createdAt: new Date(),
            lastUsed: new Date()
        };

        this.savedSearches.unshift(savedSearch);

        // Limit saved searches
        if (this.savedSearches.length > this.MAX_SAVED_SEARCHES) {
            this.savedSearches = this.savedSearches.slice(0, this.MAX_SAVED_SEARCHES);
        }

        this.persistSavedSearches();
        return savedSearch;
    }

    /**
     * Gets all saved searches
     */
    getSavedSearches(): SavedSearch[] {
        return [...this.savedSearches];
    }

    /**
     * Executes a saved search
     */
    executeSavedSearch(searchId: string): SearchResponse | null {
        const savedSearch = this.savedSearches.find(s => s.id === searchId);
        if (!savedSearch) return null;

        // Update last used timestamp
        savedSearch.lastUsed = new Date();
        this.persistSavedSearches();

        return this.search(savedSearch.filters, savedSearch.options);
    }

    /**
     * Deletes a saved search
     */
    deleteSavedSearch(searchId: string): boolean {
        const index = this.savedSearches.findIndex(s => s.id === searchId);
        if (index === -1) return false;

        this.savedSearches.splice(index, 1);
        this.persistSavedSearches();
        return true;
    }

    /**
     * Gets search history
     */
    getSearchHistory(): SearchHistory[] {
        return [...this.searchHistory];
    }

    /**
     * Clears search history
     */
    clearSearchHistory(): void {
        this.searchHistory = [];
        this.persistSearchHistory();
    }

    /**
     * Gets search statistics
     */
    getSearchStats(): {
        indexSize: number;
        savedSearches: number;
        historySize: number;
        mostSearchedTerms: Array<{ term: string; count: number }>;
    } {
        // Calculate most searched terms
        const termCounts = new Map<string, number>();
        this.searchHistory.forEach(entry => {
            const count = termCounts.get(entry.query) || 0;
            termCounts.set(entry.query, count + 1);
        });

        const mostSearchedTerms = Array.from(termCounts.entries())
            .map(([term, count]) => ({ term, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);

        return {
            indexSize: this.searchIndex.size,
            savedSearches: this.savedSearches.length,
            historySize: this.searchHistory.length,
            mostSearchedTerms
        };
    }

    // Private methods

    private createSearchableFile(file: MedicalFileMetadata): SearchableFile {
        const searchableText = [
            file.name,
            file.description || '',
            file.category || '',
            file.recordType || '',
            ...(file.tags || [])
        ].join(' ').toLowerCase();

        return {
            originalFile: file,
            searchableText,
            tokens: this.tokenize(searchableText),
            relevanceScore: 0,
            matchedFields: []
        };
    }

    private tokenize(text: string): string[] {
        return text
            .toLowerCase()
            .replace(/[^\w\s]/g, ' ')
            .split(/\s+/)
            .filter(token => token.length > 1);
    }

    private applyFilters(files: SearchableFile[], filters: SearchFilters): SearchableFile[] {
        return files.filter(searchableFile => {
            const file = searchableFile.originalFile;

            // Text query filter
            if (filters.query) {
                const queryTokens = this.tokenize(filters.query);
                const hasMatch = queryTokens.some(token =>
                    searchableFile.tokens.some(fileToken =>
                        fileToken.includes(token) || token.includes(fileToken)
                    )
                );
                if (!hasMatch) return false;
            }

            // File type filter
            if (filters.fileTypes && filters.fileTypes.length > 0) {
                if (!filters.fileTypes.includes(file.type)) return false;
            }

            // Category filter
            if (filters.categories && filters.categories.length > 0) {
                if (!file.category || !filters.categories.includes(file.category)) return false;
            }

            // Date range filter
            if (filters.dateRange) {
                const fileDate = new Date(file.uploadDate);
                if (fileDate < filters.dateRange.start || fileDate > filters.dateRange.end) {
                    return false;
                }
            }

            // Size range filter
            if (filters.sizeRange) {
                if (file.size < filters.sizeRange.min || file.size > filters.sizeRange.max) {
                    return false;
                }
            }

            // Tags filter
            if (filters.tags && filters.tags.length > 0) {
                const fileTags = file.tags || [];
                const hasRequiredTag = filters.tags.some(tag => fileTags.includes(tag));
                if (!hasRequiredTag) return false;
            }

            // Encryption filter
            if (filters.isEncrypted !== undefined) {
                // Assuming encrypted files have encryption metadata
                const isEncrypted = !!(file as any).encryptionMetadata;
                if (isEncrypted !== filters.isEncrypted) return false;
            }

            // Shared filter
            if (filters.isShared !== undefined) {
                if (file.shared !== filters.isShared) return false;
            }

            // Record type filter
            if (filters.recordTypes && filters.recordTypes.length > 0) {
                if (!file.recordType || !filters.recordTypes.includes(file.recordType)) {
                    return false;
                }
            }

            return true;
        });
    }

    private calculateRelevanceScores(files: SearchableFile[], query: string): SearchableFile[] {
        const queryTokens = this.tokenize(query);

        return files.map(searchableFile => {
            let score = 0;
            const matchedFields: string[] = [];
            const file = searchableFile.originalFile;

            // Exact match in name (highest score)
            if (file.name.toLowerCase().includes(query.toLowerCase())) {
                score += 100;
                matchedFields.push('name');
            }

            // Token matches in different fields
            queryTokens.forEach(token => {
                // Name matches
                if (file.name.toLowerCase().includes(token)) {
                    score += 50;
                    if (!matchedFields.includes('name')) matchedFields.push('name');
                }

                // Description matches
                if (file.description?.toLowerCase().includes(token)) {
                    score += 20;
                    if (!matchedFields.includes('description')) matchedFields.push('description');
                }

                // Category matches
                if (file.category?.toLowerCase().includes(token)) {
                    score += 30;
                    if (!matchedFields.includes('category')) matchedFields.push('category');
                }

                // Tag matches
                if (file.tags?.some(tag => tag.toLowerCase().includes(token))) {
                    score += 25;
                    if (!matchedFields.includes('tags')) matchedFields.push('tags');
                }
            });

            // Boost score for recent files
            const daysSinceUpload = (Date.now() - new Date(file.uploadDate).getTime()) / (1000 * 60 * 60 * 24);
            if (daysSinceUpload < 7) score += 10;
            else if (daysSinceUpload < 30) score += 5;

            return {
                ...searchableFile,
                relevanceScore: score,
                matchedFields
            };
        });
    }

    private sortResults(files: SearchableFile[], sortBy: string, sortOrder: string): SearchableFile[] {
        return files.sort((a, b) => {
            let comparison = 0;

            switch (sortBy) {
                case 'name':
                    comparison = a.originalFile.name.localeCompare(b.originalFile.name);
                    break;
                case 'date':
                    comparison = new Date(a.originalFile.uploadDate).getTime() -
                        new Date(b.originalFile.uploadDate).getTime();
                    break;
                case 'size':
                    comparison = a.originalFile.size - b.originalFile.size;
                    break;
                case 'relevance':
                default:
                    comparison = (b.relevanceScore || 0) - (a.relevanceScore || 0);
                    break;
            }

            return sortOrder === 'desc' ? -comparison : comparison;
        });
    }

    private generateHighlights(searchableFile: SearchableFile, query: string): Record<string, string> {
        const highlights: Record<string, string> = {};
        const file = searchableFile.originalFile;
        const queryTokens = this.tokenize(query);

        // Highlight matches in different fields
        searchableFile.matchedFields.forEach(field => {
            let text = '';

            switch (field) {
                case 'name':
                    text = file.name;
                    break;
                case 'description':
                    text = file.description || '';
                    break;
                case 'category':
                    text = file.category || '';
                    break;
                case 'tags':
                    text = (file.tags || []).join(', ');
                    break;
            }

            if (text) {
                let highlightedText = text;
                queryTokens.forEach(token => {
                    const regex = new RegExp(`(${token})`, 'gi');
                    highlightedText = highlightedText.replace(regex, '<mark>$1</mark>');
                });
                highlights[field] = highlightedText;
            }
        });

        return highlights;
    }

    private generateSuggestions(query: string, files: SearchableFile[], limit: number = 5): string[] {
        const suggestions = new Set<string>();
        const queryLower = query.toLowerCase();

        files.forEach(searchableFile => {
            const file = searchableFile.originalFile;

            // Suggest file names that start with query
            if (file.name.toLowerCase().startsWith(queryLower)) {
                suggestions.add(file.name);
            }

            // Suggest categories
            if (file.category?.toLowerCase().startsWith(queryLower)) {
                suggestions.add(file.category);
            }

            // Suggest tags
            file.tags?.forEach(tag => {
                if (tag.toLowerCase().startsWith(queryLower)) {
                    suggestions.add(tag);
                }
            });
        });

        return Array.from(suggestions).slice(0, limit);
    }

    private addToSearchHistory(query: string, resultCount: number): void {
        // Remove existing entry for this query
        this.searchHistory = this.searchHistory.filter(entry => entry.query !== query);

        // Add new entry at the beginning
        this.searchHistory.unshift({
            query,
            timestamp: new Date(),
            resultCount
        });

        // Limit history size
        if (this.searchHistory.length > this.MAX_HISTORY_SIZE) {
            this.searchHistory = this.searchHistory.slice(0, this.MAX_HISTORY_SIZE);
        }

        this.persistSearchHistory();
    }

    private persistSavedSearches(): void {
        try {
            localStorage.setItem('meddata-saved-searches', JSON.stringify(this.savedSearches));
        } catch (error) {
            console.warn('Failed to persist saved searches:', error);
        }
    }

    private persistSearchHistory(): void {
        try {
            localStorage.setItem('meddata-search-history', JSON.stringify(this.searchHistory));
        } catch (error) {
            console.warn('Failed to persist search history:', error);
        }
    }

    private loadPersistedData(): void {
        try {
            // Load saved searches
            const savedSearchesData = localStorage.getItem('meddata-saved-searches');
            if (savedSearchesData) {
                this.savedSearches = JSON.parse(savedSearchesData).map((search: any) => ({
                    ...search,
                    createdAt: new Date(search.createdAt),
                    lastUsed: new Date(search.lastUsed)
                }));
            }

            // Load search history
            const historyData = localStorage.getItem('meddata-search-history');
            if (historyData) {
                this.searchHistory = JSON.parse(historyData).map((entry: any) => ({
                    ...entry,
                    timestamp: new Date(entry.timestamp)
                }));
            }
        } catch (error) {
            console.warn('Failed to load persisted search data:', error);
        }
    }

    constructor() {
        this.loadPersistedData();
    }
}

interface SearchableFile {
    originalFile: MedicalFileMetadata;
    searchableText: string;
    tokens: string[];
    relevanceScore: number;
    matchedFields: string[];
}

// Export singleton instance
export const searchService = new SearchService();