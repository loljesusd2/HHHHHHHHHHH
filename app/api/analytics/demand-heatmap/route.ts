
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
    const type = searchParams.get('type') || 'temporal'; // 'temporal' or 'geographic'

    const professional = await prisma.professionalProfile.findFirst({
      where: { userId: (session.user as any).id },
    });

    if (!professional) {
      return NextResponse.json({ error: 'Professional not found' }, { status: 404 });
    }

    if (type === 'temporal') {
      // Generate temporal heat map (day/hour demand)
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

      const bookings = await prisma.booking.findMany({
        where: {
          professionalId: (session.user as any).id,
          status: 'COMPLETED',
          scheduledDate: { gte: threeMonthsAgo },
        },
        include: { service: true },
      });

      // Create heat map data structure
      const heatMapData = [];
      for (let day = 0; day < 7; day++) {
        for (let hour = 8; hour < 22; hour++) {
          const dayBookings = bookings.filter(b => 
            b.scheduledDate.getDay() === day &&
            parseInt(b.scheduledTime.split(':')[0]) === hour
          );
          
          heatMapData.push({
            day,
            hour,
            dayName: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][day],
            count: dayBookings.length,
            revenue: dayBookings.reduce((sum, b) => sum + b.totalAmount, 0),
            avgPrice: dayBookings.length > 0 ? 
              dayBookings.reduce((sum, b) => sum + b.totalAmount, 0) / dayBookings.length : 0,
            services: [...new Set(dayBookings.map(b => b.service?.name))],
          });
        }
      }

      return NextResponse.json({
        type: 'temporal',
        data: heatMapData,
        summary: {
          totalBookings: bookings.length,
          totalRevenue: bookings.reduce((sum, b) => sum + b.totalAmount, 0),
          peakDay: heatMapData.reduce((max, curr) => 
            curr.count > max.count ? curr : max, heatMapData[0]),
          peakHour: heatMapData.reduce((max, curr) => 
            curr.count > max.count ? curr : max, heatMapData[0]),
        },
      });

    } else {
      // Generate geographic heat map
      const bookings = await prisma.booking.findMany({
        where: {
          professionalId: (session.user as any).id,
          status: 'COMPLETED',
        },
        select: {
          city: true,
          state: true,
          zipCode: true,
          totalAmount: true,
          service: { select: { category: true } },
        },
      });

      // Aggregate by location
      const locationMap = bookings.reduce((acc: any, booking) => {
        const key = `${booking.city}, ${booking.state}`;
        if (!acc[key]) {
          acc[key] = {
            city: booking.city,
            state: booking.state,
            bookingCount: 0,
            totalRevenue: 0,
            avgRevenue: 0,
            services: new Set(),
          };
        }
        
        acc[key].bookingCount += 1;
        acc[key].totalRevenue += booking.totalAmount;
        acc[key].avgRevenue = acc[key].totalRevenue / acc[key].bookingCount;
        acc[key].services.add(booking.service?.category);
        
        return acc;
      }, {});

      // Convert to array and add demand scores
      const geoData = Object.values(locationMap).map((location: any) => ({
        ...location,
        services: Array.from(location.services),
        demandScore: Math.min(100, (location.bookingCount / bookings.length) * 100),
      }));

      return NextResponse.json({
        type: 'geographic',
        data: geoData,
        summary: {
          totalLocations: geoData.length,
          topLocation: geoData.reduce((max: any, curr: any) => 
            curr.bookingCount > max.bookingCount ? curr : max, geoData[0]),
          coverage: {
            cities: [...new Set(bookings.map(b => b.city))].length,
            states: [...new Set(bookings.map(b => b.state))].length,
          },
        },
      });
    }

  } catch (error) {
    console.error('Error generating demand heatmap:', error);
    return NextResponse.json(
      { error: 'Failed to generate heatmap' },
      { status: 500 }
    );
  }
}
