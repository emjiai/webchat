# Frontend RAG Management UI Implementation Plan

## Current State Analysis

After reviewing the frontend dashboard structure, I can confirm that:

### ✅ **What Currently Exists:**
- Dashboard with 8 tabs: Chatbots, Configure, Preview, Embed, Customize, Theme, Voice, Analytics
- Complete tab structure in `frontend/app/dashboard/page.tsx`
- All existing components are working (ChatbotManager, ConfigurationPanel, etc.)
- Mobile-responsive design with proper TabsList layout

### ❌ **What's Missing for RAG Management:**
- **No RAG Management tab** in the dashboard
- **No RAG-related components** in `frontend/components/dashboard/`
- **No API integration** for the new RAG backend endpoints
- **No document upload interface**
- **No corpus management interface**

---

## Implementation Plan

### Phase 1: Add RAG Management Tab Structure

#### 1.1 Update Dashboard Layout (Priority: HIGH)
**File:** `frontend/app/dashboard/page.tsx`

**Changes Needed:**
```tsx
// Current: 8 tabs in grid-cols-8
<TabsList className="grid w-full max-w-4xl grid-cols-8">

// Updated: 9 tabs in grid-cols-9 (add RAG tab)
<TabsList className="grid w-full max-w-4xl grid-cols-9">
  {/* existing tabs */}
  <TabsTrigger value="rag" className="flex items-center gap-2" disabled={!selectedChatbot}>
    <Database className="w-4 h-4" />
    RAG Management
  </TabsTrigger>
```

**Import needed:** `Database` from `lucide-react`

#### 1.2 Add RAG TabContent
```tsx
<TabsContent value="rag" className="mt-6">
  {selectedChatbot && (
    <RAGManagement 
      chatbotId={selectedChatbot.id}
      chatbotName={selectedChatbot.name}
    />
  )}
</TabsContent>
```

---

### Phase 2: Create RAG Management Components

#### 2.1 Main RAG Management Component
**File:** `frontend/components/dashboard/RAGManagement.tsx`

**Features:**
- Corpus list view with creation button
- Document library per corpus
- Upload interface with progress tracking
- Mobile-responsive design

**Component Structure:**
```tsx
interface RAGManagementProps {
  chatbotId: string;
  chatbotName: string;
}

export default function RAGManagement({ chatbotId, chatbotName }: RAGManagementProps) {
  // State management for:
  // - corpora list
  // - selected corpus
  // - upload progress
  // - documents list
  
  return (
    <div className="space-y-6">
      {/* Header with create corpus button */}
      {/* Corpus list with cards */}
      {/* Selected corpus details */}
      {/* Document upload zone */}
      {/* Document library */}
    </div>
  );
}
```

#### 2.2 Corpus Creation Component
**File:** `frontend/components/dashboard/rag/CorpusCreator.tsx`

**Features:**
- Modal/drawer form for creating new corpus
- Form validation and error handling
- Progress indication during creation

#### 2.3 Document Upload Component
**File:** `frontend/components/dashboard/rag/DocumentUploader.tsx`

**Features:**
- Drag-and-drop upload zone
- File validation before upload
- Progress bars for individual files
- Batch upload support
- Mobile-optimized touch interactions

#### 2.4 Document Library Component
**File:** `frontend/components/dashboard/rag/DocumentLibrary.tsx`

**Features:**
- Document list with search/filter
- Document status indicators
- Delete functionality
- Document details view

#### 2.5 Corpus Management Component
**File:** `frontend/components/dashboard/rag/CorpusList.tsx`

**Features:**
- Grid/list view of corpora
- Corpus statistics (document count, size)
- Edit/delete actions
- Creation timestamp and status

---

### Phase 3: API Integration Layer

#### 3.1 RAG API Service
**File:** `frontend/lib/rag-api.ts`

