'use client'

import { useState } from 'react'
import ConfigurationPanel from '@/components/dashboard/ConfigurationPanel'
import PreviewPanel from '@/components/dashboard/PreviewPanel'
import EmbedCodeGenerator from '@/components/dashboard/EmbedCodeGenerator'
import StatsPanel from '@/components/dashboard/StatsPanel'
import ThemeEditor from '@/components/dashboard/ThemeEditor'
import VoiceSettings from '@/components/dashboard/VoiceSettings'
import WidgetCustomizer from '@/components/dashboard/WidgetCustomizer'
import { WidgetConfig } from '@/types/widget'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Settings, Eye, Code, ArrowLeft } from 'lucide-react'
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
  const [config, setConfig] = useState<WidgetConfig>(defaultConfig)
  const [activeTab, setActiveTab] = useState('configuration')

  const handleConfigUpdate = (updates: Partial<WidgetConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }))
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Widget Dashboard
          </h1>
          <p className="text-gray-600">
            Configure, preview, and generate embed code for your AI chatbot widget
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-3xl grid-cols-7">
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
            <TabsTrigger value="customize" className="flex items-center gap-2">
              Customize
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center gap-2">
              Analytics
            </TabsTrigger>
            <TabsTrigger value="theme" className="flex items-center gap-2">
              Theme
            </TabsTrigger>
            <TabsTrigger value="voice" className="flex items-center gap-2">
              Voice
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

          <TabsContent value="customize" className="mt-6">
            <WidgetCustomizer 
              config={config}
              onConfigChange={handleConfigUpdate}
            />
          </TabsContent>

          <TabsContent value="stats" className="mt-6">
            <StatsPanel 
              timeRange="7d"
              onRefresh={() => { /* no-op hook for now */ }}
              onExport={() => { /* no-op hook for now */ }}
            />
          </TabsContent>

          <TabsContent value="theme" className="mt-6">
            <ThemeEditor 
              config={config}
              onConfigUpdate={handleConfigUpdate}
            />
          </TabsContent>

          <TabsContent value="voice" className="mt-6">
            <VoiceSettings 
              config={config}
              onConfigUpdate={handleConfigUpdate}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}