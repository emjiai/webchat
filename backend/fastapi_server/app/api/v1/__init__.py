"""API v1 package initialization."""

from fastapi import APIRouter
from .rag import corpus, documents

# Create v1 router
v1_router = APIRouter(prefix="/v1")

# Include RAG routers
v1_router.include_router(corpus.router, prefix="/rag", tags=["rag-corpus"])
v1_router.include_router(documents.router, prefix="/rag", tags=["rag-documents"])

__all__ = ["v1_router"]