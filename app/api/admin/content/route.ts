
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

    const content = await prisma.contentManagement.findMany({
      include: {
        admin: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    return NextResponse.json({ content })
  } catch (error) {
    console.error('Error fetching content:', error)
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
    
    const content = await prisma.contentManagement.create({
      data: {
        key: data.key,
        type: data.type,
        value: data.value,
        category: data.category,
        updatedBy: (session.user as any).id
      }
    })

    // Log admin action
    await prisma.adminLog.create({
      data: {
        adminId: (session.user as any).id,
        action: 'content_create',
        entityType: 'content',
        entityId: content.id,
        details: {
          key: content.key,
          type: content.type,
          category: content.category
        }
      }
    })

    return NextResponse.json({ content })
  } catch (error) {
    console.error('Error creating content:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
