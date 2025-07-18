
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, TrendingUp, BarChart3, Users } from 'lucide-react';
import { motion } from 'framer-motion';

interface DemandHeatmapData {
  type: 'temporal' | 'geographic';
  data: any[];
  summary: {
    totalBookings?: number;
    totalRevenue?: number;
    peakDay?: any;
    peakHour?: any;
    totalLocations?: number;
    topLocation?: any;
    coverage?: {
      cities: number;
      states: number;
    };
  };
}

export default function DemandHeatmap() {
  const [temporalData, setTemporalData] = useState<DemandHeatmapData | null>(null);
  const [geographicData, setGeographicData] = useState<DemandHeatmapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('temporal');

  const fetchHeatmapData = async (type: 'temporal' | 'geographic') => {
    try {
      const response = await fetch(`/api/analytics/demand-heatmap?type=${type}`);
      if (!response.ok) throw new Error('Failed to fetch heatmap data');
      const result = await response.json();
      
      if (type === 'temporal') {
        setTemporalData(result);
      } else {
        setGeographicData(result);
      }
    } catch (err) {
      setError('Failed to load demand heatmap');
      console.error(err);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError('');
      try {
        await Promise.all([
          fetchHeatmapData('temporal'),
          fetchHeatmapData('geographic')
        ]);
      } catch (err) {
        setError('Failed to load heatmap data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getIntensityColor = (count: number, maxCount: number) => {
    if (count === 0) return 'bg-gray-100';
    const intensity = (count / maxCount) * 100;
    if (intensity < 20) return 'bg-blue-200';
    if (intensity < 40) return 'bg-blue-400';
    if (intensity < 60) return 'bg-blue-600';
    if (intensity < 80) return 'bg-blue-700';
    return 'bg-blue-900';
  };

  const generateTemporalHeatmap = () => {
    if (!temporalData?.data) return null;

    const maxCount = Math.max(...temporalData.data.map(d => d.count));
    const grid = [];

    for (let day = 0; day < 7; day++) {
      const dayData = [];
      for (let hour = 8; hour < 22; hour++) {
        const cellData = temporalData.data.find(d => d.day === day && d.hour === hour);
        dayData.push({
          day,
          hour,
          count: cellData?.count || 0,
          revenue: cellData?.revenue || 0,
          avgPrice: cellData?.avgPrice || 0,
          services: cellData?.services || [],
          intensity: cellData ? (cellData.count / maxCount) * 100 : 0,
        });
      }
      grid.push(dayData);
    }

    return { grid, maxCount };
  };

  const temporalHeatmap = generateTemporalHeatmap();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Demand Analytics
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
            <BarChart3 className="h-5 w-5" />
            Demand Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-600">{error}</p>
            <Button onClick={() => window.location.reload()} className="mt-4">
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
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            Demand Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="temporal" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Time-based
              </TabsTrigger>
              <TabsTrigger value="geographic" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Location-based
              </TabsTrigger>
            </TabsList>

            <TabsContent value="temporal" className="space-y-6 mt-6">
              {/* Temporal Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <Card className="p-4 text-center">
                    <Users className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                    <p className="text-xl font-bold">{temporalData?.summary?.totalBookings}</p>
                    <p className="text-sm text-gray-600">Total Bookings</p>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <Card className="p-4 text-center">
                    <TrendingUp className="h-6 w-6 text-green-600 mx-auto mb-2" />
                    <p className="text-xl font-bold">${temporalData?.summary?.totalRevenue?.toFixed(0)}</p>
                    <p className="text-sm text-gray-600">Total Revenue</p>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <Card className="p-4 text-center">
                    <Badge variant="default" className="mb-2">
                      {temporalData?.summary?.peakDay?.dayName}
                    </Badge>
                    <p className="text-xl font-bold">{temporalData?.summary?.peakDay?.count}</p>
                    <p className="text-sm text-gray-600">Peak Day</p>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <Card className="p-4 text-center">
                    <Badge variant="secondary" className="mb-2">
                      {temporalData?.summary?.peakHour?.hour}:00
                    </Badge>
                    <p className="text-xl font-bold">{temporalData?.summary?.peakHour?.count}</p>
                    <p className="text-sm text-gray-600">Peak Hour</p>
                  </Card>
                </motion.div>
              </div>

              {/* Temporal Heatmap */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Weekly Demand Pattern</h3>
                <div className="overflow-x-auto">
                  <div className="grid grid-cols-15 gap-1" style={{ gridTemplateColumns: 'auto repeat(14, 1fr)' }}>
                    {/* Time headers */}
                    <div className="w-12"></div>
                    {Array.from({ length: 14 }, (_, i) => (
                      <div key={i} className="text-xs font-medium text-center p-1">
                        {8 + i}
                      </div>
                    ))}

                    {/* Day rows */}
                    {temporalHeatmap?.grid.map((dayRow, dayIndex) => (
                      <React.Fragment key={dayIndex}>
                        <div className="text-xs font-medium p-2 w-12 text-right">
                          {dayNames[dayIndex]}
                        </div>
                        {dayRow.map((cell, hourIndex) => (
                          <motion.div
                            key={`${dayIndex}-${hourIndex}`}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: (dayIndex * 14 + hourIndex) * 0.01 }}
                            className={`h-8 rounded cursor-pointer flex items-center justify-center text-xs font-medium transition-all hover:scale-110 hover:z-10 ${
                              getIntensityColor(cell.count, temporalHeatmap?.maxCount || 1)
                            } ${cell.count > 0 ? 'text-white' : 'text-gray-600'}`}
                            title={`${dayNames[dayIndex]} ${cell.hour}:00\n${cell.count} bookings\n$${cell.revenue.toFixed(0)} revenue`}
                          >
                            {cell.count}
                          </motion.div>
                        ))}
                      </React.Fragment>
                    ))}
                  </div>

                  {/* Legend */}
                  <div className="flex items-center justify-center gap-4 mt-6 text-xs">
                    <span className="text-gray-600">Low Demand</span>
                    <div className="flex gap-1">
                      <div className="w-4 h-4 bg-gray-100 rounded border"></div>
                      <div className="w-4 h-4 bg-blue-200 rounded"></div>
                      <div className="w-4 h-4 bg-blue-400 rounded"></div>
                      <div className="w-4 h-4 bg-blue-600 rounded"></div>
                      <div className="w-4 h-4 bg-blue-700 rounded"></div>
                      <div className="w-4 h-4 bg-blue-900 rounded"></div>
                    </div>
                    <span className="text-gray-600">High Demand</span>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="geographic" className="space-y-6 mt-6">
              {/* Geographic Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <Card className="p-4 text-center">
                    <MapPin className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                    <p className="text-xl font-bold">{geographicData?.summary?.totalLocations}</p>
                    <p className="text-sm text-gray-600">Locations Served</p>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <Card className="p-4 text-center">
                    <TrendingUp className="h-6 w-6 text-green-600 mx-auto mb-2" />
                    <p className="text-xl font-bold">{geographicData?.summary?.coverage?.cities}</p>
                    <p className="text-sm text-gray-600">Cities</p>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <Card className="p-4 text-center">
                    <Users className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                    <p className="text-xl font-bold">{geographicData?.summary?.coverage?.states}</p>
                    <p className="text-sm text-gray-600">States</p>
                  </Card>
                </motion.div>

                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <Card className="p-4 text-center">
                    <Badge variant="default" className="mb-2 max-w-full truncate">
                      {geographicData?.summary?.topLocation?.city}
                    </Badge>
                    <p className="text-xl font-bold">{geographicData?.summary?.topLocation?.bookingCount}</p>
                    <p className="text-sm text-gray-600">Top Location</p>
                  </Card>
                </motion.div>
              </div>

              {/* Geographic Data List */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Location Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {geographicData?.data?.map((location, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <MapPin className="h-4 w-4 text-blue-600" />
                            <span className="font-semibold">{location.city}, {location.state}</span>
                            <Badge variant="outline" className="text-xs">
                              Score: {location.demandScore.toFixed(0)}
                            </Badge>
                          </div>
                          <div className="flex gap-4 text-sm text-gray-600">
                            <span>{location.bookingCount} bookings</span>
                            <span>${location.totalRevenue.toFixed(0)} revenue</span>
                            <span>${location.avgRevenue.toFixed(0)} avg</span>
                          </div>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {location.services?.map((service: string, idx: number) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {service}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <div className={`w-16 h-2 rounded-full ${getIntensityColor(
                            location.demandScore, 100
                          )}`}></div>
                          <p className="text-xs text-gray-500 mt-1">
                            {location.demandScore.toFixed(0)}% demand
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  );
}
