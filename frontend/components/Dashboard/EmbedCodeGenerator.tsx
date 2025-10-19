'use client'

import { useState } from 'react'
import { WidgetConfig } from '@/types/widget'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Copy, Check, Code, Download } from 'lucide-react'

interface EmbedCodeGeneratorProps {
  config: WidgetConfig
  chatbotId: string
  chatbotName: string
}

export default function EmbedCodeGenerator({ config, chatbotId, chatbotName }: EmbedCodeGeneratorProps) {
  const [copied, setCopied] = useState(false)
  const [embedMethod, setEmbedMethod] = useState<'script' | 'npm' | 'react'>('script')

  const generateScriptEmbed = () => {
    return `<!-- ${chatbotName} - AI Chatbot Widget -->
<script>
  (function() {
    // Chatbot Configuration
    window.chatWidgetConfig = {
      chatbotId: '${chatbotId}',
      // The widget will automatically load the configuration from your server
    };

    // Load Widget Script
    const script = document.createElement('script');
    script.src = 'http://localhost:3001/widget/chatbot.js';
    script.async = true;
    script.onload = function() {
      if (window.initChatWidget) {
        window.initChatWidget(window.chatWidgetConfig);
      }
    };
    document.head.appendChild(script);

    // Load Widget Styles
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'http://localhost:3001/widget/chatbot.css';
    document.head.appendChild(link);
  })();
</script>
<!-- End ${chatbotName} Widget -->`
  }

  const generateNpmEmbed = () => {
    return `// Install the package
npm install @your-org/ai-chatbot-widget

// Import and initialize
import { ChatWidget } from '@your-org/ai-chatbot-widget';
import '@your-org/ai-chatbot-widget/dist/styles.css';

// ${chatbotName} Configuration
const config = {
  chatbotId: '${chatbotId}',
  apiBaseUrl: 'http://localhost:3001',
  
  // Optional: Override specific settings for this instance
  position: '${config.position}',
  theme: {
    primaryColor: '${config.theme.primaryColor}',
    secondaryColor: '${config.theme.secondaryColor}',
  },
  
  // Event callbacks (optional)
  onOpen: () => console.log('${chatbotName} opened'),
  onClose: () => console.log('${chatbotName} closed'),
  onMessage: (message) => console.log('New message:', message),
  
  // The widget will automatically fetch the full configuration from your server
  // based on the chatbotId, so you only need to override what's necessary
};

// Initialize the ${chatbotName} widget
const widget = ChatWidget.init(config);

// Widget control methods (optional)
// widget.open();     // Programmatically open the widget
// widget.close();    // Programmatically close the widget
// widget.destroy();  // Remove the widget from the page`
  }

  const generateReactEmbed = () => {
    return `import React, { useState, useCallback } from 'react';
import { ChatWidget } from '@your-org/ai-chatbot-widget';
import '@your-org/ai-chatbot-widget/dist/styles.css';

function App() {
  const [isWidgetOpen, setIsWidgetOpen] = useState(false);

  // ${chatbotName} Configuration
  const widgetConfig = {
    chatbotId: '${chatbotId}',
    apiBaseUrl: 'http://localhost:3001',
    
    // Optional: Override specific settings
    position: '${config.position}',
    theme: {
      primaryColor: '${config.theme.primaryColor}',
      secondaryColor: '${config.theme.secondaryColor}',
    },
    
    // Event handlers
    onOpen: useCallback(() => {
      console.log('${chatbotName} opened');
      setIsWidgetOpen(true);
    }, []),
    
    onClose: useCallback(() => {
      console.log('${chatbotName} closed');
      setIsWidgetOpen(false);
    }, []),
    
    onMessage: useCallback((message) => {
      console.log('New message from ${chatbotName}:', message);
      // You can integrate with analytics, state management, etc.
    }, []),
    
    // The widget will automatically fetch the full configuration from your server
    // based on the chatbotId, so you only need to override what's necessary
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Your app content */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4">
          <h1 className="text-3xl font-bold text-gray-900">
            My Website
          </h1>
          {isWidgetOpen && (
            <p className="text-sm text-green-600 mt-2">
              ${chatbotName} is active
            </p>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Your page content here */}
        <div className="px-4 py-6 sm:px-0">
          <p>Your website content goes here...</p>
        </div>
      </main>
      
      {/* ${chatbotName} Widget - renders as floating widget */}
      <ChatWidget config={widgetConfig} />
    </div>
  );
}

export default App;

// Advanced usage: Inline widget component
export function InlineChatWidget() {
  const inlineConfig = {
    ...widgetConfig,
    displayMode: 'inline',
    size: 'large',
  };

  return (
    <div className="w-full h-96 border rounded-lg">
      <ChatWidget config={inlineConfig} />
    </div>
  );
}`
  }

  const getEmbedCode = () => {
    switch (embedMethod) {
      case 'npm':
        return generateNpmEmbed()
      case 'react':
        return generateReactEmbed()
      default:
        return generateScriptEmbed()
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(getEmbedCode())
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const downloadCode = () => {
    const blob = new Blob([getEmbedCode()], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `chatbot-widget-embed.${embedMethod === 'script' ? 'html' : 'js'}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Embed Code Generator</h3>
        <p className="text-gray-600 mb-2">
          Generate embed code for <span className="font-semibold text-gray-900">{chatbotName}</span> (ID: <code className="bg-gray-100 px-1 rounded text-sm">{chatbotId}</code>)
        </p>
        <p className="text-sm text-gray-500">
          Choose your preferred installation method. The widget will automatically load the configuration for this specific chatbot.
        </p>
      </div>

      {/* Embed Method Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setEmbedMethod('script')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            embedMethod === 'script'
              ? 'bg-blue-100 text-blue-700'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Code className="w-4 h-4 inline mr-2" />
          Script Tag
        </button>
        <button
          onClick={() => setEmbedMethod('npm')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            embedMethod === 'npm'
              ? 'bg-blue-100 text-blue-700'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          NPM Package
        </button>
        <button
          onClick={() => setEmbedMethod('react')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            embedMethod === 'react'
              ? 'bg-blue-100 text-blue-700'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          React Component
        </button>
      </div>

      {/* Installation Instructions */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-semibold mb-2">Installation Instructions:</h4>
        {embedMethod === 'script' && (
          <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
            <li>Copy the embed code below (includes <strong>{chatbotName}</strong> configuration)</li>
            <li>Paste it into your HTML file, preferably before the closing &lt;/body&gt; tag</li>
            <li>The widget will automatically load <strong>{chatbotName}</strong>'s configuration from the server</li>
            <li>Changes made in the dashboard will automatically update the embedded widget</li>
          </ol>
        )}
        {embedMethod === 'npm' && (
          <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
            <li>Install the NPM package using the command shown</li>
            <li>Import the ChatWidget class and styles in your JavaScript file</li>
            <li>Initialize with <strong>{chatbotName}</strong>'s ID - full config loads automatically</li>
            <li>Use event callbacks to integrate with your application logic</li>
            <li>Control the widget programmatically using the returned widget instance</li>
          </ol>
        )}
        {embedMethod === 'react' && (
          <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
            <li>Install the NPM package: <code>npm install @your-org/ai-chatbot-widget</code></li>
            <li>Import the ChatWidget component in your React app</li>
            <li>Use <strong>{chatbotName}</strong>'s ID - configuration loads automatically from server</li>
            <li>Implement event handlers for open/close/message events</li>
            <li>Supports both floating widget and inline component modes</li>
          </ol>
        )}
      </div>

      {/* Code Display */}
      <div className="relative">
        <div className="absolute top-4 right-4 flex gap-2 z-10">
          <button
            onClick={copyToClipboard}
            className="px-3 py-1.5 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition-colors flex items-center gap-2 text-sm"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy
              </>
            )}
          </button>
          <button
            onClick={downloadCode}
            className="px-3 py-1.5 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition-colors flex items-center gap-2 text-sm"
          >
            <Download className="w-4 h-4" />
            Download
          </button>
        </div>
        
        <SyntaxHighlighter
          language={embedMethod === 'script' ? 'html' : 'javascript'}
          style={vscDarkPlus}
          customStyle={{
            borderRadius: '0.5rem',
            padding: '1.5rem',
            fontSize: '0.875rem',
            maxHeight: '500px',
            overflow: 'auto'
          }}
        >
          {getEmbedCode()}
        </SyntaxHighlighter>
      </div>

      {/* Additional Options */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-semibold text-blue-900 mb-2">Need Help?</h4>
        <p className="text-sm text-blue-700 mb-3">
          If you need assistance with the integration or have questions about the configuration options:
        </p>
        <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
          <li>Check our <a href="#" className="underline">documentation</a> for detailed guides</li>
          <li>View <a href="#" className="underline">example implementations</a></li>
          <li>Contact our <a href="#" className="underline">support team</a> for assistance</li>
          <li>Join our <a href="#" className="underline">developer community</a></li>
        </ul>
      </div>
    </div>
  )
}