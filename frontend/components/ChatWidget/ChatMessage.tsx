'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Bot, User, Volume2, Mic, Type } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Message, WidgetConfig, Language } from '@/types';
import { getTranslation } from '@/lib/i18n/translations';

interface ChatMessageProps {
  message: Message;
  config: WidgetConfig;
  language: Language;
  onPlayAudio?: () => void;
}

export default function ChatMessage({ message, config, language, onPlayAudio }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const t = getTranslation(language);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar */}
      <div className={`flex-shrink-0 ${isUser ? 'ml-2' : 'mr-2'}`}>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
          isUser ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-700'
        }`}>
          {isUser ? (
            <User className="w-5 h-5" />
          ) : (
            <img
              src={config.avatarUrl || '/assets/avatars/default-bot.png'}
              alt={config.botName}
              className="w-full h-full rounded-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement?.insertAdjacentHTML(
                  'beforeend',
                  '<div class="w-5 h-5"><svg>...</svg></div>'
                );
              }}
            />
          )}
        </div>
      </div>

      {/* Message Content */}
      <div className={`flex-1 max-w-[80%] ${isUser ? 'text-right' : 'text-left'}`}>
        <div className={`inline-block px-4 py-2 rounded-2xl ${
          isUser 
            ? 'message-user' 
            : 'message-assistant'
        }`}>
          {message.isStreaming ? (
            <div className="flex items-center gap-2">
              <span className="text-sm">Generating response</span>
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          ) : (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
          )}
        </div>
        
        {/* Metadata */}
        <div className={`flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400 ${
          isUser ? 'justify-end' : 'justify-start'
        }`}>
          <span>{new Date(message.timestamp).toLocaleTimeString()}</span>
          
          {message.inputMode && (
            <span className="flex items-center gap-1">
              {message.inputMode === 'voice' ? (
                <>
                  <Mic className="w-3 h-3" />
                  {t.voice}
                </>
              ) : (
                <>
                  <Type className="w-3 h-3" />
                  {t.text}
                </>
              )}
            </span>
          )}
          
          {!isUser && config.enableVoice && onPlayAudio && (
            <button
              onClick={onPlayAudio}
              className="flex items-center gap-1 hover:text-blue-500 transition-colors"
              aria-label={t.play}
            >
              <Volume2 className="w-3 h-3" />
              {t.play}
            </button>
          )}
          
          {message.citations && message.citations.length > 0 && (
            <span className="text-blue-500">
              {message.citations.length} {t.source}{message.citations.length > 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}