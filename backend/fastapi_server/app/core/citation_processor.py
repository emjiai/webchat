"""Enhanced citation extraction and processing."""

import re
import hashlib
from typing import List, Dict, Any, Optional, Set, Tuple
from datetime import datetime
from urllib.parse import urlparse, parse_qs

from app.models.chat import Citation
from app.utils.logger import get_logger

logger = get_logger(__name__)


class CitationExtractor:
    """Enhanced citation extraction from RAG responses."""
    
    def __init__(self):
        self.citation_patterns = [
            # Standard citation formats
            r'Citations?:\s*\n((?:\d+[\)\.]\s*[^\n]+\n?)+)',
            r'References?:\s*\n((?:\d+[\)\.]\s*[^\n]+\n?)+)',
            r'Sources?:\s*\n((?:\d+[\)\.]\s*[^\n]+\n?)+)',
            
            # Inline citations
            r'\[Source:\s*([^\]]+)\]',
            r'\(Source:\s*([^)]+)\)',
            r'\[Ref:\s*([^\]]+)\]',
            r'\(Ref:\s*([^)]+)\)',
            
            # Document references
            r'According to\s+([^,\.;]+)',
            r'Based on\s+([^,\.;]+)',
            r'From\s+([^,\.;]+)',
            r'In\s+([^,\.;]+),?\s+it states',
            r'As mentioned in\s+([^,\.;]+)',
            
            # URL patterns
            r'https?://[^\s\)]+',
            
            # File references
            r'([^\s]+\.(?:pdf|doc|docx|txt|html|htm))',
        ]
        
        self.quality_indicators = {
            'has_url': 1.0,
            'has_title': 0.8,
            'has_page_number': 0.6,
            'has_author': 0.7,
            'has_date': 0.5,
            'proper_format': 0.4
        }
    
    def extract_citations(
        self, 
        response_text: str, 
        max_results: int = 10,
        min_quality_score: float = 0.3
    ) -> List[Citation]:
        """
        Extract and rank citations from response text.
        
        Args:
            response_text: The RAG response text
            max_results: Maximum number of citations to return
            min_quality_score: Minimum quality score for citations
            
        Returns:
            List of Citation objects, sorted by quality score
        """
        citations = []
        seen_sources = set()
        citation_id = 1
        
        try:
            # Extract citations using different patterns
            for pattern in self.citation_patterns:
                matches = re.finditer(pattern, response_text, re.IGNORECASE | re.MULTILINE)
                
                for match in matches:
                    citation_text = match.group(1) if match.groups() else match.group(0)
                    citation_text = citation_text.strip()
                    
                    # Skip if we've seen this source before
                    source_hash = self._get_source_hash(citation_text)
                    if source_hash in seen_sources:
                        continue
                    
                    # Process the citation
                    citation = self._process_citation(citation_id, citation_text, response_text)
                    
                    if citation and citation.score >= min_quality_score:
                        citations.append(citation)
                        seen_sources.add(source_hash)
                        citation_id += 1
                        
                        if len(citations) >= max_results:
                            break
                
                if len(citations) >= max_results:
                    break
            
            # If no explicit citations found, try implicit extraction
            if not citations:
                citations = self._extract_implicit_citations(response_text, max_results)
            
            # Sort by quality score (descending)
            citations.sort(key=lambda c: c.score, reverse=True)
            
            logger.info(f"Extracted {len(citations)} citations with quality scores")
            return citations[:max_results]
            
        except Exception as e:
            logger.error(f"Citation extraction failed: {e}")
            return []
    
    def _process_citation(
        self, 
        citation_id: int, 
        citation_text: str, 
        full_response: str
    ) -> Optional[Citation]:
        """Process and validate a single citation."""
        try:
            # Parse citation components
            components = self._parse_citation_components(citation_text)
            
            # Calculate quality score
            quality_score = self._calculate_quality_score(components)
            
            # Extract context from the full response
            context = self._extract_context(citation_text, full_response)
            
            return Citation(
                id=f"citation_{citation_id}",
                title=components.get('title', citation_text[:100]),
                content=context or citation_text[:200],
                url=components.get('url'),
                score=quality_score
            )
            
        except Exception as e:
            logger.warning(f"Failed to process citation '{citation_text}': {e}")
            return None
    
    def _parse_citation_components(self, citation_text: str) -> Dict[str, Any]:
        """Parse components from citation text."""
        components = {}
        
        # Extract URL
        url_match = re.search(r'https?://[^\s\)]+', citation_text)
        if url_match:
            components['url'] = url_match.group(0)
            # Remove URL from text for further parsing
            citation_text = citation_text.replace(url_match.group(0), '').strip()
        
        # Extract file name/title
        # Remove numbering and common prefixes
        title = re.sub(r'^\d+[\)\.]\s*', '', citation_text).strip()
        title = re.sub(r'^(Source:|Ref:|From:|According to|Based on)\s*', '', title, flags=re.IGNORECASE).strip()
        
        if title:
            components['title'] = title
        
        # Extract page numbers
        page_match = re.search(r'(?:p(?:age)?\.?\s*|pp\.?\s*)(\d+(?:-\d+)?)', citation_text, re.IGNORECASE)
        if page_match:
            components['page'] = page_match.group(1)
        
        # Extract years/dates
        year_match = re.search(r'\b(19|20)\d{2}\b', citation_text)
        if year_match:
            components['year'] = year_match.group(0)
        
        # Extract author patterns
        author_match = re.search(r'by\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)', citation_text)
        if author_match:
            components['author'] = author_match.group(1)
        
        return components
    
    def _calculate_quality_score(self, components: Dict[str, Any]) -> float:
        """Calculate quality score for a citation."""
        score = 0.3  # Base score
        
        # Add scores for different components
        if components.get('url'):
            score += self.quality_indicators['has_url']
        
        if components.get('title') and len(components['title']) > 5:
            score += self.quality_indicators['has_title']
        
        if components.get('page'):
            score += self.quality_indicators['has_page_number']
        
        if components.get('author'):
            score += self.quality_indicators['has_author']
        
        if components.get('year'):
            score += self.quality_indicators['has_date']
        
        # Normalize to 0-1 range
        return min(1.0, score / 3.0)
    
    def _extract_context(self, citation_text: str, full_response: str, context_length: int = 150) -> Optional[str]:
        """Extract surrounding context for the citation."""
        try:
            # Find the citation in the response
            citation_pos = full_response.lower().find(citation_text.lower())
            
            if citation_pos == -1:
                return None
            
            # Extract context around the citation
            start = max(0, citation_pos - context_length // 2)
            end = min(len(full_response), citation_pos + len(citation_text) + context_length // 2)
            
            context = full_response[start:end].strip()
            
            # Clean up the context
            context = re.sub(r'\s+', ' ', context)
            
            return context if context != citation_text else None
            
        except Exception:
            return None
    
    def _extract_implicit_citations(self, response_text: str, max_results: int) -> List[Citation]:
        """Extract implicit citations when no explicit ones are found."""
        citations = []
        citation_id = 1
        
        try:
            # Look for document/source mentions
            implicit_patterns = [
                r'according to\s+([^,\.;]+)',
                r'based on\s+([^,\.;]+)',
                r'from\s+([^,\.;]+)',
                r'as stated in\s+([^,\.;]+)',
                r'referenced in\s+([^,\.;]+)',
                r'mentioned in\s+([^,\.;]+)'
            ]
            
            found_sources = set()
            
            for pattern in implicit_patterns:
                matches = re.finditer(pattern, response_text, re.IGNORECASE)
                
                for match in matches:
                    source = match.group(1).strip()
                    source_hash = self._get_source_hash(source)
                    
                    if source_hash not in found_sources and len(citations) < max_results:
                        citation = Citation(
                            id=f"implicit_{citation_id}",
                            title=source,
                            content=f"Referenced as: {match.group(0)}",
                            url=None,
                            score=0.4  # Lower score for implicit citations
                        )
                        citations.append(citation)
                        found_sources.add(source_hash)
                        citation_id += 1
            
            return citations
            
        except Exception as e:
            logger.warning(f"Implicit citation extraction failed: {e}")
            return []
    
    def _get_source_hash(self, source_text: str) -> str:
        """Get a hash for source deduplication."""
        # Normalize text for comparison
        normalized = re.sub(r'\s+', ' ', source_text.lower().strip())
        normalized = re.sub(r'[^\w\s]', '', normalized)
        return hashlib.md5(normalized.encode()).hexdigest()


class CitationRanker:
    """Ranks citations by relevance and quality."""
    
    def __init__(self):
        self.relevance_factors = {
            'query_overlap': 0.4,
            'position_in_response': 0.2,
            'citation_quality': 0.3,
            'source_authority': 0.1
        }
    
    def rank_citations(
        self, 
        citations: List[Citation], 
        query: str, 
        response: str
    ) -> List[Citation]:
        """Rank citations by relevance to the query."""
        try:
            query_words = set(query.lower().split())
            
            for citation in citations:
                relevance_score = self._calculate_relevance(
                    citation, query_words, response
                )
                # Update the citation score with relevance
                citation.score = (citation.score + relevance_score) / 2
            
            # Sort by final score
            citations.sort(key=lambda c: c.score, reverse=True)
            return citations
            
        except Exception as e:
            logger.error(f"Citation ranking failed: {e}")
            return citations
    
    def _calculate_relevance(
        self, 
        citation: Citation, 
        query_words: Set[str], 
        response: str
    ) -> float:
        """Calculate relevance score for a citation."""
        relevance = 0.0
        
        try:
            # Query overlap score
            citation_words = set(citation.title.lower().split())
            overlap = len(query_words.intersection(citation_words))
            query_overlap_score = min(1.0, overlap / len(query_words)) if query_words else 0
            relevance += query_overlap_score * self.relevance_factors['query_overlap']
            
            # Position score (earlier = more relevant)
            position = response.find(citation.title)
            if position >= 0:
                position_score = 1.0 - (position / len(response))
                relevance += position_score * self.relevance_factors['position_in_response']
            
            # Citation quality score
            relevance += citation.score * self.relevance_factors['citation_quality']
            
            # Source authority (basic implementation)
            authority_score = self._get_source_authority(citation)
            relevance += authority_score * self.relevance_factors['source_authority']
            
        except Exception as e:
            logger.warning(f"Relevance calculation failed for citation {citation.id}: {e}")
        
        return min(1.0, relevance)
    
    def _get_source_authority(self, citation: Citation) -> float:
        """Get basic source authority score."""
        if not citation.url:
            return 0.5
        
        try:
            domain = urlparse(citation.url).netloc.lower()
            
            # Authority indicators
            if any(indicator in domain for indicator in ['.edu', '.gov', '.org']):
                return 0.9
            elif any(indicator in domain for indicator in ['wikipedia', 'scholar', 'arxiv']):
                return 0.8
            elif domain.startswith('www.'):
                return 0.6
            else:
                return 0.5
                
        except Exception:
            return 0.5