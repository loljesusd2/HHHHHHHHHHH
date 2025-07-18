
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

    const requests = await prisma.verificationRequest.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            role: true,
            phone: true,
            verificationStatus: true,
            createdAt: true,
            professionalProfile: {
              select: {
                businessName: true,
                bio: true,
                address: true,
                city: true,
                state: true,
                zipCode: true,
                yearsExperience: true,
                certifications: true,
                isVerified: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ requests })
  } catch (error) {
    console.error('Error fetching verification requests:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
