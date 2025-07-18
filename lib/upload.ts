
import { NextRequest } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

const UPLOAD_DIR = process.env.UPLOAD_DIR || '/tmp/uploads'
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || '5242880') // 5MB

export const ensureUploadDir = async () => {
  if (!existsSync(UPLOAD_DIR)) {
    await mkdir(UPLOAD_DIR, { recursive: true })
  }
}

export const uploadFile = async (file: File, subfolder: string = ''): Promise<string> => {
  try {
    await ensureUploadDir()
    
    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      throw new Error(`File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`)
    }
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Invalid file type. Only JPEG, PNG, and PDF files are allowed.')
    }
    
    // Generate unique filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const extension = path.extname(file.name)
    const filename = `${timestamp}_${randomString}${extension}`
    
    // Create subfolder path
    const uploadPath = subfolder ? path.join(UPLOAD_DIR, subfolder) : UPLOAD_DIR
    if (!existsSync(uploadPath)) {
      await mkdir(uploadPath, { recursive: true })
    }
    
    // Save file
    const filePath = path.join(uploadPath, filename)
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    await writeFile(filePath, buffer)
    
    // Return relative path for storage in database
    return subfolder ? `${subfolder}/${filename}` : filename
    
  } catch (error) {
    console.error('File upload error:', error)
    throw error
  }
}

export const parseFormData = async (request: NextRequest) => {
  try {
    const formData = await request.formData()
    const files: File[] = []
    const fields: Record<string, string> = {}
    
    for (const [key, value] of Array.from(formData.entries())) {
      if (value instanceof File) {
        files.push(value)
      } else {
        fields[key] = value
      }
    }
    
    return { files, fields }
  } catch (error) {
    console.error('Form data parsing error:', error)
    throw error
  }
}
