import { VoiceState } from '@/types/widget'
import { Volume2, VolumeX, SkipForward, Pause, Play } from 'lucide-react'
import { Slider } from '@/components/ui/slider'

interface VoiceControlsProps {
  voiceState: VoiceState
  onVoiceStateChange: (state: VoiceState) => void
  onStartRecording: () => void
}

export default function VoiceControls({
  voiceState,
  onVoiceStateChange,
  onStartRecording
}: VoiceControlsProps) {
  const handleVolumeChange = (value: number[]) => {
    onVoiceStateChange({ ...voiceState, volume: value[0] })
  }

  const handleSpeedChange = (value: number[]) => {
    onVoiceStateChange({ ...voiceState, speed: value[0] })
  }

  const toggleMute = () => {
    onVoiceStateChange({ ...voiceState, volume: voiceState.volume === 0 ? 1 : 0 })
  }

  return (
    <div className="border-t p-3 bg-gray-50">
      <div className="flex items-center justify-between gap-4">
        {/* Volume Control */}
        <div className="flex items-center gap-2 flex-1">
          <button
            onClick={toggleMute}
            className="p-1.5 text-gray-600 hover:text-gray-800 transition-colors"
          >
            {voiceState.volume === 0 ? (
              <VolumeX className="w-4 h-4" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>
          <Slider
            value={[voiceState.volume]}
            onValueChange={handleVolumeChange}
            max={1}
            step={0.1}
            className="w-20"
          />
        </div>

        {/* Playback Speed */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-600">Speed:</span>
          <Slider
            value={[voiceState.speed]}
            onValueChange={handleSpeedChange}
            min={0.5}
            max={2}
            step={0.1}
            className="w-20"
          />
          <span className="text-xs text-gray-600">{voiceState.speed}x</span>
        </div>

        {/* Voice Engine Indicator */}
        <div className="flex items-center gap-1">
          <div className={`w-2 h-2 rounded-full ${voiceState.isSpeaking ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`} />
          <span className="text-xs text-gray-600">
            {voiceState.currentEngine === 'openai' ? 'OpenAI' : 'ElevenLabs'}
          </span>
        </div>
      </div>
    </div>
  )
}