
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const verified = searchParams.get('verified')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    const where: any = {
      isActive: true,
      professional: {
        isActive: true
      }
    }

    if (category && category !== 'all') {
      where.category = category
    }

    if (verified === 'true') {
      where.professional.user = {
        verificationStatus: 'APPROVED'
      }
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { professional: { businessName: { contains: search, mode: 'insensitive' } } }
      ]
    }

    const services = await prisma.service.findMany({
      where,
      include: {
        professional: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
                verificationStatus: true
              }
            }
          }
        }
      },
      orderBy: [
        { professional: { averageRating: 'desc' } },
        { createdAt: 'desc' }
      ],
      take: limit,
      skip: offset
    })

    return NextResponse.json(services)
  } catch (error) {
    console.error('Services fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
