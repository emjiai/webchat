# RAG Corpus Management Implementation Plan

## Overview

This plan outlines the implementation of a comprehensive RAG Corpus management system that allows users to upload documents and create RAG corpora through a web interface. The system will integrate Google's Vertex AI RAG Engine with our existing FastAPI backend and React frontend.

## Phase 1: Backend API Implementation

### 1.1 RAG Corpus Management API Endpoints

**File:** `backend/fastapi_server/app/api/v1/rag/corpus.py`

```python
# New endpoints to implement:
POST /api/v1/rag/corpus/create          # Create new corpus
GET  /api/v1/rag/corpus/list           # List all corpora
GET  /api/v1/rag/corpus/{corpus_id}    # Get corpus details
PUT  /api/v1/rag/corpus/{corpus_id}    # Update corpus metadata
DELETE /api/v1/rag/corpus/{corpus_id}  # Delete corpus
```

### 1.2 Document Upload and Processing API

**File:** `backend/fastapi_server/app/api/v1/rag/documents.py`

```python
# New endpoints to implement:
POST /api/v1/rag/documents/upload         # Upload document to corpus
GET  /api/v1/rag/documents/{corpus_id}    # List documents in corpus
GET  /api/v1/rag/documents/file/{file_id} # Get document details
DELETE /api/v1/rag/documents/file/{file_id} # Delete document
POST /api/v1/rag/documents/batch-upload   # Batch upload multiple files
GET  /api/v1/rag/documents/upload-status/{upload_id} # Check upload status
```

### 1.3 RAG Corpus Service Layer

**File:** `backend/fastapi_server/app/services/rag_corpus_service.py`

**Key Features:**
- Integration with Google Vertex AI RAG Engine
- Asynchronous document processing
- Support for multiple file formats (PDF, TXT, DOCX, MD)
- Progress tracking for uploads
- Automatic chunking and embedding
- Metadata extraction and storage

### 1.4 File Processing Pipeline

**Components:**
1. **File Validation:** Size, format, content safety checks
2. **Preprocessing:** Text extraction, cleaning, chunking
3. **Embedding:** Using Google's text-embedding-004 model
4. **Storage:** Google Cloud Storage integration
5. **Indexing:** Vertex AI RAG Engine corpus registration

## Phase 2: Frontend Admin Interface

### 2.1 RAG Management Dashboard Tab

**File:** `frontend/components/dashboard/RAGManagement.tsx`

**Features:**
- Corpus creation wizard
- Document upload interface with drag-and-drop
- Progress tracking for uploads
- Corpus statistics and analytics
- Document library with search and filter
- Mobile-responsive design with touch-friendly interactions

### 2.2 Mobile-Responsive Upload Component

**File:** `frontend/components/rag/DocumentUploader.tsx`

**Mobile-First Design:**
- Touch-optimized drag-and-drop zones
- Progressive file upload with pause/resume
- Thumbnail previews for documents
- Upload queue management
- Offline support with sync when online
- Responsive grid layout for different screen sizes

### 2.3 Corpus Management Components

**Files:**
- `frontend/components/rag/CorpusCard.tsx` - Individual corpus display
- `frontend/components/rag/CorpusCreator.tsx` - Corpus creation form
- `frontend/components/rag/DocumentLibrary.tsx` - Document browser
- `frontend/components/rag/UploadProgress.tsx` - Real-time upload tracking

## Phase 3: Mobile Responsiveness Audit

### 3.1 Chat Widget Mobile Optimization

**Current Status:**  Already mobile-responsive
**Enhancements:**
- Improved touch targets (minimum 44px)
- Better keyboard handling on mobile
- Voice controls optimization for mobile
- Gesture-based interactions (swipe to close)

### 3.2 Admin Dashboard Mobile Layout

**Responsive Breakpoints:**
- Mobile: 320px - 768px
- Tablet: 768px - 1024px  
- Desktop: 1024px+

**Mobile-Specific Features:**
- Collapsible navigation sidebar
- Bottom sheet modals for mobile
- Swipe navigation between tabs
- Pull-to-refresh functionality

