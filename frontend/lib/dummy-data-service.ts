import { Chatbot, WidgetConfig, Message } from '@/types/widget'

// Import the data (this will work for both client and server)
let chatbotsData: any
try {
  chatbotsData = require('../../data/chatbots.json')
  console.log('Successfully loaded chatbots.json with', Object.keys(chatbotsData.chatbots || {}).length, 'chatbots')
} catch (error) {
  console.warn('Could not load chatbots.json, using empty data:', error)
  chatbotsData = { chatbots: {} }
}

interface AnalyticsData {
  totalConversations: number
  totalMessages: number
  uniqueUsers: number
  avgResponseTime: number
  voiceMessages: number
  textMessages: number
  ragQueries: number
  satisfaction: number
  activeUsers: number
  peakHour: string
  popularModel: string
  avgSessionDuration: number
  conversationTrends: Array<{ date: string; count: number }>
  modelUsage: Array<{ model: string; percentage: number }>
  responseTimeDistribution: Array<{ range: string; count: number }>
}

interface Conversation {
  id: string
  userId: string
  startedAt: string
  messages: Message[]
}

export class DummyDataService {
  private static data = chatbotsData
  private static initialized = false

  /**
   * Initialize the service (load fresh data from file on server)
   */
  private static initialize(): void {
    if (!this.initialized && typeof window === 'undefined') {
      // Server-side: try to load fresh data from file
      try {
        const fs = require('fs')
        const path = require('path')
        
        // For Next.js, use process.cwd() which points to project root
        const dataFilePath = path.join(process.cwd(), 'data', 'chatbots.json')
        const rawData = fs.readFileSync(dataFilePath, 'utf8')
        this.data = JSON.parse(rawData)
        console.log('Loaded fresh data from file with', Object.keys(this.data.chatbots || {}).length, 'chatbots')
      } catch (error) {
        console.warn('Could not load fresh data from file, using imported data:', error)
      }
      this.initialized = true
    }
  }

  /**
   * Get all chatbots
   */
  static getAllChatbots(): Chatbot[] {
    this.initialize()
    return Object.values(this.data.chatbots) as Chatbot[]
  }

  /**
   * Get chatbot by ID
   */
  static getChatbotById(id: string): Chatbot | null {
    this.initialize()
    const chatbot = this.data.chatbots[id as keyof typeof this.data.chatbots]
    return chatbot ? (chatbot as Chatbot) : null
  }

  /**
   * Get chatbot analytics by ID and time range
   */
  static getChatbotAnalytics(chatbotId: string, timeRange: '24h' | '7d' | '30d' | '90d'): AnalyticsData | null {
    const chatbot = this.getChatbotById(chatbotId)
    if (!chatbot) return null

    // In a real implementation, we would filter data based on timeRange
    // For now, we'll return the stored analytics with some time-based variations
    const baseAnalytics = (chatbot as any).analytics
    
    // Apply time range multipliers to simulate different periods
    const multipliers = {
      '24h': 0.1,
      '7d': 0.7,
      '30d': 1.0,
      '90d': 2.8
    }

    const multiplier = multipliers[timeRange]
    
    return {
      ...baseAnalytics,
      totalConversations: Math.floor(baseAnalytics.totalConversations * multiplier),
      totalMessages: Math.floor(baseAnalytics.totalMessages * multiplier),
      uniqueUsers: Math.floor(baseAnalytics.uniqueUsers * multiplier),
      voiceMessages: Math.floor(baseAnalytics.voiceMessages * multiplier),
      textMessages: Math.floor(baseAnalytics.textMessages * multiplier),
      ragQueries: Math.floor(baseAnalytics.ragQueries * multiplier),
      activeUsers: Math.floor(baseAnalytics.activeUsers * (multiplier > 1 ? 1.2 : multiplier))
    }
  }

  /**
   * Get chatbot conversations
   */
  static getChatbotConversations(chatbotId: string, limit: number = 10): Conversation[] {
    const chatbot = this.getChatbotById(chatbotId)
    if (!chatbot) return []

    const conversations = (chatbot as any).conversations || []
    return conversations.slice(0, limit)
  }

  /**
   * Create a new chatbot
   */
  static createChatbot(chatbotData: Omit<Chatbot, 'id'>): Chatbot {
    this.initialize()
    console.log('Creating new chatbot with data:', chatbotData)
    
    const id = this.generateChatbotId()
    const newChatbot: Chatbot = {
      ...chatbotData,
      id,
      createdAt: new Date(),
      isActive: true
    }

    // Add default analytics and empty conversations
    const chatbotWithExtras = {
      ...newChatbot,
      analytics: this.getDefaultAnalytics(),
      conversations: []
    }

    console.log('Generated chatbot with ID:', id)

    // Add to data
    this.data.chatbots[id as keyof typeof this.data.chatbots] = chatbotWithExtras as any
    
    console.log('Total chatbots after creation:', Object.keys(this.data.chatbots).length)
    
    // Save to file
    this.saveDataToFile()

    return newChatbot
  }

