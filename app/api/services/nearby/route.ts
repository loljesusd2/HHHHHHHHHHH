
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const city = searchParams.get('city')
    const state = searchParams.get('state')
    const category = searchParams.get('category')
    const limit = parseInt(searchParams.get('limit') || '20')

    // Build where clause
    let where: any = {
      isActive: true,
      professional: {
        isVerified: true
      }
    }

    // Filter by location if provided
    if (city || state) {
      const locationFilter: any = {}
      if (city) {
        locationFilter.city = {
          contains: city,
          mode: 'insensitive'
        }
      }
      if (state) {
        locationFilter.state = {
          contains: state,
          mode: 'insensitive'
        }
      }
      where.professional = {
        ...where.professional,
        ...locationFilter
      }
    }

    if (category && category !== 'all') {
      where.category = category
    }

    // Get services with professional data
    const services = await prisma.service.findMany({
      where,
      include: {
        professional: {
          include: {
            user: {
              select: {
                name: true
              }
            }
          }
        }
      },
      take: limit,
      orderBy: [
        { professional: { averageRating: 'desc' } },
        { professional: { totalReviews: 'desc' } }
      ]
    })

    return NextResponse.json(services)
  } catch (error) {
    console.error('Services search error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch services' },
      { status: 500 }
    )
  }
}
