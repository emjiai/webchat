import { Message, Citation } from '@/types/widget'
import demoData from '@/data/demo-knowledge.json'
import { searchDocuments } from './rag-service'

interface ChatResponse {
  content: string
  citations?: Citation[]
  model?: string
  timestamp?: string
  processing_time_ms?: number
}

interface RAGApiResponse {
  content: string
  citations: Citation[]
  model: string
  timestamp: string
  chatbot_id: string
  rag_enabled: boolean
  processing_time_ms?: number
}

// Process message with RAG API integration
export async function processMessage(
  message: string,
  model: string,
  ragEnabled: boolean,
  chatbotId: string = 'default',
  corpusId?: string,
  isPreview: boolean = false
): Promise<ChatResponse> {
  // Force Gemini model when in preview mode
  const effectiveModel = isPreview ? 'gemini' : model
  
  console.log(`🔍 Processing message in ${isPreview ? 'PREVIEW' : 'NORMAL'} mode with model: ${effectiveModel}`)
  
  // For preview mode, try direct API calls first (skip RAG API for testing)
  if (isPreview) {
    console.log('🚀 Preview mode: Attempting direct API calls')
    const directResponse = await processMessageLocal(message, effectiveModel, ragEnabled)
    console.log('✅ Preview mode response:', directResponse.content.substring(0, 100) + '...')
    return directResponse
  }
  
  // For non-preview mode, try RAG API first
  if (ragEnabled && process.env.NEXT_PUBLIC_RAG_API_URL) {
    try {
      console.log('🔗 Trying RAG API...')
      const response = await processMessageWithRAG(message, chatbotId, corpusId, ragEnabled, effectiveModel)
      return {
        content: response.content,
        citations: response.citations,
        model: response.model,
        timestamp: response.timestamp,
        processing_time_ms: response.processing_time_ms
      }
    } catch (error) {
      console.warn('❌ RAG API failed, falling back to local processing:', error)
      // Fall through to local processing
    }
  }

  // Fallback to original local processing
  console.log('📋 Using local processing fallback')
  return processMessageLocal(message, effectiveModel, ragEnabled)
}

// New RAG API integration function
export async function processMessageWithRAG(
  message: string,
  chatbotId: string,
  corpusId?: string,
  ragEnabled: boolean = true,
  model: string = 'gemini-2.5-flash'
): Promise<RAGApiResponse> {
  const apiUrl = process.env.NEXT_PUBLIC_RAG_API_URL || 'http://localhost:8000/api/v1'
  
  const requestBody: any = {
    message,
    chatbot_id: chatbotId,
    rag_enabled: ragEnabled,
    max_results: 10,
    temperature: 0.7,
    model: model.includes('gemini') ? model : 'gemini-2.5-flash'
  }

  // Include corpus ID if provided
  if (corpusId && ragEnabled) {
    requestBody.corpus_id = corpusId
  }
  
  const response = await fetch(`${apiUrl}/chat/message`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  })
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(`RAG API error: ${response.statusText} - ${errorData.message || 'Unknown error'}`)
  }
  
  return response.json()
}

// Original local processing function (renamed)
async function processMessageLocal(
  message: string,
  model: string,
  ragEnabled: boolean
): Promise<ChatResponse> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000))

  let context = ''
  let citations: Citation[] = []

  // Perform RAG retrieval if enabled
  if (ragEnabled) {
    const searchResults = await searchDocuments(message)
    if (searchResults.length > 0) {
      context = searchResults.map(doc => doc.snippet).join('\n\n')
      citations = searchResults
    }
  }

  // Generate response based on model
  const response = await generateModelResponse(message, model, context)

  return {
    content: response,
    citations: ragEnabled ? citations : undefined
  }
}

async function generateModelResponse(
  message: string,
  model: string,
  context: string
): Promise<string> {
  console.log(`🤖 generateModelResponse called with model: ${model}, message: "${message.substring(0, 50)}..."`)
  
  // For Gemini model, use Google AI Studio API if available
  if (model === 'gemini' && process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
    console.log('🔑 Gemini API key found, attempting API call...')
    try {
      const response = await callGeminiAPI(message, context)
      console.log('✅ Gemini API response received:', response.substring(0, 100) + '...')
      return response
    } catch (error) {
      console.error('❌ Gemini API error:', error)
      // Fall back to demo response if API fails
    }
  } else if (model === 'gemini') {
    console.log('⚠️ Gemini model requested but no API key found')
  }

  // For other models, try to use their respective APIs
  if (model === 'gpt' && process.env.NEXT_PUBLIC_OPENAI_API_KEY) {
    try {
      const response = await callOpenAIAPI(message, context)
      return response
    } catch (error) {
      console.error('OpenAI API error:', error)
    }
  }

  // Fallback to enhanced demo responses with model indication
  return generateDemoResponse(message, model, context)
}

