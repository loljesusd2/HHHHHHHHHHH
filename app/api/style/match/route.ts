
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthUser()
    if (!authUser) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { analysisId, location } = await request.json()

    if (!analysisId) {
      return NextResponse.json(
        { error: 'Analysis ID required' },
        { status: 400 }
      )
    }

    // Get style analysis
    const analysis = await prisma.styleAnalysis.findUnique({
      where: { id: analysisId },
      include: { user: true }
    })

    if (!analysis) {
      return NextResponse.json(
        { error: 'Analysis not found' },
        { status: 404 }
      )
    }

    // Get all professionals with their portfolios
    const professionals = await prisma.professionalProfile.findMany({
      where: {
        isActive: true,
        user: {
          verificationStatus: 'APPROVED'
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
            verificationStatus: true
          }
        },
        services: {
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            price: true,
            category: true,
            duration: true
          }
        },
        stylePortfolio: {
          where: { isPublic: true },
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      }
    })

    // Calculate match scores
    const matches = professionals.map((prof: any) => {
      let score = 0
      let matchReasons: string[] = []

      // Style tags matching (40%)
      const styleMatches = analysis.styleTags.filter((tag: string) => 
        prof.styleSpecialties?.includes(tag) ||
        prof.stylePortfolio?.some((work: any) => work.styleTags?.includes(tag))
      )
      const styleScore = (styleMatches.length / Math.max(analysis.styleTags.length, 1)) * 40
      score += styleScore
      if (styleMatches.length > 0) {
        matchReasons.push('style_expertise')
      }

      // Experience matching (30%)
      const experienceYears = prof.yearsExperience || 0
      const difficultyBonus = analysis.difficultyLevel === 'EXPERT' ? 5 : 
                             analysis.difficultyLevel === 'HARD' ? 3 : 0
      const experienceScore = Math.min((experienceYears + difficultyBonus) / 10 * 30, 30)
      score += experienceScore
      if (experienceYears >= 3) {
        matchReasons.push('experienced')
      }

      // Reviews and rating (20%)
      const ratingScore = (prof.averageRating / 5) * 20
      score += ratingScore
      if (prof.averageRating >= 4.5) {
        matchReasons.push('highly_rated')
      }

      // Portfolio quality (10%)
      const portfolioScore = Math.min(prof.stylePortfolio.length / 5 * 10, 10)
      score += portfolioScore
      if (prof.stylePortfolio.length >= 3) {
        matchReasons.push('strong_portfolio')
      }

      // Location bonus (if provided)
      if (location && prof.city?.toLowerCase().includes(location.toLowerCase())) {
        score += 5
        matchReasons.push('local_professional')
      }

      return {
        professional: prof,
        matchScore: Math.round(score),
        matchReasons,
        relevantServices: prof.services?.filter((service: any) => {
          const analysisResults = analysis.analysisResults as any;
          return analysisResults?.category ? 
            service.category === analysisResults.category : true;
        }) || []
      }
    })

    // Sort by match score and take top 10
    const topMatches = matches
      .filter((match: any) => match.matchScore > 20)
      .sort((a: any, b: any) => b.matchScore - a.matchScore)
      .slice(0, 10)

    // Save match history
    for (const match of topMatches.slice(0, 5)) {
      await prisma.styleMatchHistory.create({
        data: {
          clientId: authUser.userId,
          professionalId: match.professional.userId,
          styleAnalysisId: analysisId,
          matchScore: match.matchScore,
          matchReasons: match.matchReasons
        }
      })
    }

    // Update analysis with top matches
    await prisma.styleAnalysis.update({
      where: { id: analysisId },
      data: {
        topMatches: topMatches.map((m: any) => ({
          professionalId: m.professional.id,
          score: m.matchScore,
          reasons: m.matchReasons
        }))
      }
    })

    return NextResponse.json({
      matches: topMatches,
      analysisId: analysisId,
      totalFound: topMatches.length
    })

  } catch (error) {
    console.error('Style matching error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
