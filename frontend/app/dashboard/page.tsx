'use client'

import { useState, useEffect } from 'react'
import ConfigurationPanel from '@/components/dashboard/ConfigurationPanel'
import PreviewPanel from '@/components/dashboard/PreviewPanel'
import EmbedCodeGenerator from '@/components/dashboard/EmbedCodeGenerator'
import StatsPanel from '@/components/dashboard/StatsPanel'
import ThemeEditor from '@/components/dashboard/ThemeEditor'
import VoiceSettings from '@/components/dashboard/VoiceSettings'
import WidgetCustomizer from '@/components/dashboard/WidgetCustomizer'
import ChatbotManager from '@/components/dashboard/ChatbotManager'
import RAGManagement from '@/components/dashboard/RAGManagement'
import { WidgetConfig, Chatbot } from '@/types/widget'
import { useChatbotStore } from '@/lib/chatbot-store'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Settings, Eye, Code, ArrowLeft, Bot, Database } from 'lucide-react'
import Link from 'next/link'

const defaultConfig: WidgetConfig = {
  // Appearance
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
  
  // Widget Mode
  displayMode: 'popup',
  position: 'bottom-right',
  size: 'medium',
  width: 380,
  height: 560,
  zIndex: 9999,
  showHeader: true,
  showFooter: true,
  enableDragDrop: true,
  
  // Voice Settings
  voiceEnabled: true,
  defaultVoiceEngine: 'openai',
  voiceSpeed: 1.0,
  voiceStyle: 'friendly',
  autoPlayResponses: false,
  
  // Text Chat Settings
  defaultTextModel: 'gpt',
  temperature: 0.7,
  maxTokens: 1024,
  streamingEnabled: true,
  showTypingIndicator: true,
  
  // RAG Settings
  ragEnabled: true,
  showCitations: true,
  maxRetrievedDocs: 3,
  minRelevanceScore: 0.5,
  
  // Other Settings
  collectUserInfo: false,
  enableAnalytics: false,
  allowFileUploads: false,
}

