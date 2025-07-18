
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Lightbulb, TrendingUp, DollarSign, Target, CheckCircle, X, Eye, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

interface BusinessInsightsData {
  insights: Array<{
    id: string;
    type: string;
    priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    title: string;
    description: string;
    impact: string;
    currentValue?: number;
    targetValue?: number;
    potentialRevenue?: number;
    implementationCost?: number;
    aiConfidence: number;
    aiReasoning: {
      reasoning: string;
      actionSteps: string[];
    };
    status: 'ACTIVE' | 'DISMISSED' | 'IMPLEMENTED';
    viewed: boolean;
    implemented: boolean;
    createdAt: string;
  }>;
  existingInsights: Array<any>;
  businessMetrics: {
    totalRevenue: number;
    avgBookingValue: number;
    avgRating: number;
    totalBookings: number;
    recentTrend: 'up' | 'down';
  };
  servicePerformance: Array<{
    serviceId: string;
    serviceName: string;
    price: number;
    bookingCount: number;
    totalRevenue: number;
    avgRating: number;
  }>;
  recommendations: {
    quickWins: Array<{
      action: string;
      expectedImpact: string;
      effort: string;
    }>;
    longTermStrategy: {
      goals: string[];
      timeline: string;
      expectedROI: string;
    };
  };
}