  /**
   * Update chatbot configuration
   */
  static updateChatbotConfig(chatbotId: string, updates: Partial<WidgetConfig>): Chatbot | null {
    const chatbot = this.getChatbotById(chatbotId)
    if (!chatbot) return null

    const updatedChatbot = {
      ...chatbot,
      config: { ...chatbot.config, ...updates }
    }

    // Update in data
    this.data.chatbots[chatbotId as keyof typeof this.data.chatbots] = {
      ...(this.data.chatbots[chatbotId as keyof typeof this.data.chatbots] as any),
      config: updatedChatbot.config
    }

    // Save to file
    this.saveDataToFile()

    return updatedChatbot
  }

  /**
   * Update entire chatbot
   */
  static updateChatbot(chatbotId: string, updates: Partial<Chatbot>): Chatbot | null {
    const chatbot = this.getChatbotById(chatbotId)
    if (!chatbot) return null

    const updatedChatbot = { ...chatbot, ...updates }

    // Update in data
    this.data.chatbots[chatbotId as keyof typeof this.data.chatbots] = {
      ...(this.data.chatbots[chatbotId as keyof typeof this.data.chatbots] as any),
      ...updates
    }

    // Save to file
    this.saveDataToFile()

    return updatedChatbot
  }

  /**
   * Delete chatbot
   */
  static deleteChatbot(chatbotId: string): boolean {
    if (!this.data.chatbots[chatbotId as keyof typeof this.data.chatbots]) {
      return false
    }

    delete this.data.chatbots[chatbotId as keyof typeof this.data.chatbots]
    
    // Save to file
    this.saveDataToFile()

    return true
  }

  /**
   * Add conversation to chatbot
   */
  static addConversation(chatbotId: string, conversation: Conversation): boolean {
    const chatbotData = this.data.chatbots[chatbotId as keyof typeof this.data.chatbots] as any
    if (!chatbotData) return false

    if (!chatbotData.conversations) {
      chatbotData.conversations = []
    }

    chatbotData.conversations.unshift(conversation) // Add to beginning
    
    // Keep only last 50 conversations to prevent file bloat
    if (chatbotData.conversations.length > 50) {
      chatbotData.conversations = chatbotData.conversations.slice(0, 50)
    }

    // Update analytics
    this.updateAnalyticsForNewConversation(chatbotId, conversation)

    // Save to file
    this.saveDataToFile()

    return true
  }

