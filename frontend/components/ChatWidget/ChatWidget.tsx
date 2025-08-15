'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic, MicOff, Send, Volume2, VolumeX, Settings, X, Minimize2,
  Maximize2, Bot, User, Sparkles, Search, ChevronDown, Loader2, Globe
} from 'lucide-react';
import { Message, WidgetConfig, VoiceEngine, LLMProvider, Citation, Language } from '@/types';
import { nanoid } from 'nanoid';
import ChatMessage from './ChatMessage';
import VoiceControls from './VoiceControls';
import TextInput from './TextInput';
import SourceCitation from './SourceCitation';
import LanguageSelector from './LanguageSelector';
import { retrieveDocuments } from '@/lib/rag/retrieval';
import { simulateLLMResponse } from '@/lib/llm/llm-manager';
import { VoiceManager } from '@/lib/voice/voice-manager';
import { getTranslation } from '@/lib/i18n/translations';

interface ChatWidgetProps {
  config: WidgetConfig;
  onConfigChange?: (config: Partial<WidgetConfig>) => void;
  embedded?: boolean;
}

export default function ChatWidget({ config, onConfigChange, embedded = false }: ChatWidgetProps) {
  const [language, setLanguage] = useState<Language>(config.language || 'en');
  const [showLanguageSelector, setShowLanguageSelector] = useState(true);
  const t = getTranslation(language);
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: nanoid(),
      role: 'assistant',
      content: t.welcomeMessage,
      timestamp: new Date(),
    },
  ]);
  
  const [inputValue, setInputValue] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [voiceEngine, setVoiceEngine] = useState<VoiceEngine>(config.defaultVoiceEngine);
  const [llmProvider, setLLMProvider] = useState<LLMProvider>(config.defaultLLM);
  const [citations, setCitations] = useState<Citation[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const voiceManagerRef = useRef<VoiceManager | null>(null);

  useEffect(() => {
    // Initialize voice manager with language support
    voiceManagerRef.current = new VoiceManager(voiceEngine, language);
    
    return () => {
      voiceManagerRef.current?.cleanup();
    };
  }, [voiceEngine, language]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage);
    setShowLanguageSelector(false);
    onConfigChange?.({ language: newLanguage });
    
    // Update welcome message in new language
    const newT = getTranslation(newLanguage);
    const welcomeMessage: Message = {
      id: nanoid(),
      role: 'assistant',
      content: newT.welcomeMessage,
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (content: string, inputMode: 'text' | 'voice' = 'text') => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: nanoid(),
      role: 'user',
      content,
      timestamp: new Date(),
      inputMode,
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Step 1: Retrieve relevant documents if RAG is enabled
      let retrievedDocs: Citation[] = [];
      if (config.enableRAG) {
        retrievedDocs = await retrieveDocuments(content, {
          maxResults: config.maxRetrievalResults,
          minScore: config.minRelevanceScore,
        });
        setCitations(retrievedDocs);
      }

      // Step 2: Generate AI response with language context
      const aiResponse = await simulateLLMResponse({
        query: content,
        context: retrievedDocs,
        provider: llmProvider,
        language: language,
        config: {
          temperature: config.temperature,
          maxTokens: config.maxTokens,
          streaming: config.streamResponses,
        },
      });

      const assistantMessage: Message = {
        id: nanoid(),
        role: 'assistant',
        content: aiResponse.content,
        timestamp: new Date(),
        citations: retrievedDocs.length > 0 ? retrievedDocs : undefined,
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Step 3: Play voice response if enabled
      if (config.voiceAutoPlay && voiceManagerRef.current) {
        setIsPlaying(true);
        await voiceManagerRef.current.textToSpeech(aiResponse.content);
        setIsPlaying(false);
      }
    } catch (error) {
      console.error('Error processing message:', error);
      const errorMessage: Message = {
        id: nanoid(),
        role: 'assistant',
        content: t.error.generic,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceInput = async () => {
    if (!voiceManagerRef.current) return;

    if (isRecording) {
      setIsRecording(false);
      const text = await voiceManagerRef.current.stopRecording();
      if (text) {
        handleSendMessage(text, 'voice');
      }
    } else {
      setIsRecording(true);
      await voiceManagerRef.current.startRecording();
    }
  };

  const toggleAudioPlayback = () => {
    if (isPlaying && voiceManagerRef.current) {
      voiceManagerRef.current.stopPlayback();
      setIsPlaying(false);
    }
  };

  const containerClasses = `
    widget-container glass
    ${config.mode === 'popup' ? 'widget-popup' : ''}
    ${config.mode === 'inline' ? 'widget-inline' : ''}
    ${config.mode === 'fullscreen' || isFullscreen ? 'widget-fullscreen' : ''}
    ${isMinimized ? 'h-16 w-80' : ''}
  `;

  return (
    <AnimatePresence>
      <motion.div
        ref={chatContainerRef}
        className={containerClasses}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={config.avatarUrl || '/assets/avatars/default-bot.png'}
                alt={config.botName}
                className="w-10 h-10 rounded-full"
              />
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full"></span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {config.botName || 'AI Assistant'}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {isRecording ? t.listening : isPlaying ? t.speaking : t.online}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <LanguageSelector
              currentLanguage={language}
              onLanguageChange={handleLanguageChange}
              compact={true}
            />
            
            {config.enableVoice && (
              <button
                onClick={toggleAudioPlayback}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                aria-label={isPlaying ? t.mute : t.unmute}
              >
                {isPlaying ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
            )}
            
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              aria-label={t.settings}
              >
              <Settings className="w-4 h-4" />
            </button>
            
            {!embedded && (
              <>
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  aria-label={isMinimized ? 'Expand' : 'Minimize'}
                >
                  {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                </button>
                
                <button
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  aria-label="Fullscreen"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Settings Panel */}
            <AnimatePresence>
              {showSettings && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-b border-gray-200 dark:border-gray-700 overflow-hidden"
                >
                  <div className="p-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                          LLM Provider
                        </label>
                        <select
                          value={llmProvider}
                          onChange={(e) => setLLMProvider(e.target.value as LLMProvider)}
                          className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
                        >
                          <option value="gpt">GPT</option>
                          <option value="gemini">Gemini</option>
                          <option value="claude">Claude</option>
                          <option value="grok">Grok</option>
                          <option value="deepseek">DeepSeek</option>
                        </select>
                      </div>
                      
                      {config.enableVoice && (
                        <div>
                          <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                            Voice Engine
                          </label>
                          <select
                            value={voiceEngine}
                            onChange={(e) => setVoiceEngine(e.target.value as VoiceEngine)}
                            className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
                          >
                            <option value="openai">OpenAI</option>
                            <option value="elevenlabs">Eleven Labs</option>
                          </select>
                        </div>
                      )}
                    </div>
                    
                    <VoiceControls
                      voiceEngine={voiceEngine}
                      config={config}
                      onConfigChange={onConfigChange}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
              {showLanguageSelector && messages.length === 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                >
                  <LanguageSelector
                    currentLanguage={language}
                    onLanguageChange={handleLanguageChange}
                  />
                </motion.div>
              )}
              
              {messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  config={config}
                  language={language}
                  onPlayAudio={() => {
                    if (voiceManagerRef.current && message.role === 'assistant') {
                      setIsPlaying(true);
                      voiceManagerRef.current.textToSpeech(message.content).then(() => {
                        setIsPlaying(false);
                      });
                    }
                  }}
                />
              ))}
              
              {isLoading && (
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">{t.thinking}</span>
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              )}
              
              {citations.length > 0 && (
                <div className="mt-4 space-y-2">
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <Search className="w-4 h-4" />
                    {t.sources}
                  </h4>
                  {citations.map((citation) => (
                    <SourceCitation key={citation.id} citation={citation} language={language} />
                  ))}
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t border-gray-200 dark:border-gray-700 p-4">
              <TextInput
                value={inputValue}
                onChange={setInputValue}
                onSend={() => handleSendMessage(inputValue)}
                onVoiceInput={handleVoiceInput}
                isRecording={isRecording}
                placeholder={t.placeholder}
                enableVoice={config.enableVoice}
                language={language}
              />
            </div>
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
}