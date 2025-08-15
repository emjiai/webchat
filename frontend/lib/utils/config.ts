import { WidgetConfig } from '@/types';

export const defaultWidgetConfig: WidgetConfig = {
  // Appearance
  theme: 'light',
  primaryColor: '#3B82F6',
  secondaryColor: '#8B5CF6',
  fontFamily: 'Outfit, system-ui, sans-serif',
  borderRadius: 16,
  
  // Widget behavior
  mode: 'popup',
  position: 'bottom-right',
  size: 'medium',
  
  // Chat settings
  welcomeMessage: "Hello! I'm your AI assistant powered by advanced language models and voice capabilities. How can I help you today?",
  placeholder: 'Type a message or click the mic to speak...',
  avatarUrl: '',
  botName: 'AI Assistant',
  language: 'en',
  
  // Voice settings
  enableVoice: true,
  defaultVoiceEngine: 'openai',
  voiceAutoPlay: false,
  speechRate: 1.0,
  voiceId: undefined,
  voiceLanguage: 'en',
  
  // LLM settings
  defaultLLM: 'gpt',
  temperature: 0.7,
  maxTokens: 1000,
  
  // RAG settings
  enableRAG: true,
  maxRetrievalResults: 5,
  minRelevanceScore: 0.7,
  
  // Advanced
  streamResponses: true,
  enableTypingIndicator: true,
  enableSoundEffects: true,
  persistConversation: true,
  conversationTimeout: 3600000, // 1 hour in milliseconds
};

export const validateConfig = (config: Partial<WidgetConfig>): boolean => {
  // Add validation logic here
  if (config.temperature !== undefined && (config.temperature < 0 || config.temperature > 2)) {
    return false;
  }
  
  if (config.maxTokens !== undefined && (config.maxTokens < 50 || config.maxTokens > 4000)) {
    return false;
  }
  
  if (config.speechRate !== undefined && (config.speechRate < 0.5 || config.speechRate > 2)) {
    return false;
  }
  
  return true;
};

export const mergeConfigs = (
  base: WidgetConfig,
  overrides: Partial<WidgetConfig>
): WidgetConfig => {
  return { ...base, ...overrides };
};