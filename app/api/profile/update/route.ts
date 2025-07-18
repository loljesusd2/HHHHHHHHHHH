
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      name,
      phone,
      avatar,
      address,
      city,
      state,
      zipCode,
      businessName,
      bio,
      yearsExperience,
      certifications,
      portfolio
    } = body

    // Update user basic information
    const updatedUser = {
      id: session.user.id,
      name: name || session.user.name,
      phone: phone || '',
      avatar: avatar || '',
      email: session.user.email
    }

    // For now, we'll simulate successful update
    // In production, this would update the database
    const response = {
      ...updatedUser,
      clientProfile: session.user.role === 'CLIENT' ? {
        address,
        city,
        state,
        zipCode
      } : null,
      professionalProfile: session.user.role === 'PROFESSIONAL' ? {
        businessName,
        bio,
        yearsExperience: yearsExperience ? parseInt(yearsExperience) : null,
        certifications: certifications || [],
        portfolio: portfolio || [],
        address,
        city,
        state,
        zipCode
      } : null
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
