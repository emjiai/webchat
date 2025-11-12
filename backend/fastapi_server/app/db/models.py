"""Database models for RAG corpus management."""

from typing import Optional, Dict, Any
from datetime import datetime
from uuid import UUID, uuid4
from sqlalchemy import String, Text, Integer, BigInteger, DateTime, Boolean, JSON, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID as PostgresUUID
from sqlalchemy import TypeDecorator, CHAR
from sqlalchemy.dialects import postgresql
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func
import enum

from .database import Base


class GUID(TypeDecorator):
    """Platform-independent GUID type.
    Uses PostgreSQL's UUID type, otherwise uses CHAR(32), storing as stringified hex values.
    """
    impl = CHAR
    cache_ok = True

    def load_dialect_impl(self, dialect):
        if dialect.name == 'postgresql':
            return dialect.type_descriptor(postgresql.UUID())
        else:
            return dialect.type_descriptor(CHAR(36))

    def process_bind_param(self, value, dialect):
        if value is None:
            return value
        elif dialect.name == 'postgresql':
            return str(value)
        else:
            if not isinstance(value, UUID):
                return str(UUID(value))
            return str(value)

    def process_result_value(self, value, dialect):
        if value is None:
            return value
        else:
            if not isinstance(value, UUID):
                return UUID(value)
            return value


class UploadStatusEnum(enum.Enum):
    """Upload status enumeration for database."""
    QUEUED = "queued"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class ChunkingStrategyEnum(enum.Enum):
    """Document chunking strategy enumeration for database."""
    AUTO = "auto"
    FIXED = "fixed"
    SEMANTIC = "semantic"


class RagCorpus(Base):
    """RAG Corpus model."""
    
    __tablename__ = "rag_corpora"
    
    # Primary key
    id: Mapped[UUID] = mapped_column(
        GUID(),
        primary_key=True,
        default=uuid4,
        index=True
    )
    
    # Vertex AI integration
    vertex_corpus_name: Mapped[str] = mapped_column(
        String(500),
        unique=True,
        index=True,
        comment="Vertex AI corpus resource name"
    )
    
    # Metadata
    display_name: Mapped[str] = mapped_column(
        String(100),
        index=True,
        comment="Human-readable corpus name"
    )
    description: Mapped[Optional[str]] = mapped_column(
        Text,
        comment="Corpus description"
    )
    chatbot_id: Mapped[str] = mapped_column(
        String(50),
        index=True,
        comment="Associated chatbot identifier"
    )
    
    # Configuration
    embedding_model: Mapped[str] = mapped_column(
        String(200),
        default="publishers/google/models/text-embedding-004",
        comment="Embedding model used"
    )
    
    # Statistics
    document_count: Mapped[int] = mapped_column(
        Integer,
        default=0,
        comment="Number of documents in corpus"
    )
    total_size_bytes: Mapped[int] = mapped_column(
        BigInteger,
        default=0,
        comment="Total size of all documents in bytes"
    )
    
    # Timestamps
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        comment="Creation timestamp"
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        comment="Last update timestamp"
    )
    
    # Relationships
    documents: Mapped[list["RagDocument"]] = relationship(
        "RagDocument",
        back_populates="corpus",
        cascade="all, delete-orphan"
    )
    upload_jobs: Mapped[list["UploadJob"]] = relationship(
        "UploadJob",
        back_populates="corpus",
        cascade="all, delete-orphan"
    )
    
    def __repr__(self) -> str:
        return f"<RagCorpus(id={self.id}, display_name='{self.display_name}')>"