## Implementation Details

### API Request/Response Schemas

```typescript
// Corpus Creation Request
interface CreateCorpusRequest {
  displayName: string
  description: string
  embeddingModelConfig?: {
    publisherModel: string
  }
}

// Document Upload Request
interface DocumentUploadRequest {
  files: File[]
  corpusId: string
  displayName?: string
  description?: string
  chunkingStrategy?: 'auto' | 'fixed' | 'semantic'
  metadata?: Record<string, any>
}

// Upload Progress Response
interface UploadProgressResponse {
  uploadId: string
  status: 'queued' | 'processing' | 'completed' | 'failed'
  progress: number
  processedFiles: number
  totalFiles: number
  estimatedTimeRemaining?: number
  errors?: string[]
}
```

### Database Schema Extensions

**New Tables:**
```sql
-- Corpus metadata tracking
CREATE TABLE rag_corpora (
    id UUID PRIMARY KEY,
    vertex_corpus_name VARCHAR NOT NULL,
    display_name VARCHAR NOT NULL,
    description TEXT,
    chatbot_id UUID REFERENCES chatbots(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    document_count INTEGER DEFAULT 0,
    total_size_bytes BIGINT DEFAULT 0
);

-- Document tracking
CREATE TABLE rag_documents (
    id UUID PRIMARY KEY,
    corpus_id UUID REFERENCES rag_corpora(id),
    vertex_file_name VARCHAR NOT NULL,
    original_filename VARCHAR NOT NULL,
    file_size_bytes BIGINT,
    mime_type VARCHAR,
    upload_status VARCHAR DEFAULT 'pending',
    error_message TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Upload job tracking
CREATE TABLE upload_jobs (
    id UUID PRIMARY KEY,
    corpus_id UUID REFERENCES rag_corpora(id),
    status VARCHAR DEFAULT 'queued',
    total_files INTEGER,
    processed_files INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP
);
```

## Security and Validation

### File Upload Security
- **File Type Validation:** Whitelist of allowed MIME types
- **Size Limits:** 50MB per file, 500MB per batch
- **Content Scanning:** Basic malware detection
- **Rate Limiting:** Upload quotas per user/chatbot
- **Authentication:** Bearer token validation

### API Security
- **CORS:** Proper origin validation
- **Input Validation:** Pydantic models for all requests
- **Error Handling:** Sanitized error responses
- **Audit Logging:** All corpus operations logged

## Integration with Existing Systems

### 1. FastAPI Server Integration
```python
# Add to main.py
app.include_router(corpus_router, prefix="/api/v1/rag", tags=["rag"])
app.include_router(documents_router, prefix="/api/v1/rag", tags=["rag"])
```

### 2. Frontend Dashboard Integration
```typescript
// Add new tab to dashboard
<TabsTrigger value="rag" className="flex items-center gap-2">
  <Database className="w-4 h-4" />
  RAG Management
</TabsTrigger>

<TabsContent value="rag" className="mt-6">
  <RAGManagement chatbotId={selectedChatbot.id} />
</TabsContent>
```

### 3. Chat Service Integration
```typescript
// Update chat service to use custom corpus
const response = await fetch('/api/v1/chat/message', {
  method: 'POST',
  body: JSON.stringify({
    message: content,
    corpusId: chatbot.config.ragCorpusId, // Use chatbot's custom corpus
    // ... other params
  })
});
```

## Mobile Responsiveness Implementation

### Chat Widget Mobile Optimizations

**Current Mobile Features (Already Implemented):**
- Responsive sizing based on viewport
- Touch-friendly button sizes
- Optimized for portrait/landscape modes
- Swipe gestures for closing

**Additional Mobile Enhancements:**
```css
/* Enhanced touch targets */
.chat-button {
  min-height: 44px;
  min-width: 44px;
  touch-action: manipulation;
}

/* Improved scroll behavior */
.message-list {
  -webkit-overflow-scrolling: touch;
  scroll-behavior: smooth;
}

/* Voice controls mobile optimization */
@media (max-width: 768px) {
  .voice-controls {
    bottom: safe-area-inset-bottom;
    padding: 1rem;
  }
}
```

