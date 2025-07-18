
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const service = await prisma.service.findUnique({
      where: { 
        id: params.id,
        isActive: true 
      },
      include: {
        professional: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
                phone: true
              }
            },
            services: {
              where: { isActive: true },
              select: {
                id: true,
                name: true,
                price: true,
                images: true
              }
            }
          }
        },
        bookings: {
          include: {
            review: true
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        }
      }
    })

    if (!service) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      )
    }

    // Get reviews for this professional
    const reviews = await prisma.review.findMany({
      where: {
        revieweeId: service.professional.user.id
      },
      include: {
        reviewer: {
          select: {
            id: true,
            name: true,
            avatar: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    })

    return NextResponse.json({
      ...service,
      reviews
    })
  } catch (error) {
    console.error('Service fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