**Functions needed:**
```tsx
// Corpus management
export async function createCorpus(data: CreateCorpusData): Promise<Corpus>
export async function getCorpora(chatbotId: string): Promise<Corpus[]>
export async function deleteCorpus(corpusId: string): Promise<void>
export async function getCorpusStats(corpusId: string): Promise<CorpusStats>

// Document management
export async function uploadDocument(file: File, corpusId: string): Promise<Document>
export async function validateFiles(files: File[], corpusId: string): Promise<ValidationResult>
export async function getDocuments(corpusId: string): Promise<Document[]>
export async function deleteDocument(documentId: string): Promise<void>
export async function batchUpload(files: File[], corpusId: string): Promise<UploadJob>
```

#### 3.2 Type Definitions
**File:** `frontend/types/rag.ts`

```tsx
export interface Corpus {
  id: string;
  display_name: string;
  description?: string;
  document_count: number;
  total_size_bytes: number;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: string;
  original_filename: string;
  file_size_bytes: number;
  upload_status: 'queued' | 'processing' | 'completed' | 'failed';
  created_at: string;
}

export interface UploadJob {
  id: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress_percentage: number;
  total_files: number;
  processed_files: number;
}
```

---

### Phase 4: Mobile Responsive Design

#### 4.1 Mobile Layout Adjustments

**Dashboard Tab Layout:**
- Use horizontal scrolling for tabs on mobile
- Collapsible sidebar approach for small screens
- Touch-friendly button sizes (minimum 44px)

**Upload Interface:**
- Large touch targets for file selection
- Progressive file upload with pause/resume
- Mobile file picker integration
- Optimized for portrait orientation

#### 4.2 Mobile-Specific Features
- Pull-to-refresh for document lists
- Swipe actions for delete/edit
- Bottom sheet modals for mobile
- Responsive image previews

---

### Phase 5: Integration with Chat Widget

#### 5.1 Update Chat Service
**File:** `frontend/lib/chat-service.ts`

**Add corpus selection:**
```tsx
export async function processMessage(
  message: string,
  model: string,
  ragEnabled: boolean,
  chatbotId: string,
  corpusId?: string  // New parameter for specific corpus
): Promise<ChatResponse>
```

#### 5.2 Configuration Panel Updates
**File:** `frontend/components/dashboard/ConfigurationPanel.tsx`

**Add RAG settings:**
- Corpus selection dropdown
- RAG enable/disable toggle
- Citation display preferences
- Search parameters (max results, min score)

---

## Detailed File Structure

```
frontend/
├── app/dashboard/page.tsx                 # ✅ UPDATE: Add RAG tab
├── components/dashboard/
│   ├── RAGManagement.tsx                 # 🆕 CREATE: Main component
│   └── rag/                              # 🆕 CREATE: RAG subfolder
│       ├── CorpusCreator.tsx             # 🆕 CREATE: Corpus creation
│       ├── CorpusList.tsx                # 🆕 CREATE: Corpus grid/list
│       ├── DocumentUploader.tsx          # 🆕 CREATE: File upload
│       ├── DocumentLibrary.tsx           # 🆕 CREATE: Document browser
│       ├── UploadProgress.tsx            # 🆕 CREATE: Progress tracking
│       └── CorpusStats.tsx               # 🆕 CREATE: Statistics display
├── lib/
│   ├── rag-api.ts                        # 🆕 CREATE: API integration
│   └── chat-service.ts                   # ✅ UPDATE: Add corpus support
├── types/
│   └── rag.ts                            # 🆕 CREATE: Type definitions
└── hooks/
    ├── useRAGCorpora.ts                  # 🆕 CREATE: Corpus management hook
    ├── useDocumentUpload.ts              # 🆕 CREATE: Upload state hook
    └── useRAGConfig.ts                   # 🆕 CREATE: Configuration hook
```

---

## Implementation Priority Order

### Phase 1: Core Infrastructure (Day 1)
1. ✅ **Update dashboard page** - Add RAG tab
2. 🆕 **Create RAG types** - Define TypeScript interfaces
3. 🆕 **Create RAG API service** - Basic CRUD operations
4. 🆕 **Create main RAGManagement component** - Basic structure

