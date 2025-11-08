/**
 * Advanced Search Component
 * Provides comprehensive search and filtering capabilities for medical files
 */

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
    Search,
    Filter,
    X,
    ChevronDown,
    ChevronUp,
    Calendar as CalendarIcon,
    Save,
    History,
    Star,
    Trash2,
    SlidersHorizontal
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { SearchFilters, SearchOptions, SavedSearch, SearchHistory } from '@/services/searchService';

interface AdvancedSearchProps {
    onSearch: (filters: SearchFilters, options: SearchOptions) => void;
    onSaveSearch?: (name: string, filters: SearchFilters, options: SearchOptions) => void;
    onLoadSavedSearch?: (searchId: string) => void;
    savedSearches?: SavedSearch[];
    searchHistory?: SearchHistory[];
    suggestions?: string[];
    isLoading?: boolean;
    className?: string;
}

const FILE_TYPES = [
    { value: 'image/jpeg', label: 'JPEG Images' },
    { value: 'image/png', label: 'PNG Images' },
    { value: 'application/pdf', label: 'PDF Documents' },
    { value: 'text/plain', label: 'Text Files' },
    { value: 'application/json', label: 'JSON Files' }
];

const CATEGORIES = [
    { value: 'medical', label: 'Medical Records' },
    { value: 'lab', label: 'Lab Results' },
    { value: 'prescription', label: 'Prescriptions' },
    { value: 'imaging', label: 'Medical Imaging' },
    { value: 'visit', label: 'Visit Notes' },
    { value: 'diagnosis', label: 'Diagnosis' }
];

const RECORD_TYPES = [
    { value: 'visit', label: 'Visit Records' },
    { value: 'prescription', label: 'Prescriptions' },
    { value: 'lab', label: 'Lab Results' },
    { value: 'diagnosis', label: 'Diagnoses' },
    { value: 'custom', label: 'Custom Records' }
];

const SORT_OPTIONS = [
    { value: 'relevance', label: 'Relevance' },
    { value: 'name', label: 'Name' },
    { value: 'date', label: 'Date' },
    { value: 'size', label: 'File Size' }
];

