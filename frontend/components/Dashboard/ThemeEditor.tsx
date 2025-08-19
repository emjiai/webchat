'use client'

import React from 'react'
import { useState } from 'react'
import { WidgetConfig } from '@/types/widget'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import {
  Palette,
  Type,
  Layout,
  Image,
  Sparkles,
  Eye,
  RotateCcw,
  Save,
  Upload,
  Copy,
  Check,
  Sun,
  Moon,
  Monitor
} from 'lucide-react'

interface ThemeEditorProps {
  config: WidgetConfig
  onConfigUpdate: (updates: Partial<WidgetConfig>) => void
  showAdvanced?: boolean
}

interface ThemePreset {
  name: string
  theme: WidgetConfig['theme']
  description: string
}

const THEME_PRESETS: ThemePreset[] = [
  {
    name: 'Minimal',
    description: 'Clean and minimalist design',
    theme: {
      primaryColor: '#000000',
      secondaryColor: '#737373',
      backgroundColor: '#ffffff',
      textColor: '#000000',
      fontFamily: 'Helvetica'
    }
  },
  {
    name: 'Ocean Blue',
    description: 'Calm and professional blue theme',
    theme: {
      primaryColor: '#3b82f6',
      secondaryColor: '#0ea5e9',
      backgroundColor: '#ffffff',
      textColor: '#1e293b',
      fontFamily: 'Inter'
    }
  },
  {
    name: 'Purple Dream',
    description: 'Modern purple gradient theme',
    theme: {
      primaryColor: '#8b5cf6',
      secondaryColor: '#a855f7',
      backgroundColor: '#ffffff',
      textColor: '#1f2937',
      fontFamily: 'Outfit'
    }
  },
  {
    name: 'Forest Green',
    description: 'Natural and eco-friendly theme',
    theme: {
      primaryColor: '#10b981',
      secondaryColor: '#059669',
      backgroundColor: '#ffffff',
      textColor: '#064e3b',
      fontFamily: 'Roboto'
    }
  },
  {
    name: 'Sunset Orange',
    description: 'Warm and energetic theme',
    theme: {
      primaryColor: '#f97316',
      secondaryColor: '#fb923c',
      backgroundColor: '#fffbf5',
      textColor: '#431407',
      fontFamily: 'Poppins'
    }
  },
  {
    name: 'Dark Mode',
    description: 'Sleek dark theme',
    theme: {
      primaryColor: '#6366f1',
      secondaryColor: '#8b5cf6',
      backgroundColor: '#0f172a',
      textColor: '#f1f5f9',
      fontFamily: 'Space Grotesk'
    }
  }
]

