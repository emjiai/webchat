'use client';


import { HexColorPicker } from 'react-colorful';
import {
  Palette, MessageSquare, Mic, Brain, Layout, Sliders,
  Monitor, Smartphone, Tablet, Globe, ChevronRight
} from 'lucide-react';
import { WidgetConfig } from '@/types';

interface WidgetCustomizerProps {
  config: WidgetConfig;
  onConfigChange: (updates: Partial<WidgetConfig>) => void;
}

export default function WidgetCustomizer({ config, onConfigChange }: WidgetCustomizerProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Appearance Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
            <Palette className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Appearance</h2>
        </div>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Theme
            </label>
            <select
              value={config.theme}
              onChange={(e) => onConfigChange({ theme: e.target.value as any })}
              className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="custom">Custom</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Primary Color
            </label>
            <div className="relative">
              <HexColorPicker color={config.primaryColor} onChange={(color) => onConfigChange({ primaryColor: color })} />
              <input
                type="text"
                value={config.primaryColor}
                onChange={(e) => onConfigChange({ primaryColor: e.target.value })}
                className="mt-2 w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Widget Size
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['small', 'medium', 'large'] as const).map((size) => (
                <button
                  key={size}
                  onClick={() => onConfigChange({ size })}
                  className={`px-3 py-2 rounded-lg border transition-all ${
                    config.size === size
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600'
                  }`}
                >
                  {size.charAt(0).toUpperCase() + size.slice(1)}
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Border Radius (px)
            </label>
            <input
              type="range"
              min="0"
              max="32"
              value={config.borderRadius}
              onChange={(e) => onConfigChange({ borderRadius: Number(e.target.value) })}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0</span>
              <span>{config.borderRadius}px</span>
              <span>32</span>
            </div>
          </div>
        </div>
      </div>

      {/* AI & Voice Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
            <Brain className="w-5 h-5 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">AI & Voice</h2>
        </div>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Default LLM Provider
            </label>
            <select
              value={config.defaultLLM}
              onChange={(e) => onConfigChange({ defaultLLM: e.target.value as any })}
              className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg"
            >
              <option value="gpt">GPT</option>
              <option value="gemini">Gemini</option>
              <option value="claude">Claude</option>
              <option value="grok">Grok</option>
              <option value="deepseek">DeepSeek</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Temperature (0-2)
            </label>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={config.temperature}
              onChange={(e) => onConfigChange({ temperature: Number(e.target.value) })}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Precise</span>
              <span>{config.temperature}</span>
              <span>Creative</span>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Max Tokens
            </label>
            <input
              type="number"
              value={config.maxTokens}
              onChange={(e) => onConfigChange({ maxTokens: Number(e.target.value) })}
              min="50"
              max="4000"
              className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Enable Voice
            </label>
            <button
              onClick={() => onConfigChange({ enableVoice: !config.enableVoice })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                config.enableVoice ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  config.enableVoice ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          
          {config.enableVoice && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Default Voice Engine
                </label>
                <select
                  value={config.defaultVoiceEngine}
                  onChange={(e) => onConfigChange({ defaultVoiceEngine: e.target.value as any })}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg"
                >
                  <option value="openai">OpenAI</option>
                  <option value="elevenlabs">Eleven Labs</option>
                </select>
              </div>
              
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Auto-play Responses
                </label>
                <button
                  onClick={() => onConfigChange({ voiceAutoPlay: !config.voiceAutoPlay })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    config.voiceAutoPlay ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      config.voiceAutoPlay ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Speech Rate
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={config.speechRate}
                  onChange={(e) => onConfigChange({ speechRate: Number(e.target.value) })}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Slow</span>
                  <span>{config.speechRate}x</span>
                  <span>Fast</span>
                </div>
              </div>
            </>
          )}
          
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Enable RAG
            </label>
            <button
              onClick={() => onConfigChange({ enableRAG: !config.enableRAG })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                config.enableRAG ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  config.enableRAG ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          
          {config.enableRAG && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Max Retrieval Results
                </label>
                <input
                  type="number"
                  value={config.maxRetrievalResults}
                  onChange={(e) => onConfigChange({ maxRetrievalResults: Number(e.target.value) })}
                  min="1"
                  max="10"
                  className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Min Relevance Score
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={config.minRelevanceScore}
                  onChange={(e) => onConfigChange({ minRelevanceScore: Number(e.target.value) })}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0</span>
                  <span>{config.minRelevanceScore}</span>
                  <span>1</span>
                </div>
              </div>
            </>
          )}
          
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Stream Responses
            </label>
            <button
              onClick={() => onConfigChange({ streamResponses: !config.streamResponses })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                config.streamResponses ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  config.streamResponses ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Layout & Integration Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
            <Layout className="w-5 h-5 text-orange-600 dark:text-orange-400" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Layout & Integration</h2>
        </div>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Widget Width (px)
            </label>
            <input
              type="number"
              value={config.width}
              onChange={(e) => onConfigChange({ width: Number(e.target.value) })}
              min="300"
              max="800"
              className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Widget Height (px)
            </label>
            <input
              type="number"
              value={config.height}
              onChange={(e) => onConfigChange({ height: Number(e.target.value) })}
              min="400"
              max="800"
              className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Z-Index
            </label>
            <input
              type="number"
              value={config.zIndex}
              onChange={(e) => onConfigChange({ zIndex: Number(e.target.value) })}
              min="1"
              max="9999"
              className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Show Header
            </label>
            <button
              onClick={() => onConfigChange({ showHeader: !config.showHeader })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                config.showHeader ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  config.showHeader ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Show Footer
            </label>
            <button
              onClick={() => onConfigChange({ showFooter: !config.showFooter })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                config.showFooter ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  config.showFooter ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Enable Drag & Drop
            </label>
            <button
              onClick={() => onConfigChange({ enableDragDrop: !config.enableDragDrop })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                config.enableDragDrop ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  config.enableDragDrop ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Allowed Domains (one per line)
            </label>
            <textarea
              value={config.allowedDomains?.join('\n') || ''}
              onChange={(e) => onConfigChange({ 
                allowedDomains: e.target.value.split('\n').filter(domain => domain.trim()) 
              })}
              rows={4}
              placeholder="example.com&#10;subdomain.example.com"
              className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg resize-none"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Custom CSS
            </label>
            <textarea
              value={config.customCSS || ''}
              onChange={(e) => onConfigChange({ customCSS: e.target.value })}
              rows={6}
              placeholder=".chat-widget { /* custom styles */ }"
              className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg resize-none font-mono text-sm"
            />
          </div>
        </div>
      </div>

      {/* Chat Settings */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
            <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Chat Settings</h2>
        </div>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Bot Name
            </label>
            <input
              type="text"
              value={config.botName}
              onChange={(e) => onConfigChange({ botName: e.target.value })}
              className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Welcome Message
            </label>
            <textarea
              value={config.welcomeMessage}
              onChange={(e) => onConfigChange({ welcomeMessage: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg resize-none"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Input Placeholder
            </label>
            <input
              type="text"
              value={config.placeholder}
              onChange={(e) => onConfigChange({ placeholder: e.target.value })}
              className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Avatar URL
            </label>
            <input
              type="text"
              value={config.avatarUrl}
              onChange={(e) => onConfigChange({ avatarUrl: e.target.value })}
              placeholder="https://example.com/avatar.png"
              className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Widget Mode
            </label>
            <select
              value={config.mode}
              onChange={(e) => onConfigChange({ mode: e.target.value as any })}
              className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg"
            >
              <option value="popup">Popup</option>
              <option value="inline">Inline</option>
              <option value="fullscreen">Fullscreen</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Position (for popup mode)
            </label>
            <select
              value={config.position}
              onChange={(e) => onConfigChange({ position: e.target.value as any })}
              className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg"
            >
              <option value="bottom-right">Bottom Right</option>
              <option value="bottom-left">Bottom Left</option>
              <option value="top-right">Top Right</option>
              <option value="top-left">Top Left</option>
              <option value="center">Center</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}