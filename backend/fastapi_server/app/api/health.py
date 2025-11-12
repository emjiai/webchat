"""Health check endpoints."""

from fastapi import APIRouter
from app.models.chat import HealthResponse
from app.core.rag_wrapper import RAGWrapper
from app.utils.logger import get_logger

logger = get_logger(__name__)
router = APIRouter()

# Initialize RAG wrapper for health checks
rag_wrapper = RAGWrapper()


@router.get("/", response_model=HealthResponse)
async def health_check():
    """
    Health check endpoint.
    
    Returns:
        HealthResponse: Service status and availability
    """
    try:
        rag_available = rag_wrapper.is_available()
        logger.info(f"Health check: RAG available = {rag_available}")
        
        return HealthResponse.healthy(rag_available=rag_available)
        
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return HealthResponse.healthy(rag_available=False)


@router.get("/rag", response_model=dict)
async def rag_status():
    """
    Detailed RAG service status.
    
    Returns:
        dict: Detailed RAG service information
    """
    try:
        status = rag_wrapper.get_status()
        logger.info(f"RAG status check: {status}")
        
        return {
            "status": "healthy" if status["available"] else "unavailable",
            "details": status
        }
        
    except Exception as e:
        logger.error(f"RAG status check failed: {e}")
        return {
            "status": "error",
            "details": {"error": str(e)}
        }