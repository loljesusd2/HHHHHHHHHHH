
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthUser()
    if (!authUser || authUser.role !== 'PROFESSIONAL') {
      return NextResponse.json(
        { error: 'Professional access required' },
        { status: 403 }
      )
    }

    const { address, city, state, zipCode } = await request.json()

    if (!address || !city || !zipCode) {
      return NextResponse.json(
        { error: 'Address, city, and zip code are required' },
        { status: 400 }
      )
    }

    // Update professional profile with manual address input
    const updatedProfile = await prisma.professionalProfile.update({
      where: { userId: authUser.userId },
      data: {
        address,
        city,
        state: state || 'FL',
        zipCode
      }
    })

    return NextResponse.json({
      message: 'Location updated successfully',
      profile: updatedProfile
    })

  } catch (error) {
    console.error('Location update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
