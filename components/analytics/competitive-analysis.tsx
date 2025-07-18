
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { TrendingUp, Users, DollarSign, MapPin, Target, Trophy, AlertTriangle, Lightbulb } from 'lucide-react';
import { motion } from 'framer-motion';

interface CompetitiveAnalysisData {
  analysis: {
    marketRank: number;
    totalCompetitors: number;
    averageMarketPrice: number;
    pricePosition: string;
    bookingVelocity: number;
    competitorAvgVelocity: number;
    ratingPosition: number;
    missingServices: string[];
    opportunityServices: string[];
    serviceRadius: number;
    competitorDensity: number;
    marketOpportunity: number;
    competitiveAdvantages: string[];
    weaknesses: string[];
    recommendations: Array<{
      action: string;
      priority: string;
      impact: string;
      timeline: string;
    }>;
  };
  marketData: {
    totalCompetitors: number;
    marketRank: number;
    avgMarketRating: number;
    marketPrices: Array<{
      category: string;
      averagePrice: number;
      minPrice: number;
      maxPrice: number;
      competitorCount: number;
    }>;
    missingServices: string[];
  };
  ownMetrics: {
    weeklyBookings: number;
    avgBookingValue: number;
    rating: number;
    services: string[];
  };
  aiInsights: {
    competitivePosition: {
      marketRank: number;
      totalCompetitors: number;
      ratingPercentile: number;
      pricePosition: string;
      overallStrength: string;
    };
    strengths: string[];
    weaknesses: string[];
    opportunities: Array<{
      opportunity: string;
      marketDemand: string;
      expectedRevenue: number;
      implementation: string;
    }>;
    threats: string[];
    recommendations: Array<{
      action: string;
      priority: string;
      impact: string;
      timeline: string;
    }>;
    marketOpportunities: {
      underservedAreas: string[];
      pricingOpportunities: string[];
      serviceGaps: string[];
    };
  };
  competitors: Array<{
    id: string;
    businessName: string;
    rating: number;
    serviceCount: number;
    avgPrice: number;
  }>;
}

