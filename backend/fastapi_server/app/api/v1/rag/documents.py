"""RAG Document management API endpoints."""

from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, Form, Query
from sqlalchemy.ext.asyncio import AsyncSession

from ....db.database import get_session
from ....services.document_service import DocumentService
from ....models.rag import (
    DocumentResponse,
    DocumentSearchRequest,
    DocumentSearchResponse,
    UploadValidationResponse,
    ChunkingStrategy
)
from ....utils.logger import get_logger
from ....core.security import get_api_key

logger = get_logger(__name__)
router = APIRouter()


@router.post("/documents/validate", response_model=UploadValidationResponse)
async def validate_upload(
    corpus_id: UUID = Form(...),
    files: List[UploadFile] = File(...),
    db: AsyncSession = Depends(get_session),
    api_key: str = Depends(get_api_key)
) -> UploadValidationResponse:
    """
    Validate files before upload.
    
    This endpoint validates uploaded files for:
    - Supported file types
    - File size limits
    - Batch size limits
    - Corpus existence
    
    Use this endpoint before actual upload to provide user feedback
    about which files can be processed.
    
    Args:
        corpus_id: Target corpus UUID
        files: List of files to validate
        db: Database session
        api_key: API authentication key
        
    Returns:
        Validation results with valid/invalid file lists
    """
    try:
        service = DocumentService(db)
        validation = await service.validate_files(files, corpus_id)
        
        logger.debug(
            f"Validated {len(files)} files for corpus {corpus_id}",
            extra={
                "corpus_id": str(corpus_id),
                "total_files": len(files),
                "valid_files": len(validation.valid_files),
                "invalid_files": len(validation.invalid_files)
            }
        )
        
        return validation
        
    except Exception as e:
        logger.error(f"Failed to validate files: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to validate files: {str(e)}"
        )


@router.post("/documents/upload", response_model=DocumentResponse)
async def upload_document(
    corpus_id: UUID = Form(...),
    file: UploadFile = File(...),
    display_name: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    chunking_strategy: ChunkingStrategy = Form(ChunkingStrategy.AUTO),
    db: AsyncSession = Depends(get_session),
    api_key: str = Depends(get_api_key)
) -> DocumentResponse:
    """
    Upload a single document to a corpus.
    
    Uploads a document to the specified corpus in Vertex AI RAG Engine.
    The document will be processed, chunked, and embedded according to
    the specified chunking strategy.
    
    Args:
        corpus_id: Target corpus UUID
        file: Document file to upload
        display_name: Optional custom display name
        description: Optional document description
        chunking_strategy: How to chunk the document (auto/fixed/semantic)
        db: Database session
        api_key: API authentication key
        
    Returns:
        Document information with upload status
        
    Raises:
        HTTPException: 400 for validation errors, 404 if corpus not found
    """
    try:
        service = DocumentService(db)
        document = await service.upload_document(
            file=file,
            corpus_id=corpus_id,
            display_name=display_name,
            description=description,
            chunking_strategy=chunking_strategy
        )
        
        logger.info(
            f"Uploaded document {document.id} to corpus {corpus_id}",
            extra={
                "document_id": str(document.id),
                "corpus_id": str(corpus_id),
                "filename": document.original_filename,
                "status": document.upload_status.value
            }
        )
        
        return document
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to upload document: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to upload document: {str(e)}"
        )


@router.post("/documents/batch-upload")
async def batch_upload_documents(
    corpus_id: UUID = Form(...),
    files: List[UploadFile] = File(...),
    chunking_strategy: ChunkingStrategy = Form(ChunkingStrategy.AUTO),
    db: AsyncSession = Depends(get_session),
    api_key: str = Depends(get_api_key)
) -> dict:
    """
    Upload multiple documents to a corpus.
    
    Uploads multiple documents in a single batch operation.
    Returns a job ID that can be used to track upload progress.
    
    Args:
        corpus_id: Target corpus UUID
        files: List of document files to upload
        chunking_strategy: How to chunk the documents
        db: Database session
        api_key: API authentication key
        
    Returns:
        Job information for tracking progress
        
    Raises:
        HTTPException: 400 for validation errors
    """
    try:
        service = DocumentService(db)
        
        # Validate files first
        validation = await service.validate_files(files, corpus_id)
        if not validation.is_valid:
            error_details = [
                {"filename": err.filename, "error": err.message}
                for err in validation.invalid_files
            ]
            raise HTTPException(
                status_code=400,
                detail={"message": "File validation failed", "errors": error_details}
            )
        
        # For now, process files individually
        # TODO: Implement proper batch job processing with background tasks
        results = []
        for file in files:
            try:
                document = await service.upload_document(
                    file=file,
                    corpus_id=corpus_id,
                    chunking_strategy=chunking_strategy
                )
                results.append({
                    "filename": file.filename,
                    "document_id": str(document.id),
                    "status": "uploaded"
                })
            except Exception as e:
                results.append({
                    "filename": file.filename,
                    "status": "failed",
                    "error": str(e)
                })
        
        logger.info(
            f"Batch uploaded {len(files)} files to corpus {corpus_id}",
            extra={
                "corpus_id": str(corpus_id),
                "total_files": len(files),
                "successful": len([r for r in results if r["status"] == "uploaded"])
            }
        )
        
        return {
            "message": f"Processed {len(files)} files",
            "results": results
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed batch upload: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed batch upload: {str(e)}"
        )


