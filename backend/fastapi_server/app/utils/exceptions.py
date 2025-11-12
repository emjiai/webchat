"""Custom exceptions for the application."""

from typing import Optional, Any, Dict
from fastapi import HTTPException, status


class RAGException(Exception):
    """Base exception for RAG-related errors."""
    
    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        self.message = message
        self.details = details or {}
        super().__init__(self.message)


class RAGQueryException(RAGException):
    """Exception raised when RAG query fails."""
    pass


class RAGCorpusException(RAGException):
    """Exception raised when RAG corpus is not available or misconfigured."""
    pass


class APIException(HTTPException):
    """Custom API exception with additional context."""
    
    def __init__(
        self,
        status_code: int,
        detail: str,
        error_code: Optional[str] = None,
        context: Optional[Dict[str, Any]] = None
    ):
        self.error_code = error_code
        self.context = context or {}
        super().__init__(status_code=status_code, detail=detail)


def create_http_exception(
    status_code: int,
    message: str,
    error_code: Optional[str] = None,
    context: Optional[Dict[str, Any]] = None
) -> HTTPException:
    """Create a standardized HTTP exception."""
    
    detail = {
        "message": message,
        "error_code": error_code,
        "context": context or {}
    }
    
    return HTTPException(status_code=status_code, detail=detail)


# Common exceptions
def rag_not_configured_exception() -> HTTPException:
    """Exception for when RAG is not properly configured."""
    return create_http_exception(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        message="RAG service is not configured. Please check RAG_CORPUS environment variable.",
        error_code="RAG_NOT_CONFIGURED"
    )


def rag_query_failed_exception(error_msg: str) -> HTTPException:
    """Exception for when RAG query fails."""
    return create_http_exception(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        message=f"RAG query failed: {error_msg}",
        error_code="RAG_QUERY_FAILED"
    )


def invalid_request_exception(message: str) -> HTTPException:
    """Exception for invalid request data."""
    return create_http_exception(
        status_code=status.HTTP_400_BAD_REQUEST,
        message=message,
        error_code="INVALID_REQUEST"
    )