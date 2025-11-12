"""FastAPI main application for Chatbot RAG API."""

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager

from app.api import chat, health
from app.api.v1 import v1_router
from app.core.config import settings
from app.core.security import SecurityHeaders
from app.utils.logger import setup_logging, get_logger
from app.models.chat import ErrorResponse
from app.db.database import init_database


# Set up logging
setup_logging()
logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan management."""
    # Startup
    logger.info("Starting Chatbot RAG API...")
    logger.info(f"RAG Corpus: {settings.rag_corpus}")
    logger.info(f"API Debug Mode: {settings.api_debug}")
    
    # Initialize database
    try:
        await init_database()
        logger.info("Database initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize database: {e}")
        raise
    
    yield
    
    # Shutdown
    logger.info("Shutting down Chatbot RAG API...")


# Create FastAPI application
app = FastAPI(
    title="Chatbot RAG API",
    description="FastAPI wrapper around Google Gemini RAG for chatbot integration",
    version="1.0.0",
    docs_url="/docs" if settings.api_debug else None,
    redoc_url="/redoc" if settings.api_debug else None,
    lifespan=lifespan
)

# CORS middleware for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"]
)


# Security headers middleware
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    """Add security headers to all responses."""
    response = await call_next(request)
    
    # Add security headers
    for header, value in SecurityHeaders.get_security_headers().items():
        response.headers[header] = value
    
    return response


# Exception handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc: HTTPException):
    """Handle HTTP exceptions with consistent error format."""
    logger.error(f"HTTP Exception: {exc.status_code} - {exc.detail}")
    
    # Check if detail is already a dict (from our custom exceptions)
    if isinstance(exc.detail, dict):
        return JSONResponse(
            status_code=exc.status_code,
            content=exc.detail
        )
    
    # Create standardized error response
    error_response = ErrorResponse.create(
        message=str(exc.detail),
        error_code=f"HTTP_{exc.status_code}"
    )
    
    return JSONResponse(
        status_code=exc.status_code,
        content=error_response.dict()
    )


@app.exception_handler(Exception)
async def general_exception_handler(request, exc: Exception):
    """Handle general exceptions."""
    logger.error(f"Unhandled exception: {exc}")
    
    error_response = ErrorResponse.create(
        message="Internal server error",
        error_code="INTERNAL_ERROR",
        context={"exception_type": type(exc).__name__}
    )
    
    return JSONResponse(
        status_code=500,
        content=error_response.dict()
    )


# Include routers
app.include_router(
    chat.router, 
    prefix="/api/v1/chat", 
    tags=["chat"]
)

app.include_router(
    health.router, 
    prefix="/api/v1/health", 
    tags=["health"]
)

# Include RAG management routers
app.include_router(
    v1_router,
    prefix="/api"
)


# Root endpoint
@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "message": "Chatbot RAG API",
        "version": "1.0.0",
        "docs_url": "/docs" if settings.api_debug else "Documentation disabled",
        "health_check": "/api/v1/health"
    }


# Additional endpoints for debugging (only in debug mode)
if settings.api_debug:
    @app.get("/debug/config")
    async def debug_config():
        """Debug endpoint to show current configuration (sensitive data excluded)."""
        return {
            "api_host": settings.api_host,
            "api_port": settings.api_port,
            "api_debug": settings.api_debug,
            "google_cloud_project": settings.google_cloud_project,
            "google_cloud_location": settings.google_cloud_location,
            "rag_corpus_configured": bool(settings.rag_corpus),
            "cors_origins": settings.cors_origins,
            "log_level": settings.log_level
        }


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "app.main:app",
        host=settings.api_host,
        port=settings.api_port,
        reload=settings.api_debug,
        log_level=settings.log_level.lower()
    )