export default function DashboardPage() {
  const chatbotStore = useChatbotStore()
  const [selectedChatbot, setSelectedChatbot] = useState<Chatbot | null>(null)
  const [activeTab, setActiveTab] = useState('chatbots')

  useEffect(() => {
    // Load the first available chatbot on mount
    const loadChatbots = async () => {
      console.log('Dashboard: Loading chatbots...')
      const chatbots = await chatbotStore.getAllChatbots()
      console.log('Dashboard: Loaded chatbots:', chatbots.length, chatbots)
      if (chatbots.length > 0) {
        console.log('Dashboard: First chatbot config:', chatbots[0].config)
        setSelectedChatbot(chatbots[0])
      }
    }
    loadChatbots()
  }, [])

  const handleConfigUpdate = async (updates: Partial<WidgetConfig>) => {
    if (!selectedChatbot) return
    
    const updatedChatbot = await chatbotStore.updateChatbotConfig(selectedChatbot.id, updates)
    if (updatedChatbot) {
      setSelectedChatbot(updatedChatbot)
    }
  }

  const handleSelectChatbot = (chatbot: Chatbot) => {
    console.log('Dashboard: Selected chatbot:', chatbot)
    console.log('Dashboard: Chatbot config:', chatbot.config)
    console.log('Dashboard: Welcome message:', chatbot.config?.welcomeMessage)
    console.log('Dashboard: Bot name:', chatbot.config?.botName)
    
    setSelectedChatbot(chatbot)
    // Switch to configuration tab when a chatbot is selected
    if (activeTab === 'chatbots') {
      setActiveTab('configuration')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Widget Dashboard
              </h1>
              {selectedChatbot ? (
                <p className="text-gray-600">
                  Managing: <span className="font-semibold text-gray-900">{selectedChatbot.name}</span>
                  {selectedChatbot.targetWebsite && (
                    <span className="text-gray-500"> • {selectedChatbot.targetWebsite}</span>
                  )}
                </p>
              ) : (
                <p className="text-gray-600">
                  Select a chatbot to configure and customize
                </p>
              )}
            </div>
            {selectedChatbot && (
              <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg shadow-sm border">
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
                  style={{ 
                    background: `linear-gradient(135deg, ${selectedChatbot.config?.theme?.primaryColor || defaultConfig.theme.primaryColor}, ${selectedChatbot.config?.theme?.secondaryColor || defaultConfig.theme.secondaryColor})` 
                  }}
                >
                  <Bot className="w-4 h-4" />
                </div>
                <div className="text-sm">
                  <div className="font-medium">{selectedChatbot.name}</div>
                  <div className={`text-xs ${selectedChatbot.isActive ? 'text-green-600' : 'text-gray-500'}`}>
                    {selectedChatbot.isActive ? 'Active' : 'Inactive'}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-5xl grid-cols-9">
            <TabsTrigger value="chatbots" className="flex items-center gap-2">
              <Bot className="w-4 h-4" />
              Chatbots
            </TabsTrigger>
            <TabsTrigger value="configuration" className="flex items-center gap-2" disabled={!selectedChatbot}>
              <Settings className="w-4 h-4" />
              Configure
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex items-center gap-2" disabled={!selectedChatbot}>
              <Eye className="w-4 h-4" />
              Preview
            </TabsTrigger>
            <TabsTrigger value="embed" className="flex items-center gap-2" disabled={!selectedChatbot}>
              <Code className="w-4 h-4" />
              Embed
            </TabsTrigger>
            <TabsTrigger value="customize" className="flex items-center gap-2" disabled={!selectedChatbot}>
              Customize
            </TabsTrigger>
            <TabsTrigger value="theme" className="flex items-center gap-2" disabled={!selectedChatbot}>
              Theme
            </TabsTrigger>
            <TabsTrigger value="voice" className="flex items-center gap-2" disabled={!selectedChatbot}>
              Voice
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center gap-2" disabled={!selectedChatbot}>
              Analytics
            </TabsTrigger>
            <TabsTrigger value="rag" className="flex items-center gap-2" disabled={!selectedChatbot}>
              <Database className="w-4 h-4" />
              RAG Data
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chatbots" className="mt-6">
            <ChatbotManager 
              onSelectChatbot={handleSelectChatbot}
              selectedChatbotId={selectedChatbot?.id}
            />
          </TabsContent>

          <TabsContent value="configuration" className="mt-6">
            {selectedChatbot && (
              <ConfigurationPanel 
                config={selectedChatbot.config || defaultConfig} 
                onConfigUpdate={handleConfigUpdate}
              />
            )}
          </TabsContent>

          <TabsContent value="preview" className="mt-6">
            {selectedChatbot && (
              <PreviewPanel 
                config={{
                  ...(selectedChatbot.config || defaultConfig),
                  botName: selectedChatbot.config?.botName || selectedChatbot.name || 'AI Assistant'
                }} 
              />
            )}
          </TabsContent>

          <TabsContent value="embed" className="mt-6">
            {selectedChatbot && (
              <EmbedCodeGenerator 
                config={selectedChatbot.config || defaultConfig} 
                chatbotId={selectedChatbot.id}
                chatbotName={selectedChatbot.name}
              />
            )}
          </TabsContent>

          <TabsContent value="customize" className="mt-6">
            {selectedChatbot && (
              <WidgetCustomizer 
                config={selectedChatbot.config || defaultConfig}
                onConfigChange={handleConfigUpdate}
              />
            )}
          </TabsContent>

          <TabsContent value="theme" className="mt-6">
            {selectedChatbot && (
              <ThemeEditor 
                config={selectedChatbot.config || defaultConfig}
                onConfigUpdate={handleConfigUpdate}
              />
            )}
          </TabsContent>

          <TabsContent value="voice" className="mt-6">
            {selectedChatbot && (
              <VoiceSettings 
                config={selectedChatbot.config || defaultConfig}
                onConfigUpdate={handleConfigUpdate}
              />
            )}
          </TabsContent>

          <TabsContent value="stats" className="mt-6">
            {selectedChatbot && (
              <StatsPanel 
                chatbotId={selectedChatbot.id}
                timeRange="7d"
                onRefresh={() => { /* no-op hook for now */ }}
                onExport={() => { /* no-op hook for now */ }}
              />
            )}
          </TabsContent>

          <TabsContent value="rag" className="mt-6">
            {selectedChatbot && (
              <RAGManagement 
                chatbotId={selectedChatbot.id}
                chatbotName={selectedChatbot.name}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}