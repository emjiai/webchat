'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { Language } from '@/types';
import { getTranslation } from '@/lib/i18n/translations';

interface LanguageSelectorProps {
  currentLanguage: Language;
  onLanguageChange: (language: Language) => void;
  compact?: boolean;
}

const languages: { code: Language; name: string; nativeName: string; flag: string }[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'ig', name: 'Igbo', nativeName: 'Igbo', flag: '🇳🇬' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'yo', name: 'Yoruba', nativeName: 'Yorùbá', flag: '🇳🇬' },
  { code: 'ha', name: 'Hausa', nativeName: 'Hausa', flag: '🇳🇬' }
];

export default function LanguageSelector({ currentLanguage, onLanguageChange, compact = false }: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const t = getTranslation(currentLanguage);
  const currentLang = languages.find(l => l.code === currentLanguage) || languages[0];

  if (compact) {
    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
          aria-label={t.changeLanguage}
        >
          <span className="text-lg">{currentLang.flag}</span>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {currentLang.code.toUpperCase()}
          </span>
          <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence>
          {isOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsOpen(false)}
              />
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full mt-2 right-0 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden z-50 min-w-[150px]"
              >
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      onLanguageChange(lang.code);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                      currentLanguage === lang.code ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    }`}
                  >
                    <span className="text-lg">{lang.flag}</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {lang.nativeName}
                    </span>
                    {currentLanguage === lang.code && (
                      <Check className="w-4 h-4 text-blue-500 ml-auto" />
                    )}
                  </button>
                ))}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <div className="flex items-center gap-3 mb-4">
        <Globe className="w-5 h-5 text-blue-500" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {t.selectLanguage}
        </h3>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {languages.map((lang) => (
          <motion.button
            key={lang.code}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onLanguageChange(lang.code)}
            className={`relative p-4 rounded-lg border-2 transition-all ${
              currentLanguage === lang.code
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            {currentLanguage === lang.code && (
              <div className="absolute top-2 right-2">
                <Check className="w-4 h-4 text-blue-500" />
              </div>
            )}
            
            <div className="text-2xl mb-2">{lang.flag}</div>
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {lang.nativeName}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {lang.name}
            </div>
          </motion.button>
        ))}
      </div>

      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <p className="text-sm text-blue-700 dark:text-blue-300">
          <strong>💡 Tip:</strong> The AI assistant will respond in your selected language. Voice recognition and synthesis also adapt to your language choice.
        </p>
      </div>
    </div>
  );
}