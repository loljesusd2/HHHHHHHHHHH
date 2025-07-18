
// @ts-ignore
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import seedSalonData from './seed-salon-data'

// @ts-ignore
const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Clear existing data (in correct order for foreign key constraints)
  await prisma.adminLog.deleteMany()
  await prisma.adminMessage.deleteMany()
  await prisma.userBan.deleteMany()
  await prisma.userReward.deleteMany()
  await prisma.rewardConfiguration.deleteMany()
  await prisma.contentManagement.deleteMany()
  
  // Clear salon data
  await prisma.salonWebhook.deleteMany()
  await prisma.salonScheduleTemplate.deleteMany()
  await prisma.salonAnalytics.deleteMany()
  await prisma.salonProfessional.deleteMany()
  await prisma.salon.deleteMany()
  
  // Clear academy data
  await prisma.courseReview.deleteMany()
  await prisma.academyCertification.deleteMany()
  await prisma.quizResult.deleteMany()
  await prisma.courseProgress.deleteMany()
  await prisma.courseEnrollment.deleteMany()
  await prisma.quiz.deleteMany()
  await prisma.lesson.deleteMany()
  await prisma.courseModule.deleteMany()
  await prisma.course.deleteMany()
  await prisma.instructorProfile.deleteMany()
  
  // Clear analytics data
  await prisma.analyticsCache.deleteMany()
  await prisma.competitiveAnalysis.deleteMany()
  await prisma.businessInsight.deleteMany()
  await prisma.clientRetentionAnalysis.deleteMany()
  await prisma.demandAnalytics.deleteMany()
  await prisma.scheduleOptimization.deleteMany()
  await prisma.earningsPrediction.deleteMany()
  
  // Clear gamification data
  await prisma.beautyTimeline.deleteMany()
  await prisma.flashDeal.deleteMany()
  await prisma.referral.deleteMany()
  await prisma.userBadge.deleteMany()
  await prisma.beautyPoints.deleteMany()
  
  // Clear other data
  await prisma.favorite.deleteMany()
  await prisma.verificationRequest.deleteMany()
  await prisma.notification.deleteMany()
  await prisma.payment.deleteMany()
  await prisma.review.deleteMany()  // Delete reviews first
  await prisma.booking.deleteMany()
  await prisma.service.deleteMany()
  await prisma.styleMatchHistory.deleteMany()
  await prisma.stylePortfolio.deleteMany()
  await prisma.styleAnalysis.deleteMany()
  await prisma.professionalProfile.deleteMany()
  await prisma.user.deleteMany()

  // Hash password for test users
  const hashedPassword = await bcrypt.hash('password123', 10)
  
  // Hash password for admin user
  const adminPassword = await bcrypt.hash('BeautyGO2024!', 10)

  // Create test client users
  const client1 = await prisma.user.create({
    data: {
      email: 'maria@client.com',
      password: hashedPassword,
      name: 'María García',
      phone: '+1234567890',
      role: 'CLIENT',
      verificationStatus: 'APPROVED',
      avatar: null
    }
  })

  const client2 = await prisma.user.create({
    data: {
      email: 'ana@client.com',
      password: hashedPassword,
      name: 'Ana López',
      phone: '+1234567891',
      role: 'CLIENT',
      verificationStatus: 'APPROVED',
      avatar: null
    }
  })

  // Create test professional users
  const professional1 = await prisma.user.create({
    data: {
      email: 'sofia@professional.com',
      password: hashedPassword,
      name: 'Sofía Rodríguez',
      phone: '+1234567892',
      role: 'PROFESSIONAL',
      verificationStatus: 'APPROVED',
      avatar: null
    }
  })

  const professional2 = await prisma.user.create({
    data: {
      email: 'carlos@professional.com',
      password: hashedPassword,
      name: 'Carlos Mendoza',
      phone: '+1234567893',
      role: 'PROFESSIONAL',
      verificationStatus: 'APPROVED',
      avatar: null
    }
  })

  // Create admin user
  const admin = await prisma.user.create({
    data: {
      email: 'admin@beautygo.com',
      password: adminPassword,
      name: 'Admin Beauty GO',
      phone: '+1234567894',
      role: 'ADMIN',
      verificationStatus: 'APPROVED',
      avatar: null
    }
  })

  // Create professional profiles
  const professionalProfile1 = await prisma.professionalProfile.create({
    data: {
      userId: professional1.id,
      businessName: 'Salón Sofía',
      bio: 'Especialista en cortes y peinados con más de 5 años de experiencia.',
      address: 'Calle Gran Vía 123',
      city: 'Madrid',
      state: 'Madrid',
      zipCode: '28013',
      mobileProfessional: true,
      hasStudio: false,
      yearsExperience: 5,
      certifications: ['Certificación en Colorimetría', 'Curso de Peinados'],
      portfolio: [],
      styleSpecialties: ['balayage', 'bob-cut', 'layers', 'blonde', 'highlights', 'face-framing'],
      styleExpertise: {
        hair_color: 92,
        hair_cutting: 88,
        styling: 90,
        color_correction: 85
      },
      workingHours: {
        monday: { available: true, start: '09:00', end: '18:00' },
        tuesday: { available: true, start: '09:00', end: '18:00' },
        wednesday: { available: true, start: '09:00', end: '18:00' },
        thursday: { available: true, start: '09:00', end: '18:00' },
        friday: { available: true, start: '09:00', end: '18:00' },
        saturday: { available: true, start: '10:00', end: '16:00' },
        sunday: { available: false, start: '', end: '' }
      },
      averageRating: 4.8,
      totalReviews: 25,
      isVerified: true,
      isActive: true
    }
  })

  const professionalProfile2 = await prisma.professionalProfile.create({
    data: {
      userId: professional2.id,
      businessName: 'Barbería Carlos',
      bio: 'Barbero profesional especializado en cortes masculinos y arreglo de barba.',
      address: 'Avenida de la Constitución 456',
      city: 'Barcelona',
      state: 'Barcelona',
      zipCode: '08002',
      mobileProfessional: true,
      hasStudio: true,
      yearsExperience: 8,
      certifications: ['Certificación en Barbería Clásica', 'Curso de Afeitado'],
      portfolio: [],
      styleSpecialties: ['fade-cut', 'beard-styling', 'classic-cut', 'precision-cut', 'modern'],
      styleExpertise: {
        hair_cutting: 95,
        beard_styling: 92,
        styling: 88,
        precision: 90
      },
      workingHours: {
        monday: { available: true, start: '10:00', end: '19:00' },
        tuesday: { available: true, start: '10:00', end: '19:00' },
        wednesday: { available: true, start: '10:00', end: '19:00' },
        thursday: { available: true, start: '10:00', end: '19:00' },
        friday: { available: true, start: '10:00', end: '19:00' },
        saturday: { available: true, start: '09:00', end: '17:00' },
        sunday: { available: false, start: '', end: '' }
      },
      averageRating: 4.6,
      totalReviews: 18,
      isVerified: true,
      isActive: true
    }
  })

  // Create services
  const service1 = await prisma.service.create({
    data: {
      professionalId: professionalProfile1.id,
      name: 'Corte y Peinado',
      description: 'Corte de cabello profesional con peinado incluido',
      category: 'HAIR_STYLING',
      price: 45.00,
      duration: 90,
      images: [],
      isActive: true
    }
  })

  const service2 = await prisma.service.create({
    data: {
      professionalId: professionalProfile1.id,
      name: 'Tratamiento Capilar',
      description: 'Tratamiento hidratante y nutritivo para el cabello',
      category: 'SKINCARE',
      price: 65.00,
      duration: 120,
      images: [],
      isActive: true
    }
  })

  const service3 = await prisma.service.create({
    data: {
      professionalId: professionalProfile2.id,
      name: 'Corte Masculino + Barba',
      description: 'Corte de cabello masculino con arreglo de barba',
      category: 'HAIR_STYLING',
      price: 35.00,
      duration: 60,
      images: [],
      isActive: true
    }
  })

  const service4 = await prisma.service.create({
    data: {
      professionalId: professionalProfile2.id,
      name: 'Arreglo de Barba',
      description: 'Recorte y perfilado profesional de barba',
      category: 'HAIR_STYLING',
      price: 20.00,
      duration: 30,
      images: [],
      isActive: true
    }
  })

  // Create sample bookings
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  
  const nextWeek = new Date()
  nextWeek.setDate(nextWeek.getDate() + 7)

  const booking1 = await prisma.booking.create({
    data: {
      clientId: client1.id,
      professionalId: professional1.id,
      serviceId: service1.id,
      scheduledDate: tomorrow,
      scheduledTime: '10:00',
      totalAmount: 45.00,
      address: 'Calle Principal 123',
      city: 'Madrid',
      state: 'Madrid',
      zipCode: '28001',
      notes: 'Primera cita, quiero un cambio de look',
      status: 'CONFIRMED'
    }
  })

  const booking2 = await prisma.booking.create({
    data: {
      clientId: client2.id,
      professionalId: professional1.id,
      serviceId: service2.id,
      scheduledDate: nextWeek,
      scheduledTime: '14:00',
      totalAmount: 65.00,
      address: 'Avenida Libertad 456',
      city: 'Barcelona',
      state: 'Barcelona',
      zipCode: '08001',
      notes: 'Tengo el cabello muy dañado, necesito tratamiento',
      status: 'PENDING'
    }
  })

  const booking3 = await prisma.booking.create({
    data: {
      clientId: client1.id,
      professionalId: professional2.id,
      serviceId: service3.id,
      scheduledDate: tomorrow,
      scheduledTime: '16:00',
      totalAmount: 35.00,
      address: 'Plaza Mayor 789',
      city: 'Valencia',
      state: 'Valencia',
      zipCode: '46001',
      notes: 'Corte clásico y barba bien perfilada',
      status: 'IN_PROGRESS'
    }
  })

  // Create payments for completed bookings
  const yesterdayBooking = await prisma.booking.create({
    data: {
      clientId: client2.id,
      professionalId: professional2.id,
      serviceId: service4.id,
      scheduledDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
      scheduledTime: '11:00',
      totalAmount: 20.00,
      address: 'Calle Sol 321',
      city: 'Sevilla',
      state: 'Sevilla',
      zipCode: '41001',
      notes: 'Solo arreglo de barba',
      status: 'COMPLETED'
    }
  })

  const payment1 = await prisma.payment.create({
    data: {
      bookingId: yesterdayBooking.id,
      userId: client2.id,
      amount: 20.00,
      platformFee: 4.00,
      professionalAmount: 16.00,
      paymentMethod: 'CASH',
      status: 'COMPLETED'
    }
  })

  // Create some notifications
  await prisma.notification.create({
    data: {
      userId: professional1.id,
      title: 'Nueva Cita Confirmada',
      message: `Tienes una nueva cita confirmada para mañana a las 10:00`,
      type: 'BOOKING_CONFIRMED',
      isRead: false
    }
  })

  await prisma.notification.create({
    data: {
      userId: client1.id,
      title: 'Cita Confirmada',
      message: `Tu cita de Corte y Peinado está confirmada para mañana`,
      type: 'BOOKING_CONFIRMED',
      isRead: false
    }
  })

  // Create additional specialized professionals
  const makeupArtist = await prisma.user.create({
    data: {
      email: 'lucia@makeup.com',
      password: hashedPassword,
      name: 'Lucía Martínez',
      phone: '+1234567895',
      role: 'PROFESSIONAL',
      verificationStatus: 'APPROVED',
      avatar: 'https://i.pinimg.com/originals/c0/c1/ea/c0c1eaf59d0f460b76110087519012ea.jpg'
    }
  })

  const makeupProfile = await prisma.professionalProfile.create({
    data: {
      userId: makeupArtist.id,
      businessName: 'Lucía Makeup Studio',
      bio: 'Maquilladora profesional especializada en looks de novia, eventos y sesiones fotográficas.',
      address: 'Paseo de la Castellana 789',
      city: 'Madrid',
      state: 'Madrid',
      zipCode: '28020',
      mobileProfessional: true,
      hasStudio: true,
      yearsExperience: 6,
      certifications: ['Certificación en Maquillaje Profesional', 'Curso de Maquillaje Artístico'],
      portfolio: [],
      styleSpecialties: ['smoky-eyes', 'natural-makeup', 'bridal', 'dramatic', 'contouring', 'glamorous'],
      styleExpertise: {
        makeup: 95,
        bridal_makeup: 92,
        dramatic_looks: 88,
        natural_looks: 90,
        contouring: 87
      },
      workingHours: {
        monday: { available: true, start: '09:00', end: '19:00' },
        tuesday: { available: true, start: '09:00', end: '19:00' },
        wednesday: { available: true, start: '09:00', end: '19:00' },
        thursday: { available: true, start: '09:00', end: '19:00' },
        friday: { available: true, start: '09:00', end: '19:00' },
        saturday: { available: true, start: '08:00', end: '20:00' },
        sunday: { available: true, start: '10:00', end: '18:00' }
      },
      averageRating: 4.9,
      totalReviews: 32,
      isVerified: true,
      isActive: true
    }
  })

  const nailTechnician = await prisma.user.create({
    data: {
      email: 'elena@nails.com',
      password: hashedPassword,
      name: 'Elena González',
      phone: '+1234567896',
      role: 'PROFESSIONAL',
      verificationStatus: 'APPROVED',
      avatar: 'https://i.pinimg.com/originals/dd/95/4b/dd954b6f64eabadb2ba0c15b80440551.jpg'
    }
  })

  const nailProfile = await prisma.professionalProfile.create({
    data: {
      userId: nailTechnician.id,
      businessName: 'Elena Nails & Art',
      bio: 'Técnica en uñas especializada en nail art, extensiones y diseños creativos.',
      address: 'Calle Serrano 567',
      city: 'Madrid',
      state: 'Madrid',
      zipCode: '28006',
      mobileProfessional: true,
      hasStudio: false,
      yearsExperience: 4,
      certifications: ['Certificación en Nail Art', 'Curso de Extensiones'],
      portfolio: [],
      styleSpecialties: ['nail-art', 'gel-polish', 'extensions', 'creative-designs', 'geometric', 'metallic'],
      styleExpertise: {
        nail_art: 94,
        gel_application: 90,
        extensions: 88,
        creative_design: 92
      },
      workingHours: {
        monday: { available: true, start: '10:00', end: '18:00' },
        tuesday: { available: true, start: '10:00', end: '18:00' },
        wednesday: { available: true, start: '10:00', end: '18:00' },
        thursday: { available: true, start: '10:00', end: '18:00' },
        friday: { available: true, start: '10:00', end: '18:00' },
        saturday: { available: true, start: '09:00', end: '19:00' },
        sunday: { available: false, start: '', end: '' }
      },
      averageRating: 4.7,
      totalReviews: 28,
      isVerified: true,
      isActive: true
    }
  })

  // Create additional services
  const makeupService1 = await prisma.service.create({
    data: {
      professionalId: makeupProfile.id,
      name: 'Maquillaje de Novia',
      description: 'Maquillaje profesional para bodas con prueba previa incluida',
      category: 'MAKEUP',
      price: 120.00,
      duration: 120,
      images: [],
      isActive: true
    }
  })

  const makeupService2 = await prisma.service.create({
    data: {
      professionalId: makeupProfile.id,
      name: 'Maquillaje de Noche',
      description: 'Maquillaje glamoroso para eventos especiales',
      category: 'MAKEUP',
      price: 80.00,
      duration: 90,
      images: [],
      isActive: true
    }
  })

  const nailService1 = await prisma.service.create({
    data: {
      professionalId: nailProfile.id,
      name: 'Nail Art Personalizado',
      description: 'Diseños únicos de nail art adaptados a tu estilo',
      category: 'MANICURE',
      price: 45.00,
      duration: 90,
      images: [],
      isActive: true
    }
  })

  const nailService2 = await prisma.service.create({
    data: {
      professionalId: nailProfile.id,
      name: 'Extensiones con Diseño',
      description: 'Extensiones de uñas con diseño artístico incluido',
      category: 'MANICURE',
      price: 65.00,
      duration: 120,
      images: [],
      isActive: true
    }
  })

  // Create style portfolios
  // Portfolio for Sofía (Hair stylist)
  await prisma.stylePortfolio.create({
    data: {
      professionalId: professionalProfile1.id,
      title: 'Transformación Balayage Rubio',
      description: 'Balayage profesional de moreno a rubio dorado con mechas naturales',
      beforeImageUrl: 'https://i.pinimg.com/originals/64/4b/50/644b50ec0c15e6f4653e6a8283bc1f32.jpg',
      afterImageUrl: 'https://content.latest-hairstyles.com/wp-content/uploads/blonde-balayage-on-dark-hair-1200x900.jpg',
      styleTags: ['balayage', 'blonde', 'highlights', 'natural'],
      colorTags: ['blonde', 'golden', 'highlights'],
      techniqueTags: ['balayage', 'color-melting', 'face-framing'],
      category: 'HAIR_STYLING',
      completionTime: 180,
      difficulty: 'HARD',
      clientSatisfaction: 5,
      isPublic: true,
      isFeatured: true
    }
  })

  await prisma.stylePortfolio.create({
    data: {
      professionalId: professionalProfile1.id,
      title: 'Corte Bob Moderno',
      description: 'Corte bob asimétrico con capas sutiles para mayor movimiento',
      beforeImageUrl: 'https://i.pinimg.com/originals/9a/f3/27/9af327f112ab685d76562a9083452326.jpg',
      afterImageUrl: 'https://i.pinimg.com/originals/23/bd/fc/23bdfc42bc15e0d83b0ea13370bf8782.jpg',
      styleTags: ['bob-cut', 'layers', 'modern', 'asymmetric'],
      colorTags: ['brunette', 'natural'],
      techniqueTags: ['precision-cut', 'layering', 'texturizing'],
      category: 'HAIR_STYLING',
      completionTime: 75,
      difficulty: 'MEDIUM',
      clientSatisfaction: 5,
      isPublic: true,
      isFeatured: false
    }
  })

  await prisma.stylePortfolio.create({
    data: {
      professionalId: professionalProfile1.id,
      title: 'Efecto Ombré Profesional',
      description: 'Transición suave de moreno a rubio con técnica ombré',
      afterImageUrl: 'https://cdn.abacus.ai/images/fb5f9906-0e46-4fbf-bf8c-94fb667b9390.png',
      styleTags: ['ombre', 'blonde', 'gradient'],
      colorTags: ['blonde', 'brunette', 'gradient'],
      techniqueTags: ['ombre', 'color-melting', 'blending'],
      category: 'HAIR_STYLING',
      completionTime: 150,
      difficulty: 'HARD',
      clientSatisfaction: 5,
      isPublic: true,
      isFeatured: true
    }
  })

  // Portfolio for Lucía (Makeup artist)
  await prisma.stylePortfolio.create({
    data: {
      professionalId: makeupProfile.id,
      title: 'Transformación Natural a Glamorosa',
      description: 'Maquillaje de día transformado en look de noche glamoroso',
      beforeImageUrl: 'https://i.pinimg.com/originals/81/e4/b5/81e4b5eabb37da728b043d503dbc4f8a.jpg',
      afterImageUrl: 'https://i.pinimg.com/originals/c0/c1/ea/c0c1eaf59d0f460b76110087519012ea.jpg',
      styleTags: ['glamorous', 'dramatic', 'evening', 'transformation'],
      colorTags: ['gold', 'bronze', 'warm'],
      techniqueTags: ['contouring', 'highlighting', 'blending'],
      category: 'MAKEUP',
      completionTime: 90,
      difficulty: 'MEDIUM',
      clientSatisfaction: 5,
      isPublic: true,
      isFeatured: true
    }
  })

  await prisma.stylePortfolio.create({
    data: {
      professionalId: makeupProfile.id,
      title: 'Ojos Ahumados Perfectos',
      description: 'Técnica de smoky eyes con acabado profesional',
      beforeImageUrl: 'https://i.pinimg.com/originals/dd/8a/4b/dd8a4b7eaf799cc4e6f711391b94588b.jpg',
      afterImageUrl: 'https://i.pinimg.com/originals/05/2d/b9/052db963e100d24b3d5196a3ada91725.jpg',
      styleTags: ['smoky-eyes', 'dramatic', 'dark', 'intense'],
      colorTags: ['black', 'grey', 'dark'],
      techniqueTags: ['blending', 'layering', 'precision'],
      category: 'MAKEUP',
      completionTime: 60,
      difficulty: 'HARD',
      clientSatisfaction: 5,
      isPublic: true,
      isFeatured: false
    }
  })

  await prisma.stylePortfolio.create({
    data: {
      professionalId: makeupProfile.id,
      title: 'Maquillaje de Novia Romántico',
      description: 'Look nupcial suave y romántico con acabado duradero',
      beforeImageUrl: 'https://i.pinimg.com/originals/a8/bf/c6/a8bfc62cd3f73f7b0f1aec577a7e4730.jpg',
      afterImageUrl: 'https://i.pinimg.com/originals/ba/8c/14/ba8c149f24ae6102d0c353ab5588f680.jpg',
      styleTags: ['bridal', 'natural', 'romantic', 'soft'],
      colorTags: ['pink', 'nude', 'natural'],
      techniqueTags: ['natural-blending', 'long-lasting', 'waterproof'],
      category: 'MAKEUP',
      completionTime: 120,
      difficulty: 'MEDIUM',
      clientSatisfaction: 5,
      isPublic: true,
      isFeatured: true
    }
  })

  // Portfolio for Elena (Nail technician)
  await prisma.stylePortfolio.create({
    data: {
      professionalId: nailProfile.id,
      title: 'Nail Art Geométrico Elegante',
      description: 'Diseño geométrico con acentos metálicos y acabado gel',
      beforeImageUrl: 'https://i.pinimg.com/originals/d2/e8/80/d2e88089c22949aefd7ea6ca934de8ae.jpg',
      afterImageUrl: 'https://i.pinimg.com/originals/66/86/e0/6686e0c7262d49fe8c1f00aaa109fccb.jpg',
      styleTags: ['nail-art', 'geometric', 'metallic', 'elegant'],
      colorTags: ['gold', 'black', 'metallic'],
      techniqueTags: ['precision', 'geometric-design', 'metallic-accents'],
      category: 'MANICURE',
      completionTime: 90,
      difficulty: 'HARD',
      clientSatisfaction: 5,
      isPublic: true,
      isFeatured: true
    }
  })

  await prisma.stylePortfolio.create({
    data: {
      professionalId: nailProfile.id,
      title: 'Extensiones con Nail Art Dramático',
      description: 'Extensiones con diseño intrincado y patrones geométricos',
      afterImageUrl: 'https://cdn.abacus.ai/images/1ef0db27-450f-4f7e-81b9-94b3ddb58316.png',
      styleTags: ['extensions', 'nail-art', 'dramatic', 'intricate'],
      colorTags: ['metallic', 'geometric', 'bold'],
      techniqueTags: ['extensions', 'intricate-design', 'metallic-details'],
      category: 'MANICURE',
      completionTime: 120,
      difficulty: 'EXPERT',
      clientSatisfaction: 5,
      isPublic: true,
      isFeatured: true
    }
  })

  await prisma.stylePortfolio.create({
    data: {
      professionalId: nailProfile.id,
      title: 'Diseño Creativo con Formas',
      description: 'Uñas esculpidas con diseño artístico y colores vibrantes',
      beforeImageUrl: 'https://i.pinimg.com/originals/e3/6e/97/e36e97cee84fd9fe4b16fc1d28591161.jpg',
      afterImageUrl: 'https://i.pinimg.com/originals/93/73/36/937336962fd1f53acfa2145c0d0a693a.jpg',
      styleTags: ['creative-designs', 'sculptured', 'artistic', 'colorful'],
      colorTags: ['vibrant', 'multicolor', 'artistic'],
      techniqueTags: ['sculpting', 'artistic-design', 'color-mixing'],
      category: 'MANICURE',
      completionTime: 150,
      difficulty: 'EXPERT',
      clientSatisfaction: 4,
      isPublic: true,
      isFeatured: false
    }
  })

  // Create sample style analysis
  const sampleAnalysis = await prisma.styleAnalysis.create({
    data: {
      userId: client1.id,
      originalImageUrl: 'https://i.pinimg.com/originals/64/4b/50/644b50ec0c15e6f4653e6a8283bc1f32.jpg',
      analysisResults: {
        styleTags: ['balayage', 'blonde', 'waves'],
        colorTags: ['blonde', 'highlights', 'golden'],
        techniqueTags: ['balayage', 'color-melting'],
        difficulty: 'HARD',
        estimatedDuration: 180,
        description: 'Beautiful balayage blonde transformation with natural highlights',
        category: 'HAIR_STYLING'
      },
      styleTags: ['balayage', 'blonde', 'waves'],
      colorTags: ['blonde', 'highlights', 'golden'],
      techniqueTags: ['balayage', 'color-melting'],
      difficultyLevel: 'HARD',
      estimatedDuration: 180,
      topMatches: [
        { professionalId: professionalProfile1.id, score: 95, reasons: ['style_expertise', 'color_expertise', 'highly_rated'] }
      ]
    }
  })

  console.log('✅ Database seeded successfully!')
  console.log('\n📧 Test User Credentials:')
  console.log('Client 1: maria@client.com / password123')
  console.log('Client 2: ana@client.com / password123')
  console.log('Professional 1 (Hair): sofia@professional.com / password123')
  console.log('Professional 2 (Barber): carlos@professional.com / password123')
  console.log('Professional 3 (Makeup): lucia@makeup.com / password123')
  console.log('Professional 4 (Nails): elena@nails.com / password123')
  console.log('Admin: admin@beautygo.com / password123')
  console.log('\n🎨 Style Matching Features:')
  console.log('- AI-powered image analysis')
  console.log('- Professional portfolios with before/after photos')
  console.log('- Smart matching algorithm')
  console.log('- Style guarantee booking system')
  console.log('- 4 specialized professionals with extensive portfolios')

  // Create historical analytics data for testing
  console.log('\n📊 Creating analytics test data...');
  
  // Get some professionals for analytics data
  const analyticsProfs = await prisma.professionalProfile.findMany({
    take: 2,
    include: {
      user: true,
      services: true,
    },
  });

  // Create historical bookings for analytics (last 4 months)
  const historicalBookings = [];
  const clients = await prisma.user.findMany({ 
    where: { role: 'CLIENT' },
    take: 15,
  });

  for (const prof of analyticsProfs) {
    // Generate 80-120 historical bookings per professional
    const bookingCount = 80 + Math.floor(Math.random() * 40);
    
    for (let i = 0; i < bookingCount; i++) {
      const daysAgo = Math.floor(Math.random() * 120); // Last 4 months
      const bookingDate = new Date();
      bookingDate.setDate(bookingDate.getDate() - daysAgo);
      
      // Simulate seasonal patterns and weekly patterns
      const dayOfWeek = bookingDate.getDay();
      const month = bookingDate.getMonth();
      
      // Higher probability on weekends and certain months
      const weekendBoost = dayOfWeek === 0 || dayOfWeek === 6 ? 1.5 : 1;
      const seasonalBoost = (month >= 4 && month <= 8) ? 1.3 : 1; // Spring/Summer boost
      
      if (Math.random() * weekendBoost * seasonalBoost > 0.3) {
        const service = prof.services[Math.floor(Math.random() * prof.services.length)];
        const client = clients[Math.floor(Math.random() * clients.length)];
        
        // Generate realistic time slots (9 AM to 7 PM)
        const hour = 9 + Math.floor(Math.random() * 10);
        const minute = Math.random() > 0.5 ? '00' : '30';
        const scheduledTime = `${hour.toString().padStart(2, '0')}:${minute}`;
        
        // Add some price variation based on demand patterns
        const basePriceMultiplier = weekendBoost * seasonalBoost;
        const priceVariation = 0.8 + Math.random() * 0.4; // ±20% variation
        const finalPrice = service.price * basePriceMultiplier * priceVariation;
        
        historicalBookings.push({
          clientId: client.id,
          professionalId: prof.userId,
          serviceId: service.id,
          scheduledDate: bookingDate,
          scheduledTime,
          status: 'COMPLETED' as const,
          totalAmount: Math.round(finalPrice * 100) / 100,
          address: `${123 + i} Test St`,
          city: prof.city,
          state: prof.state,
          zipCode: prof.zipCode,
        });
      }
    }
  }

  // Batch create historical bookings
  for (let i = 0; i < historicalBookings.length; i += 20) {
    const batch = historicalBookings.slice(i, i + 20);
    await prisma.booking.createMany({
      data: batch,
    });
  }

  console.log(`📈 Created ${historicalBookings.length} historical bookings`);

  // Create corresponding payments for completed bookings
  const createdBookings = await prisma.booking.findMany({
    where: {
      status: 'COMPLETED',
      payment: null,
    },
  });

  const payments = createdBookings.map((booking: any) => ({
    bookingId: booking.id,
    userId: booking.clientId,
    amount: booking.totalAmount,
    platformFee: Math.round(booking.totalAmount * 0.2 * 100) / 100,
    professionalAmount: Math.round(booking.totalAmount * 0.8 * 100) / 100,
    paymentMethod: 'CASH' as const,
    status: 'COMPLETED' as const,
    transactionId: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  }));

  // Batch create payments
  for (let i = 0; i < payments.length; i += 20) {
    const batch = payments.slice(i, i + 20);
    await prisma.payment.createMany({
      data: batch,
    });
  }

  console.log(`💳 Created ${payments.length} payment records`);

  // Create some reviews for analytics
  const reviewsToCreate = [];
  const completedBookingsWithDetails = await prisma.booking.findMany({
    where: { status: 'COMPLETED' },
    take: Math.floor(createdBookings.length * 0.6), // 60% review rate
  });

  for (const booking of completedBookingsWithDetails) {
    // Weighted random ratings (more high ratings)
    const weights = [0.02, 0.03, 0.1, 0.3, 0.55]; // 1-5 stars
    const random = Math.random();
    let rating = 5;
    let cumulative = 0;
    for (let i = 0; i < weights.length; i++) {
      cumulative += weights[i];
      if (random < cumulative) {
        rating = i + 1;
        break;
      }
    }

    const comments = [
      'Amazing service! Highly recommended.',
      'Professional and skilled. Will book again.',
      'Great experience, very satisfied.',
      'Perfect results, exactly what I wanted.',
      'Quick and efficient service.',
      'Outstanding work and attention to detail.',
      'Friendly and professional service.',
      'Exceeded my expectations!',
    ];

    reviewsToCreate.push({
      bookingId: booking.id,
      reviewerId: booking.clientId,
      revieweeId: booking.professionalId,
      rating,
      comment: rating >= 4 ? comments[Math.floor(Math.random() * comments.length)] : 'Good service.',
    });
  }

  // Batch create reviews
  for (let i = 0; i < reviewsToCreate.length; i += 20) {
    const batch = reviewsToCreate.slice(i, i + 20);
    await prisma.review.createMany({
      data: batch,
    });
  }

  console.log(`⭐ Created ${reviewsToCreate.length} reviews`);

  // Update professional profiles with calculated stats
  for (const prof of analyticsProfs) {
    const profBookings = await prisma.booking.findMany({
      where: { 
        professionalId: prof.userId,
        status: 'COMPLETED',
      },
      include: { payment: true },
    });

    const totalEarnings = profBookings.reduce((sum: number, booking: any) => 
      sum + (booking.payment?.professionalAmount || 0), 0);

    const profReviews = await prisma.review.findMany({
      where: { revieweeId: prof.userId },
    });

    const avgRating = profReviews.length > 0 ?
      profReviews.reduce((sum: number, review: any) => sum + review.rating, 0) / profReviews.length : 0;

    await prisma.professionalProfile.update({
      where: { id: prof.id },
      data: {
        totalEarnings,
        averageRating: Math.round(avgRating * 10) / 10,
        totalReviews: profReviews.length,
      },
    });
  }

  console.log('📊 Updated professional profile statistics');

  // Create Academy instructor (Ariana)
  const arianaInstructor = await prisma.user.create({
    data: {
      email: 'ariana@beautyacademy.com',
      password: hashedPassword,
      name: 'Ariana Martinez',
      phone: '+1234567890',
      role: 'PROFESSIONAL',
      verificationStatus: 'APPROVED',
      avatar: 'https://media.licdn.com/dms/image/v2/D4E03AQE7GTmKOJ8T4Q/profile-displayphoto-shrink_200_200/profile-displayphoto-shrink_200_200/0/1731546023071?e=2147483647&v=beta&t=q-KqJQJDWml-zmHSmBwgcMjYFve76whW8PrRBlihDSo'
    }
  })

  // Create instructor profile
  const arianaProfile = await prisma.instructorProfile.create({
    data: {
      userId: arianaInstructor.id,
      bio: 'Master beauty educator with 15+ years experience. Former celebrity makeup artist and beauty entrepreneur.',
      specializations: ['Hair', 'Makeup', 'Business', 'Advanced Techniques'],
      yearsExperience: 15,
      certifications: [
        'Celebrity Makeup Artist Certification',
        'Advanced Hair Styling Certification',
        'Beauty Business Management',
        'International Beauty Education License'
      ],
      portfolioImages: [
        'https://i.pinimg.com/originals/38/8f/0e/388f0e1a99e0f69730cfc84503fe42e6.png',
        'https://i.pinimg.com/originals/f7/57/32/f757329ca018e06cebea3c3f3a807dc6.jpg',
        'https://i.pinimg.com/736x/57/69/65/576965c26688573de13c5987e3b3852e.jpg'
      ],
      instagram: 'https://instagram.com/ariana_beauty_pro',
      youtube: 'https://youtube.com/@ArianaBeautyAcademy',
      website: 'https://arianabeautyacademy.com',
      totalCourses: 0,
      totalStudents: 0,
      averageRating: 4.9,
      totalEarnings: 0,
      isActive: true
    }
  })

  // Create Academy courses
  const course1 = await prisma.course.create({
    data: {
      instructorId: arianaInstructor.id,
      title: 'Master Hair Styling Fundamentals',
      description: 'Learn the essential techniques for professional hair styling, from basic cuts to advanced color theory.',
      category: 'HAIR_STYLING',
      level: 'BEGINNER',
      price: 89.99,
      originalPrice: 129.99,
      duration: 480,
      thumbnailUrl: 'https://miro.medium.com/v2/resize:fit:1358/1*wjuTTUGzr_RIhIz7cBM4vg.jpeg',
      previewVideoUrl: 'https://cdn.abacus.ai/videos/course-preview-hair.mp4',
      syllabus: 'Complete guide to hair styling fundamentals with hands-on practice',
      tags: ['hair', 'styling', 'beginner', 'fundamentals'],
      badges: ['Bestseller', 'New'],
      requirements: ['Basic understanding of hair types', 'Access to styling tools'],
      skillsYouWillLearn: [
        'Hair cutting techniques',
        'Color theory and application',
        'Styling for different face shapes',
        'Product knowledge and selection'
      ],
      totalStudents: 0,
      averageRating: 4.8,
      totalReviews: 0,
      isActive: true,
      isFeatured: true,
      publishedAt: new Date()
    }
  })

  const course2 = await prisma.course.create({
    data: {
      instructorId: arianaInstructor.id,
      title: 'Professional Makeup Artistry',
      description: 'Master the art of makeup application with techniques used by industry professionals.',
      category: 'MAKEUP',
      level: 'INTERMEDIATE',
      price: 129.99,
      originalPrice: 199.99,
      duration: 600,
      thumbnailUrl: 'https://i.pinimg.com/736x/f2/06/d4/f206d4fb3b5abd48082460846c4c5e97.jpg',
      previewVideoUrl: 'https://cdn.abacus.ai/videos/course-preview-makeup.mp4',
      syllabus: 'Comprehensive makeup artistry course covering all techniques',
      tags: ['makeup', 'artistry', 'professional', 'intermediate'],
      badges: ['Featured', 'Premium'],
      requirements: ['Basic makeup knowledge', 'Makeup kit with essential tools'],
      skillsYouWillLearn: [
        'Advanced makeup techniques',
        'Color theory for makeup',
        'Contouring and highlighting',
        'Special occasion makeup'
      ],
      totalStudents: 0,
      averageRating: 4.9,
      totalReviews: 0,
      isActive: true,
      isFeatured: true,
      publishedAt: new Date()
    }
  })

  const course3 = await prisma.course.create({
    data: {
      instructorId: arianaInstructor.id,
      title: 'Beauty Business Mastery',
      description: 'Build and grow your beauty business with proven strategies and marketing techniques.',
      category: 'BUSINESS_SKILLS',
      level: 'ADVANCED',
      price: 199.99,
      originalPrice: 299.99,
      duration: 720,
      thumbnailUrl: 'https://i.ytimg.com/vi/QAz2_3ceCvw/maxresdefault.jpg',
      previewVideoUrl: 'https://cdn.abacus.ai/videos/course-preview-business.mp4',
      syllabus: 'Complete business course for beauty professionals',
      tags: ['business', 'marketing', 'advanced', 'entrepreneurship'],
      badges: ['Trending', 'Premium'],
      requirements: ['Beauty industry experience', 'Business planning tools'],
      skillsYouWillLearn: [
        'Business strategy and planning',
        'Marketing and social media',
        'Client retention techniques',
        'Financial management'
      ],
      totalStudents: 0,
      averageRating: 4.7,
      totalReviews: 0,
      isActive: true,
      isFeatured: true,
      publishedAt: new Date()
    }
  })

  // Create course modules and lessons
  const module1 = await prisma.courseModule.create({
    data: {
      courseId: course1.id,
      title: 'Introduction to Hair Styling',
      description: 'Learn the basics of hair styling and essential tools',
      order: 1,
      duration: 120,
      isActive: true
    }
  })

  const lesson1 = await prisma.lesson.create({
    data: {
      moduleId: module1.id,
      title: 'Understanding Hair Types and Textures',
      description: 'Learn to identify different hair types and how to work with them',
      order: 1,
      duration: 30,
      videoUrl: 'https://cdn.abacus.ai/videos/lesson-hair-types.mp4',
      videoThumbnail: 'https://lh7-us.googleusercontent.com/7ui-eBJbe9LOlmL3axxORAOGEqLVVkt7pWCeRXblzIp0vBRiPUHvRI6OPobDUzwn_DYfIws48EJesCdFggOaTW_zQXxZLDxnbyUZAZQzdWCrgYof2ew2oJOPdwSl9thIred3YARAVuAOfXQgms6dA44',
      pdfUrl: 'https://cdn.abacus.ai/pdfs/hair-types-guide.pdf',
      downloadableResources: [
        'https://cdn.abacus.ai/resources/hair-type-chart.pdf',
        'https://cdn.abacus.ai/resources/styling-tools-guide.pdf'
      ],
      isFree: true,
      isActive: true
    }
  })

  const lesson2 = await prisma.lesson.create({
    data: {
      moduleId: module1.id,
      title: 'Essential Styling Tools',
      description: 'Overview of must-have tools for professional styling',
      order: 2,
      duration: 25,
      videoUrl: 'https://cdn.abacus.ai/videos/lesson-styling-tools.mp4',
      videoThumbnail: 'https://i.pinimg.com/736x/98/2f/08/982f086129b2d4d034db79774ac2f10d.jpg',
      pdfUrl: 'https://cdn.abacus.ai/pdfs/styling-tools-guide.pdf',
      downloadableResources: [
        'https://cdn.abacus.ai/resources/tool-maintenance-guide.pdf'
      ],
      isFree: false,
      isActive: true
    }
  })

  const lesson3 = await prisma.lesson.create({
    data: {
      moduleId: module1.id,
      title: 'Basic Cutting Techniques',
      description: 'Master the fundamental hair cutting techniques',
      order: 3,
      duration: 45,
      videoUrl: 'https://cdn.abacus.ai/videos/lesson-cutting-basics.mp4',
      videoThumbnail: 'https://i.pinimg.com/originals/46/cb/6a/46cb6afc10a52a085d5bef3fd8a740e3.jpg',
      pdfUrl: 'https://cdn.abacus.ai/pdfs/cutting-techniques-guide.pdf',
      downloadableResources: [
        'https://cdn.abacus.ai/resources/cutting-angles-chart.pdf',
        'https://cdn.abacus.ai/resources/face-shapes-guide.pdf'
      ],
      isFree: false,
      isActive: true
    }
  })

  // Create quiz
  const quiz1 = await prisma.quiz.create({
    data: {
      lessonId: lesson1.id,
      title: 'Hair Types Assessment',
      description: 'Test your knowledge of different hair types and textures',
      questions: [
        {
          question: 'What are the main hair texture categories?',
          options: ['Straight, Wavy, Curly, Coily', 'Thin, Medium, Thick', 'Short, Medium, Long', 'Oily, Normal, Dry'],
          correctAnswer: 0,
          explanation: 'Hair texture is categorized into four main types: straight, wavy, curly, and coily.'
        },
        {
          question: 'Which hair type typically requires the most moisture?',
          options: ['Straight hair', 'Wavy hair', 'Curly hair', 'Coily hair'],
          correctAnswer: 3,
          explanation: 'Coily hair has the tightest curl pattern and typically requires the most moisture due to its structure.'
        },
        {
          question: 'What is hair porosity?',
          options: ['Hair thickness', 'Hair color', 'Hair\'s ability to absorb moisture', 'Hair length'],
          correctAnswer: 2,
          explanation: 'Hair porosity refers to how well your hair is able to absorb and hold moisture.'
        }
      ],
      passingScore: 70,
      maxAttempts: 3,
      timeLimit: 10,
      isActive: true,
      showResults: true
    }
  })

  // Get existing clients for enrollments
  const existingClients = await prisma.user.findMany({
    where: { role: 'CLIENT' },
    take: 2
  })

  if (existingClients.length >= 2) {
    // Create sample enrollments
    const enrollment1 = await prisma.courseEnrollment.create({
      data: {
        userId: existingClients[0].id,
        courseId: course1.id,
        enrollmentType: 'INDIVIDUAL',
        amount: 89.99,
        paymentStatus: 'COMPLETED',
        progressPercentage: 33,
        completedLessons: 1,
        totalLessons: 3,
        isCompleted: false,
        hasLifetimeAccess: true
      }
    })

    const enrollment2 = await prisma.courseEnrollment.create({
      data: {
        userId: existingClients[1].id,
        courseId: course2.id,
        enrollmentType: 'INDIVIDUAL',
        amount: 129.99,
        paymentStatus: 'COMPLETED',
        progressPercentage: 0,
        completedLessons: 0,
        totalLessons: 5,
        isCompleted: false,
        hasLifetimeAccess: true
      }
    })

    // Create course progress
    await prisma.courseProgress.create({
      data: {
        userId: existingClients[0].id,
        lessonId: lesson1.id,
        isCompleted: true,
        watchTime: 1800,
        totalTime: 1800,
        progressPercentage: 100,
        completedAt: new Date()
      }
    })

    // Create quiz result
    await prisma.quizResult.create({
      data: {
        userId: existingClients[0].id,
        quizId: quiz1.id,
        score: 85,
        answers: [0, 3, 2],
        isPassed: true,
        attemptNumber: 1,
        completedAt: new Date()
      }
    })

    // Create certification
    await prisma.academyCertification.create({
      data: {
        userId: existingClients[0].id,
        level: 'BRONZE',
        category: 'HAIR_STYLING',
        coursesCompleted: 1,
        averageScore: 85,
        totalHours: 8,
        certificateUrl: 'https://i.pinimg.com/originals/6f/73/68/6f7368a3375d56c6e4ffbf8ab7a99606.jpg',
        certificateNumber: 'BGA-HAIR-BRONZE-001',
        isVerified: true,
        verificationCode: 'VERIFY123ABC'
      }
    })

    // Create course review
    await prisma.courseReview.create({
      data: {
        userId: existingClients[0].id,
        courseId: course1.id,
        rating: 5,
        title: 'Excellent Course!',
        comment: 'Ariana is an amazing instructor. I learned so much about hair styling fundamentals.',
        isVerified: true,
        helpfulVotes: 3
      }
    })

    // Update stats
    await prisma.instructorProfile.update({
      where: { userId: arianaInstructor.id },
      data: {
        totalCourses: 3,
        totalStudents: 2,
        averageRating: 4.8,
        totalEarnings: 219.98
      }
    })

    await prisma.course.update({
      where: { id: course1.id },
      data: {
        totalStudents: 1,
        averageRating: 5.0,
        totalReviews: 1,
        totalRevenue: 89.99
      }
    })

    await prisma.course.update({
      where: { id: course2.id },
      data: {
        totalStudents: 1,
        totalRevenue: 129.99
      }
    })
  }

  console.log('🎓 Beauty Academy data created successfully!')
  console.log('- 1 instructor profile created (Ariana)')
  console.log('- 3 Academy courses created')
  console.log('- 1 course module created')
  console.log('- 3 lessons created')
  console.log('- 1 quiz created')
  console.log('- Sample enrollments and progress created')

  console.log('\n🤖 AI Analytics Dashboard Features:')
  console.log('- AI-powered earnings predictions')
  console.log('- Smart schedule optimization')
  console.log('- Demand heat maps (temporal & geographic)')
  console.log('- Client retention analysis with AI suggestions')
  console.log('- Business insights and recommendations')
  console.log('- Competitive market analysis')
  console.log('- Historical data for meaningful analytics')

  // ADMIN PANEL CONFIGURATION
  console.log('🔐 Creating admin panel configuration...')
  
  // Create initial content management entries
  await prisma.contentManagement.create({
    data: {
      key: 'app_welcome_message',
      type: 'text',
      value: 'Bienvenido a Beauty GO - Conecta con profesionales de belleza verificados',
      category: 'app',
      updatedBy: admin.id
    }
  })
  
  await prisma.contentManagement.create({
    data: {
      key: 'app_description',
      type: 'text',
      value: 'La plataforma líder para servicios de belleza profesionales en Florida',
      category: 'app',
      updatedBy: admin.id
    }
  })
  
  await prisma.contentManagement.create({
    data: {
      key: 'terms_of_service',
      type: 'text',
      value: 'Términos y condiciones de uso de Beauty GO...',
      category: 'legal',
      updatedBy: admin.id
    }
  })
  
  await prisma.contentManagement.create({
    data: {
      key: 'privacy_policy',
      type: 'text',
      value: 'Política de privacidad de Beauty GO...',
      category: 'legal',
      updatedBy: admin.id
    }
  })
  
  await prisma.contentManagement.create({
    data: {
      key: 'contact_email',
      type: 'text',
      value: 'support@beautygo.com',
      category: 'app',
      updatedBy: admin.id
    }
  })
  
  await prisma.contentManagement.create({
    data: {
      key: 'platform_commission',
      type: 'config',
      value: '0.20',
      category: 'app',
      updatedBy: admin.id
    }
  })
  
  // Create initial reward configurations
  await prisma.rewardConfiguration.create({
    data: {
      name: 'Descuento Primera Cita',
      description: 'Descuento del 20% en tu primera cita',
      pointsRequired: 100,
      rewardType: 'discount',
      rewardValue: JSON.stringify({
        type: 'percentage',
        value: 20,
        maxAmount: 25,
        validFor: 'first_booking'
      }),
      isActive: true,
      maxRedeems: 1000
    }
  })
  
  await prisma.rewardConfiguration.create({
    data: {
      name: 'Servicio Gratis',
      description: 'Servicio gratis hasta $50 USD',
      pointsRequired: 500,
      rewardType: 'service',
      rewardValue: JSON.stringify({
        type: 'fixed_amount',
        value: 50,
        validFor: 'any_service'
      }),
      isActive: true,
      maxRedeems: 100
    }
  })
  
  await prisma.rewardConfiguration.create({
    data: {
      name: 'Cashback Premium',
      description: 'Cashback del 10% en tu próxima cita',
      pointsRequired: 250,
      rewardType: 'cash',
      rewardValue: JSON.stringify({
        type: 'percentage',
        value: 10,
        maxAmount: 15,
        validFor: 'next_booking'
      }),
      isActive: true,
      maxRedeems: 500
    }
  })
  
  // Create sample admin messages
  await prisma.adminMessage.create({
    data: {
      fromId: client1.id,
      subject: 'Problema con mi cita',
      message: 'Hola, tuve un problema con mi cita de ayer. La profesional llegó tarde y no pudo completar el servicio.',
      type: 'support',
      status: 'unread',
      priority: 'high'
    }
  })
  
  await prisma.adminMessage.create({
    data: {
      fromId: professional1.id,
      subject: 'Solicitud de verificación',
      message: 'Hola, he enviado mis documentos para verificación. ¿Cuándo puedo esperar una respuesta?',
      type: 'verification',
      status: 'unread',
      priority: 'normal'
    }
  })
  
  await prisma.adminMessage.create({
    data: {
      fromId: client2.id,
      subject: 'Reportar comportamiento inapropiado',
      message: 'Quiero reportar un comportamiento inapropiado de un profesional durante mi cita.',
      type: 'report',
      status: 'unread',
      priority: 'urgent'
    }
  })
  
  // Create sample admin log entries
  await prisma.adminLog.create({
    data: {
      adminId: admin.id,
      action: 'user_verified',
      entityType: 'user',
      entityId: professional1.id,
      details: {
        reason: 'Documentation approved',
        documents: ['license.pdf', 'certification.pdf']
      }
    }
  })
  
  await prisma.adminLog.create({
    data: {
      adminId: admin.id,
      action: 'content_update',
      entityType: 'content',
      entityId: 'app_welcome_message',
      details: {
        action: 'updated',
        field: 'value',
        oldValue: 'Old welcome message',
        newValue: 'Bienvenido a Beauty GO - Conecta con profesionales de belleza verificados'
      }
    }
  })
  
  console.log('✅ Admin panel configuration created successfully!')
  console.log('- Content management entries created')
  console.log('- Reward configurations created')
  console.log('- Sample admin messages created')
  console.log('- Admin log entries created')
  
  // Seed salon data
  await seedSalonData()
  
  console.log('✅ All seed data created successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
