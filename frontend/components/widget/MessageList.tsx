import { Message, WidgetConfig } from '@/types/widget'
import { Bot, User, Volume2, FileText } from 'lucide-react'
import { motion } from 'framer-motion'

interface MessageListProps {
  messages: Message[]
  isLoading: boolean
  config: WidgetConfig
  onPlayVoice: (text: string) => void
}

export default function MessageList({ messages, isLoading, config, onPlayVoice }: MessageListProps) {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
      {messages.map((message, index) => (
        <motion.div
          key={message.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
        >
          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
            message.role === 'user' 
              ? 'bg-gray-200' 
              : 'bg-gradient-to-br from-blue-500 to-purple-600'
          }`}>
            {message.role === 'user' ? (
              <User className="w-5 h-5 text-gray-600" />
            ) : (
              <Bot className="w-5 h-5 text-white" />
            )}
          </div>

          <div className={`flex-1 max-w-[80%] ${message.role === 'user' ? 'text-right' : ''}`}>
            <div className={`inline-block p-3 rounded-lg ${
              message.role === 'user'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-800'
            }`}>
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              
              {/* Voice indicator */}
              {message.type === 'voice' && (
                <div className="flex items-center gap-1 mt-2 text-xs opacity-70">
                  <Volume2 className="w-3 h-3" />
                  <span>Voice message</span>
                </div>
              )}

              {/* Model indicator */}
              {message.model && (
                <div className="mt-2 text-xs opacity-70">
                  Model: {message.model.toUpperCase()}
                </div>
              )}

              {/* Citations */}
              {message.citations && message.citations.length > 0 && config.showCitations && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex items-center gap-1 mb-2 text-xs font-medium">
                    <FileText className="w-3 h-3" />
                    <span>Sources:</span>
                  </div>
                  <div className="space-y-1">
                    {message.citations.map(citation => (
                      <div key={citation.id} className="text-xs">
                        <a href="#" className="text-blue-600 hover:underline">
                          {citation.title}
                        </a>
                        <p className="text-gray-500 mt-0.5">{citation.snippet}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action buttons */}
            {message.role === 'assistant' && config.voiceEnabled && (
              <div className="mt-2">
                <button
                  onClick={() => onPlayVoice(message.content)}
                  className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
                >
                  <Volume2 className="w-3 h-3" />
                  Play voice
                </button>
              </div>
            )}

            {/* Timestamp */}
            <div className="mt-1 text-xs text-gray-400">
              {new Date(message.timestamp).toLocaleTimeString()}
            </div>
          </div>
        </motion.div>
      ))}

      {/* Loading indicator */}
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex gap-3"
        >
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div className="bg-gray-100 rounded-lg p-3">
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}