'use client'

import { WidgetConfig } from '@/types/widget'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Palette, Mic, MessageSquare, Database, Settings2 } from 'lucide-react'

interface ConfigurationPanelProps {
  config: WidgetConfig
  onConfigUpdate: (updates: Partial<WidgetConfig>) => void
}

export default function ConfigurationPanel({ config, onConfigUpdate }: ConfigurationPanelProps) {
  const updateTheme = (key: keyof WidgetConfig['theme'], value: string) => {
    onConfigUpdate({
      theme: { ...config.theme, [key]: value }
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
                    value={config.theme.primaryColor}
                    onChange={(e) => updateTheme('primaryColor', e.target.value)}
                    className="w-20 h-10"
                  />
                  <Input
                    type="text"
                    value={config.theme.primaryColor}
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
                    value={config.theme.secondaryColor}
                    onChange={(e) => updateTheme('secondaryColor', e.target.value)}
                    className="w-20 h-10"
                  />
                  <Input
                    type="text"
                    value={config.theme.secondaryColor}
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
                    value={config.theme.backgroundColor}
                    onChange={(e) => updateTheme('backgroundColor', e.target.value)}
                    className="w-20 h-10"
                  />
                  <Input
                    type="text"
                    value={config.theme.backgroundColor}
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
                    value={config.theme.textColor}
                    onChange={(e) => updateTheme('textColor', e.target.value)}
                    className="w-20 h-10"
                  />
                  <Input
                    type="text"
                    value={config.theme.textColor}
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
                  value={config.welcomeMessage}
                  onChange={(e) => onConfigUpdate({ welcomeMessage: e.target.value })}
                  className="mt-1"
                  placeholder="Enter welcome message..."
                />
              </div>

              <div>
                <Label htmlFor="botName">Bot Name</Label>
                <Input
                  id="botName"
                  value={config.botName}
                  onChange={(e) => onConfigUpdate({ botName: e.target.value })}
                  className="mt-1"
                  placeholder="Enter bot name..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="displayMode">Display Mode</Label>
                  <Select
                    value={config.displayMode}
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
                    value={config.position}
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
                  value={config.size}
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
                  checked={config.voiceEnabled}
                  onCheckedChange={(checked) => onConfigUpdate({ voiceEnabled: checked })}
                />
              </div>

              <div>
                <Label htmlFor="defaultVoiceEngine">Default Voice Engine</Label>
                <Select
                  value={config.defaultVoiceEngine}
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
                <Label htmlFor="voiceSpeed">Voice Speed: {config.voiceSpeed}x</Label>
                <Slider
                  id="voiceSpeed"
                  min={0.5}
                  max={2}
                  step={0.1}
                  value={[config.voiceSpeed]}
                  onValueChange={([value]) => onConfigUpdate({ voiceSpeed: value })}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="voiceStyle">Voice Style</Label>
                <Select
                  value={config.voiceStyle}
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
                  checked={config.autoPlayResponses}
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
                  value={config.defaultTextModel}
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
                  checked={config.streamingEnabled}
                  onCheckedChange={(checked) => onConfigUpdate({ streamingEnabled: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="showTypingIndicator">Show Typing Indicator</Label>
                <Switch
                  id="showTypingIndicator"
                  checked={config.showTypingIndicator}
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
                  checked={config.ragEnabled}
                  onCheckedChange={(checked) => onConfigUpdate({ ragEnabled: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="showCitations">Show Citations</Label>
                <Switch
                  id="showCitations"
                  checked={config.showCitations}
                  onCheckedChange={(checked) => onConfigUpdate({ showCitations: checked })}
                />
              </div>

              <div>
                <Label htmlFor="maxRetrievedDocs">Max Retrieved Documents: {config.maxRetrievedDocs}</Label>
                <Slider
                  id="maxRetrievedDocs"
                  min={1}
                  max={10}
                  step={1}
                  value={[config.maxRetrievedDocs]}
                  onValueChange={([value]) => onConfigUpdate({ maxRetrievedDocs: value })}
                  className="mt-2"
                />
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
                  checked={config.collectUserInfo}
                  onCheckedChange={(checked) => onConfigUpdate({ collectUserInfo: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="enableAnalytics">Enable Analytics</Label>
                <Switch
                  id="enableAnalytics"
                  checked={config.enableAnalytics}
                  onCheckedChange={(checked) => onConfigUpdate({ enableAnalytics: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="allowFileUploads">Allow File Uploads</Label>
                <Switch
                  id="allowFileUploads"
                  checked={config.allowFileUploads}
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