"""RAG Corpus management API endpoints."""

from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from ....db.database import get_session
from ....services.rag_corpus_service import RagCorpusService
from ....models.rag import (
    CorpusCreateRequest,
    CorpusUpdateRequest, 
    CorpusResponse,
    CorpusStatsResponse
)
from ....models.chat import ErrorResponse
from ....utils.logger import get_logger
from ....core.security import get_api_key

logger = get_logger(__name__)
router = APIRouter()


@router.post("/corpus/create", response_model=CorpusResponse)
async def create_corpus(
    request: CorpusCreateRequest,
    db: AsyncSession = Depends(get_session),
    api_key: str = Depends(get_api_key)
) -> CorpusResponse:
    """
    Create a new RAG corpus.
    
    This endpoint creates a new corpus in both the database and Vertex AI RAG Engine.
    The corpus will be associated with the specified chatbot and can then be used
    for document uploads and RAG queries.
    
    Args:
        request: Corpus creation parameters
        db: Database session
        api_key: API authentication key
        
    Returns:
        Created corpus information
        
    Raises:
        HTTPException: 400 for validation errors, 500 for creation failures
    """
    try:
        service = RagCorpusService(db)
        corpus = await service.create_corpus(request)
        
        logger.info(
            f"Created corpus {corpus.id} for chatbot {request.chatbot_id}",
            extra={
                "corpus_id": str(corpus.id),
                "chatbot_id": request.chatbot_id,
                "display_name": request.display_name
            }
        )
        
        return corpus
        
    except Exception as e:
        logger.error(f"Failed to create corpus: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create corpus: {str(e)}"
        )


@router.get("/corpus/list", response_model=List[CorpusResponse])
async def list_corpora(
    chatbot_id: Optional[str] = Query(None, description="Filter by chatbot ID"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of results"),
    offset: int = Query(0, ge=0, description="Number of results to skip"),
    db: AsyncSession = Depends(get_session),
    api_key: str = Depends(get_api_key)
) -> List[CorpusResponse]:
    """
    List RAG corpora.
    
    Returns a list of all corpora, optionally filtered by chatbot ID.
    Results are paginated and ordered by creation date (newest first).
    
    Args:
        chatbot_id: Optional chatbot ID filter
        limit: Maximum number of results (1-1000)
        offset: Number of results to skip for pagination
        db: Database session
        api_key: API authentication key
        
    Returns:
        List of corpus information
    """
    try:
        service = RagCorpusService(db)
        
        if chatbot_id:
            corpora = await service.get_corpora_by_chatbot(chatbot_id)
            # Apply pagination manually for chatbot-specific results
            corpora = corpora[offset:offset + limit]
        else:
            corpora = await service.list_all_corpora(limit=limit, offset=offset)
        
        logger.debug(
            f"Listed {len(corpora)} corpora",
            extra={
                "chatbot_id": chatbot_id,
                "limit": limit,
                "offset": offset
            }
        )
        
        return corpora
        
    except Exception as e:
        logger.error(f"Failed to list corpora: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to list corpora: {str(e)}"
        )


@router.get("/corpus/{corpus_id}", response_model=CorpusResponse)
async def get_corpus(
    corpus_id: UUID,
    db: AsyncSession = Depends(get_session),
    api_key: str = Depends(get_api_key)
) -> CorpusResponse:
    """
    Get corpus details by ID.
    
    Returns detailed information about a specific corpus, including
    document count and total size statistics.
    
    Args:
        corpus_id: Corpus UUID
        db: Database session
        api_key: API authentication key
        
    Returns:
        Corpus information
        
    Raises:
        HTTPException: 404 if corpus not found
    """
    try:
        service = RagCorpusService(db)
        corpus = await service.get_corpus_by_id(corpus_id)
        
        if not corpus:
            raise HTTPException(
                status_code=404,
                detail=f"Corpus {corpus_id} not found"
            )
        
        logger.debug(f"Retrieved corpus {corpus_id}")
        return corpus
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get corpus {corpus_id}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get corpus: {str(e)}"
        )


@router.put("/corpus/{corpus_id}", response_model=CorpusResponse)
async def update_corpus(
    corpus_id: UUID,
    request: CorpusUpdateRequest,
    db: AsyncSession = Depends(get_session),
    api_key: str = Depends(get_api_key)
) -> CorpusResponse:
    """
    Update corpus metadata.
    
    Updates the display name and/or description of an existing corpus.
    Note: This only updates metadata - documents and embedding configuration
    cannot be changed after creation.
    
    Args:
        corpus_id: Corpus UUID
        request: Update parameters
        db: Database session
        api_key: API authentication key
        
    Returns:
        Updated corpus information
        
    Raises:
        HTTPException: 404 if corpus not found, 400 for validation errors
    """
    try:
        service = RagCorpusService(db)
        corpus = await service.update_corpus(corpus_id, request)
        
        if not corpus:
            raise HTTPException(
                status_code=404,
                detail=f"Corpus {corpus_id} not found"
            )
        
        logger.info(
            f"Updated corpus {corpus_id}",
            extra={
                "corpus_id": str(corpus_id),
                "updates": request.dict(exclude_unset=True)
            }
        )
        
        return corpus
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to update corpus {corpus_id}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to update corpus: {str(e)}"
        )


@router.delete("/corpus/{corpus_id}")
async def delete_corpus(
    corpus_id: UUID,
    db: AsyncSession = Depends(get_session),
    api_key: str = Depends(get_api_key)
) -> dict:
    """
    Delete a corpus and all its documents.
    
    This operation is irreversible and will:
    1. Delete all documents from Vertex AI RAG Engine
    2. Delete the corpus from Vertex AI RAG Engine
    3. Remove all related records from the database
    
    Args:
        corpus_id: Corpus UUID
        db: Database session
        api_key: API authentication key
        
    Returns:
        Success confirmation
        
    Raises:
        HTTPException: 404 if corpus not found, 500 for deletion failures
    """
    try:
        service = RagCorpusService(db)
        success = await service.delete_corpus(corpus_id)
        
        if not success:
            raise HTTPException(
                status_code=404,
                detail=f"Corpus {corpus_id} not found"
            )
        
        logger.info(
            f"Deleted corpus {corpus_id}",
            extra={"corpus_id": str(corpus_id)}
        )
        
        return {"message": f"Corpus {corpus_id} successfully deleted"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to delete corpus {corpus_id}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to delete corpus: {str(e)}"
        )


@router.get("/corpus/{corpus_id}/stats", response_model=CorpusStatsResponse)
async def get_corpus_stats(
    corpus_id: UUID,
    db: AsyncSession = Depends(get_session),
    api_key: str = Depends(get_api_key)
) -> CorpusStatsResponse:
    """
    Get detailed corpus statistics.
    
    Returns comprehensive statistics about a corpus including:
    - Document count and total size
    - Supported file types
    - Last update timestamp
    - Embedding information (when available)
    
    Args:
        corpus_id: Corpus UUID
        db: Database session
        api_key: API authentication key
        
    Returns:
        Corpus statistics
        
    Raises:
        HTTPException: 404 if corpus not found
    """
    try:
        service = RagCorpusService(db)
        stats = await service.get_corpus_stats(corpus_id)
        
        if not stats:
            raise HTTPException(
                status_code=404,
                detail=f"Corpus {corpus_id} not found"
            )
        
        logger.debug(f"Retrieved stats for corpus {corpus_id}")
        return stats
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get corpus stats {corpus_id}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get corpus stats: {str(e)}"
        )