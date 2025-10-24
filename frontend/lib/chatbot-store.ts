'use client'

import { Chatbot, WidgetConfig } from '@/types/widget'

// Client-side store that communicates with server APIs
class ChatbotStore {
  private chatbots: Map<string, Chatbot> = new Map()
  private isLoaded: boolean = false
  private loadingPromise: Promise<void> | null = null

  constructor() {
    // Initialize will be called lazily
  }

  private async loadChatbotsFromServer(): Promise<void> {
    if (this.isLoaded || this.loadingPromise) {
      return this.loadingPromise || Promise.resolve()
    }

    this.loadingPromise = this.fetchChatbotsFromAPI()
    return this.loadingPromise
  }

  private async fetchChatbotsFromAPI(): Promise<void> {
    try {
      console.log('Client store: Fetching chatbots from server...')
      // Use internal API to get full chatbot data including configs
      const response = await fetch('/api/chatbots/internal')
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      // Clear existing chatbots and load from server
      this.chatbots.clear()
      
      if (data.chatbots && Array.isArray(data.chatbots)) {
        data.chatbots.forEach((chatbot: Chatbot) => {
          console.log(`Client store: Loading chatbot ${chatbot.id} with config:`, chatbot.config)
          this.chatbots.set(chatbot.id, chatbot)
        })
        console.log(`Client store: Loaded ${data.chatbots.length} chatbots from server`)
      }
      
      // If no chatbots found, try to get all chatbots (including inactive)
      if (this.chatbots.size === 0) {
        await this.fetchAllChatbotsFromAPI()
      }
      
      this.isLoaded = true
    } catch (error) {
      console.error('Client store: Error fetching chatbots from server:', error)
      // Don't throw - create a default chatbot locally if server fails
      await this.createDefaultChatbotViaAPI()
      this.isLoaded = true
    }
  }

  private async fetchAllChatbotsFromAPI(): Promise<void> {
    try {
      // Try to get individual chatbot data
      const response = await fetch('/api/chatbots')
      if (response.ok) {
        const data = await response.json()
        console.log('All chatbots response:', data)
      }
    } catch (error) {
      console.error('Error fetching all chatbots:', error)
    }
  }

  private async createDefaultChatbotViaAPI(): Promise<void> {
    try {
      console.log('Client store: Creating default chatbot via API...')
      const response = await fetch('/api/chatbots', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Default Chatbot',
          description: 'Your first chatbot - configure and customize as needed',
          targetWebsite: '',
        }),
      })

      if (response.ok) {
        const newChatbot = await response.json()
        this.chatbots.set(newChatbot.id, newChatbot)
        console.log('Client store: Created default chatbot:', newChatbot.id)
      }
    } catch (error) {
      console.error('Client store: Error creating default chatbot:', error)
    }
  }

  // Get all chatbots
  async getAllChatbots(): Promise<Chatbot[]> {
    await this.loadChatbotsFromServer()
    return Array.from(this.chatbots.values())
  }

  // Get chatbot by ID
  async getChatbot(id: string): Promise<Chatbot | undefined> {
    await this.loadChatbotsFromServer()
    let chatbot = this.chatbots.get(id)
    
    // If not found in cache, try to fetch from server
    if (!chatbot) {
      try {
        const response = await fetch(`/api/chatbots/${id}`)
        if (response.ok) {
          chatbot = await response.json()
          if (chatbot) {
            this.chatbots.set(id, chatbot)
          }
        }
      } catch (error) {
        console.error(`Client store: Error fetching chatbot ${id}:`, error)
      }
    }
    
    return chatbot
  }

  // Create new chatbot
  async createChatbot(name: string, description?: string, targetWebsite?: string): Promise<Chatbot> {
    try {
      const response = await fetch('/api/chatbots', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, description, targetWebsite }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const newChatbot = await response.json()
      this.chatbots.set(newChatbot.id, newChatbot)
      console.log('Client store: Created chatbot:', newChatbot.id)
      return newChatbot
    } catch (error) {
      console.error('Client store: Error creating chatbot:', error)
      throw error
    }
  }

  // Update chatbot
  async updateChatbot(id: string, updates: Partial<Omit<Chatbot, 'id' | 'createdAt'>>): Promise<Chatbot | undefined> {
    try {
      const response = await fetch(`/api/chatbots/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const updatedChatbot = await response.json()
      this.chatbots.set(id, updatedChatbot)
      console.log('Client store: Updated chatbot:', id)
      return updatedChatbot
    } catch (error) {
      console.error('Client store: Error updating chatbot:', error)
      return undefined
    }
  }

  // Update chatbot configuration
  async updateChatbotConfig(id: string, configUpdates: Partial<WidgetConfig>): Promise<Chatbot | undefined> {
    try {
      const response = await fetch(`/api/chatbots/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ config: configUpdates }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const updatedChatbot = await response.json()
      this.chatbots.set(id, updatedChatbot)
      console.log('Client store: Updated chatbot config:', id)
      return updatedChatbot
    } catch (error) {
      console.error('Client store: Error updating chatbot config:', error)
      return undefined
    }
  }

  // Delete chatbot
  async deleteChatbot(id: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/chatbots/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      this.chatbots.delete(id)
      console.log('Client store: Deleted chatbot:', id)
      return true
    } catch (error) {
      console.error('Client store: Error deleting chatbot:', error)
      return false
    }
  }

  // Toggle chatbot active status
  async toggleChatbotStatus(id: string): Promise<Chatbot | undefined> {
    const chatbot = this.chatbots.get(id)
    if (!chatbot) return undefined

    return this.updateChatbot(id, { isActive: !chatbot.isActive })
  }

  // Clone chatbot
  async cloneChatbot(id: string, newName: string): Promise<Chatbot | undefined> {
    const originalChatbot = this.chatbots.get(id)
    if (!originalChatbot) return undefined

    try {
      return await this.createChatbot(
        newName,
        `Clone of ${originalChatbot.name}`,
        originalChatbot.targetWebsite
      )
    } catch (error) {
      console.error('Client store: Error cloning chatbot:', error)
      return undefined
    }
  }
}

// Singleton instance
export const chatbotStore = new ChatbotStore()

// React hook for chatbot management (now async)
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