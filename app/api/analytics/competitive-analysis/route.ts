
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const professional = await prisma.professionalProfile.findFirst({
      where: { userId: (session.user as any).id },
      include: { 
        services: true,
        user: { 
          select: { 
            id: true, 
            name: true 
          },
          include: {
            reviewsReceived: true
          }
        },
      },
    });

    if (!professional) {
      return NextResponse.json({ error: 'Professional not found' }, { status: 404 });
    }

    // Get competitive data - find professionals in same area and services
    const competitors = await prisma.professionalProfile.findMany({
      where: {
        AND: [
          { id: { not: professional.id } },
          { city: professional.city },
          { state: professional.state },
          { isActive: true },
        ],
      },
      include: {
        services: true,
        user: { 
          select: { 
            id: true, 
            name: true 
          },
          include: {
            reviewsReceived: true
          }
        },
      },
    });

    // Get own booking data for comparison
    const ownBookings = await prisma.booking.findMany({
      where: {
        professionalId: (session.user as any).id,
        status: 'COMPLETED',
        scheduledDate: {
          gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // Last 90 days
        },
      },
      include: { service: true },
    });

    // Calculate market metrics
    const totalCompetitors = competitors.length;
    const allProfessionals = [...competitors, professional];
    
    // Price analysis
    const allServices = allProfessionals.flatMap(p => p.services);
    const servicesByCategory = allServices.reduce((acc: any, service) => {
      if (!acc[service.category]) acc[service.category] = [];
      acc[service.category].push(service.price);
      return acc;
    }, {});

    const marketPrices = Object.entries(servicesByCategory).map(([category, prices]: [string, any]) => ({
      category,
      averagePrice: prices.reduce((sum: number, price: number) => sum + price, 0) / prices.length,
      minPrice: Math.min(...prices),
      maxPrice: Math.max(...prices),
      competitorCount: prices.length,
    }));

    // Rating analysis
    const ratings = allProfessionals
      .map(p => {
        const reviews = p.user?.reviewsReceived || [];
        if (reviews.length === 0) return 0;
        const avgRating = reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / reviews.length;
        return avgRating;
      })
      .filter(r => r > 0);
    const avgMarketRating = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;

    // Calculate own performance metrics
    const ownWeeklyBookings = ownBookings.length / 13; // 90 days = ~13 weeks
    const ownAvgBookingValue = ownBookings.reduce((sum, b) => sum + b.totalAmount, 0) / ownBookings.length || 0;
    
    // Calculate own rating from reviews
    const ownReviews = professional.user?.reviewsReceived || [];
    const ownRating = ownReviews.length > 0 
      ? ownReviews.reduce((sum: number, review: any) => sum + review.rating, 0) / ownReviews.length 
      : 0;

    // Market rank calculation (simplified)
    const professionalsByRating = allProfessionals
      .map(p => {
        const reviews = p.user?.reviewsReceived || [];
        const avgRating = reviews.length > 0 
          ? reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / reviews.length 
          : 0;
        return { ...p, calculatedRating: avgRating };
      })
      .sort((a, b) => (b.calculatedRating || 0) - (a.calculatedRating || 0));
    const marketRank = professionalsByRating.findIndex(p => p.id === professional.id) + 1;

    // Service gap analysis
    const competitorServices = [...new Set(competitors.flatMap(c => 
      c.services.map(s => s.category)))];
    const ownServices = professional.services.map(s => s.category);
    const missingServices = competitorServices.filter(service => 
      !ownServices.includes(service));

    const aiPrompt = `
Analyze competitive position for this beauty professional.

Market Overview:
- Location: ${professional.city}, ${professional.state}
- Total Competitors: ${totalCompetitors}
- Market Rank: #${marketRank} of ${totalCompetitors + 1}

Professional Performance:
- Rating: ${ownRating}/5 (Market avg: ${avgMarketRating.toFixed(1)})
- Weekly Bookings: ${ownWeeklyBookings.toFixed(1)}
- Avg Booking Value: $${ownAvgBookingValue.toFixed(2)}
- Services Offered: ${ownServices.join(', ')}

Market Analysis:
${marketPrices.map(mp => 
  `- ${mp.category}: $${mp.averagePrice.toFixed(2)} avg ($${mp.minPrice}-$${mp.maxPrice})`
).join('\n')}

Service Gaps:
${missingServices.length > 0 ? missingServices.join(', ') : 'None'}

Generate competitive analysis and recommendations:

Respond in JSON format:
{
  "competitivePosition": {
    "marketRank": ${marketRank},
    "totalCompetitors": ${totalCompetitors},
    "ratingPercentile": 85,
    "pricePosition": "ABOVE|AVERAGE|BELOW",
    "overallStrength": "STRONG|AVERAGE|WEAK"
  },
  "strengths": [
    "High customer rating",
    "Competitive pricing",
    "Unique service offering"
  ],
  "weaknesses": [
    "Limited service variety",
    "Lower booking frequency"
  ],
  "opportunities": [
    {
      "opportunity": "Add nail services",
      "marketDemand": "HIGH",
      "expectedRevenue": 500,
      "implementation": "2-4 weeks"
    }
  ],
  "threats": [
    "New competitor opened nearby",
    "Market price pressure"
  ],
  "recommendations": [
    {
      "action": "Specific recommendation",
      "priority": "HIGH|MEDIUM|LOW",
      "impact": "Expected impact",
      "timeline": "Timeline to implement"
    }
  ],
  "marketOpportunities": {
    "underservedAreas": ["Area 1", "Area 2"],
    "pricingOpportunities": ["Service 1 underpriced", "Service 2 overpriced"],
    "serviceGaps": ["Missing service 1", "Missing service 2"]
  }
}
`;

    const response = await fetch('https://apps.abacus.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ABACUSAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        messages: [{ role: 'user', content: aiPrompt }],
        response_format: { type: "json_object" },
        max_tokens: 2500,
      }),
    });

    if (!response.ok) {
      throw new Error('AI analysis failed');
    }

    const aiResult = await response.json();
    const aiAnalysis = JSON.parse(aiResult.choices[0].message.content);

    // Save competitive analysis to database
    const analysis = await prisma.competitiveAnalysis.create({
      data: {
        professionalId: professional.id,
        marketRank,
        totalCompetitors,
        averageMarketPrice: marketPrices.reduce((sum, mp) => sum + mp.averagePrice, 0) / marketPrices.length,
        pricePosition: aiAnalysis.competitivePosition.pricePosition,
        bookingVelocity: ownWeeklyBookings,
        competitorAvgVelocity: 2.5, // Estimated average
        ratingPosition: ((totalCompetitors + 1 - marketRank) / (totalCompetitors + 1)) * 100,
        missingServices,
        opportunityServices: aiAnalysis.opportunities.map((o: any) => o.opportunity),
        serviceRadius: 25, // Estimated 25km radius
        competitorDensity: totalCompetitors / 625, // per sq km (25km radius)
        marketOpportunity: 100 - (totalCompetitors / 10 * 10), // Simplified calculation
        competitiveAdvantages: aiAnalysis.strengths,
        weaknesses: aiAnalysis.weaknesses,
        recommendations: aiAnalysis.recommendations,
        analysisDate: new Date(),
      },
    });

    return NextResponse.json({
      analysis,
      marketData: {
        totalCompetitors,
        marketRank,
        avgMarketRating,
        marketPrices,
        missingServices,
      },
      ownMetrics: {
        weeklyBookings: ownWeeklyBookings,
        avgBookingValue: ownAvgBookingValue,
        rating: ownRating,
        services: ownServices,
      },
      aiInsights: aiAnalysis,
      competitors: competitors.map(c => {
        const reviews = c.user?.reviewsReceived || [];
        const avgRating = reviews.length > 0 
          ? reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / reviews.length 
          : 0;
        return {
          id: c.id,
          businessName: c.businessName,
          rating: avgRating,
          serviceCount: c.services?.length || 0,
          avgPrice: c.services?.length > 0 
            ? c.services.reduce((sum: number, s: any) => sum + s.price, 0) / c.services.length 
            : 0,
        };
      }),
    });

  } catch (error) {
    console.error('Error generating competitive analysis:', error);
    return NextResponse.json(
      { error: 'Failed to generate competitive analysis' },
      { status: 500 }
    );
  }
}
