/**
 * Patient Search Service for Providers
 * Handles searching for patients by wallet address, username, and other identifiers
 */

export interface PatientProfile {
    id: string;
    walletAddress: string;
    username?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    dateOfBirth?: string;
    profilePicture?: string;
    isVerified: boolean;
    lastActive?: string;
    consentStatus?: 'none' | 'pending' | 'granted' | 'denied' | 'expired';
    accessLevel?: 'view' | 'edit' | 'full';
    consentExpiry?: string;
}

export interface SearchFilters {
    query?: string;
    consentStatus?: PatientProfile['consentStatus'];
    accessLevel?: PatientProfile['accessLevel'];
    isVerified?: boolean;
    lastActiveWithin?: number; // days
}

export interface SearchOptions {
    limit?: number;
    offset?: number;
    sortBy?: 'name' | 'lastActive' | 'consentStatus';
    sortOrder?: 'asc' | 'desc';
}

export interface SearchResult {
    patients: PatientProfile[];
    totalCount: number;
    hasMore: boolean;
    searchTime: number;
}

export interface SearchHistory {
    query: string;
    timestamp: Date;
    resultCount: number;
    patientId?: string;
}

export interface RecentPatient {
    patient: PatientProfile;
    lastAccessed: Date;
    accessCount: number;
    lastAccessType: 'search' | 'consent_request' | 'record_access';
}

export class PatientSearchService {
    private searchHistory: SearchHistory[] = [];
    private recentPatients: RecentPatient[] = [];
    private readonly MAX_HISTORY_SIZE = 100;
    private readonly MAX_RECENT_PATIENTS = 50;

    /**
     * Search for patients by various criteria
     */
    async searchPatients(
        filters: SearchFilters = {},
        options: SearchOptions = {}
    ): Promise<SearchResult> {
        const startTime = Date.now();

        const {
            limit = 20,
            offset = 0,
            sortBy = 'name',
            sortOrder = 'asc'
        } = options;

        try {
            // In a real implementation, this would call an API
            // For now, we'll simulate with mock data
            const mockPatients = await this.getMockPatients();

            // Apply filters
            let filteredPatients = this.applyFilters(mockPatients, filters);

            // Sort results
            filteredPatients = this.sortPatients(filteredPatients, sortBy, sortOrder);

            // Apply pagination
            const totalCount = filteredPatients.length;
            const paginatedPatients = filteredPatients.slice(offset, offset + limit);

            // Add to search history
            if (filters.query) {
                this.addToSearchHistory(filters.query, totalCount);
            }

            const searchTime = Date.now() - startTime;

            return {
                patients: paginatedPatients,
                totalCount,
                hasMore: offset + limit < totalCount,
                searchTime
            };

        } catch (error) {
            console.error('Patient search failed:', error);
            throw new Error('Failed to search patients');
        }
    }

    /**
     * Search for a specific patient by wallet address
     */
    async searchByWalletAddress(walletAddress: string): Promise<PatientProfile | null> {
        try {
            // Validate wallet address format
            if (!this.isValidWalletAddress(walletAddress)) {
                throw new Error('Invalid wallet address format');
            }

            // In a real implementation, this would call an API
            const mockPatients = await this.getMockPatients();
            const patient = mockPatients.find(p =>
                p.walletAddress.toLowerCase() === walletAddress.toLowerCase()
            );

            if (patient) {
                this.addToRecentPatients(patient, 'search');
                this.addToSearchHistory(walletAddress, 1, patient.id);
            }

            return patient || null;

        } catch (error) {
            console.error('Wallet address search failed:', error);
            throw error;
        }
    }

    /**
     * Search for patients by username
     */
    async searchByUsername(username: string): Promise<PatientProfile[]> {
        try {
            if (!username || username.length < 2) {
                throw new Error('Username must be at least 2 characters');
            }

            const mockPatients = await this.getMockPatients();
            const patients = mockPatients.filter(p =>
                p.username?.toLowerCase().includes(username.toLowerCase())
            );

            if (patients.length > 0) {
                this.addToSearchHistory(username, patients.length);
            }

            return patients;

        } catch (error) {
            console.error('Username search failed:', error);
            throw error;
        }
    }

    /**
     * Get patient profile by ID
     */
    async getPatientProfile(patientId: string): Promise<PatientProfile | null> {
        try {
            const mockPatients = await this.getMockPatients();
            const patient = mockPatients.find(p => p.id === patientId);

            if (patient) {
                this.addToRecentPatients(patient, 'record_access');
            }

            return patient || null;

        } catch (error) {
            console.error('Failed to get patient profile:', error);
            throw error;
        }
    }

