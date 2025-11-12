"""RAG wrapper around Google's Gemini RAG implementation."""

import sys
import os
import asyncio
import re
from typing import List, Dict, Any, Optional
from datetime import datetime

# Add the gemini_rag directory to Python path
current_dir = os.path.dirname(os.path.abspath(__file__))
gemini_rag_path = os.path.join(current_dir, "../../../gemini_rag")
sys.path.insert(0, gemini_rag_path)

from app.models.chat import Citation
from app.utils.exceptions import RAGException, RAGQueryException, RAGCorpusException
from app.utils.logger import get_logger
from app.core.config import settings
from app.core.caching import cache_rag_query, monitor_performance

logger = get_logger(__name__)


class RAGWrapper:
    """Wrapper around Google's Gemini RAG implementation."""
    
    def __init__(self):
        self.agent = None
        self._initialize_agent()
    
    def _initialize_agent(self):
        """Initialize the Google RAG agent."""
        try:
            # Check if RAG corpus is configured
            if not settings.rag_corpus:
                logger.warning("RAG_CORPUS not configured, RAG functionality will be disabled")
                return
            
            # Import and initialize the Google RAG agent
            from rag.agent import root_agent
            self.agent = root_agent
            logger.info(f"RAG agent initialized with corpus: {settings.rag_corpus}")
            
        except ImportError as e:
            logger.error(f"Failed to import Google RAG modules: {e}")
            raise RAGCorpusException(f"RAG modules not available: {e}")
        except Exception as e:
            logger.error(f"Failed to initialize RAG agent: {e}")
            raise RAGCorpusException(f"RAG agent initialization failed: {e}")
    
    def is_available(self) -> bool:
        """Check if RAG functionality is available."""
        return self.agent is not None
    
    @cache_rag_query(ttl=1800, similarity_threshold=0.8)  # Cache for 30 minutes
    @monitor_performance("rag_query_time")
    async def query_documents(
        self, 
        query: str, 
        max_results: int = 10
    ) -> Dict[str, Any]:
        """
        Query RAG system and return formatted response with citations.
        
        Args:
            query: User query string
            max_results: Maximum number of results to return
            
        Returns:
            Dictionary with content, citations, model, and timestamp
            
        Raises:
            RAGQueryException: If query fails
            RAGCorpusException: If RAG is not available
        """
        if not self.is_available():
            raise RAGCorpusException("RAG service is not available")
        
        start_time = datetime.utcnow()
        
        try:
            logger.info(f"Processing RAG query: {query[:100]}...")
            
            # Use asyncio.to_thread to run the synchronous agent query
            response = await asyncio.to_thread(self._execute_query, query)
            
            # Extract citations and format response with query context
            citations = self._extract_citations(response, max_results, query)
            
            processing_time = (datetime.utcnow() - start_time).total_seconds() * 1000
            
            result = {
                "content": response,
                "citations": citations,
                "model": "gemini-2.5-flash",
                "timestamp": datetime.utcnow().isoformat(),
                "processing_time_ms": int(processing_time)
            }
            
            logger.info(f"RAG query completed in {processing_time:.2f}ms with {len(citations)} citations")
            return result
            
        except Exception as e:
            logger.error(f"RAG query failed: {e}")
            raise RAGQueryException(f"Query execution failed: {str(e)}")
    
    def _execute_query(self, query: str) -> str:
        """Execute the actual RAG query (synchronous)."""
        try:
            # Call the Google agent's query method
            response = self.agent.invoke(query)
            
            # Extract the content from the response
            if hasattr(response, 'content'):
                return response.content
            elif isinstance(response, str):
                return response
            else:
                return str(response)
                
        except Exception as e:
            raise RAGQueryException(f"Agent query failed: {str(e)}")
    
    def _extract_citations(self, response: str, max_results: int, query: str = None) -> List[Citation]:
        """
        Extract and format citations from RAG response using enhanced processor.
        
        Args:
            response: The response text from RAG
            max_results: Maximum number of citations to return
            query: Original query for relevance ranking
            
        Returns:
            List of Citation objects, ranked by relevance and quality
        """
        try:
            from app.core.citation_processor import CitationExtractor, CitationRanker
            
            # Extract citations using enhanced processor
            extractor = CitationExtractor()
            citations = extractor.extract_citations(
                response_text=response,
                max_results=max_results * 2,  # Extract more for ranking
                min_quality_score=0.2
            )
            
            # Rank citations by relevance if query is provided
            if citations and query:
                ranker = CitationRanker()
                citations = ranker.rank_citations(citations, query, response)
            
            logger.debug(f"Extracted and ranked {len(citations)} citations")
            return citations[:max_results]
            
        except Exception as e:
            logger.warning(f"Enhanced citation extraction failed, falling back to basic: {e}")
            return self._extract_citations_basic(response, max_results)
    
    def _extract_citations_basic(self, response: str, max_results: int) -> List[Citation]:
        """Basic citation extraction (fallback method)."""
        citations = []
        
        try:
            # Basic pattern matching
            citation_patterns = [
                r'Citations?:\s*\n(.*?)(?:\n\n|\Z)',
                r'References?:\s*\n(.*?)(?:\n\n|\Z)',
                r'\[Source: ([^\]]+)\]',
                r'\(Source: ([^)]+)\)'
            ]
            
            citation_id = 1
            
            for pattern in citation_patterns:
                matches = re.finditer(pattern, response, re.IGNORECASE | re.DOTALL)
                
                for match in matches:
                    citation_text = match.group(1).strip()
                    citation_lines = re.split(r'\n?\d+[\)\.]\s*', citation_text)
                    
                    for line in citation_lines:
                        if line.strip() and len(citations) < max_results:
                            citation = self._create_citation_from_text(citation_id, line.strip())
                            if citation:
                                citations.append(citation)
                                citation_id += 1
            
            return citations[:max_results]
            
        except Exception as e:
            logger.warning(f"Basic citation extraction failed: {e}")
            return []
    
    def _create_citation_from_text(self, citation_id: int, text: str) -> Optional[Citation]:
        """Create a Citation object from citation text."""
        try:
            # Extract title and URL if present
            url_pattern = r'https?://[^\s]+'
            url_match = re.search(url_pattern, text)
            url = url_match.group(0) if url_match else None
            
            # Remove URL from title
            title = re.sub(url_pattern, '', text).strip()
            
            # Clean up title
            title = re.sub(r'^[\d\)\.]', '', title).strip()
            
            if not title:
                return None
            
            return Citation(
                id=f"citation_{citation_id}",
                title=title,
                content=text[:200] + "..." if len(text) > 200 else text,
                url=url,
                score=0.8  # Default score, could be improved with actual relevance scoring
            )
            
        except Exception as e:
            logger.warning(f"Failed to create citation from text '{text}': {e}")
            return None
    
    def _extract_implicit_citations(self, response: str, max_results: int) -> List[Citation]:
        """Extract implicit citations when no explicit citations are found."""
        citations = []
        
        try:
            # Look for document references in the response
            doc_patterns = [
                r'according to ([^,\.]+)',
                r'based on ([^,\.]+)',
                r'as mentioned in ([^,\.]+)',
                r'from ([^,\.]+)',
            ]
            
            citation_id = 1
            found_sources = set()
            
            for pattern in doc_patterns:
                matches = re.finditer(pattern, response, re.IGNORECASE)
                
                for match in matches:
                    source = match.group(1).strip()
                    
                    if source not in found_sources and len(citations) < max_results:
                        citation = Citation(
                            id=f"implicit_{citation_id}",
                            title=source,
                            content=f"Referenced in: {match.group(0)}",
                            url=None,
                            score=0.6
                        )
                        citations.append(citation)
                        found_sources.add(source)
                        citation_id += 1
            
            return citations
            
        except Exception as e:
            logger.warning(f"Implicit citation extraction failed: {e}")
            return []
    
    def get_status(self) -> Dict[str, Any]:
        """Get RAG service status."""
        return {
            "available": self.is_available(),
            "corpus": settings.rag_corpus if self.is_available() else None,
            "model": "gemini-2.5-flash" if self.is_available() else None
        }