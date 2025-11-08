/**
 * Advanced Search Hook
 * Manages search state and integrates with the search service
 */

import { useState, useCallback, useEffect, useMemo } from 'react';
import {
    searchService,
    SearchFilters,
    SearchOptions,
    SearchResponse,
    SavedSearch,
    SearchHistory
} from '@/services/searchService';
import { MedicalFileMetadata, useMedicalFilesStore } from '@/stores/medicalFilesStore';

interface SearchState {
    loading: boolean;
    results: SearchResponse | null;
    error: string | null;
    suggestions: string[];
}

interface UseAdvancedSearchReturn {
    searchState: SearchState;
    search: (filters: SearchFilters, options?: SearchOptions) => Promise<void>;
    clearResults: () => void;
    getSuggestions: (query: string) => string[];
    saveSearch: (name: string, filters: SearchFilters, options: SearchOptions) => SavedSearch;
    getSavedSearches: () => SavedSearch[];
    executeSavedSearch: (searchId: string) => Promise<void>;
    deleteSavedSearch: (searchId: string) => boolean;
    getSearchHistory: () => SearchHistory[];
    clearSearchHistory: () => void;
    getSearchStats: () => {
        indexSize: number;
        savedSearches: number;
        historySize: number;
        mostSearchedTerms: Array<{ term: string; count: number }>;
    };
    rebuildIndex: () => void;
}

export function useAdvancedSearch(): UseAdvancedSearchReturn {
    const { files } = useMedicalFilesStore();

    const [searchState, setSearchState] = useState<SearchState>({
        loading: false,
        results: null,
        error: null,
        suggestions: []
    });

    // Rebuild search index when files change
    const rebuildIndex = useCallback(() => {
        searchService.buildIndex(files);
    }, [files]);

    // Initialize search index
    useEffect(() => {
        rebuildIndex();
    }, [rebuildIndex]);

    // Perform search
    const search = useCallback(async (
        filters: SearchFilters,
        options: SearchOptions = {}
    ): Promise<void> => {
        setSearchState(prev => ({
            ...prev,
            loading: true,
            error: null
        }));

        try {
            // Add small delay to show loading state
            await new Promise(resolve => setTimeout(resolve, 100));

            const results = searchService.search(filters, options);

            setSearchState(prev => ({
                ...prev,
                loading: false,
                results,
                suggestions: results.suggestions || []
            }));

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Search failed';

            setSearchState(prev => ({
                ...prev,
                loading: false,
                error: errorMessage,
                results: null
            }));
        }
    }, []);

    // Clear search results
    const clearResults = useCallback(() => {
        setSearchState({
            loading: false,
            results: null,
            error: null,
            suggestions: []
        });
    }, []);

    // Get search suggestions
    const getSuggestions = useCallback((query: string): string[] => {
        return searchService.getSuggestions(query);
    }, []);

    // Save search
    const saveSearch = useCallback((
        name: string,
        filters: SearchFilters,
        options: SearchOptions
    ): SavedSearch => {
        return searchService.saveSearch(name, filters, options);
    }, []);

    // Get saved searches
    const getSavedSearches = useCallback((): SavedSearch[] => {
        return searchService.getSavedSearches();
    }, []);

    // Execute saved search
    const executeSavedSearch = useCallback(async (searchId: string): Promise<void> => {
        setSearchState(prev => ({
            ...prev,
            loading: true,
            error: null
        }));

        try {
            const results = searchService.executeSavedSearch(searchId);

            if (results) {
                setSearchState(prev => ({
                    ...prev,
                    loading: false,
                    results,
                    suggestions: results.suggestions || []
                }));
            } else {
                throw new Error('Saved search not found');
            }

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to execute saved search';

            setSearchState(prev => ({
                ...prev,
                loading: false,
                error: errorMessage
            }));
        }
    }, []);

    // Delete saved search
    const deleteSavedSearch = useCallback((searchId: string): boolean => {
        return searchService.deleteSavedSearch(searchId);
    }, []);

    // Get search history
    const getSearchHistory = useCallback((): SearchHistory[] => {
        return searchService.getSearchHistory();
    }, []);

    // Clear search history
    const clearSearchHistory = useCallback(() => {
        searchService.clearSearchHistory();
    }, []);

    // Get search statistics
    const getSearchStats = useCallback(() => {
        return searchService.getSearchStats();
    }, []);

    return {
        searchState,
        search,
        clearResults,
        getSuggestions,
        saveSearch,
        getSavedSearches,
        executeSavedSearch,
        deleteSavedSearch,
        getSearchHistory,
        clearSearchHistory,
        getSearchStats,
        rebuildIndex
    };
}

