"""Database configuration and session management."""

import os
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase

from ..core.config import get_settings

settings = get_settings()


class Base(DeclarativeBase):
    """Base class for all database models."""
    pass


# Database URL - defaults to SQLite for development
DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "sqlite+aiosqlite:///./rag_corpus.db"
)

# For PostgreSQL in production, use format:
# postgresql+asyncpg://user:password@localhost/dbname
if DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)

engine = create_async_engine(
    DATABASE_URL,
    echo=settings.api_debug,  # Log SQL queries in debug mode
    future=True,
    pool_pre_ping=True,
)

AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


async def init_database() -> None:
    """Initialize database tables."""
    from .models import Base as ModelsBase
    
    async with engine.begin() as conn:
        await conn.run_sync(ModelsBase.metadata.create_all)


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    """Get database session."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


def get_database():
    """Get database engine for external use."""
    return engine