
import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const dynamic = "force-dynamic"

export async function DELETE(
  request: NextRequest,
  { params }: { params: { professionalId: string } }
) {
  try {
    const authUser = await getAuthUser()
    
    if (!authUser) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const { professionalId } = params

    await prisma.favorite.deleteMany({
      where: {
        userId: authUser.userId,
        professionalId
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Remove favorite error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
