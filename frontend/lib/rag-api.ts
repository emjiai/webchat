/**
 * RAG API service layer for frontend-backend communication
 * Handles all RAG corpus and document management operations
 */

import {
  Corpus,
  Document,
  UploadJob,
  CreateCorpusRequest,
  UpdateCorpusRequest,
  DocumentUploadRequest,
  BatchUploadRequest,
  DocumentSearchRequest,
  DocumentSearchResponse,
  UploadValidationResponse,
  CorpusStats,
  APIErrorResponse,
  RAGError
} from '@/types/rag';

// Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const RAG_API_PREFIX = '/api/v1/rag';

// Development API key - in production this would come from auth context
const DEV_API_KEY = 'dev_key_12345';

/**
 * Get API headers with authentication
 */
function getHeaders(includeAuth: boolean = true): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (includeAuth) {
    headers['Authorization'] = `Bearer ${DEV_API_KEY}`;
  }

  return headers;
}

/**
 * Handle API responses and extract data
 */
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    
    try {
      const errorData: APIErrorResponse = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch {
      // If we can't parse error JSON, use the basic HTTP error
    }

    const error: RAGError = {
      message: errorMessage,
      code: response.status.toString(),
      context: { status: response.status, statusText: response.statusText }
    };
    
    throw error;
  }

  // Handle empty responses (like DELETE operations)
  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return null as T;
  }

  try {
    return await response.json();
  } catch (error) {
    throw new Error('Failed to parse API response');
  }
}

/**
 * Handle multipart form data uploads
 */
async function handleFormResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.detail || errorMessage;
    } catch {
      // If we can't parse error JSON, use the basic HTTP error
    }

    throw new Error(errorMessage);
  }

  return await response.json();
}

// ========== CORPUS MANAGEMENT ==========

/**
 * Create a new RAG corpus
 */
export async function createCorpus(data: CreateCorpusRequest): Promise<Corpus> {
  const response = await fetch(`${API_BASE_URL}${RAG_API_PREFIX}/corpus/create`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });

  return handleResponse<Corpus>(response);
}

/**
 * Get all corpora for a specific chatbot
 */
export async function getCorpora(chatbotId?: string): Promise<Corpus[]> {
  const url = new URL(`${API_BASE_URL}${RAG_API_PREFIX}/corpus/list`);
  if (chatbotId) {
    url.searchParams.append('chatbot_id', chatbotId);
  }

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: getHeaders(),
  });

  return handleResponse<Corpus[]>(response);
}

/**
 * Get corpus details by ID
 */
export async function getCorpus(corpusId: string): Promise<Corpus> {
  const response = await fetch(`${API_BASE_URL}${RAG_API_PREFIX}/corpus/${corpusId}`, {
    method: 'GET',
    headers: getHeaders(),
  });

  return handleResponse<Corpus>(response);
}

/**
 * Update corpus metadata
 */
export async function updateCorpus(corpusId: string, data: UpdateCorpusRequest): Promise<Corpus> {
  const response = await fetch(`${API_BASE_URL}${RAG_API_PREFIX}/corpus/${corpusId}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });

  return handleResponse<Corpus>(response);
}

/**
 * Delete a corpus and all its documents
 */
export async function deleteCorpus(corpusId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}${RAG_API_PREFIX}/corpus/${corpusId}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });

  await handleResponse<void>(response);
}

/**
 * Get detailed corpus statistics
 */
export async function getCorpusStats(corpusId: string): Promise<CorpusStats> {
  const response = await fetch(`${API_BASE_URL}${RAG_API_PREFIX}/corpus/${corpusId}/stats`, {
    method: 'GET',
    headers: getHeaders(),
  });

  return handleResponse<CorpusStats>(response);
}

// ========== DOCUMENT MANAGEMENT ==========

/**
 * Validate files before upload
 */
export async function validateFiles(files: File[], corpusId: string): Promise<UploadValidationResponse> {
  const formData = new FormData();
  formData.append('corpus_id', corpusId);
  
  files.forEach(file => {
    formData.append('files', file);
  });

  const response = await fetch(`${API_BASE_URL}${RAG_API_PREFIX}/documents/validate`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${DEV_API_KEY}`,
    },
    body: formData,
  });

  return handleFormResponse<UploadValidationResponse>(response);
}

/**
 * Upload a single document
 */
export async function uploadDocument(
  file: File, 
  corpusId: string, 
  options: Partial<DocumentUploadRequest> = {}
): Promise<Document> {
  const formData = new FormData();
  formData.append('corpus_id', corpusId);
  formData.append('file', file);
  
  if (options.display_name) {
    formData.append('display_name', options.display_name);
  }
  if (options.description) {
    formData.append('description', options.description);
  }
  if (options.chunking_strategy) {
    formData.append('chunking_strategy', options.chunking_strategy);
  }

  const response = await fetch(`${API_BASE_URL}${RAG_API_PREFIX}/documents/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${DEV_API_KEY}`,
    },
    body: formData,
  });

  return handleFormResponse<Document>(response);
}

