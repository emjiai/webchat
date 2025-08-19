export interface WidgetConfig {
    // Appearance
    theme: {
      primaryColor: string
      secondaryColor: string
      backgroundColor: string
      textColor: string
      fontFamily: string
      // Optional extended theme fields used by ThemeEditor
      fontSize?: number
      headingFont?: string
      lineHeight?: number
      letterSpacing?: number
      borderRadius?: number
      spacing?: number
      showShadow?: boolean
      borderColor?: string
      shadowColor?: string
    }
    welcomeMessage: string
    botName: string
    botAvatar: string
    placeholder: string
    borderRadius: number
    
    // Widget Mode
    displayMode: 'popup' | 'inline' | 'fullscreen'
    position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left' | 'center'
    size: 'small' | 'medium' | 'large'
    width: number
    height: number
    zIndex: number
    showHeader: boolean
    showFooter: boolean
    enableDragDrop: boolean
    
    // Voice Settings
    voiceEnabled: boolean
    defaultVoiceEngine: 'openai' | 'elevenlabs'
    voiceSpeed: number
    voiceStyle: string
    autoPlayResponses: boolean
    
    // Text Chat Settings
    defaultTextModel: 'gpt' | 'gemini' | 'claude' | 'grok' | 'deepseek'
    temperature: number
    maxTokens: number
    streamingEnabled: boolean
    showTypingIndicator: boolean
    
    // Conversation & Suggestions (ConfigurationTabs)
    maxMessageLength?: number
    enableSuggestions?: boolean
    persistConversation?: boolean
    systemPrompt?: string
    
    // RAG Settings
    ragEnabled: boolean
    showCitations: boolean
    maxRetrievedDocs: number
    minRelevanceScore: number
    similarityThreshold?: number
    
    // Behavior
    autoOpenDelay?: number
    
    // API & Integrations
    apiEndpoint?: string
    apiKey?: string
    webhookUrl?: string
    rateLimitPerMinute?: number

    // Other Settings
    collectUserInfo: boolean
    enableAnalytics: boolean
    allowFileUploads: boolean

    // Branding (used by ThemeEditor)
    companyLogo?: string
    showPoweredBy?: boolean

    // Customization
    customCSS?: string
    customJS?: string
    metadata?: Record<string, any>

    // Integration and Security
    allowedDomains?: string[]
  }
  
  export interface Message {
    id: string
    role: 'user' | 'assistant' | 'system'
    content: string
    timestamp: Date
    type: 'text' | 'voice'
    citations?: Citation[]
    audioUrl?: string
    model?: string
    engine?: string
  }
  
  export interface Citation {
    id: string
    source: string
    title: string
    snippet: string
    relevanceScore: number
  }
  
  export interface RAGDocument {
    id: string
    title: string
    content: string
    metadata: {
      category: string
      tags: string[]
      lastUpdated: string
    }
  }
  
  export interface VoiceState {
    isRecording: boolean
    isPlaying: boolean
    isSpeaking: boolean
    currentEngine: 'openai' | 'elevenlabs'
    volume: number
    speed: number
  }
  
  export interface ChatSession {
    id: string
    messages: Message[]
    startedAt: Date
    lastActivity: Date
    config: WidgetConfig
  }