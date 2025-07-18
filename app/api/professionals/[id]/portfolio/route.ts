
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const styleTags = searchParams.get('styleTags')?.split(',') || []
    const featured = searchParams.get('featured') === 'true'

    const where: any = {
      professionalId: params.id,
      isPublic: true
    }

    if (category && category !== 'all') {
      where.category = category
    }

    if (styleTags.length > 0) {
      where.styleTags = {
        hasSome: styleTags
      }
    }

    if (featured) {
      where.isFeatured = true
    }

    const portfolio = await prisma.stylePortfolio.findMany({
      where,
      orderBy: [
        { isFeatured: 'desc' },
        { createdAt: 'desc' }
      ],
      include: {
        professional: {
          include: {
            user: {
              select: {
                name: true,
                avatar: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json(portfolio)
  } catch (error) {
    console.error('Portfolio fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // This would be for professionals to add portfolio items
    // Implementation would include auth check for professional ownership
    return NextResponse.json({ message: 'Portfolio creation endpoint' })
  } catch (error) {
    console.error('Portfolio creation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
