"""Security and authentication utilities."""

import hashlib
import hmac
import time
import secrets
from typing import Optional, Dict, Any
from datetime import datetime, timedelta
from functools import wraps

from fastapi import HTTPException, status, Request, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from app.core.config import settings
from app.utils.logger import get_logger

logger = get_logger(__name__)


class APIKeyAuth:
    """API Key authentication handler."""
    
    def __init__(self):
        self.security = HTTPBearer(auto_error=False)
        self.valid_keys = self._load_api_keys()
    
    def _load_api_keys(self) -> Dict[str, Dict[str, Any]]:
        """Load API keys from environment or configuration."""
        # In production, load from secure storage (database, vault, etc.)
        # For now, use environment variables
        keys = {}
        
        # Example: Load from env vars like API_KEY_1, API_KEY_2, etc.
        import os
        for key, value in os.environ.items():
            if key.startswith('CHATBOT_API_KEY_'):
                key_name = key.replace('CHATBOT_API_KEY_', '')
                keys[value] = {
                    'name': key_name,
                    'created_at': datetime.utcnow(),
                    'permissions': ['chat', 'rag', 'stream'],
                    'rate_limit': 100  # requests per minute
                }
        
        # Add default development key if in debug mode
        if settings.api_debug and not keys:
            dev_key = "dev_key_12345"
            keys[dev_key] = {
                'name': 'development',
                'created_at': datetime.utcnow(),
                'permissions': ['chat', 'rag', 'stream'],
                'rate_limit': 1000
            }
            logger.warning(f"Using development API key: {dev_key}")
        
        return keys
    
    async def authenticate(
        self, 
        credentials: Optional[HTTPAuthorizationCredentials] = Depends(HTTPBearer(auto_error=False))
    ) -> Optional[Dict[str, Any]]:
        """Authenticate API key from Bearer token."""
        if not credentials:
            return None
        
        api_key = credentials.credentials
        
        if api_key in self.valid_keys:
            key_info = self.valid_keys[api_key]
            logger.info(f"Authenticated API key: {key_info['name']}")
            return {
                'api_key': api_key,
                'key_name': key_info['name'],
                'permissions': key_info['permissions'],
                'rate_limit': key_info['rate_limit']
            }
        
        logger.warning(f"Invalid API key attempted: {api_key[:10]}...")
        return None
    
    def require_auth(self, permission: str = None):
        """Decorator to require authentication for endpoints."""
        def decorator(func):
            @wraps(func)
            async def wrapper(*args, **kwargs):
                # Extract request and auth info from kwargs
                request = kwargs.get('request')
                auth_info = kwargs.get('auth_info')
                
                if not auth_info:
                    raise HTTPException(
                        status_code=status.HTTP_401_UNAUTHORIZED,
                        detail="API key required",
                        headers={"WWW-Authenticate": "Bearer"},
                    )
                
                if permission and permission not in auth_info.get('permissions', []):
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail=f"Permission '{permission}' required"
                    )
                
                return await func(*args, **kwargs)
            return wrapper
        return decorator


class RateLimiter:
    """Rate limiting implementation."""
    
    def __init__(self):
        self.requests = {}  # In production, use Redis or similar
        self.cleanup_interval = 300  # 5 minutes
        self.last_cleanup = time.time()
    
    async def check_rate_limit(
        self, 
        identifier: str, 
        limit: int, 
        window: int = 60
    ) -> bool:
        """
        Check if request is within rate limit.
        
        Args:
            identifier: Unique identifier (IP, API key, etc.)
            limit: Maximum requests allowed
            window: Time window in seconds
            
        Returns:
            True if within limit, False if exceeded
        """
        current_time = time.time()
        
        # Cleanup old entries periodically
        if current_time - self.last_cleanup > self.cleanup_interval:
            self._cleanup_old_requests(current_time - window)
            self.last_cleanup = current_time
        
        # Get request history for identifier
        if identifier not in self.requests:
            self.requests[identifier] = []
        
        request_times = self.requests[identifier]
        
        # Remove requests outside the window
        request_times = [t for t in request_times if current_time - t < window]
        self.requests[identifier] = request_times
        
        # Check if limit exceeded
        if len(request_times) >= limit:
            logger.warning(f"Rate limit exceeded for {identifier}: {len(request_times)}/{limit}")
            return False
        
        # Add current request
        request_times.append(current_time)
        return True
    
    def _cleanup_old_requests(self, cutoff_time: float):
        """Remove old request records."""
        for identifier in list(self.requests.keys()):
            self.requests[identifier] = [
                t for t in self.requests[identifier] 
                if t > cutoff_time
            ]
            # Remove empty entries
            if not self.requests[identifier]:
                del self.requests[identifier]
    
    async def rate_limit_dependency(
        self, 
        request: Request,
        auth_info: Optional[Dict[str, Any]] = None
    ):
        """FastAPI dependency for rate limiting."""
        # Use API key as identifier if available, otherwise use IP
        if auth_info:
            identifier = auth_info['api_key']
            limit = auth_info.get('rate_limit', 60)
        else:
            identifier = request.client.host if request.client else 'unknown'
            limit = 20  # Lower limit for unauthenticated requests
        
        if not await self.check_rate_limit(identifier, limit):
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Rate limit exceeded"
            )


