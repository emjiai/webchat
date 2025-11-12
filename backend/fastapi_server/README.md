# FastAPI RAG Server

FastAPI wrapper around Google's Gemini RAG implementation for chatbot integration.

## Quick Start

1. **Install Dependencies**
   ```bash
   cd backend/fastapi_server
   python -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your Google Cloud and RAG configuration
   ```

3. **Run Server**
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```

4. **Test API**
   - Health check: `http://localhost:8000/api/v1/health`
   - API docs: `http://localhost:8000/docs`

## Project Structure

```
app/
├── main.py              # FastAPI application
├── api/
│   ├── chat.py          # Chat endpoints
│   └── health.py        # Health check endpoints
├── core/
│   ├── config.py        # Configuration management
│   └── rag_wrapper.py   # Google RAG wrapper
├── models/
│   └── chat.py          # Pydantic models
└── utils/
    ├── logger.py        # Logging configuration
    └── exceptions.py    # Custom exceptions
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/chat/message` | Process chat message with RAG |
| POST | `/api/v1/chat/stream` | Stream chat response |
| GET | `/api/v1/health` | Health check |
| GET | `/api/v1/health/rag` | RAG service status |

## Configuration

Required environment variables:

```env
# Google Cloud Configuration
GOOGLE_CLOUD_PROJECT=your-project-id
GOOGLE_CLOUD_LOCATION=us-central1
RAG_CORPUS=projects/123/locations/us-central1/ragCorpora/456

# FastAPI Configuration
API_HOST=0.0.0.0
API_PORT=8000
API_DEBUG=True
```

## Development

- Run with reload: `uvicorn app.main:app --reload`
- View logs: Structured JSON logging to stdout
- Debug config: `GET /debug/config` (debug mode only)