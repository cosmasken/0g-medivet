/**
 * Provider Search Component
 * Allows providers to search for patients by wallet address, username, and other criteria
 */

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
  Search,
  User,
  Clock,
  Shield,
  ShieldCheck,
  ShieldX,
  History,
  UserCheck,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2,
  Eye,
  FileText,
  Calendar,
  Phone,
  Mail,
  Wallet
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  patientSearchService,
  PatientProfile,
  SearchFilters,
  SearchOptions,
  SearchHistory,
  RecentPatient
} from '@/services/patientSearchService';

interface ProviderSearchProps {
  onPatientSelect?: (patient: PatientProfile) => void;
  onRequestAccess?: (patient: PatientProfile) => void;
  className?: string;
}

interface SearchState {
  loading: boolean;
  error: string | null;
  patients: PatientProfile[];
  totalCount: number;
  hasMore: boolean;
  searchTime: number;
}

export default function ProviderSearch({
  onPatientSelect,
  onRequestAccess,
  className
}: ProviderSearchProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({});
  const [searchState, setSearchState] = useState<SearchState>({
    loading: false,
    error: null,
    patients: [],
    totalCount: 0,
    hasMore: false,
    searchTime: 0
  });

  const [activeTab, setActiveTab] = useState<'search' | 'recent' | 'history'>('search');
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([]);
  const [recentPatients, setRecentPatients] = useState<RecentPatient[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Load search history and recent patients
  useEffect(() => {
    setSearchHistory(patientSearchService.getSearchHistory());
    setRecentPatients(patientSearchService.getRecentPatients());
  }, []);

  // Update suggestions when query changes
  useEffect(() => {
    if (searchQuery.length >= 2) {
      const newSuggestions = patientSearchService.getSearchSuggestions(searchQuery);
      setSuggestions(newSuggestions);
      setShowSuggestions(newSuggestions.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchQuery]);

  // Perform search
  const handleSearch = useCallback(async (query?: string) => {
    const searchTerm = query || searchQuery;
    if (!searchTerm.trim()) return;

    setSearchState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const searchFilters: SearchFilters = {
        query: searchTerm,
        ...filters
      };

      const options: SearchOptions = {
        limit: 20,
        sortBy: 'name',
        sortOrder: 'asc'
      };

      const result = await patientSearchService.searchPatients(searchFilters, options);

      setSearchState({
        loading: false,
        error: null,
        patients: result.patients,
        totalCount: result.totalCount,
        hasMore: result.hasMore,
        searchTime: result.searchTime
      });

      // Update search history
      setSearchHistory(patientSearchService.getSearchHistory());
      setShowSuggestions(false);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Search failed';
      setSearchState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
    }
  }, [searchQuery, filters]);

  // Search by wallet address
  const handleWalletSearch = useCallback(async (walletAddress: string) => {
    setSearchState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const patient = await patientSearchService.searchByWalletAddress(walletAddress);

      setSearchState({
        loading: false,
        error: null,
        patients: patient ? [patient] : [],
        totalCount: patient ? 1 : 0,
        hasMore: false,
        searchTime: 0
      });

      if (!patient) {
        setSearchState(prev => ({
          ...prev,
          error: 'No patient found with this wallet address'
        }));
      }

      // Update search history
      setSearchHistory(patientSearchService.getSearchHistory());

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Wallet search failed';
      setSearchState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
    }
  }, []);

  // Handle suggestion selection
  const handleSuggestionSelect = useCallback((suggestion: string) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    handleSearch(suggestion);
  }, [handleSearch]);

  // Handle filter changes
  const updateFilter = useCallback(<K extends keyof SearchFilters>(
    key: K,
    value: SearchFilters[K]
  ) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  // Clear search
  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setFilters({});
    setSearchState({
      loading: false,
      error: null,
      patients: [],
      totalCount: 0,
      hasMore: false,
      searchTime: 0
    });
    setShowSuggestions(false);
  }, []);

  // Handle patient verification
  const handleVerifyPatient = useCallback(async (patient: PatientProfile) => {
    try {
      const verification = await patientSearchService.verifyPatient(patient.id);

      if (verification.isValid && verification.canRequestAccess) {
        onRequestAccess?.(patient);
      } else {
        // Show verification error
        setSearchState(prev => ({
          ...prev,
          error: verification.reason || 'Cannot request access to this patient'
        }));
      }
    } catch (error) {
      setSearchState(prev => ({
        ...prev,
        error: 'Failed to verify patient'
      }));
    }
  }, [onRequestAccess]);

  // Format date
  const formatDate = useCallback((dateString: string): string => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'Unknown';
    }
  }, []);

  // Get consent status badge
  const getConsentStatusBadge = useCallback((status: PatientProfile['consentStatus']) => {
    switch (status) {
      case 'granted':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Granted</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case 'denied':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" />Denied</Badge>;
      case 'expired':
        return <Badge className="bg-gray-100 text-gray-800"><AlertCircle className="h-3 w-3 mr-1" />Expired</Badge>;
      default:
        return <Badge variant="outline">No Consent</Badge>;
    }
  }, []);

  // Render patient card
  const renderPatientCard = useCallback((patient: PatientProfile) => {
    const displayName = patient.firstName && patient.lastName
      ? `${patient.firstName} ${patient.lastName}`
      : patient.username || 'Unknown Patient';

    const initials = patient.firstName && patient.lastName
      ? `${patient.firstName[0]}${patient.lastName[0]}`
      : patient.username?.[0]?.toUpperCase() || 'U';

    return (
      <Card key={patient.id} className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3 flex-1">
              <Avatar className="h-12 w-12">
                <AvatarImage src={patient.profilePicture} alt={displayName} />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="font-semibold truncate">{displayName}</h3>
                  {patient.isVerified ? (
                    <ShieldCheck className="h-4 w-4 text-green-600" />
                  ) : (
                    <ShieldX className="h-4 w-4 text-red-600" />
                  )}
                </div>

                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <Wallet className="h-3 w-3" />
                    <span className="font-mono text-xs truncate">
                      {patient.walletAddress}
                    </span>
                  </div>

                  {patient.username && (
                    <div className="flex items-center space-x-2">
                      <User className="h-3 w-3" />
                      <span>@{patient.username}</span>
                    </div>
                  )}

                  {patient.email && (
                    <div className="flex items-center space-x-2">
                      <Mail className="h-3 w-3" />
                      <span className="truncate">{patient.email}</span>
                    </div>
                  )}

                  {patient.phone && (
                    <div className="flex items-center space-x-2">
                      <Phone className="h-3 w-3" />
                      <span>{patient.phone}</span>
                    </div>
                  )}

                  {patient.dateOfBirth && (
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-3 w-3" />
                      <span>DOB: {formatDate(patient.dateOfBirth)}</span>
                    </div>
                  )}

                  {patient.lastActive && (
                    <div className="flex items-center space-x-2">
                      <Clock className="h-3 w-3" />
                      <span>Last active: {formatDate(patient.lastActive)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end space-y-2">
              {getConsentStatusBadge(patient.consentStatus)}

              {patient.accessLevel && (
                <Badge variant="secondary" className="text-xs">
                  {patient.accessLevel} access
                </Badge>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between mt-4 pt-3 border-t">
            <div className="flex items-center space-x-2">
              {!patient.isVerified && (
                <span className="text-xs text-red-600 flex items-center">
                  <AlertCircle className="h-3 w-3 mr-1" />
                  Unverified
                </span>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onPatientSelect?.(patient)}
              >
                <Eye className="h-4 w-4 mr-1" />
                View
              </Button>

              {patient.consentStatus === 'none' && patient.isVerified && (
                <Button
                  size="sm"
                  onClick={() => handleVerifyPatient(patient)}
                >
                  <UserCheck className="h-4 w-4 mr-1" />
                  Request Access
                </Button>
              )}

              {patient.consentStatus === 'granted' && (
                <Button
                  size="sm"
                  onClick={() => onPatientSelect?.(patient)}
                >
                  <FileText className="h-4 w-4 mr-1" />
                  View Records
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }, [onPatientSelect, handleVerifyPatient, formatDate, getConsentStatusBadge]);

  return (
    <div className={cn("space-y-6", className)}>
      {/* Search Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="h-5 w-5" />
            <span>Patient Search</span>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <div className="flex space-x-2">
              <div className="relative flex-1">
                <Input
                  placeholder="Search by wallet address, username, name, or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="pr-10"
                />
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>

              <Button onClick={() => handleSearch()} disabled={searchState.loading}>
                {searchState.loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Search'
                )}
              </Button>

              {(searchQuery || Object.keys(filters).length > 0) && (
                <Button variant="ghost" onClick={clearSearch}>
                  Clear
                </Button>
              )}
            </div>

            {/* Search Suggestions */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-white border rounded-md shadow-lg">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    className="w-full px-3 py-2 text-left hover:bg-gray-50 first:rounded-t-md last:rounded-b-md"
                    onClick={() => handleSuggestionSelect(suggestion)}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center space-x-4">
            <Select
              value={filters.consentStatus || ''}
              onValueChange={(value) => updateFilter('consentStatus', value || undefined)}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Consent Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Statuses</SelectItem>
                <SelectItem value="none">No Consent</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="granted">Granted</SelectItem>
                <SelectItem value="denied">Denied</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.accessLevel || ''}
              onValueChange={(value) => updateFilter('accessLevel', value || undefined)}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Access Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Levels</SelectItem>
                <SelectItem value="view">View Only</SelectItem>
                <SelectItem value="edit">Edit Access</SelectItem>
                <SelectItem value="full">Full Access</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.isVerified?.toString() || ''}
              onValueChange={(value) => updateFilter('isVerified', value ? value === 'true' : undefined)}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Verification" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Patients</SelectItem>
                <SelectItem value="true">Verified Only</SelectItem>
                <SelectItem value="false">Unverified Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const walletAddress = prompt('Enter wallet address:');
                if (walletAddress) {
                  handleWalletSearch(walletAddress);
                }
              }}
            >
              <Wallet className="h-4 w-4 mr-1" />
              Search by Wallet
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <button
          className={cn(
            "flex-1 px-3 py-2 text-sm rounded-md transition-colors",
            activeTab === 'search' ? "bg-white shadow-sm" : "hover:bg-gray-200"
          )}
          onClick={() => setActiveTab('search')}
        >
          <Search className="h-4 w-4 mr-1 inline" />
          Search Results ({searchState.totalCount})
        </button>
        <button
          className={cn(
            "flex-1 px-3 py-2 text-sm rounded-md transition-colors",
            activeTab === 'recent' ? "bg-white shadow-sm" : "hover:bg-gray-200"
          )}
          onClick={() => setActiveTab('recent')}
        >
          <Clock className="h-4 w-4 mr-1 inline" />
          Recent ({recentPatients.length})
        </button>
        <button
          className={cn(
            "flex-1 px-3 py-2 text-sm rounded-md transition-colors",
            activeTab === 'history' ? "bg-white shadow-sm" : "hover:bg-gray-200"
          )}
          onClick={() => setActiveTab('history')}
        >
          <History className="h-4 w-4 mr-1 inline" />
          History ({searchHistory.length})
        </button>
      </div>

      {/* Content */}
      <div className="space-y-4">
        {/* Error Display */}
        {searchState.error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 text-red-800">
                <AlertCircle className="h-4 w-4" />
                <span>{searchState.error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search Results */}
        {activeTab === 'search' && (
          <div className="space-y-4">
            {searchState.loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span>Searching patients...</span>
              </div>
            ) : searchState.patients.length > 0 ? (
              <>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    Found {searchState.totalCount} patients in {searchState.searchTime}ms
                  </p>
                </div>

                <div className="space-y-3">
                  {searchState.patients.map(renderPatientCard)}
                </div>

                {searchState.hasMore && (
                  <div className="text-center">
                    <Button variant="outline" onClick={() => handleSearch()}>
                      Load More
                    </Button>
                  </div>
                )}
              </>
            ) : searchQuery ? (
              <div className="text-center py-8 text-gray-500">
                <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No patients found</p>
                <p className="text-sm">Try adjusting your search terms or filters</p>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">Start searching for patients</p>
                <p className="text-sm">Enter a wallet address, username, or name to begin</p>
              </div>
            )}
          </div>
        )}

        {/* Recent Patients */}
        {activeTab === 'recent' && (
          <div className="space-y-4">
            {recentPatients.length > 0 ? (
              <div className="space-y-3">
                {recentPatients.map(({ patient, lastAccessed, accessCount, lastAccessType }) => (
                  <Card key={patient.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={patient.profilePicture} />
                            <AvatarFallback>
                              {patient.firstName?.[0]}{patient.lastName?.[0]}
                            </AvatarFallback>
                          </Avatar>

                          <div>
                            <h4 className="font-medium">
                              {patient.firstName && patient.lastName
                                ? `${patient.firstName} ${patient.lastName}`
                                : patient.username || 'Unknown Patient'
                              }
                            </h4>
                            <p className="text-sm text-gray-600">
                              Last accessed: {formatDate(lastAccessed.toISOString())} • {accessCount} times
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          {getConsentStatusBadge(patient.consentStatus)}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onPatientSelect?.(patient)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No recent patients</p>
                <p className="text-sm">Patients you search for will appear here</p>
              </div>
            )}
          </div>
        )}

        {/* Search History */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            {searchHistory.length > 0 ? (
              <div className="space-y-2">
                {searchHistory.map((entry, index) => (
                  <Card key={index} className="hover:shadow-sm transition-shadow cursor-pointer"
                    onClick={() => handleSuggestionSelect(entry.query)}>
                    <CardContent className="p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <History className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="font-medium">{entry.query}</p>
                            <p className="text-sm text-gray-600">
                              {entry.resultCount} results • {formatDate(entry.timestamp.toISOString())}
                            </p>
                          </div>
                        </div>

                        <Button variant="ghost" size="sm">
                          <Search className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                <div className="text-center pt-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      patientSearchService.clearSearchHistory();
                      setSearchHistory([]);
                    }}
                  >
                    Clear History
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No search history</p>
                <p className="text-sm">Your search history will appear here</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}