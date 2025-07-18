
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { hashPassword } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    // Check if data already exists
    const existingUsers = await prisma.user.count()
    if (existingUsers > 0) {
      return NextResponse.json({ message: 'Database already seeded' })
    }

    // Create demo users
    const hashedPassword = await hashPassword('password123')

    // Create client user
    const clientUser = await prisma.user.create({
      data: {
        name: 'Sarah Johnson',
        email: 'client@demo.com',
        phone: '+1 (555) 123-4567',
        password: hashedPassword,
        role: 'CLIENT',
        avatar: 'https://i.pinimg.com/736x/d6/f9/91/d6f991fa9de5196eeaaa492470a6c8b2.jpg',
        verificationStatus: 'UNVERIFIED',
        clientProfile: {
          create: {
            address: '123 Main St',
            city: 'Miami',
            state: 'FL',
            zipCode: '33101',
            preferences: ['HAIR_STYLING', 'MAKEUP', 'SKINCARE']
          }
        }
      }
    })

    // Create admin user
    const adminUser = await prisma.user.create({
      data: {
        name: 'Admin User',
        email: 'admin@demo.com',
        phone: '+1 (555) 999-0000',
        password: hashedPassword,
        role: 'ADMIN',
        avatar: 'https://i.pinimg.com/originals/cf/27/61/cf27610284d7f050b8469e2c4e75541c.jpg',
        verificationStatus: 'APPROVED',
        verifiedAt: new Date()
      }
    })

    // Create professional users with services
    const professionals = [
      {
        name: 'Isabella Rodriguez',
        email: 'pro@demo.com',
        businessName: 'Bella Beauty Studio',
        bio: 'Professional hair stylist with 8+ years of experience. Specializing in cuts, colors, and styling for all hair types.',
        city: 'Miami',
        address: '456 Ocean Drive',
        zipCode: '33139',
        latitude: 25.7814,
        longitude: -80.1300,
        verificationStatus: 'APPROVED',
        services: [
          {
            name: 'Hair Cut & Style',
            description: 'Professional haircut with wash, cut, and styling. Includes consultation to find the perfect look for you.',
            category: 'HAIR_STYLING',
            price: 85,
            duration: 90,
            images: ['https://i.pinimg.com/736x/ae/67/7a/ae677a18891ad058e1526f2b087028b6.jpg']
          },
          {
            name: 'Hair Color & Highlights',
            description: 'Full color service including highlights, lowlights, or all-over color with professional products.',
            category: 'HAIR_STYLING',
            price: 150,
            duration: 180,
            images: ['https://i.pinimg.com/750x/a6/bd/bb/a6bdbbf4e0a9862d263a122a9c8559c3.jpg']
          }
        ]
      },
      {
        name: 'Maria Santos',
        email: 'maria@beautygo.com',
        businessName: 'Glamour Nails & Spa',
        bio: 'Certified nail technician and spa specialist. Expert in nail art, gel manicures, and relaxing pedicures.',
        city: 'Orlando',
        address: '789 Beauty Blvd',
        zipCode: '32801',
        services: [
          {
            name: 'Gel Manicure',
            description: 'Long-lasting gel manicure with nail shaping, cuticle care, and your choice of color.',
            category: 'MANICURE',
            price: 45,
            duration: 60,
            images: ['https://i.pinimg.com/originals/d6/f8/53/d6f85340cb3246f2c6bd80767ab50d3c.jpg']
          },
          {
            name: 'Luxury Pedicure',
            description: 'Relaxing pedicure with foot soak, exfoliation, massage, and polish application.',
            category: 'PEDICURE',
            price: 55,
            duration: 75,
            images: ['https://i.pinimg.com/736x/8d/32/a9/8d32a963b56b18e9ac80e5f04fede90b--pedicure-ideas-pedicure-manicure.jpg']
          }
        ]
      },
      {
        name: 'Ashley Thompson',
        email: 'ashley@beautygo.com',
        businessName: 'Flawless Makeup Artistry',
        bio: 'Professional makeup artist specializing in bridal, special events, and photoshoot makeup.',
        city: 'Tampa',
        address: '321 Glam Street',
        zipCode: '33602',
        services: [
          {
            name: 'Bridal Makeup',
            description: 'Complete bridal makeup including trial session, long-lasting application, and touch-up kit.',
            category: 'MAKEUP',
            price: 200,
            duration: 120,
            images: ['https://i.pinimg.com/736x/69/ff/31/69ff31e634a15842ddefdb0ee86ec17a.jpg']
          },
          {
            name: 'Special Event Makeup',
            description: 'Professional makeup for special occasions, parties, or photoshoots.',
            category: 'MAKEUP',
            price: 80,
            duration: 60,
            images: ['https://i.pinimg.com/originals/bb/41/36/bb41366760586ccebff34eb68915aee9.jpg']
          },
          {
            name: 'Microblading',
            description: 'Professional microblading service for natural-looking, fuller eyebrows that last 1-2 years.',
            category: 'EYEBROWS',
            price: 400,
            duration: 150,
            images: ['https://i.ytimg.com/vi/QxKBsRl-M9A/maxresdefault.jpg']
          }
        ]
      },
      {
        name: 'Jennifer Lee',
        email: 'jennifer@beautygo.com',
        businessName: 'Radiant Skin Studio',
        bio: 'Licensed esthetician with expertise in facial treatments, skincare consultations, and anti-aging treatments.',
        city: 'Jacksonville',
        address: '654 Wellness Way',
        zipCode: '32202',
        services: [
          {
            name: 'Deep Cleansing Facial',
            description: 'Comprehensive facial treatment including cleansing, exfoliation, extractions, and moisturizing.',
            category: 'SKINCARE',
            price: 90,
            duration: 90,
            images: ['https://c8.alamy.com/comp/W1K0TW/skin-and-body-care-close-up-of-a-young-woman-getting-spa-treatment-at-beauty-salon-spa-face-massage-facial-beauty-treatment-spa-salon-W1K0TW.jpg']
          },
          {
            name: 'Anti-Aging Treatment',
            description: 'Advanced anti-aging facial with specialized serums and techniques to reduce fine lines.',
            category: 'SKINCARE',
            price: 120,
            duration: 75,
            images: ['https://i.pinimg.com/originals/e6/0a/55/e60a55d5b508e534c447e6e6fb98b636.png']
          }
        ]
      },
      {
        name: 'Sophia Martinez',
        email: 'sophia@beautygo.com',
        businessName: 'Perfect Brows Studio',
        bio: 'Eyebrow specialist offering threading, waxing, tinting, and microblading services.',
        city: 'Fort Lauderdale',
        address: '987 Brow Boulevard',
        zipCode: '33301',
        services: [
          {
            name: 'Eyebrow Threading',
            description: 'Precise eyebrow shaping using traditional threading technique for perfect brows.',
            category: 'EYEBROWS',
            price: 25,
            duration: 30,
            images: ['https://i.pinimg.com/736x/b7/67/d2/b767d26b8064d025c569c706629e6601.jpg']
          },
          {
            name: 'Brow Tinting & Shape',
            description: 'Eyebrow tinting and shaping service to enhance your natural brow color and shape.',
            category: 'EYEBROWS',
            price: 40,
            duration: 45,
            images: ['https://i.pinimg.com/originals/c2/5d/49/c25d49103b00b404885780b2f142aba9.jpg']
          },
          {
            name: 'Microblading',
            description: 'Semi-permanent eyebrow tattooing technique that creates natural-looking hair strokes for fuller brows.',
            category: 'EYEBROWS',
            price: 350,
            duration: 180,
            images: ['https://i.pinimg.com/originals/19/bf/fd/19bffdee7f1a5e65b435bcfedc594148.jpg']
          }
        ]
      },
      {
        name: 'Rachel Williams',
        email: 'rachel@beautygo.com',
        businessName: 'Serenity Massage Therapy',
        bio: 'Licensed massage therapist specializing in relaxation, deep tissue, and therapeutic massage.',
        city: 'St. Petersburg',
        address: '147 Relaxation Road',
        zipCode: '33701',
        services: [
          {
            name: 'Relaxation Massage',
            description: 'Full body relaxation massage to relieve stress and tension using gentle techniques.',
            category: 'MASSAGE',
            price: 100,
            duration: 60,
            images: ['https://i.ytimg.com/vi/PieG3O-HYm4/maxresdefault.jpg']
          },
          {
            name: 'Deep Tissue Massage',
            description: 'Therapeutic deep tissue massage targeting muscle knots and chronic tension.',
            category: 'MASSAGE',
            price: 120,
            duration: 90,
            images: ['https://i.pinimg.com/originals/3e/58/aa/3e58aaaeabdb07bb692793070b772129.jpg']
          }
        ]
      }
    ]

    // Create professionals and their services
    for (const prof of professionals) {
      const professionalUser = await prisma.user.create({
        data: {
          name: prof.name,
          email: prof.email,
          phone: '+1 (555) ' + Math.floor(Math.random() * 900 + 100) + '-' + Math.floor(Math.random() * 9000 + 1000),
          password: hashedPassword,
          role: 'PROFESSIONAL',
          avatar: 'https://i.pinimg.com/originals/10/57/de/1057de476a0abd1bc079e444425f7357.jpg',
          professionalProfile: {
            create: {
              businessName: prof.businessName,
              bio: prof.bio,
              address: prof.address,
              city: prof.city,
              state: 'FL',
              zipCode: prof.zipCode,
              yearsExperience: Math.floor(Math.random() * 10 + 3),
              certifications: ['Licensed Professional', 'State Certified'],
              portfolio: [
                'https://i.pinimg.com/originals/f7/38/94/f73894444e73de3567fad89da1662a1b.jpg',
                'https://i.pinimg.com/originals/92/56/32/925632d02fdb87815271bf146363537a.jpg'
              ],
              workingHours: {
                monday: { start: '09:00', end: '17:00', available: true },
                tuesday: { start: '09:00', end: '17:00', available: true },
                wednesday: { start: '09:00', end: '17:00', available: true },
                thursday: { start: '09:00', end: '17:00', available: true },
                friday: { start: '09:00', end: '17:00', available: true },
                saturday: { start: '10:00', end: '16:00', available: true },
                sunday: { start: '10:00', end: '16:00', available: false }
              },
              averageRating: 4.5 + Math.random() * 0.5,
              totalReviews: Math.floor(Math.random() * 50 + 10),
              isVerified: true,
              isActive: true
            }
          }
        }
      })

      // Create services for this professional
      const professionalProfile = await prisma.professionalProfile.findUnique({
        where: { userId: professionalUser.id }
      })

      for (const service of prof.services) {
        await prisma.service.create({
          data: {
            professionalId: professionalProfile!.id,
            name: service.name,
            description: service.description,
            category: service.category as any,
            price: service.price,
            duration: service.duration,
            images: service.images,
            isActive: true
          }
        })
      }
    }

    // Create some sample bookings and reviews
    const services = await prisma.service.findMany({
      include: { professional: true }
    })

    // Create a few sample bookings
    for (let i = 0; i < 5; i++) {
      const service = services[Math.floor(Math.random() * services.length)]
      const bookingDate = new Date()
      bookingDate.setDate(bookingDate.getDate() + Math.floor(Math.random() * 30 - 15))

      const booking = await prisma.booking.create({
        data: {
          clientId: clientUser.id,
          professionalId: service.professional.userId,
          serviceId: service.id,
          scheduledDate: bookingDate,
          scheduledTime: '14:00',
          status: Math.random() > 0.3 ? 'COMPLETED' : 'CONFIRMED',
          totalAmount: service.price,
          address: '123 Client Street',
          city: 'Miami',
          state: 'FL',
          zipCode: '33101',
          notes: 'Looking forward to the service!'
        }
      })

      // Create payment for the booking
      await prisma.payment.create({
        data: {
          bookingId: booking.id,
          userId: clientUser.id,
          amount: service.price,
          platformFee: service.price * 0.2,
          professionalAmount: service.price * 0.8,
          paymentMethod: 'CASH',
          status: 'COMPLETED'
        }
      })

      // Create review for completed bookings
      if (booking.status === 'COMPLETED') {
        await prisma.review.create({
          data: {
            bookingId: booking.id,
            reviewerId: clientUser.id,
            revieweeId: service.professional.userId,
            rating: Math.floor(Math.random() * 2 + 4), // 4-5 stars
            comment: [
              'Amazing service! Highly recommend.',
              'Professional and skilled. Will book again.',
              'Exceeded my expectations. Great experience!',
              'Perfect results. Very happy with the service.',
              'Excellent work and friendly service.'
            ][Math.floor(Math.random() * 5)]
          }
        })
      }
    }

    return NextResponse.json({ 
      message: 'Database seeded successfully',
      users: await prisma.user.count(),
      services: await prisma.service.count(),
      bookings: await prisma.booking.count()
    })
  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json(
      { error: 'Failed to seed database' },
      { status: 500 }
    )
  }
}
