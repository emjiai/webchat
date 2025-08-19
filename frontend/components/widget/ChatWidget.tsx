'use client'

import { useState, useRef, useEffect } from 'react'
import { WidgetConfig, Message, VoiceState } from '@/types/widget'
import { MessageSquare, X, Mic, MicOff, Send, Volume2, VolumeX, Bot, User, Settings } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import MessageList from './MessageList'
import MessageInput from './MessageInput'
import VoiceControls from './VoiceControls'
import SettingsPanel from './SettingsPanel'
import { v4 as uuidv4 } from 'uuid'
import { processMessage } from '@/lib/chat-service'
import { processVoiceInput, synthesizeSpeech } from '@/lib/voice-service'

interface ChatWidgetProps {
  config: WidgetConfig
  isPreview?: boolean
  onToggle?: (open: boolean) => void
}

export default function ChatWidget({ config, isPreview = false, onToggle }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: uuidv4(),
      role: 'assistant',
      content: config.welcomeMessage,
      timestamp: new Date(),
      type: 'text'
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [currentConfig, setCurrentConfig] = useState(config)
  const [voiceState, setVoiceState] = useState<VoiceState>({
    isRecording: false,
    isPlaying: false,
    isSpeaking: false,
    currentEngine: config.defaultVoiceEngine,
    volume: 1,
    speed: config.voiceSpeed
  })

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    setCurrentConfig(config)
  }, [config])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const toggleWidget = () => {
    const newState = !isOpen
    setIsOpen(newState)
    onToggle?.(newState)
  }

  const handleSendMessage = async (content: string, type: 'text' | 'voice' = 'text') => {
    if (!content.trim()) return

    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content,
      timestamp: new Date(),
      type
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    try {
      // Process message with RAG and selected model
      const response = await processMessage(
        content,
        currentConfig.defaultTextModel,
        currentConfig.ragEnabled
      )

      const assistantMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: response.content,
        timestamp: new Date(),
        type: 'text',
        citations: response.citations,
        model: currentConfig.defaultTextModel
      }

      setMessages(prev => [...prev, assistantMessage])

      // Auto-play voice response if enabled
      if (currentConfig.voiceEnabled && currentConfig.autoPlayResponses) {
        await handlePlayVoice(response.content)
      }
    } catch (error) {
      console.error('Error processing message:', error)
      const errorMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your message. Please try again.',
        timestamp: new Date(),
        type: 'text'
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleVoiceInput = async () => {
    if (voiceState.isRecording) {
      // Stop recording
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
      setVoiceState(prev => ({ ...prev, isRecording: false }))
    } else {
      // Start recording
      try {
        const transcript = await processVoiceInput(voiceState.currentEngine)
        if (transcript) {
          await handleSendMessage(transcript, 'voice')
        }
      } catch (error) {
        console.error('Voice input error:', error)
      }
      setVoiceState(prev => ({ ...prev, isRecording: false }))
    }
  }

  const handlePlayVoice = async (text: string) => {
    try {
      setVoiceState(prev => ({ ...prev, isSpeaking: true }))
      const audioUrl = await synthesizeSpeech(text, voiceState.currentEngine, {
        speed: voiceState.speed,
        style: currentConfig.voiceStyle
      })
      
      if (audioRef.current) {
        audioRef.current.src = audioUrl
        audioRef.current.playbackRate = voiceState.speed
        audioRef.current.volume = voiceState.volume
        await audioRef.current.play()
      }
    } catch (error) {
      console.error('Voice synthesis error:', error)
    } finally {
      setVoiceState(prev => ({ ...prev, isSpeaking: false }))
    }
  }

  const handleConfigUpdate = (updates: Partial<WidgetConfig>) => {
    setCurrentConfig(prev => ({ ...prev, ...updates }))
  }

  const getWidgetPosition = () => {
    const positions = {
      'bottom-right': 'bottom-4 right-4',
      'bottom-left': 'bottom-4 left-4',
      'top-right': 'top-4 right-4',
      'top-left': 'top-4 left-4'
    }
    return positions[currentConfig.position]
  }

  const getWidgetSize = () => {
    const sizes = {
      small: 'w-80 h-[500px]',
      medium: 'w-96 h-[600px]',
      large: 'w-[450px] h-[700px]'
    }
    return sizes[currentConfig.size]
  }

  if (currentConfig.displayMode === 'inline') {
    return (
      <div className={`${getWidgetSize()} flex flex-col bg-white rounded-xl shadow-xl overflow-hidden`}>
        {/* Inline widget content */}
        <ChatContent />
      </div>
    )
  }

  const ChatContent = () => (
    <>
      {/* Header */}
      <div 
        className="flex items-center justify-between p-4 border-b"
        style={{ 
          background: `linear-gradient(135deg, ${currentConfig.theme.primaryColor}, ${currentConfig.theme.secondaryColor})` 
        }}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
            <Bot className="w-6 h-6" style={{ color: currentConfig.theme.primaryColor }} />
          </div>
          <div>
            <h3 className="font-semibold text-white">{currentConfig.botName}</h3>
            <p className="text-xs text-white/80">
              {voiceState.isRecording ? 'Listening...' : 'Online'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <Settings className="w-5 h-5 text-white" />
          </button>
          {currentConfig.displayMode === 'popup' && (
            <button
              onClick={toggleWidget}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          )}
        </div>
      </div>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <SettingsPanel
            config={currentConfig}
            voiceState={voiceState}
            onConfigUpdate={handleConfigUpdate}
            onVoiceStateUpdate={setVoiceState}
            onClose={() => setShowSettings(false)}
          />
        )}
      </AnimatePresence>

      {/* Messages */}
      <div className="flex-1 overflow-hidden">
        <MessageList
          messages={messages}
          isLoading={isLoading}
          config={currentConfig}
          onPlayVoice={handlePlayVoice}
        />
        <div ref={messagesEndRef} />
      </div>

      {/* Voice Controls */}
      {currentConfig.voiceEnabled && (
        <VoiceControls
          voiceState={voiceState}
          onVoiceStateChange={setVoiceState}
          onStartRecording={handleVoiceInput}
        />
      )}

      {/* Input */}
      <MessageInput
        value={inputValue}
        onChange={setInputValue}
        onSend={() => handleSendMessage(inputValue)}
        onVoiceInput={handleVoiceInput}
        isLoading={isLoading}
        voiceEnabled={currentConfig.voiceEnabled}
        voiceState={voiceState}
        config={currentConfig}
      />

      {/* Hidden audio element for voice playback */}
      <audio ref={audioRef} className="hidden" />
    </>
  )

  return (
    <>
      {/* Floating Action Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={toggleWidget}
            className={`fixed ${getWidgetPosition()} p-4 rounded-full shadow-lg hover:shadow-xl transition-shadow z-50`}
            style={{ 
              background: `linear-gradient(135deg, ${currentConfig.theme.primaryColor}, ${currentConfig.theme.secondaryColor})` 
            }}
          >
            <MessageSquare className="w-6 h-6 text-white" />
            {voiceState.isRecording && (
              <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={`fixed ${getWidgetPosition()} ${getWidgetSize()} flex flex-col bg-white rounded-xl shadow-2xl overflow-hidden z-50`}
            style={{ backgroundColor: currentConfig.theme.backgroundColor }}
          >
            <ChatContent />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}