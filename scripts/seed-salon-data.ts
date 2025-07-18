
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function seedSalonData() {
  console.log('🏢 Seeding salon data...')

  try {
    // Create salon owner
    const salonOwnerEmail = 'salon-owner@example.com'
    let salonOwner = await prisma.user.findUnique({
      where: { email: salonOwnerEmail }
    })

    if (!salonOwner) {
      const hashedPassword = await bcrypt.hash('password123', 12)
      salonOwner = await prisma.user.create({
        data: {
          email: salonOwnerEmail,
          name: 'Maria Rodriguez',
          password: hashedPassword,
          role: 'PROFESSIONAL',
          verificationStatus: 'APPROVED'
        }
      })
    }

    // Create salon owner's professional profile
    let salonOwnerProfile = await prisma.professionalProfile.findUnique({
      where: { userId: salonOwner.id }
    })

    if (!salonOwnerProfile) {
      salonOwnerProfile = await prisma.professionalProfile.create({
        data: {
          userId: salonOwner.id,
          businessName: 'Glamour Studio Miami',
          bio: 'Experienced salon owner with 15+ years in the beauty industry',
          address: '123 Ocean Drive',
          city: 'Miami',
          state: 'FL',
          zipCode: '33139',
          mobileProfessional: false,
          hasStudio: true,
          yearsExperience: 15,
          certifications: ['Advanced Cosmetology', 'Salon Management', 'Color Specialist'],
          portfolio: [
            'https://i.pinimg.com/originals/af/76/83/af76834f5edf7c8a530762e3bbea5236.jpg',
            'https://static.vecteezy.com/system/resources/thumbnails/045/982/145/original/day-in-the-life-businesswoman-s-beauty-salon-experience-with-professional-hair-coloring-and-lifestyle-transformation-high-quality-4k-footage-video.jpg',
            'https://thumbs.dreamstime.com/b/cozy-beauty-salon-waiting-area-comfortable-chairs-soft-music-selection-magazines-creating-relaxing-atmosphere-327333391.jpg'
          ],
          styleSpecialties: ['hair_coloring', 'styling', 'cuts', 'treatments'],
          styleExpertise: {
            hair_color: 98,
            styling: 95,
            cuts: 92,
            treatments: 88
          },
          workingHours: {
            monday: { start: '09:00', end: '19:00', available: true },
            tuesday: { start: '09:00', end: '19:00', available: true },
            wednesday: { start: '09:00', end: '19:00', available: true },
            thursday: { start: '09:00', end: '19:00', available: true },
            friday: { start: '09:00', end: '20:00', available: true },
            saturday: { start: '08:00', end: '18:00', available: true },
            sunday: { start: '10:00', end: '16:00', available: true }
          },
          totalEarnings: 285000,
          averageRating: 4.9,
          totalReviews: 342,
          isVerified: true,
          isActive: true
        }
      })
    }

    // Create salon
    let salon = await prisma.salon.findFirst({
      where: { ownerId: salonOwner.id }
    })

    if (!salon) {
      salon = await prisma.salon.create({
        data: {
          ownerId: salonOwner.id,
          name: 'Glamour Studio Miami',
          description: 'Premier full-service salon offering cutting-edge hair, nail, and beauty services in the heart of Miami Beach',
          address: '123 Ocean Drive',
          city: 'Miami',
          state: 'FL',
          zipCode: '33139',
          phone: '(305) 555-0123',
          email: 'contact@glamourstudiomiami.com',
          website: 'https://glamourstudiomiami.com',
          businessLicense: 'FL-SALON-2023-001',
          isVerified: true,
          verifiedAt: new Date(),
          platformFeeRate: 0.12,
          salonCommissionRate: 0.23,
          settings: {
            timezone: 'America/New_York',
            currency: 'USD',
            bookingAdvanceLimit: 30,
            cancellationPolicy: '24 hours advance notice required',
            paymentMethods: ['CASH', 'CARD'],
            languages: ['en', 'es']
          }
        }
      })
    }

    // Create salon professionals
    const professionalData = [
      {
        name: 'Sofia Chen',
        email: 'sofia.chen@glamourstudio.com',
        businessName: 'Sofia Chen Hair Artistry',
        specialties: ['balayage', 'color_correction', 'precision_cuts'],
        yearsExperience: 8,
        role: 'PROFESSIONAL',
        commissionRate: 0.75,
        portfolio: [
          'https://i.ytimg.com/vi/rgs3jX91tC0/maxresdefault.jpg',
          'https://i.ytimg.com/vi/AbMeLPaebyk/maxresdefault.jpg',
          'https://i.ytimg.com/vi/6QF1HdZzeF0/maxresdefault.jpg?sqp=-oaymwEmCIAKENAF8quKqQMa8AEB-AH-CYAC0AWKAgwIABABGGUgXyhLMA8=&rs=AOn4CLCt6UFbDHCzMtDCEx3UnPEt5zuUpw'
        ]
      },
      {
        name: 'Marcus Johnson',
        email: 'marcus.johnson@glamourstudio.com',
        businessName: 'Marcus Johnson Styling',
        specialties: ['mens_cuts', 'beard_styling', 'hair_treatments'],
        yearsExperience: 6,
        role: 'PROFESSIONAL',
        commissionRate: 0.70,
        portfolio: [
          'https://i.ytimg.com/vi/LdkuajliYeA/maxresdefault.jpg',
          'https://i.ytimg.com/vi/NhIc1BypOkY/maxresdefault.jpg',
          'https://nationalbarbers.org/wp-content/uploads/2023/01/beauty-blog-template-10-1.png'
        ]
      },
      {
        name: 'Isabella Martinez',
        email: 'isabella.martinez@glamourstudio.com',
        businessName: 'Bella Nails & Beauty',
        specialties: ['nail_art', 'manicure', 'pedicure', 'gel_nails'],
        yearsExperience: 5,
        role: 'PROFESSIONAL',
        commissionRate: 0.68,
        portfolio: [
          'https://i.ytimg.com/vi/S4TCmNjU4gk/maxresdefault.jpg',
          'https://i.ytimg.com/vi/ye0T9L8uKGc/maxresdefault.jpg',
          'https://i.ytimg.com/vi/iCQcTUhxAzU/maxresdefault.jpg'
        ]
      },
      {
        name: 'David Kim',
        email: 'david.kim@glamourstudio.com',
        businessName: 'David Kim Color Studio',
        specialties: ['color_specialist', 'highlights', 'ombre'],
        yearsExperience: 10,
        role: 'MANAGER',
        commissionRate: 0.78,
        portfolio: [
          'https://i.ytimg.com/vi/DvwsIYx7Z1Y/maxresdefault.jpg',
          'https://i.ytimg.com/vi/Zh8nkE7kq7s/maxresdefault.jpg',
          'https://i.ytimg.com/vi/imF7FE9Xuk4/maxresdefault.jpg'
        ]
      },
      {
        name: 'Emma Thompson',
        email: 'emma.thompson@glamourstudio.com',
        businessName: 'Emma Thompson Makeup',
        specialties: ['bridal_makeup', 'special_events', 'contouring'],
        yearsExperience: 4,
        role: 'PROFESSIONAL',
        commissionRate: 0.65,
        portfolio: [
          'https://i.ytimg.com/vi/5WO-UI-R7ds/maxresdefault.jpg',
          'https://i.ytimg.com/vi/OSO65OD_djk/maxresdefault.jpg',
          'https://i.ytimg.com/vi/fXp1KhEsFZc/maxres2.jpg?sqp=-oaymwEoCIAKENAF8quKqQMcGADwAQH4AbYIgAKAD4oCDAgAEAEYciBHKDYwDw==&rs=AOn4CLAkG63M-Pl7U38F_FXhxMVQWXk4Sg'
        ]
      },
      {
        name: 'Carlos Rodriguez',
        email: 'carlos.rodriguez@glamourstudio.com',
        businessName: 'Carlos Rodriguez Styling',
        specialties: ['curly_hair', 'natural_hair', 'hair_treatments'],
        yearsExperience: 7,
        role: 'PROFESSIONAL',
        commissionRate: 0.72,
        portfolio: [
          'https://i.ytimg.com/vi/LTzA8kY2M-8/maxresdefault.jpg',
          'https://i.ytimg.com/vi/KAlLzJGCxGM/maxresdefault.jpg',
          'https://i.pinimg.com/736x/c5/e8/5a/c5e85a3e4b5360bb816be3bbeca7cc57.jpg'
        ]
      }
    ]

    for (const profData of professionalData) {
      let user = await prisma.user.findUnique({
        where: { email: profData.email }
      })

      if (!user) {
        const hashedPassword = await bcrypt.hash('password123', 12)
        user = await prisma.user.create({
          data: {
            email: profData.email,
            name: profData.name,
            password: hashedPassword,
            role: 'PROFESSIONAL',
            verificationStatus: 'APPROVED'
          }
        })
      }

      let professionalProfile = await prisma.professionalProfile.findUnique({
        where: { userId: user.id }
      })

      if (!professionalProfile) {
        professionalProfile = await prisma.professionalProfile.create({
          data: {
            userId: user.id,
            businessName: profData.businessName,
            bio: `Experienced beauty professional specializing in ${profData.specialties.join(', ')}`,
            address: '123 Ocean Drive',
            city: 'Miami',
            state: 'FL',
            zipCode: '33139',
            mobileProfessional: false,
            hasStudio: true,
            yearsExperience: profData.yearsExperience,
            certifications: ['State Licensed Cosmetologist', 'Advanced Techniques Certified'],
            portfolio: profData.portfolio,
            styleSpecialties: profData.specialties,
            styleExpertise: {
              [profData.specialties[0]]: Math.floor(Math.random() * 20) + 80,
              [profData.specialties[1] || 'general']: Math.floor(Math.random() * 20) + 75,
              [profData.specialties[2] || 'styling']: Math.floor(Math.random() * 20) + 70
            },
            workingHours: {
              monday: { start: '09:00', end: '17:00', available: true },
              tuesday: { start: '09:00', end: '17:00', available: true },
              wednesday: { start: '09:00', end: '17:00', available: true },
              thursday: { start: '09:00', end: '17:00', available: true },
              friday: { start: '09:00', end: '17:00', available: true },
              saturday: { start: '10:00', end: '16:00', available: true },
              sunday: { start: '10:00', end: '16:00', available: false }
            },
            totalEarnings: Math.floor(Math.random() * 50000) + 30000,
            averageRating: parseFloat((Math.random() * 1.5 + 3.5).toFixed(1)),
            totalReviews: Math.floor(Math.random() * 100) + 50,
            isVerified: true,
            isActive: true
          }
        })
      }

      // Add professional to salon
      await prisma.salonProfessional.upsert({
        where: {
          salonId_professionalId: {
            salonId: salon.id,
            professionalId: professionalProfile.id
          }
        },
        update: {
          isActive: true
        },
        create: {
          salonId: salon.id,
          userId: user.id,
          professionalId: professionalProfile.id,
          role: profData.role as any,
          commissionRate: profData.commissionRate,
          isActive: true
        }
      })
    }

    // Create schedule templates
    const existingTemplate1 = await prisma.salonScheduleTemplate.findFirst({
      where: {
        salonId: salon.id,
        name: 'Standard Hours'
      }
    })

    if (!existingTemplate1) {
      await prisma.salonScheduleTemplate.create({
        data: {
          salonId: salon.id,
          name: 'Standard Hours',
          description: 'Regular salon operating hours',
          isDefault: true,
          schedule: {
            monday: { start: '09:00', end: '17:00', available: true },
            tuesday: { start: '09:00', end: '17:00', available: true },
            wednesday: { start: '09:00', end: '17:00', available: true },
            thursday: { start: '09:00', end: '17:00', available: true },
            friday: { start: '09:00', end: '17:00', available: true },
            saturday: { start: '10:00', end: '16:00', available: true },
            sunday: { start: '10:00', end: '16:00', available: false }
          }
        }
      })
    }

    const existingTemplate2 = await prisma.salonScheduleTemplate.findFirst({
      where: {
        salonId: salon.id,
        name: 'Extended Hours'
      }
    })

    if (!existingTemplate2) {
      await prisma.salonScheduleTemplate.create({
        data: {
          salonId: salon.id,
          name: 'Extended Hours',
          description: 'Extended hours for busy periods',
          isDefault: false,
          schedule: {
            monday: { start: '08:00', end: '19:00', available: true },
            tuesday: { start: '08:00', end: '19:00', available: true },
            wednesday: { start: '08:00', end: '19:00', available: true },
            thursday: { start: '08:00', end: '19:00', available: true },
            friday: { start: '08:00', end: '20:00', available: true },
            saturday: { start: '08:00', end: '18:00', available: true },
            sunday: { start: '10:00', end: '16:00', available: true }
          }
        }
      })
    }

    // Create salon analytics data
    const today = new Date()
    for (let i = 0; i < 30; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() - i)
      
      await prisma.salonAnalytics.upsert({
        where: {
          salonId_date: {
            salonId: salon.id,
            date: date
          }
        },
        update: {},
        create: {
          salonId: salon.id,
          date: date,
          totalRevenue: Math.floor(Math.random() * 2000) + 1000,
          totalBookings: Math.floor(Math.random() * 20) + 10,
          averageRating: parseFloat((Math.random() * 1.5 + 3.5).toFixed(1)),
          clientCount: Math.floor(Math.random() * 15) + 8,
          professionalCount: 6,
          completedBookings: Math.floor(Math.random() * 18) + 8,
          cancelledBookings: Math.floor(Math.random() * 3) + 1,
          newClients: Math.floor(Math.random() * 5) + 2,
          returningClients: Math.floor(Math.random() * 10) + 5
        }
      })
    }

    console.log('✅ Salon data seeded successfully!')
    console.log(`   - Salon: ${salon.name}`)
    console.log(`   - Owner: ${salonOwner.name} (${salonOwner.email})`)
    console.log(`   - Professionals: ${professionalData.length}`)
    console.log(`   - Schedule Templates: 2`)
    console.log(`   - Analytics Data: 30 days`)

  } catch (error) {
    console.error('❌ Error seeding salon data:', error)
    throw error
  }
}

export default seedSalonData

// Run if called directly
if (require.main === module) {
  seedSalonData()
    .then(() => {
      console.log('🎉 Salon data seeding completed!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Salon data seeding failed:', error)
      process.exit(1)
    })
    .finally(async () => {
      await prisma.$disconnect()
    })
}
