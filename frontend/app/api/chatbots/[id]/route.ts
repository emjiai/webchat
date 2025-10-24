import { NextRequest, NextResponse } from 'next/server'
import { DummyDataService } from '@/lib/dummy-data-service'

// Get specific chatbot
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const chatbotId = params.id
    console.log('API: Fetching chatbot:', chatbotId)

    const chatbot = DummyDataService.getChatbotById(chatbotId)
    
    if (!chatbot) {
      return NextResponse.json(
        { error: 'Chatbot not found' },
        { status: 404 }
      )
    }

    // Add CORS headers
    const headers = new Headers()
    headers.set('Access-Control-Allow-Origin', '*')
    headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    headers.set('Access-Control-Allow-Headers', 'Content-Type')

    return NextResponse.json(chatbot, { headers })
  } catch (error) {
    console.error('Error fetching chatbot:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Update chatbot
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const chatbotId = params.id
    const body = await request.json()
    
    console.log('API: Updating chatbot:', chatbotId, body)

    let updatedChatbot
    if (body.config) {
      // Update configuration
      updatedChatbot = DummyDataService.updateChatbotConfig(chatbotId, body.config)
    } else {
      // Update chatbot metadata
      updatedChatbot = DummyDataService.updateChatbot(chatbotId, body)
    }
    
    if (!updatedChatbot) {
      return NextResponse.json(
        { error: 'Chatbot not found' },
        { status: 404 }
      )
    }

    // Add CORS headers
    const headers = new Headers()
    headers.set('Access-Control-Allow-Origin', '*')
    headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    headers.set('Access-Control-Allow-Headers', 'Content-Type')

    return NextResponse.json(updatedChatbot, { headers })
  } catch (error) {
    console.error('Error updating chatbot:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Delete chatbot
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const chatbotId = params.id
    console.log('API: Deleting chatbot:', chatbotId)

    const success = DummyDataService.deleteChatbot(chatbotId)
    
    if (!success) {
      return NextResponse.json(
        { error: 'Chatbot not found or cannot be deleted' },
        { status: 404 }
      )
    }

    // Add CORS headers
    const headers = new Headers()
    headers.set('Access-Control-Allow-Origin', '*')
    headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    headers.set('Access-Control-Allow-Headers', 'Content-Type')

    return NextResponse.json({ success: true }, { headers })
  } catch (error) {
    console.error('Error deleting chatbot:', error)
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