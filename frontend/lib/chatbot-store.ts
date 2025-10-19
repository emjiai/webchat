'use client'

import { Chatbot, WidgetConfig } from '@/types/widget'

// In-memory store for development - replace with database in production
class ChatbotStore {
  private chatbots: Map<string, Chatbot> = new Map()

  constructor() {
    // Initialize with a default chatbot if none exist
    if (this.chatbots.size === 0) {
      this.createDefaultChatbot()
    }
  }

  private createDefaultChatbot() {
    const defaultConfig: WidgetConfig = {
      theme: {
        primaryColor: '#3b82f6',
        secondaryColor: '#8b5cf6',
        backgroundColor: '#ffffff',
        textColor: '#1f2937',
        fontFamily: 'Outfit',
      },
      welcomeMessage: 'Hi! How can I help you today?',
      botName: 'AI Assistant',
      botAvatar: '/bot-avatar.png',
      placeholder: 'Type your message...',
      borderRadius: 12,
      displayMode: 'popup',
      position: 'bottom-right',
      size: 'medium',
      width: 380,
      height: 560,
      zIndex: 9999,
      showHeader: true,
      showFooter: true,
      enableDragDrop: true,
      voiceEnabled: true,
      defaultVoiceEngine: 'openai',
      voiceSpeed: 1.0,
      voiceStyle: 'friendly',
      autoPlayResponses: false,
      defaultTextModel: 'gpt',
      temperature: 0.7,
      maxTokens: 1024,
      streamingEnabled: true,
      showTypingIndicator: true,
      ragEnabled: true,
      showCitations: true,
      maxRetrievedDocs: 3,
      minRelevanceScore: 0.5,
      collectUserInfo: false,
      enableAnalytics: false,
      allowFileUploads: false,
    }

    const defaultChatbot: Chatbot = {
      id: 'default',
      name: 'Default Chatbot',
      description: 'Your first chatbot - configure and customize as needed',
      targetWebsite: '',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      config: defaultConfig
    }

    this.chatbots.set(defaultChatbot.id, defaultChatbot)
  }

  // Get all chatbots
  getAllChatbots(): Chatbot[] {
    return Array.from(this.chatbots.values())
  }

  // Get chatbot by ID
  getChatbot(id: string): Chatbot | undefined {
    return this.chatbots.get(id)
  }

  // Create new chatbot
  createChatbot(name: string, description?: string, targetWebsite?: string): Chatbot {
    const id = 'chatbot_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
    const defaultConfig = this.getChatbot('default')?.config || this.createDefaultConfig()
    
    const newChatbot: Chatbot = {
      id,
      name,
      description,
      targetWebsite,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      config: { ...defaultConfig, botName: name }
    }

    this.chatbots.set(id, newChatbot)
    return newChatbot
  }

  // Update chatbot
  updateChatbot(id: string, updates: Partial<Omit<Chatbot, 'id' | 'createdAt'>>): Chatbot | undefined {
    const chatbot = this.chatbots.get(id)
    if (!chatbot) return undefined

    const updatedChatbot: Chatbot = {
      ...chatbot,
      ...updates,
      updatedAt: new Date()
    }

    this.chatbots.set(id, updatedChatbot)
    return updatedChatbot
  }

  // Update chatbot configuration
  updateChatbotConfig(id: string, configUpdates: Partial<WidgetConfig>): Chatbot | undefined {
    const chatbot = this.chatbots.get(id)
    if (!chatbot) return undefined

    const updatedChatbot: Chatbot = {
      ...chatbot,
      config: { ...chatbot.config, ...configUpdates },
      updatedAt: new Date()
    }

    this.chatbots.set(id, updatedChatbot)
    return updatedChatbot
  }

  // Delete chatbot
  deleteChatbot(id: string): boolean {
    if (id === 'default') {
      throw new Error('Cannot delete the default chatbot')
    }
    return this.chatbots.delete(id)
  }

  // Toggle chatbot active status
  toggleChatbotStatus(id: string): Chatbot | undefined {
    const chatbot = this.chatbots.get(id)
    if (!chatbot) return undefined

    const updatedChatbot: Chatbot = {
      ...chatbot,
      isActive: !chatbot.isActive,
      updatedAt: new Date()
    }

    this.chatbots.set(id, updatedChatbot)
    return updatedChatbot
  }

  // Clone chatbot
  cloneChatbot(id: string, newName: string): Chatbot | undefined {
    const originalChatbot = this.chatbots.get(id)
    if (!originalChatbot) return undefined

    const newId = 'chatbot_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
    const clonedChatbot: Chatbot = {
      ...originalChatbot,
      id: newId,
      name: newName,
      description: `Clone of ${originalChatbot.name}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      config: { ...originalChatbot.config, botName: newName }
    }

    this.chatbots.set(newId, clonedChatbot)
    return clonedChatbot
  }

  private createDefaultConfig(): WidgetConfig {
    return {
      theme: {
        primaryColor: '#3b82f6',
        secondaryColor: '#8b5cf6',
        backgroundColor: '#ffffff',
        textColor: '#1f2937',
        fontFamily: 'Outfit',
      },
      welcomeMessage: 'Hi! How can I help you today?',
      botName: 'AI Assistant',
      botAvatar: '/bot-avatar.png',
      placeholder: 'Type your message...',
      borderRadius: 12,
      displayMode: 'popup',
      position: 'bottom-right',
      size: 'medium',
      width: 380,
      height: 560,
      zIndex: 9999,
      showHeader: true,
      showFooter: true,
      enableDragDrop: true,
      voiceEnabled: true,
      defaultVoiceEngine: 'openai',
      voiceSpeed: 1.0,
      voiceStyle: 'friendly',
      autoPlayResponses: false,
      defaultTextModel: 'gpt',
      temperature: 0.7,
      maxTokens: 1024,
      streamingEnabled: true,
      showTypingIndicator: true,
      ragEnabled: true,
      showCitations: true,
      maxRetrievedDocs: 3,
      minRelevanceScore: 0.5,
      collectUserInfo: false,
      enableAnalytics: false,
      allowFileUploads: false,
    }
  }
}

// Singleton instance
export const chatbotStore = new ChatbotStore()

// React hook for chatbot management
export function useChatbotStore() {
  return {
    getAllChatbots: () => chatbotStore.getAllChatbots(),
    getChatbot: (id: string) => chatbotStore.getChatbot(id),
    createChatbot: (name: string, description?: string, targetWebsite?: string) => 
      chatbotStore.createChatbot(name, description, targetWebsite),
    updateChatbot: (id: string, updates: Partial<Omit<Chatbot, 'id' | 'createdAt'>>) => 
      chatbotStore.updateChatbot(id, updates),
    updateChatbotConfig: (id: string, configUpdates: Partial<WidgetConfig>) => 
      chatbotStore.updateChatbotConfig(id, configUpdates),
    deleteChatbot: (id: string) => chatbotStore.deleteChatbot(id),
    toggleChatbotStatus: (id: string) => chatbotStore.toggleChatbotStatus(id),
    cloneChatbot: (id: string, newName: string) => chatbotStore.cloneChatbot(id, newName)
  }
}