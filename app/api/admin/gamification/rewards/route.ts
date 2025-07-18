
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const rewards = await prisma.rewardConfiguration.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ rewards })
  } catch (error) {
    console.error('Error fetching rewards:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const data = await request.json()
    
    const reward = await prisma.rewardConfiguration.create({
      data: {
        name: data.name,
        description: data.description,
        pointsRequired: data.pointsRequired,
        rewardType: data.rewardType,
        rewardValue: data.rewardValue,
        isActive: data.isActive,
        maxRedeems: data.maxRedeems
      }
    })

    // Log admin action
    await prisma.adminLog.create({
      data: {
        adminId: (session.user as any).id,
        action: 'reward_create',
        entityType: 'reward',
        entityId: reward.id,
        details: {
          name: reward.name,
          pointsRequired: reward.pointsRequired,
          rewardType: reward.rewardType
        }
      }
    })

    return NextResponse.json({ reward })
  } catch (error) {
    console.error('Error creating reward:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
