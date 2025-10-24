import { Chatbot, WidgetConfig } from '@/types/widget'
import { prisma } from '@/lib/db'

// Server-side chatbot store that uses database for persistence
class ServerChatbotStore {
  private initialized: boolean = false

  constructor() {
    this.initialize()
  }

  private async initialize() {
    if (this.initialized) return
    
    try {
      // Check if any chatbots exist in the database
      const existingChatbots = await prisma.chatbot.count()
      
      // Initialize with a default chatbot if none exist
      if (existingChatbots === 0) {
        await this.createDefaultChatbot()
      }
      
      this.initialized = true
      const totalCount = await prisma.chatbot.count()
      console.log('Server chatbot store initialized with', totalCount, 'chatbots')
    } catch (error) {
      console.error('Error initializing server chatbot store:', error)
    }
  }

  private async createDefaultChatbot() {
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

    try {
      const defaultChatbot = await prisma.chatbot.create({
        data: {
          id: 'default',
          name: 'Default Chatbot',
          description: 'Your first chatbot - configure and customize as needed',
          targetWebsite: '',
          isActive: true,
          config: defaultConfig
        }
      })

      console.log('Created default chatbot:', defaultChatbot.id)
    } catch (error) {
      console.error('Error creating default chatbot:', error)
    }
  }

  // Get all chatbots
  async getAllChatbots(): Promise<Chatbot[]> {
    await this.initialize()
    try {
      const chatbots = await prisma.chatbot.findMany({
        orderBy: { createdAt: 'desc' }
      })
      
      return chatbots.map(this.mapPrismaToChatbot)
    } catch (error) {
      console.error('Error fetching all chatbots:', error)
      return []
    }
  }

  // Get chatbot by ID
  async getChatbot(id: string): Promise<Chatbot | undefined> {
    await this.initialize()
    try {
      const chatbot = await prisma.chatbot.findUnique({
        where: { id }
      })
      
      if (!chatbot) {
        console.log(`Getting chatbot ${id}: not found`)
        return undefined
      }
      
      console.log(`Getting chatbot ${id}: found`)
      return this.mapPrismaToChatbot(chatbot)
    } catch (error) {
      console.error(`Error fetching chatbot ${id}:`, error)
      return undefined
    }
  }

  // Create new chatbot
  async createChatbot(name: string, description?: string, targetWebsite?: string): Promise<Chatbot> {
    await this.initialize()
    
    // Get default config from the default chatbot or create one
    const defaultChatbot = await this.getChatbot('default')
    const defaultConfig = defaultChatbot?.config || this.createDefaultConfig()
    
    try {
      const newChatbot = await prisma.chatbot.create({
        data: {
          name,
          description,
          targetWebsite,
          isActive: true,
          config: { ...defaultConfig, botName: name }
        }
      })

      console.log('Created new chatbot:', newChatbot.id, name)
      return this.mapPrismaToChatbot(newChatbot)
    } catch (error) {
      console.error('Error creating chatbot:', error)
      throw error
    }
  }

  // Update chatbot
  async updateChatbot(id: string, updates: Partial<Omit<Chatbot, 'id' | 'createdAt'>>): Promise<Chatbot | undefined> {
    await this.initialize()
    try {
      const updatedChatbot = await prisma.chatbot.update({
        where: { id },
        data: {
          ...(updates.name && { name: updates.name }),
          ...(updates.description !== undefined && { description: updates.description }),
          ...(updates.targetWebsite !== undefined && { targetWebsite: updates.targetWebsite }),
          ...(updates.isActive !== undefined && { isActive: updates.isActive }),
          ...(updates.config && { config: updates.config })
        }
      })

      console.log('Updated chatbot:', id)
      return this.mapPrismaToChatbot(updatedChatbot)
    } catch (error) {
      console.error('Error updating chatbot:', error)
      return undefined
    }
  }