export default function ThemeEditor({ config, onConfigUpdate, showAdvanced = false }: ThemeEditorProps) {
  const [activeTab, setActiveTab] = useState('colors')
  const [copiedColor, setCopiedColor] = useState<string | null>(null)
  const [previewMode, setPreviewMode] = useState<'light' | 'dark' | 'auto'>('auto')

  const updateTheme = (key: keyof WidgetConfig['theme'], value: string) => {
    onConfigUpdate({
      theme: { ...config.theme, [key]: value }
    })
  }

  const applyPreset = (preset: ThemePreset) => {
    onConfigUpdate({ theme: preset.theme })
  }

  const copyColor = (color: string) => {
    navigator.clipboard.writeText(color)
    setCopiedColor(color)
    setTimeout(() => setCopiedColor(null), 2000)
  }

  const resetTheme = () => {
    applyPreset(THEME_PRESETS[0])
  }

  const exportTheme = () => {
    const themeData = JSON.stringify(config.theme, null, 2)
    const blob = new Blob([themeData], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'widget-theme.json'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const importTheme = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const theme = JSON.parse(e.target?.result as string)
          onConfigUpdate({ theme })
        } catch (err) {
          console.error('Invalid theme file')
        }
      }
      reader.readAsText(file)
    }
  }

  return (
    <div className="space-y-6">
      {/* Theme Presets */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Theme Presets
          </CardTitle>
          <CardDescription>Quick-start with a pre-designed theme</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {THEME_PRESETS.map((preset) => (
              <button
                key={preset.name}
                onClick={() => applyPreset(preset)}
                className="p-4 border rounded-lg hover:shadow-md transition-all text-left group"
                style={{
                  borderColor: preset.theme.primaryColor,
                  backgroundColor: preset.theme.backgroundColor
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: preset.theme.primaryColor }}
                  />
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: preset.theme.secondaryColor }}
                  />
                </div>
                <h4 
                  className="font-semibold text-sm"
                  style={{ color: preset.theme.textColor }}
                >
                  {preset.name}
                </h4>
                <p 
                  className="text-xs opacity-75 mt-1"
                  style={{ color: preset.theme.textColor }}
                >
                  {preset.description}
                </p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Theme Editor Tabs */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Theme Customization
              </CardTitle>
              <CardDescription>Fine-tune your widget appearance</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={resetTheme}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
              <Button variant="outline" size="sm" onClick={exportTheme}>
                <Save className="w-4 h-4 mr-2" />
                Export
              </Button>
              <label>
                <Button variant="outline" size="sm" as="span">
                  <Upload className="w-4 h-4 mr-2" />
                  Import
                </Button>
                <input
                  type="file"
                  accept=".json"
                  onChange={importTheme}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="colors">Colors</TabsTrigger>
              <TabsTrigger value="typography">Typography</TabsTrigger>
              <TabsTrigger value="layout">Layout</TabsTrigger>
              <TabsTrigger value="branding">Branding</TabsTrigger>
            </TabsList>

            <TabsContent value="colors" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="primaryColor">Primary Color</Label>
                  <div className="flex gap-2 mt-2">
                    <div className="flex-1 flex gap-2">
                      <Input
                        id="primaryColor"
                        type="color"
                        value={config.theme.primaryColor}
                        onChange={(e) => updateTheme('primaryColor', e.target.value)}
                        className="w-20 h-10 cursor-pointer"
                      />
                      <Input
                        type="text"
                        value={config.theme.primaryColor}
                        onChange={(e) => updateTheme('primaryColor', e.target.value)}
                        className="flex-1 font-mono"
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyColor(config.theme.primaryColor)}
                    >
                      {copiedColor === config.theme.primaryColor ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="secondaryColor">Secondary Color</Label>
                  <div className="flex gap-2 mt-2">
                    <div className="flex-1 flex gap-2">
                      <Input
                        id="secondaryColor"
                        type="color"
                        value={config.theme.secondaryColor}
                        onChange={(e) => updateTheme('secondaryColor', e.target.value)}
                        className="w-20 h-10 cursor-pointer"
                      />
                      <Input
                        type="text"
                        value={config.theme.secondaryColor}
                        onChange={(e) => updateTheme('secondaryColor', e.target.value)}
                        className="flex-1 font-mono"
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyColor(config.theme.secondaryColor)}
                    >
                      {copiedColor === config.theme.secondaryColor ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="backgroundColor">Background Color</Label>
                  <div className="flex gap-2 mt-2">
                    <div className="flex-1 flex gap-2">
                      <Input
                        id="backgroundColor"
                        type="color"
                        value={config.theme.backgroundColor}
                        onChange={(e) => updateTheme('backgroundColor', e.target.value)}
                        className="w-20 h-10 cursor-pointer"
                      />
                      <Input
                        type="text"
                        value={config.theme.backgroundColor}
                        onChange={(e) => updateTheme('backgroundColor', e.target.value)}
                        className="flex-1 font-mono"
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyColor(config.theme.backgroundColor)}
                    >
                      {copiedColor === config.theme.backgroundColor ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="textColor">Text Color</Label>
                  <div className="flex gap-2 mt-2">
                    <div className="flex-1 flex gap-2">
                      <Input
                        id="textColor"
                        type="color"
                        value={config.theme.textColor}
                        onChange={(e) => updateTheme('textColor', e.target.value)}
                        className="w-20 h-10 cursor-pointer"
                      />
                      <Input
                        type="text"
                        value={config.theme.textColor}
                        onChange={(e) => updateTheme('textColor', e.target.value)}
                        className="flex-1 font-mono"
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyColor(config.theme.textColor)}
                    >
                      {copiedColor === config.theme.textColor ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {showAdvanced && (
                <div className="space-y-4 pt-4 border-t">
                  <h4 className="font-semibold">Advanced Color Settings</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="borderColor">Border Color</Label>
                      <Input
                        id="borderColor"
                        type="color"
                        value={config.theme.borderColor || '#e5e7eb'}
                        onChange={(e) => onConfigUpdate({ 
                          theme: { ...config.theme, borderColor: e.target.value }
                        })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="shadowColor">Shadow Color</Label>
                      <Input
                        id="shadowColor"
                        type="color"
                        value={config.theme.shadowColor || '#000000'}
                        onChange={(e) => onConfigUpdate({ 
                          theme: { ...config.theme, shadowColor: e.target.value }
                        })}
                      />
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="typography" className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="fontFamily">Font Family</Label>
                  <Select
                    value={config.theme.fontFamily}
                    onValueChange={(value) => updateTheme('fontFamily', value)}
                  >
                    <SelectTrigger id="fontFamily" className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Inter">Inter</SelectItem>
                      <SelectItem value="Outfit">Outfit</SelectItem>
                      <SelectItem value="Roboto">Roboto</SelectItem>
                      <SelectItem value="Poppins">Poppins</SelectItem>
                      <SelectItem value="Space Grotesk">Space Grotesk</SelectItem>
                      <SelectItem value="Helvetica">Helvetica</SelectItem>
                      <SelectItem value="Arial">Arial</SelectItem>
                      <SelectItem value="system-ui">System UI</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="fontSize">Base Font Size</Label>
                  <div className="flex items-center gap-4 mt-2">
                    <Slider
                      id="fontSize"
                      min={12}
                      max={20}
                      step={1}
                      value={[config.theme.fontSize || 14]}
                      onValueChange={([value]) => onConfigUpdate({
                        theme: { ...config.theme, fontSize: value }
                      })}
                      className="flex-1"
                    />
                    <span className="w-12 text-sm font-mono">
                      {config.theme.fontSize || 14}px
                    </span>
                  </div>
                </div>

                <div>
                  <Label htmlFor="headingFont">Heading Font (Optional)</Label>
                  <Input
                    id="headingFont"
                    placeholder="Same as body font"
                    value={config.theme.headingFont || ''}
                    onChange={(e) => onConfigUpdate({
                      theme: { ...config.theme, headingFont: e.target.value }
                    })}
                    className="mt-2"
                  />
                </div>

                {showAdvanced && (
                  <div className="space-y-4 pt-4 border-t">
                    <h4 className="font-semibold">Typography Details</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="lineHeight">Line Height</Label>
                        <Input
                          id="lineHeight"
                          type="number"
                          step="0.1"
                          value={config.theme.lineHeight || 1.5}
                          onChange={(e) => onConfigUpdate({
                            theme: { ...config.theme, lineHeight: parseFloat(e.target.value) }
                          })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="letterSpacing">Letter Spacing (px)</Label>
                        <Input
                          id="letterSpacing"
                          type="number"
                          step="0.1"
                          value={config.theme.letterSpacing || 0}
                          onChange={(e) => onConfigUpdate({
                            theme: { ...config.theme, letterSpacing: parseFloat(e.target.value) }
                          })}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="layout" className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="widgetSize">Widget Size</Label>
                  <Select
                    value={config.size}
                    onValueChange={(value: any) => onConfigUpdate({ size: value })}
                  >
                    <SelectTrigger id="widgetSize" className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Small (320px)</SelectItem>
                      <SelectItem value="medium">Medium (384px)</SelectItem>
                      <SelectItem value="large">Large (450px)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="borderRadius">Border Radius</Label>
                  <div className="flex items-center gap-4 mt-2">
                    <Slider
                      id="borderRadius"
                      min={0}
                      max={32}
                      step={2}
                      value={[config.theme.borderRadius || 16]}
                      onValueChange={([value]) => onConfigUpdate({
                        theme: { ...config.theme, borderRadius: value }
                      })}
                      className="flex-1"
                    />
                    <span className="w-12 text-sm font-mono">
                      {config.theme.borderRadius || 16}px
                    </span>
                  </div>
                </div>

                <div>
                  <Label htmlFor="spacing">Widget Padding</Label>
                  <div className="flex items-center gap-4 mt-2">
                    <Slider
                      id="spacing"
                      min={8}
                      max={32}
                      step={4}
                      value={[config.theme.spacing || 16]}
                      onValueChange={([value]) => onConfigUpdate({
                        theme: { ...config.theme, spacing: value }
                      })}
                      className="flex-1"
                    />
                    <span className="w-12 text-sm font-mono">
                      {config.theme.spacing || 16}px
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="showShadow">Drop Shadow</Label>
                    <p className="text-sm text-muted-foreground">Add shadow to widget</p>
                  </div>
                  <Switch
                    id="showShadow"
                    checked={config.theme.showShadow !== false}
                    onCheckedChange={(checked) => onConfigUpdate({
                      theme: { ...config.theme, showShadow: checked }
                    })}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="branding" className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="welcomeMessage">Welcome Message</Label>
                  <Textarea
                    id="welcomeMessage"
                    value={config.welcomeMessage}
                    onChange={(e) => onConfigUpdate({ welcomeMessage: e.target.value })}
                    placeholder="Hi! How can I help you today?"
                    rows={2}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="botName">Bot Name</Label>
                  <Input
                    id="botName"
                    value={config.botName}
                    onChange={(e) => onConfigUpdate({ botName: e.target.value })}
                    placeholder="AI Assistant"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="botAvatar">Bot Avatar URL</Label>
                  <Input
                    id="botAvatar"
                    type="url"
                    value={config.botAvatar}
                    onChange={(e) => onConfigUpdate({ botAvatar: e.target.value })}
                    placeholder="https://example.com/avatar.png"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="companyLogo">Company Logo URL (Optional)</Label>
                  <Input
                    id="companyLogo"
                    type="url"
                    value={config.companyLogo || ''}
                    onChange={(e) => onConfigUpdate({ companyLogo: e.target.value })}
                    placeholder="https://example.com/logo.png"
                    className="mt-2"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="showPoweredBy">Show "Powered by" Badge</Label>
                    <p className="text-sm text-muted-foreground">Display attribution</p>
                  </div>
                  <Switch
                    id="showPoweredBy"
                    checked={config.showPoweredBy !== false}
                    onCheckedChange={(checked) => onConfigUpdate({ showPoweredBy: checked })}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Live Preview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Live Preview
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant={previewMode === 'light' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setPreviewMode('light')}
              >
                <Sun className="w-4 h-4" />
              </Button>
              <Button
                variant={previewMode === 'dark' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setPreviewMode('dark')}
              >
                <Moon className="w-4 h-4" />
              </Button>
              <Button
                variant={previewMode === 'auto' ? 'default' : 'outline'}
                size="icon"
                onClick={() => setPreviewMode('auto')}
              >
                <Monitor className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div 
            className="rounded-lg p-8 min-h-[400px] flex items-center justify-center"
            style={{
              backgroundColor: previewMode === 'dark' ? '#1a1a1a' : '#f5f5f5'
            }}
          >
            <div
              className="w-80 rounded-lg shadow-xl overflow-hidden"
              style={{
                backgroundColor: config.theme.backgroundColor,
                borderRadius: `${config.theme.borderRadius || 16}px`,
                fontFamily: config.theme.fontFamily
              }}
            >
              <div
                className="p-4 text-white"
                style={{
                  background: `linear-gradient(135deg, ${config.theme.primaryColor}, ${config.theme.secondaryColor})`
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-xl">🤖</span>
                  </div>
                  <div>
                    <h3 className="font-semibold">{config.botName}</h3>
                    <p className="text-xs opacity-80">Online</p>
                  </div>
                </div>
              </div>
              
              <div className="p-4">
                <div className="bg-gray-100 rounded-lg p-3 mb-3">
                  <p style={{ color: config.theme.textColor, fontSize: `${config.theme.fontSize || 14}px` }}>
                    {config.welcomeMessage}
                  </p>
                </div>
                
                <div className="flex justify-end mb-3">
                  <div 
                    className="rounded-lg p-3 text-white"
                    style={{ backgroundColor: config.theme.primaryColor }}
                  >
                    <p className="text-sm">How can I help you?</p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Type your message..."
                    className="flex-1 px-3 py-2 border rounded-lg text-sm"
                    style={{
                      borderColor: config.theme.borderColor || '#e5e7eb',
                      color: config.theme.textColor
                    }}
                  />
                  <button
                    className="px-4 py-2 rounded-lg text-white text-sm"
                    style={{ backgroundColor: config.theme.primaryColor }}
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}