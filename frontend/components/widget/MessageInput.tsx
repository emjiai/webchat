import { KeyboardEvent } from 'react'
import { Send, Mic, MicOff, Paperclip } from 'lucide-react'
import { VoiceState, WidgetConfig } from '@/types/widget'

interface MessageInputProps {
  value: string
  onChange: (value: string) => void
  onSend: () => void
  onVoiceInput: () => void
  isLoading: boolean
  voiceEnabled: boolean
  voiceState: VoiceState
  config: WidgetConfig
}

export default function MessageInput({
  value,
  onChange,
  onSend,
  onVoiceInput,
  isLoading,
  voiceEnabled,
  voiceState,
  config
}: MessageInputProps) {
  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSend()
    }
  }

  return (
    <div className="border-t p-4">
      <div className="flex items-center gap-2">
        {config.allowFileUploads && (
          <button
            className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
            title="Attach file"
          >
            <Paperclip className="w-5 h-5" />
          </button>
        )}

        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message..."
          disabled={isLoading || voiceState.isRecording}
          className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ color: config.theme.textColor }}
        />

        {voiceEnabled && (
          <button
            onClick={onVoiceInput}
            className={`p-2 rounded-lg transition-colors ${
              voiceState.isRecording
                ? 'bg-red-500 text-white animate-pulse'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            title={voiceState.isRecording ? 'Stop recording' : 'Start voice input'}
          >
            {voiceState.isRecording ? (
              <MicOff className="w-5 h-5" />
            ) : (
              <Mic className="w-5 h-5" />
            )}
          </button>
        )}

        <button
          onClick={onSend}
          disabled={!value.trim() || isLoading}
          className="p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            backgroundColor: value.trim() && !isLoading ? config.theme.primaryColor : '#e5e7eb',
            color: value.trim() && !isLoading ? 'white' : '#9ca3af'
          }}
        >
          <Send className="w-5 h-5" />
        </button>
      </div>

      {voiceState.isRecording && (
        <div className="mt-2 flex items-center gap-2 text-sm text-red-500">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <span>Recording... Click the mic button to stop</span>
        </div>
      )}
    </div>
  )
}