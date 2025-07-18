
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'
import { uploadFile } from '@/lib/upload'

export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthUser()
    if (!authUser) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('image') as File
    
    if (!file) {
      return NextResponse.json(
        { error: 'No image file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File must be an image' },
        { status: 400 }
      )
    }

    // Upload image
    const imageUrl = await uploadFile(file, 'style-analysis')

    // Convert image to base64 for AI analysis
    const arrayBuffer = await file.arrayBuffer()
    const base64 = Buffer.from(arrayBuffer).toString('base64')
    const dataUri = `data:${file.type};base64,${base64}`

    // Analyze image with AI
    const response = await fetch('https://apps.abacus.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ABACUSAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        messages: [{
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this beauty/style image and extract key style elements. Respond with JSON in this exact format:
{
  "styleTags": ["tag1", "tag2", "tag3"],
  "colorTags": ["color1", "color2"],
  "techniqueTags": ["technique1", "technique2"],
  "difficulty": "EASY|MEDIUM|HARD|EXPERT",
  "estimatedDuration": 90,
  "description": "Brief description of the style",
  "category": "HAIR_STYLING|MAKEUP|MANICURE|PEDICURE|SKINCARE|EYEBROWS|MASSAGE"
}

Style tags examples: balayage, ombre, bob-cut, curls, straight, updo, braids, layers, smoky-eyes, natural-makeup, dramatic, vintage, modern
Color tags examples: blonde, brunette, black, red, highlights, lowlights, ash, warm, cool, platinum
Technique tags examples: layering, texturizing, contouring, blending, precision-cut, color-melting, face-framing`
            },
            {
              type: "image_url",
              image_url: {
                url: dataUri
              }
            }
          ]
        }],
        response_format: { type: "json_object" },
        max_tokens: 500
      })
    })

    if (!response.ok) {
      throw new Error('AI analysis failed')
    }

    const aiResponse = await response.json()
    const analysis = JSON.parse(aiResponse.choices[0].message.content)

    // Save analysis to database
    const styleAnalysis = await prisma.styleAnalysis.create({
      data: {
        userId: authUser.userId,
        originalImageUrl: imageUrl,
        analysisResults: analysis,
        styleTags: analysis.styleTags || [],
        colorTags: analysis.colorTags || [],
        techniqueTags: analysis.techniqueTags || [],
        difficultyLevel: analysis.difficulty || 'MEDIUM',
        estimatedDuration: analysis.estimatedDuration || 60
      }
    })

    return NextResponse.json({
      analysisId: styleAnalysis.id,
      imageUrl: imageUrl,
      ...analysis
    })

  } catch (error) {
    console.error('Style analysis error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
