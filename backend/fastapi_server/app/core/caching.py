"""Caching and performance optimization utilities."""

import asyncio
import hashlib
import json
import time
from typing import Any, Dict, Optional, List, Callable
from datetime import datetime, timedelta
from functools import wraps, lru_cache

from app.utils.logger import get_logger

logger = get_logger(__name__)


class MemoryCache:
    """In-memory cache with TTL support."""
    
    def __init__(self, default_ttl: int = 300):  # 5 minutes default
        self.cache: Dict[str, Dict[str, Any]] = {}
        self.default_ttl = default_ttl
        self.stats = {
            'hits': 0,
            'misses': 0,
            'sets': 0,
            'deletes': 0,
            'cleanups': 0
        }
        self.last_cleanup = time.time()
        self.cleanup_interval = 60  # Clean up every minute
    
    def _generate_key(self, *args, **kwargs) -> str:
        """Generate cache key from arguments."""
        key_data = {
            'args': args,
            'kwargs': kwargs
        }
        key_str = json.dumps(key_data, sort_keys=True, default=str)
        return hashlib.md5(key_str.encode()).hexdigest()
    
    def _cleanup_expired(self):
        """Remove expired cache entries."""
        current_time = time.time()
        
        if current_time - self.last_cleanup < self.cleanup_interval:
            return
        
        expired_keys = []
        for key, entry in self.cache.items():
            if entry['expires_at'] < current_time:
                expired_keys.append(key)
        
        for key in expired_keys:
            del self.cache[key]
        
        self.stats['cleanups'] += 1
        self.last_cleanup = current_time
        
        if expired_keys:
            logger.debug(f"Cleaned up {len(expired_keys)} expired cache entries")
    
    def get(self, key: str) -> Optional[Any]:
        """Get value from cache."""
        self._cleanup_expired()
        
        if key in self.cache:
            entry = self.cache[key]
            if entry['expires_at'] > time.time():
                self.stats['hits'] += 1
                logger.debug(f"Cache hit for key: {key[:16]}...")
                return entry['value']
            else:
                del self.cache[key]
        
        self.stats['misses'] += 1
        logger.debug(f"Cache miss for key: {key[:16]}...")
        return None
    
    def set(self, key: str, value: Any, ttl: Optional[int] = None) -> None:
        """Set value in cache with TTL."""
        ttl = ttl or self.default_ttl
        expires_at = time.time() + ttl
        
        self.cache[key] = {
            'value': value,
            'expires_at': expires_at,
            'created_at': time.time()
        }
        
        self.stats['sets'] += 1
        logger.debug(f"Cache set for key: {key[:16]}... (TTL: {ttl}s)")
    
    def delete(self, key: str) -> bool:
        """Delete key from cache."""
        if key in self.cache:
            del self.cache[key]
            self.stats['deletes'] += 1
            logger.debug(f"Cache delete for key: {key[:16]}...")
            return True
        return False
    
    def clear(self) -> None:
        """Clear all cache entries."""
        count = len(self.cache)
        self.cache.clear()
        logger.info(f"Cache cleared ({count} entries removed)")
    
    def get_stats(self) -> Dict[str, Any]:
        """Get cache statistics."""
        total_requests = self.stats['hits'] + self.stats['misses']
        hit_rate = (self.stats['hits'] / total_requests * 100) if total_requests > 0 else 0
        
        return {
            'entries': len(self.cache),
            'hit_rate': f"{hit_rate:.2f}%",
            'stats': self.stats.copy()
        }


