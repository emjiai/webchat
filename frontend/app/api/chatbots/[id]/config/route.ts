import { NextRequest, NextResponse } from 'next/server'
import { chatbotStore } from '@/lib/chatbot-store'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const chatbotId = params.id

    // Get chatbot from store
    const chatbot = chatbotStore.getChatbot(chatbotId)
    
    if (!chatbot) {
      return NextResponse.json(
        { error: 'Chatbot not found' },
        { status: 404 }
      )
    }

    if (!chatbot.isActive) {
      return NextResponse.json(
        { error: 'Chatbot is inactive' },
        { status: 403 }
      )
    }

    // Return only the configuration (exclude sensitive data)
    const response = {
      chatbotId: chatbot.id,
      config: {
        ...chatbot.config,
        // Add chatbot-specific metadata
        botName: chatbot.name,
        // Remove any sensitive data that shouldn't be exposed to client
        apiKey: undefined,
        webhookUrl: undefined,
      }
    }

    // Add CORS headers for cross-origin requests
    const headers = new Headers()
    headers.set('Access-Control-Allow-Origin', '*')
    headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    headers.set('Cache-Control', 'public, max-age=300') // Cache for 5 minutes

    return NextResponse.json(response, { headers })
  } catch (error) {
    console.error('Error fetching chatbot config:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Handle preflight requests
export async function OPTIONS() {
  const headers = new Headers()
  headers.set('Access-Control-Allow-Origin', '*')
  headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  
  return new Response(null, {
    status: 200,
    headers
  })
}