import Fuse from 'fuse.js';
import { Citation, RAGDocument } from '@/types';

// Simulated vector search using Fuse.js for demo purposes
// In production, this would use actual embeddings and vector similarity

interface RetrievalOptions {
  maxResults?: number;
  minScore?: number;
  categories?: string[];
}

class DocumentRetriever {
  private documents: RAGDocument[] = [];
  private fuse: Fuse<RAGDocument> | null = null;
  
  async initialize() {
    // Load documents from JSON files
    await this.loadDocuments();
    
    // Initialize Fuse.js for fuzzy search
    this.fuse = new Fuse(this.documents, {
      keys: [
        { name: 'title', weight: 0.3 },
        { name: 'content', weight: 0.5 },
        { name: 'tags', weight: 0.2 }
      ],
      threshold: 0.4,
      includeScore: true,
      includeMatches: true,
      minMatchCharLength: 3,
    });
  }
  
  private async loadDocuments() {
    try {
      // Load from multiple JSON files
      const responses = await Promise.all([
        fetch('/data/knowledge-base.json'),
        fetch('/data/faqs.json'),
        fetch('/data/products.json')
      ]);
      
      const data = await Promise.all(
        responses.map(res => res.ok ? res.json() : { documents: [] })
      );
      
      // Combine all documents
      this.documents = data.flatMap(d => d.documents || []);
      
      // Add synthetic embeddings for demo (in production, use real embeddings)
      this.documents = this.documents.map(doc => ({
        ...doc,
        embedding: this.generateMockEmbedding(doc.content),
        lastUpdated: new Date(doc.metadata?.lastUpdated || Date.now())
      }));
    } catch (error) {
      console.error('Error loading documents:', error);
      // Fallback to empty array
      this.documents = [];
    }
  }
  
  private generateMockEmbedding(text: string): number[] {
    // Generate a mock embedding vector for demo purposes
    // In production, use OpenAI embeddings or similar
    const vector = [];
    for (let i = 0; i < 128; i++) {
      vector.push(Math.random() * 2 - 1);
    }
    return vector;
  }
  
  async search(query: string, options: RetrievalOptions = {}): Promise<Citation[]> {
    const {
      maxResults = 5,
      minScore = 0.7,
      categories = []
    } = options;
    
    if (!this.fuse) {
      await this.initialize();
    }
    
    if (!this.fuse) {
      return [];
    }
    
    // Perform fuzzy search
    let results = this.fuse.search(query);
    
    // Filter by categories if specified
    if (categories.length > 0) {
      results = results.filter(r => 
        categories.includes(r.item.category)
      );
    }
    
    // Convert to Citations format
    const citations: Citation[] = results
      .filter(r => {
        // Convert Fuse score (0 = perfect match, 1 = no match) to relevance score
        const relevanceScore = 1 - (r.score || 0);
        return relevanceScore >= minScore;
      })
      .slice(0, maxResults)
      .map((result, index) => ({
        id: `cite-${Date.now()}-${index}`,
        source: result.item.category,
        title: result.item.title,
        snippet: this.extractSnippet(result.item.content, query),
        relevanceScore: 1 - (result.score || 0),
        metadata: {
          ...result.item.metadata,
          documentId: result.item.id,
          matches: result.matches
        }
      }));
    
    return citations;
  }
  
  private extractSnippet(content: string, query: string, maxLength: number = 200): string {
    // Find the most relevant part of the content
    const queryWords = query.toLowerCase().split(' ');
    const sentences = content.split(/[.!?]+/);
    
    // Score each sentence by how many query words it contains
    const scoredSentences = sentences.map(sentence => {
      const sentenceLower = sentence.toLowerCase();
      const score = queryWords.reduce((acc, word) => {
        return acc + (sentenceLower.includes(word) ? 1 : 0);
      }, 0);
      return { sentence: sentence.trim(), score };
    });
    
    // Sort by score and take the best one
    scoredSentences.sort((a, b) => b.score - a.score);
    const bestSentence = scoredSentences[0]?.sentence || content.substring(0, maxLength);
    
    // Truncate if too long
    if (bestSentence.length > maxLength) {
      return bestSentence.substring(0, maxLength) + '...';
    }
    
    return bestSentence;
  }
  
  // Method to add new documents dynamically
  async addDocument(doc: RAGDocument) {
    this.documents.push({
      ...doc,
      embedding: this.generateMockEmbedding(doc.content),
      lastUpdated: new Date()
    });
    
    // Reinitialize Fuse with new documents
    if (this.fuse) {
      this.fuse = new Fuse(this.documents, this.fuse.options);
    }
  }
  
  // Method to update existing document
  async updateDocument(id: string, updates: Partial<RAGDocument>) {
    const index = this.documents.findIndex(doc => doc.id === id);
    if (index !== -1) {
      this.documents[index] = {
        ...this.documents[index],
        ...updates,
        lastUpdated: new Date()
      };
      
      // Reinitialize Fuse
      if (this.fuse) {
        this.fuse = new Fuse(this.documents, this.fuse.options);
      }
    }
  }
  
  // Method to remove document
  async removeDocument(id: string) {
    this.documents = this.documents.filter(doc => doc.id !== id);
    
    // Reinitialize Fuse
    if (this.fuse) {
      this.fuse = new Fuse(this.documents, this.fuse.options);
    }
  }
  
  // Get all documents (for debugging/admin)
  getAllDocuments(): RAGDocument[] {
    return this.documents;
  }
  
  // Get document by ID
  getDocument(id: string): RAGDocument | undefined {
    return this.documents.find(doc => doc.id === id);
  }
}

// Singleton instance
let retrieverInstance: DocumentRetriever | null = null;

export async function retrieveDocuments(
  query: string,
  options: RetrievalOptions = {}
): Promise<Citation[]> {
  if (!retrieverInstance) {
    retrieverInstance = new DocumentRetriever();
    await retrieverInstance.initialize();
  }
  
  return retrieverInstance.search(query, options);
}

export function getRetriever(): DocumentRetriever {
  if (!retrieverInstance) {
    retrieverInstance = new DocumentRetriever();
  }
  return retrieverInstance;
}