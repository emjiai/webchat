"""Streaming response utilities for real-time chat."""

import asyncio
import json
import time
from typing import AsyncGenerator, Dict, Any, Optional, List
from datetime import datetime

from app.models.chat import Citation
from app.utils.logger import get_logger

logger = get_logger(__name__)


class StreamingResponse:
    """Handles streaming chat responses with proper event formatting."""
    
    @staticmethod
    def format_sse_event(data: Dict[str, Any], event_type: str = "message") -> str:
        """Format data as Server-Sent Event."""
        json_data = json.dumps(data, ensure_ascii=False)
        return f"event: {event_type}\ndata: {json_data}\n\n"
    
    @staticmethod
    def format_error_event(error_msg: str) -> str:
        """Format error as SSE event."""
        return StreamingResponse.format_sse_event({
            "type": "error",
            "message": error_msg,
            "timestamp": datetime.utcnow().isoformat()
        }, "error")
    
    @staticmethod
    def format_done_event() -> str:
        """Format completion event."""
        return StreamingResponse.format_sse_event({
            "type": "done",
            "timestamp": datetime.utcnow().isoformat()
        }, "done")


class ContentStreamer:
    """Streams content in chunks for real-time display."""
    
    def __init__(self, content: str, chunk_size: int = 3, delay_ms: int = 50):
        self.content = content
        self.chunk_size = chunk_size
        self.delay_ms = delay_ms
    
    async def stream_words(self) -> AsyncGenerator[str, None]:
        """Stream content word by word."""
        words = self.content.split()
        current_chunk = []
        
        for word in words:
            current_chunk.append(word)
            
            if len(current_chunk) >= self.chunk_size:
                chunk_text = " ".join(current_chunk) + " "
                yield chunk_text
                current_chunk = []
                await asyncio.sleep(self.delay_ms / 1000.0)
        
        # Send remaining words
        if current_chunk:
            chunk_text = " ".join(current_chunk)
            yield chunk_text
    
    async def stream_characters(self) -> AsyncGenerator[str, None]:
        """Stream content character by character (for typewriter effect)."""
        for char in self.content:
            yield char
            await asyncio.sleep(self.delay_ms / 1000.0)


class RAGStreamingWrapper:
    """Wrapper for streaming RAG responses."""
    
    def __init__(self, rag_wrapper):
        self.rag_wrapper = rag_wrapper
    
    async def stream_query_response(
        self, 
        query: str, 
        max_results: int = 10,
        stream_mode: str = "words"  # "words" or "characters"
    ) -> AsyncGenerator[str, None]:
        """
        Stream RAG query response in real-time.
        
        Args:
            query: User query
            max_results: Max citation results
            stream_mode: How to stream content ("words" or "characters")
            
        Yields:
            Server-Sent Events formatted strings
        """
        start_time = time.time()
        
        try:
            # Send initial status
            yield StreamingResponse.format_sse_event({
                "type": "status",
                "message": "Processing your query...",
                "timestamp": datetime.utcnow().isoformat()
            }, "status")
            
            # Execute RAG query (this is still synchronous from Google's implementation)
            logger.info(f"Starting RAG query: {query[:100]}...")
            
            # Send thinking status
            yield StreamingResponse.format_sse_event({
                "type": "status", 
                "message": "Searching knowledge base...",
                "timestamp": datetime.utcnow().isoformat()
            }, "status")
            
            # Get RAG response
            rag_response = await self.rag_wrapper.query_documents(query, max_results)
            
            # Send content streaming status
            yield StreamingResponse.format_sse_event({
                "type": "status",
                "message": "Generating response...",
                "timestamp": datetime.utcnow().isoformat()
            }, "status")
            
            # Stream the content
            streamer = ContentStreamer(
                content=rag_response["content"],
                chunk_size=3 if stream_mode == "words" else 1,
                delay_ms=80 if stream_mode == "words" else 30
            )
            
            if stream_mode == "words":
                async for chunk in streamer.stream_words():
                    yield StreamingResponse.format_sse_event({
                        "type": "content",
                        "text": chunk,
                        "timestamp": datetime.utcnow().isoformat()
                    }, "content")
            else:
                async for char in streamer.stream_characters():
                    yield StreamingResponse.format_sse_event({
                        "type": "content",
                        "text": char,
                        "timestamp": datetime.utcnow().isoformat()
                    }, "content")
            
            # Send citations
            if rag_response["citations"]:
                yield StreamingResponse.format_sse_event({
                    "type": "citations",
                    "citations": [citation.dict() for citation in rag_response["citations"]],
                    "timestamp": datetime.utcnow().isoformat()
                }, "citations")
            
            # Send metadata
            processing_time = (time.time() - start_time) * 1000
            yield StreamingResponse.format_sse_event({
                "type": "metadata",
                "model": rag_response["model"],
                "processing_time_ms": int(processing_time),
                "citation_count": len(rag_response["citations"]),
                "timestamp": datetime.utcnow().isoformat()
            }, "metadata")
            
            # Send completion
            yield StreamingResponse.format_done_event()
            
            logger.info(f"Streaming completed in {processing_time:.2f}ms")
            
        except Exception as e:
            logger.error(f"Streaming error: {e}")
            yield StreamingResponse.format_error_event(f"Streaming failed: {str(e)}")


class DirectLLMStreamer:
    """Simulates streaming for direct LLM responses (without RAG)."""
    
    @staticmethod
    async def stream_placeholder_response(
        query: str,
        model: str = "placeholder-llm"
    ) -> AsyncGenerator[str, None]:
        """Stream a placeholder response for non-RAG queries."""
        
        responses = [
            f"I understand you're asking about '{query[:50]}...'",
            "While I can provide general information, ",
            "for more specific and accurate details with citations, ",
            "please enable RAG functionality. ",
            "This will allow me to search through relevant documents ",
            "and provide you with sourced information."
        ]
        
        # Send status
        yield StreamingResponse.format_sse_event({
            "type": "status",
            "message": "Generating response...",
            "timestamp": datetime.utcnow().isoformat()
        }, "status")
        
        # Stream response
        for response_part in responses:
            streamer = ContentStreamer(response_part, chunk_size=2, delay_ms=60)
            async for chunk in streamer.stream_words():
                yield StreamingResponse.format_sse_event({
                    "type": "content",
                    "text": chunk,
                    "timestamp": datetime.utcnow().isoformat()
                }, "content")
        
        # Send metadata
        yield StreamingResponse.format_sse_event({
            "type": "metadata",
            "model": model,
            "processing_time_ms": 1000,
            "citation_count": 0,
            "timestamp": datetime.utcnow().isoformat()
        }, "metadata")
        
        # Send completion
        yield StreamingResponse.format_done_event()


async def simulate_typing_delay(text: str, wpm: int = 300) -> float:
    """Calculate realistic typing delay based on words per minute."""
    word_count = len(text.split())
    words_per_second = wpm / 60
    return word_count / words_per_second