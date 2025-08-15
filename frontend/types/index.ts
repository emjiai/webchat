// Core Types for the AI Chatbot Widget

export type MessageRole = 'user' | 'assistant' | 'system';
export type InputMode = 'text' | 'voice';
export type WidgetMode = 'popup' | 'inline' | 'fullscreen';
export type VoiceEngine = 'openai' | 'elevenlabs';
export type LLMProvider = 'gpt' | 'gemini' | 'claude' | 'grok' | 'deepseek';
export type Language = 'en' | 'fr' | 'ig' | 'de' | 'yo' | 'ha';

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  inputMode?: InputMode;
  citations?: Citation[];
  audioUrl?: string;
  isStreaming?: boolean;
}

export interface Citation {
  id: string;
  source: string;
  title: string;
  snippet: string;
  relevanceScore: number;
  metadata?: Record<string, any>;
}

export interface WidgetConfig {
  // Appearance
  theme: 'light' | 'dark' | 'custom';
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  borderRadius: number;
  
  // Widget behavior
  mode: WidgetMode;
  position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'center';
  size: 'small' | 'medium' | 'large';
  width: number;
  height: number;
  zIndex: number;
  showHeader: boolean;
  showFooter: boolean;
  enableDragDrop: boolean;
  allowedDomains?: string[];
  customCSS?: string;
  
  // Chat settings
  welcomeMessage: string;
  placeholder: string;
  avatarUrl: string;
  botName: string;
  language: Language;
  
  // Voice settings
  enableVoice: boolean;
  defaultVoiceEngine: VoiceEngine;
  voiceAutoPlay: boolean;
  speechRate: number;
  voiceId?: string;
  voiceLanguage?: Language;
  
  // LLM settings
  defaultLLM: LLMProvider;
  temperature: number;
  maxTokens: number;
  
  // RAG settings
  enableRAG: boolean;
  maxRetrievalResults: number;
  minRelevanceScore: number;
  
  // Advanced
  streamResponses: boolean;
  enableTypingIndicator: boolean;
  enableSoundEffects: boolean;
  persistConversation: boolean;
  conversationTimeout: number;
}

export interface VoiceSettings {
  engine: VoiceEngine;
  voiceId: string;
  rate: number;
  pitch: number;
  volume: number;
  stability?: number;
  similarityBoost?: number;
}

export interface LLMSettings {
  provider: LLMProvider;
  model: string;
  temperature: number;
  maxTokens: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
  systemPrompt?: string;
}

export interface RAGDocument {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  metadata: Record<string, any>;
  embedding?: number[];
  lastUpdated: Date;
}

export interface EmbedOptions {
  containerId?: string;
  config: Partial<WidgetConfig>;
  apiKey?: string;
  baseUrl?: string;
  onReady?: () => void;
  onMessage?: (message: Message) => void;
  onError?: (error: Error) => void;
}

export interface AudioStream {
  id: string;
  status: 'idle' | 'recording' | 'processing' | 'playing' | 'error';
  audioContext?: AudioContext;
  mediaStream?: MediaStream;
  audioBuffer?: AudioBuffer;
}

export interface ChatSession {
  id: string;
  messages: Message[];
  config: WidgetConfig;
  startedAt: Date;
  lastActivity: Date;
  metadata?: Record<string, any>;
}

export interface DashboardStats {
  totalConversations: number;
  averageResponseTime: number;
  mostUsedLLM: LLMProvider;
  voiceUsagePercentage: number;
  topQueries: string[];
  ragHitRate: number;
}