
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
    });

    if (!professional) {
      return NextResponse.json({ error: 'Professional not found' }, { status: 404 });
    }

    // Get all completed bookings
    const allBookings = await prisma.booking.findMany({
      where: {
        professionalId: (session.user as any).id,
        status: 'COMPLETED',
      },
      include: {
        client: true,
        service: true,
      },
      orderBy: { scheduledDate: 'asc' },
    });

    // Analyze client patterns
    const clientMap = allBookings.reduce((acc: any, booking) => {
      const clientId = booking.clientId;
      if (!acc[clientId]) {
        acc[clientId] = {
          clientId,
          clientName: booking.client?.name,
          clientEmail: booking.client?.email,
          bookings: [],
          totalSpent: 0,
          firstVisit: booking.scheduledDate,
          lastVisit: booking.scheduledDate,
        };
      }
      
      acc[clientId].bookings.push({
        date: booking.scheduledDate,
        amount: booking.totalAmount,
        service: booking.service?.name,
      });
      acc[clientId].totalSpent += booking.totalAmount;
      
      if (booking.scheduledDate < acc[clientId].firstVisit) {
        acc[clientId].firstVisit = booking.scheduledDate;
      }
      if (booking.scheduledDate > acc[clientId].lastVisit) {
        acc[clientId].lastVisit = booking.scheduledDate;
      }
      
      return acc;
    }, {});

    const clients = Object.values(clientMap) as any[];

    // Calculate retention metrics
    const totalClients = clients.length;
    const returningClients = clients.filter(c => c.bookings.length > 1).length;
    const retentionRate = totalClients > 0 ? (returningClients / totalClients) * 100 : 0;

    // Calculate average time between visits
    const timeBetweenVisits = clients
      .filter(c => c.bookings.length > 1)
      .map(c => {
        const sortedBookings = c.bookings.sort((a: any, b: any) => 
          new Date(a.date).getTime() - new Date(b.date).getTime());
        const intervals = [];
        for (let i = 1; i < sortedBookings.length; i++) {
          const diff = new Date(sortedBookings[i].date).getTime() - 
                      new Date(sortedBookings[i-1].date).getTime();
          intervals.push(diff / (1000 * 60 * 60 * 24)); // days
        }
        return intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
      });

    const avgTimeBetweenVisits = timeBetweenVisits.length > 0 ?
      timeBetweenVisits.reduce((sum, time) => sum + time, 0) / timeBetweenVisits.length : 0;

    // Segment clients
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

    const newClients = clients.filter(c => 
      new Date(c.firstVisit) > thirtyDaysAgo).length;
    const regularClients = clients.filter(c => 
      c.bookings.length >= 3 && new Date(c.lastVisit) > sixtyDaysAgo).length;
    const atRiskClients = clients.filter(c => 
      new Date(c.lastVisit) > sixtyDaysAgo && new Date(c.lastVisit) <= ninetyDaysAgo).length;
    const lostClients = clients.filter(c => 
      new Date(c.lastVisit) <= ninetyDaysAgo).length;

    // Calculate lifetime values
    const lifetimeValues = clients.map(c => c.totalSpent);
    const avgLifetimeValue = lifetimeValues.length > 0 ?
      lifetimeValues.reduce((sum, val) => sum + val, 0) / lifetimeValues.length : 0;
    const topClientValue = lifetimeValues.length > 0 ? Math.max(...lifetimeValues) : 0;

    // Prepare data for AI analysis
    const clientsAtRisk = clients.filter(c => 
      new Date(c.lastVisit) > sixtyDaysAgo && new Date(c.lastVisit) <= ninetyDaysAgo)
      .slice(0, 10); // Top 10 at-risk clients

    const aiPrompt = `
Analyze the client retention data and provide personalized strategies.

Retention Metrics:
- Total Clients: ${totalClients}
- Returning Clients: ${returningClients}
- Retention Rate: ${retentionRate.toFixed(1)}%
- Average Time Between Visits: ${avgTimeBetweenVisits.toFixed(1)} days
- Average Lifetime Value: $${avgLifetimeValue.toFixed(2)}

Client Segmentation:
- New Clients (last 30 days): ${newClients}
- Regular Clients (3+ visits, active): ${regularClients}
- At-Risk Clients (60-90 days inactive): ${atRiskClients}
- Lost Clients (90+ days inactive): ${lostClients}

At-Risk Clients Details:
${clientsAtRisk.map(c => `- ${c.clientName}: Last visit ${Math.floor((now.getTime() - new Date(c.lastVisit).getTime()) / (1000 * 60 * 60 * 24))} days ago, Total spent: $${c.totalSpent}`).join('\n')}

Generate retention improvement strategies:
1. Personalized follow-up suggestions for at-risk clients
2. General retention strategies
3. Upselling opportunities for regular clients
4. Re-engagement tactics for lost clients

Respond in JSON format:
{
  "retentionStrategies": [
    {
      "strategy": "strategy name",
      "description": "detailed description",
      "targetSegment": "new|regular|at-risk|lost",
      "expectedImpact": "high|medium|low",
      "implementation": "how to implement"
    }
  ],
  "followUpSuggestions": [
    {
      "clientName": "client name",
      "lastVisit": "date",
      "suggestion": "specific action to take",
      "urgency": "high|medium|low",
      "expectedRevenue": 100
    }
  ],
  "generalRecommendations": [
    "recommendation1",
    "recommendation2"
  ],
  "kpiTargets": {
    "targetRetentionRate": 75,
    "targetAvgTimeBetween": 45,
    "targetLifetimeValue": 500
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
    const aiAnalysis = JSON.parse(aiResult.choices[0].message.content);

    // Save analysis to database
    const analysis = await prisma.clientRetentionAnalysis.create({
      data: {
        professionalId: professional.id,
        totalClients,
        returningClients,
        retentionRate,
        averageTimeBetweenVisits: avgTimeBetweenVisits,
        newClients,
        regularClients,
        atRiskClients,
        lostClients,
        averageLifetimeValue: avgLifetimeValue,
        topClientValue,
        retentionStrategies: aiAnalysis.retentionStrategies,
        followUpSuggestions: aiAnalysis.followUpSuggestions,
        analysisDate: new Date(),
      },
    });

    return NextResponse.json({
      analysis,
      clientSegments: {
        new: newClients,
        regular: regularClients,
        atRisk: atRiskClients,
        lost: lostClients,
      },
      metrics: {
        totalClients,
        returningClients,
        retentionRate,
        avgTimeBetweenVisits,
        avgLifetimeValue,
        topClientValue,
      },
      recommendations: aiAnalysis,
      atRiskClients: clientsAtRisk,
    });

  } catch (error) {
    console.error('Error generating retention analysis:', error);
    return NextResponse.json(
      { error: 'Failed to generate retention analysis' },
      { status: 500 }
    );
  }
}