class RAGQueryCache:
    """Specialized cache for RAG queries with semantic similarity."""
    
    def __init__(self, cache_size: int = 1000, ttl: int = 1800):  # 30 minutes
        self.memory_cache = MemoryCache(default_ttl=ttl)
        self.cache_size = cache_size
        self.query_cache: Dict[str, List[str]] = {}  # query -> list of cache keys
    
    def _normalize_query(self, query: str) -> str:
        """Normalize query for better cache matching."""
        # Convert to lowercase and remove extra whitespace
        normalized = ' '.join(query.lower().strip().split())
        
        # Remove common question words that don't affect meaning
        stop_words = {'what', 'how', 'why', 'when', 'where', 'who', 'is', 'are', 'the', 'a', 'an'}
        words = normalized.split()
        filtered_words = [w for w in words if w not in stop_words]
        
        return ' '.join(filtered_words)
    
    def _calculate_similarity(self, query1: str, query2: str) -> float:
        """Calculate basic text similarity between queries."""
        words1 = set(query1.split())
        words2 = set(query2.split())
        
        if not words1 or not words2:
            return 0.0
        
        intersection = len(words1.intersection(words2))
        union = len(words1.union(words2))
        
        return intersection / union if union > 0 else 0.0
    
    def _find_similar_query(self, query: str, similarity_threshold: float = 0.8) -> Optional[str]:
        """Find a similar cached query."""
        normalized_query = self._normalize_query(query)
        
        for cached_query in self.query_cache.keys():
            similarity = self._calculate_similarity(normalized_query, cached_query)
            if similarity >= similarity_threshold:
                logger.debug(f"Found similar query (similarity: {similarity:.2f}): {cached_query}")
                return cached_query
        
        return None
    
    async def get_cached_response(
        self, 
        query: str, 
        max_results: int, 
        similarity_threshold: float = 0.8
    ) -> Optional[Dict[str, Any]]:
        """Get cached RAG response for query or similar query."""
        cache_key = self.memory_cache._generate_key(query, max_results)
        
        # Try exact match first
        cached_response = self.memory_cache.get(cache_key)
        if cached_response:
            logger.info("Cache hit: exact query match")
            return cached_response
        
        # Try similarity match
        similar_query = self._find_similar_query(query, similarity_threshold)
        if similar_query:
            similar_cache_key = self.memory_cache._generate_key(similar_query, max_results)
            cached_response = self.memory_cache.get(similar_cache_key)
            if cached_response:
                logger.info(f"Cache hit: similar query match")
                return cached_response
        
        return None
    
    async def cache_response(
        self, 
        query: str, 
        max_results: int, 
        response: Dict[str, Any],
        ttl: Optional[int] = None
    ) -> None:
        """Cache RAG response."""
        cache_key = self.memory_cache._generate_key(query, max_results)
        normalized_query = self._normalize_query(query)
        
        # Cache the response
        self.memory_cache.set(cache_key, response, ttl)
        
        # Track query for similarity matching
        if normalized_query not in self.query_cache:
            self.query_cache[normalized_query] = []
        
        if cache_key not in self.query_cache[normalized_query]:
            self.query_cache[normalized_query].append(cache_key)
        
        # Limit cache size
        await self._enforce_cache_limit()
    
    async def _enforce_cache_limit(self):
        """Remove oldest entries if cache exceeds size limit."""
        if len(self.memory_cache.cache) > self.cache_size:
            # Remove 10% of oldest entries
            entries_to_remove = int(self.cache_size * 0.1)
            
            # Sort by creation time
            sorted_entries = sorted(
                self.memory_cache.cache.items(),
                key=lambda x: x[1]['created_at']
            )
            
            for key, _ in sorted_entries[:entries_to_remove]:
                self.memory_cache.delete(key)
            
            logger.info(f"Cache limit enforced: removed {entries_to_remove} entries")


# Global cache instances
query_cache = RAGQueryCache()
response_cache = MemoryCache(default_ttl=300)  # 5 minutes for general responses


def cache_rag_query(ttl: int = 1800, similarity_threshold: float = 0.8):
    """Decorator to cache RAG query results."""
    def decorator(func: Callable):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Extract query and max_results from arguments
            query = args[1] if len(args) > 1 else kwargs.get('query', '')
            max_results = args[2] if len(args) > 2 else kwargs.get('max_results', 10)
            
            # Try to get cached response
            cached_response = await query_cache.get_cached_response(
                query, max_results, similarity_threshold
            )
            
            if cached_response:
                return cached_response
            
            # Execute function and cache result
            result = await func(*args, **kwargs)
            
            if result:  # Only cache successful responses
                await query_cache.cache_response(query, max_results, result, ttl)
            
            return result
        return wrapper
    return decorator


@lru_cache(maxsize=128)
def get_cached_model_config(model_name: str) -> Dict[str, Any]:
    """Cache model configuration."""
    # This would load model config from database/file
    # For now, return default config
    return {
        'temperature': 0.7,
        'max_tokens': 2048,
        'timeout': 30
    }


class PerformanceMonitor:
    """Monitor performance metrics."""
    
    def __init__(self):
        self.metrics: Dict[str, List[float]] = {}
    
    def record_metric(self, name: str, value: float):
        """Record a performance metric."""
        if name not in self.metrics:
            self.metrics[name] = []
        
        self.metrics[name].append(value)
        
        # Keep only last 1000 measurements
        if len(self.metrics[name]) > 1000:
            self.metrics[name] = self.metrics[name][-1000:]
    
    def get_stats(self, name: str) -> Dict[str, float]:
        """Get statistics for a metric."""
        if name not in self.metrics or not self.metrics[name]:
            return {}
        
        values = self.metrics[name]
        return {
            'count': len(values),
            'avg': sum(values) / len(values),
            'min': min(values),
            'max': max(values),
            'recent_avg': sum(values[-10:]) / min(len(values), 10)
        }


# Global performance monitor
performance_monitor = PerformanceMonitor()


def monitor_performance(metric_name: str):
    """Decorator to monitor function performance."""
    def decorator(func: Callable):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            start_time = time.time()
            
            try:
                result = await func(*args, **kwargs)
                return result
            finally:
                duration = (time.time() - start_time) * 1000  # Convert to milliseconds
                performance_monitor.record_metric(metric_name, duration)
        return wrapper
    return decorator