### Phase 2: Corpus Management (Day 2)
1. 🆕 **CorpusCreator component** - Modal with form
2. 🆕 **CorpusList component** - Display existing corpora
3. 🆕 **API integration** - Connect to backend endpoints
4. ✅ **Test corpus CRUD** - Create, read, update, delete

### Phase 3: Document Upload (Day 3)
1. 🆕 **DocumentUploader component** - Drag-drop interface
2. 🆕 **File validation** - Client-side checks
3. 🆕 **Upload progress** - Real-time feedback
4. 🆕 **DocumentLibrary component** - Browse uploaded files

### Phase 4: Mobile & Polish (Day 4)
1. 📱 **Mobile responsive design** - Touch optimization
2. 🎨 **UI polish** - Loading states, animations
3. 🧪 **Testing** - Cross-browser compatibility
4. 🔗 **Chat integration** - Connect with chat service

---

## Mobile Responsiveness Specifications

### Breakpoint Strategy
- **Mobile:** 320px - 768px
- **Tablet:** 768px - 1024px
- **Desktop:** 1024px+

### Mobile-Specific Features
1. **Touch-Optimized Upload**
   - Large drop zones (min 120px height)
   - Native file picker integration
   - Progress indicators clearly visible
   
2. **Responsive Tab Navigation**
   - Horizontal scroll for tabs on mobile
   - Sticky tab bar
   - Current tab highlighting
   
3. **Gesture Support**
   - Swipe-to-delete for documents
   - Pull-to-refresh for lists
   - Long-press for context menus

### Performance Considerations
- Lazy loading for document lists
- Image optimization for file previews
- Progressive enhancement for upload features
- Offline support with service workers

---

## API Integration Details

### Backend Endpoints (Already Implemented)
- ✅ `POST /api/v1/rag/corpus/create`
- ✅ `GET /api/v1/rag/corpus/list`
- ✅ `POST /api/v1/rag/documents/upload`
- ✅ `GET /api/v1/rag/documents/{corpus_id}`
- ✅ All other CRUD operations

### Authentication
- Uses existing Bearer token system
- Development key: `dev_key_12345`
- Production keys via environment variables

### Error Handling
- Network failure recovery
- File upload retry logic
- User-friendly error messages
- Progress state persistence

---

## Testing Strategy

### Component Testing
- Unit tests for individual components
- Integration tests for API calls
- Mobile device testing (iOS/Android)
- Cross-browser compatibility

### User Experience Testing
- Upload flow testing
- Mobile touch interaction testing
- Performance testing with large files
- Accessibility testing (screen readers)

---

## Success Criteria

### Functional Requirements
- ✅ User can create and manage RAG corpora
- ✅ User can upload documents with progress tracking
- ✅ User can view and manage uploaded documents
- ✅ Mobile users have optimized experience
- ✅ Integration with existing chat functionality

### Performance Requirements
- ⚡ Page load time < 3 seconds on 3G
- 📊 File upload progress updates every 100ms
- 🎯 Mobile usability score > 90%
- 📱 Works offline with service worker

---

## Timeline Estimate

**Total Duration:** 4-5 days

- **Day 1:** Core infrastructure and basic UI ⏰ 8 hours
- **Day 2:** Corpus management functionality ⏰ 8 hours  
- **Day 3:** Document upload and management ⏰ 8 hours
- **Day 4:** Mobile optimization and testing ⏰ 6 hours
- **Day 5:** Integration and polish ⏰ 4 hours

**Total Effort:** ~34 hours

---

## Next Steps for Approval

1. **Review this plan** - Confirm approach and priorities
2. **Approve component structure** - Verify file organization
3. **Confirm mobile requirements** - Validate responsive design specs
4. **Begin implementation** - Start with Phase 1 core infrastructure

Once approved, I'll begin implementing in the priority order outlined above, starting with updating the dashboard page to include the RAG Management tab.