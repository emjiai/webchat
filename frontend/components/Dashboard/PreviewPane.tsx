'use client';

import React, { useState } from 'react';
import { Monitor, Smartphone, Tablet } from 'lucide-react';
import ChatWidget from '@/components/ChatWidget/ChatWidget';
import { WidgetConfig } from '@/types';

interface PreviewPaneProps {
  config: WidgetConfig;
}

type DeviceType = 'desktop' | 'mobile' | 'tablet';

export default function PreviewPane({ config }: PreviewPaneProps) {
  const [device, setDevice] = useState<DeviceType>('desktop');
  
  const deviceDimensions = {
    desktop: { width: '100%', height: '600px' },
    tablet: { width: '768px', height: '1024px' },
    mobile: { width: '375px', height: '667px' }
  };

  return (
    <div className="space-y-6">
      {/* Device Selector */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Widget Preview
          </h2>
          
          <div className="flex gap-2">
            <button
              onClick={() => setDevice('desktop')}
              className={`p-2 rounded-lg transition-all ${
                device === 'desktop'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}
              aria-label="Desktop view"
            >
              <Monitor className="w-5 h-5" />
            </button>
            
            <button
              onClick={() => setDevice('tablet')}
              className={`p-2 rounded-lg transition-all ${
                device === 'tablet'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}
              aria-label="Tablet view"
            >
              <Tablet className="w-5 h-5" />
            </button>
            
            <button
              onClick={() => setDevice('mobile')}
              className={`p-2 rounded-lg transition-all ${
                device === 'mobile'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
              }`}
              aria-label="Mobile view"
            >
              <Smartphone className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Preview Container */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex justify-center">
          <div
            className={`relative bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-lg overflow-hidden transition-all duration-300 ${
              device === 'mobile' ? 'border-8 border-gray-900 dark:border-gray-700 rounded-3xl' : ''
            } ${
              device === 'tablet' ? 'border-8 border-gray-800 dark:border-gray-600 rounded-2xl' : ''
            }`}
            style={{
              width: deviceDimensions[device].width,
              height: deviceDimensions[device].height,
              maxWidth: '100%'
            }}
          >
            {/* Mock Website Content */}
            <div className="absolute inset-0 p-8 overflow-auto">
              <div className="space-y-6">
                <div className="bg-white/80 dark:bg-gray-700/80 backdrop-blur rounded-lg p-6">
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-3"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-500 rounded w-full mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-500 rounded w-5/6 mb-2"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-500 rounded w-4/6"></div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white/80 dark:bg-gray-700/80 backdrop-blur rounded-lg p-4">
                    <div className="h-32 bg-gray-200 dark:bg-gray-600 rounded mb-3"></div>
                    <div className="h-3 bg-gray-300 dark:bg-gray-500 rounded w-3/4"></div>
                  </div>
                  <div className="bg-white/80 dark:bg-gray-700/80 backdrop-blur rounded-lg p-4">
                    <div className="h-32 bg-gray-200 dark:bg-gray-600 rounded mb-3"></div>
                    <div className="h-3 bg-gray-300 dark:bg-gray-500 rounded w-3/4"></div>
                  </div>
                </div>
                
                <div className="bg-white/80 dark:bg-gray-700/80 backdrop-blur rounded-lg p-6">
                  <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2 mb-3"></div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 dark:bg-gray-500 rounded w-full"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-500 rounded w-5/6"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-500 rounded w-4/6"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Chat Widget Overlay */}
            <div className={`absolute ${
              config.mode === 'popup' 
                ? config.position === 'bottom-right' ? 'bottom-4 right-4' :
                  config.position === 'bottom-left' ? 'bottom-4 left-4' :
                  config.position === 'top-right' ? 'top-4 right-4' :
                  config.position === 'top-left' ? 'top-4 left-4' :
                  'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'
                : 'inset-0'
            }`}>
              <ChatWidget 
                config={config} 
                embedded={true}
              />
            </div>
          </div>
        </div>
        
        {/* Preview Info */}
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-500 dark:text-gray-400">Mode:</span>
              <span className="ml-2 font-medium text-gray-900 dark:text-white">
                {config.mode.charAt(0).toUpperCase() + config.mode.slice(1)}
              </span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Position:</span>
              <span className="ml-2 font-medium text-gray-900 dark:text-white">
                {config.position.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
              </span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Theme:</span>
              <span className="ml-2 font-medium text-gray-900 dark:text-white">
                {config.theme.charAt(0).toUpperCase() + config.theme.slice(1)}
              </span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Size:</span>
              <span className="ml-2 font-medium text-gray-900 dark:text-white">
                {config.size.charAt(0).toUpperCase() + config.size.slice(1)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}