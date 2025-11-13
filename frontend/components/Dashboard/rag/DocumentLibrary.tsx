'use client'

import { useState } from 'react'
import { 
  FileText, 
  MoreVertical, 
  Eye, 
  Download, 
  Trash2, 
  Search,
  Filter,
  Grid,
  List,
  Calendar,
  HardDrive,
  AlertCircle,
  CheckCircle2,
  Clock,
  Loader2
} from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
// Toast functionality removed

import { Document, DocumentLibraryProps } from '@/types/rag'
import { deleteDocument, formatFileSize, getFileTypeDisplay } from '@/lib/rag-api'

interface DocumentActionsProps {
  document: Document
  onView: (document: Document) => void
  onDelete: (documentId: string) => void
  onDownload: (document: Document) => void
}

function DocumentActions({ document, onView, onDelete, onDownload }: DocumentActionsProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  // Toast functionality removed

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      await deleteDocument(document.id)
      
      console.log('Success: Document deleted successfully:', document.display_name)
      
      onDelete(document.id)
      setShowDeleteDialog(false)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete document'
      
      console.error('Error deleting document:', errorMessage)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDownload = () => {
    // For now, show a toast that download functionality will be implemented
    console.log('Coming Soon: Document download functionality will be available in a future update')
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-gray-100"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreVertical className="w-4 h-4" />
            <span className="sr-only">Open actions menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={() => onView(document)}>
            <Eye className="w-4 h-4 mr-2" />
            View Details
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDownload}>
            <Download className="w-4 h-4 mr-2" />
            Download
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={() => setShowDeleteDialog(true)}
            className="text-red-600 focus:text-red-600"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Document
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Document</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                Are you sure you want to delete "<strong>{document.display_name}</strong>"?
              </p>
              <p className="text-sm">
                This will permanently remove:
              </p>
              <ul className="text-sm space-y-1 ml-4">
                <li>• The document file ({formatFileSize(document.file_size_bytes)})</li>
                <li>• All associated embeddings and search indexes</li>
                <li>• Document metadata and processing results</li>
              </ul>
              <p className="text-sm font-medium text-red-600">
                This action cannot be undone.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'Deleting...' : 'Delete Document'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

function DocumentCard({ 
  document, 
  viewMode, 
  onView, 
  onDelete, 
  onDownload 
}: { 
  document: Document
  viewMode: 'grid' | 'list'
  onView: (document: Document) => void
  onDelete: (documentId: string) => void
  onDownload: (document: Document) => void
}) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-green-600" />
      case 'processing':
        return <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-600" />
      default:
        return <Clock className="w-4 h-4 text-yellow-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'processing':
        return 'bg-blue-100 text-blue-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-yellow-100 text-yellow-800'
    }
  }

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return '📄'
    if (type.includes('text')) return '📝'
    if (type.includes('word')) return '📘'
    if (type.includes('csv')) return '📊'
    if (type.includes('json')) return '🔧'
    return '📄'
  }

  if (viewMode === 'list') {
    return (
      <Card className="hover:shadow-sm transition-all duration-200 cursor-pointer touch-manipulation active:scale-[0.98]" onClick={() => onView(document)}>
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
              <div className="text-xl sm:text-2xl flex-shrink-0">{getFileIcon(document.file_type || '')}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-medium truncate text-sm sm:text-base">{document.display_name}</p>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {getStatusIcon(document.upload_status)}
                    <Badge className={`${getStatusColor(document.upload_status)} text-xs hidden sm:inline-flex`}>
                      {document.upload_status}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500">
                  <span className="truncate">{getFileTypeDisplay(document.file_type || '')}</span>
                  <span className="hidden sm:inline">•</span>
                  <span className="flex-shrink-0">{formatFileSize(document.file_size_bytes)}</span>
                  <span className="hidden md:inline">•</span>
                  <span className="hidden md:inline flex-shrink-0">{new Date(document.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            <div className="flex-shrink-0">
              <DocumentActions
                document={document}
                onView={onView}
                onDelete={onDelete}
                onDownload={onDownload}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="hover:shadow-md transition-all duration-200 cursor-pointer touch-manipulation active:scale-[0.98]" onClick={() => onView(document)}>
      <CardHeader className="pb-2 sm:pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
            <div className="text-2xl sm:text-3xl flex-shrink-0">{getFileIcon(document.file_type || '')}</div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-sm sm:text-base truncate leading-tight">
                {document.display_name}
              </CardTitle>
              <CardDescription className="line-clamp-2 text-xs sm:text-sm mt-1">
                {document.original_filename}
              </CardDescription>
            </div>
          </div>
          <div className="flex-shrink-0">
            <DocumentActions
              document={document}
              onView={onView}
              onDelete={onDelete}
              onDownload={onDownload}
            />
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-2 sm:space-y-3">
          {/* Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 sm:gap-2">
              {getStatusIcon(document.upload_status)}
              <Badge className={`${getStatusColor(document.upload_status)} text-xs`}>
                {document.upload_status}
              </Badge>
            </div>
          </div>

          {/* File info */}
          <div className="space-y-1 sm:space-y-2">
            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
              <HardDrive className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
              <span className="truncate">{formatFileSize(document.file_size_bytes)}</span>
              <span className="hidden sm:inline">•</span>
              <span className="hidden sm:inline truncate">{getFileTypeDisplay(document.file_type || '')}</span>
            </div>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
              <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
              <span>{new Date(document.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function DocumentLibrary({
  documents,
  isLoading,
  searchQuery,
  onSearchChange,
  viewMode,
  onViewModeChange,
  filterStatus,
  onFilterStatusChange,
  sortBy,
  onSortByChange,
  onRefresh
}: DocumentLibraryProps) {
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)
  
  const handleViewDocument = (document: Document) => {
    setSelectedDocument(document)
  }

  const handleDeleteDocument = (documentId: string) => {
    onRefresh()
  }

  const handleDownloadDocument = (document: Document) => {
    // Download functionality will be implemented later
  }

  const filteredDocuments = documents
    .filter(doc => {
      // Search filter
      const searchMatch = !searchQuery || 
        doc.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.original_filename.toLowerCase().includes(searchQuery.toLowerCase())
      
      // Status filter
      const statusMatch = !filterStatus || filterStatus === 'all' || doc.upload_status === filterStatus
      
      return searchMatch && statusMatch
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.display_name.localeCompare(b.display_name)
        case 'size':
          return b.file_size_bytes - a.file_size_bytes
        case 'type':
          return (a.file_type || '').localeCompare(b.file_type || '')
        case 'created_at':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      }
    })

  if (isLoading) {
    return (
      <div className="space-y-4">
        {/* Loading Header */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-24" />
          </div>
        </div>
        
        {/* Loading Cards */}
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}>
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="flex items-start gap-3">
                  <Skeleton className="w-10 h-10 rounded" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-3 w-full mb-2" />
                <Skeleton className="h-3 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="space-y-3 sm:space-y-0 sm:flex sm:flex-row sm:gap-4 sm:justify-between">
        {/* Search */}
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 h-10 touch-manipulation"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-2">
          <div className="flex gap-2">
            {/* Status Filter */}
            <Select value={filterStatus} onValueChange={onFilterStatusChange}>
              <SelectTrigger className="flex-1 sm:w-32 h-10">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={onSortByChange}>
              <SelectTrigger className="flex-1 sm:w-32 h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at">Date</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="size">Size</SelectItem>
                <SelectItem value="type">Type</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* View Mode */}
          <div className="flex border rounded-lg h-10 self-end sm:self-auto">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onViewModeChange('grid')}
              className="rounded-r-none h-full px-3 touch-manipulation"
            >
              <Grid className="w-4 h-4" />
              <span className="ml-1 sm:hidden">Grid</span>
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onViewModeChange('list')}
              className="rounded-l-none h-full px-3 touch-manipulation"
            >
              <List className="w-4 h-4" />
              <span className="ml-1 sm:hidden">List</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Documents Grid/List */}
      {filteredDocuments.length === 0 ? (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <FileText className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {documents.length === 0 ? 'No documents found' : 'No documents match your filters'}
          </h3>
          <p className="text-gray-500 mb-6">
            {documents.length === 0 
              ? 'Upload documents to this corpus to enable RAG functionality'
              : 'Try adjusting your search or filter criteria'
            }
          </p>
        </div>
      ) : (
        <div className={viewMode === 'grid' 
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' 
          : 'space-y-3'
        }>
          {filteredDocuments.map(document => (
            <DocumentCard
              key={document.id}
              document={document}
              viewMode={viewMode}
              onView={handleViewDocument}
              onDelete={handleDeleteDocument}
              onDownload={handleDownloadDocument}
            />
          ))}
        </div>
      )}

      {/* Document Details Modal - Will be implemented later */}
      {selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setSelectedDocument(null)}>
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-semibold mb-4">Document Details</h2>
            <div className="space-y-3">
              <div><span className="font-medium">Name:</span> {selectedDocument.display_name}</div>
              <div><span className="font-medium">Original File:</span> {selectedDocument.original_filename}</div>
              <div><span className="font-medium">Size:</span> {formatFileSize(selectedDocument.file_size_bytes)}</div>
              <div><span className="font-medium">Type:</span> {getFileTypeDisplay(selectedDocument.file_type || '')}</div>
              <div><span className="font-medium">Status:</span> {selectedDocument.upload_status}</div>
              <div><span className="font-medium">Created:</span> {new Date(selectedDocument.created_at).toLocaleString()}</div>
              {selectedDocument.updated_at !== selectedDocument.created_at && (
                <div><span className="font-medium">Updated:</span> {new Date(selectedDocument.updated_at).toLocaleString()}</div>
              )}
            </div>
            <div className="flex justify-end mt-6">
              <Button onClick={() => setSelectedDocument(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}