    /**
     * Verify patient identity and status
     */
    async verifyPatient(patientId: string): Promise<{
        isValid: boolean;
        isVerified: boolean;
        canRequestAccess: boolean;
        reason?: string;
    }> {
        try {
            const patient = await this.getPatientProfile(patientId);

            if (!patient) {
                return {
                    isValid: false,
                    isVerified: false,
                    canRequestAccess: false,
                    reason: 'Patient not found'
                };
            }

            const canRequestAccess = patient.isVerified &&
                patient.consentStatus !== 'denied' &&
                patient.consentStatus !== 'pending';

            return {
                isValid: true,
                isVerified: patient.isVerified,
                canRequestAccess,
                reason: !canRequestAccess ? this.getAccessDenialReason(patient) : undefined
            };

        } catch (error) {
            console.error('Patient verification failed:', error);
            return {
                isValid: false,
                isVerified: false,
                canRequestAccess: false,
                reason: 'Verification failed'
            };
        }
    }

    /**
     * Get search history
     */
    getSearchHistory(): SearchHistory[] {
        return [...this.searchHistory].reverse(); // Most recent first
    }

    /**
     * Get recent patients
     */
    getRecentPatients(): RecentPatient[] {
        return [...this.recentPatients].sort((a, b) =>
            b.lastAccessed.getTime() - a.lastAccessed.getTime()
        );
    }

    /**
     * Clear search history
     */
    clearSearchHistory(): void {
        this.searchHistory = [];
        this.persistSearchHistory();
    }

    /**
     * Clear recent patients
     */
    clearRecentPatients(): void {
        this.recentPatients = [];
        this.persistRecentPatients();
    }

    /**
     * Get search suggestions based on history
     */
    getSearchSuggestions(query: string, limit: number = 5): string[] {
        if (!query || query.length < 2) return [];

        const suggestions = new Set<string>();
        const queryLower = query.toLowerCase();

        // Add suggestions from search history
        this.searchHistory.forEach(entry => {
            if (entry.query.toLowerCase().includes(queryLower)) {
                suggestions.add(entry.query);
            }
        });

        // Add suggestions from recent patients
        this.recentPatients.forEach(({ patient }) => {
            if (patient.username?.toLowerCase().includes(queryLower)) {
                suggestions.add(patient.username);
            }
            if (patient.walletAddress.toLowerCase().includes(queryLower)) {
                suggestions.add(patient.walletAddress);
            }
        });

        return Array.from(suggestions).slice(0, limit);
    }

    // Private methods

    private async getMockPatients(): Promise<PatientProfile[]> {
        // Mock data - in real implementation, this would fetch from API
        return [
            {
                id: 'patient-1',
                walletAddress: '0x1234567890123456789012345678901234567890',
                username: 'john_doe',
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@email.com',
                phone: '+1-555-0123',
                dateOfBirth: '1985-06-15',
                isVerified: true,
                lastActive: '2024-01-15T10:30:00Z',
                consentStatus: 'none'
            },
            {
                id: 'patient-2',
                walletAddress: '0x2345678901234567890123456789012345678901',
                username: 'jane_smith',
                firstName: 'Jane',
                lastName: 'Smith',
                email: 'jane.smith@email.com',
                phone: '+1-555-0124',
                dateOfBirth: '1990-03-22',
                isVerified: true,
                lastActive: '2024-01-14T15:45:00Z',
                consentStatus: 'granted',
                accessLevel: 'view',
                consentExpiry: '2024-07-15T00:00:00Z'
            },
            {
                id: 'patient-3',
                walletAddress: '0x3456789012345678901234567890123456789012',
                username: 'bob_wilson',
                firstName: 'Bob',
                lastName: 'Wilson',
                email: 'bob.wilson@email.com',
                isVerified: false,
                lastActive: '2024-01-10T09:15:00Z',
                consentStatus: 'none'
            },
            {
                id: 'patient-4',
                walletAddress: '0x4567890123456789012345678901234567890123',
                username: 'alice_brown',
                firstName: 'Alice',
                lastName: 'Brown',
                email: 'alice.brown@email.com',
                phone: '+1-555-0126',
                dateOfBirth: '1978-11-08',
                isVerified: true,
                lastActive: '2024-01-13T14:20:00Z',
                consentStatus: 'pending'
            },
            {
                id: 'patient-5',
                walletAddress: '0x5678901234567890123456789012345678901234',
                username: 'charlie_davis',
                firstName: 'Charlie',
                lastName: 'Davis',
                email: 'charlie.davis@email.com',
                isVerified: true,
                lastActive: '2024-01-12T11:00:00Z',
                consentStatus: 'expired',
                accessLevel: 'edit',
                consentExpiry: '2024-01-01T00:00:00Z'
            }
        ];
    }

    private applyFilters(patients: PatientProfile[], filters: SearchFilters): PatientProfile[] {
        return patients.filter(patient => {
            // Text query filter
            if (filters.query) {
                const query = filters.query.toLowerCase();
                const matchesQuery =
                    patient.walletAddress.toLowerCase().includes(query) ||
                    patient.username?.toLowerCase().includes(query) ||
                    patient.firstName?.toLowerCase().includes(query) ||
                    patient.lastName?.toLowerCase().includes(query) ||
                    patient.email?.toLowerCase().includes(query);

                if (!matchesQuery) return false;
            }

            // Consent status filter
            if (filters.consentStatus && patient.consentStatus !== filters.consentStatus) {
                return false;
            }

            // Access level filter
            if (filters.accessLevel && patient.accessLevel !== filters.accessLevel) {
                return false;
            }

            // Verification filter
            if (filters.isVerified !== undefined && patient.isVerified !== filters.isVerified) {
                return false;
            }

            // Last active filter
            if (filters.lastActiveWithin && patient.lastActive) {
                const lastActive = new Date(patient.lastActive);
                const cutoff = new Date();
                cutoff.setDate(cutoff.getDate() - filters.lastActiveWithin);

                if (lastActive < cutoff) return false;
            }

            return true;
        });
    }