/**
 * Upload multiple documents in batch
 */
export async function batchUploadDocuments(
  files: File[], 
  corpusId: string, 
  options: Partial<BatchUploadRequest> = {}
): Promise<{ message: string; results: Array<{ filename: string; document_id?: string; status: string; error?: string }> }> {
  const formData = new FormData();
  formData.append('corpus_id', corpusId);
  
  files.forEach(file => {
    formData.append('files', file);
  });
  
  if (options.chunking_strategy) {
    formData.append('chunking_strategy', options.chunking_strategy);
  }

  const response = await fetch(`${API_BASE_URL}${RAG_API_PREFIX}/documents/batch-upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${DEV_API_KEY}`,
    },
    body: formData,
  });

  return handleFormResponse<{ message: string; results: Array<{ filename: string; document_id?: string; status: string; error?: string }> }>(response);
}

/**
 * Get all documents in a corpus
 */
export async function getDocuments(
  corpusId: string, 
  limit: number = 100, 
  offset: number = 0
): Promise<Document[]> {
  const url = new URL(`${API_BASE_URL}${RAG_API_PREFIX}/documents/${corpusId}`);
  url.searchParams.append('limit', limit.toString());
  url.searchParams.append('offset', offset.toString());

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: getHeaders(),
  });

  return handleResponse<Document[]>(response);
}

/**
 * Get document details by ID
 */
export async function getDocument(documentId: string): Promise<Document> {
  const response = await fetch(`${API_BASE_URL}${RAG_API_PREFIX}/documents/file/${documentId}`, {
    method: 'GET',
    headers: getHeaders(),
  });

  return handleResponse<Document>(response);
}

/**
 * Delete a document
 */
export async function deleteDocument(documentId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}${RAG_API_PREFIX}/documents/file/${documentId}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });

  await handleResponse<void>(response);
}

/**
 * Search documents within a corpus
 */
export async function searchDocuments(searchParams: DocumentSearchRequest): Promise<DocumentSearchResponse> {
  const response = await fetch(`${API_BASE_URL}${RAG_API_PREFIX}/documents/search`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(searchParams),
  });

  return handleResponse<DocumentSearchResponse>(response);
}

// ========== UTILITY FUNCTIONS ==========

/**
 * Format file size in human readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Get file type display name from MIME type
 */
export function getFileTypeDisplay(mimeType: string): string {
  const typeMap: Record<string, string> = {
    'application/pdf': 'PDF',
    'text/plain': 'Text',
    'text/markdown': 'Markdown',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word Document',
    'application/msword': 'Word Document',
    'text/csv': 'CSV',
    'application/json': 'JSON'
  };

  return typeMap[mimeType] || 'Unknown';
}

/**
 * Check if file type is supported
 */
export function isFileTypeSupported(mimeType: string): boolean {
  const supportedTypes = [
    'application/pdf',
    'text/plain',
    'text/markdown',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
    'text/csv',
    'application/json'
  ];

  return supportedTypes.includes(mimeType);
}

/**
 * Validate file before upload
 */
export function validateFile(file: File): { valid: boolean; error?: string } {
  const MAX_SIZE = 50 * 1024 * 1024; // 50MB
  
  if (!isFileTypeSupported(file.type)) {
    return {
      valid: false,
      error: `File type ${file.type} is not supported. Supported types: PDF, Text, Word documents, CSV, JSON, Markdown.`
    };
  }

  if (file.size > MAX_SIZE) {
    return {
      valid: false,
      error: `File size ${formatFileSize(file.size)} exceeds maximum allowed size of ${formatFileSize(MAX_SIZE)}.`
    };
  }

  return { valid: true };
}

/**
 * Get upload status display color
 */
export function getUploadStatusColor(status: string): string {
  switch (status) {
    case 'completed':
      return 'text-green-600 bg-green-100';
    case 'processing':
      return 'text-blue-600 bg-blue-100';
    case 'queued':
      return 'text-yellow-600 bg-yellow-100';
    case 'failed':
      return 'text-red-600 bg-red-100';
    case 'cancelled':
      return 'text-gray-600 bg-gray-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
}

/**
 * Calculate upload progress percentage
 */
export function calculateProgress(processed: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((processed / total) * 100);
}

/**
 * Estimate remaining time for upload
 */
export function estimateRemainingTime(
  startTime: Date,
  processed: number,
  total: number
): number | null {
  if (processed === 0) return null;

  const elapsed = Date.now() - startTime.getTime();
  const averageTimePerItem = elapsed / processed;
  const remaining = total - processed;

  return Math.round((remaining * averageTimePerItem) / 1000); // in seconds
}