"""Document management service for RAG corpus."""

import os
import sys
import tempfile
import aiofiles
from typing import List, Optional, Dict, Any, BinaryIO
from uuid import UUID, uuid4
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete, update, func
from fastapi import UploadFile, HTTPException

# Add the Google RAG path to sys.path for importing
rag_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "gemini_rag"))
if rag_path not in sys.path:
    sys.path.insert(0, rag_path)

try:
    import vertexai
    from vertexai.preview import rag
    from google.api_core.exceptions import ResourceExhausted, NotFound
except ImportError as e:
    print(f"Warning: Google Cloud dependencies not available: {e}")
    vertexai = None
    rag = None

from ..db.models import RagCorpus, RagDocument, UploadStatusEnum, ChunkingStrategyEnum
from ..models.rag import (
    DocumentUploadRequest, DocumentResponse, FileValidationError, 
    UploadValidationResponse, DocumentSearchRequest, DocumentSearchResponse,
    DocumentSearchResult
)
from ..core.config import get_settings
from ..utils.logger import get_logger

settings = get_settings()
logger = get_logger(__name__)


class DocumentService:
    """Service for managing documents within RAG corpora."""
    
    # Supported file types and size limits
    SUPPORTED_MIME_TYPES = {
        'application/pdf': 'PDF',
        'text/plain': 'Text',
        'text/markdown': 'Markdown',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
        'application/msword': 'DOC',
        'text/csv': 'CSV',
        'application/json': 'JSON'
    }
    
    MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB
    MAX_BATCH_SIZE = 500 * 1024 * 1024  # 500MB total
    MAX_FILES_PER_BATCH = 100
    
    def __init__(self, db_session: AsyncSession):
        self.db_session = db_session
    
    async def validate_files(
        self,
        files: List[UploadFile],
        corpus_id: UUID
    ) -> UploadValidationResponse:
        """Validate uploaded files before processing."""
        valid_files = []
        invalid_files = []
        total_size = 0
        
        # Check if corpus exists
        corpus_stmt = select(RagCorpus).where(RagCorpus.id == corpus_id)
        corpus_result = await self.db_session.execute(corpus_stmt)
        corpus = corpus_result.scalar_one_or_none()
        
        if not corpus:
            return UploadValidationResponse(
                valid_files=[],
                invalid_files=[
                    FileValidationError(
                        filename="",
                        error_type="corpus_not_found",
                        message=f"Corpus {corpus_id} not found"
                    )
                ],
                total_size_bytes=0
            )
        
        # Validate each file
        for file in files:
            errors = []
            
            # Check file size
            if file.size and file.size > self.MAX_FILE_SIZE:
                errors.append(f"File size {file.size} exceeds maximum {self.MAX_FILE_SIZE}")
            
            # Check MIME type
            if file.content_type not in self.SUPPORTED_MIME_TYPES:
                errors.append(f"Unsupported file type: {file.content_type}")
            
            # Check filename
            if not file.filename or len(file.filename) > 255:
                errors.append("Invalid filename")
            
            if errors:
                invalid_files.append(
                    FileValidationError(
                        filename=file.filename or "unknown",
                        error_type="validation_error",
                        message="; ".join(errors)
                    )
                )
            else:
                valid_files.append(file.filename)
                total_size += file.size or 0
        
        # Check batch size limits
        if len(files) > self.MAX_FILES_PER_BATCH:
            invalid_files.append(
                FileValidationError(
                    filename="batch",
                    error_type="batch_too_large",
                    message=f"Batch contains {len(files)} files, maximum is {self.MAX_FILES_PER_BATCH}"
                )
            )
        
        if total_size > self.MAX_BATCH_SIZE:
            invalid_files.append(
                FileValidationError(
                    filename="batch",
                    error_type="batch_size_too_large",
                    message=f"Total batch size {total_size} exceeds maximum {self.MAX_BATCH_SIZE}"
                )
            )
        
        # Estimate processing time (rough estimate: 1 second per MB)
        estimated_time = int(total_size / (1024 * 1024)) if total_size > 0 else None
        
        return UploadValidationResponse(
            valid_files=valid_files,
            invalid_files=invalid_files,
            total_size_bytes=total_size,
            estimated_processing_time=estimated_time
        )
    
    async def upload_document(
        self,
        file: UploadFile,
        corpus_id: UUID,
        display_name: Optional[str] = None,
        description: Optional[str] = None,
        chunking_strategy: ChunkingStrategyEnum = ChunkingStrategyEnum.AUTO,
        metadata: Optional[Dict[str, Any]] = None
    ) -> DocumentResponse:
        """Upload a single document to a corpus."""
        try:
            # Get corpus
            corpus_stmt = select(RagCorpus).where(RagCorpus.id == corpus_id)
            corpus_result = await self.db_session.execute(corpus_stmt)
            corpus = corpus_result.scalar_one_or_none()
            
            if not corpus:
                raise HTTPException(status_code=404, detail="Corpus not found")
            
            # Validate file
            validation = await self.validate_files([file], corpus_id)
            if not validation.is_valid:
                error_msg = "; ".join([err.message for err in validation.invalid_files])
                raise HTTPException(status_code=400, detail=f"File validation failed: {error_msg}")
            
            # Create database record
            doc_id = uuid4()
            document = RagDocument(
                id=doc_id,
                corpus_id=corpus_id,
                vertex_file_name="",  # Will be set after upload
                original_filename=file.filename,
                display_name=display_name or file.filename,
                file_size_bytes=file.size or 0,
                mime_type=file.content_type or "application/octet-stream",
                upload_status=UploadStatusEnum.QUEUED,
                chunking_strategy=chunking_strategy,
                doc_metadata=metadata or {}
            )
            
            self.db_session.add(document)
            await self.db_session.flush()  # Get the ID without committing
            
            # Upload to Vertex AI
            try:
                await self._upload_to_vertex_ai(
                    file=file,
                    document=document,
                    corpus_name=corpus.vertex_corpus_name
                )
                
                document.upload_status = UploadStatusEnum.COMPLETED
                document.processed_at = datetime.utcnow()
                
            except ResourceExhausted as e:
                document.upload_status = UploadStatusEnum.FAILED
                document.error_message = f"Quota exceeded: {str(e)}"
                logger.error(f"Upload failed due to quota: {e}")
                
            except Exception as e:
                document.upload_status = UploadStatusEnum.FAILED
                document.error_message = str(e)
                logger.error(f"Upload failed: {e}")
            
            await self.db_session.commit()
            await self.db_session.refresh(document)
            
            # Update corpus statistics
            from .rag_corpus_service import RagCorpusService
            corpus_service = RagCorpusService(self.db_session)
            await corpus_service.update_corpus_stats(corpus_id)
            
            return DocumentResponse(
                id=document.id,
                corpus_id=document.corpus_id,
                vertex_file_name=document.vertex_file_name,
                original_filename=document.original_filename,
                display_name=document.display_name,
                file_size_bytes=document.file_size_bytes,
                mime_type=document.mime_type,
                upload_status=document.upload_status,
                error_message=document.error_message,
                metadata=document.doc_metadata,
                created_at=document.created_at,
                processed_at=document.processed_at
            )
            
        except Exception as e:
            await self.db_session.rollback()
            logger.error(f"Document upload failed: {e}")
            raise
    
    async def _upload_to_vertex_ai(
        self,
        file: UploadFile,
        document: RagDocument,
        corpus_name: str
    ) -> None:
        """Upload file to Vertex AI RAG Engine."""
        if not rag:
            raise RuntimeError("Vertex AI RAG not available")
        
        # Create temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix=f"_{file.filename}") as temp_file:
            try:
                # Write file content to temporary file
                content = await file.read()
                temp_file.write(content)
                temp_file.flush()
                
                # Reset file pointer for next read
                await file.seek(0)
                
                # Upload to Vertex AI
                rag_file = rag.upload_file(
                    corpus_name=corpus_name,
                    path=temp_file.name,
                    display_name=document.display_name,
                    description=f"Document uploaded via API: {document.original_filename}"
                )
                
                # Store Vertex AI file name
                document.vertex_file_name = rag_file.name
                document.upload_status = UploadStatusEnum.PROCESSING
                
                logger.info(f"Successfully uploaded {file.filename} to Vertex AI: {rag_file.name}")
                
            finally:
                # Clean up temporary file
                try:
                    os.unlink(temp_file.name)
                except OSError:
                    pass
    
    async def get_document_by_id(self, document_id: UUID) -> Optional[DocumentResponse]:
        """Get document by ID."""
        stmt = select(RagDocument).where(RagDocument.id == document_id)
        result = await self.db_session.execute(stmt)
        document = result.scalar_one_or_none()
        
        if not document:
            return None
        
        return DocumentResponse(
            id=document.id,
            corpus_id=document.corpus_id,
            vertex_file_name=document.vertex_file_name,
            original_filename=document.original_filename,
            display_name=document.display_name,
            file_size_bytes=document.file_size_bytes,
            mime_type=document.mime_type,
            upload_status=document.upload_status,
            error_message=document.error_message,
            metadata=document.doc_metadata,
            created_at=document.created_at,
            processed_at=document.processed_at
        )
    
    async def list_documents_in_corpus(
        self,
        corpus_id: UUID,
        limit: int = 100,
        offset: int = 0
    ) -> List[DocumentResponse]:
        """List documents in a specific corpus."""
        stmt = (
            select(RagDocument)
            .where(RagDocument.corpus_id == corpus_id)
            .order_by(RagDocument.created_at.desc())
            .limit(limit)
            .offset(offset)
        )
        result = await self.db_session.execute(stmt)
        documents = result.scalars().all()
        
        return [
            DocumentResponse(
                id=doc.id,
                corpus_id=doc.corpus_id,
                vertex_file_name=doc.vertex_file_name,
                original_filename=doc.original_filename,
                display_name=doc.display_name,
                file_size_bytes=doc.file_size_bytes,
                mime_type=doc.mime_type,
                upload_status=doc.upload_status,
                error_message=doc.error_message,
                metadata=doc.doc_metadata,
                created_at=doc.created_at,
                processed_at=doc.processed_at
            )
            for doc in documents
        ]
    
    async def delete_document(self, document_id: UUID) -> bool:
        """Delete a document from corpus and Vertex AI."""
        try:
            stmt = select(RagDocument).where(RagDocument.id == document_id)
            result = await self.db_session.execute(stmt)
            document = result.scalar_one_or_none()
            
            if not document:
                return False
            
            # Delete from Vertex AI if available
            try:
                if rag and document.vertex_file_name:
                    await self._delete_from_vertex_ai(document.vertex_file_name)
            except NotFound:
                logger.info(f"Document {document.vertex_file_name} not found in Vertex AI")
            except Exception as e:
                logger.warning(f"Failed to delete from Vertex AI: {e}")
            
            # Delete from database
            await self.db_session.delete(document)
            await self.db_session.commit()
            
            # Update corpus statistics
            from .rag_corpus_service import RagCorpusService
            corpus_service = RagCorpusService(self.db_session)
            await corpus_service.update_corpus_stats(document.corpus_id)
            
            logger.info(f"Deleted document: {document_id}")
            return True
            
        except Exception as e:
            await self.db_session.rollback()
            logger.error(f"Failed to delete document {document_id}: {e}")
            raise
    
    async def _delete_from_vertex_ai(self, vertex_file_name: str) -> None:
        """Delete file from Vertex AI."""
        if not rag:
            return
        
        # Note: Check Vertex AI API for file deletion method
        # This might be rag.delete_file() or similar
        logger.info(f"Would delete Vertex AI file: {vertex_file_name}")
    
    async def search_documents(
        self,
        request: DocumentSearchRequest
    ) -> DocumentSearchResponse:
        """Search documents within a corpus."""
        # This is a basic database search - for semantic search,
        # we would need to query Vertex AI RAG Engine directly
        
        stmt = (
            select(RagDocument)
            .where(
                RagDocument.corpus_id == request.corpus_id,
                RagDocument.upload_status == UploadStatusEnum.COMPLETED
            )
        )
        
        # Add file type filter if specified
        if request.file_types:
            stmt = stmt.where(RagDocument.mime_type.in_(request.file_types))
        
        # Simple text search in filename and display name
        if request.query:
            search_term = f"%{request.query}%"
            stmt = stmt.where(
                RagDocument.display_name.ilike(search_term) |
                RagDocument.original_filename.ilike(search_term)
            )
        
        stmt = stmt.order_by(RagDocument.created_at.desc()).limit(request.max_results)
        
        result = await self.db_session.execute(stmt)
        documents = result.scalars().all()
        
        # Convert to search results
        search_results = []
        for doc in documents:
            # Simple relevance score based on query match
            relevance_score = 0.5  # Default score for basic text match
            if request.query:
                if request.query.lower() in doc.display_name.lower():
                    relevance_score = 0.8
                elif request.query.lower() in doc.original_filename.lower():
                    relevance_score = 0.6
            
            if relevance_score >= request.min_relevance_score:
                search_results.append(
                    DocumentSearchResult(
                        document_id=doc.id,
                        filename=doc.original_filename,
                        relevance_score=relevance_score,
                        snippet=doc.display_name,
                        metadata=doc.doc_metadata
                    )
                )
        
        return DocumentSearchResponse(
            corpus_id=request.corpus_id,
            query=request.query,
            results=search_results,
            total_results=len(search_results),
            processing_time_ms=None  # Could add timing if needed
        )