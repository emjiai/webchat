'use client'

import { useState } from 'react'
import { WidgetConfig } from '@/types/widget'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Copy, Check, Code, Download } from 'lucide-react'

interface EmbedCodeGeneratorProps {
  config: WidgetConfig
}

export default function EmbedCodeGenerator({ config }: EmbedCodeGeneratorProps) {
  const [copied, setCopied] = useState(false)
  const [embedMethod, setEmbedMethod] = useState<'script' | 'npm' | 'react'>('script')

  const generateScriptEmbed = () => {
    const configString = JSON.stringify(config, null, 2)
    return `<!-- AI Chatbot Widget -->
<script>
  (function() {
    // Widget Configuration
    const widgetConfig = ${configString};

    // Load Widget Script
    const script = document.createElement('script');
    script.src = 'https://your-domain.com/widget/chatbot.js';
    script.async = true;
    script.onload = function() {
      if (window.initChatWidget) {
        window.initChatWidget(widgetConfig);
      }
    };
    document.head.appendChild(script);

    // Load Widget Styles
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://your-domain.com/widget/chatbot.css';
    document.head.appendChild(link);
  })();
</script>
<!-- End AI Chatbot Widget -->`
  }

  const generateNpmEmbed = () => {
    return `// Install the package
npm install @your-org/ai-chatbot-widget

// Import and initialize
import { ChatWidget } from '@your-org/ai-chatbot-widget';
import '@your-org/ai-chatbot-widget/dist/styles.css';

const config = ${JSON.stringify(config, null, 2)};

// Initialize the widget
ChatWidget.init(config);`
  }

  const generateReactEmbed = () => {
    return `import { ChatWidget } from '@your-org/ai-chatbot-widget';
import '@your-org/ai-chatbot-widget/dist/styles.css';

function App() {
  const widgetConfig = ${JSON.stringify(config, null, 2)};

  return (
    <div>
      {/* Your app content */}
      <ChatWidget config={widgetConfig} />
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
        <p className="text-gray-600">
          Choose your preferred installation method and copy the code to embed the widget on your website.
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
            <li>Copy the embed code below</li>
            <li>Paste it into your HTML file, preferably before the closing &lt;/body&gt; tag</li>
            <li>The widget will automatically initialize when the page loads</li>
            <li>Customize the configuration object to match your needs</li>
          </ol>
        )}
        {embedMethod === 'npm' && (
          <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
            <li>Install the NPM package using the command shown</li>
            <li>Import the ChatWidget class and styles in your JavaScript file</li>
            <li>Initialize the widget with your configuration</li>
            <li>The widget will be added to your page automatically</li>
          </ol>
        )}
        {embedMethod === 'react' && (
          <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
            <li>Install the NPM package: npm install @your-org/ai-chatbot-widget</li>
            <li>Import the ChatWidget component in your React app</li>
            <li>Add the component with your configuration props</li>
            <li>The widget will render as part of your React component tree</li>
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