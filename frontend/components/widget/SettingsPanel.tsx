import { WidgetConfig, VoiceState } from '@/types/widget'
import { X } from 'lucide-react'
import { motion } from 'framer-motion'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

interface SettingsPanelProps {
  config: WidgetConfig
  voiceState: VoiceState
  onConfigUpdate: (updates: Partial<WidgetConfig>) => void
  onVoiceStateUpdate: (state: VoiceState) => void
  onClose: () => void
}

export default function SettingsPanel({
  config,
  voiceState,
  onConfigUpdate,
  onVoiceStateUpdate,
  onClose
}: SettingsPanelProps) {
  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      className="border-b bg-gray-50 overflow-hidden"
    >
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-gray-800">Quick Settings</h4>
          <button
            onClick={onClose}
            className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Text Model Selection */}
          <div>
            <Label htmlFor="textModel" className="text-sm">Text Model</Label>
            <Select
              value={config.defaultTextModel}
              onValueChange={(value: any) => onConfigUpdate({ defaultTextModel: value })}
            >
              <SelectTrigger id="textModel" className="mt-1">
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

          {/* Voice Engine Selection */}
          {config.voiceEnabled && (
            <div>
              <Label htmlFor="voiceEngine" className="text-sm">Voice Engine</Label>
              <Select
                value={voiceState.currentEngine}
                onValueChange={(value: any) => 
                  onVoiceStateUpdate({ ...voiceState, currentEngine: value })
                }
              >
                <SelectTrigger id="voiceEngine" className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="openai">OpenAI</SelectItem>
                  <SelectItem value="elevenlabs">Eleven Labs</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Toggle Options */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="streaming" className="text-sm">Streaming Responses</Label>
              <Switch
                id="streaming"
                checked={config.streamingEnabled}
                onCheckedChange={(checked) => onConfigUpdate({ streamingEnabled: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="autoPlay" className="text-sm">Auto-play Voice</Label>
              <Switch
                id="autoPlay"
                checked={config.autoPlayResponses}
                onCheckedChange={(checked) => onConfigUpdate({ autoPlayResponses: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="citations" className="text-sm">Show Citations</Label>
              <Switch
                id="citations"
                checked={config.showCitations}
                onCheckedChange={(checked) => onConfigUpdate({ showCitations: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="rag" className="text-sm">Enable RAG</Label>
              <Switch
                id="rag"
                checked={config.ragEnabled}
                onCheckedChange={(checked) => onConfigUpdate({ ragEnabled: checked })}
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}