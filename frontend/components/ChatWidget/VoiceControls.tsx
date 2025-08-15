'use client';

import React from 'react';
import { Volume2, Zap, Languages, Sliders } from 'lucide-react';
import { VoiceEngine, WidgetConfig } from '@/types';

interface VoiceControlsProps {
  voiceEngine: VoiceEngine;
  config: WidgetConfig;
  onConfigChange?: (updates: Partial<WidgetConfig>) => void;
}

export default function VoiceControls({ voiceEngine, config, onConfigChange }: VoiceControlsProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
          <Volume2 className="w-3 h-3" />
          <span>Voice Settings</span>
        </div>
        <div className="flex items-center gap-1">
          <span className={`w-2 h-2 rounded-full ${
            voiceEngine === 'openai' ? 'bg-green-500' : 'bg-purple-500'
          }`}></span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {voiceEngine === 'openai' ? 'OpenAI' : 'Eleven Labs'}
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-2">
        <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-3 h-3 text-yellow-500" />
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Speed</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            value={config.speechRate}
            onChange={(e) => onConfigChange?.({ speechRate: Number(e.target.value) })}
            className="w-full h-1 bg-gray-300 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
          />
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center mt-1">
            {config.speechRate}x
          </div>
        </div>
        
        <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <Languages className="w-3 h-3 text-blue-500" />
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Language</span>
          </div>
          <select className="w-full text-xs bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded px-2 py-1">
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
            <option value="ja">Japanese</option>
            <option value="zh">Chinese</option>
          </select>
        </div>
      </div>
      
      {voiceEngine === 'elevenlabs' && (
        <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Sliders className="w-3 h-3 text-yellow-600 dark:text-yellow-400" />
            <span className="text-xs font-medium text-yellow-800 dark:text-yellow-200">
              Advanced Voice Settings
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-600 dark:text-gray-400">Stability</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                defaultValue="0.5"
                className="w-full h-1 bg-gray-300 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            <div>
              <label className="text-xs text-gray-600 dark:text-gray-400">Similarity</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                defaultValue="0.5"
                className="w-full h-1 bg-gray-300 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}