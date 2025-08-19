'use client'

import { useState, useEffect } from 'react'
import { WidgetConfig } from '@/types/widget'
import ChatWidget from '@/components/widget/ChatWidget'
import { Monitor, Tablet, Smartphone } from 'lucide-react'

interface PreviewPanelProps {
  config: WidgetConfig
}

export default function PreviewPanel({ config }: PreviewPanelProps) {
  const [deviceView, setDeviceView] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')
  const [isWidgetOpen, setIsWidgetOpen] = useState(false)

  const getDeviceStyles = () => {
    switch (deviceView) {
      case 'mobile':
        return 'w-[375px] h-[667px]'
      case 'tablet':
        return 'w-[768px] h-[1024px]'
      default:
        return 'w-full h-[800px]'
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Widget Preview</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setDeviceView('desktop')}
            className={`p-2 rounded-lg transition-colors ${
              deviceView === 'desktop' 
                ? 'bg-blue-100 text-blue-600' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title="Desktop view"
          >
            <Monitor className="w-5 h-5" />
          </button>
          <button
            onClick={() => setDeviceView('tablet')}
            className={`p-2 rounded-lg transition-colors ${
              deviceView === 'tablet' 
                ? 'bg-blue-100 text-blue-600' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title="Tablet view"
          >
            <Tablet className="w-5 h-5" />
          </button>
          <button
            onClick={() => setDeviceView('mobile')}
            className={`p-2 rounded-lg transition-colors ${
              deviceView === 'mobile' 
                ? 'bg-blue-100 text-blue-600' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title="Mobile view"
          >
            <Smartphone className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex justify-center">
        <div 
          className={`${getDeviceStyles()} bg-gray-50 rounded-lg border-2 border-gray-200 relative overflow-hidden transition-all duration-300`}
          style={{
            backgroundImage: 'linear-gradient(45deg, #f0f0f0 25%, transparent 25%), linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f0f0f0 75%), linear-gradient(-45deg, transparent 75%, #f0f0f0 75%)',
            backgroundSize: '20px 20px',
            backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
          }}
        >
          {/* Sample website content */}
          <div className="p-8">
            <div className="bg-white rounded-lg p-6 shadow-sm mb-4">
              <h2 className="text-2xl font-bold mb-4">Sample Website</h2>
              <p className="text-gray-600 mb-4">
                This is a preview of how your chat widget will appear on your website. 
                The widget will be positioned according to your configuration.
              </p>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded w-4/6"></div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-3">Content Section</h3>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded w-full"></div>
                <div className="h-3 bg-gray-200 rounded w-11/12"></div>
                <div className="h-3 bg-gray-200 rounded w-10/12"></div>
                <div className="h-3 bg-gray-200 rounded w-9/12"></div>
              </div>
            </div>
          </div>

          {/* Chat Widget */}
          <ChatWidget 
            config={config}
            isPreview={true}
            onToggle={(open) => setIsWidgetOpen(open)}
          />
        </div>
      </div>

      {/* Preview Info */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-semibold text-blue-900 mb-2">Preview Mode</h4>
        <p className="text-sm text-blue-700">
          This is a live preview of your chat widget. Click the chat bubble to open it and test the features.
          The widget will behave exactly like this when embedded on your website.
        </p>
      </div>
    </div>
  )
}