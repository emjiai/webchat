'use client'

import { useState, useEffect } from 'react'
import { Plus, Database, Upload } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

import { RAGManagementProps, Corpus, Document, RAGUIState } from '@/types/rag'
import { getCorpora, getCorpusStats, getDocuments } from '@/lib/rag-api'
import { formatFileSize } from '@/lib/rag-api'

// Import real RAG components
import CorpusCreator from './rag/CorpusCreator'
import CorpusList from './rag/CorpusList'
import CorpusEditor from './rag/CorpusEditor'
import DocumentUploader from './rag/DocumentUploader'
import DocumentLibrary from './rag/DocumentLibrary'
import ErrorBoundary from './ErrorBoundary'

export default function RAGManagement({ chatbotId, chatbotName }: RAGManagementProps) {
  const [uiState, setUIState] = useState<RAGUIState>({
    selectedCorpus: undefined,
    showCorpusCreator: false,
    showDocumentUpload: false,
    uploadProgress: {},
    searchQuery: '',
    searchResults: [],
    viewMode: 'grid',
    sortBy: 'created_at',
    sortOrder: 'desc'
  })
  
  // Document library state
  const [documentSearchQuery, setDocumentSearchQuery] = useState('')
  const [documentViewMode, setDocumentViewMode] = useState<'grid' | 'list'>('grid')
  const [documentFilterStatus, setDocumentFilterStatus] = useState('all')
  const [documentSortBy, setDocumentSortBy] = useState('created_at')
  
  const [editingCorpus, setEditingCorpus] = useState<Corpus | null>(null)

  const [corpora, setCorpora] = useState<Corpus[]>([])
  const [documents, setDocuments] = useState<Document[]>([])
  const [isLoadingCorpora, setIsLoadingCorpora] = useState(true)
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load corpora on mount
  useEffect(() => {
    loadCorpora()
  }, [chatbotId])

  // Load documents when corpus is selected
  useEffect(() => {
    if (uiState.selectedCorpus) {
      loadDocuments(uiState.selectedCorpus.id)
    }
  }, [uiState.selectedCorpus])

  const loadCorpora = async () => {
    try {
      setIsLoadingCorpora(true)
      setError(null)
      const corporaData = await getCorpora(chatbotId)
      setCorpora(corporaData)
      
      // Auto-select first corpus if available
      if (corporaData.length > 0 && !uiState.selectedCorpus) {
        setUIState(prev => ({ ...prev, selectedCorpus: corporaData[0] }))
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load corpora'
      setError(errorMessage)
      console.error('Failed to load corpora:', err)
    } finally {
      setIsLoadingCorpora(false)
    }
  }

  const loadDocuments = async (corpusId: string) => {
    try {
      setIsLoadingDocuments(true)
      const documentsData = await getDocuments(corpusId)
      setDocuments(documentsData)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load documents'
      console.error('Failed to load documents:', err)
    } finally {
      setIsLoadingDocuments(false)
    }
  }

  const handleCorpusSelect = (corpus: Corpus) => {
    setUIState(prev => ({ ...prev, selectedCorpus: corpus }))
  }

  const handleCorpusCreated = (newCorpus: Corpus) => {
    setCorpora(prev => [newCorpus, ...prev])
    setUIState(prev => ({ 
      ...prev, 
      selectedCorpus: newCorpus, 
      showCorpusCreator: false 
    }))
  }

  const handleCorpusUpdated = (updatedCorpus: Corpus) => {
    setCorpora(prev => prev.map(corpus => 
      corpus.id === updatedCorpus.id ? updatedCorpus : corpus
    ))
    
    if (uiState.selectedCorpus?.id === updatedCorpus.id) {
      setUIState(prev => ({ ...prev, selectedCorpus: updatedCorpus }))
    }
    
    setEditingCorpus(null)
  }

  const handleCorpusDeleted = (deletedCorpusId: string) => {
    setCorpora(prev => prev.filter(corpus => corpus.id !== deletedCorpusId))
    
    if (uiState.selectedCorpus?.id === deletedCorpusId) {
      setUIState(prev => ({ ...prev, selectedCorpus: undefined }))
      setDocuments([])
    }
  }

  const handleEditCorpus = (corpus: Corpus) => {
    setEditingCorpus(corpus)
  }

  const handleDocumentsUploaded = (uploadedDocuments: Document[]) => {
    // Refresh documents for the current corpus
    if (uiState.selectedCorpus) {
      loadDocuments(uiState.selectedCorpus.id)
      
      // Update corpus statistics
      loadCorpora()
    }
    
    // Close the upload dialog
    setUIState(prev => ({ ...prev, showDocumentUpload: false }))
  }


  const handleDocumentRefresh = () => {
    if (uiState.selectedCorpus) {
      loadDocuments(uiState.selectedCorpus.id)
      loadCorpora() // Update corpus stats
    }
  }


  return (
    <ErrorBoundary>
      <div className="space-y-4 sm:space-y-6 p-4 sm:p-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">RAG Management</h1>
          <p className="text-gray-600">Manage document corpora for {chatbotName}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button 
            onClick={() => setUIState(prev => ({ ...prev, showCorpusCreator: true }))}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Corpus
          </Button>
          {uiState.selectedCorpus && (
            <Button 
              variant="outline"
              onClick={() => setUIState(prev => ({ ...prev, showDocumentUpload: true }))}
              className="flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Upload Documents
            </Button>
          )}
        </div>
      </div>

      {/* Error State */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-red-700">{error}</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={loadCorpora}
              className="mt-2"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Corpora List */}
        <div className="lg:col-span-1 space-y-4 order-1 lg:order-none">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-semibold">Corpora</h2>
            <Badge variant="secondary">{corpora.length}</Badge>
          </div>
          
          <CorpusList
            corpora={corpora}
            selectedCorpusId={uiState.selectedCorpus?.id}
            onSelectCorpus={handleCorpusSelect}
            onEditCorpus={handleEditCorpus}
            onDeleteCorpus={handleCorpusDeleted}
            onRefresh={loadCorpora}
            isLoading={isLoadingCorpora}
          />
        </div>

        {/* Document Management */}
        <div className="lg:col-span-2 space-y-4 order-2 lg:order-none">
          {uiState.selectedCorpus ? (
            <>
              {/* Selected Corpus Info */}
              <Card className="lg:block">
                <CardHeader className="pb-3 sm:pb-4">
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <Database className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="truncate">{uiState.selectedCorpus.display_name}</span>
                  </CardTitle>
                  <CardDescription className="text-sm">
                    {uiState.selectedCorpus.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-sm">
                    <div className="flex items-center justify-between sm:block">
                      <span className="text-gray-500">Documents:</span>
                      <div className="font-medium">{uiState.selectedCorpus.document_count}</div>
                    </div>
                    <div className="flex items-center justify-between sm:block">
                      <span className="text-gray-500">Total Size:</span>
                      <div className="font-medium">{formatFileSize(uiState.selectedCorpus.total_size_bytes)}</div>
                    </div>
                    <div className="flex items-center justify-between sm:block">
                      <span className="text-gray-500">Created:</span>
                      <div className="font-medium">{new Date(uiState.selectedCorpus.created_at).toLocaleDateString()}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Document Library */}
              <DocumentLibrary
                documents={documents}
                isLoading={isLoadingDocuments}
                searchQuery={documentSearchQuery}
                onSearchChange={setDocumentSearchQuery}
                viewMode={documentViewMode}
                onViewModeChange={setDocumentViewMode}
                filterStatus={documentFilterStatus}
                onFilterStatusChange={setDocumentFilterStatus}
                sortBy={documentSortBy}
                onSortByChange={setDocumentSortBy}
                onRefresh={handleDocumentRefresh}
              />
            </>
          ) : (
            <Card className="h-96 flex items-center justify-center">
              <div className="text-center">
                <Database className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Select a corpus to view its documents</p>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Modals */}
      <CorpusCreator
        isOpen={uiState.showCorpusCreator}
        onClose={() => setUIState(prev => ({ ...prev, showCorpusCreator: false }))}
        chatbotId={chatbotId}
        onCorpusCreated={handleCorpusCreated}
      />

      <CorpusEditor
        corpus={editingCorpus}
        isOpen={!!editingCorpus}
        onClose={() => setEditingCorpus(null)}
        onCorpusUpdated={handleCorpusUpdated}
      />

      <DocumentUploader
        corpusId={uiState.selectedCorpus?.id}
        isOpen={uiState.showDocumentUpload}
        onClose={() => setUIState(prev => ({ ...prev, showDocumentUpload: false }))}
        onUploadComplete={handleDocumentsUploaded}
      />
      </div>
    </ErrorBoundary>
  )
}