export default function CompetitiveAnalysis() {
  const [data, setData] = useState<CompetitiveAnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchCompetitiveData = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/analytics/competitive-analysis');
      if (!response.ok) throw new Error('Failed to fetch competitive analysis');
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError('Failed to load competitive analysis');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompetitiveData();
  }, []);

  const getStrengthLevel = (strength: string) => {
    switch (strength) {
      case 'STRONG': return { color: 'text-green-600', bg: 'bg-green-100' };
      case 'AVERAGE': return { color: 'text-yellow-600', bg: 'bg-yellow-100' };
      case 'WEAK': return { color: 'text-red-600', bg: 'bg-red-100' };
      default: return { color: 'text-gray-600', bg: 'bg-gray-100' };
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'destructive';
      case 'MEDIUM': return 'default';
      case 'LOW': return 'secondary';
      default: return 'outline';
    }
  };

  const radarData = data ? [
    { subject: 'Rating', A: (data.ownMetrics.rating / 5) * 100, B: (data.marketData.avgMarketRating / 5) * 100 },
    { subject: 'Bookings', A: Math.min(100, data.ownMetrics.weeklyBookings * 10), B: Math.min(100, data.analysis.competitorAvgVelocity * 10) },
    { subject: 'Pricing', A: data.analysis.pricePosition === 'ABOVE' ? 80 : data.analysis.pricePosition === 'AVERAGE' ? 50 : 30, B: 50 },
    { subject: 'Services', A: Math.min(100, data.ownMetrics.services.length * 15), B: 60 },
    { subject: 'Market Position', A: Math.max(10, 100 - (data.analysis.marketRank / data.analysis.totalCompetitors * 100)), B: 50 },
  ] : [];

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Competitive Analysis
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
            <Trophy className="h-5 w-5" />
            Competitive Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-gray-600">{error}</p>
            <Button onClick={fetchCompetitiveData} className="mt-4">
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const strengthLevel = getStrengthLevel(data?.aiInsights?.competitivePosition?.overallStrength || '');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Market Position Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-gold-600" />
            Market Position Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="p-4 text-center">
                <Trophy className="h-6 w-6 text-gold-600 mx-auto mb-2" />
                <p className="text-2xl font-bold">#{data?.analysis?.marketRank}</p>
                <p className="text-sm text-gray-600">Market Rank</p>
                <p className="text-xs text-gray-500">of {data?.analysis?.totalCompetitors} competitors</p>
              </Card>
            </motion.div>

            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="p-4 text-center">
                <Users className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold">{data?.analysis?.totalCompetitors}</p>
                <p className="text-sm text-gray-600">Competitors</p>
                <p className="text-xs text-gray-500">in your area</p>
              </Card>
            </motion.div>

            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="p-4 text-center">
                <div className={`p-2 rounded-full ${strengthLevel.bg} mx-auto mb-2 w-fit`}>
                  <TrendingUp className={`h-4 w-4 ${strengthLevel.color}`} />
                </div>
                <p className={`text-xl font-bold ${strengthLevel.color}`}>
                  {data?.aiInsights?.competitivePosition?.overallStrength}
                </p>
                <p className="text-sm text-gray-600">Overall Strength</p>
              </Card>
            </motion.div>

            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="p-4 text-center">
                <DollarSign className="h-6 w-6 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold">
                  {data?.analysis?.pricePosition}
                </p>
                <p className="text-sm text-gray-600">Price Position</p>
                <p className="text-xs text-gray-500">vs market average</p>
              </Card>
            </motion.div>
          </div>
        </CardContent>
      </Card>

      {/* Competitive Radar */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-purple-600" />
            Performance Comparison
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
                  <PolarRadiusAxis 
                    domain={[0, 100]} 
                    tick={{ fontSize: 8 }}
                    tickCount={4}
                  />
                  <Radar
                    name="You"
                    dataKey="A"
                    stroke="#60B5FF"
                    fill="#60B5FF"
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                  <Radar
                    name="Market Average"
                    dataKey="B"
                    stroke="#FF9149"
                    fill="#FF9149"
                    fillOpacity={0.1}
                    strokeWidth={2}
                    strokeDasharray="5 5"
                  />
                  <Tooltip 
                    formatter={(value: any) => [`${value?.toFixed?.(1) ?? value}%`, '']}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-green-600 mb-2">Your Advantages</h4>
                <div className="space-y-2">
                  {data?.aiInsights?.strengths?.slice(0, 3).map((strength, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-2 p-2 bg-green-50 rounded"
                    >
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span className="text-sm">{strength}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-red-600 mb-2">Areas for Improvement</h4>
                <div className="space-y-2">
                  {data?.aiInsights?.weaknesses?.slice(0, 3).map((weakness, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-2 p-2 bg-red-50 rounded"
                    >
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <span className="text-sm">{weakness}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Market Pricing Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            Market Pricing Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data?.marketData?.marketPrices || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="category" 
                tick={{ fontSize: 10 }}
                tickLine={false}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                tick={{ fontSize: 10 }}
                tickLine={false}
                label={{ 
                  value: 'Price ($)', 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { textAnchor: 'middle', fontSize: 11 }
                }}
              />
              <Tooltip 
                formatter={(value: any) => [`$${value?.toFixed?.(0) ?? value}`, 'Average Price']}
              />
              <Bar dataKey="averagePrice" fill="#60B5FF" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Opportunities and Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-600" />
            Strategic Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="opportunities" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
              <TabsTrigger value="recommendations">Actions</TabsTrigger>
              <TabsTrigger value="market">Market Gaps</TabsTrigger>
            </TabsList>

            <TabsContent value="opportunities" className="space-y-4 mt-6">
              {data?.aiInsights?.opportunities?.map((opportunity, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">{opportunity.opportunity}</h4>
                    <div className="flex gap-2">
                      <Badge variant={opportunity.marketDemand === 'HIGH' ? 'default' : 'secondary'}>
                        {opportunity.marketDemand} Demand
                      </Badge>
                      <Badge variant="outline">
                        {opportunity.implementation}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-lg font-bold text-green-600 mb-2">
                    +${opportunity.expectedRevenue}/month potential
                  </p>
                  <p className="text-sm text-gray-600">
                    Implementation timeline: {opportunity.implementation}
                  </p>
                </motion.div>
              ))}
            </TabsContent>

            <TabsContent value="recommendations" className="space-y-4 mt-6">
              {data?.aiInsights?.recommendations?.map((rec, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 border rounded-lg"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">{rec.action}</h4>
                    <div className="flex gap-2">
                      <Badge variant={getPriorityColor(rec.priority)}>
                        {rec.priority} Priority
                      </Badge>
                      <Badge variant="outline">{rec.timeline}</Badge>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{rec.impact}</p>
                  <div className="bg-blue-50 p-3 rounded">
                    <p className="text-sm">
                      <strong>Timeline:</strong> {rec.timeline}
                    </p>
                  </div>
                </motion.div>
              ))}
            </TabsContent>

            <TabsContent value="market" className="space-y-6 mt-6">
              <div>
                <h4 className="font-semibold text-blue-600 mb-3">Service Gaps</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {data?.aiInsights?.marketOpportunities?.serviceGaps?.map((gap, index) => (
                    <Badge key={index} variant="outline" className="justify-center p-2">
                      {gap}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-green-600 mb-3">Pricing Opportunities</h4>
                <div className="space-y-2">
                  {data?.aiInsights?.marketOpportunities?.pricingOpportunities?.map((pricing, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-3 p-3 bg-green-50 rounded"
                    >
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <span className="text-sm">{pricing}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-purple-600 mb-3">Underserved Areas</h4>
                <div className="space-y-2">
                  {data?.aiInsights?.marketOpportunities?.underservedAreas?.map((area, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-3 p-3 bg-purple-50 rounded"
                    >
                      <MapPin className="h-4 w-4 text-purple-600" />
                      <span className="text-sm">{area}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Competitor Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            Competitor Landscape
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {data?.competitors?.map((competitor, index) => (
              <motion.div
                key={competitor.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1">
                  <h4 className="font-semibold">{competitor.businessName}</h4>
                  <div className="flex gap-4 text-sm text-gray-600 mt-1">
                    <span>⭐ {competitor.rating.toFixed(1)}</span>
                    <span>{competitor.serviceCount} services</span>
                    <span>${competitor.avgPrice.toFixed(0)} avg</span>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="outline">
                    Rank #{index + 2}
                  </Badge>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
