
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
        businessInsights: {
          where: { status: 'ACTIVE' },
          orderBy: { priority: 'desc' },
        },
      },
    });

    if (!professional) {
      return NextResponse.json({ error: 'Professional not found' }, { status: 404 });
    }

    // Get comprehensive business data
    const [bookings, payments, reviews] = await Promise.all([
      prisma.booking.findMany({
        where: { professionalId: (session.user as any).id },
        include: { service: true, client: true },
        orderBy: { scheduledDate: 'desc' },
        take: 100,
      }),
      prisma.payment.findMany({
        where: { 
          booking: { professionalId: (session.user as any).id },
          status: 'COMPLETED',
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
      }),
      prisma.review.findMany({
        where: { revieweeId: (session.user as any).id },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
    ]);

    // Calculate current business metrics
    const completedBookings = bookings.filter(b => b.status === 'COMPLETED');
    const totalRevenue = completedBookings.reduce((sum, b) => sum + b.totalAmount, 0);
    const avgBookingValue = totalRevenue / completedBookings.length || 0;
    const avgRating = reviews.length > 0 ? 
      reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;

    // Service performance analysis
    const servicePerformance = professional.services.map(service => {
      const serviceBookings = completedBookings.filter(b => b.serviceId === service.id);
      return {
        serviceId: service.id,
        serviceName: service.name,
        price: service.price,
        bookingCount: serviceBookings.length,
        totalRevenue: serviceBookings.reduce((sum, b) => sum + b.totalAmount, 0),
        avgRating: reviews.filter(r => 
          bookings.find(b => b.id === r.bookingId)?.serviceId === service.id
        ).reduce((sum, r, _, arr) => sum + r.rating / arr.length, 0) || 0,
      };
    });

    // Time-based analysis
    const last30Days = bookings.filter(b => 
      new Date(b.scheduledDate) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
    const last60Days = bookings.filter(b => 
      new Date(b.scheduledDate) > new Date(Date.now() - 60 * 24 * 60 * 60 * 1000));

    const aiPrompt = `
Analyze this beauty professional's business data and generate actionable insights.

Professional Profile:
- Business: ${professional.businessName}
- Experience: ${professional.yearsExperience || 'N/A'} years
- Rating: ${avgRating.toFixed(1)}/5 (${reviews.length} reviews)
- Total Revenue: $${totalRevenue.toFixed(2)}
- Avg Booking Value: $${avgBookingValue.toFixed(2)}

Service Performance:
${servicePerformance.map(s => 
  `- ${s.serviceName}: $${s.price} | ${s.bookingCount} bookings | $${s.totalRevenue.toFixed(2)} revenue`
).join('\n')}

Recent Activity:
- Last 30 days: ${last30Days.length} bookings
- Last 60 days: ${last60Days.length} bookings
- Trend: ${last30Days.length > (last60Days.length - last30Days.length) ? 'Growing' : 'Declining'}

Generate 5-8 high-value business insights with specific, actionable recommendations:

Respond in JSON format:
{
  "insights": [
    {
      "type": "PRICING_OPTIMIZATION|SCHEDULE_OPTIMIZATION|SERVICE_RECOMMENDATION|MARKETING_SUGGESTION|RETENTION_STRATEGY|COMPETITIVE_ADVANTAGE",
      "priority": "CRITICAL|HIGH|MEDIUM|LOW",
      "title": "Insight title",
      "description": "Detailed description of the insight",
      "impact": "Expected impact description",
      "currentValue": 100,
      "targetValue": 150,
      "potentialRevenue": 500,
      "implementationCost": 50,
      "confidence": 85,
      "reasoning": "Why this insight is valuable",
      "actionSteps": [
        "Step 1: Specific action",
        "Step 2: Specific action"
      ]
    }
  ],
  "quickWins": [
    {
      "action": "Quick action to take",
      "expectedImpact": "$100/week",
      "effort": "Low"
    }
  ],
  "longTermStrategy": {
    "goals": ["Goal 1", "Goal 2"],
    "timeline": "3-6 months",
    "expectedROI": "200%"
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
        max_tokens: 3000,
      }),
    });

    if (!response.ok) {
      throw new Error('AI analysis failed');
    }

    const aiResult = await response.json();
    const aiAnalysis = JSON.parse(aiResult.choices[0].message.content);

    // Save new insights to database
    const newInsights = await Promise.all(
      aiAnalysis.insights.map((insight: any) =>
        prisma.businessInsight.create({
          data: {
            professionalId: professional.id,
            type: insight.type,
            priority: insight.priority,
            title: insight.title,
            description: insight.description,
            impact: insight.impact,
            currentValue: insight.currentValue,
            targetValue: insight.targetValue,
            potentialRevenue: insight.potentialRevenue,
            implementationCost: insight.implementationCost,
            aiConfidence: insight.confidence,
            aiReasoning: {
              reasoning: insight.reasoning,
              actionSteps: insight.actionSteps,
            },
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          },
        })
      )
    );

    return NextResponse.json({
      insights: newInsights,
      existingInsights: professional.businessInsights,
      businessMetrics: {
        totalRevenue,
        avgBookingValue,
        avgRating,
        totalBookings: completedBookings.length,
        recentTrend: last30Days.length > (last60Days.length - last30Days.length) ? 'up' : 'down',
      },
      servicePerformance,
      recommendations: {
        quickWins: aiAnalysis.quickWins,
        longTermStrategy: aiAnalysis.longTermStrategy,
      },
    });

  } catch (error) {
    console.error('Error generating business insights:', error);
    return NextResponse.json(
      { error: 'Failed to generate insights' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { insightId, action } = body; // action: 'view', 'dismiss', 'implement'

    const insight = await prisma.businessInsight.findFirst({
      where: {
        id: insightId,
        professional: { userId: (session.user as any).id },
      },
    });

    if (!insight) {
      return NextResponse.json({ error: 'Insight not found' }, { status: 404 });
    }

    const updateData: any = {};
    
    if (action === 'view') {
      updateData.viewed = true;
    } else if (action === 'dismiss') {
      updateData.status = 'DISMISSED';
    } else if (action === 'implement') {
      updateData.implemented = true;
      updateData.status = 'IMPLEMENTED';
    }

    const updatedInsight = await prisma.businessInsight.update({
      where: { id: insightId },
      data: updateData,
    });

    return NextResponse.json({ insight: updatedInsight });

  } catch (error) {
    console.error('Error updating insight:', error);
    return NextResponse.json(
      { error: 'Failed to update insight' },
      { status: 500 }
    );
  }
}