export default function AdvancedSearch({
    onSearch,
    onSaveSearch,
    onLoadSavedSearch,
    savedSearches = [],
    searchHistory = [],
    suggestions = [],
    isLoading = false,
    className
}: AdvancedSearchProps) {
    const [filters, setFilters] = useState<SearchFilters>({});
    const [options, setOptions] = useState<SearchOptions>({
        sortBy: 'relevance',
        sortOrder: 'desc',
        limit: 50
    });

    const [isExpanded, setIsExpanded] = useState(false);
    const [showSaveDialog, setShowSaveDialog] = useState(false);
    const [saveSearchName, setSaveSearchName] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [activeTab, setActiveTab] = useState<'filters' | 'saved' | 'history'>('filters');

    // Handle search input changes
    const handleQueryChange = useCallback((value: string) => {
        setFilters(prev => ({ ...prev, query: value }));
        setShowSuggestions(value.length > 1 && suggestions.length > 0);
    }, [suggestions.length]);

    // Handle filter changes
    const updateFilter = useCallback(<K extends keyof SearchFilters>(
        key: K,
        value: SearchFilters[K]
    ) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    }, []);

    // Handle option changes
    const updateOption = useCallback(<K extends keyof SearchOptions>(
        key: K,
        value: SearchOptions[K]
    ) => {
        setOptions(prev => ({ ...prev, [key]: value }));
    }, []);

    // Execute search
    const handleSearch = useCallback(() => {
        onSearch(filters, options);
        setShowSuggestions(false);
    }, [filters, options, onSearch]);

    // Clear all filters
    const clearFilters = useCallback(() => {
        setFilters({});
        setOptions({
            sortBy: 'relevance',
            sortOrder: 'desc',
            limit: 50
        });
    }, []);

    // Save current search
    const handleSaveSearch = useCallback(() => {
        if (saveSearchName.trim() && onSaveSearch) {
            onSaveSearch(saveSearchName.trim(), filters, options);
            setSaveSearchName('');
            setShowSaveDialog(false);
        }
    }, [saveSearchName, filters, options, onSaveSearch]);

    // Load saved search
    const handleLoadSavedSearch = useCallback((searchId: string) => {
        if (onLoadSavedSearch) {
            onLoadSavedSearch(searchId);
        }
    }, [onLoadSavedSearch]);

    // Use suggestion
    const handleUseSuggestion = useCallback((suggestion: string) => {
        setFilters(prev => ({ ...prev, query: suggestion }));
        setShowSuggestions(false);
    }, []);

    // Handle Enter key in search input
    const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    }, [handleSearch]);

    // Check if any filters are active
    const hasActiveFilters = useMemo(() => {
        return Object.keys(filters).some(key => {
            const value = filters[key as keyof SearchFilters];
            if (Array.isArray(value)) return value.length > 0;
            if (typeof value === 'object' && value !== null) return true;
            return value !== undefined && value !== '';
        });
    }, [filters]);

    // Auto-search when filters change (debounced)
    useEffect(() => {
        if (hasActiveFilters) {
            const timeoutId = setTimeout(() => {
                handleSearch();
            }, 500);
            return () => clearTimeout(timeoutId);
        }
    }, [filters, hasActiveFilters, handleSearch]);

    return (
        <Card className={cn("w-full", className)}>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2">
                        <Search className="h-5 w-5" />
                        <span>Advanced Search</span>
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                        {hasActiveFilters && (
                            <Badge variant="secondary" className="text-xs">
                                {Object.keys(filters).length} filters active
                            </Badge>
                        )}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsExpanded(!isExpanded)}
                        >
                            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </Button>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Search Input */}
                <div className="relative">
                    <div className="flex space-x-2">
                        <div className="relative flex-1">
                            <Input
                                placeholder="Search files, descriptions, categories..."
                                value={filters.query || ''}
                                onChange={(e) => handleQueryChange(e.target.value)}
                                onKeyPress={handleKeyPress}
                                className="pr-10"
                            />
                            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        </div>
                        <Button onClick={handleSearch} disabled={isLoading}>
                            {isLoading ? 'Searching...' : 'Search'}
                        </Button>
                    </div>

                    {/* Search Suggestions */}
                    {showSuggestions && suggestions.length > 0 && (
                        <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-white border rounded-md shadow-lg">
                            {suggestions.map((suggestion, index) => (
                                <button
                                    key={index}
                                    className="w-full px-3 py-2 text-left hover:bg-gray-50 first:rounded-t-md last:rounded-b-md"
                                    onClick={() => handleUseSuggestion(suggestion)}
                                >
                                    {suggestion}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Quick Actions */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsExpanded(!isExpanded)}
                        >
                            <SlidersHorizontal className="h-4 w-4 mr-1" />
                            Filters
                        </Button>
                        {hasActiveFilters && (
                            <Button variant="ghost" size="sm" onClick={clearFilters}>
                                <X className="h-4 w-4 mr-1" />
                                Clear
                            </Button>
                        )}
                    </div>

                    <div className="flex items-center space-x-2">
                        {onSaveSearch && hasActiveFilters && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowSaveDialog(true)}
                            >
                                <Save className="h-4 w-4 mr-1" />
                                Save
                            </Button>
                        )}
                    </div>
                </div>

                {/* Expanded Filters */}
                <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
                    <CollapsibleContent className="space-y-4">
                        <Separator />

                        {/* Filter Tabs */}
                        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                            <button
                                className={cn(
                                    "flex-1 px-3 py-2 text-sm rounded-md transition-colors",
                                    activeTab === 'filters' ? "bg-white shadow-sm" : "hover:bg-gray-200"
                                )}
                                onClick={() => setActiveTab('filters')}
                            >
                                <Filter className="h-4 w-4 mr-1 inline" />
                                Filters
                            </button>
                            <button
                                className={cn(
                                    "flex-1 px-3 py-2 text-sm rounded-md transition-colors",
                                    activeTab === 'saved' ? "bg-white shadow-sm" : "hover:bg-gray-200"
                                )}
                                onClick={() => setActiveTab('saved')}
                            >
                                <Star className="h-4 w-4 mr-1 inline" />
                                Saved ({savedSearches.length})
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

                        {/* Filter Content */}
                        {activeTab === 'filters' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {/* File Types */}
                                <div className="space-y-2">
                                    <Label>File Types</Label>
                                    <div className="space-y-2 max-h-32 overflow-y-auto">
                                        {FILE_TYPES.map((type) => (
                                            <div key={type.value} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`type-${type.value}`}
                                                    checked={filters.fileTypes?.includes(type.value) || false}
                                                    onCheckedChange={(checked) => {
                                                        const current = filters.fileTypes || [];
                                                        const updated = checked
                                                            ? [...current, type.value]
                                                            : current.filter(t => t !== type.value);
                                                        updateFilter('fileTypes', updated);
                                                    }}
                                                />
                                                <Label htmlFor={`type-${type.value}`} className="text-sm">
                                                    {type.label}
                                                </Label>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Categories */}
                                <div className="space-y-2">
                                    <Label>Categories</Label>
                                    <div className="space-y-2 max-h-32 overflow-y-auto">
                                        {CATEGORIES.map((category) => (
                                            <div key={category.value} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`cat-${category.value}`}
                                                    checked={filters.categories?.includes(category.value) || false}
                                                    onCheckedChange={(checked) => {
                                                        const current = filters.categories || [];
                                                        const updated = checked
                                                            ? [...current, category.value]
                                                            : current.filter(c => c !== category.value);
                                                        updateFilter('categories', updated);
                                                    }}
                                                />
                                                <Label htmlFor={`cat-${category.value}`} className="text-sm">
                                                    {category.label}
                                                </Label>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Record Types */}
                                <div className="space-y-2">
                                    <Label>Record Types</Label>
                                    <div className="space-y-2 max-h-32 overflow-y-auto">
                                        {RECORD_TYPES.map((recordType) => (
                                            <div key={recordType.value} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`record-${recordType.value}`}
                                                    checked={filters.recordTypes?.includes(recordType.value) || false}
                                                    onCheckedChange={(checked) => {
                                                        const current = filters.recordTypes || [];
                                                        const updated = checked
                                                            ? [...current, recordType.value]
                                                            : current.filter(r => r !== recordType.value);
                                                        updateFilter('recordTypes', updated);
                                                    }}
                                                />
                                                <Label htmlFor={`record-${recordType.value}`} className="text-sm">
                                                    {recordType.label}
                                                </Label>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Date Range */}
                                <div className="space-y-2">
                                    <Label>Date Range</Label>
                                    <div className="flex space-x-2">
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button variant="outline" size="sm" className="flex-1">
                                                    <CalendarIcon className="h-4 w-4 mr-1" />
                                                    {filters.dateRange?.start ?
                                                        format(filters.dateRange.start, 'MMM dd') :
                                                        'Start'
                                                    }
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0">
                                                <Calendar
                                                    mode="single"
                                                    selected={filters.dateRange?.start}
                                                    onSelect={(date) => {
                                                        if (date) {
                                                            updateFilter('dateRange', {
                                                                start: date,
                                                                end: filters.dateRange?.end || new Date()
                                                            });
                                                        }
                                                    }}
                                                />
                                            </PopoverContent>
                                        </Popover>

                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button variant="outline" size="sm" className="flex-1">
                                                    <CalendarIcon className="h-4 w-4 mr-1" />
                                                    {filters.dateRange?.end ?
                                                        format(filters.dateRange.end, 'MMM dd') :
                                                        'End'
                                                    }
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0">
                                                <Calendar
                                                    mode="single"
                                                    selected={filters.dateRange?.end}
                                                    onSelect={(date) => {
                                                        if (date) {
                                                            updateFilter('dateRange', {
                                                                start: filters.dateRange?.start || new Date(),
                                                                end: date
                                                            });
                                                        }
                                                    }}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                </div>

                                {/* File Size Range */}
                                <div className="space-y-2">
                                    <Label>File Size</Label>
                                    <div className="flex space-x-2">
                                        <Input
                                            placeholder="Min (KB)"
                                            type="number"
                                            value={filters.sizeRange?.min ? Math.round(filters.sizeRange.min / 1024) : ''}
                                            onChange={(e) => {
                                                const value = parseInt(e.target.value);
                                                if (!isNaN(value)) {
                                                    updateFilter('sizeRange', {
                                                        min: value * 1024,
                                                        max: filters.sizeRange?.max || Infinity
                                                    });
                                                }
                                            }}
                                        />
                                        <Input
                                            placeholder="Max (KB)"
                                            type="number"
                                            value={filters.sizeRange?.max && filters.sizeRange.max !== Infinity ?
                                                Math.round(filters.sizeRange.max / 1024) : ''}
                                            onChange={(e) => {
                                                const value = parseInt(e.target.value);
                                                if (!isNaN(value)) {
                                                    updateFilter('sizeRange', {
                                                        min: filters.sizeRange?.min || 0,
                                                        max: value * 1024
                                                    });
                                                }
                                            }}
                                        />
                                    </div>
                                </div>

                                {/* Additional Options */}
                                <div className="space-y-2">
                                    <Label>Options</Label>
                                    <div className="space-y-2">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="encrypted"
                                                checked={filters.isEncrypted === true}
                                                onCheckedChange={(checked) => {
                                                    updateFilter('isEncrypted', checked ? true : undefined);
                                                }}
                                            />
                                            <Label htmlFor="encrypted" className="text-sm">
                                                Encrypted files only
                                            </Label>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="shared"
                                                checked={filters.isShared === true}
                                                onCheckedChange={(checked) => {
                                                    updateFilter('isShared', checked ? true : undefined);
                                                }}
                                            />
                                            <Label htmlFor="shared" className="text-sm">
                                                Shared files only
                                            </Label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Saved Searches */}
                        {activeTab === 'saved' && (
                            <div className="space-y-2">
                                {savedSearches.length === 0 ? (
                                    <p className="text-sm text-gray-500 text-center py-4">
                                        No saved searches yet
                                    </p>
                                ) : (
                                    savedSearches.map((search) => (
                                        <div
                                            key={search.id}
                                            className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                                        >
                                            <div className="flex-1">
                                                <h4 className="font-medium">{search.name}</h4>
                                                <p className="text-sm text-gray-500">
                                                    Last used: {format(search.lastUsed, 'MMM dd, yyyy')}
                                                </p>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleLoadSavedSearch(search.id)}
                                                >
                                                    Load
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => {
                                                        // Handle delete saved search
                                                    }}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {/* Search History */}
                        {activeTab === 'history' && (
                            <div className="space-y-2">
                                {searchHistory.length === 0 ? (
                                    <p className="text-sm text-gray-500 text-center py-4">
                                        No search history yet
                                    </p>
                                ) : (
                                    searchHistory.slice(0, 10).map((entry, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                                            onClick={() => handleQueryChange(entry.query)}
                                        >
                                            <div className="flex-1">
                                                <p className="font-medium">{entry.query}</p>
                                                <p className="text-sm text-gray-500">
                                                    {entry.resultCount} results • {format(entry.timestamp, 'MMM dd, HH:mm')}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        {/* Sort Options */}
                        <Separator />
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-2">
                                    <Label htmlFor="sort-by">Sort by:</Label>
                                    <Select
                                        value={options.sortBy}
                                        onValueChange={(value) => updateOption('sortBy', value as any)}
                                    >
                                        <SelectTrigger className="w-32">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {SORT_OPTIONS.map((option) => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Label htmlFor="sort-order">Order:</Label>
                                    <Select
                                        value={options.sortOrder}
                                        onValueChange={(value) => updateOption('sortOrder', value as any)}
                                    >
                                        <SelectTrigger className="w-24">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="desc">Desc</SelectItem>
                                            <SelectItem value="asc">Asc</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>
                    </CollapsibleContent>
                </Collapsible>

                {/* Save Search Dialog */}
                {showSaveDialog && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                            <h3 className="text-lg font-semibold mb-4">Save Search</h3>
                            <Input
                                placeholder="Enter search name..."
                                value={saveSearchName}
                                onChange={(e) => setSaveSearchName(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSaveSearch()}
                            />
                            <div className="flex justify-end space-x-2 mt-4">
                                <Button variant="ghost" onClick={() => setShowSaveDialog(false)}>
                                    Cancel
                                </Button>
                                <Button onClick={handleSaveSearch} disabled={!saveSearchName.trim()}>
                                    Save
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}