  // Update chatbot configuration
  async updateChatbotConfig(id: string, configUpdates: Partial<WidgetConfig>): Promise<Chatbot | undefined> {
    await this.initialize()
    try {
      const existing = await prisma.chatbot.findUnique({
        where: { id }
      })
      
      if (!existing) {
        console.log('Chatbot not found for config update:', id)
        return undefined
      }

      const currentConfig = existing.config as WidgetConfig
      const updatedConfig = { ...currentConfig, ...configUpdates }

      const updatedChatbot = await prisma.chatbot.update({
        where: { id },
        data: { config: updatedConfig }
      })

      console.log('Updated chatbot config:', id)
      return this.mapPrismaToChatbot(updatedChatbot)
    } catch (error) {
      console.error('Error updating chatbot config:', error)
      return undefined
    }
  }

  // Delete chatbot
  async deleteChatbot(id: string): Promise<boolean> {
    await this.initialize()
    if (id === 'default') {
      console.log('Cannot delete the default chatbot')
      return false
    }
    
    try {
      await prisma.chatbot.delete({
        where: { id }
      })
      
      console.log('Deleted chatbot:', id, 'success')
      return true
    } catch (error) {
      console.error('Error deleting chatbot:', error)
      return false
    }
  }

  // Toggle chatbot active status
  async toggleChatbotStatus(id: string): Promise<Chatbot | undefined> {
    await this.initialize()
    try {
      const existing = await prisma.chatbot.findUnique({
        where: { id }
      })
      
      if (!existing) {
        console.log('Chatbot not found for status toggle:', id)
        return undefined
      }

      const updatedChatbot = await prisma.chatbot.update({
        where: { id },
        data: { isActive: !existing.isActive }
      })

      console.log('Toggled chatbot status:', id, 'now', updatedChatbot.isActive ? 'active' : 'inactive')
      return this.mapPrismaToChatbot(updatedChatbot)
    } catch (error) {
      console.error('Error toggling chatbot status:', error)
      return undefined
    }
  }

  // Clone chatbot
  async cloneChatbot(id: string, newName: string): Promise<Chatbot | undefined> {
    await this.initialize()
    try {
      const originalChatbot = await prisma.chatbot.findUnique({
        where: { id }
      })
      
      if (!originalChatbot) {
        console.log('Original chatbot not found for cloning:', id)
        return undefined
      }

      const clonedChatbot = await prisma.chatbot.create({
        data: {
          name: newName,
          description: `Clone of ${originalChatbot.name}`,
          targetWebsite: originalChatbot.targetWebsite,
          isActive: originalChatbot.isActive,
          config: {
            ...(originalChatbot.config as WidgetConfig),
            botName: newName
          }
        }
      })

      console.log('Cloned chatbot:', id, 'to', clonedChatbot.id)
      return this.mapPrismaToChatbot(clonedChatbot)
    } catch (error) {
      console.error('Error cloning chatbot:', error)
      return undefined
    }
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

  // Debug method to list all chatbots
  async debugListChatbots(): Promise<void> {
    await this.initialize()
    try {
      const chatbots = await prisma.chatbot.findMany()
      console.log('=== Server Chatbot Store Debug ===')
      console.log('Total chatbots:', chatbots.length)
      for (const chatbot of chatbots) {
        console.log(`- ${chatbot.id}: ${chatbot.name} (${chatbot.isActive ? 'active' : 'inactive'})`)
      }
      console.log('===================================')
    } catch (error) {
      console.error('Error in debugListChatbots:', error)
    }
  }

  // Helper method to map Prisma result to Chatbot type
  private mapPrismaToChatbot(prismaRecord: any): Chatbot {
    return {
      id: prismaRecord.id,
      name: prismaRecord.name,
      description: prismaRecord.description,
      targetWebsite: prismaRecord.targetWebsite,
      isActive: prismaRecord.isActive,
      createdAt: prismaRecord.createdAt,
      updatedAt: prismaRecord.updatedAt,
      config: prismaRecord.config as WidgetConfig
    }
  }
}

// Singleton instance
export const serverChatbotStore = new ServerChatbotStore()

// Export the store for API routes
export default serverChatbotStore