export default function BusinessInsights() {
  const [data, setData] = useState<BusinessInsightsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingInsight, setProcessingInsight] = useState<string | null>(null);

  const fetchInsights = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/analytics/business-insights');
      if (!response.ok) throw new Error('Failed to fetch insights');
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError('Failed to load business insights');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInsightAction = async (insightId: string, action: 'view' | 'dismiss' | 'implement') => {
    setProcessingInsight(insightId);
    try {
      const response = await fetch('/api/analytics/business-insights', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ insightId, action }),
      });

      if (!response.ok) throw new Error('Failed to update insight');
      
      // Refresh data
      await fetchInsights();
    } catch (err) {
      console.error('Error updating insight:', err);
    } finally {
      setProcessingInsight(null);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL': return 'bg-red-500';
      case 'HIGH': return 'bg-orange-500';
      case 'MEDIUM': return 'bg-yellow-500';
      case 'LOW': return 'bg-green-500';
      default: return 'bg-gray-400';
    }
  };

  const getPriorityVariant = (priority: string) => {
    switch (priority) {
      case 'CRITICAL': return 'destructive';
      case 'HIGH': return 'default';
      case 'MEDIUM': return 'secondary';
      case 'LOW': return 'outline';
      default: return 'outline';
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'PRICING_OPTIMIZATION': return <DollarSign className="h-5 w-5" />;
      case 'SCHEDULE_OPTIMIZATION': return <Target className="h-5 w-5" />;
      case 'SERVICE_RECOMMENDATION': return <Lightbulb className="h-5 w-5" />;
      case 'MARKETING_SUGGESTION': return <TrendingUp className="h-5 w-5" />;
      case 'RETENTION_STRATEGY': return <Target className="h-5 w-5" />;
      case 'COMPETITIVE_ADVANTAGE': return <TrendingUp className="h-5 w-5" />;
      default: return <Lightbulb className="h-5 w-5" />;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Business Insights
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
            <Lightbulb className="h-5 w-5" />
            Business Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-gray-600">{error}</p>
            <Button onClick={fetchInsights} className="mt-4">
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const activeInsights = data?.insights?.filter(i => i.status === 'ACTIVE') || [];
  const implementedInsights = data?.insights?.filter(i => i.status === 'IMPLEMENTED') || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Business Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            Business Performance Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="p-4 text-center">
                <DollarSign className="h-6 w-6 text-green-600 mx-auto mb-2" />
                <p className="text-xl font-bold">${data?.businessMetrics?.totalRevenue?.toFixed(0)}</p>
                <p className="text-sm text-gray-600">Total Revenue</p>
              </Card>
            </motion.div>

            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="p-4 text-center">
                <Target className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                <p className="text-xl font-bold">${data?.businessMetrics?.avgBookingValue?.toFixed(0)}</p>
                <p className="text-sm text-gray-600">Avg Booking</p>
              </Card>
            </motion.div>

            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="p-4 text-center">
                <CheckCircle className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                <p className="text-xl font-bold">{data?.businessMetrics?.avgRating?.toFixed(1)}/5</p>
                <p className="text-sm text-gray-600">Avg Rating</p>
              </Card>
            </motion.div>

            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="p-4 text-center">
                <TrendingUp className="h-6 w-6 text-orange-600 mx-auto mb-2" />
                <p className="text-xl font-bold">{data?.businessMetrics?.totalBookings}</p>
                <p className="text-sm text-gray-600">Total Bookings</p>
              </Card>
            </motion.div>

            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="p-4 text-center">
                <div className={`h-6 w-6 mx-auto mb-2 flex items-center justify-center rounded-full ${
                  data?.businessMetrics?.recentTrend === 'up' ? 'bg-green-500' : 'bg-red-500'
                }`}>
                  <TrendingUp className={`h-4 w-4 text-white ${
                    data?.businessMetrics?.recentTrend === 'down' ? 'rotate-180' : ''
                  }`} />
                </div>
                <p className="text-xl font-bold">Trend</p>
                <p className={`text-sm ${
                  data?.businessMetrics?.recentTrend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {data?.businessMetrics?.recentTrend === 'up' ? 'Growing' : 'Declining'}
                </p>
              </Card>
            </motion.div>
          </div>
        </CardContent>
      </Card>

      {/* Insights Tabs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-600" />
            AI-Powered Business Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="active" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="active" className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Active ({activeInsights.length})
              </TabsTrigger>
              <TabsTrigger value="implemented" className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Implemented ({implementedInsights.length})
              </TabsTrigger>
              <TabsTrigger value="recommendations" className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                Quick Wins
              </TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="space-y-4 mt-6">
              {activeInsights.length === 0 ? (
                <div className="text-center py-8">
                  <Lightbulb className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No active insights available. Check back later!</p>
                </div>
              ) : (
                activeInsights.map((insight, index) => (
                  <motion.div
                    key={insight.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border rounded-lg p-6 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${getPriorityColor(insight.priority)} text-white`}>
                          {getInsightIcon(insight.type)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-lg">{insight.title}</h3>
                            <Badge variant={getPriorityVariant(insight.priority)}>
                              {insight.priority}
                            </Badge>
                            {!insight.viewed && (
                              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                                New
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{insight.type.replace('_', ' ')}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-600">
                          +${insight.potentialRevenue?.toFixed(0)}
                        </p>
                        <p className="text-xs text-gray-600">potential revenue</p>
                        <p className="text-xs text-blue-600">
                          {insight.aiConfidence}% confidence
                        </p>
                      </div>
                    </div>

                    <p className="text-gray-700 mb-4">{insight.description}</p>
                    
                    <div className="bg-blue-50 p-4 rounded-lg mb-4">
                      <p className="text-sm mb-2">
                        <strong>Expected Impact:</strong> {insight.impact}
                      </p>
                      {insight.currentValue && insight.targetValue && (
                        <p className="text-sm">
                          <strong>Target:</strong> ${insight.currentValue} → ${insight.targetValue}
                        </p>
                      )}
                    </div>

                    {insight.aiReasoning?.actionSteps && (
                      <div className="mb-4">
                        <h4 className="font-semibold mb-2">Action Steps:</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                          {insight.aiReasoning.actionSteps.map((step, stepIndex) => (
                            <li key={stepIndex} className="text-gray-600">{step}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="flex gap-2 pt-4 border-t">
                      {!insight.viewed && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleInsightAction(insight.id, 'view')}
                          disabled={processingInsight === insight.id}
                          className="flex items-center gap-1"
                        >
                          <Eye className="h-3 w-3" />
                          Mark as Viewed
                        </Button>
                      )}
                      <Button
                        size="sm"
                        onClick={() => handleInsightAction(insight.id, 'implement')}
                        disabled={processingInsight === insight.id}
                        className="flex items-center gap-1"
                      >
                        <CheckCircle className="h-3 w-3" />
                        Implement
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleInsightAction(insight.id, 'dismiss')}
                        disabled={processingInsight === insight.id}
                        className="flex items-center gap-1"
                      >
                        <X className="h-3 w-3" />
                        Dismiss
                      </Button>
                    </div>
                  </motion.div>
                ))
              )}
            </TabsContent>

            <TabsContent value="implemented" className="space-y-4 mt-6">
              {implementedInsights.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No implemented insights yet.</p>
                </div>
              ) : (
                implementedInsights.map((insight, index) => (
                  <motion.div
                    key={insight.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border rounded-lg p-4 bg-green-50 border-green-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <div>
                          <h3 className="font-semibold">{insight.title}</h3>
                          <p className="text-sm text-gray-600">{insight.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">
                          +${insight.potentialRevenue?.toFixed(0)}
                        </p>
                        <p className="text-xs text-gray-600">
                          Implemented {new Date(insight.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </TabsContent>

            <TabsContent value="recommendations" className="space-y-6 mt-6">
              {/* Quick Wins */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Quick Wins</h3>
                <div className="grid gap-4">
                  {data?.recommendations?.quickWins?.map((win, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold">{win.action}</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            Expected Impact: {win.expectedImpact}
                          </p>
                        </div>
                        <Badge variant={win.effort === 'Low' ? 'default' : 'secondary'}>
                          {win.effort} Effort
                        </Badge>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Long-term Strategy */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Long-term Strategy</h3>
                <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Strategic Goals</h4>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        {data?.recommendations?.longTermStrategy?.goals?.map((goal, index) => (
                          <li key={index} className="text-gray-700">{goal}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="font-semibold text-sm">Timeline</p>
                        <p className="text-sm text-gray-600">
                          {data?.recommendations?.longTermStrategy?.timeline}
                        </p>
                      </div>
                      <div>
                        <p className="font-semibold text-sm">Expected ROI</p>
                        <p className="text-sm text-green-600 font-bold">
                          {data?.recommendations?.longTermStrategy?.expectedROI}
                        </p>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  );
}
