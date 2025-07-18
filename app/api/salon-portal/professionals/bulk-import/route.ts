
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's salon
    const salon = await prisma.salon.findFirst({
      where: {
        ownerId: session.user.id
      }
    })

    if (!salon) {
      return NextResponse.json({ error: 'Salon not found' }, { status: 404 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    const csvText = await file.text()
    const lines = csvText.split('\n')
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
    
    const results = {
      total: 0,
      successful: 0,
      failed: 0,
      errors: [] as Array<{ row: number; email: string; error: string }>
    }

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue

      results.total++
      
      try {
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''))
        const professionalData: { [key: string]: string } = {}
        
        headers.forEach((header, index) => {
          professionalData[header] = values[index] || ''
        })

        // Validate required fields
        if (!professionalData.name || !professionalData.email) {
          results.failed++
          results.errors.push({
            row: i + 1,
            email: professionalData.email || 'unknown',
            error: 'Missing required fields (name, email)'
          })
          continue
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
          where: { email: professionalData.email }
        })

        let user
        if (existingUser) {
          user = existingUser
        } else {
          // Create new user
          const hashedPassword = await bcrypt.hash('TempPassword123!', 12)
          user = await prisma.user.create({
            data: {
              email: professionalData.email,
              name: professionalData.name,
              password: hashedPassword,
              role: 'PROFESSIONAL'
            }
          })
        }

        // Create or update professional profile
        const professionalProfile = await prisma.professionalProfile.upsert({
          where: { userId: user.id },
          update: {
            businessName: professionalData.businessName || professionalData.name,
            address: professionalData.address || '',
            city: professionalData.city || '',
            state: professionalData.state || '',
            zipCode: professionalData.zipCode || '',
            yearsExperience: parseInt(professionalData.yearsExperience) || 0,
            certifications: professionalData.certifications ? professionalData.certifications.split(';') : []
          },
          create: {
            userId: user.id,
            businessName: professionalData.businessName || professionalData.name,
            address: professionalData.address || '',
            city: professionalData.city || '',
            state: professionalData.state || '',
            zipCode: professionalData.zipCode || '',
            yearsExperience: parseInt(professionalData.yearsExperience) || 0,
            certifications: professionalData.certifications ? professionalData.certifications.split(';') : [],
            workingHours: {
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
            role: 'PROFESSIONAL',
            commissionRate: 0.70,
            isActive: true
          }
        })

        results.successful++
      } catch (error) {
        results.failed++
        results.errors.push({
          row: i + 1,
          email: 'unknown',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    return NextResponse.json(results)
  } catch (error) {
    console.error('Bulk import API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