@router.get("/documents/{corpus_id}", response_model=List[DocumentResponse])
async def list_documents(
    corpus_id: UUID,
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of results"),
    offset: int = Query(0, ge=0, description="Number of results to skip"),
    db: AsyncSession = Depends(get_session),
    api_key: str = Depends(get_api_key)
) -> List[DocumentResponse]:
    """
    List documents in a corpus.
    
    Returns a paginated list of all documents in the specified corpus,
    ordered by upload date (newest first).
    
    Args:
        corpus_id: Corpus UUID
        limit: Maximum number of results (1-1000)
        offset: Number of results to skip for pagination
        db: Database session
        api_key: API authentication key
        
    Returns:
        List of document information
    """
    try:
        service = DocumentService(db)
        documents = await service.list_documents_in_corpus(
            corpus_id=corpus_id,
            limit=limit,
            offset=offset
        )
        
        logger.debug(
            f"Listed {len(documents)} documents for corpus {corpus_id}",
            extra={
                "corpus_id": str(corpus_id),
                "limit": limit,
                "offset": offset
            }
        )
        
        return documents
        
    except Exception as e:
        logger.error(f"Failed to list documents for corpus {corpus_id}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to list documents: {str(e)}"
        )


@router.get("/documents/file/{document_id}", response_model=DocumentResponse)
async def get_document(
    document_id: UUID,
    db: AsyncSession = Depends(get_session),
    api_key: str = Depends(get_api_key)
) -> DocumentResponse:
    """
    Get document details by ID.
    
    Returns detailed information about a specific document,
    including upload status and any error messages.
    
    Args:
        document_id: Document UUID
        db: Database session
        api_key: API authentication key
        
    Returns:
        Document information
        
    Raises:
        HTTPException: 404 if document not found
    """
    try:
        service = DocumentService(db)
        document = await service.get_document_by_id(document_id)
        
        if not document:
            raise HTTPException(
                status_code=404,
                detail=f"Document {document_id} not found"
            )
        
        logger.debug(f"Retrieved document {document_id}")
        return document
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to get document {document_id}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get document: {str(e)}"
        )


@router.delete("/documents/file/{document_id}")
async def delete_document(
    document_id: UUID,
    db: AsyncSession = Depends(get_session),
    api_key: str = Depends(get_api_key)
) -> dict:
    """
    Delete a document from the corpus.
    
    This operation removes the document from both the database
    and Vertex AI RAG Engine. This action is irreversible.
    
    Args:
        document_id: Document UUID
        db: Database session
        api_key: API authentication key
        
    Returns:
        Success confirmation
        
    Raises:
        HTTPException: 404 if document not found
    """
    try:
        service = DocumentService(db)
        success = await service.delete_document(document_id)
        
        if not success:
            raise HTTPException(
                status_code=404,
                detail=f"Document {document_id} not found"
            )
        
        logger.info(
            f"Deleted document {document_id}",
            extra={"document_id": str(document_id)}
        )
        
        return {"message": f"Document {document_id} successfully deleted"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to delete document {document_id}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to delete document: {str(e)}"
        )


@router.post("/documents/search", response_model=DocumentSearchResponse)
async def search_documents(
    request: DocumentSearchRequest,
    db: AsyncSession = Depends(get_session),
    api_key: str = Depends(get_api_key)
) -> DocumentSearchResponse:
    """
    Search documents within a corpus.
    
    Performs a search across documents in the specified corpus.
    This is a basic text-based search - for semantic search,
    use the RAG chat endpoints which query Vertex AI directly.
    
    Args:
        request: Search parameters
        db: Database session
        api_key: API authentication key
        
    Returns:
        Search results with relevance scores
    """
    try:
        service = DocumentService(db)
        results = await service.search_documents(request)
        
        logger.debug(
            f"Searched documents in corpus {request.corpus_id}",
            extra={
                "corpus_id": str(request.corpus_id),
                "query": request.query,
                "results_count": len(results.results)
            }
        )
        
        return results
        
    except Exception as e:
        logger.error(f"Failed to search documents: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to search documents: {str(e)}"
        )