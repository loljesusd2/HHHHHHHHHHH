
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { writeFile } from 'fs/promises'
import { join } from 'path'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const documentType = formData.get('type') as string
    
    if (!file || !documentType) {
      return NextResponse.json({ error: 'File and type are required' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Invalid file type. Only PDF, JPEG, and PNG files are allowed' 
      }, { status: 400 })
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: 'File size too large. Maximum size is 10MB' 
      }, { status: 400 })
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

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'verification')
    
    try {
      await import('fs').then(fs => {
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true })
        }
      })
    } catch (error) {
      console.error('Error creating uploads directory:', error)
    }

    // Generate unique filename
    const timestamp = Date.now()
    const fileName = `${salon.id}_${documentType}_${timestamp}.${file.name.split('.').pop()}`
    const filePath = join(uploadsDir, fileName)
    
    // Save file
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    // Create verification request
    const verificationRequest = await prisma.verificationRequest.create({
      data: {
        userId: session.user.id,
        documentType,
        documentName: file.name,
        documentUrl: `/uploads/verification/${fileName}`,
        status: 'PENDING'
      }
    })

    return NextResponse.json({
      id: verificationRequest.id,
      type: documentType,
      fileName: file.name,
      status: 'PENDING',
      uploadedAt: verificationRequest.createdAt
    })
  } catch (error) {
    console.error('Document upload API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
