'use client';

import React, { useState, useRef, KeyboardEvent } from 'react';
import { Send, Mic, MicOff, Paperclip } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Language } from '@/types';
import { getTranslation } from '@/lib/i18n/translations';

interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onVoiceInput: () => void;
  isRecording: boolean;
  placeholder: string;
  enableVoice: boolean;
  language: Language;
  disabled?: boolean;
}

export default function TextInput({
  value,
  onChange,
  onSend,
  onVoiceInput,
  isRecording,
  placeholder,
  enableVoice,
  language,
  disabled = false
}: TextInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const t = getTranslation(language);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !disabled) {
        onSend();
      }
    }
  };

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  };

  React.useEffect(() => {
    adjustTextareaHeight();
  }, [value]);

  return (
    <div className={`relative flex items-end gap-2 p-2 bg-gray-50 dark:bg-gray-900 rounded-2xl border-2 transition-all ${
      isFocused ? 'border-blue-500 shadow-lg' : 'border-gray-200 dark:border-gray-700'
    }`}>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          adjustTextareaHeight();
        }}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        disabled={disabled || isRecording}
        className="flex-1 px-3 py-2 bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none outline-none min-h-[40px] max-h-[120px]"
        rows={1}
      />
      
      <div className="flex items-center gap-1 pb-2">
        {enableVoice && (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onVoiceInput}
            disabled={disabled}
            className={`p-2 rounded-lg transition-all ${
              isRecording
                ? 'bg-red-500 text-white animate-pulse-ring'
                : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
            }`}
            aria-label={isRecording ? t.stopRecording : t.startRecording}
          >
            <AnimatePresence mode="wait">
              {isRecording ? (
                <motion.div
                  key="recording"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="relative"
                >
                  <MicOff className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full animate-ping"></span>
                </motion.div>
              ) : (
                <motion.div
                  key="mic"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                >
                  <Mic className="w-5 h-5" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        )}
        
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={onSend}
          disabled={disabled || !value.trim() || isRecording}
          className={`p-2 rounded-lg transition-all ${
            value.trim() && !disabled && !isRecording
              ? 'bg-blue-500 text-white hover:bg-blue-600'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
          }`}
          aria-label={t.sendMessage}
        >
          <Send className="w-5 h-5" />
        </motion.button>
      </div>
      
      {isRecording && (
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-red-500 text-white text-xs px-3 py-1 rounded-full">
          <div className="flex items-center gap-2">
            <span className="voice-wave">
              <span></span>
              <span></span>
              <span></span>
              <span></span>
              <span></span>
            </span>
            <span>{t.listening}</span>
          </div>
        </div>
      )}
    </div>
  );
}