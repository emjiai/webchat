/**
 * TypeScript interfaces for RAG (Retrieval Augmented Generation) management
 * These interfaces match the backend API response models
 */

export type UploadStatus = 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled';
export type ChunkingStrategy = 'auto' | 'fixed' | 'semantic';

// Core RAG entities
export interface Corpus {
  id: string;
  vertex_corpus_name: string;
  display_name: string;
  description?: string;
  chatbot_id: string;
  document_count: number;
  total_size_bytes: number;
  embedding_model: string;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: string;
  corpus_id: string;
  vertex_file_name: string;
  original_filename: string;
  display_name: string;
  file_size_bytes: number;
  mime_type: string;
  file_type?: string;
  upload_status: UploadStatus;
  error_message?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
  processed_at?: string;
}

export interface UploadJob {
  id: string;
  corpus_id: string;
  status: UploadStatus;
  total_files: number;
  processed_files: number;
  successful_uploads: number;
  failed_uploads: number;
  progress_percentage: number;
  estimated_time_remaining?: number;
  errors: string[];
  created_at: string;
  started_at?: string;
  completed_at?: string;
}

// API Request types
export interface CreateCorpusRequest {
  display_name: string;
  description?: string;
  chatbot_id: string;
  embedding_model?: string;
}

export interface UpdateCorpusRequest {
  display_name?: string;
  description?: string;
}

export interface DocumentUploadRequest {
  corpus_id: string;
  display_name?: string;
  description?: string;
  chunking_strategy?: ChunkingStrategy;
  metadata?: Record<string, any>;
}

export interface BatchUploadRequest {
  corpus_id: string;
  chunking_strategy?: ChunkingStrategy;
  metadata?: Record<string, any>;
}

export interface DocumentSearchRequest {
  corpus_id: string;
  query: string;
  max_results?: number;
  min_relevance_score?: number;
  file_types?: string[];
}

// API Response types
export interface FileValidationError {
  filename: string;
  error_type: string;
  message: string;
}

export interface UploadValidationResponse {
  valid_files: string[];
  invalid_files: FileValidationError[];
  total_size_bytes: number;
  estimated_processing_time?: number;
}

export interface DocumentSearchResult {
  document_id: string;
  filename: string;
  relevance_score: number;
  snippet: string;
  chunk_index?: number;
  metadata?: Record<string, any>;
}

export interface DocumentSearchResponse {
  corpus_id: string;
  query: string;
  results: DocumentSearchResult[];
  total_results: number;
  processing_time_ms?: number;
}

export interface CorpusStats {
  corpus_id: string;
  document_count: number;
  total_size_bytes: number;
  total_chunks?: number;
  average_chunk_size?: number;
  embedding_dimensions?: number;
  last_updated: string;
  supported_file_types: string[];
}

// Component prop types
export interface RAGManagementProps {
  chatbotId: string;
  chatbotName: string;
}

export interface CorpusCardProps {
  corpus: Corpus;
  onEdit: (corpus: Corpus) => void;
  onDelete: (corpusId: string) => void;
  onSelect: (corpus: Corpus) => void;
  isSelected?: boolean;
}

export interface DocumentUploadProps {
  corpusId: string;
  onUploadComplete: (documents: Document[]) => void;
  onUploadProgress: (progress: UploadJob) => void;
  maxFileSize?: number;
  allowedFileTypes?: string[];
}

export interface DocumentLibraryProps {
  documents: Document[];
  isLoading?: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  filterStatus: string;
  onFilterStatusChange: (status: string) => void;
  sortBy: string;
  onSortByChange: (sortBy: string) => void;
  onRefresh: () => void;
}

export interface CorpusCreatorProps {
  chatbotId: string;
  isOpen: boolean;
  onClose: () => void;
  onCorpusCreated: (corpus: Corpus) => void;
}

// Hook return types
export interface UseRAGCorporaResult {
  corpora: Corpus[];
  isLoading: boolean;
  error: string | null;
  createCorpus: (data: CreateCorpusRequest) => Promise<Corpus>;
  updateCorpus: (id: string, data: UpdateCorpusRequest) => Promise<Corpus>;
  deleteCorpus: (id: string) => Promise<void>;
  refreshCorpora: () => Promise<void>;
}

export interface UseDocumentUploadResult {
  uploadDocument: (file: File, corpusId: string, options?: Partial<DocumentUploadRequest>) => Promise<Document>;
  batchUpload: (files: File[], corpusId: string, options?: Partial<BatchUploadRequest>) => Promise<UploadJob>;
  validateFiles: (files: File[], corpusId: string) => Promise<UploadValidationResponse>;
  uploadProgress: Record<string, number>;
  isUploading: boolean;
  uploadErrors: string[];
}

export interface UseCorpusDocumentsResult {
  documents: Document[];
  isLoading: boolean;
  error: string | null;
  deleteDocument: (documentId: string) => Promise<void>;
  searchDocuments: (query: string) => Promise<DocumentSearchResult[]>;
  refreshDocuments: () => Promise<void>;
}

// Error types
export interface RAGError {
  message: string;
  code?: string;
  context?: Record<string, any>;
}

export interface APIErrorResponse {
  message: string;
  error_code?: string;
  timestamp: string;
  context?: Record<string, any>;
}

// Configuration types
export interface RAGConfig {
  enabled: boolean;
  corpus_id?: string;
  max_results?: number;
  min_relevance_score?: number;
  show_citations?: boolean;
}

// File type constraints
export interface FileTypeConfig {
  maxSize: number; // in bytes
  allowedTypes: string[]; // MIME types
  maxBatchSize: number; // total bytes for batch upload
  maxFilesPerBatch: number; // number of files
}

export const DEFAULT_FILE_CONFIG: FileTypeConfig = {
  maxSize: 50 * 1024 * 1024, // 50MB
  allowedTypes: [
    'application/pdf',
    'text/plain',
    'text/markdown', 
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
    'text/csv',
    'application/json'
  ],
  maxBatchSize: 500 * 1024 * 1024, // 500MB
  maxFilesPerBatch: 100
};

// UI state types
export interface RAGUIState {
  selectedCorpus?: Corpus;
  showCorpusCreator: boolean;
  showDocumentUpload: boolean;
  uploadProgress: Record<string, UploadJob>;
  searchQuery: string;
  searchResults: DocumentSearchResult[];
  viewMode: 'grid' | 'list';
  sortBy: 'created_at' | 'name' | 'size' | 'status';
  sortOrder: 'asc' | 'desc';
}