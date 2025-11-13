'use client'

import { useState } from 'react'
import { 
  Database, 
  MoreVertical, 
  Edit3, 
  Trash2, 
  FileText, 
  Calendar,
  HardDrive,
  Eye,
  Copy
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
// Toast functionality removed

import { Corpus, CorpusCardProps } from '@/types/rag'
import { deleteCorpus, formatFileSize } from '@/lib/rag-api'

interface CorpusListProps {
  corpora: Corpus[]
  selectedCorpusId?: string
  onSelectCorpus: (corpus: Corpus) => void
  onEditCorpus: (corpus: Corpus) => void
  onDeleteCorpus: (corpusId: string) => void
  onRefresh: () => void
  isLoading?: boolean
}

interface CorpusCardActionsProps {
  corpus: Corpus
  onEdit: (corpus: Corpus) => void
  onDelete: (corpusId: string) => void
  onView: (corpus: Corpus) => void
  onCopyId: (corpusId: string) => void
}

function CorpusCardActions({ corpus, onEdit, onDelete, onView, onCopyId }: CorpusCardActionsProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  // Toast functionality removed

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      await deleteCorpus(corpus.id)
      
      console.log('Success: Corpus deleted successfully:', corpus.display_name)
      
      onDelete(corpus.id)
      setShowDeleteDialog(false)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete corpus'
      
      console.error('Error deleting corpus:', errorMessage)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(corpus.id)
      console.log('Corpus ID copied to clipboard:', corpus.id)
      onCopyId(corpus.id)
    } catch (error) {
      console.error('Failed to copy corpus ID')
    }
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
          <DropdownMenuItem onClick={() => onView(corpus)}>
            <Eye className="w-4 h-4 mr-2" />
            View Details
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onEdit(corpus)}>
            <Edit3 className="w-4 h-4 mr-2" />
            Edit Corpus
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleCopyId}>
            <Copy className="w-4 h-4 mr-2" />
            Copy ID
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={() => setShowDeleteDialog(true)}
            className="text-red-600 focus:text-red-600"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Corpus
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Corpus</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                Are you sure you want to delete "<strong>{corpus.display_name}</strong>"? 
              </p>
              <p className="text-sm">
                This will permanently delete:
              </p>
              <ul className="text-sm space-y-1 ml-4">
                <li>• {corpus.document_count} documents</li>
                <li>• {formatFileSize(corpus.total_size_bytes)} of data</li>
                <li>• All associated embeddings and search indexes</li>
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
              {isDeleting ? 'Deleting...' : 'Delete Corpus'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

function CorpusCard({ corpus, isSelected, onSelect, onEdit, onDelete, onView, onCopyId }: CorpusCardProps & {
  onSelect: (corpus: Corpus) => void
  onView: (corpus: Corpus) => void
  onCopyId: (corpusId: string) => void
}) {
  const getStatusColor = (documentCount: number) => {
    if (documentCount === 0) return 'bg-yellow-100 text-yellow-800'
    if (documentCount < 10) return 'bg-blue-100 text-blue-800'
    return 'bg-green-100 text-green-800'
  }

  const getStatusText = (documentCount: number) => {
    if (documentCount === 0) return 'Empty'
    if (documentCount < 10) return 'Partial'
    return 'Ready'
  }

  return (
    <Card 
      className={`cursor-pointer transition-all duration-300 hover:shadow-lg transform hover:scale-[1.02] touch-manipulation ${
        isSelected 
          ? 'ring-2 ring-blue-500 bg-blue-50 shadow-lg scale-[1.01]' 
          : 'hover:bg-gray-50 active:scale-[0.99]'
      }`}
      onClick={() => onSelect(corpus)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
              <Database className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg truncate">
                {corpus.display_name}
              </CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge 
                  variant="secondary"
                  className={getStatusColor(corpus.document_count)}
                >
                  {getStatusText(corpus.document_count)}
                </Badge>
                <span className="text-xs text-gray-500">
                  ID: {corpus.id.slice(0, 8)}...
                </span>
              </div>
            </div>
          </div>
          <CorpusCardActions
            corpus={corpus}
            onEdit={onEdit}
            onDelete={onDelete}
            onView={onView}
            onCopyId={onCopyId}
          />
        </div>
        
        <CardDescription className="line-clamp-2 mt-2">
          {corpus.description || 'No description provided'}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-0">
        {/* Statistics */}
        <div className="grid grid-cols-2 gap-4 mb-3">
          <div className="flex items-center gap-2 text-sm">
            <FileText className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">
              {corpus.document_count} {corpus.document_count === 1 ? 'document' : 'documents'}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <HardDrive className="w-4 h-4 text-gray-400" />
            <span className="text-gray-600">
              {formatFileSize(corpus.total_size_bytes)}
            </span>
          </div>
        </div>

        {/* Timestamps */}
        <div className="flex items-center gap-4 text-xs text-gray-500 border-t pt-3">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>Created {new Date(corpus.created_at).toLocaleDateString()}</span>
          </div>
          {corpus.updated_at !== corpus.created_at && (
            <div className="flex items-center gap-1">
              <span>•</span>
              <span>Updated {new Date(corpus.updated_at).toLocaleDateString()}</span>
            </div>
          )}
        </div>

        {/* Embedding Model */}
        <div className="mt-2">
          <div className="text-xs text-gray-500">
            Model: {corpus.embedding_model.split('/').pop()?.replace('text-embedding-', 'v')}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function CorpusList({
  corpora,
  selectedCorpusId,
  onSelectCorpus,
  onEditCorpus,
  onDeleteCorpus,
  onRefresh,
  isLoading = false
}: CorpusListProps) {
  const handleDeleteCorpus = (corpusId: string) => {
    onDeleteCorpus(corpusId)
    onRefresh()
  }

  const handleViewCorpus = (corpus: Corpus) => {
    onSelectCorpus(corpus)
  }

  const handleCopyId = (corpusId: string) => {
    // ID copied feedback is handled in the component action
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 bg-gray-200 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-4 bg-gray-200 rounded w-2/3" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (corpora.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Database className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No corpora found
        </h3>
        <p className="text-gray-500 mb-4">
          Create your first corpus to start managing RAG documents
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {corpora.map((corpus, index) => (
        <div 
          key={corpus.id} 
          className="animate-in fade-in slide-in-from-left-4 duration-500"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <CorpusCard
            corpus={corpus}
            isSelected={selectedCorpusId === corpus.id}
            onSelect={onSelectCorpus}
            onEdit={onEditCorpus}
            onDelete={handleDeleteCorpus}
            onView={handleViewCorpus}
            onCopyId={handleCopyId}
          />
        </div>
      ))}
    </div>
  )
}