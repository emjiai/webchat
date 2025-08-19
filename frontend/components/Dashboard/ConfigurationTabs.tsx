'use client'

import { useState } from 'react'
import { WidgetConfig } from '@/types/widget'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import ThemeEditor from './ThemeEditor'
import VoiceSettings from './VoiceSettings'
import { 
  Palette, 
  Mic, 
  MessageSquare, 
  Database, 
  Settings2, 
  Code,
  Globe,
  Shield,
  Zap,
  Save,
  RotateCcw,
  Download,
  Upload
} from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Textarea } from '@/components/ui/textarea'

interface ConfigurationTabsProps {
  config: WidgetConfig
  onConfigUpdate: (updates: Partial<WidgetConfig>) => void
  onSave?: () => void
  onReset?: () => void
  onExport?: () => void
  onImport?: (file: File) => void
}

export default function ConfigurationTabs({ 
  config, 
  onConfigUpdate,
  onSave,
  onReset,
  onExport,
  onImport
}: ConfigurationTabsProps) {
  const [activeTab, setActiveTab] = useState('appearance')
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [isAdvancedMode, setIsAdvancedMode] = useState(false)

  const handleConfigChange = (updates: Partial<WidgetConfig>) => {
    onConfigUpdate(updates)
    setHasUnsavedChanges(true)
  }

  const handleSave = () => {
    onSave?.()
    setHasUnsavedChanges(false)
  }

  const handleReset = () => {
    onReset?.()
    setHasUnsavedChanges(false)
  }

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      onImport?.(file)
      setHasUnsavedChanges(true)
    }
  }

  return (
    <div className="w-full space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold">Widget Configuration</h2>
          {hasUnsavedChanges && (
            <Badge variant="warning" className="animate-pulse">
              Unsaved Changes
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAdvancedMode(!isAdvancedMode)}
          >
            <Settings2 className="w-4 h-4 mr-2" />
            {isAdvancedMode ? 'Simple' : 'Advanced'} Mode
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            disabled={!hasUnsavedChanges}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onExport}
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          
          <label className="cursor-pointer">
            <Button
              variant="outline"
              size="sm"
              as="span"
            >
              <Upload className="w-4 h-4 mr-2" />
              Import
            </Button>
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </label>
          
          <Button
            onClick={handleSave}
            disabled={!hasUnsavedChanges}
          >
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      {/* Configuration Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-8 lg:grid-cols-8">
          <TabsTrigger value="appearance" className="text-xs">
            <Palette className="w-4 h-4 mr-1" />
            <span className="hidden sm:inline">Theme</span>
          </TabsTrigger>
          <TabsTrigger value="voice" className="text-xs">
            <Mic className="w-4 h-4 mr-1" />
            <span className="hidden sm:inline">Voice</span>
          </TabsTrigger>
          <TabsTrigger value="text" className="text-xs">
            <MessageSquare className="w-4 h-4 mr-1" />
            <span className="hidden sm:inline">Chat</span>
          </TabsTrigger>
          <TabsTrigger value="rag" className="text-xs">
            <Database className="w-4 h-4 mr-1" />
            <span className="hidden sm:inline">RAG</span>
          </TabsTrigger>
          <TabsTrigger value="behavior" className="text-xs">
            <Zap className="w-4 h-4 mr-1" />
            <span className="hidden sm:inline">Behavior</span>
          </TabsTrigger>
          <TabsTrigger value="integration" className="text-xs">
            <Globe className="w-4 h-4 mr-1" />
            <span className="hidden sm:inline">Integration</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="text-xs">
            <Shield className="w-4 h-4 mr-1" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
          <TabsTrigger value="advanced" className="text-xs">
            <Code className="w-4 h-4 mr-1" />
            <span className="hidden sm:inline">Advanced</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="appearance" className="space-y-4">
          <ThemeEditor 
            config={config} 
            onConfigUpdate={handleConfigChange}
            showAdvanced={isAdvancedMode}
          />
        </TabsContent>

        <TabsContent value="voice" className="space-y-4">
          <VoiceSettings
            config={config}
            onConfigUpdate={handleConfigChange}
            showAdvanced={isAdvancedMode}
          />
        </TabsContent>

        <TabsContent value="text" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Chat Settings</CardTitle>
              <CardDescription>Configure text chat behavior and AI models</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="defaultTextModel">Default AI Model</Label>
                  <Select
                    value={config.defaultTextModel}
                    onValueChange={(value: any) => handleConfigChange({ defaultTextModel: value })}
                  >
                    <SelectTrigger id="defaultTextModel">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpt">GPT-4 (OpenAI)</SelectItem>
                      <SelectItem value="gemini">Gemini Pro (Google)</SelectItem>
                      <SelectItem value="claude">Claude 3 (Anthropic)</SelectItem>
                      <SelectItem value="grok">Grok (xAI)</SelectItem>
                      <SelectItem value="deepseek">DeepSeek</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="messageLength">Max Message Length</Label>
                  <Input
                    id="messageLength"
                    type="number"
                    value={config.maxMessageLength || 1000}
                    onChange={(e) => handleConfigChange({ maxMessageLength: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="streamingEnabled">Enable Streaming</Label>
                    <p className="text-sm text-muted-foreground">Stream responses word by word</p>
                  </div>
                  <Switch
                    id="streamingEnabled"
                    checked={config.streamingEnabled}
                    onCheckedChange={(checked) => handleConfigChange({ streamingEnabled: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="showTypingIndicator">Typing Indicator</Label>
                    <p className="text-sm text-muted-foreground">Show when AI is responding</p>
                  </div>
                  <Switch
                    id="showTypingIndicator"
                    checked={config.showTypingIndicator}
                    onCheckedChange={(checked) => handleConfigChange({ showTypingIndicator: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="enableSuggestions">Smart Suggestions</Label>
                    <p className="text-sm text-muted-foreground">Show suggested responses</p>
                  </div>
                  <Switch
                    id="enableSuggestions"
                    checked={config.enableSuggestions || false}
                    onCheckedChange={(checked) => handleConfigChange({ enableSuggestions: checked })}
                  />
                </div>
              </div>

              {isAdvancedMode && (
                <div className="space-y-4 pt-4 border-t">
                  <h4 className="font-semibold">Advanced Chat Settings</h4>
                  
                  <div>
                    <Label htmlFor="systemPrompt">System Prompt</Label>
                    <Textarea
                      id="systemPrompt"
                      placeholder="Enter custom system prompt..."
                      value={config.systemPrompt || ''}
                      onChange={(e) => handleConfigChange({ systemPrompt: e.target.value })}
                      rows={4}
                    />
                  </div>

                  <div>
                    <Label htmlFor="temperature">Response Temperature: {config.temperature || 0.7}</Label>
                    <Slider
                      id="temperature"
                      min={0}
                      max={2}
                      step={0.1}
                      value={[config.temperature || 0.7]}
                      onValueChange={([value]) => handleConfigChange({ temperature: value })}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rag" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>RAG Configuration</CardTitle>
              <CardDescription>Retrieval-Augmented Generation settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="ragEnabled">Enable RAG</Label>
                  <p className="text-sm text-muted-foreground">Use knowledge base for responses</p>
                </div>
                <Switch
                  id="ragEnabled"
                  checked={config.ragEnabled}
                  onCheckedChange={(checked) => handleConfigChange({ ragEnabled: checked })}
                />
              </div>

              {config.ragEnabled && (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="showCitations">Show Citations</Label>
                      <p className="text-sm text-muted-foreground">Display source references</p>
                    </div>
                    <Switch
                      id="showCitations"
                      checked={config.showCitations}
                      onCheckedChange={(checked) => handleConfigChange({ showCitations: checked })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="maxRetrievedDocs">
                      Max Retrieved Documents: {config.maxRetrievedDocs}
                    </Label>
                    <Slider
                      id="maxRetrievedDocs"
                      min={1}
                      max={10}
                      step={1}
                      value={[config.maxRetrievedDocs]}
                      onValueChange={([value]) => handleConfigChange({ maxRetrievedDocs: value })}
                    />
                  </div>

                  <div>
                    <Label htmlFor="similarityThreshold">
                      Similarity Threshold: {config.similarityThreshold || 0.7}
                    </Label>
                    <Slider
                      id="similarityThreshold"
                      min={0}
                      max={1}
                      step={0.05}
                      value={[config.similarityThreshold || 0.7]}
                      onValueChange={([value]) => handleConfigChange({ similarityThreshold: value })}
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="behavior" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Widget Behavior</CardTitle>
              <CardDescription>Configure how the widget behaves</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="displayMode">Display Mode</Label>
                  <Select
                    value={config.displayMode}
                    onValueChange={(value: any) => handleConfigChange({ displayMode: value })}
                  >
                    <SelectTrigger id="displayMode">
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
                    onValueChange={(value: any) => handleConfigChange({ position: value })}
                  >
                    <SelectTrigger id="position">
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
                <Label htmlFor="autoOpen">Auto-open Delay (seconds)</Label>
                <Input
                  id="autoOpen"
                  type="number"
                  placeholder="0 = disabled"
                  value={config.autoOpenDelay || 0}
                  onChange={(e) => handleConfigChange({ autoOpenDelay: parseInt(e.target.value) })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="persistConversation">Persist Conversation</Label>
                  <p className="text-sm text-muted-foreground">Save chat history in browser</p>
                </div>
                <Switch
                  id="persistConversation"
                  checked={config.persistConversation || false}
                  onCheckedChange={(checked) => handleConfigChange({ persistConversation: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integration" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Integration Settings</CardTitle>
              <CardDescription>API and webhook configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="apiEndpoint">API Endpoint</Label>
                <Input
                  id="apiEndpoint"
                  type="url"
                  placeholder="https://api.example.com/chat"
                  value={config.apiEndpoint || ''}
                  onChange={(e) => handleConfigChange({ apiEndpoint: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="apiKey">API Key</Label>
                <Input
                  id="apiKey"
                  type="password"
                  placeholder="sk-..."
                  value={config.apiKey || ''}
                  onChange={(e) => handleConfigChange({ apiKey: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="webhookUrl">Webhook URL (Optional)</Label>
                <Input
                  id="webhookUrl"
                  type="url"
                  placeholder="https://webhook.example.com"
                  value={config.webhookUrl || ''}
                  onChange={(e) => handleConfigChange({ webhookUrl: e.target.value })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="enableAnalytics">Enable Analytics</Label>
                  <p className="text-sm text-muted-foreground">Track usage and performance</p>
                </div>
                <Switch
                  id="enableAnalytics"
                  checked={config.enableAnalytics}
                  onCheckedChange={(checked) => handleConfigChange({ enableAnalytics: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Privacy and security configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="collectUserInfo">Collect User Information</Label>
                  <p className="text-sm text-muted-foreground">Gather user data for personalization</p>
                </div>
                <Switch
                  id="collectUserInfo"
                  checked={config.collectUserInfo}
                  onCheckedChange={(checked) => handleConfigChange({ collectUserInfo: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="allowFileUploads">Allow File Uploads</Label>
                  <p className="text-sm text-muted-foreground">Let users share files</p>
                </div>
                <Switch
                  id="allowFileUploads"
                  checked={config.allowFileUploads}
                  onCheckedChange={(checked) => handleConfigChange({ allowFileUploads: checked })}
                />
              </div>

              <div>
                <Label htmlFor="allowedDomains">Allowed Domains</Label>
                <Textarea
                  id="allowedDomains"
                  placeholder="example.com&#10;app.example.com"
                  value={config.allowedDomains?.join('\n') || ''}
                  onChange={(e) => handleConfigChange({ 
                    allowedDomains: e.target.value.split('\n').filter(d => d.trim()) 
                  })}
                  rows={3}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  One domain per line. Leave empty to allow all domains.
                </p>
              </div>

              <div>
                <Label htmlFor="rateLimitPerMinute">Rate Limit (messages/minute)</Label>
                <Input
                  id="rateLimitPerMinute"
                  type="number"
                  value={config.rateLimitPerMinute || 20}
                  onChange={(e) => handleConfigChange({ rateLimitPerMinute: parseInt(e.target.value) })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Configuration</CardTitle>
              <CardDescription>Expert settings and custom code</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="customCSS">Custom CSS</Label>
                <Textarea
                  id="customCSS"
                  placeholder=".chat-widget { /* your styles */ }"
                  value={config.customCSS || ''}
                  onChange={(e) => handleConfigChange({ customCSS: e.target.value })}
                  rows={6}
                  className="font-mono text-sm"
                />
              </div>

              <div>
                <Label htmlFor="customJS">Custom JavaScript</Label>
                <Textarea
                  id="customJS"
                  placeholder="// Your custom code here"
                  value={config.customJS || ''}
                  onChange={(e) => handleConfigChange({ customJS: e.target.value })}
                  rows={6}
                  className="font-mono text-sm"
                />
              </div>

              <div>
                <Label htmlFor="metadata">Custom Metadata (JSON)</Label>
                <Textarea
                  id="metadata"
                  placeholder='{"key": "value"}'
                  value={config.metadata ? JSON.stringify(config.metadata, null, 2) : ''}
                  onChange={(e) => {
                    try {
                      const metadata = JSON.parse(e.target.value)
                      handleConfigChange({ metadata })
                    } catch (err) {
                      // Invalid JSON, don't update
                    }
                  }}
                  rows={4}
                  className="font-mono text-sm"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}