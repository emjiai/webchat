"""Data models for chat endpoints."""

from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, Field, validator


class Citation(BaseModel):
    """Citation model for RAG responses."""
    
    id: str = Field(..., description="Unique identifier for the citation")
    title: str = Field(..., description="Title of the cited document")
    content: str = Field(..., description="Relevant content excerpt")
    url: Optional[str] = Field(None, description="URL to the source document")
    score: float = Field(..., description="Relevance score (0.0 to 1.0)")
    
    @validator('score')
    def validate_score(cls, v):
        if not 0.0 <= v <= 1.0:
            raise ValueError('Score must be between 0.0 and 1.0')
        return v


class ChatRequest(BaseModel):
    """Request model for chat messages."""
    
    message: str = Field(..., min_length=1, max_length=4000, description="User message")
    chatbot_id: str = Field(..., description="Chatbot instance identifier")
    rag_enabled: bool = Field(default=True, description="Whether to use RAG for this query")
    max_results: Optional[int] = Field(default=10, ge=1, le=20, description="Maximum number of RAG results")
    temperature: Optional[float] = Field(default=0.7, ge=0.0, le=1.0, description="Response temperature")
    model: Optional[str] = Field(default="gemini-2.5-flash", description="LLM model to use")
    
    @validator('message')
    def validate_message(cls, v):
        if not v.strip():
            raise ValueError('Message cannot be empty or only whitespace')
        return v.strip()


class ChatResponse(BaseModel):
    """Response model for chat messages."""
    
    content: str = Field(..., description="AI response content")
    citations: List[Citation] = Field(default_factory=list, description="Citations from RAG")
    model: str = Field(..., description="Model used to generate the response")
    timestamp: str = Field(..., description="Response timestamp in ISO format")
    chatbot_id: str = Field(..., description="Chatbot instance identifier")
    rag_enabled: bool = Field(..., description="Whether RAG was used")
    processing_time_ms: Optional[int] = Field(None, description="Processing time in milliseconds")
    
    @classmethod
    def create(
        cls,
        content: str,
        chatbot_id: str,
        model: str = "gemini-2.5-flash",
        rag_enabled: bool = True,
        citations: Optional[List[Citation]] = None,
        processing_time_ms: Optional[int] = None
    ) -> "ChatResponse":
        """Create a ChatResponse with current timestamp."""
        return cls(
            content=content,
            citations=citations or [],
            model=model,
            timestamp=datetime.utcnow().isoformat(),
            chatbot_id=chatbot_id,
            rag_enabled=rag_enabled,
            processing_time_ms=processing_time_ms
        )


class HealthResponse(BaseModel):
    """Health check response model."""
    
    status: str = Field(..., description="Service status")
    timestamp: str = Field(..., description="Check timestamp")
    version: str = Field(..., description="API version")
    rag_available: bool = Field(..., description="Whether RAG service is available")
    
    @classmethod
    def healthy(cls, rag_available: bool = True) -> "HealthResponse":
        """Create a healthy response."""
        return cls(
            status="healthy",
            timestamp=datetime.utcnow().isoformat(),
            version="1.0.0",
            rag_available=rag_available
        )


class ErrorResponse(BaseModel):
    """Error response model."""
    
    message: str = Field(..., description="Error message")
    error_code: Optional[str] = Field(None, description="Error code")
    timestamp: str = Field(..., description="Error timestamp")
    context: Optional[dict] = Field(None, description="Additional error context")
    
    @classmethod
    def create(
        cls,
        message: str,
        error_code: Optional[str] = None,
        context: Optional[dict] = None
    ) -> "ErrorResponse":
        """Create an ErrorResponse with current timestamp."""
        return cls(
            message=message,
            error_code=error_code,
            timestamp=datetime.utcnow().isoformat(),
            context=context
        )