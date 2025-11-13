# Gemini Preview Chat Integration Plan

## Overview
Update the dashboard preview section to use Gemini for chatting with optional RAG document integration, and fix the input field focus issue.

## Current Issues Identified

### 1. Input Field Focus Problem
- **Issue**: Input field loses focus after typing each character in the ChatWidget
- **Root Cause**: Likely caused by React state updates re-rendering the component and losing input focus
- **Impact**: Poor user experience requiring cursor repositioning after each keystroke

### 2. Chat Service Integration
- **Current State**: Chat service supports Gemini model selection but preview may not be properly configured
- **Goal**: Ensure preview section specifically uses Gemini for all chat interactions

## Implementation Plan

### Phase 1: Fix Input Field Focus Issue

#### 1.1 Update MessageInput Component
- **File**: `frontend/components/widget/MessageInput.tsx`
- **Changes**:
  - Replace controlled input with `useRef` hook for better focus management
  - Implement `useEffect` to maintain focus state
  - Use `onInput` instead of `onChange` for better performance
  - Add `autoComplete="off"` to prevent browser interference

#### 1.2 Update ChatWidget State Management
- **File**: `frontend/components/widget/ChatWidget.tsx`
- **Changes**:
  - Review state update patterns that might cause re-renders
  - Implement `useCallback` for input handlers to prevent unnecessary re-renders
  - Add `useMemo` for stable references where appropriate

### Phase 2: Gemini Integration for Preview

#### 2.1 Update PreviewPanel Configuration
- **File**: `frontend/components/dashboard/PreviewPanel.tsx`
- **Changes**:
  - Force `defaultTextModel: 'gemini'` in preview config
  - Add preview-specific configuration override
  - Add visual indicator showing "Gemini Mode" in preview

#### 2.2 Update Chat Service for Preview Context
- **File**: `frontend/lib/chat-service.ts`
- **Changes**:
  - Add `isPreview` parameter to `processMessage` function
  - When in preview mode, always use Gemini model regardless of config
  - Ensure RAG integration works with Gemini in preview context

#### 2.3 Update RAG Integration for Preview
- **Current State**: RAG service should work with any model including Gemini
- **Verification Needed**: Ensure corpus selection works in preview mode
- **Changes**:
  - Test RAG document retrieval with Gemini responses
  - Verify citations display properly in preview

### Phase 3: Enhanced Preview Experience

#### 3.1 Add Gemini-Specific Features
- **File**: `frontend/components/dashboard/PreviewPanel.tsx`
- **Features to Add**:
  - Gemini model indicator badge
  - RAG toggle switch for preview testing
  - Document corpus selector for testing RAG
  - Response time display for Gemini calls

#### 3.2 Add Preview Controls
- **Features**:
  - "Test with Documents" button to enable RAG mode
  - "Test without Documents" button for pure Gemini chat
  - Clear conversation button
  - Model performance metrics display

### Phase 4: Testing and Validation

#### 4.1 Input Field Testing
- Test rapid typing without focus loss
- Test with different browsers (Chrome, Firefox, Safari)
- Test on mobile devices
- Verify clipboard operations work correctly

#### 4.2 Gemini Chat Testing
- Test basic chat functionality with Gemini
- Test RAG integration with uploaded documents
- Test conversation memory and context
- Test error handling for API failures

#### 4.3 Preview Mode Testing
- Test all device views (desktop, tablet, mobile)
- Test widget positioning and styling
- Test real-time config updates in preview
- Test voice features if enabled

## Technical Implementation Details

### Input Field Fix Implementation

```typescript
// New approach for MessageInput.tsx
const inputRef = useRef<HTMLInputElement>(null);
const [isFocused, setIsFocused] = useState(false);

const handleInput = useCallback((e: React.FormEvent<HTMLInputElement>) => {
  const target = e.target as HTMLInputElement;
  onChange(target.value);
}, [onChange]);

useEffect(() => {
  if (isFocused && inputRef.current) {
    inputRef.current.focus();
  }
}, [isFocused]);
```

### Gemini Preview Configuration

```typescript
// PreviewPanel.tsx modification
const previewConfig = useMemo(() => ({
  ...config,
  defaultTextModel: 'gemini' as const,
  // Force Gemini for preview regardless of saved config
}), [config]);
```

### Chat Service Preview Mode

```typescript
// chat-service.ts addition
export async function processMessage(
  message: string,
  model: string,
  ragEnabled: boolean,
  chatbotId: string = 'default',
  corpusId?: string,
  isPreview: boolean = false
): Promise<ChatResponse> {
  // Force Gemini in preview mode
  const effectiveModel = isPreview ? 'gemini' : model;
  
  // ... rest of implementation
}
```

## Files to Modify

1. **`frontend/components/widget/MessageInput.tsx`** - Fix input focus issue
2. **`frontend/components/widget/ChatWidget.tsx`** - Update state management
3. **`frontend/components/dashboard/PreviewPanel.tsx`** - Add Gemini configuration
4. **`frontend/lib/chat-service.ts`** - Add preview mode support
5. **`frontend/types/widget.ts`** - Add preview-specific types if needed

## Success Criteria

### Input Field Fix
- [ ] User can type continuously without losing focus
- [ ] Input field remains responsive during chat interactions
- [ ] Cursor position is maintained correctly
- [ ] Works across all supported browsers

### Gemini Integration
- [ ] Preview always uses Gemini model for responses
- [ ] RAG documents integrate properly with Gemini responses
- [ ] Visual indicator shows "Gemini Mode" in preview
- [ ] Response quality and speed meet expectations

### User Experience
- [ ] Preview provides accurate representation of production widget
- [ ] Chat interactions feel natural and responsive
- [ ] Error states are handled gracefully
- [ ] Performance remains optimal

## Estimated Timeline
- **Phase 1 (Input Fix)**: 2-4 hours
- **Phase 2 (Gemini Integration)**: 4-6 hours
- **Phase 3 (Enhanced Preview)**: 3-4 hours
- **Phase 4 (Testing)**: 2-3 hours
- **Total**: 11-17 hours

## Risk Considerations
- Input field changes might affect other parts of the widget
- Gemini API availability and rate limits
- RAG integration compatibility with different models
- Browser compatibility for input handling

## Next Steps
1. Review and approve this plan
2. Begin with Phase 1 (input field fix) as it's the most critical UX issue
3. Test changes incrementally to ensure no regressions
4. Document any API-specific Gemini requirements discovered during implementation