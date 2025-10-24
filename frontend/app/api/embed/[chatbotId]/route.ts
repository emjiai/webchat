import { NextRequest, NextResponse } from 'next/server'
import { DummyDataService } from '@/lib/dummy-data-service'

// GET /api/embed/[chatbotId] - Get chatbot config for embed/external access
export async function GET(
  request: NextRequest,
  { params }: { params: { chatbotId: string } }
) {
  try {
    const chatbotId = params.chatbotId
    console.log('API: Fetching chatbot config for embed:', chatbotId)

    const chatbot = DummyDataService.getChatbotById(chatbotId)
    
    if (!chatbot) {
      return NextResponse.json(
        { error: 'Chatbot not found' },
        { status: 404 }
      )
    }

    if (!chatbot.isActive) {
      return NextResponse.json(
        { error: 'Chatbot is not active' },
        { status: 403 }
      )
    }

    // Return only the configuration needed for the widget
    const embedConfig = {
      id: chatbot.id,
      name: chatbot.name,
      config: chatbot.config,
      // Include some basic metadata
      meta: {
        targetWebsite: chatbot.targetWebsite,
        createdAt: chatbot.createdAt
      }
    }

    // Add CORS headers for external access
    const headers = new Headers()
    headers.set('Access-Control-Allow-Origin', '*')
    headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS')
    headers.set('Access-Control-Allow-Headers', 'Content-Type')
    headers.set('Cache-Control', 'public, max-age=3600') // Cache for 1 hour

    return NextResponse.json(embedConfig, { headers })
  } catch (error) {
    console.error('Error fetching chatbot for embed:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// OPTIONS for CORS preflight
export async function OPTIONS() {
  const headers = new Headers()
  headers.set('Access-Control-Allow-Origin', '*')
  headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS')
  headers.set('Access-Control-Allow-Headers', 'Content-Type')
  
  return new Response(null, {
    status: 200,
    headers
  })
}