class RagDocument(Base):
    """RAG Document model."""
    
    __tablename__ = "rag_documents"
    
    # Primary key
    id: Mapped[UUID] = mapped_column(
        GUID(),
        primary_key=True,
        default=uuid4,
        index=True
    )
    
    # Foreign key
    corpus_id: Mapped[UUID] = mapped_column(
        GUID(),
        nullable=False,
        index=True,
        comment="Parent corpus ID"
    )
    
    # Vertex AI integration
    vertex_file_name: Mapped[str] = mapped_column(
        String(500),
        unique=True,
        index=True,
        comment="Vertex AI file resource name"
    )
    
    # File metadata
    original_filename: Mapped[str] = mapped_column(
        String(255),
        comment="Original uploaded filename"
    )
    display_name: Mapped[str] = mapped_column(
        String(200),
        comment="Display name for the document"
    )
    file_size_bytes: Mapped[int] = mapped_column(
        BigInteger,
        comment="File size in bytes"
    )
    mime_type: Mapped[str] = mapped_column(
        String(100),
        comment="MIME type of the file"
    )
    
    # Processing status
    upload_status: Mapped[UploadStatusEnum] = mapped_column(
        SQLEnum(UploadStatusEnum),
        default=UploadStatusEnum.QUEUED,
        comment="Upload processing status"
    )
    error_message: Mapped[Optional[str]] = mapped_column(
        Text,
        comment="Error message if upload failed"
    )
    
    # Configuration
    chunking_strategy: Mapped[ChunkingStrategyEnum] = mapped_column(
        SQLEnum(ChunkingStrategyEnum),
        default=ChunkingStrategyEnum.AUTO,
        comment="Document chunking strategy used"
    )
    
    # Additional metadata
    doc_metadata: Mapped[Optional[Dict[str, Any]]] = mapped_column(
        JSON,
        comment="Additional document metadata"
    )
    
    # Timestamps
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        comment="Upload timestamp"
    )
    processed_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        comment="Processing completion timestamp"
    )
    
    # Relationships
    corpus: Mapped["RagCorpus"] = relationship(
        "RagCorpus",
        back_populates="documents"
    )
    
    def __repr__(self) -> str:
        return f"<RagDocument(id={self.id}, filename='{self.original_filename}')>"


class UploadJob(Base):
    """Upload Job tracking model."""
    
    __tablename__ = "upload_jobs"
    
    # Primary key
    id: Mapped[UUID] = mapped_column(
        GUID(),
        primary_key=True,
        default=uuid4,
        index=True
    )
    
    # Foreign key
    corpus_id: Mapped[UUID] = mapped_column(
        GUID(),
        nullable=False,
        index=True,
        comment="Target corpus ID"
    )
    
    # Job status
    status: Mapped[UploadStatusEnum] = mapped_column(
        SQLEnum(UploadStatusEnum),
        default=UploadStatusEnum.QUEUED,
        index=True,
        comment="Overall job status"
    )
    
    # Progress tracking
    total_files: Mapped[int] = mapped_column(
        Integer,
        comment="Total number of files to process"
    )
    processed_files: Mapped[int] = mapped_column(
        Integer,
        default=0,
        comment="Number of files processed"
    )
    successful_uploads: Mapped[int] = mapped_column(
        Integer,
        default=0,
        comment="Number of successful uploads"
    )
    failed_uploads: Mapped[int] = mapped_column(
        Integer,
        default=0,
        comment="Number of failed uploads"
    )
    
    # Error tracking
    errors: Mapped[Optional[Dict[str, Any]]] = mapped_column(
        JSON,
        comment="Error messages and details"
    )
    
    # Configuration
    chunking_strategy: Mapped[ChunkingStrategyEnum] = mapped_column(
        SQLEnum(ChunkingStrategyEnum),
        default=ChunkingStrategyEnum.AUTO,
        comment="Chunking strategy for all files in job"
    )
    job_metadata: Mapped[Optional[Dict[str, Any]]] = mapped_column(
        JSON,
        comment="Job-level metadata"
    )
    
    # Timestamps
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        comment="Job creation timestamp"
    )
    started_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        comment="Processing start timestamp"
    )
    completed_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        comment="Job completion timestamp"
    )
    
    # Relationships
    corpus: Mapped["RagCorpus"] = relationship(
        "RagCorpus",
        back_populates="upload_jobs"
    )
    
    @property
    def progress_percentage(self) -> float:
        """Calculate progress percentage."""
        if self.total_files == 0:
            return 0.0
        return (self.processed_files / self.total_files) * 100.0
    
    @property
    def is_active(self) -> bool:
        """Check if upload job is still active."""
        return self.status in [UploadStatusEnum.QUEUED, UploadStatusEnum.PROCESSING]
    
    @property
    def is_completed(self) -> bool:
        """Check if upload job is completed."""
        return self.status in [
            UploadStatusEnum.COMPLETED, 
            UploadStatusEnum.FAILED, 
            UploadStatusEnum.CANCELLED
        ]
    
    def __repr__(self) -> str:
        return f"<UploadJob(id={self.id}, status='{self.status}', progress={self.progress_percentage:.1f}%)>"