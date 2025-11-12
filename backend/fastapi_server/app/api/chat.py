"""Chat endpoints with RAG integration."""

from typing import Optional
from datetime import datetime
from fastapi import APIRouter, HTTPException, status, Depends, Request
from fastapi.responses import StreamingResponse

from app.models.chat import ChatRequest, ChatResponse, ErrorResponse
from app.core.rag_wrapper import RAGWrapper
from app.core.security import get_auth_info, check_rate_limit, request_validator
from app.utils.exceptions import (
    RAGQueryException, 
    RAGCorpusException,
    rag_not_configured_exception,
    rag_query_failed_exception,
    invalid_request_exception
)
from app.utils.logger import get_logger

logger = get_logger(__name__)
router = APIRouter()

# Initialize RAG wrapper
rag_wrapper = RAGWrapper()


async def get_rag_wrapper() -> RAGWrapper:
    """Dependency to get RAG wrapper instance."""
    return rag_wrapper


@router.post("/message", response_model=ChatResponse)
async def process_chat_message(
    chat_request: ChatRequest,
    http_request: Request,
    rag: RAGWrapper = Depends(get_rag_wrapper),
    auth_info: Optional[dict] = Depends(get_auth_info),
    _: None = Depends(check_rate_limit)
):
    """
    Process chat message with optional RAG integration.
    
    Args:
        chat_request: Chat request with message and configuration
        http_request: HTTP request object
        rag: RAG wrapper instance
        auth_info: Authentication information (optional)
        
    Returns:
        ChatResponse: AI response with optional citations
        
    Raises:
        HTTPException: Various error conditions
    """
    start_time = datetime.utcnow()
    
    try:
        # Validate and sanitize input
        sanitized_message = request_validator.sanitize_input(chat_request.message)
        sanitized_chatbot_id = request_validator.validate_chatbot_id(chat_request.chatbot_id)
        
        # Update request with sanitized data
        chat_request.message = sanitized_message
        chat_request.chatbot_id = sanitized_chatbot_id
        
        logger.info(
            f"Processing chat message for chatbot {chat_request.chatbot_id}, "
            f"RAG enabled: {chat_request.rag_enabled}, "
            f"Authenticated: {bool(auth_info)}"
        )
        
        if chat_request.rag_enabled:
            # Process with RAG
            if not rag.is_available():
                raise rag_not_configured_exception()
            
            try:
                rag_response = await rag.query_documents(
                    query=chat_request.message,
                    max_results=chat_request.max_results or 10
                )
                
                response = ChatResponse.create(
                    content=rag_response["content"],
                    chatbot_id=chat_request.chatbot_id,
                    model=rag_response["model"],
                    rag_enabled=True,
                    citations=rag_response["citations"],
                    processing_time_ms=rag_response.get("processing_time_ms")
                )
                
                logger.info(
                    f"RAG response generated with {len(response.citations)} citations "
                    f"in {response.processing_time_ms}ms"
                )
                
            except RAGQueryException as e:
                logger.error(f"RAG query failed: {e}")
                raise rag_query_failed_exception(str(e))
            except RAGCorpusException as e:
                logger.error(f"RAG corpus error: {e}")
                raise rag_not_configured_exception()
                
        else:
            # Process without RAG (direct LLM response)
            response = await process_direct_llm(chat_request)
            
        # Log successful response
        processing_time = (datetime.utcnow() - start_time).total_seconds() * 1000
        logger.info(f"Chat message processed in {processing_time:.2f}ms")
        
        return response
        
    except HTTPException:
        # Re-raise HTTP exceptions (already handled)
        raise
    except Exception as e:
        logger.error(f"Unexpected error processing chat message: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )


@router.post("/stream")
async def stream_chat_message(
    request: ChatRequest,
    rag: RAGWrapper = Depends(get_rag_wrapper)
):
    """
    Stream chat response with RAG integration.
    
    Args:
        request: Chat request with message and configuration
        rag: RAG wrapper instance
        
    Returns:
        StreamingResponse: Server-sent events with streaming response
    """
    logger.info(f"Starting streaming response for chatbot {request.chatbot_id}")
    
    # Import streaming utilities
    from app.core.streaming import RAGStreamingWrapper, DirectLLMStreamer
    
    async def generate_stream():
        """Generate streaming response."""
        try:
            if request.rag_enabled and rag.is_available():
                # Use RAG streaming wrapper
                rag_streamer = RAGStreamingWrapper(rag)
                async for event in rag_streamer.stream_query_response(
                    query=request.message,
                    max_results=request.max_results or 10,
                    stream_mode="words"  # Can be "words" or "characters"
                ):
                    yield event
            else:
                # Use direct LLM streaming (placeholder)
                async for event in DirectLLMStreamer.stream_placeholder_response(
                    query=request.message,
                    model=request.model or "placeholder-llm"
                ):
                    yield event
                
        except Exception as e:
            from app.core.streaming import StreamingResponse as SSEResponse
            logger.error(f"Streaming error: {e}")
            yield SSEResponse.format_error_event(f"Streaming failed: {str(e)}")
    
    return StreamingResponse(
        generate_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Cache-Control"
        }
    )


async def process_direct_llm(request: ChatRequest) -> ChatResponse:
    """
    Process message without RAG (direct LLM response).
    
    This is a placeholder implementation. In a real system, you'd integrate
    with your preferred LLM provider (OpenAI, Anthropic, etc.)
    
    Args:
        request: Chat request
        
    Returns:
        ChatResponse: Direct LLM response
    """
    logger.info(f"Processing direct LLM request for model: {request.model}")
    
    # Placeholder response - replace with actual LLM integration
    placeholder_responses = [
        "I understand your question. However, I'm currently running without RAG integration, so I can only provide general responses.",
        "Thank you for your message. To get more specific and accurate information, please enable RAG functionality.",
        "I'm here to help! For the best experience with access to relevant documents and citations, RAG should be enabled.",
    ]
    
    import random
    content = random.choice(placeholder_responses)
    
    return ChatResponse.create(
        content=content,
        chatbot_id=request.chatbot_id,
        model=request.model or "placeholder-llm",
        rag_enabled=False,
        processing_time_ms=100  # Simulated processing time
    )