  /**
   * Generate unique chatbot ID
   */
  private static generateChatbotId(): string {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 8)
    return `chatbot_${timestamp}_${random}`
  }

  /**
   * Get default analytics for new chatbots
   */
  private static getDefaultAnalytics(): AnalyticsData {
    return {
      totalConversations: 0,
      totalMessages: 0,
      uniqueUsers: 0,
      avgResponseTime: 0,
      voiceMessages: 0,
      textMessages: 0,
      ragQueries: 0,
      satisfaction: 0,
      activeUsers: 0,
      peakHour: "12:00 PM",
      popularModel: "GPT-4",
      avgSessionDuration: 0,
      conversationTrends: [
        { date: "Mon", count: 0 },
        { date: "Tue", count: 0 },
        { date: "Wed", count: 0 },
        { date: "Thu", count: 0 },
        { date: "Fri", count: 0 },
        { date: "Sat", count: 0 },
        { date: "Sun", count: 0 }
      ],
      modelUsage: [
        { model: "GPT-4", percentage: 0 },
        { model: "Claude", percentage: 0 },
        { model: "Gemini", percentage: 0 },
        { model: "Grok", percentage: 0 },
        { model: "DeepSeek", percentage: 0 }
      ],
      responseTimeDistribution: [
        { range: "0-1s", count: 0 },
        { range: "1-2s", count: 0 },
        { range: "2-3s", count: 0 },
        { range: "3-5s", count: 0 },
        { range: "5s+", count: 0 }
      ]
    }
  }

  /**
   * Update analytics when new conversation is added
   */
  private static updateAnalyticsForNewConversation(chatbotId: string, conversation: Conversation): void {
    const chatbotData = this.data.chatbots[chatbotId as keyof typeof this.data.chatbots] as any
    if (!chatbotData || !chatbotData.analytics) return

    const analytics = chatbotData.analytics

    // Update basic counts
    analytics.totalConversations += 1
    analytics.totalMessages += conversation.messages.length
    analytics.uniqueUsers += 1 // Simplified - in real app, check if user is unique

    // Update message type counts
    conversation.messages.forEach(message => {
      if (message.type === 'voice') {
        analytics.voiceMessages += 1
      } else {
        analytics.textMessages += 1
      }

      if (message.citations && message.citations.length > 0) {
        analytics.ragQueries += 1
      }
    })

    // Update model usage (simplified)
    const lastMessage = conversation.messages[conversation.messages.length - 1]
    if (lastMessage && lastMessage.model) {
      const modelUsage = analytics.modelUsage.find((m: any) => m.model.toLowerCase() === lastMessage.model)
      if (modelUsage) {
        modelUsage.percentage = Math.min(100, modelUsage.percentage + 1)
      }
    }
  }

  /**
   * Save data to file (server-side only)
   */
  private static saveDataToFile(): void {
    // Only save on server-side
    if (typeof window === 'undefined') {
      try {
        const fs = require('fs')
        const path = require('path')
        
        // For Next.js, use process.cwd() which points to project root
        const dataFilePath = path.join(process.cwd(), 'data', 'chatbots.json')
        
        console.log('Saving chatbot data to:', dataFilePath)
        fs.writeFileSync(dataFilePath, JSON.stringify(this.data, null, 2))
        console.log('Successfully saved chatbot data to file')
      } catch (error) {
        console.error('Failed to save chatbot data:', error)
      }
    }
  }

  /**
   * Reload data from file (useful for development)
   */
  static reloadData(): void {
    if (typeof window === 'undefined') {
      try {
        const fs = require('fs')
        const path = require('path')
        const dataFilePath = path.join(process.cwd(), 'data', 'chatbots.json')
        const rawData = fs.readFileSync(dataFilePath, 'utf8')
        this.data = JSON.parse(rawData)
        console.log('Successfully reloaded chatbot data from file')
      } catch (error) {
        console.error('Failed to reload chatbot data:', error)
      }
    }
  }

  /**
   * Get chatbot statistics summary
   */
  static getSystemStats(): {
    totalChatbots: number
    activeChatbots: number
    totalConversations: number
    totalMessages: number
  } {
    const chatbots = this.getAllChatbots()
    const activeChatbots = chatbots.filter(bot => bot.isActive)
    
    const totalConversations = chatbots.reduce((sum, bot) => {
      const analytics = (bot as any).analytics
      return sum + (analytics?.totalConversations || 0)
    }, 0)

    const totalMessages = chatbots.reduce((sum, bot) => {
      const analytics = (bot as any).analytics
      return sum + (analytics?.totalMessages || 0)
    }, 0)

    return {
      totalChatbots: chatbots.length,
      activeChatbots: activeChatbots.length,
      totalConversations,
      totalMessages
    }
  }

  /**
   * Debug method to test file paths and permissions
   */
  static testFilePaths(): { [key: string]: any } {
    if (typeof window !== 'undefined') {
      return { error: 'This method only works server-side' }
    }

    const results: { [key: string]: any } = {}
    
    try {
      const fs = require('fs')
      const path = require('path')
      
      // Test __dirname approach (Next.js build directory)
      const dirnameBasedPath = path.join(__dirname, '..', '..', 'data', 'chatbots.json')
      results.dirnameBasedPath = {
        path: dirnameBasedPath,
        exists: fs.existsSync(dirnameBasedPath),
        readable: false,
        writable: false,
        note: 'This points to Next.js build directory - usually wrong'
      }
      
      if (results.dirnameBasedPath.exists) {
        try {
          fs.accessSync(dirnameBasedPath, fs.constants.R_OK)
          results.dirnameBasedPath.readable = true
        } catch {}
        
        try {
          fs.accessSync(dirnameBasedPath, fs.constants.W_OK)
          results.dirnameBasedPath.writable = true
        } catch {}
      }

      // Test process.cwd() approach (RECOMMENDED for Next.js)
      const cwdBasedPath = path.join(process.cwd(), 'data', 'chatbots.json')
      results.cwdBasedPath = {
        path: cwdBasedPath,
        exists: fs.existsSync(cwdBasedPath),
        readable: false,
        writable: false,
        note: 'This is the correct path for Next.js projects'
      }
      
      if (results.cwdBasedPath.exists) {
        try {
          fs.accessSync(cwdBasedPath, fs.constants.R_OK)
          results.cwdBasedPath.readable = true
        } catch {}
        
        try {
          fs.accessSync(cwdBasedPath, fs.constants.W_OK)
          results.cwdBasedPath.writable = true
        } catch {}
      }

      // Test alternative relative path
      const relativePath = path.resolve('./data/chatbots.json')
      results.relativePath = {
        path: relativePath,
        exists: fs.existsSync(relativePath),
        readable: false,
        writable: false
      }
      
      if (results.relativePath.exists) {
        try {
          fs.accessSync(relativePath, fs.constants.R_OK)
          results.relativePath.readable = true
        } catch {}
        
        try {
          fs.accessSync(relativePath, fs.constants.W_OK)
          results.relativePath.writable = true
        } catch {}
      }

      results.currentWorkingDirectory = process.cwd()
      results.__dirname = __dirname
      
    } catch (error) {
      results.error = error
    }

    return results
  }
}

export default DummyDataService