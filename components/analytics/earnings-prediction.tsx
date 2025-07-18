
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Target, Brain, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

interface EarningsPredictionData {
  prediction: {
    id: string;
    predictedEarnings: number;
    confidenceScore: number;
    lowerBound: number;
    upperBound: number;
    seasonalityFactor: number;
    trendFactor: number;
    demandFactor: number;
    aiInsights: {
      keyFactors: string[];
      opportunities: string[];
      recommendations: string[];
      risks: string[];
    };
  };
  historicalData: Array<{
    date: string;
    amount: number;
    dayOfWeek: number;
    month: number;
    serviceCategory: string;
  }>;
  cached: boolean;
}

export default function EarningsPrediction() {
  const [data, setData] = useState<EarningsPredictionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('MONTHLY');
  const [error, setError] = useState('');

  const fetchPrediction = async (period: string) => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`/api/analytics/earnings-prediction?period=${period}`);
      if (!response.ok) throw new Error('Failed to fetch prediction');
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError('Failed to load earnings prediction');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrediction(selectedPeriod);
  }, [selectedPeriod]);

  const generateChartData = () => {
    if (!data) return [];
    
    // Generate historical trend data
    const historical = data.historicalData.reduce((acc: any, booking) => {
      const monthKey = booking.date.substring(0, 7); // YYYY-MM
      if (!acc[monthKey]) {
        acc[monthKey] = { month: monthKey, earnings: 0, bookings: 0 };
      }
      acc[monthKey].earnings += booking.amount;
      acc[monthKey].bookings += 1;
      return acc;
    }, {});

    const chartData = Object.values(historical).map((item: any) => ({
      period: item.month,
      actual: item.earnings,
      bookings: item.bookings,
    }));

    // Add prediction
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    const predictionMonth = nextMonth.toISOString().substring(0, 7);

    chartData.push({
      period: predictionMonth,
      actual: undefined,
      bookings: 0,
      predicted: data.prediction.predictedEarnings,
      lowerBound: data.prediction.lowerBound,
      upperBound: data.prediction.upperBound,
      confidence: data.prediction.confidenceScore,
    } as any);

    return chartData.sort((a, b) => a.period.localeCompare(b.period));
  };

  const chartData = generateChartData();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Earnings Prediction
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
            <Brain className="h-5 w-5" />
            AI Earnings Prediction
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-gray-600">{error}</p>
            <Button onClick={() => fetchPrediction(selectedPeriod)} className="mt-4">
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
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-blue-600" />
              AI Earnings Prediction
              {data?.cached && <Badge variant="secondary">Cached</Badge>}
            </CardTitle>
            <Tabs value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <TabsList>
                <TabsTrigger value="WEEKLY">Weekly</TabsTrigger>
                <TabsTrigger value="MONTHLY">Monthly</TabsTrigger>
                <TabsTrigger value="QUARTERLY">Quarterly</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="p-4 text-center">
                <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-600">
                  ${data?.prediction?.predictedEarnings?.toFixed(0)}
                </p>
                <p className="text-sm text-gray-600">Predicted Earnings</p>
              </Card>
            </motion.div>

            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="p-4 text-center">
                <Target className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-blue-600">
                  {data?.prediction?.confidenceScore?.toFixed(0)}%
                </p>
                <p className="text-sm text-gray-600">Confidence</p>
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
                  ${data?.prediction?.lowerBound?.toFixed(0)}
                </p>
                <p className="text-sm text-gray-600">Lower Bound</p>
              </Card>
            </motion.div>

            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="p-4 text-center">
                <TrendingUp className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-orange-600">
                  ${data?.prediction?.upperBound?.toFixed(0)}
                </p>
                <p className="text-sm text-gray-600">Upper Bound</p>
              </Card>
            </motion.div>
          </div>

          {/* Chart */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="p-4">
              <h3 className="text-lg font-semibold mb-4">Earnings Trend & Prediction</h3>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="period" 
                    tick={{ fontSize: 10 }}
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fontSize: 10 }}
                    tickLine={false}
                    label={{ 
                      value: 'Earnings ($)', 
                      angle: -90, 
                      position: 'insideLeft',
                      style: { textAnchor: 'middle', fontSize: 11 }
                    }}
                  />
                  <Tooltip 
                    formatter={(value: any, name: string) => [
                      `$${value?.toFixed?.(2) ?? value}`,
                      name.charAt(0).toUpperCase() + name.slice(1)
                    ]}
                    labelFormatter={(label) => `Period: ${label}`}
                  />
                  <Area
                    type="monotone"
                    dataKey="actual"
                    stroke="#60B5FF"
                    fill="#60B5FF"
                    fillOpacity={0.3}
                    name="Actual Earnings"
                  />
                  <Area
                    type="monotone"
                    dataKey="predicted"
                    stroke="#FF9149"
                    fill="#FF9149"
                    fillOpacity={0.3}
                    strokeDasharray="5 5"
                    name="Predicted Earnings"
                  />
                  <Area
                    type="monotone"
                    dataKey="upperBound"
                    stroke="#FF6363"
                    fill="none"
                    strokeDasharray="2 2"
                    name="Upper Bound"
                  />
                  <Area
                    type="monotone"
                    dataKey="lowerBound"
                    stroke="#80D8C3"
                    fill="none"
                    strokeDasharray="2 2"
                    name="Lower Bound"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Card>
          </motion.div>

          {/* AI Insights */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Tabs defaultValue="factors" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="factors">Key Factors</TabsTrigger>
                <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
                <TabsTrigger value="recommendations">Tips</TabsTrigger>
                <TabsTrigger value="risks">Risks</TabsTrigger>
              </TabsList>

              <TabsContent value="factors" className="space-y-3">
                {data?.prediction?.aiInsights?.keyFactors?.map((factor, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg"
                  >
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                    <span className="text-sm">{factor}</span>
                  </motion.div>
                ))}
              </TabsContent>

              <TabsContent value="opportunities" className="space-y-3">
                {data?.prediction?.aiInsights?.opportunities?.map((opportunity, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3 p-3 bg-green-50 rounded-lg"
                  >
                    <Target className="h-4 w-4 text-green-600" />
                    <span className="text-sm">{opportunity}</span>
                  </motion.div>
                ))}
              </TabsContent>

              <TabsContent value="recommendations" className="space-y-3">
                {data?.prediction?.aiInsights?.recommendations?.map((rec, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg"
                  >
                    <Brain className="h-4 w-4 text-purple-600" />
                    <span className="text-sm">{rec}</span>
                  </motion.div>
                ))}
              </TabsContent>

              <TabsContent value="risks" className="space-y-3">
                {data?.prediction?.aiInsights?.risks?.map((risk, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3 p-3 bg-red-50 rounded-lg"
                  >
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <span className="text-sm">{risk}</span>
                  </motion.div>
                ))}
              </TabsContent>
            </Tabs>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
