import { NextRequest, NextResponse } from 'next/server'
import { DummyDataService } from '@/lib/dummy-data-service'

// GET /api/analytics/[chatbotId] - Get analytics for specific chatbot
export async function GET(
  request: NextRequest,
  { params }: { params: { chatbotId: string } }
) {
  try {
    const chatbotId = params.chatbotId
    const { searchParams } = new URL(request.url)
    const timeRange = searchParams.get('timeRange') as '24h' | '7d' | '30d' | '90d' || '7d'

    console.log('API: Fetching analytics for chatbot:', chatbotId, 'timeRange:', timeRange)

    const analytics = DummyDataService.getChatbotAnalytics(chatbotId, timeRange)
    
    if (!analytics) {
      return NextResponse.json(
        { error: 'Chatbot not found' },
        { status: 404 }
      )
    }

    // Add CORS headers
    const headers = new Headers()
    headers.set('Access-Control-Allow-Origin', '*')
    headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS')
    headers.set('Access-Control-Allow-Headers', 'Content-Type')
    headers.set('Cache-Control', 'public, max-age=300') // Cache for 5 minutes

    return NextResponse.json(analytics, { headers })
  } catch (error) {
    console.error('Error fetching analytics:', error)
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