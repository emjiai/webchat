'use client';

import { useState } from 'react';
import { Copy, Check, Code, Download, Eye, Settings2 } from 'lucide-react';
import { WidgetConfig } from '@/types';

interface EmbedCodeGeneratorProps {
  config: WidgetConfig;
  copied: boolean;
  onCopy: () => void;
}

export default function EmbedCodeGenerator({ config, copied, onCopy }: EmbedCodeGeneratorProps) {
  const [embedType, setEmbedType] = useState<'script' | 'iframe' | 'npm'>('script');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const generateScriptEmbed = () => {
    const configString = JSON.stringify(config, null, 2);
    return `<!-- AI Chatbot Widget -->
<script>
  (function() {
    var config = ${configString};
    
    var script = document.createElement('script');
    script.src = '${window.location.origin}/embed/widget.js';
    script.async = true;
    script.onload = function() {
      if (window.AIChat) {
        window.AIChat.init(config);
      }
    };
    document.head.appendChild(script);
  })();
</script>
<!-- End AI Chatbot Widget -->`;
  };

  const generateIframeEmbed = () => {
    const params = new URLSearchParams({
      config: JSON.stringify(config)
    });
    
    return `<!-- AI Chatbot Widget (iframe) -->
<iframe
  src="${window.location.origin}/embed?${params}"
  width="${config.size === 'small' ? '350' : config.size === 'large' ? '450' : '400'}"
  height="600"
  frameborder="0"
  style="position: fixed; bottom: 20px; right: 20px; z-index: 9999; border-radius: ${config.borderRadius}px; box-shadow: 0 10px 40px rgba(0,0,0,0.2);"
></iframe>
<!-- End AI Chatbot Widget -->`;
  };

  const generateNpmInstall = () => {
    return `# Install the package
npm install @your-org/ai-chatbot-widget

# Import and initialize
import AIChat from '@your-org/ai-chatbot-widget';
import '@your-org/ai-chatbot-widget/dist/styles.css';

const config = ${JSON.stringify(config, null, 2)};

// Initialize the widget
const chatWidget = new AIChat(config);
chatWidget.mount('#chat-container');

// Or auto-mount to body
chatWidget.autoMount();`;
  };

  const getEmbedCode = () => {
    switch (embedType) {
      case 'iframe':
        return generateIframeEmbed();
      case 'npm':
        return generateNpmInstall();
      default:
        return generateScriptEmbed();
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getEmbedCode());
    onCopy();
  };

  const handleDownload = () => {
    const blob = new Blob([getEmbedCode()], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-widget-embed-${embedType}.${embedType === 'npm' ? 'js' : 'html'}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Embed Type Selector */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Select Embed Method
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => setEmbedType('script')}
            className={`p-4 rounded-lg border-2 transition-all ${
              embedType === 'script'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
            }`}
          >
            <Code className="w-8 h-8 mx-auto mb-2 text-blue-500" />
            <h3 className="font-medium text-gray-900 dark:text-white">Script Tag</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Simple HTML script embed
            </p>
          </button>
          
          <button
            onClick={() => setEmbedType('iframe')}
            className={`p-4 rounded-lg border-2 transition-all ${
              embedType === 'iframe'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
            }`}
          >
            <Eye className="w-8 h-8 mx-auto mb-2 text-purple-500" />
            <h3 className="font-medium text-gray-900 dark:text-white">iFrame</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Isolated iframe embed
            </p>
          </button>
          
          <button
            onClick={() => setEmbedType('npm')}
            className={`p-4 rounded-lg border-2 transition-all ${
              embedType === 'npm'
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
            }`}
          >
            <Settings2 className="w-8 h-8 mx-auto mb-2 text-green-500" />
            <h3 className="font-medium text-gray-900 dark:text-white">NPM Package</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              JavaScript module
            </p>
          </button>
        </div>
      </div>

      {/* Code Display */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Embed Code
          </h2>
          
          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy Code'}
            </button>
            
            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
          </div>
        </div>
        
        <div className="relative">
          <pre className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg overflow-x-auto">
            <code className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre">
              {getEmbedCode()}
            </code>
          </pre>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Installation Instructions
        </h2>
        
        <div className="space-y-4">
          {embedType === 'script' && (
            <ol className="list-decimal list-inside space-y-2 text-gray-700 dark:text-gray-300">
              <li>Copy the embed code above</li>
              <li>Paste it into your HTML file, preferably before the closing &lt;/body&gt; tag</li>
              <li>The widget will automatically initialize when the page loads</li>
              <li>Customize the configuration object to match your needs</li>
            </ol>
          )}
          
          {embedType === 'iframe' && (
            <ol className="list-decimal list-inside space-y-2 text-gray-700 dark:text-gray-300">
              <li>Copy the iframe code above</li>
              <li>Paste it into your HTML where you want the widget to appear</li>
              <li>Adjust the width, height, and position as needed</li>
              <li>The widget runs in an isolated environment for security</li>
            </ol>
          )}
          
          {embedType === 'npm' && (
            <ol className="list-decimal list-inside space-y-2 text-gray-700 dark:text-gray-300">
              <li>Install the NPM package using the command above</li>
              <li>Import the widget and styles in your JavaScript file</li>
              <li>Initialize with your configuration object</li>
              <li>Mount to a container element or use auto-mount</li>
              <li>The widget will handle all interactions automatically</li>
            </ol>
          )}
        </div>
        
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="mt-4 text-blue-500 hover:text-blue-600 text-sm font-medium flex items-center gap-1"
        >
          {showAdvanced ? 'Hide' : 'Show'} Advanced Options
          <Settings2 className="w-4 h-4" />
        </button>
        
        {showAdvanced && (
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">
              Advanced Configuration
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              You can programmatically control the widget after initialization:
            </p>
            <pre className="bg-white dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-700 text-xs overflow-x-auto">
              <code>{`// Open the widget
window.AIChat.open();

// Close the widget
window.AIChat.close();

// Send a message programmatically
window.AIChat.sendMessage('Hello!');

// Listen to events
window.AIChat.on('message', (msg) => {
  console.log('New message:', msg);
});

// Update configuration
window.AIChat.updateConfig({
  theme: 'dark',
  primaryColor: '#FF6B6B'
});

// Destroy the widget
window.AIChat.destroy();`}</code>
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}