'use client'

import React from 'react'
import { useState } from 'react'
import { WidgetConfig } from '@/types/widget'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import {
  Mic,
  Volume2,
  Headphones,
  Settings,
  Play,
  Pause,
  RotateCcw,
  Zap,
  Globe,
  Shield,
  Wand2,
  AlertCircle,
  Check,
  X
} from 'lucide-react'

interface VoiceSettingsProps {
  config: WidgetConfig
  onConfigUpdate: (updates: Partial<WidgetConfig>) => void
  showAdvanced?: boolean
}

interface VoiceProfile {
  name: string
  engine: 'openai' | 'elevenlabs'
  voice: string
  speed: number
  pitch?: number
  style: string
  description: string
}

const VOICE_PROFILES: VoiceProfile[] = [
  {
    name: 'Professional Assistant',
    engine: 'openai',
    voice: 'alloy',
    speed: 1.0,
    style: 'professional',
    description: 'Clear and professional voice for business'
  },
  {
    name: 'Friendly Helper',
    engine: 'openai',
    voice: 'nova',
    speed: 1.1,
    style: 'friendly',
    description: 'Warm and approachable tone'
  },
  {
    name: 'Energetic Guide',
    engine: 'elevenlabs',
    voice: 'Rachel',
    speed: 1.2,
    style: 'energetic',
    description: 'Upbeat and enthusiastic'
  },
  {
    name: 'Calm Advisor',
    engine: 'elevenlabs',
    voice: 'Antoni',
    speed: 0.9,
    style: 'casual',
    description: 'Relaxed and soothing voice'
  }
]

const OPENAI_VOICES = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer']
const ELEVENLABS_VOICES = ['Rachel', 'Domi', 'Bella', 'Antoni', 'Elli', 'Josh', 'Adam', 'Sam']

export default function VoiceSettings({ 
  config, 
  onConfigUpdate, 
  showAdvanced = false 
}: VoiceSettingsProps) {
  const [isTestingVoice, setIsTestingVoice] = useState(false)
  const [testText, setTestText] = useState('Hello! This is a test of the voice settings.')
  const [activeTab, setActiveTab] = useState('general')

  const handleVoiceTest = async () => {
    setIsTestingVoice(true)
    
    // Simulate voice synthesis
    const utterance = new SpeechSynthesisUtterance(testText)
    utterance.rate = config.voiceSpeed
    utterance.onend = () => setIsTestingVoice(false)
    
    speechSynthesis.speak(utterance)
  }

  const stopVoiceTest = () => {
    speechSynthesis.cancel()
    setIsTestingVoice(false)
  }

  const applyVoiceProfile = (profile: VoiceProfile) => {
    onConfigUpdate({
      defaultVoiceEngine: profile.engine,
      voiceSpeed: profile.speed,
      voiceStyle: profile.style
    })
  }

  const getAvailableVoices = () => {
    return config.defaultVoiceEngine === 'openai' ? OPENAI_VOICES : ELEVENLABS_VOICES
  }

  return (
    <div className="space-y-6">
      {/* Voice Profiles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="w-5 h-5" />
            Quick Voice Profiles
          </CardTitle>
          <CardDescription>Pre-configured voice settings for different use cases</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {VOICE_PROFILES.map((profile) => (
              <button
                key={profile.name}
                onClick={() => applyVoiceProfile(profile)}
                className="p-4 border rounded-lg hover:shadow-md transition-all text-left group"
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold">{profile.name}</h4>
                  <Badge variant="outline" className="text-xs">
                    {profile.engine === 'openai' ? 'OpenAI' : 'ElevenLabs'}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{profile.description}</p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>Voice: {profile.voice}</span>
                  <span>Speed: {profile.speed}x</span>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Voice Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Voice Settings
          </CardTitle>
          <CardDescription>Configure voice engine and playback behavior</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="playback">Playback</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="voiceEnabled">Enable Voice</Label>
                  <p className="text-sm text-muted-foreground">Allow voice responses</p>
                </div>
                <Switch
                  id="voiceEnabled"
                  checked={config.voiceEnabled}
                  onCheckedChange={(checked) => onConfigUpdate({ voiceEnabled: checked })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="engine">Voice Engine</Label>
                  <Select
                    value={config.defaultVoiceEngine}
                    onValueChange={(value: any) => onConfigUpdate({ defaultVoiceEngine: value })}
                  >
                    <SelectTrigger id="engine" className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="openai">OpenAI</SelectItem>
                      <SelectItem value="elevenlabs">ElevenLabs</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="voiceStyle">Voice Style</Label>
                  <Input
                    id="voiceStyle"
                    placeholder="professional, friendly, energetic..."
                    value={config.voiceStyle}
                    onChange={(e) => onConfigUpdate({ voiceStyle: e.target.value })}
                    className="mt-2"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="voiceSpeed">Voice Speed: {config.voiceSpeed.toFixed(1)}x</Label>
                <Slider
                  id="voiceSpeed"
                  min={0.5}
                  max={2}
                  step={0.1}
                  value={[config.voiceSpeed]}
                  onValueChange={([value]) => onConfigUpdate({ voiceSpeed: value })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="autoPlay">Autoplay Responses</Label>
                  <p className="text-sm text-muted-foreground">Automatically play AI voice replies</p>
                </div>
                <Switch
                  id="autoPlay"
                  checked={config.autoPlayResponses}
                  onCheckedChange={(checked) => onConfigUpdate({ autoPlayResponses: checked })}
                />
              </div>
            </TabsContent>

            <TabsContent value="playback" className="space-y-4">
              <div>
                <Label htmlFor="testText">Test Text</Label>
                <Input
                  id="testText"
                  value={testText}
                  onChange={(e) => setTestText(e.target.value)}
                  className="mt-2"
                />
              </div>

              <div className="flex items-center gap-2">
                <Button onClick={handleVoiceTest} disabled={isTestingVoice}>
                  <Play className="w-4 h-4 mr-2" />
                  Test Voice
                </Button>
                <Button variant="outline" onClick={stopVoiceTest} disabled={!isTestingVoice}>
                  <Pause className="w-4 h-4 mr-2" />
                  Stop
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Preview uses the browser SpeechSynthesis API and the selected speed.
              </p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}