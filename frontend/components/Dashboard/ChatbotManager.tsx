'use client'

import { useState, useEffect } from 'react'
import { Chatbot } from '@/types/widget'
import { useChatbotStore } from '@/lib/chatbot-store'
import { Bot, Plus, Edit3, Copy, Trash2, Globe, Power, Settings, MoreVertical } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface ChatbotManagerProps {
  onSelectChatbot: (chatbot: Chatbot) => void
  selectedChatbotId?: string
}

export default function ChatbotManager({ onSelectChatbot, selectedChatbotId }: ChatbotManagerProps) {
  const chatbotStoreHook = useChatbotStore()
  const [chatbots, setChatbots] = useState<Chatbot[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newChatbotName, setNewChatbotName] = useState('')
  const [newChatbotDescription, setNewChatbotDescription] = useState('')
  const [newChatbotWebsite, setNewChatbotWebsite] = useState('')

  useEffect(() => {
    refreshChatbots()
  }, [])

  const refreshChatbots = async () => {
    setIsLoading(true)
    try {
      const allChatbots = await chatbotStoreHook.getAllChatbots()
      setChatbots(allChatbots)
    } catch (error) {
      console.error('Error loading chatbots:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateChatbot = async () => {
    if (!newChatbotName.trim()) return

    try {
      const newChatbot = await chatbotStoreHook.createChatbot(
        newChatbotName.trim(),
        newChatbotDescription.trim() || undefined,
        newChatbotWebsite.trim() || undefined
      )

      setNewChatbotName('')
      setNewChatbotDescription('')
      setNewChatbotWebsite('')
      setShowCreateModal(false)
      await refreshChatbots()
      onSelectChatbot(newChatbot)
    } catch (error) {
      console.error('Error creating chatbot:', error)
      alert('Failed to create chatbot. Please try again.')
    }
  }

  const handleCloneChatbot = async (chatbot: Chatbot) => {
    try {
      const clonedChatbot = await chatbotStoreHook.cloneChatbot(chatbot.id, `${chatbot.name} (Copy)`)
      if (clonedChatbot) {
        await refreshChatbots()
        onSelectChatbot(clonedChatbot)
      }
    } catch (error) {
      console.error('Error cloning chatbot:', error)
      alert('Failed to clone chatbot. Please try again.')
    }
  }

  const handleDeleteChatbot = async (chatbotId: string) => {
    if (chatbotId === 'default') {
      alert('Cannot delete the default chatbot')
      return
    }

    if (confirm('Are you sure you want to delete this chatbot? This action cannot be undone.')) {
      try {
        const success = await chatbotStoreHook.deleteChatbot(chatbotId)
        if (success) {
          await refreshChatbots()
          
          // If deleted chatbot was selected, select the first available one
          if (selectedChatbotId === chatbotId) {
            const remaining = await chatbotStoreHook.getAllChatbots()
            if (remaining.length > 0) {
              onSelectChatbot(remaining[0])
            }
          }
        }
      } catch (error) {
        console.error('Error deleting chatbot:', error)
        alert('Failed to delete chatbot. Please try again.')
      }
    }
  }

  const handleToggleStatus = async (chatbotId: string) => {
    try {
      const updatedChatbot = await chatbotStoreHook.toggleChatbotStatus(chatbotId)
      if (updatedChatbot) {
        await refreshChatbots()
      }
    } catch (error) {
      console.error('Error toggling chatbot status:', error)
      alert('Failed to update chatbot status. Please try again.')
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Bot className="w-6 h-6 text-blue-600" />
          Your Chatbots
        </h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Chatbot
        </button>
      </div>

      {/* Chatbots Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading chatbots...</p>
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          {chatbots.map((chatbot) => (
          <motion.div
            key={chatbot.id}
            layout
            className={`p-4 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
              selectedChatbotId === chatbot.id 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => onSelectChatbot(chatbot)}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center text-white"
                  style={{ 
                    background: `linear-gradient(135deg, ${chatbot.theme?.primaryColor || '#3b82f6'}, ${chatbot.theme?.secondaryColor || '#8b5cf6'})` 
                  }}
                >
                  <Bot className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900 truncate">{chatbot.name}</h3>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      chatbot.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {chatbot.isActive ? 'Active' : 'Inactive'}
                    </div>
                  </div>
                  {chatbot.description && (
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">{chatbot.description}</p>
                  )}
                  {chatbot.targetWebsite && (
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Globe className="w-3 h-3" />
                      <span className="truncate">{chatbot.targetWebsite}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                    <span>Created {new Date(chatbot.createdAt).toLocaleDateString()}</span>
                    <span>Updated {new Date(chatbot.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1 ml-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleToggleStatus(chatbot.id)
                  }}
                  className={`p-2 rounded-lg transition-colors ${
                    chatbot.isActive 
                      ? 'text-green-600 hover:bg-green-100' 
                      : 'text-gray-400 hover:bg-gray-100'
                  }`}
                  title={chatbot.isActive ? 'Deactivate' : 'Activate'}
                >
                  <Power className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleCloneChatbot(chatbot)
                  }}
                  className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                  title="Clone Chatbot"
                >
                  <Copy className="w-4 h-4" />
                </button>
                {chatbot.id !== 'default' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteChatbot(chatbot.id)
                    }}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                    title="Delete Chatbot"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
          ))}
        </div>
      )}

      {!isLoading && chatbots.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Bot className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium mb-2">No chatbots yet</p>
          <p className="text-sm">Create your first chatbot to get started</p>
        </div>
      )}

      {/* Create Chatbot Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-6 w-full max-w-md mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold mb-4">Create New Chatbot</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Chatbot Name *
                  </label>
                  <input
                    type="text"
                    value={newChatbotName}
                    onChange={(e) => setNewChatbotName(e.target.value)}
                    placeholder="e.g., Customer Support Bot"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={newChatbotDescription}
                    onChange={(e) => setNewChatbotDescription(e.target.value)}
                    placeholder="Brief description of this chatbot's purpose"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Target Website
                  </label>
                  <input
                    type="text"
                    value={newChatbotWebsite}
                    onChange={(e) => setNewChatbotWebsite(e.target.value)}
                    placeholder="e.g., https://example.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateChatbot}
                  disabled={!newChatbotName.trim()}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Create Chatbot
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}