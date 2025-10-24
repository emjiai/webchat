import { NextRequest, NextResponse } from 'next/server'
import { serverChatbotStore } from '@/lib/chatbot-store-server'

export async function GET(request: NextRequest) {
  try {
    console.log('=== DEBUG ENDPOINT ===')
    
    // Force debug list
    serverChatbotStore.debugListChatbots()
    
    // Get all chatbots
    const allChatbots = serverChatbotStore.getAllChatbots()
    
    console.log('Debug: Found', allChatbots.length, 'chatbots')
    
    // Create a test chatbot if none exist
    if (allChatbots.length === 0) {
      console.log('Debug: No chatbots found, creating test chatbot')
      const testChatbot = serverChatbotStore.createChatbot(
        'Test WorkerBull Bot',
        'Test chatbot for debugging',
        'http://localhost:3000'
      )
      console.log('Debug: Created test chatbot:', testChatbot.id)
    }
    
    const response = {
      success: true,
      chatbotsCount: allChatbots.length,
      chatbots: allChatbots.map(c => ({
        id: c.id,
        name: c.name,
        isActive: c.isActive,
        description: c.description
      })),
      timestamp: new Date().toISOString()
    }
    
    console.log('Debug response:', response)
    
    return NextResponse.json(response)
  } catch (error) {
    console.error('Debug endpoint error:', error)
    return NextResponse.json(
      { 
        error: 'Debug endpoint failed', 
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}