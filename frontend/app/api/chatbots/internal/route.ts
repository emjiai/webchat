import { NextRequest, NextResponse } from 'next/server'
import { DummyDataService } from '@/lib/dummy-data-service'

// Internal API endpoint for dashboard - returns full chatbot data including configs
export async function GET(request: NextRequest) {
  try {
    console.log('Internal API: Fetching all chatbots with full configs')
    
    // Get all chatbots from dummy data service with full configuration
    const chatbots = DummyDataService.getAllChatbots()
    
    console.log(`Internal API: Returning ${chatbots.length} chatbots with full configs`)
    
    return NextResponse.json({ 
      chatbots: chatbots.map(chatbot => ({
        ...chatbot,
        // Ensure we include the full config
        config: chatbot.config || {}
      }))
    })
  } catch (error) {
    console.error('Error fetching internal chatbots:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}