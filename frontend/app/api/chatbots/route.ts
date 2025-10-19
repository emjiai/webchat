import { NextRequest, NextResponse } from 'next/server'
import { chatbotStore } from '@/lib/chatbot-store'

export async function GET(request: NextRequest) {
  try {
    // Get all chatbots from store
    const chatbots = chatbotStore.getAllChatbots()
    
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
          primaryColor: chatbot.config.theme.primaryColor,
          secondaryColor: chatbot.config.theme.secondaryColor,
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