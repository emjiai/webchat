"""Configuration management for FastAPI application."""

import os
from typing import List
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

load_dotenv()


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # Google RAG Configuration (matching gemini_rag structure)
    google_genai_use_vertexai: int = int(os.getenv("GOOGLE_GENAI_USE_VERTEXAI", "1"))
    google_api_key: str = os.getenv("GOOGLE_API_KEY", "")
    google_cloud_project: str = os.getenv("GOOGLE_CLOUD_PROJECT", "")
    google_cloud_location: str = os.getenv("GOOGLE_CLOUD_LOCATION", "us-central1")
    rag_corpus: str = os.getenv("RAG_CORPUS", "")
    staging_bucket: str = os.getenv("STAGING_BUCKET", "")
    agent_engine_id: str = os.getenv("AGENT_ENGINE_ID", "")
    
    # Google Cloud Authentication
    google_application_credentials: str = os.getenv("GOOGLE_APPLICATION_CREDENTIALS", "")
    google_cloud_bucket: str = os.getenv("GOOGLE_CLOUD_BUCKET", "")
    
    # API Configuration
    api_host: str = os.getenv("API_HOST", "0.0.0.0")
    api_port: int = int(os.getenv("API_PORT", "8000"))
    api_debug: bool = os.getenv("API_DEBUG", "True").lower() == "true"
    
    # CORS Configuration
    cors_origins: List[str] = ["http://localhost:3005", "http://127.0.0.1:3005"]
    
    # Logging
    log_level: str = os.getenv("LOG_LEVEL", "INFO")
    
    # Security (Future enhancement)
    api_key_header: str = os.getenv("API_KEY_HEADER", "X-API-Key")
    rate_limit_per_minute: int = int(os.getenv("RATE_LIMIT_PER_MINUTE", "60"))
    
    class Config:
        env_file = ".env"
        case_sensitive = False
        extra = "ignore"  # Ignore extra environment variables


# Global settings instance
settings = Settings()


def get_settings() -> Settings:
    """Get application settings."""
    return settings