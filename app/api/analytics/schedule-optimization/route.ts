
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

    // Get professional profile with working hours
    const professional = await prisma.professionalProfile.findFirst({
      where: { userId: (session.user as any).id },
      include: { services: true },
    });

    if (!professional) {
      return NextResponse.json({ error: 'Professional not found' }, { status: 404 });
    }

    // Get booking patterns for last 8 weeks
    const eightWeeksAgo = new Date();
    eightWeeksAgo.setDate(eightWeeksAgo.getDate() - 56);

    const bookings = await prisma.booking.findMany({
      where: {
        professionalId: (session.user as any).id,
        status: 'COMPLETED',
        scheduledDate: { gte: eightWeeksAgo },
      },
      include: {
        service: true,
      },
      orderBy: { scheduledDate: 'asc' },
    });

    // Analyze booking patterns by time slots
    const timeSlotAnalysis = bookings.reduce((acc: any, booking) => {
      const dayOfWeek = booking.scheduledDate.getDay();
      const hour = parseInt(booking.scheduledTime.split(':')[0]);
      const key = `${dayOfWeek}-${hour}`;
      
      if (!acc[key]) {
        acc[key] = {
          dayOfWeek,
          hour,
          bookingCount: 0,
          totalRevenue: 0,
          avgPrice: 0,
        };
      }
      
      acc[key].bookingCount += 1;
      acc[key].totalRevenue += booking.totalAmount;
      acc[key].avgPrice = acc[key].totalRevenue / acc[key].bookingCount;
      
      return acc;
    }, {});

    // Prepare data for AI optimization
    const currentSchedule = professional.workingHours as any || {};
    const timeSlotData = Object.values(timeSlotAnalysis);

    const aiPrompt = `
Analyze the booking patterns and optimize the schedule for maximum revenue.

Current Working Hours:
${JSON.stringify(currentSchedule, null, 2)}

Booking Pattern Analysis:
${JSON.stringify(timeSlotData, null, 2)}

Services Offered:
${professional.services.map(s => `${s.name}: $${s.price} (${s.duration}min)`).join('\n')}

Generate schedule optimization recommendations:
1. Identify high-revenue time slots that should be prioritized
2. Detect low-demand periods that could be optimized
3. Suggest optimal working hours for each day
4. Recommend dynamic pricing strategies
5. Calculate potential revenue increase

Respond in JSON format:
{
  "currentRevenue": number,
  "optimizedRevenue": number,
  "potentialIncrease": number,
  "weeklyPattern": {
    "monday": {"start": "09:00", "end": "17:00", "priority": "high|medium|low"},
    "tuesday": {"start": "09:00", "end": "17:00", "priority": "high|medium|low"},
    "wednesday": {"start": "09:00", "end": "17:00", "priority": "high|medium|low"},
    "thursday": {"start": "09:00", "end": "17:00", "priority": "high|medium|low"},
    "friday": {"start": "09:00", "end": "17:00", "priority": "high|medium|low"},
    "saturday": {"start": "10:00", "end": "16:00", "priority": "high|medium|low"},
    "sunday": {"start": "closed", "end": "closed", "priority": "low"}
  },
  "timeSlotRecommendations": [
    {
      "day": "Monday",
      "timeSlot": "2:00 PM - 4:00 PM",
      "action": "prioritize",
      "reason": "High demand period",
      "potentialRevenue": 150
    }
  ],
  "priceOptimizations": [
    {
      "service": "service name",
      "currentPrice": 100,
      "suggestedPrice": 120,
      "timeSlots": ["peak hours"],
      "expectedIncrease": 20
    }
  ],
  "insights": {
    "bestDays": ["Saturday", "Friday"],
    "peakHours": ["2-4 PM", "6-8 PM"],
    "improvements": ["suggestion1", "suggestion2"]
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
    const optimizationData = JSON.parse(aiResult.choices[0].message.content);

    // Save optimization to database
    const optimization = await prisma.scheduleOptimization.create({
      data: {
        professionalId: professional.id,
        analysisDate: new Date(),
        weeklyPattern: optimizationData.weeklyPattern,
        currentRevenue: optimizationData.currentRevenue,
        optimizedRevenue: optimizationData.optimizedRevenue,
        potentialIncrease: optimizationData.potentialIncrease,
        timeSlotRecommendations: optimizationData.timeSlotRecommendations,
        priceOptimizations: optimizationData.priceOptimizations,
        aiSuggestions: optimizationData.insights,
      },
    });

    return NextResponse.json({
      optimization,
      bookingPatterns: timeSlotData,
    });

  } catch (error) {
    console.error('Error generating schedule optimization:', error);
    return NextResponse.json(
      { error: 'Failed to generate optimization' },
      { status: 500 }
    );
  }
}
