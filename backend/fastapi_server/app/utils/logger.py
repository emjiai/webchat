"""Logging configuration for the application."""

import logging
import sys
from typing import Optional
from pythonjsonlogger import jsonlogger
from app.core.config import settings


def setup_logging(log_level: Optional[str] = None) -> logging.Logger:
    """Set up structured JSON logging."""
    
    if log_level is None:
        log_level = settings.log_level
    
    # Create logger
    logger = logging.getLogger("chatbot_rag_api")
    logger.setLevel(getattr(logging, log_level.upper()))
    
    # Clear existing handlers
    logger.handlers.clear()
    
    # Create console handler with JSON formatter
    console_handler = logging.StreamHandler(sys.stdout)
    
    # JSON formatter for structured logging
    json_formatter = jsonlogger.JsonFormatter(
        fmt='%(asctime)s %(name)s %(levelname)s %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    
    console_handler.setFormatter(json_formatter)
    logger.addHandler(console_handler)
    
    # Prevent propagation to root logger
    logger.propagate = False
    
    return logger


def get_logger(name: str = "chatbot_rag_api") -> logging.Logger:
    """Get a logger instance."""
    return logging.getLogger(name)


# Initialize default logger
default_logger = setup_logging()