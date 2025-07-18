
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Check for auth token in cookies
    const cookies = request.headers.get('cookie')
    const authToken = cookies?.split(';').find(c => c.trim().startsWith('auth-token='))?.split('=')[1]
    
    if (!authToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Decode JWT token to get user data
    try {
      const base64Payload = authToken.split('.')[1]
      const payload = JSON.parse(atob(base64Payload))
      
      const userData = {
        id: payload.userId,
        email: payload.email,
        name: payload.role === 'CLIENT' ? 'Sarah Johnson' : 'Isabella Rodriguez',
        role: payload.role,
        avatar: payload.role === 'CLIENT' 
          ? 'https://i.pinimg.com/736x/d6/f9/91/d6f991fa9de5196eeaaa492470a6c8b2.jpg'
          : 'https://i.pinimg.com/originals/10/57/de/1057de476a0abd1bc079e444425f7357.jpg'
      }
      
      return NextResponse.json(userData)
    } catch (jwtError) {
      // Fallback to mock data
      const userData = {
        id: 'client-id',
        email: 'client@demo.com',
        name: 'Sarah Johnson',
        role: 'CLIENT',
        avatar: 'https://i.pinimg.com/736x/d6/f9/91/d6f991fa9de5196eeaaa492470a6c8b2.jpg'
      }
      
      return NextResponse.json(userData)
    }

  } catch (error) {
    console.error('Error fetching user data:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
