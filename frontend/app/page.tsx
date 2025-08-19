import Link from 'next/link'
import { Bot, Code, Mic, MessageSquare, Zap, Settings } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-6">
            <Bot className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            AI Chatbot Widget
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Embeddable voice and text-enabled chatbot with RAG capabilities. 
            Configure, customize, and deploy in minutes.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/dashboard"
              className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity"
            >
              Go to Dashboard
            </Link>
            <Link
              href="/demo"
              className="px-8 py-3 bg-white text-gray-700 rounded-lg font-semibold border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              Try Live Demo
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Mic className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Voice Conversations</h3>
            <p className="text-gray-600">
              Real-time voice input and output with OpenAI and Eleven Labs integration
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <MessageSquare className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Multi-Model Support</h3>
            <p className="text-gray-600">
              Choose between GPT, Gemini, Claude, Grok, and DeepSeek for text responses
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">RAG Capabilities</h3>
            <p className="text-gray-600">
              Retrieval-augmented generation with citation support for accurate responses
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
              <Code className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Easy Embedding</h3>
            <p className="text-gray-600">
              Copy-paste embed code to add the widget to any website instantly
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4">
              <Settings className="w-6 h-6 text-pink-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Full Customization</h3>
            <p className="text-gray-600">
              Customize colors, themes, welcome messages, and widget behavior
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
              <Bot className="w-6 h-6 text-indigo-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Responsive Design</h3>
            <p className="text-gray-600">
              Works seamlessly across desktop, tablet, and mobile devices
            </p>
          </div>
        </div>

        {/* Getting Started */}
        <div className="bg-white rounded-2xl p-8 shadow-lg max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-center">Getting Started</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center flex-shrink-0 font-semibold">
                1
              </div>
              <div>
                <h4 className="font-semibold mb-1">Configure Your Widget</h4>
                <p className="text-gray-600">
                  Go to the dashboard and customize the appearance, behavior, and AI models
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center flex-shrink-0 font-semibold">
                2
              </div>
              <div>
                <h4 className="font-semibold mb-1">Preview and Test</h4>
                <p className="text-gray-600">
                  Test the widget with both voice and text inputs to ensure it works as expected
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center flex-shrink-0 font-semibold">
                3
              </div>
              <div>
                <h4 className="font-semibold mb-1">Generate Embed Code</h4>
                <p className="text-gray-600">
                  Copy the generated script tag and paste it into your website's HTML
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-semibold hover:opacity-90 transition-opacity"
            >
              <Settings className="w-5 h-5" />
              Configure Your Widget
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}