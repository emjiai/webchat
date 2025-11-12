"""RAG Corpus management service."""

import os
import sys
from typing import List, Optional, Dict, Any
from uuid import UUID, uuid4
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete, update, func
from sqlalchemy.orm import selectinload

# Add the Google RAG path to sys.path for importing
rag_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "gemini_rag"))
if rag_path not in sys.path:
    sys.path.insert(0, rag_path)

try:
    import vertexai
    from vertexai.preview import rag
    from google.auth import default
except ImportError as e:
    print(f"Warning: Google Cloud dependencies not available: {e}")
    vertexai = None
    rag = None

from ..db.models import RagCorpus, RagDocument, UploadJob, UploadStatusEnum
from ..models.rag import CorpusCreateRequest, CorpusUpdateRequest, CorpusResponse, CorpusStatsResponse
from ..core.config import get_settings
from ..utils.logger import get_logger

settings = get_settings()
logger = get_logger(__name__)


class RagCorpusService:
    """Service for managing RAG corpora."""
    
    def __init__(self, db_session: AsyncSession):
        self.db_session = db_session
        self._initialize_vertex_ai()
    
    def _initialize_vertex_ai(self) -> None:
        """Initialize Vertex AI with project configuration."""
        if not vertexai or not settings.google_cloud_project:
            logger.warning("Vertex AI not configured - some features will be unavailable")
            return
            
        try:
            credentials, _ = default()
            vertexai.init(
                project=settings.google_cloud_project,
                location=settings.google_cloud_location,
                credentials=credentials
            )
            logger.info(f"Initialized Vertex AI for project: {settings.google_cloud_project}")
        except Exception as e:
            logger.error(f"Failed to initialize Vertex AI: {e}")
    
    async def create_corpus(self, request: CorpusCreateRequest) -> CorpusResponse:
        """Create a new RAG corpus."""
        try:
            # Create corpus in Vertex AI first
            vertex_corpus = await self._create_vertex_corpus(
                display_name=request.display_name,
                description=request.description,
                embedding_model=request.embedding_model
            )
            
            # Create database record
            db_corpus = RagCorpus(
                id=uuid4(),
                vertex_corpus_name=vertex_corpus.name,
                display_name=request.display_name,
                description=request.description,
                chatbot_id=request.chatbot_id,
                embedding_model=request.embedding_model,
                document_count=0,
                total_size_bytes=0
            )
            
            self.db_session.add(db_corpus)
            await self.db_session.commit()
            await self.db_session.refresh(db_corpus)
            
            logger.info(f"Created RAG corpus: {db_corpus.id} -> {vertex_corpus.name}")
            
            return CorpusResponse(
                id=db_corpus.id,
                vertex_corpus_name=db_corpus.vertex_corpus_name,
                display_name=db_corpus.display_name,
                description=db_corpus.description,
                chatbot_id=db_corpus.chatbot_id,
                document_count=db_corpus.document_count,
                total_size_bytes=db_corpus.total_size_bytes,
                embedding_model=db_corpus.embedding_model,
                created_at=db_corpus.created_at,
                updated_at=db_corpus.updated_at
            )
            
        except Exception as e:
            await self.db_session.rollback()
            logger.error(f"Failed to create corpus: {e}")
            raise
    
    async def _create_vertex_corpus(
        self,
        display_name: str,
        description: Optional[str] = None,
        embedding_model: str = "publishers/google/models/text-embedding-004"
    ) -> Any:
        """Create corpus in Vertex AI RAG Engine."""
        if not rag:
            raise RuntimeError("Vertex AI RAG not available")
        
        embedding_model_config = rag.EmbeddingModelConfig(
            publisher_model=embedding_model
        )
        
        corpus = rag.create_corpus(
            display_name=display_name,
            description=description or f"Corpus for {display_name}",
            embedding_model_config=embedding_model_config,
        )
        
        return corpus
    
    async def get_corpus_by_id(self, corpus_id: UUID) -> Optional[CorpusResponse]:
        """Get corpus by ID."""
        stmt = select(RagCorpus).where(RagCorpus.id == corpus_id)
        result = await self.db_session.execute(stmt)
        corpus = result.scalar_one_or_none()
        
        if not corpus:
            return None
        
        return CorpusResponse(
            id=corpus.id,
            vertex_corpus_name=corpus.vertex_corpus_name,
            display_name=corpus.display_name,
            description=corpus.description,
            chatbot_id=corpus.chatbot_id,
            document_count=corpus.document_count,
            total_size_bytes=corpus.total_size_bytes,
            embedding_model=corpus.embedding_model,
            created_at=corpus.created_at,
            updated_at=corpus.updated_at
        )
    
    async def get_corpora_by_chatbot(self, chatbot_id: str) -> List[CorpusResponse]:
        """Get all corpora for a specific chatbot."""
        stmt = (
            select(RagCorpus)
            .where(RagCorpus.chatbot_id == chatbot_id)
            .order_by(RagCorpus.created_at.desc())
        )
        result = await self.db_session.execute(stmt)
        corpora = result.scalars().all()
        
        return [
            CorpusResponse(
                id=corpus.id,
                vertex_corpus_name=corpus.vertex_corpus_name,
                display_name=corpus.display_name,
                description=corpus.description,
                chatbot_id=corpus.chatbot_id,
                document_count=corpus.document_count,
                total_size_bytes=corpus.total_size_bytes,
                embedding_model=corpus.embedding_model,
                created_at=corpus.created_at,
                updated_at=corpus.updated_at
            )
            for corpus in corpora
        ]
    
    async def list_all_corpora(
        self,
        limit: int = 100,
        offset: int = 0
    ) -> List[CorpusResponse]:
        """List all corpora with pagination."""
        stmt = (
            select(RagCorpus)
            .order_by(RagCorpus.created_at.desc())
            .limit(limit)
            .offset(offset)
        )
        result = await self.db_session.execute(stmt)
        corpora = result.scalars().all()
        
        return [
            CorpusResponse(
                id=corpus.id,
                vertex_corpus_name=corpus.vertex_corpus_name,
                display_name=corpus.display_name,
                description=corpus.description,
                chatbot_id=corpus.chatbot_id,
                document_count=corpus.document_count,
                total_size_bytes=corpus.total_size_bytes,
                embedding_model=corpus.embedding_model,
                created_at=corpus.created_at,
                updated_at=corpus.updated_at
            )
            for corpus in corpora
        ]
    
    async def update_corpus(
        self,
        corpus_id: UUID,
        request: CorpusUpdateRequest
    ) -> Optional[CorpusResponse]:
        """Update corpus metadata."""
        stmt = select(RagCorpus).where(RagCorpus.id == corpus_id)
        result = await self.db_session.execute(stmt)
        corpus = result.scalar_one_or_none()
        
        if not corpus:
            return None
        
        # Update database record
        if request.display_name is not None:
            corpus.display_name = request.display_name
        if request.description is not None:
            corpus.description = request.description
        
        corpus.updated_at = datetime.utcnow()
        
        await self.db_session.commit()
        await self.db_session.refresh(corpus)
        
        logger.info(f"Updated corpus: {corpus_id}")
        
        return CorpusResponse(
            id=corpus.id,
            vertex_corpus_name=corpus.vertex_corpus_name,
            display_name=corpus.display_name,
            description=corpus.description,
            chatbot_id=corpus.chatbot_id,
            document_count=corpus.document_count,
            total_size_bytes=corpus.total_size_bytes,
            embedding_model=corpus.embedding_model,
            created_at=corpus.created_at,
            updated_at=corpus.updated_at
        )
    
    async def delete_corpus(self, corpus_id: UUID) -> bool:
        """Delete a corpus and all its documents."""
        try:
            # Get corpus first
            stmt = (
                select(RagCorpus)
                .options(selectinload(RagCorpus.documents))
                .where(RagCorpus.id == corpus_id)
            )
            result = await self.db_session.execute(stmt)
            corpus = result.scalar_one_or_none()
            
            if not corpus:
                return False
            
            # Delete from Vertex AI if available
            try:
                if rag:
                    await self._delete_vertex_corpus(corpus.vertex_corpus_name)
            except Exception as e:
                logger.warning(f"Failed to delete Vertex AI corpus {corpus.vertex_corpus_name}: {e}")
            
            # Delete from database (cascade will handle documents and jobs)
            await self.db_session.delete(corpus)
            await self.db_session.commit()
            
            logger.info(f"Deleted corpus: {corpus_id}")
            return True
            
        except Exception as e:
            await self.db_session.rollback()
            logger.error(f"Failed to delete corpus {corpus_id}: {e}")
            raise
    
    async def _delete_vertex_corpus(self, vertex_corpus_name: str) -> None:
        """Delete corpus from Vertex AI."""
        if not rag:
            return
        
        # Note: Vertex AI RAG might not support direct corpus deletion
        # This is a placeholder for when the API supports it
        logger.info(f"Would delete Vertex AI corpus: {vertex_corpus_name}")
    
    async def get_corpus_stats(self, corpus_id: UUID) -> Optional[CorpusStatsResponse]:
        """Get detailed statistics for a corpus."""
        stmt = select(RagCorpus).where(RagCorpus.id == corpus_id)
        result = await self.db_session.execute(stmt)
        corpus = result.scalar_one_or_none()
        
        if not corpus:
            return None
        
        # Get document statistics
        doc_stats_stmt = (
            select(
                func.count(RagDocument.id).label("doc_count"),
                func.sum(RagDocument.file_size_bytes).label("total_size"),
                func.count(
                    func.distinct(RagDocument.mime_type)
                ).label("unique_types")
            )
            .where(
                RagDocument.corpus_id == corpus_id,
                RagDocument.upload_status == UploadStatusEnum.COMPLETED
            )
        )
        
        doc_result = await self.db_session.execute(doc_stats_stmt)
        doc_stats = doc_result.first()
        
        # Get supported file types
        types_stmt = (
            select(func.distinct(RagDocument.mime_type))
            .where(
                RagDocument.corpus_id == corpus_id,
                RagDocument.upload_status == UploadStatusEnum.COMPLETED
            )
        )
        types_result = await self.db_session.execute(types_stmt)
        supported_types = [row[0] for row in types_result.fetchall() if row[0]]
        
        return CorpusStatsResponse(
            corpus_id=corpus.id,
            document_count=doc_stats.doc_count or 0,
            total_size_bytes=doc_stats.total_size or 0,
            total_chunks=None,  # Would need to query Vertex AI for this
            average_chunk_size=None,  # Would need to query Vertex AI for this
            embedding_dimensions=None,  # Model-specific, could be hardcoded
            last_updated=corpus.updated_at,
            supported_file_types=supported_types
        )
    
    async def update_corpus_stats(self, corpus_id: UUID) -> None:
        """Update corpus statistics from documents."""
        stats_stmt = (
            select(
                func.count(RagDocument.id).label("doc_count"),
                func.sum(RagDocument.file_size_bytes).label("total_size")
            )
            .where(
                RagDocument.corpus_id == corpus_id,
                RagDocument.upload_status == UploadStatusEnum.COMPLETED
            )
        )
        
        result = await self.db_session.execute(stats_stmt)
        stats = result.first()
        
        update_stmt = (
            update(RagCorpus)
            .where(RagCorpus.id == corpus_id)
            .values(
                document_count=stats.doc_count or 0,
                total_size_bytes=stats.total_size or 0,
                updated_at=datetime.utcnow()
            )
        )
        
        await self.db_session.execute(update_stmt)
        await self.db_session.commit()
        
        logger.debug(f"Updated corpus stats for {corpus_id}: {stats.doc_count} docs, {stats.total_size} bytes")