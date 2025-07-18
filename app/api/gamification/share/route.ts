
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'
import { awardPoints } from '@/lib/gamification-utils'
import { POINT_VALUES } from '@/lib/types'

const prisma = new PrismaClient()

export const dynamic = 'force-dynamic'

// POST /api/gamification/share - Generate shareable content and award points
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { type, bookingId, timelineId, serviceId, customMessage } = await request.json()

    let shareData: {
      title?: string
      description?: string
      hashtags?: string[]
      professionalName?: string
      serviceName?: string
      imageUrl?: string
      referralCode?: string
    } = {}

    if (type === 'booking_result' && bookingId) {
      // Share booking result
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
          service: {
            include: {
              professional: {
                include: {
                  user: true
                }
              }
            }
          },
          client: true
        }
      })

      if (!booking || booking.clientId !== session.user.id) {
        return NextResponse.json({ error: 'Booking not found or unauthorized' }, { status: 404 })
      }

      shareData = {
        title: `Amazing ${booking.service.name} experience!`,
        description: `Just had an incredible ${booking.service.name} session with ${booking.service.professional.businessName}. Beauty GO connected me with the perfect professional! 💄✨`,
        hashtags: ['#BeautyGO', '#BeautyTransformation', '#' + booking.service.category.toLowerCase()],
        professionalName: booking.service.professional.businessName,
        serviceName: booking.service.name,
        imageUrl: booking.service.images?.[0] || '/beauty-go-share.jpg'
      }
    } else if (type === 'timeline_photo' && timelineId) {
      // Share timeline photo
      const timeline = await prisma.beautyTimeline.findUnique({
        where: { id: timelineId },
        include: {
          booking: {
            include: {
              service: {
                include: {
                  professional: {
                    include: {
                      user: true
                    }
                  }
                }
              }
            }
          }
        }
      })

      if (!timeline || timeline.userId !== session.user.id) {
        return NextResponse.json({ error: 'Timeline entry not found or unauthorized' }, { status: 404 })
      }

      shareData = {
        title: 'Check out my beauty transformation!',
        description: `My amazing transformation by ${timeline.booking.service.professional.businessName}. Beauty GO helps you find the perfect match for your style! 🌟`,
        hashtags: ['#BeautyGO', '#BeautyTransformation', '#GlowUp', '#' + timeline.booking.service.category.toLowerCase()],
        professionalName: timeline.booking.service.professional.businessName,
        serviceName: timeline.booking.service.name,
        imageUrl: timeline.afterPhoto || timeline.beforePhoto || '/beauty-go-share.jpg'
      }
    } else if (type === 'service_promotion' && serviceId) {
      // Share service promotion
      const service = await prisma.service.findUnique({
        where: { id: serviceId },
        include: {
          professional: {
            include: {
              user: true
            }
          }
        }
      })

      if (!service) {
        return NextResponse.json({ error: 'Service not found' }, { status: 404 })
      }

      shareData = {
        title: `Check out this amazing ${service.name} service!`,
        description: `${service.professional.businessName} offers incredible ${service.name} services. Book now on Beauty GO! Starting at $${service.price} 💅`,
        hashtags: ['#BeautyGO', '#BeautyServices', '#' + service.category.toLowerCase()],
        professionalName: service.professional.businessName,
        serviceName: service.name,
        imageUrl: service.images?.[0] || '/beauty-go-share.jpg'
      }
    } else if (type === 'app_referral') {
      // Share app referral
      const user = await prisma.user.findUnique({
        where: { id: session.user.id }
      })

      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }

      // Get user's referral code
      const referral = await prisma.referral.findFirst({
        where: { referrerId: session.user.id },
        orderBy: { createdAt: 'desc' }
      })

      shareData = {
        title: 'Join me on Beauty GO!',
        description: `I'm loving Beauty GO for all my beauty needs! Professional services, verified providers, and amazing results. Use my code ${referral?.code || 'BEAUTY'} to get started! 💄✨`,
        hashtags: ['#BeautyGO', '#BeautyServices', '#ReferralCode'],
        imageUrl: '/beauty-go-referral.jpg',
        referralCode: referral?.code
      }
    } else {
      return NextResponse.json({ error: 'Invalid share type or missing data' }, { status: 400 })
    }

    // Add custom message if provided
    if (customMessage) {
      shareData = {
        ...shareData,
        description: customMessage
      }
    }

    // Award points for sharing
    await awardPoints(
      session.user.id,
      'social_share',
      POINT_VALUES.SOCIAL_SHARE,
      `Shared ${type} on social media`,
      bookingId
    )

    // Generate shareable URLs
    const encodedText = encodeURIComponent(`${shareData.title}\n\n${shareData.description}\n\n${shareData.hashtags?.join(' ')}`)
    const encodedUrl = encodeURIComponent('https://beautygo.app')
    
    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
      instagram: `https://www.instagram.com/`, // Instagram doesn't support direct sharing URLs
      whatsapp: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}&title=${encodeURIComponent(shareData.title)}&summary=${encodeURIComponent(shareData.description)}`
    }

    return NextResponse.json({
      shareData,
      shareUrls,
      pointsAwarded: POINT_VALUES.SOCIAL_SHARE
    })
  } catch (error) {
    console.error('Error generating share content:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET /api/gamification/share/watermark - Generate watermarked image
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const imageUrl = searchParams.get('image')
    const text = searchParams.get('text') || 'Beauty GO'
    const professionalName = searchParams.get('professional')

    if (!imageUrl) {
      return NextResponse.json({ error: 'Image URL required' }, { status: 400 })
    }

    // In a real implementation, you would use a service like Cloudinary, 
    // or implement image processing with canvas/sharp
    // For now, return the original image URL with metadata for client-side watermarking
    
    const watermarkConfig = {
      originalImage: imageUrl,
      watermarkText: text,
      professionalName: professionalName,
      logoUrl: '/logo-watermark.png',
      position: 'bottom-right',
      opacity: 0.8,
      fontSize: 14,
      fontColor: '#ffffff',
      backgroundColor: 'rgba(0,0,0,0.5)',
      padding: 8
    }

    return NextResponse.json(watermarkConfig)
  } catch (error) {
    console.error('Error generating watermark config:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