// Real Gemini API call using Google AI Studio
async function callGeminiAPI(message: string, context: string): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`
  
  const prompt = context 
    ? `Context information:\n${context}\n\nUser question: ${message}\n\nPlease provide a helpful response based on the context and your knowledge.`
    : message

  const requestBody = {
    contents: [{
      parts: [{
        text: prompt
      }]
    }],
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 1024,
    }
  }

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(`Gemini API error: ${response.statusText} - ${errorData.error?.message || 'Unknown error'}`)
  }

  const data = await response.json()
  return data.candidates?.[0]?.content?.parts?.[0]?.text || 'I apologize, but I encountered an issue generating a response.'
}

// OpenAI API call (if API key is available)
async function callOpenAIAPI(message: string, context: string): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY
  const apiUrl = 'https://api.openai.com/v1/chat/completions'
  
  const systemMessage = context 
    ? `You are a helpful AI assistant. Use this context information to help answer questions: ${context}`
    : 'You are a helpful AI assistant.'

  const requestBody = {
    model: 'gpt-3.5-turbo',
    messages: [
      { role: 'system', content: systemMessage },
      { role: 'user', content: message }
    ],
    temperature: 0.7,
    max_tokens: 1024,
  }

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify(requestBody),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new Error(`OpenAI API error: ${response.statusText} - ${errorData.error?.message || 'Unknown error'}`)
  }

  const data = await response.json()
  return data.choices?.[0]?.message?.content || 'I apologize, but I encountered an issue generating a response.'
}

// Enhanced demo responses as fallback
function generateDemoResponse(message: string, model: string, context: string): string {
  const lowerMessage = message.toLowerCase()
  
  // Check for specific queries that match our demo data
  if (lowerMessage.includes('product') || lowerMessage.includes('offer')) {
    return `Based on our offerings, we provide three main product tiers:

1. **Starter Plan** - Perfect for small businesses and individuals
   - Basic chatbot functionality
   - Up to 1,000 messages/month
   - Email support

2. **Professional Plan** - Ideal for growing companies
   - Advanced AI models including GPT-4 and Claude
   - Voice capabilities with multiple engines
   - Up to 10,000 messages/month
   - Priority support

3. **Enterprise Plan** - Comprehensive solution for large organizations
   - Unlimited messages
   - Custom integrations
   - Dedicated support team
   - Advanced analytics

${context ? `\nAdditional information from our knowledge base:\n${context}` : ''}

Would you like more details about any specific plan?`
  }

  if (lowerMessage.includes('voice') || lowerMessage.includes('speech')) {
    return `Our voice features include:

• **Real-time voice input** - Speak naturally and have your speech converted to text
• **Multiple voice engines** - Choose between OpenAI and Eleven Labs for the best quality
• **Text-to-speech** - All responses can be played back as natural-sounding speech
• **Adjustable settings** - Control voice speed, volume, and style
• **Auto-play option** - Automatically play voice responses

The voice feature works seamlessly with all supported AI models (GPT-4, Claude, Gemini, etc.).

${context ? `\n${context}` : ''}`
  }

  if (lowerMessage.includes('pricing') || lowerMessage.includes('cost')) {
    return `Our pricing is designed to be flexible and scalable:

**Starter Plan**: $29/month
- Perfect for getting started
- Includes core features

**Professional Plan**: $99/month
- Full feature set
- Priority support

**Enterprise Plan**: Custom pricing
- Tailored to your needs
- Volume discounts available

All plans include a 14-day free trial. No credit card required to start!

${context ? `\n${context}` : ''}`
  }

  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
    const greetings = {
      gemini: `Hello! I'm powered by Google's Gemini AI. I'm here to help you with any questions you have. ${context ? 'I also have access to your uploaded documents to provide more specific answers.' : 'How can I assist you today?'}`,
      gpt: `Hi there! I'm using GPT technology to help answer your questions. ${context ? 'I can reference your uploaded documents for more accurate responses.' : 'What would you like to know?'}`,
      claude: `Hello! I'm Claude, an AI assistant. I'm here to help you with thoughtful and detailed responses. ${context ? 'I can also use your document knowledge base for better context.' : 'How may I help you?'}`,
      grok: `Hey! I'm Grok - ready to help with a mix of wit and wisdom. ${context ? 'I\'ve got access to your docs too, so fire away!' : 'What\'s on your mind?'}`,
      deepseek: `Greetings! I'm DeepSeek, here to provide deep insights and analysis. ${context ? 'With your documents as reference, I can offer even more precise help.' : 'What can I analyze for you?'}`
    }
    return greetings[model as keyof typeof greetings] || greetings.gemini
  }

  // Default response for general queries with context
  if (context) {
    return `Based on the information available and your uploaded documents, I can help you with that. ${context}\n\nIs there anything specific about this information you'd like me to explain or expand upon?`
  }

  // Default response without context
  const modelResponses: Record<string, string> = {
    gpt: `I'm here to help! As a GPT-powered assistant, I can assist with a wide variety of topics including answering questions, creative tasks, analysis, and much more. What would you like to know or discuss?`,
    gemini: `Hello! I'm powered by Google's Gemini AI. I can help you with questions, analysis, creative tasks, and provide detailed explanations on many topics. What can I assist you with today?`,
    claude: `I'm Claude, and I'd be happy to help you! I can assist with analysis, writing, math, coding, creative projects, and thoughtful discussion on many topics. What would you like to work on together?`,
    grok: `I'm Grok! I aim to be helpful while keeping things interesting. I can tackle questions, creative challenges, analysis, and more - often with a bit of personality. What's puzzling you today?`,
    deepseek: `I'm DeepSeek, designed for deep thinking and analysis. I can help with complex problems, detailed explanations, research, and provide insights across many domains. What would you like to explore?`
  }

  return modelResponses[model] || modelResponses.gemini
}

// Stream response simulation (for future implementation)
export async function* streamMessage(
  message: string,
  model: string,
  ragEnabled: boolean
): AsyncGenerator<string> {
  const response = await processMessage(message, model, ragEnabled)
  const words = response.content.split(' ')
  
  for (const word of words) {
    yield word + ' '
    await new Promise(resolve => setTimeout(resolve, 50))
  }
}