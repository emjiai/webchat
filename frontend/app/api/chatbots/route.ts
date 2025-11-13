import { NextRequest, NextResponse } from 'next/server'
import { DummyDataService } from '@/lib/dummy-data-service'

export async function GET(request: NextRequest) {
  try {
    console.log('API: Fetching all chatbots')
    
    // Get all chatbots from dummy data service
    const chatbots = DummyDataService.getAllChatbots()
    
    // Filter and format for public API
    const publicChatbots = chatbots
      .filter(chatbot => chatbot.isActive)
      .map(chatbot => ({
        id: chatbot.id,
        name: chatbot.name,
        description: chatbot.description,
        targetWebsite: chatbot.targetWebsite,
        isActive: chatbot.isActive,
        createdAt: chatbot.createdAt,
        updatedAt: chatbot.updatedAt,
        // Basic theme info for previews
        theme: {
          primaryColor: chatbot.config?.theme?.primaryColor || '#3b82f6',
          secondaryColor: chatbot.config?.theme?.secondaryColor || '#8b5cf6',
        }
      }))

    // Add CORS headers
    const headers = new Headers()
    headers.set('Access-Control-Allow-Origin', '*')
    headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS')
    headers.set('Access-Control-Allow-Headers', 'Content-Type')
    headers.set('Cache-Control', 'public, max-age=60') // Cache for 1 minute

    return NextResponse.json({ chatbots: publicChatbots }, { headers })
  } catch (error) {
    console.error('Error fetching chatbots:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Create new chatbot
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, targetWebsite } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Chatbot name is required' },
        { status: 400 }
      )
    }

    console.log('API: Creating new chatbot:', name)
    const newChatbot = DummyDataService.createChatbot({
      name,
      description: description || '',
      targetWebsite: targetWebsite || '',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      config: {
        theme: {
          primaryColor: '#3b82f6',
          secondaryColor: '#8b5cf6',
          backgroundColor: '#ffffff',
          textColor: '#1f2937',
          fontFamily: 'Outfit',
        },
        welcomeMessage: `Hi! I'm ${name}. How can I help you today?`,
        botName: name,
        botAvatar: '/bot-avatar.png',
        placeholder: 'Type your message...',
        borderRadius: 12,
        displayMode: 'popup',
        position: 'bottom-right',
        size: 'medium',
        width: 380,
        height: 560,
        zIndex: 9999,
        showHeader: true,
        showFooter: true,
        enableDragDrop: true,
        voiceEnabled: true,
        defaultVoiceEngine: 'openai',
        voiceSpeed: 1.0,
        voiceStyle: 'friendly',
        autoPlayResponses: false,
        defaultTextModel: 'gpt',
        temperature: 0.7,
        maxTokens: 1024,
        streamingEnabled: true,
        showTypingIndicator: true,
        ragEnabled: true,
        showCitations: true,
        maxRetrievedDocs: 3,
        minRelevanceScore: 0.5,
        collectUserInfo: false,
        enableAnalytics: true,
        allowFileUploads: false,
      }
    })

    // Add CORS headers
    const headers = new Headers()
    headers.set('Access-Control-Allow-Origin', '*')
    headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    headers.set('Access-Control-Allow-Headers', 'Content-Type')

    return NextResponse.json(newChatbot, { headers })
  } catch (error) {
    console.error('Error creating chatbot:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function OPTIONS() {
  const headers = new Headers()
  headers.set('Access-Control-Allow-Origin', '*')
  headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  headers.set('Access-Control-Allow-Headers', 'Content-Type')
  
  return new Response(null, {
    status: 200,
    headers
  })
}