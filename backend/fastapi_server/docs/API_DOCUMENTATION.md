# Chatbot RAG API Documentation

## Overview

The Chatbot RAG API provides a RESTful interface to integrate Google's Gemini RAG (Retrieval-Augmented Generation) implementation with frontend chatbot applications. The API offers both traditional request-response and real-time streaming capabilities with comprehensive authentication, caching, and monitoring.

## Base URL

- **Development**: `http://localhost:8000`
- **Production**: `https://your-domain.com/api/v1`

## Authentication

The API supports API key authentication using Bearer tokens.

### Getting an API Key

Contact your administrator or use the development key for testing:
- **Development Key**: `dev_key_12345` (only available in debug mode)

### Authentication Header

Include the API key in the Authorization header:

```http
Authorization: Bearer your_api_key_here
```

## Rate Limiting

- **Authenticated requests**: 100 requests/minute per API key
- **Unauthenticated requests**: 20 requests/minute per IP address

Rate limit information is included in response headers:
- `X-RateLimit-Limit`: Request limit per window
- `X-RateLimit-Remaining`: Remaining requests in current window
- `X-RateLimit-Reset`: Time when rate limit resets

## Core Endpoints

### 1. Process Chat Message

Process a single chat message with optional RAG integration.

**Endpoint**: `POST /api/v1/chat/message`

**Request Body**:
```json
{
  "message": "What are the key features of RAG?",
  "chatbot_id": "my_chatbot_123",
  "rag_enabled": true,
  "max_results": 10,
  "temperature": 0.7,
  "model": "gemini-2.5-flash"
}
```

**Response**:
```json
{
  "content": "RAG (Retrieval-Augmented Generation) has several key features...",
  "citations": [
    {
      "id": "citation_1",
      "title": "RAG Implementation Guide",
      "content": "Relevant excerpt from the document...",
      "url": "https://example.com/doc.pdf",
      "score": 0.95
    }
  ],
  "model": "gemini-2.5-flash",
  "timestamp": "2024-11-12T15:30:00Z",
  "chatbot_id": "my_chatbot_123",
  "rag_enabled": true,
  "processing_time_ms": 1250
}
```

**Request Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `message` | string | Yes | User message (1-4000 characters) |
| `chatbot_id` | string | Yes | Chatbot instance identifier |
| `rag_enabled` | boolean | No | Enable RAG functionality (default: true) |
| `max_results` | integer | No | Max RAG results (1-20, default: 10) |
| `temperature` | float | No | Response temperature (0.0-1.0, default: 0.7) |
| `model` | string | No | Model to use (default: "gemini-2.5-flash") |

### 2. Stream Chat Message

Stream chat responses in real-time using Server-Sent Events.

**Endpoint**: `POST /api/v1/chat/stream`

**Request Body**: Same as `/chat/message`

**Response**: Server-Sent Events stream

```
event: status
data: {"type": "status", "message": "Processing your query...", "timestamp": "2024-11-12T15:30:00Z"}

event: content
data: {"type": "content", "text": "RAG (Retrieval-Augmented ", "timestamp": "2024-11-12T15:30:01Z"}

event: content
data: {"type": "content", "text": "Generation) has several ", "timestamp": "2024-11-12T15:30:01Z"}

event: citations
data: {"type": "citations", "citations": [...], "timestamp": "2024-11-12T15:30:05Z"}

event: metadata
data: {"type": "metadata", "model": "gemini-2.5-flash", "processing_time_ms": 1250, "citation_count": 3}

event: done
data: {"type": "done", "timestamp": "2024-11-12T15:30:05Z"}
```

**Event Types**:
- `status`: Processing status updates
- `content`: Streaming response content
- `citations`: Reference citations
- `metadata`: Response metadata
- `error`: Error information
- `done`: Stream completion

### 3. Health Checks

#### Basic Health Check

**Endpoint**: `GET /api/v1/health/`

**Response**:
```json
{
  "status": "healthy",
  "timestamp": "2024-11-12T15:30:00Z",
  "version": "1.0.0",
  "rag_available": true
}
```

#### RAG Service Status

