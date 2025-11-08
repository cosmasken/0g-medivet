/**
 * Provider Search Hook
 * Manages patient search state and functionality for providers
 */

import { useState, useCallback, useEffect } from 'react';
import {
    patientSearchService,
    PatientProfile,
    SearchFilters,
    SearchOptions,
    SearchResult,
    SearchHistory,
    RecentPatient
} from '@/services/patientSearchService';

interface SearchState {
    loading: boolean;
    error: string | null;
    results: SearchResult | null;
    searchHistory: SearchHistory[];
    recentPatients: RecentPatient[];
}

interface UseProviderSearchReturn {
    searchState: SearchState;
    searchPatients: (filters: SearchFilters, options?: SearchOptions) => Promise<void>;
    searchByWalletAddress: (walletAddress: string) => Promise<PatientProfile | null>;
    searchByUsername: (username: string) => Promise<PatientProfile[]>;
    getPatientProfile: (patientId: string) => Promise<PatientProfile | null>;
    verifyPatient: (patientId: string) => Promise<{
        isValid: boolean;
        isVerified: boolean;
        canRequestAccess: boolean;
        reason?: string;
    }>;
    getSuggestions: (query: string, limit?: number) => string[];
    clearSearchHistory: () => void;
    clearRecentPatients: () => void;
    refreshHistory: () => void;
    clearError: () => void;
}

export function useProviderSearch(): UseProviderSearchReturn {
    const [searchState, setSearchState] = useState<SearchState>({
        loading: false,
        error: null,
        results: null,
        searchHistory: [],
        recentPatients: []
    });

    // Load initial data
    useEffect(() => {
        refreshHistory();
    }, []);

    // Search for patients
    const searchPatients = useCallback(async (
        filters: SearchFilters,
        options: SearchOptions = {}
    ): Promise<void> => {
        setSearchState(prev => ({
            ...prev,
            loading: true,
            error: null
        }));

        try {
            const results = await patientSearchService.searchPatients(filters, options);

            setSearchState(prev => ({
                ...prev,
                loading: false,
                results,
                searchHistory: patientSearchService.getSearchHistory(),
                recentPatients: patientSearchService.getRecentPatients()
            }));

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Search failed';

            setSearchState(prev => ({
                ...prev,
                loading: false,
                error: errorMessage
            }));
        }
    }, []);

    // Search by wallet address
    const searchByWalletAddress = useCallback(async (
        walletAddress: string
    ): Promise<PatientProfile | null> => {
        setSearchState(prev => ({
            ...prev,
            loading: true,
            error: null
        }));

        try {
            const patient = await patientSearchService.searchByWalletAddress(walletAddress);

            setSearchState(prev => ({
                ...prev,
                loading: false,
                results: {
                    patients: patient ? [patient] : [],
                    totalCount: patient ? 1 : 0,
                    hasMore: false,
                    searchTime: 0
                },
                searchHistory: patientSearchService.getSearchHistory(),
                recentPatients: patientSearchService.getRecentPatients()
            }));

            if (!patient) {
                setSearchState(prev => ({
                    ...prev,
                    error: 'No patient found with this wallet address'
                }));
            }

            return patient;

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Wallet search failed';

            setSearchState(prev => ({
                ...prev,
                loading: false,
                error: errorMessage
            }));

            return null;
        }
    }, []);

    // Search by username
    const searchByUsername = useCallback(async (
        username: string
    ): Promise<PatientProfile[]> => {
        setSearchState(prev => ({
            ...prev,
            loading: true,
            error: null
        }));

        try {
            const patients = await patientSearchService.searchByUsername(username);

            setSearchState(prev => ({
                ...prev,
                loading: false,
                results: {
                    patients,
                    totalCount: patients.length,
                    hasMore: false,
                    searchTime: 0
                },
                searchHistory: patientSearchService.getSearchHistory()
            }));

            if (patients.length === 0) {
                setSearchState(prev => ({
                    ...prev,
                    error: 'No patients found with this username'
                }));
            }

            return patients;

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Username search failed';

            setSearchState(prev => ({
                ...prev,
                loading: false,
                error: errorMessage
            }));

            return [];
        }
    }, []);

    // Get patient profile
    const getPatientProfile = useCallback(async (
        patientId: string
    ): Promise<PatientProfile | null> => {
        try {
            const patient = await patientSearchService.getPatientProfile(patientId);

            if (patient) {
                setSearchState(prev => ({
                    ...prev,
                    recentPatients: patientSearchService.getRecentPatients()
                }));
            }

            return patient;

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to get patient profile';

            setSearchState(prev => ({
                ...prev,
                error: errorMessage
            }));

            return null;
        }
    }, []);

    // Verify patient
    const verifyPatient = useCallback(async (patientId: string) => {
        try {
            return await patientSearchService.verifyPatient(patientId);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Patient verification failed';

            setSearchState(prev => ({
                ...prev,
                error: errorMessage
            }));

            return {
                isValid: false,
                isVerified: false,
                canRequestAccess: false,
                reason: errorMessage
            };
        }
    }, []);

    // Get search suggestions
    const getSuggestions = useCallback((query: string, limit?: number): string[] => {
        return patientSearchService.getSearchSuggestions(query, limit);
    }, []);

    // Clear search history
    const clearSearchHistory = useCallback(() => {
        patientSearchService.clearSearchHistory();
        setSearchState(prev => ({
            ...prev,
            searchHistory: []
        }));
    }, []);

    // Clear recent patients
    const clearRecentPatients = useCallback(() => {
        patientSearchService.clearRecentPatients();
        setSearchState(prev => ({
            ...prev,
            recentPatients: []
        }));
    }, []);

    // Refresh history and recent patients
    const refreshHistory = useCallback(() => {
        setSearchState(prev => ({
            ...prev,
            searchHistory: patientSearchService.getSearchHistory(),
            recentPatients: patientSearchService.getRecentPatients()
        }));
    }, []);

    // Clear error
    const clearError = useCallback(() => {
        setSearchState(prev => ({
            ...prev,
            error: null
        }));
    }, []);

    return {
        searchState,
        searchPatients,
        searchByWalletAddress,
        searchByUsername,
        getPatientProfile,
        verifyPatient,
        getSuggestions,
        clearSearchHistory,
        clearRecentPatients,
        refreshHistory,
        clearError
    };
}

