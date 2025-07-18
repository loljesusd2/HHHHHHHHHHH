
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, TrendingUp, Calendar, DollarSign, Settings, Lightbulb } from 'lucide-react';
import { motion } from 'framer-motion';

interface ScheduleOptimizationData {
  optimization: {
    currentRevenue: number;
    optimizedRevenue: number;
    potentialIncrease: number;
    weeklyPattern: {
      [key: string]: {
        start: string;
        end: string;
        priority: 'high' | 'medium' | 'low';
      };
    };
    timeSlotRecommendations: Array<{
      day: string;
      timeSlot: string;
      action: string;
      reason: string;
      potentialRevenue: number;
    }>;
    priceOptimizations: Array<{
      service: string;
      currentPrice: number;
      suggestedPrice: number;
      timeSlots: string[];
      expectedIncrease: number;
    }>;
    aiSuggestions: {
      bestDays: string[];
      peakHours: string[];
      improvements: string[];
    };
  };
  bookingPatterns: Array<{
    dayOfWeek: number;
    hour: number;
    bookingCount: number;
    totalRevenue: number;
    avgPrice: number;
  }>;
}

export default function ScheduleOptimization() {
  const [data, setData] = useState<ScheduleOptimizationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchOptimization = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/analytics/schedule-optimization');
      if (!response.ok) throw new Error('Failed to fetch optimization');
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError('Failed to load schedule optimization');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOptimization();
  }, []);

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  const generateHeatMapData = () => {
    if (!data?.bookingPatterns) return [];
    
    const heatMap = [];
    for (let day = 0; day < 7; day++) {
      for (let hour = 8; hour < 22; hour++) {
        const pattern = data.bookingPatterns.find(p => p.dayOfWeek === day && p.hour === hour);
        heatMap.push({
          day,
          hour,
          dayName: dayNames[day],
          bookings: pattern?.bookingCount || 0,
          revenue: pattern?.totalRevenue || 0,
          intensity: pattern ? Math.min(100, (pattern.bookingCount / 5) * 100) : 0,
        });
      }
    }
    return heatMap;
  };

  const heatMapData = generateHeatMapData();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-gray-400';
      default: return 'bg-gray-400';
    }
  };

  const getIntensityColor = (intensity: number) => {
    if (intensity === 0) return 'bg-gray-100';
    if (intensity < 25) return 'bg-blue-200';
    if (intensity < 50) return 'bg-blue-400';
    if (intensity < 75) return 'bg-blue-600';
    return 'bg-blue-800';
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Schedule Optimization
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Schedule Optimization
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-600">{error}</p>
            <Button onClick={fetchOptimization} className="mt-4">
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Revenue Impact */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-purple-600" />
            Revenue Impact Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="p-4 text-center">
                <DollarSign className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold">
                  ${data?.optimization?.currentRevenue?.toFixed(0)}
                </p>
                <p className="text-sm text-gray-600">Current Revenue</p>
              </Card>
            </motion.div>

            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="p-4 text-center">
                <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-600">
                  ${data?.optimization?.optimizedRevenue?.toFixed(0)}
                </p>
                <p className="text-sm text-gray-600">Optimized Revenue</p>
              </Card>
            </motion.div>

            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="p-4 text-center">
                <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-purple-600">
                  +${data?.optimization?.potentialIncrease?.toFixed(0)}
                </p>
                <p className="text-sm text-gray-600">Potential Increase</p>
              </Card>
            </motion.div>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Schedule Pattern */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            Optimized Weekly Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
            {Object.entries(data?.optimization?.weeklyPattern || {}).map(([day, schedule]) => (
              <motion.div
                key={day}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Object.keys(data?.optimization?.weeklyPattern || {}).indexOf(day) * 0.1 }}
                className="text-center p-3 border rounded-lg"
              >
                <p className="font-semibold text-sm capitalize">{day}</p>
                <div className={`h-2 w-full rounded-full my-2 ${getPriorityColor(schedule.priority)}`}></div>
                <p className="text-xs text-gray-600">
                  {schedule.start === 'closed' ? 'Closed' : `${schedule.start} - ${schedule.end}`}
                </p>
                <Badge 
                  variant={schedule.priority === 'high' ? 'default' : 'secondary'}
                  className="text-xs mt-1"
                >
                  {schedule.priority}
                </Badge>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Demand Heat Map */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-orange-600" />
            Demand Heat Map
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="grid grid-cols-15 gap-1 min-w-full" style={{ gridTemplateColumns: 'repeat(15, minmax(0, 1fr))' }}>
              {/* Header */}
              <div className="text-xs font-semibold p-2">Time</div>
              {Array.from({ length: 14 }, (_, i) => (
                <div key={i} className="text-xs font-semibold p-2 text-center">
                  {8 + i}:00
                </div>
              ))}
              
              {/* Heat map rows */}
              {dayNames.map((dayName, dayIndex) => (
                <React.Fragment key={dayName}>
                  <div className="text-xs font-semibold p-2">{dayName.slice(0, 3)}</div>
                  {Array.from({ length: 14 }, (_, hourIndex) => {
                    const hour = 8 + hourIndex;
                    const cellData = heatMapData.find(d => d.day === dayIndex && d.hour === hour);
                    return (
                      <motion.div
                        key={`${dayIndex}-${hour}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: (dayIndex * 14 + hourIndex) * 0.01 }}
                        className={`h-8 w-8 rounded text-xs flex items-center justify-center cursor-pointer transition-all hover:scale-110 ${getIntensityColor(cellData?.intensity || 0)}`}
                        title={`${dayName} ${hour}:00 - ${cellData?.bookings || 0} bookings, $${cellData?.revenue?.toFixed(0) || 0}`}
                      >
                        {cellData?.bookings || 0}
                      </motion.div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-center gap-4 mt-4 text-xs">
            <span>Low Demand</span>
            <div className="flex gap-1">
              <div className="w-4 h-4 bg-gray-100 rounded"></div>
              <div className="w-4 h-4 bg-blue-200 rounded"></div>
              <div className="w-4 h-4 bg-blue-400 rounded"></div>
              <div className="w-4 h-4 bg-blue-600 rounded"></div>
              <div className="w-4 h-4 bg-blue-800 rounded"></div>
            </div>
            <span>High Demand</span>
          </div>
        </CardContent>
      </Card>

      {/* Time Slot Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-600" />
            Smart Time Slot Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {data?.optimization?.timeSlotRecommendations?.map((rec, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline">{rec.day}</Badge>
                    <span className="font-semibold">{rec.timeSlot}</span>
                  </div>
                  <p className="text-sm text-gray-600">{rec.reason}</p>
                  <p className="text-xs text-green-600 mt-1">
                    Action: {rec.action}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-green-600">
                    +${rec.potentialRevenue}
                  </p>
                  <p className="text-xs text-gray-600">potential</p>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Price Optimizations */}
      {data?.optimization?.priceOptimizations && data.optimization.priceOptimizations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              Dynamic Pricing Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {data.optimization.priceOptimizations.map((price, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <h4 className="font-semibold">{price.service}</h4>
                    <p className="text-sm text-gray-600">
                      Peak hours: {price.timeSlots.join(', ')}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">${price.currentPrice}</span>
                      <span>→</span>
                      <span className="font-bold text-green-600">${price.suggestedPrice}</span>
                    </div>
                    <p className="text-xs text-green-600">
                      +${price.expectedIncrease} increase
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-purple-600" />
            AI Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold text-green-600 mb-2">Best Days</h4>
            <div className="flex flex-wrap gap-2">
              {data?.optimization?.aiSuggestions?.bestDays?.map((day, index) => (
                <Badge key={index} variant="default">{day}</Badge>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-blue-600 mb-2">Peak Hours</h4>
            <div className="flex flex-wrap gap-2">
              {data?.optimization?.aiSuggestions?.peakHours?.map((hour, index) => (
                <Badge key={index} variant="secondary">{hour}</Badge>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-purple-600 mb-2">Improvement Suggestions</h4>
            <div className="space-y-2">
              {data?.optimization?.aiSuggestions?.improvements?.map((improvement, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg"
                >
                  <Lightbulb className="h-4 w-4 text-purple-600" />
                  <span className="text-sm">{improvement}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