/**
 * Hook for managing search filters state
 */
interface UseSearchFiltersReturn {
    filters: SearchFilters;
    options: SearchOptions;
    updateFilter: <K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) => void;
    updateOption: <K extends keyof SearchOptions>(key: K, value: SearchOptions[K]) => void;
    clearFilters: () => void;
    hasActiveFilters: boolean;
    getFilterSummary: () => string[];
}

export function useSearchFilters(
    initialFilters: SearchFilters = {},
    initialOptions: SearchOptions = {}
): UseSearchFiltersReturn {
    const [filters, setFilters] = useState<SearchFilters>(initialFilters);
    const [options, setOptions] = useState<SearchOptions>({
        sortBy: 'relevance',
        sortOrder: 'desc',
        limit: 50,
        ...initialOptions
    });

    const updateFilter = useCallback(<K extends keyof SearchFilters>(
        key: K,
        value: SearchFilters[K]
    ) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    }, []);

    const updateOption = useCallback(<K extends keyof SearchOptions>(
        key: K,
        value: SearchOptions[K]
    ) => {
        setOptions(prev => ({ ...prev, [key]: value }));
    }, []);

    const clearFilters = useCallback(() => {
        setFilters({});
        setOptions({
            sortBy: 'relevance',
            sortOrder: 'desc',
            limit: 50
        });
    }, []);

    const hasActiveFilters = useMemo(() => {
        return Object.keys(filters).some(key => {
            const value = filters[key as keyof SearchFilters];
            if (Array.isArray(value)) return value.length > 0;
            if (typeof value === 'object' && value !== null) return true;
            return value !== undefined && value !== '';
        });
    }, [filters]);

    const getFilterSummary = useCallback((): string[] => {
        const summary: string[] = [];

        if (filters.query) {
            summary.push(`Query: "${filters.query}"`);
        }

        if (filters.fileTypes && filters.fileTypes.length > 0) {
            summary.push(`File types: ${filters.fileTypes.length} selected`);
        }

        if (filters.categories && filters.categories.length > 0) {
            summary.push(`Categories: ${filters.categories.length} selected`);
        }

        if (filters.recordTypes && filters.recordTypes.length > 0) {
            summary.push(`Record types: ${filters.recordTypes.length} selected`);
        }

        if (filters.dateRange) {
            summary.push('Date range filter active');
        }

        if (filters.sizeRange) {
            summary.push('Size range filter active');
        }

        if (filters.tags && filters.tags.length > 0) {
            summary.push(`Tags: ${filters.tags.length} selected`);
        }

        if (filters.isEncrypted !== undefined) {
            summary.push(filters.isEncrypted ? 'Encrypted files only' : 'Unencrypted files only');
        }

        if (filters.isShared !== undefined) {
            summary.push(filters.isShared ? 'Shared files only' : 'Private files only');
        }

        return summary;
    }, [filters]);

    return {
        filters,
        options,
        updateFilter,
        updateOption,
        clearFilters,
        hasActiveFilters,
        getFilterSummary
    };
}

/**
 * Hook for search result highlighting
 */
interface UseSearchHighlightReturn {
    highlightText: (text: string, query: string) => string;
    stripHighlights: (highlightedText: string) => string;
}

export function useSearchHighlight(): UseSearchHighlightReturn {
    const highlightText = useCallback((text: string, query: string): string => {
        if (!query || !text) return text;

        const tokens = query.toLowerCase().split(/\s+/).filter(token => token.length > 1);
        let highlightedText = text;

        tokens.forEach(token => {
            const regex = new RegExp(`(${token})`, 'gi');
            highlightedText = highlightedText.replace(regex, '<mark>$1</mark>');
        });

        return highlightedText;
    }, []);

    const stripHighlights = useCallback((highlightedText: string): string => {
        return highlightedText.replace(/<\/?mark>/g, '');
    }, []);

    return {
        highlightText,
        stripHighlights
    };
}