/**
 * Hook for managing search filters and options
 */
interface UseSearchFiltersReturn {
    filters: SearchFilters;
    options: SearchOptions;
    updateFilter: <K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) => void;
    updateOption: <K extends keyof SearchOptions>(key: K, value: SearchOptions[K]) => void;
    clearFilters: () => void;
    hasActiveFilters: boolean;
}

export function useSearchFilters(
    initialFilters: SearchFilters = {},
    initialOptions: SearchOptions = {}
): UseSearchFiltersReturn {
    const [filters, setFilters] = useState<SearchFilters>(initialFilters);
    const [options, setOptions] = useState<SearchOptions>({
        limit: 20,
        sortBy: 'name',
        sortOrder: 'asc',
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
            limit: 20,
            sortBy: 'name',
            sortOrder: 'asc'
        });
    }, []);

    const hasActiveFilters = Object.keys(filters).some(key => {
        const value = filters[key as keyof SearchFilters];
        return value !== undefined && value !== '';
    });

    return {
        filters,
        options,
        updateFilter,
        updateOption,
        clearFilters,
        hasActiveFilters
    };
}

/**
 * Hook for patient verification and access requests
 */
interface UsePatientVerificationReturn {
    verifyAndRequestAccess: (patient: PatientProfile) => Promise<{
        success: boolean;
        canRequest: boolean;
        message: string;
    }>;
    checkAccessPermissions: (patient: PatientProfile) => {
        canView: boolean;
        canEdit: boolean;
        hasActiveConsent: boolean;
        consentExpiry?: Date;
    };
}

export function usePatientVerification(): UsePatientVerificationReturn {
    const verifyAndRequestAccess = useCallback(async (patient: PatientProfile) => {
        try {
            const verification = await patientSearchService.verifyPatient(patient.id);

            if (!verification.isValid) {
                return {
                    success: false,
                    canRequest: false,
                    message: verification.reason || 'Patient verification failed'
                };
            }

            if (!verification.isVerified) {
                return {
                    success: false,
                    canRequest: false,
                    message: 'Patient account is not verified'
                };
            }

            if (!verification.canRequestAccess) {
                return {
                    success: false,
                    canRequest: false,
                    message: verification.reason || 'Cannot request access to this patient'
                };
            }

            return {
                success: true,
                canRequest: true,
                message: 'Patient verified and ready for access request'
            };

        } catch (error) {
            return {
                success: false,
                canRequest: false,
                message: error instanceof Error ? error.message : 'Verification failed'
            };
        }
    }, []);

    const checkAccessPermissions = useCallback((patient: PatientProfile) => {
        const hasActiveConsent = patient.consentStatus === 'granted' &&
            (!patient.consentExpiry || new Date(patient.consentExpiry) > new Date());

        const canView = hasActiveConsent && ['view', 'edit', 'full'].includes(patient.accessLevel || '');
        const canEdit = hasActiveConsent && ['edit', 'full'].includes(patient.accessLevel || '');

        return {
            canView,
            canEdit,
            hasActiveConsent,
            consentExpiry: patient.consentExpiry ? new Date(patient.consentExpiry) : undefined
        };
    }, []);

    return {
        verifyAndRequestAccess,
        checkAccessPermissions
    };
}