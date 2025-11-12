"""Data models for RAG corpus management."""

from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum
from pydantic import BaseModel, Field, validator
from uuid import UUID, uuid4


class UploadStatus(str, Enum):
    """Upload status enumeration."""
    QUEUED = "queued"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class ChunkingStrategy(str, Enum):
    """Document chunking strategy enumeration."""
    AUTO = "auto"
    FIXED = "fixed"
    SEMANTIC = "semantic"


class CorpusCreateRequest(BaseModel):
    """Request model for creating a new corpus."""
    
    display_name: str = Field(..., min_length=1, max_length=100, description="Human-readable corpus name")
    description: Optional[str] = Field(None, max_length=500, description="Corpus description")
    chatbot_id: str = Field(..., description="Associated chatbot ID")
    embedding_model: str = Field(default="publishers/google/models/text-embedding-004", description="Embedding model to use")
    
    @validator('display_name')
    def validate_display_name(cls, v):
        if not v.strip():
            raise ValueError('Display name cannot be empty or only whitespace')
        return v.strip()


class CorpusUpdateRequest(BaseModel):
    """Request model for updating corpus metadata."""
    
    display_name: Optional[str] = Field(None, min_length=1, max_length=100, description="Updated corpus name")
    description: Optional[str] = Field(None, max_length=500, description="Updated corpus description")
    
    @validator('display_name')
    def validate_display_name(cls, v):
        if v is not None and not v.strip():
            raise ValueError('Display name cannot be empty or only whitespace')
        return v.strip() if v else v


class CorpusResponse(BaseModel):
    """Response model for corpus information."""
    
    id: UUID = Field(..., description="Corpus UUID")
    vertex_corpus_name: str = Field(..., description="Vertex AI corpus resource name")
    display_name: str = Field(..., description="Human-readable corpus name")
    description: Optional[str] = Field(None, description="Corpus description")
    chatbot_id: str = Field(..., description="Associated chatbot ID")
    document_count: int = Field(default=0, description="Number of documents in corpus")
    total_size_bytes: int = Field(default=0, description="Total size of all documents")
    embedding_model: str = Field(..., description="Embedding model used")
    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")


class DocumentUploadRequest(BaseModel):
    """Request model for document upload."""
    
    corpus_id: UUID = Field(..., description="Target corpus ID")
    display_name: Optional[str] = Field(None, max_length=200, description="Custom display name for document")
    description: Optional[str] = Field(None, max_length=500, description="Document description")
    chunking_strategy: ChunkingStrategy = Field(default=ChunkingStrategy.AUTO, description="Chunking strategy")
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Additional metadata")


class DocumentResponse(BaseModel):
    """Response model for document information."""
    
    id: UUID = Field(..., description="Document UUID")
    corpus_id: UUID = Field(..., description="Parent corpus ID")
    vertex_file_name: str = Field(..., description="Vertex AI file resource name")
    original_filename: str = Field(..., description="Original filename")
    display_name: str = Field(..., description="Display name")
    file_size_bytes: int = Field(..., description="File size in bytes")
    mime_type: str = Field(..., description="MIME type")
    upload_status: UploadStatus = Field(..., description="Upload processing status")
    error_message: Optional[str] = Field(None, description="Error message if upload failed")
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Additional metadata")
    created_at: datetime = Field(..., description="Upload timestamp")
    processed_at: Optional[datetime] = Field(None, description="Processing completion timestamp")


class BatchUploadRequest(BaseModel):
    """Request model for batch document upload."""
    
    corpus_id: UUID = Field(..., description="Target corpus ID")
    chunking_strategy: ChunkingStrategy = Field(default=ChunkingStrategy.AUTO, description="Chunking strategy")
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Additional metadata for all files")


