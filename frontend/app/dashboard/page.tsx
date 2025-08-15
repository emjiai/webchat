'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Settings, Code, Eye, Palette, MessageSquare, Mic, Brain,
  Save, Copy, Check, Download, Upload, RefreshCw, Sparkles
} from 'lucide-react';
import ChatWidget from '@/components/ChatWidget/ChatWidget';
import WidgetCustomizer from '@/components/Dashboard/WidgetCustomizer';
import EmbedCodeGenerator from '@/components/Dashboard/EmbedCodeGenerator';
import PreviewPane from '@/components/Dashboard/PreviewPane';
import { WidgetConfig } from '@/types';
import { defaultWidgetConfig } from '@/lib/utils/config';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<'customize' | 'preview' | 'embed'>('customize');
  const [widgetConfig, setWidgetConfig] = useState<WidgetConfig>(defaultWidgetConfig);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Load saved config from localStorage
    const savedConfig = localStorage.getItem('widgetConfig');
    if (savedConfig) {
      setWidgetConfig(JSON.parse(savedConfig));
    }
  }, []);

  const handleConfigChange = (updates: Partial<WidgetConfig>) => {
    setWidgetConfig(prev => ({ ...prev, ...updates }));
    setSaved(false);
  };

  const handleSaveConfig = () => {
    localStorage.setItem('widgetConfig', JSON.stringify(widgetConfig));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleExportConfig = () => {
    const blob = new Blob([JSON.stringify(widgetConfig, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'widget-config.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportConfig = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const config = JSON.parse(e.target?.result as string);
          setWidgetConfig(config);
          handleSaveConfig();
        } catch (error) {
          console.error('Invalid config file:', error);
          alert('Invalid configuration file');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleResetConfig = () => {
    if (confirm('Are you sure you want to reset to default configuration?')) {
      setWidgetConfig(defaultWidgetConfig);
      handleSaveConfig();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  AI Chatbot Dashboard
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Configure and deploy your intelligent assistant
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={handleResetConfig}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Reset
              </button>
              
              <label className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors flex items-center gap-2 cursor-pointer">
                <Upload className="w-4 h-4" />
                Import
                <input
                  type="file"
                  accept="application/json"
                  className="hidden"
                  onChange={handleImportConfig}
                />
              </label>
              
              <button
                onClick={handleExportConfig}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
              
              <button
                onClick={handleSaveConfig}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all flex items-center gap-2"
              >
                {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                {saved ? 'Saved!' : 'Save Config'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('customize')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${
                activeTab === 'customize'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <Settings className="w-4 h-4" />
              Customize
            </button>
            
            <button
              onClick={() => setActiveTab('preview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${
                activeTab === 'preview'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <Eye className="w-4 h-4" />
              Preview
            </button>
            
            <button
              onClick={() => setActiveTab('embed')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${
                activeTab === 'embed'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <Code className="w-4 h-4" />
              Embed Code
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {activeTab === 'customize' && (
            <motion.div
              key="customize"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <WidgetCustomizer
                config={widgetConfig}
                onConfigChange={handleConfigChange}
              />
            </motion.div>
          )}
          
          {activeTab === 'preview' && (
            <motion.div
              key="preview"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <PreviewPane config={widgetConfig} />
            </motion.div>
          )}
          
          {activeTab === 'embed' && (
            <motion.div
              key="embed"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <EmbedCodeGenerator
                config={widgetConfig}
                copied={copied}
                onCopy={() => {
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Stats Footer */}
      <footer className="mt-16 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">5</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">LLM Providers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">2</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Voice Engines</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">RAG</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Enabled</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">∞</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Possibilities</div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}