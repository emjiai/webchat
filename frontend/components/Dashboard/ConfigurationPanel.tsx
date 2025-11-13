'use client'

import { useState, useEffect } from 'react'
import { WidgetConfig } from '@/types/widget'
import { Corpus } from '@/types/rag'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Palette, Mic, MessageSquare, Database, Settings2, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getCorpora } from '@/lib/rag-api'

interface ConfigurationPanelProps {
  config: WidgetConfig
  onConfigUpdate: (updates: Partial<WidgetConfig>) => void
}

export default function ConfigurationPanel({ config, onConfigUpdate }: ConfigurationPanelProps) {
  const [corpora, setCorpora] = useState<Corpus[]>([])
  const [isLoadingCorpora, setIsLoadingCorpora] = useState(true)

  // Load corpora on mount
  useEffect(() => {
    loadCorpora()
  }, [])

  const loadCorpora = async () => {
    try {
      setIsLoadingCorpora(true)
      const corporaData = await getCorpora(undefined)
      setCorpora(corporaData)
    } catch (error) {
      console.error('Failed to load corpora:', error)
      // Could implement a notification system later
    } finally {
      setIsLoadingCorpora(false)
    }
  }

  const updateTheme = (key: keyof WidgetConfig['theme'], value: string) => {
    const defaultTheme = {
      primaryColor: '#3b82f6',
      secondaryColor: '#8b5cf6',
      backgroundColor: '#ffffff',
      textColor: '#1f2937',
      fontFamily: 'Outfit'
    }
    
    onConfigUpdate({
      theme: { 
        ...defaultTheme,
        ...config?.theme, 
        [key]: value 
      }
    })
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <Tabs defaultValue="appearance" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="appearance" className="text-xs">
            <Palette className="w-4 h-4 mr-1" />
            Appearance
          </TabsTrigger>
          <TabsTrigger value="voice" className="text-xs">
            <Mic className="w-4 h-4 mr-1" />
            Voice
          </TabsTrigger>
          <TabsTrigger value="text" className="text-xs">
            <MessageSquare className="w-4 h-4 mr-1" />
            Text
          </TabsTrigger>
          <TabsTrigger value="rag" className="text-xs">
            <Database className="w-4 h-4 mr-1" />
            RAG
          </TabsTrigger>
          <TabsTrigger value="advanced" className="text-xs">
            <Settings2 className="w-4 h-4 mr-1" />
            Advanced
          </TabsTrigger>
        </TabsList>

        <TabsContent value="appearance" className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Appearance Settings</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="primaryColor">Primary Color</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="primaryColor"
                    type="color"
                    value={config?.theme?.primaryColor || '#3b82f6'}
                    onChange={(e) => updateTheme('primaryColor', e.target.value)}
                    className="w-20 h-10"
                  />
                  <Input
                    type="text"
                    value={config?.theme?.primaryColor || '#3b82f6'}
                    onChange={(e) => updateTheme('primaryColor', e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="secondaryColor">Secondary Color</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="secondaryColor"
                    type="color"
                    value={config?.theme?.secondaryColor || '#8b5cf6'}
                    onChange={(e) => updateTheme('secondaryColor', e.target.value)}
                    className="w-20 h-10"
                  />
                  <Input
                    type="text"
                    value={config?.theme?.secondaryColor || '#8b5cf6'}
                    onChange={(e) => updateTheme('secondaryColor', e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="backgroundColor">Background Color</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="backgroundColor"
                    type="color"
                    value={config?.theme?.backgroundColor || '#ffffff'}
                    onChange={(e) => updateTheme('backgroundColor', e.target.value)}
                    className="w-20 h-10"
                  />
                  <Input
                    type="text"
                    value={config?.theme?.backgroundColor || '#ffffff'}
                    onChange={(e) => updateTheme('backgroundColor', e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="textColor">Text Color</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="textColor"
                    type="color"
                    value={config?.theme?.textColor || '#1f2937'}
                    onChange={(e) => updateTheme('textColor', e.target.value)}
                    className="w-20 h-10"
                  />
                  <Input
                    type="text"
                    value={config?.theme?.textColor || '#1f2937'}
                    onChange={(e) => updateTheme('textColor', e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <Label htmlFor="welcomeMessage">Welcome Message</Label>
                <Input
                  id="welcomeMessage"
                  value={config?.welcomeMessage || ''}
                  onChange={(e) => onConfigUpdate({ welcomeMessage: e.target.value })}
                  className="mt-1"
                  placeholder="Enter welcome message..."
                />
              </div>

              <div>
                <Label htmlFor="botName">Bot Name</Label>
                <Input
                  id="botName"
                  value={config?.botName || ''}
                  onChange={(e) => onConfigUpdate({ botName: e.target.value })}
                  className="mt-1"
                  placeholder="Enter bot name..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="displayMode">Display Mode</Label>
                  <Select
                    value={config?.displayMode || 'popup'}
                    onValueChange={(value: any) => onConfigUpdate({ displayMode: value })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="popup">Popup</SelectItem>
                      <SelectItem value="inline">Inline</SelectItem>
                      <SelectItem value="fullscreen">Fullscreen</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="position">Position</Label>
                  <Select
                    value={config?.position || 'bottom-right'}
                    onValueChange={(value: any) => onConfigUpdate({ position: value })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bottom-right">Bottom Right</SelectItem>
                      <SelectItem value="bottom-left">Bottom Left</SelectItem>
                      <SelectItem value="top-right">Top Right</SelectItem>
                      <SelectItem value="top-left">Top Left</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="size">Widget Size</Label>
                <Select
                  value={config?.size || 'medium'}
                  onValueChange={(value: any) => onConfigUpdate({ size: value })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="large">Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="voice" className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Voice Settings</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="voiceEnabled">Enable Voice</Label>
                <Switch
                  id="voiceEnabled"
                  checked={config?.voiceEnabled || false}
                  onCheckedChange={(checked) => onConfigUpdate({ voiceEnabled: checked })}
                />
              </div>

              <div>
                <Label htmlFor="defaultVoiceEngine">Default Voice Engine</Label>
                <Select
                  value={config?.defaultVoiceEngine || 'openai'}
                  onValueChange={(value: any) => onConfigUpdate({ defaultVoiceEngine: value })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="openai">OpenAI</SelectItem>
                    <SelectItem value="elevenlabs">Eleven Labs</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="voiceSpeed">Voice Speed: {config?.voiceSpeed || 1.0}x</Label>
                <Slider
                  id="voiceSpeed"
                  min={0.5}
                  max={2}
                  step={0.1}
                  value={[config?.voiceSpeed || 1.0]}
                  onValueChange={([value]) => onConfigUpdate({ voiceSpeed: value })}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="voiceStyle">Voice Style</Label>
                <Select
                  value={config?.voiceStyle || 'friendly'}
                  onValueChange={(value) => onConfigUpdate({ voiceStyle: value })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="friendly">Friendly</SelectItem>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="casual">Casual</SelectItem>
                    <SelectItem value="energetic">Energetic</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="autoPlayResponses">Auto-play Voice Responses</Label>
                <Switch
                  id="autoPlayResponses"
                  checked={config?.autoPlayResponses || false}
                  onCheckedChange={(checked) => onConfigUpdate({ autoPlayResponses: checked })}
                />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="text" className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Text Chat Settings</h3>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="defaultTextModel">Default Text Model</Label>
                <Select
                  value={config?.defaultTextModel || 'gpt'}
                  onValueChange={(value: any) => onConfigUpdate({ defaultTextModel: value })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gpt">GPT-4</SelectItem>
                    <SelectItem value="gemini">Gemini</SelectItem>
                    <SelectItem value="claude">Claude</SelectItem>
                    <SelectItem value="grok">Grok</SelectItem>
                    <SelectItem value="deepseek">DeepSeek</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="streamingEnabled">Enable Streaming</Label>
                <Switch
                  id="streamingEnabled"
                  checked={config?.streamingEnabled || true}
                  onCheckedChange={(checked) => onConfigUpdate({ streamingEnabled: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="showTypingIndicator">Show Typing Indicator</Label>
                <Switch
                  id="showTypingIndicator"
                  checked={config?.showTypingIndicator || true}
                  onCheckedChange={(checked) => onConfigUpdate({ showTypingIndicator: checked })}
                />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="rag" className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">RAG Settings</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="ragEnabled">Enable RAG</Label>
                <Switch
                  id="ragEnabled"
                  checked={config?.ragEnabled || true}
                  onCheckedChange={(checked) => onConfigUpdate({ ragEnabled: checked })}
                />
              </div>

              {/* Corpus Selection */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="ragCorpusId">Knowledge Base</Label>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.open('#rag-management', '_blank')}
                    className="h-8 text-xs"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Manage
                  </Button>
                </div>
                <Select 
                  value={config?.ragCorpusId || ''} 
                  onValueChange={(value) => onConfigUpdate({ ragCorpusId: value })}
                  disabled={!config?.ragEnabled || isLoadingCorpora}
                >
                  <SelectTrigger>
                    <SelectValue 
                      placeholder={
                        isLoadingCorpora 
                          ? 'Loading corpora...' 
                          : corpora.length === 0 
                          ? 'No corpora available. Create one in RAG Management.'
                          : 'Select a knowledge base'
                      } 
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {corpora.map(corpus => (
                      <SelectItem key={corpus.id} value={corpus.id}>
                        <div className="flex items-center gap-2">
                          <Database className="w-4 h-4" />
                          <div>
                            <div className="font-medium">{corpus.display_name}</div>
                            <div className="text-xs text-gray-500">
                              {corpus.document_count} documents
                            </div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">
                  Choose which knowledge base the chatbot should use to answer questions. 
                  Create and manage corpora in the RAG Management section.
                </p>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="showCitations">Show Citations</Label>
                <Switch
                  id="showCitations"
                  checked={config?.showCitations || true}
                  onCheckedChange={(checked) => onConfigUpdate({ showCitations: checked })}
                />
              </div>

              <div>
                <Label htmlFor="maxRetrievedDocs">Max Retrieved Documents: {config?.maxRetrievedDocs || 3}</Label>
                <Slider
                  id="maxRetrievedDocs"
                  min={1}
                  max={10}
                  step={1}
                  value={[config?.maxRetrievedDocs || 3]}
                  onValueChange={([value]) => onConfigUpdate({ maxRetrievedDocs: value })}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="minRelevanceScore">
                  Minimum Relevance Score: {(config?.minRelevanceScore || 0.5).toFixed(2)}
                </Label>
                <Slider
                  id="minRelevanceScore"
                  min={0}
                  max={1}
                  step={0.05}
                  value={[config?.minRelevanceScore || 0.5]}
                  onValueChange={([value]) => onConfigUpdate({ minRelevanceScore: value })}
                  className="mt-2"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Only show documents with relevance above this threshold
                </p>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Advanced Settings</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="collectUserInfo">Collect User Information</Label>
                <Switch
                  id="collectUserInfo"
                  checked={config?.collectUserInfo || false}
                  onCheckedChange={(checked) => onConfigUpdate({ collectUserInfo: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="enableAnalytics">Enable Analytics</Label>
                <Switch
                  id="enableAnalytics"
                  checked={config?.enableAnalytics || false}
                  onCheckedChange={(checked) => onConfigUpdate({ enableAnalytics: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="allowFileUploads">Allow File Uploads</Label>
                <Switch
                  id="allowFileUploads"
                  checked={config?.allowFileUploads || false}
                  onCheckedChange={(checked) => onConfigUpdate({ allowFileUploads: checked })}
                />
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}