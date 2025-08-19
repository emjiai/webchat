'use client'

import { useState } from 'react'
import ConfigurationPanel from '@/components/dashboard/ConfigurationPanel'
import PreviewPanel from '@/components/dashboard/PreviewPanel'
import EmbedCodeGenerator from '@/components/dashboard/EmbedCodeGenerator'
import { WidgetConfig } from '@/types/widget'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Settings, Eye, Code } from 'lucide-react'

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
  
  // Widget Mode
  displayMode: 'popup',
  position: 'bottom-right',
  size: 'medium',
  
  // Voice Settings
  voiceEnabled: true,
  defaultVoiceEngine: 'openai',
  voiceSpeed: 1.0,
  voiceStyle: 'friendly',
  autoPlayResponses: false,
  
  // Text Chat Settings
  defaultTextModel: 'gpt',
  streamingEnabled: true,
  showTypingIndicator: true,
  
  // RAG Settings
  ragEnabled: true,
  showCitations: true,
  maxRetrievedDocs: 3,
  
  // Other Settings
  collectUserInfo: false,
  enableAnalytics: false,
  allowFileUploads: false,
}

export default function DashboardPage() {
  const [config, setConfig] = useState<WidgetConfig>(defaultConfig)
  const [activeTab, setActiveTab] = useState('configuration')

  const handleConfigUpdate = (updates: Partial<WidgetConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Widget Dashboard
          </h1>
          <p className="text-gray-600">
            Configure, preview, and generate embed code for your AI chatbot widget
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="configuration" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Configure
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Preview
            </TabsTrigger>
            <TabsTrigger value="embed" className="flex items-center gap-2">
              <Code className="w-4 h-4" />
              Embed
            </TabsTrigger>
          </TabsList>

          <TabsContent value="configuration" className="mt-6">
            <ConfigurationPanel 
              config={config} 
              onConfigUpdate={handleConfigUpdate}
            />
          </TabsContent>

          <TabsContent value="preview" className="mt-6">
            <PreviewPanel config={config} />
          </TabsContent>

          <TabsContent value="embed" className="mt-6">
            <EmbedCodeGenerator config={config} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}