    private sortPatients(
        patients: PatientProfile[],
        sortBy: string,
        sortOrder: string
    ): PatientProfile[] {
        return patients.sort((a, b) => {
            let comparison = 0;

            switch (sortBy) {
                case 'name':
                    const nameA = `${a.firstName || ''} ${a.lastName || ''}`.trim() || a.username || a.walletAddress;
                    const nameB = `${b.firstName || ''} ${b.lastName || ''}`.trim() || b.username || b.walletAddress;
                    comparison = nameA.localeCompare(nameB);
                    break;
                case 'lastActive':
                    const dateA = a.lastActive ? new Date(a.lastActive).getTime() : 0;
                    const dateB = b.lastActive ? new Date(b.lastActive).getTime() : 0;
                    comparison = dateA - dateB;
                    break;
                case 'consentStatus':
                    const statusOrder = { 'granted': 0, 'pending': 1, 'expired': 2, 'denied': 3, 'none': 4 };
                    const statusA = statusOrder[a.consentStatus || 'none'];
                    const statusB = statusOrder[b.consentStatus || 'none'];
                    comparison = statusA - statusB;
                    break;
            }

            return sortOrder === 'desc' ? -comparison : comparison;
        });
    }

    private addToSearchHistory(query: string, resultCount: number, patientId?: string): void {
        // Remove existing entry for this query
        this.searchHistory = this.searchHistory.filter(entry => entry.query !== query);

        // Add new entry
        this.searchHistory.push({
            query,
            timestamp: new Date(),
            resultCount,
            patientId
        });

        // Limit history size
        if (this.searchHistory.length > this.MAX_HISTORY_SIZE) {
            this.searchHistory = this.searchHistory.slice(-this.MAX_HISTORY_SIZE);
        }

        this.persistSearchHistory();
    }

    private addToRecentPatients(
        patient: PatientProfile,
        accessType: RecentPatient['lastAccessType']
    ): void {
        // Find existing entry
        const existingIndex = this.recentPatients.findIndex(rp => rp.patient.id === patient.id);

        if (existingIndex >= 0) {
            // Update existing entry
            this.recentPatients[existingIndex] = {
                patient,
                lastAccessed: new Date(),
                accessCount: this.recentPatients[existingIndex].accessCount + 1,
                lastAccessType: accessType
            };
        } else {
            // Add new entry
            this.recentPatients.push({
                patient,
                lastAccessed: new Date(),
                accessCount: 1,
                lastAccessType: accessType
            });
        }

        // Limit recent patients size
        if (this.recentPatients.length > this.MAX_RECENT_PATIENTS) {
            this.recentPatients = this.recentPatients
                .sort((a, b) => b.lastAccessed.getTime() - a.lastAccessed.getTime())
                .slice(0, this.MAX_RECENT_PATIENTS);
        }

        this.persistRecentPatients();
    }

    private isValidWalletAddress(address: string): boolean {
        return /^0x[a-fA-F0-9]{40}$/.test(address);
    }

    private getAccessDenialReason(patient: PatientProfile): string {
        if (!patient.isVerified) {
            return 'Patient account is not verified';
        }
        if (patient.consentStatus === 'denied') {
            return 'Patient has denied access requests';
        }
        if (patient.consentStatus === 'pending') {
            return 'Access request is already pending';
        }
        return 'Access not available';
    }

    private persistSearchHistory(): void {
        try {
            localStorage.setItem('provider-search-history', JSON.stringify(this.searchHistory));
        } catch (error) {
            console.warn('Failed to persist search history:', error);
        }
    }

    private persistRecentPatients(): void {
        try {
            localStorage.setItem('provider-recent-patients', JSON.stringify(this.recentPatients));
        } catch (error) {
            console.warn('Failed to persist recent patients:', error);
        }
    }

    private loadPersistedData(): void {
        try {
            // Load search history
            const historyData = localStorage.getItem('provider-search-history');
            if (historyData) {
                this.searchHistory = JSON.parse(historyData).map((entry: any) => ({
                    ...entry,
                    timestamp: new Date(entry.timestamp)
                }));
            }

            // Load recent patients
            const recentData = localStorage.getItem('provider-recent-patients');
            if (recentData) {
                this.recentPatients = JSON.parse(recentData).map((entry: any) => ({
                    ...entry,
                    lastAccessed: new Date(entry.lastAccessed)
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

// Export singleton instance
export const patientSearchService = new PatientSearchService();