**Endpoint**: `GET /api/v1/health/rag`

**Response**:
```json
{
  "status": "healthy",
  "details": {
    "available": true,
    "corpus": "projects/123/locations/us-central1/ragCorpora/456",
    "model": "gemini-2.5-flash"
  }
}
```

#### Comprehensive Health Check

**Endpoint**: `GET /api/v1/health/detailed`

**Response**:
```json
{
  "overall_status": "healthy",
  "timestamp": "2024-11-12T15:30:00Z",
  "checks": {
    "rag_service": {
      "status": "healthy",
      "available": true,
      "details": {...}
    },
    "cache_service": {
      "status": "healthy",
      "available": true,
      "stats": {...}
    },
    "performance": {
      "status": "healthy",
      "rag_performance": {...}
    }
  }
}
```

## Error Handling

The API returns structured error responses with appropriate HTTP status codes.

### Error Response Format

```json
{
  "message": "Error description",
  "error_code": "ERROR_CODE",
  "timestamp": "2024-11-12T15:30:00Z",
  "context": {
    "additional": "error details"
  }
}
```

### Common Error Codes

| HTTP Status | Error Code | Description |
|-------------|------------|-------------|
| 400 | `INVALID_REQUEST` | Invalid request parameters |
| 401 | `UNAUTHORIZED` | Missing or invalid API key |
| 403 | `FORBIDDEN` | Insufficient permissions |
| 429 | `RATE_LIMIT_EXCEEDED` | Rate limit exceeded |
| 500 | `INTERNAL_ERROR` | Server error |
| 503 | `RAG_NOT_CONFIGURED` | RAG service unavailable |

### Error Examples

**Invalid Request**:
```json
{
  "message": "Message cannot be empty",
  "error_code": "INVALID_REQUEST",
  "timestamp": "2024-11-12T15:30:00Z"
}
```

**Authentication Required**:
```json
{
  "message": "API key required",
  "error_code": "UNAUTHORIZED",
  "timestamp": "2024-11-12T15:30:00Z"
}
```

**RAG Service Unavailable**:
```json
{
  "message": "RAG service is not configured. Please check RAG_CORPUS environment variable.",
  "error_code": "RAG_NOT_CONFIGURED",
  "timestamp": "2024-11-12T15:30:00Z"
}
```

## Caching

The API implements intelligent caching to improve performance:

- **Query Similarity Matching**: Similar queries (80%+ similarity) return cached results
- **TTL**: Cached responses expire after 30 minutes
- **Cache Headers**: Include cache status in response headers

## Citation System

RAG responses include citations with quality scoring:

### Citation Object

```json
{
  "id": "citation_1",
  "title": "Document Title or Source",
  "content": "Relevant excerpt or context",
  "url": "https://source-url.com/document",
  "score": 0.95
}
```

### Citation Quality Factors

- **URL presence**: +1.0 score
- **Document title**: +0.8 score
- **Page numbers**: +0.6 score
- **Author information**: +0.7 score
- **Publication date**: +0.5 score

## Performance Monitoring

### Metrics Endpoints

**System Metrics**: `GET /api/v1/metrics/system`
```json
{
  "process": {
    "cpu_percent": 15.2,
    "memory_rss_mb": 256.8,
    "num_threads": 8
  },
  "system": {
    "cpu_percent": 45.1,
    "memory_used_percent": 67.3
  }
}
```

**Request Statistics**: `GET /api/v1/metrics/requests`
```json
{
  "total_requests": 1547,
  "error_rate": "2.3%",
  "avg_duration_ms": "875.32",
  "top_endpoints": [
    ["/api/v1/chat/message", 1205],
    ["/api/v1/chat/stream", 342]
  ]
}
```

## Security Features

### Input Validation
- Message length limits (4000 characters)
- Chatbot ID format validation
- XSS protection and content sanitization