class RequestValidator:
    """Request validation and sanitization."""
    
    @staticmethod
    def sanitize_input(text: str, max_length: int = 4000) -> str:
        """Sanitize user input."""
        if not isinstance(text, str):
            raise ValueError("Input must be a string")
        
        # Truncate if too long
        if len(text) > max_length:
            text = text[:max_length]
        
        # Remove potentially harmful patterns
        # Remove control characters except newlines and tabs
        import re
        text = re.sub(r'[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]', '', text)
        
        # Basic XSS protection
        dangerous_patterns = [
            r'<script[^>]*>.*?</script>',
            r'javascript:',
            r'data:',
            r'vbscript:',
        ]
        
        for pattern in dangerous_patterns:
            text = re.sub(pattern, '', text, flags=re.IGNORECASE | re.DOTALL)
        
        return text.strip()
    
    @staticmethod
    def validate_chatbot_id(chatbot_id: str) -> str:
        """Validate and sanitize chatbot ID."""
        if not isinstance(chatbot_id, str):
            raise ValueError("Chatbot ID must be a string")
        
        # Allow only alphanumeric characters, hyphens, and underscores
        import re
        if not re.match(r'^[a-zA-Z0-9_-]+$', chatbot_id):
            raise ValueError("Invalid chatbot ID format")
        
        if len(chatbot_id) > 100:
            raise ValueError("Chatbot ID too long")
        
        return chatbot_id


class SecurityHeaders:
    """Security headers middleware."""
    
    @staticmethod
    def get_security_headers() -> Dict[str, str]:
        """Get recommended security headers."""
        return {
            "X-Content-Type-Options": "nosniff",
            "X-Frame-Options": "DENY",
            "X-XSS-Protection": "1; mode=block",
            "Referrer-Policy": "strict-origin-when-cross-origin",
            "Permissions-Policy": "geolocation=(), microphone=(), camera=()",
        }


# Global instances
api_key_auth = APIKeyAuth()
rate_limiter = RateLimiter()
request_validator = RequestValidator()


# Dependencies for FastAPI
async def get_auth_info(
    auth_info: Optional[Dict[str, Any]] = Depends(api_key_auth.authenticate)
) -> Optional[Dict[str, Any]]:
    """Get authentication info dependency."""
    return auth_info


async def require_auth(
    auth_info: Optional[Dict[str, Any]] = Depends(get_auth_info)
) -> Dict[str, Any]:
    """Require authentication dependency."""
    if not auth_info:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return auth_info


async def check_rate_limit(
    request: Request,
    auth_info: Optional[Dict[str, Any]] = Depends(get_auth_info)
):
    """Rate limiting dependency."""
    await rate_limiter.rate_limit_dependency(request, auth_info)


def create_api_key() -> str:
    """Generate a new API key."""
    return f"chatbot_{''.join(secrets.choice('abcdefghijklmnopqrstuvwxyz0123456789') for _ in range(32))}"


async def get_api_key(
    auth_info: Optional[Dict[str, Any]] = Depends(get_auth_info)
) -> str:
    """Get API key from authentication info (for endpoints that require auth)."""
    if not auth_info:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="API key required",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return auth_info['api_key']