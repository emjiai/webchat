import { RAGDocument, Citation } from '@/types/widget'
import knowledgeBase from '@/data/demo-knowledge.json'

// Simple vector similarity calculation (cosine similarity simulation)
function calculateSimilarity(query: string, document: string): number {
  const queryWords = query.toLowerCase().split(' ')
  const docWords = document.toLowerCase().split(' ')
  
  let matches = 0
  queryWords.forEach(word => {
    if (docWords.includes(word)) {
      matches++
    }
  })
  
  return matches / Math.max(queryWords.length, 1)
}

// Search documents based on query
export async function searchDocuments(
  query: string,
  maxResults: number = 3
): Promise<Citation[]> {
  // Simulate async operation
  await new Promise(resolve => setTimeout(resolve, 200))

  // Calculate relevance scores for all documents
  const scoredDocs = knowledgeBase.documents.map(doc => ({
    ...doc,
    score: calculateSimilarity(query, `${doc.title} ${doc.content}`)
  }))

  // Sort by relevance and take top results
  const topDocs = scoredDocs
    .filter(doc => doc.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults)

  // Convert to citations
  return topDocs.map(doc => ({
    id: doc.id,
    source: doc.metadata.category,
    title: doc.title,
    snippet: doc.content.substring(0, 150) + '...',
    relevanceScore: doc.score
  }))
}

// Get document by ID
export async function getDocument(id: string): Promise<RAGDocument | null> {
  const doc = knowledgeBase.documents.find(d => d.id === id)
  return doc || null
}

// Search with filters
export async function searchWithFilters(
  query: string,
  filters: {
    category?: string
    tags?: string[]
    dateRange?: { start: string; end: string }
  }
): Promise<Citation[]> {
  let documents = knowledgeBase.documents

  // Apply filters
  if (filters.category) {
    documents = documents.filter(doc => doc.metadata.category === filters.category)
  }

  if (filters.tags && filters.tags.length > 0) {
    documents = documents.filter(doc =>
      filters.tags!.some(tag => doc.metadata.tags.includes(tag))
    )
  }

  if (filters.dateRange) {
    documents = documents.filter(doc => {
      const docDate = new Date(doc.metadata.lastUpdated)
      const startDate = new Date(filters.dateRange!.start)
      const endDate = new Date(filters.dateRange!.end)
      return docDate >= startDate && docDate <= endDate
    })
  }

  // Calculate relevance scores
  const scoredDocs = documents.map(doc => ({
    ...doc,
    score: calculateSimilarity(query, `${doc.title} ${doc.content}`)
  }))

  // Sort and convert to citations
  return scoredDocs
    .filter(doc => doc.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(doc => ({
      id: doc.id,
      source: doc.metadata.category,
      title: doc.title,
      snippet: doc.content.substring(0, 150) + '...',
      relevanceScore: doc.score
    }))
}

// Semantic search simulation (would use embeddings in production)
export async function semanticSearch(
  query: string,
  threshold: number = 0.7
): Promise<Citation[]> {
  // In production, this would:
  // 1. Convert query to embedding using OpenAI/other embedding model
  // 2. Compare with pre-computed document embeddings
  // 3. Return documents above similarity threshold

  // For demo, we'll use keyword matching with some enhancements
  const queryLower = query.toLowerCase()
  const keywords = extractKeywords(queryLower)
  
  const results = knowledgeBase.documents.map(doc => {
    const docText = `${doc.title} ${doc.content}`.toLowerCase()
    let score = 0
    
    // Check for exact phrase match
    if (docText.includes(queryLower)) {
      score += 0.5
    }
    
    // Check for keyword matches
    keywords.forEach(keyword => {
      if (docText.includes(keyword)) {
        score += 0.2
      }
    })
    
    return { ...doc, score: Math.min(score, 1) }
  })

  return results
    .filter(doc => doc.score >= threshold)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(doc => ({
      id: doc.id,
      source: doc.metadata.category,
      title: doc.title,
      snippet: highlightSnippet(doc.content, keywords),
      relevanceScore: doc.score
    }))
}

// Extract important keywords from query
function extractKeywords(query: string): string[] {
  const stopWords = ['the', 'is', 'at', 'which', 'on', 'a', 'an', 'as', 'are', 'was', 'were', 'been', 'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should', 'could', 'may', 'might', 'must', 'can', 'could']
  
  return query
    .split(' ')
    .filter(word => word.length > 2 && !stopWords.includes(word))
}

// Highlight matching keywords in snippet
function highlightSnippet(content: string, keywords: string[]): string {
  let snippet = content.substring(0, 150)
  
  // Find the most relevant part of content
  for (const keyword of keywords) {
    const index = content.toLowerCase().indexOf(keyword)
    if (index !== -1 && index > 50) {
      snippet = '...' + content.substring(index - 50, index + 100) + '...'
      break
    }
  }
  
  return snippet
}

// Cache for frequently accessed documents
const documentCache = new Map<string, { doc: RAGDocument; timestamp: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

export async function getCachedDocument(id: string): Promise<RAGDocument | null> {
  const cached = documentCache.get(id)
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.doc
  }
  
  const doc = await getDocument(id)
  if (doc) {
    documentCache.set(id, { doc, timestamp: Date.now() })
  }
  
  return doc
}