### Security Headers
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`

### CORS Configuration
- Configurable allowed origins
- Proper preflight handling
- Credential support

## Deployment

### Docker Deployment

```bash
# Build and run with Docker Compose
cd backend/fastapi_server
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f chatbot-rag-api
```

### Environment Variables

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `GOOGLE_CLOUD_PROJECT` | Yes | Google Cloud project ID | `my-project` |
| `GOOGLE_CLOUD_LOCATION` | Yes | GCP location | `us-central1` |
| `RAG_CORPUS` | Yes | RAG corpus resource name | `projects/123/locations/us-central1/ragCorpora/456` |
| `API_DEBUG` | No | Enable debug mode | `false` |
| `LOG_LEVEL` | No | Logging level | `INFO` |
| `CHATBOT_API_KEY_PROD` | No | Production API key | `prod_key_abc123` |

### Health Check Endpoints for Load Balancers

- **Liveness**: `GET /api/v1/health/` (basic health)
- **Readiness**: `GET /api/v1/health/rag` (service dependencies)

## Client Libraries

### JavaScript/TypeScript Example

```typescript
class ChatbotRAGClient {
  constructor(
    private baseUrl: string,
    private apiKey: string
  ) {}

  async sendMessage(message: string, chatbotId: string): Promise<ChatResponse> {
    const response = await fetch(`${this.baseUrl}/api/v1/chat/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        message,
        chatbot_id: chatbotId,
        rag_enabled: true
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`API Error: ${error.message}`);
    }

    return response.json();
  }

  streamMessage(message: string, chatbotId: string): EventSource {
    const url = new URL(`${this.baseUrl}/api/v1/chat/stream`);
    
    // Note: EventSource doesn't support POST or custom headers
    // Consider using fetch with ReadableStream for POST streaming
    const eventSource = new EventSource(url.toString());
    
    eventSource.addEventListener('content', (event) => {
      const data = JSON.parse(event.data);
      console.log('Content:', data.text);
    });

    return eventSource;
  }
}
```

### Python Example

```python
import requests
from typing import Dict, Any, Generator

class ChatbotRAGClient:
    def __init__(self, base_url: str, api_key: str):
        self.base_url = base_url
        self.headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {api_key}'
        }
    
    def send_message(
        self, 
        message: str, 
        chatbot_id: str,
        rag_enabled: bool = True
    ) -> Dict[str, Any]:
        """Send a message and get the complete response."""
        response = requests.post(
            f"{self.base_url}/api/v1/chat/message",
            headers=self.headers,
            json={
                "message": message,
                "chatbot_id": chatbot_id,
                "rag_enabled": rag_enabled
            }
        )
        response.raise_for_status()
        return response.json()
    
    def stream_message(
        self, 
        message: str, 
        chatbot_id: str
    ) -> Generator[Dict[str, Any], None, None]:
        """Stream message responses."""
        response = requests.post(
            f"{self.base_url}/api/v1/chat/stream",
            headers=self.headers,
            json={
                "message": message,
                "chatbot_id": chatbot_id,
                "rag_enabled": True
            },
            stream=True
        )
        
        for line in response.iter_lines():
            if line:
                line = line.decode('utf-8')
                if line.startswith('data: '):
                    yield json.loads(line[6:])  # Remove 'data: ' prefix
```

## FAQ

### Q: How do I handle streaming responses in the frontend?

**A**: Use Server-Sent Events (EventSource) for GET requests or fetch with ReadableStream for POST requests. The streaming endpoint sends events with different types that you can handle separately.

### Q: What happens when RAG is not available?

**A**: The API gracefully falls back to direct LLM responses without RAG enhancement. The response will indicate `rag_enabled: false` and won't include citations.

### Q: How can I monitor API performance?

**A**: Use the metrics endpoints (`/api/v1/metrics/*`) to get real-time performance data, or integrate with monitoring tools using the structured JSON logs.

### Q: Can I use custom models?

**A**: Currently, the API is optimized for Google's Gemini models. Custom model support would require extending the RAG wrapper implementation.

### Q: How do I increase rate limits?

**A**: Rate limits are tied to API keys. Contact your administrator to get an API key with higher limits, or implement your own rate limiting strategy.

## Support

For technical support or questions:
- Check the health endpoints for service status
- Review the structured logs for error details
- Consult the implementation documentation in the codebase