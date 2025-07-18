
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

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'MONTHLY';

    // Get professional profile
    const professional = await prisma.professionalProfile.findFirst({
      where: { userId: (session.user as any).id },
      include: {
        services: true,
        earningsPredictions: {
          where: { predictionType: period as any },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!professional) {
      return NextResponse.json({ error: 'Professional not found' }, { status: 404 });
    }

    // Check if we have recent predictions
    const existingPrediction = professional.earningsPredictions[0];
    const shouldUseCache = existingPrediction && 
      new Date().getTime() - existingPrediction.createdAt.getTime() < 24 * 60 * 60 * 1000; // 24 hours

    if (shouldUseCache) {
      return NextResponse.json({
        prediction: existingPrediction,
        cached: true,
      });
    }

    // Get historical booking data
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const historicalBookings = await prisma.booking.findMany({
      where: {
        professionalId: (session.user as any).id,
        status: 'COMPLETED',
        scheduledDate: { gte: threeMonthsAgo },
      },
      include: {
        service: true,
        payment: true,
      },
      orderBy: { scheduledDate: 'asc' },
    });

    // Prepare data for AI analysis
    const bookingData = historicalBookings.map(booking => ({
      date: booking.scheduledDate.toISOString().split('T')[0],
      dayOfWeek: booking.scheduledDate.getDay(),
      month: booking.scheduledDate.getMonth() + 1,
      amount: booking.totalAmount,
      serviceCategory: booking.service?.category,
      duration: booking.service?.duration,
    }));

    // Call AI for prediction analysis
    const aiPrompt = `
Analyze the following booking data for a beauty professional and generate earnings predictions.

Historical Data:
${JSON.stringify(bookingData, null, 2)}

Professional Info:
- Average Rating: ${professional.averageRating}
- Total Reviews: ${professional.totalReviews}
- Years Experience: ${professional.yearsExperience || 'N/A'}
- Services: ${professional.services.map(s => `${s.name} ($${s.price})`).join(', ')}

Generate a ${period.toLowerCase()} earnings prediction with:
1. Predicted earnings amount
2. Confidence score (0-100)
3. Lower and upper bounds
4. Key factors affecting prediction
5. Actionable insights and recommendations

Respond in JSON format:
{
  "predictedEarnings": number,
  "confidenceScore": number,
  "lowerBound": number,
  "upperBound": number,
  "seasonalityFactor": number,
  "trendFactor": number, 
  "demandFactor": number,
  "insights": {
    "keyFactors": ["factor1", "factor2"],
    "opportunities": ["opportunity1", "opportunity2"],
    "recommendations": ["rec1", "rec2"],
    "risks": ["risk1", "risk2"]
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
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error('AI analysis failed');
    }

    const aiResult = await response.json();
    const predictionData = JSON.parse(aiResult.choices[0].message.content);

    // Save prediction to database
    const prediction = await prisma.earningsPrediction.create({
      data: {
        professionalId: professional.id,
        predictionDate: new Date(),
        predictionType: period as any,
        predictedEarnings: predictionData.predictedEarnings,
        confidenceScore: predictionData.confidenceScore,
        lowerBound: predictionData.lowerBound,
        upperBound: predictionData.upperBound,
        seasonalityFactor: predictionData.seasonalityFactor,
        trendFactor: predictionData.trendFactor,
        demandFactor: predictionData.demandFactor,
        aiInsights: predictionData.insights,
      },
    });

    return NextResponse.json({
      prediction,
      historicalData: bookingData,
      cached: false,
    });

  } catch (error) {
    console.error('Error generating earnings prediction:', error);
    return NextResponse.json(
      { error: 'Failed to generate prediction' },
      { status: 500 }
    );
  }
}
