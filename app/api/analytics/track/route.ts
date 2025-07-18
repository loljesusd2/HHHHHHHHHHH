
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'

export const dynamic = 'force-dynamic'

interface AnalyticsEvent {
  action: string
  category: string
  label?: string
  value?: number
  userId?: string
  timestamp: string
  url: string
  userAgent: string
  customProperties?: Record<string, any>
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    const eventData: AnalyticsEvent = await request.json()

    // Add server-side information
    const enrichedEvent = {
      ...eventData,
      userId: session?.user?.email || eventData.userId,
      ip: request.ip || request.headers.get('x-forwarded-for') || 'unknown',
      timestamp: new Date().toISOString(),
      sessionId: session?.user?.email ? `session_${session.user.email}` : 'anonymous'
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Analytics Event:', enrichedEvent)
    }

    // In production, you would send this to your analytics service
    // Examples:
    // - Google Analytics 4
    // - Mixpanel
    // - Amplitude
    // - Custom analytics service

    // For now, we'll just store it in a simple format
    // In a real implementation, you'd use a proper analytics service or database
    
    return NextResponse.json({ 
      success: true, 
      message: 'Event tracked successfully' 
    })
  } catch (error) {
    console.error('Analytics tracking error:', error)
    return NextResponse.json(
      { error: 'Failed to track event' },
      { status: 500 }
    )
  }
}
