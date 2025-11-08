/**
 * Enhanced File List Component
 * Provides grid/table view modes, batch operations, drag-and-drop, and organization features
 */

import React, { useState, useCallback, useMemo, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
    Grid3X3,
    List,
    Download,
    Eye,
    Share2,
    Trash2,
    Tag,
    Calendar,
    FileText,
    Image as ImageIcon,
    File,
    MoreHorizontal,
    Move,
    Copy,
    Archive,
    Star,
    StarOff,
    Filter,
    SortAsc,
    SortDesc
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { MedicalFileMetadata } from '@/stores/medicalFilesStore';
import { useEnhancedDownload } from '@/hooks/useEnhancedDownload';
import { useFilePreview, useMultiFilePreview } from '@/hooks/useFilePreview';
import FilePreviewModal from './FilePreviewModal';
import { FileRecord } from '@/services/downloadManager';

interface EnhancedFileListProps {
    files: MedicalFileMetadata[];
    walletAddress: string;
    onFileSelect?: (file: MedicalFileMetadata) => void;
    onFilesSelect?: (files: MedicalFileMetadata[]) => void;
    onFileUpdate?: (fileId: string, updates: Partial<MedicalFileMetadata>) => void;
    onFileDelete?: (fileId: string) => void;
    onBatchOperation?: (operation: string, fileIds: string[]) => void;
    className?: string;
}

type ViewMode = 'grid' | 'table';
type SortField = 'name' | 'date' | 'size' | 'category' | 'type';
type SortOrder = 'asc' | 'desc';

interface FileListState {
    viewMode: ViewMode;
    selectedFiles: Set<string>;
    sortField: SortField;
    sortOrder: SortOrder;
    filterCategory: string;
    filterType: string;
    searchQuery: string;
    showBatchActions: boolean;
}

export default function EnhancedFileList({
    files,
    walletAddress,
    onFileSelect,
    onFilesSelect,
    onFileUpdate,
    onFileDelete,
    onBatchOperation,
    className
}: EnhancedFileListProps) {
    const { downloadAndDecryptFile } = useEnhancedDownload();
    const { generateThumbnails, getThumbnail, isLoading } = useMultiFilePreview();

    const [state, setState] = useState<FileListState>({
        viewMode: 'grid',
        selectedFiles: new Set(),
        sortField: 'date',
        sortOrder: 'desc',
        filterCategory: '',
        filterType: '',
        searchQuery: '',
        showBatchActions: false
    });

    const [previewFile, setPreviewFile] = useState<MedicalFileMetadata | null>(null);
    const [draggedFile, setDraggedFile] = useState<string | null>(null);
    const [dropTarget, setDropTarget] = useState<string | null>(null);
    const fileListRef = useRef<HTMLDivElement>(null);

    // Convert MedicalFileMetadata to FileRecord for services
    const convertToFileRecord = useCallback((file: MedicalFileMetadata): FileRecord => ({
        id: file.id,
        rootHash: file.rootHash,
        fileName: file.name,
        mimeType: file.type,
        fileSize: file.size,
        isEncrypted: !!(file as any).encryptionMetadata,
        encryptionMetadata: (file as any).encryptionMetadata,
        walletAddress: file.walletAddress
    }), []);

    // Filter and sort files
    const processedFiles = useMemo(() => {
        let filtered = files;

        // Apply search filter
        if (state.searchQuery) {
            const query = state.searchQuery.toLowerCase();
            filtered = filtered.filter(file =>
                file.name.toLowerCase().includes(query) ||
                file.description?.toLowerCase().includes(query) ||
                file.category?.toLowerCase().includes(query) ||
                file.tags?.some(tag => tag.toLowerCase().includes(query))
            );
        }

        // Apply category filter
        if (state.filterCategory) {
            filtered = filtered.filter(file => file.category === state.filterCategory);
        }

        // Apply type filter
        if (state.filterType) {
            filtered = filtered.filter(file => file.type === state.filterType);
        }

        // Sort files
        filtered.sort((a, b) => {
            let comparison = 0;

            switch (state.sortField) {
                case 'name':
                    comparison = a.name.localeCompare(b.name);
                    break;
                case 'date':
                    comparison = new Date(a.uploadDate).getTime() - new Date(b.uploadDate).getTime();
                    break;
                case 'size':
                    comparison = a.size - b.size;
                    break;
                case 'category':
                    comparison = (a.category || '').localeCompare(b.category || '');
                    break;
                case 'type':
                    comparison = a.type.localeCompare(b.type);
                    break;
            }

            return state.sortOrder === 'desc' ? -comparison : comparison;
        });

        return filtered;
    }, [files, state.searchQuery, state.filterCategory, state.filterType, state.sortField, state.sortOrder]);

    // Get unique categories and types for filters
    const { categories, types } = useMemo(() => {
        const categorySet = new Set<string>();
        const typeSet = new Set<string>();

        files.forEach(file => {
            if (file.category) categorySet.add(file.category);
            typeSet.add(file.type);
        });

        return {
            categories: Array.from(categorySet).sort(),
            types: Array.from(typeSet).sort()
        };
    }, [files]);

    // Generate thumbnails for visible files
    React.useEffect(() => {
        if (processedFiles.length > 0 && walletAddress) {
            const fileRecords = processedFiles.map(convertToFileRecord);
            generateThumbnails(fileRecords, walletAddress, { width: 150, height: 150 });
        }
    }, [processedFiles, walletAddress, generateThumbnails, convertToFileRecord]);

    // Handle file selection
    const handleFileSelect = useCallback((fileId: string, selected: boolean) => {
        setState(prev => {
            const newSelected = new Set(prev.selectedFiles);
            if (selected) {
                newSelected.add(fileId);
            } else {
                newSelected.delete(fileId);
            }

            const showBatchActions = newSelected.size > 0;

            // Notify parent of selection changes
            if (onFilesSelect) {
                const selectedFileObjects = files.filter(f => newSelected.has(f.id));
                onFilesSelect(selectedFileObjects);
            }

            return {
                ...prev,
                selectedFiles: newSelected,
                showBatchActions
            };
        });
    }, [files, onFilesSelect]);

    // Handle select all
    const handleSelectAll = useCallback((selected: boolean) => {
        setState(prev => ({
            ...prev,
            selectedFiles: selected ? new Set(processedFiles.map(f => f.id)) : new Set(),
            showBatchActions: selected && processedFiles.length > 0
        }));
    }, [processedFiles]);

    // Handle file actions
    const handleFileAction = useCallback(async (action: string, file: MedicalFileMetadata) => {
        switch (action) {
            case 'preview':
                setPreviewFile(file);
                break;
            case 'download':
                await downloadAndDecryptFile(convertToFileRecord(file), walletAddress);
                break;
            case 'share':
                // Handle share action
                break;
            case 'delete':
                if (onFileDelete) {
                    onFileDelete(file.id);
                }
                break;
            case 'favorite':
                if (onFileUpdate) {
                    onFileUpdate(file.id, { tags: [...(file.tags || []), 'favorite'] });
                }
                break;
            case 'unfavorite':
                if (onFileUpdate) {
                    onFileUpdate(file.id, {
                        tags: (file.tags || []).filter(tag => tag !== 'favorite')
                    });
                }
                break;
        }
    }, [downloadAndDecryptFile, convertToFileRecord, walletAddress, onFileDelete, onFileUpdate]);

    // Handle batch operations
    const handleBatchOperation = useCallback((operation: string) => {
        const selectedIds = Array.from(state.selectedFiles);
        if (selectedIds.length === 0) return;

        if (onBatchOperation) {
            onBatchOperation(operation, selectedIds);
        }

        // Clear selection after operation
        setState(prev => ({
            ...prev,
            selectedFiles: new Set(),
            showBatchActions: false
        }));
    }, [state.selectedFiles, onBatchOperation]);

    // Handle drag and drop
    const handleDragStart = useCallback((e: React.DragEvent, fileId: string) => {
        setDraggedFile(fileId);
        e.dataTransfer.effectAllowed = 'move';
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent, fileId: string) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setDropTarget(fileId);
    }, []);

    const handleDragLeave = useCallback(() => {
        setDropTarget(null);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent, targetFileId: string) => {
        e.preventDefault();

        if (draggedFile && draggedFile !== targetFileId) {
            // Handle file reordering or grouping
            console.log(`Moving file ${draggedFile} to position of ${targetFileId}`);
        }

        setDraggedFile(null);
        setDropTarget(null);
    }, [draggedFile]);

    // Get file icon based on type
    const getFileIcon = useCallback((file: MedicalFileMetadata) => {
        if (file.type.startsWith('image/')) return ImageIcon;
        if (file.type === 'application/pdf') return FileText;
        return File;
    }, []);

    // Format file size
    const formatFileSize = useCallback((bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }, []);

    // Format date
    const formatDate = useCallback((dateString: string): string => {
        try {
            return new Date(dateString).toLocaleDateString();
        } catch {
            return 'Unknown date';
        }
    }, []);

    // Check if file is favorite
    const isFavorite = useCallback((file: MedicalFileMetadata): boolean => {
        return file.tags?.includes('favorite') || false;
    }, []);

    // Render grid view
    const renderGridView = () => (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {processedFiles.map((file) => {
                const FileIcon = getFileIcon(file);
                const thumbnailUrl = getThumbnail(file.id);
                const isSelected = state.selectedFiles.has(file.id);
                const isDragTarget = dropTarget === file.id;
                const favorite = isFavorite(file);

                return (
                    <Card
                        key={file.id}
                        className={cn(
                            "hover:shadow-md transition-all cursor-pointer group",
                            isSelected && "ring-2 ring-blue-500",
                            isDragTarget && "ring-2 ring-green-500 bg-green-50"
                        )}
                        draggable
                        onDragStart={(e) => handleDragStart(e, file.id)}
                        onDragOver={(e) => handleDragOver(e, file.id)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, file.id)}
                        onClick={() => onFileSelect?.(file)}
                    >
                        <CardHeader className="pb-2">
                            <div className="flex items-start justify-between">
                                <Checkbox
                                    checked={isSelected}
                                    onCheckedChange={(checked) => handleFileSelect(file.id, !!checked)}
                                    onClick={(e) => e.stopPropagation()}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                                />
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleFileAction(favorite ? 'unfavorite' : 'favorite', file);
                                    }}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    {favorite ? (
                                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                                    ) : (
                                        <StarOff className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>
                        </CardHeader>

                        <CardContent className="pt-0">
                            <div className="flex flex-col items-center space-y-3">
                                {/* File thumbnail or icon */}
                                <div className="w-20 h-20 flex items-center justify-center bg-gray-50 rounded-lg overflow-hidden">
                                    {thumbnailUrl ? (
                                        <img
                                            src={thumbnailUrl}
                                            alt={file.name}
                                            className="w-full h-full object-cover"
                                            loading="lazy"
                                        />
                                    ) : isLoading(file.id) ? (
                                        <div className="animate-pulse bg-gray-200 w-full h-full rounded" />
                                    ) : (
                                        <FileIcon className="h-8 w-8 text-gray-400" />
                                    )}
                                </div>

                                {/* File info */}
                                <div className="text-center space-y-1 w-full">
                                    <h3 className="font-medium text-sm truncate" title={file.name}>
                                        {file.name}
                                    </h3>
                                    <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
                                        <span>{formatFileSize(file.size)}</span>
                                        <span>•</span>
                                        <span>{formatDate(file.uploadDate)}</span>
                                    </div>
                                    {file.category && (
                                        <Badge variant="outline" className="text-xs">
                                            {file.category}
                                        </Badge>
                                    )}
                                </div>

                                {/* Action buttons */}
                                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleFileAction('preview', file);
                                        }}
                                    >
                                        <Eye className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleFileAction('download', file);
                                        }}
                                    >
                                        <Download className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleFileAction('share', file);
                                        }}
                                    >
                                        <Share2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );

    // Render table view
    const renderTableView = () => (
        <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="w-12 p-3">
                            <Checkbox
                                checked={state.selectedFiles.size === processedFiles.length && processedFiles.length > 0}
                                onCheckedChange={handleSelectAll}
                            />
                        </th>
                        <th className="text-left p-3 font-medium">Name</th>
                        <th className="text-left p-3 font-medium">Category</th>
                        <th className="text-left p-3 font-medium">Size</th>
                        <th className="text-left p-3 font-medium">Date</th>
                        <th className="text-left p-3 font-medium">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {processedFiles.map((file) => {
                        const FileIcon = getFileIcon(file);
                        const thumbnailUrl = getThumbnail(file.id);
                        const isSelected = state.selectedFiles.has(file.id);
                        const favorite = isFavorite(file);

                        return (
                            <tr
                                key={file.id}
                                className={cn(
                                    "border-t hover:bg-gray-50 cursor-pointer group",
                                    isSelected && "bg-blue-50"
                                )}
                                onClick={() => onFileSelect?.(file)}
                            >
                                <td className="p-3">
                                    <Checkbox
                                        checked={isSelected}
                                        onCheckedChange={(checked) => handleFileSelect(file.id, !!checked)}
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                </td>
                                <td className="p-3">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 flex items-center justify-center bg-gray-50 rounded overflow-hidden flex-shrink-0">
                                            {thumbnailUrl ? (
                                                <img
                                                    src={thumbnailUrl}
                                                    alt={file.name}
                                                    className="w-full h-full object-cover"
                                                    loading="lazy"
                                                />
                                            ) : (
                                                <FileIcon className="h-4 w-4 text-gray-400" />
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center space-x-2">
                                                <span className="font-medium truncate">{file.name}</span>
                                                {favorite && (
                                                    <Star className="h-4 w-4 text-yellow-500 fill-current flex-shrink-0" />
                                                )}
                                            </div>
                                            {file.description && (
                                                <p className="text-sm text-gray-500 truncate">{file.description}</p>
                                            )}
                                        </div>
                                    </div>
                                </td>
                                <td className="p-3">
                                    {file.category && (
                                        <Badge variant="outline" className="text-xs">
                                            {file.category}
                                        </Badge>
                                    )}
                                </td>
                                <td className="p-3 text-sm text-gray-600">
                                    {formatFileSize(file.size)}
                                </td>
                                <td className="p-3 text-sm text-gray-600">
                                    {formatDate(file.uploadDate)}
                                </td>
                                <td className="p-3">
                                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleFileAction('preview', file);
                                            }}
                                        >
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleFileAction('download', file);
                                            }}
                                        >
                                            <Download className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleFileAction('share', file);
                                            }}
                                        >
                                            <Share2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );

    return (
        <div className={cn("space-y-4", className)} ref={fileListRef}>
            {/* Header with controls */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <div className="flex items-center space-x-4">
                    <h2 className="text-lg font-semibold">
                        Files ({processedFiles.length})
                    </h2>
                    {state.selectedFiles.size > 0 && (
                        <Badge variant="secondary">
                            {state.selectedFiles.size} selected
                        </Badge>
                    )}
                </div>

                <div className="flex items-center space-x-2">
                    {/* View mode toggle */}
                    <div className="flex items-center border rounded-lg p-1">
                        <Button
                            variant={state.viewMode === 'grid' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setState(prev => ({ ...prev, viewMode: 'grid' }))}
                        >
                            <Grid3X3 className="h-4 w-4" />
                        </Button>
                        <Button
                            variant={state.viewMode === 'table' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setState(prev => ({ ...prev, viewMode: 'table' }))}
                        >
                            <List className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Sort controls */}
                    <Select
                        value={state.sortField}
                        onValueChange={(value) => setState(prev => ({ ...prev, sortField: value as SortField }))}
                    >
                        <SelectTrigger className="w-32">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="name">Name</SelectItem>
                            <SelectItem value="date">Date</SelectItem>
                            <SelectItem value="size">Size</SelectItem>
                            <SelectItem value="category">Category</SelectItem>
                            <SelectItem value="type">Type</SelectItem>
                        </SelectContent>
                    </Select>

                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setState(prev => ({
                            ...prev,
                            sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc'
                        }))}
                    >
                        {state.sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                    </Button>
                </div>
            </div>

            {/* Filters and search */}
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                <div className="flex-1">
                    <Input
                        placeholder="Search files..."
                        value={state.searchQuery}
                        onChange={(e) => setState(prev => ({ ...prev, searchQuery: e.target.value }))}
                        className="w-full"
                    />
                </div>

                <Select
                    value={state.filterCategory}
                    onValueChange={(value) => setState(prev => ({ ...prev, filterCategory: value }))}
                >
                    <SelectTrigger className="w-40">
                        <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="">All Categories</SelectItem>
                        {categories.map(category => (
                            <SelectItem key={category} value={category}>
                                {category}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select
                    value={state.filterType}
                    onValueChange={(value) => setState(prev => ({ ...prev, filterType: value }))}
                >
                    <SelectTrigger className="w-40">
                        <SelectValue placeholder="File Type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="">All Types</SelectItem>
                        {types.map(type => (
                            <SelectItem key={type} value={type}>
                                {type.split('/')[1]?.toUpperCase() || type}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Batch actions */}
            {state.showBatchActions && (
                <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
                    <span className="text-sm font-medium">
                        {state.selectedFiles.size} files selected
                    </span>
                    <Separator orientation="vertical" className="h-4" />
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleBatchOperation('download')}
                    >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleBatchOperation('share')}
                    >
                        <Share2 className="h-4 w-4 mr-1" />
                        Share
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleBatchOperation('archive')}
                    >
                        <Archive className="h-4 w-4 mr-1" />
                        Archive
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleBatchOperation('delete')}
                        className="text-red-600 hover:text-red-700"
                    >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                    </Button>
                </div>
            )}

            {/* File list */}
            <div className="min-h-96">
                {processedFiles.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-96 text-gray-500">
                        <FileText className="h-12 w-12 mb-4" />
                        <p className="text-lg font-medium">No files found</p>
                        <p className="text-sm">Try adjusting your search or filters</p>
                    </div>
                ) : state.viewMode === 'grid' ? (
                    renderGridView()
                ) : (
                    renderTableView()
                )}
            </div>

            {/* File preview modal */}
            {previewFile && (
                <FilePreviewModal
                    isOpen={!!previewFile}
                    onClose={() => setPreviewFile(null)}
                    fileRecord={convertToFileRecord(previewFile)}
                    walletAddress={walletAddress}
                />
            )}
        </div>
    );
}