### RAG Upload Component Mobile Design

```tsx
// Mobile-optimized upload component
const DocumentUploader = ({ corpusId }: { corpusId: string }) => {
  return (
    <div className="flex flex-col space-y-4">
      {/* Mobile drag-drop zone */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center touch-none">
        <div className="flex flex-col items-center space-y-4">
          <Upload className="w-12 h-12 text-gray-400" />
          <div>
            <p className="text-lg font-medium">Drop files here</p>
            <p className="text-sm text-gray-500">or tap to select</p>
          </div>
        </div>
      </div>
      
      {/* Mobile-optimized file list */}
      <div className="grid gap-3">
        {files.map(file => (
          <div key={file.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
            <FileIcon className="w-8 h-8 mr-3" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{file.name}</p>
              <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
            </div>
            <button className="p-2 text-red-500 hover:bg-red-50 rounded-md">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
```

## Testing Strategy

### Backend Testing
- **Unit Tests:** Service layer methods
- **Integration Tests:** API endpoints with Vertex AI
- **Load Tests:** Bulk document upload performance
- **Security Tests:** File upload vulnerabilities

### Frontend Testing
- **Component Tests:** React component functionality
- **E2E Tests:** Complete upload workflow
- **Mobile Tests:** Touch interactions and responsive design
- **Accessibility Tests:** Screen reader compatibility

### Mobile Responsiveness Testing
- **Device Testing:** Real device testing on iOS/Android
- **Responsive Testing:** Multiple screen sizes and orientations
- **Performance Testing:** Upload performance on mobile networks
- **Gesture Testing:** Touch interactions and gestures

## Deployment Considerations

### Backend Deployment
1. **Environment Variables:** Add RAG-specific config to `.env`
2. **Database Migration:** Run corpus/document table creation
3. **Google Cloud Setup:** Ensure proper IAM roles and quotas
4. **Monitoring:** Add RAG operation metrics

### Frontend Deployment
1. **Build Optimization:** Code splitting for RAG components
2. **PWA Features:** Offline support for mobile users
3. **Performance:** Lazy loading of upload components
4. **Analytics:** Track corpus creation and usage

## Success Metrics

### Technical Metrics
- Upload success rate > 95%
- Average upload time < 30 seconds per 10MB file
- API response time < 500ms for corpus operations
- Mobile load time < 3 seconds on 3G

### User Experience Metrics
- Mobile usability score > 90%
- Upload completion rate > 85%
- Error rate < 5%
- User retention after first upload > 70%

## Timeline Estimate

### Phase 1: Backend API (2 weeks)
- **Week 1:** Corpus management endpoints and service layer
- **Week 2:** Document upload pipeline and testing

### Phase 2: Frontend Interface (2 weeks)
- **Week 1:** RAG management dashboard and upload components
- **Week 2:** Mobile optimization and testing

### Phase 3: Integration & Polish (1 week)
- **Week 1:** End-to-end testing, mobile responsiveness audit, deployment

**Total Estimated Timeline: 5 weeks**

## Risk Assessment

### Technical Risks
- **Google Cloud Quota Limits:** Mitigate with quota monitoring and graceful degradation
- **Large File Upload Timeouts:** Implement chunked upload with resume capability
- **Mobile Performance:** Optimize with lazy loading and progressive enhancement

### Business Risks
- **User Adoption:** Provide clear onboarding and documentation
- **Data Security:** Implement comprehensive audit logging and compliance measures
- **Scalability:** Design for horizontal scaling from day one

## Conclusion

This implementation plan provides a comprehensive roadmap for adding RAG corpus management capabilities to the existing chat widget system. The mobile-first approach ensures excellent user experience across all devices, while the robust backend API provides the foundation for scalable document processing and corpus management.

The plan leverages existing infrastructure while adding new capabilities that will significantly enhance the chatbot's knowledge management capabilities. The phased approach allows for iterative development and testing, ensuring high quality and reliability.