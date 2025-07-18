
import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const authUser = await getAuthUser()
    
    if (!authUser) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const favorites = await prisma.favorite.findMany({
      where: { userId: authUser.userId },
      include: {
        professional: {
          include: {
            professionalProfile: {
              include: {
                services: {
                  where: { isActive: true },
                  take: 3
                }
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(favorites)
  } catch (error) {
    console.error('Favorites fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthUser()
    
    if (!authUser) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const { professionalId } = await request.json()

    if (!professionalId) {
      return NextResponse.json(
        { error: 'Professional ID is required' },
        { status: 400 }
      )
    }

    // Check if already favorited
    const existing = await prisma.favorite.findUnique({
      where: {
        userId_professionalId: {
          userId: authUser.userId,
          professionalId
        }
      }
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Already in favorites' },
        { status: 400 }
      )
    }

    const favorite = await prisma.favorite.create({
      data: {
        userId: authUser.userId,
        professionalId
      }
    })

    return NextResponse.json(favorite)
  } catch (error) {
    console.error('Add favorite error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
