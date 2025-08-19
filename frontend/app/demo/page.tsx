'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function DemoPage() {
  useEffect(() => {
    // Simulate embedding the widget
    const script = document.createElement('script')
    script.innerHTML = `
      (function() {
        const config = {
          primaryColor: '#3b82f6',
          secondaryColor: '#8b5cf6',
          welcomeMessage: 'Welcome to our demo! Try voice or text chat.',
          botName: 'Demo Assistant',
          displayMode: 'popup',
          position: 'bottom-right',
          voiceEnabled: true,
          ragEnabled: true
        };
        
        // Initialize widget (this will be handled by the widget component)
        window.initChatWidget = function() {
          console.log('Widget initialized with config:', config);
        };
        
        // Trigger initialization after a short delay
        setTimeout(() => {
          if (window.initChatWidget) {
            window.initChatWidget();
          }
        }, 1000);
      })();
    `
    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-12">
        <Link 
          href="/"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Live Demo
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            This page demonstrates how the chat widget appears when embedded on a website. 
            Look for the chat bubble in the bottom-right corner!
          </p>

          <div className="bg-white rounded-xl p-8 shadow-lg">
            <h2 className="text-2xl font-semibold mb-4">Try These Features:</h2>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                <span>Click the chat bubble to open the widget</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                <span>Type a message or use the microphone for voice input</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                <span>Ask about our products, services, or company information</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                <span>Switch between different AI models (GPT, Claude, etc.)</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                <span>Toggle between OpenAI and Eleven Labs for voice</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                <span>Notice how responses include citations from our knowledge base</span>
              </li>
            </ul>

            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">Sample Questions:</h3>
              <ul className="space-y-2 text-blue-700">
                <li>"What products do you offer?"</li>
                <li>"Tell me about your pricing plans"</li>
                <li>"How does the voice feature work?"</li>
                <li>"What AI models are supported?"</li>
                <li>"Can I customize the widget appearance?"</li>
              </ul>
            </div>
          </div>

          <div className="mt-8 bg-white rounded-xl p-8 shadow-lg">
            <h2 className="text-2xl font-semibold mb-4">How It Works</h2>
            <p className="text-gray-700 mb-4">
              This demo page has the chat widget embedded using a simple script tag. 
              The widget loads asynchronously and doesn't affect page performance.
            </p>
            <p className="text-gray-700">
              In a real implementation, the widget would connect to your FastAPI backend 
              for processing messages, voice transcription, and RAG retrieval. For this demo, 
              we're using local JSON files to simulate the backend responses.
            </p>
          </div>
        </div>
      </div>

      {/* The widget will be injected here by the ChatWidget component */}
      <div id="chat-widget-root"></div>
    </div>
  )
}