class UploadJobResponse(BaseModel):
    """Response model for upload job status."""
    
    id: UUID = Field(..., description="Upload job UUID")
    corpus_id: UUID = Field(..., description="Target corpus ID")
    status: UploadStatus = Field(..., description="Overall job status")
    total_files: int = Field(..., description="Total number of files to process")
    processed_files: int = Field(default=0, description="Number of files processed")
    successful_uploads: int = Field(default=0, description="Number of successful uploads")
    failed_uploads: int = Field(default=0, description="Number of failed uploads")
    progress_percentage: float = Field(default=0.0, description="Progress percentage (0-100)")
    estimated_time_remaining: Optional[int] = Field(None, description="Estimated time remaining in seconds")
    errors: List[str] = Field(default_factory=list, description="Error messages")
    created_at: datetime = Field(..., description="Job creation timestamp")
    started_at: Optional[datetime] = Field(None, description="Processing start timestamp")
    completed_at: Optional[datetime] = Field(None, description="Job completion timestamp")
    
    @property
    def is_active(self) -> bool:
        """Check if upload job is still active."""
        return self.status in [UploadStatus.QUEUED, UploadStatus.PROCESSING]
    
    @property
    def is_completed(self) -> bool:
        """Check if upload job is completed (success or failure)."""
        return self.status in [UploadStatus.COMPLETED, UploadStatus.FAILED, UploadStatus.CANCELLED]


class FileValidationError(BaseModel):
    """File validation error details."""
    
    filename: str = Field(..., description="Name of the problematic file")
    error_type: str = Field(..., description="Type of validation error")
    message: str = Field(..., description="Detailed error message")


class UploadValidationResponse(BaseModel):
    """Response model for upload validation."""
    
    valid_files: List[str] = Field(default_factory=list, description="List of valid filenames")
    invalid_files: List[FileValidationError] = Field(default_factory=list, description="List of validation errors")
    total_size_bytes: int = Field(..., description="Total size of valid files")
    estimated_processing_time: Optional[int] = Field(None, description="Estimated processing time in seconds")
    
    @property
    def is_valid(self) -> bool:
        """Check if all files passed validation."""
        return len(self.invalid_files) == 0 and len(self.valid_files) > 0


class CorpusStatsResponse(BaseModel):
    """Response model for corpus statistics."""
    
    corpus_id: UUID = Field(..., description="Corpus UUID")
    document_count: int = Field(..., description="Number of documents")
    total_size_bytes: int = Field(..., description="Total size of all documents")
    total_chunks: Optional[int] = Field(None, description="Total number of text chunks")
    average_chunk_size: Optional[float] = Field(None, description="Average chunk size in characters")
    embedding_dimensions: Optional[int] = Field(None, description="Embedding vector dimensions")
    last_updated: datetime = Field(..., description="Last corpus update timestamp")
    supported_file_types: List[str] = Field(default_factory=list, description="Supported file MIME types")


class DocumentSearchRequest(BaseModel):
    """Request model for searching documents within a corpus."""
    
    corpus_id: UUID = Field(..., description="Corpus to search in")
    query: str = Field(..., min_length=1, max_length=500, description="Search query")
    max_results: int = Field(default=10, ge=1, le=50, description="Maximum number of results")
    min_relevance_score: float = Field(default=0.0, ge=0.0, le=1.0, description="Minimum relevance score")
    file_types: Optional[List[str]] = Field(None, description="Filter by file types")
    
    @validator('query')
    def validate_query(cls, v):
        if not v.strip():
            raise ValueError('Search query cannot be empty or only whitespace')
        return v.strip()


class DocumentSearchResult(BaseModel):
    """Individual document search result."""
    
    document_id: UUID = Field(..., description="Document UUID")
    filename: str = Field(..., description="Document filename")
    relevance_score: float = Field(..., description="Relevance score (0.0 to 1.0)")
    snippet: str = Field(..., description="Relevant content snippet")
    chunk_index: Optional[int] = Field(None, description="Index of the matching chunk")
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Document metadata")


class DocumentSearchResponse(BaseModel):
    """Response model for document search."""
    
    corpus_id: UUID = Field(..., description="Searched corpus ID")
    query: str = Field(..., description="Original search query")
    results: List[DocumentSearchResult] = Field(default_factory=list, description="Search results")
    total_results: int = Field(..., description="Total number of matching results")
    processing_time_ms: Optional[int] = Field(None, description="Search processing time")