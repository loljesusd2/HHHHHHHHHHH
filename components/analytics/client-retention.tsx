
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, UserCheck, UserX, Clock, DollarSign, Target, Mail, Phone } from 'lucide-react';
import { motion } from 'framer-motion';

interface ClientRetentionData {
  analysis: {
    totalClients: number;
    returningClients: number;
    retentionRate: number;
    averageTimeBetweenVisits: number;
    newClients: number;
    regularClients: number;
    atRiskClients: number;
    lostClients: number;
    averageLifetimeValue: number;
    topClientValue: number;
    retentionStrategies: Array<{
      strategy: string;
      description: string;
      targetSegment: string;
      expectedImpact: string;
      implementation: string;
    }>;
    followUpSuggestions: Array<{
      clientName: string;
      lastVisit: string;
      suggestion: string;
      urgency: string;
      expectedRevenue: number;
    }>;
  };
  clientSegments: {
    new: number;
    regular: number;
    atRisk: number;
    lost: number;
  };
  metrics: {
    totalClients: number;
    returningClients: number;
    retentionRate: number;
    avgTimeBetweenVisits: number;
    avgLifetimeValue: number;
    topClientValue: number;
  };
  recommendations: any;
  atRiskClients: Array<{
    clientName: string;
    clientEmail: string;
    totalSpent: number;
    lastVisit: string;
  }>;
}

export default function ClientRetention() {
  const [data, setData] = useState<ClientRetentionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchRetentionData = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/analytics/client-retention');
      if (!response.ok) throw new Error('Failed to fetch retention data');
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError('Failed to load retention analysis');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRetentionData();
  }, []);

  const pieData = data ? [
    { name: 'New Clients', value: data.clientSegments.new, color: '#60B5FF' },
    { name: 'Regular Clients', value: data.clientSegments.regular, color: '#80D8C3' },
    { name: 'At Risk', value: data.clientSegments.atRisk, color: '#FF9149' },
    { name: 'Lost Clients', value: data.clientSegments.lost, color: '#FF6363' },
  ] : [];

  const retentionScoreData = data?.analysis?.retentionStrategies?.map((strategy, index) => ({
    strategy: strategy.strategy.substring(0, 15) + '...',
    impact: strategy.expectedImpact === 'high' ? 90 : strategy.expectedImpact === 'medium' ? 60 : 30,
    segment: strategy.targetSegment,
  })) || [];

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-400';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Client Retention Analysis
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
            <Users className="h-5 w-5" />
            Client Retention Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-600">{error}</p>
            <Button onClick={fetchRetentionData} className="mt-4">
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
      {/* Key Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            Retention Overview
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
                <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold">{data?.metrics?.totalClients}</p>
                <p className="text-sm text-gray-600">Total Clients</p>
              </Card>
            </motion.div>

            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="p-4 text-center">
                <UserCheck className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-600">
                  {data?.metrics?.retentionRate?.toFixed(1)}%
                </p>
                <p className="text-sm text-gray-600">Retention Rate</p>
              </Card>
            </motion.div>

            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="p-4 text-center">
                <Clock className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-purple-600">
                  {data?.metrics?.avgTimeBetweenVisits?.toFixed(0)} days
                </p>
                <p className="text-sm text-gray-600">Avg. Time Between</p>
              </Card>
            </motion.div>

            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="p-4 text-center">
                <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-600">
                  ${data?.metrics?.avgLifetimeValue?.toFixed(0)}
                </p>
                <p className="text-sm text-gray-600">Avg. Lifetime Value</p>
              </Card>
            </motion.div>
          </div>
        </CardContent>
      </Card>

      {/* Client Segmentation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-purple-600" />
            Client Segmentation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pie Chart */}
            <div>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: any) => [value, 'Clients']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Legend and Details */}
            <div className="space-y-4">
              {pieData.map((segment, index) => (
                <motion.div
                  key={segment.name}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: segment.color }}
                    ></div>
                    <span className="font-medium">{segment.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{segment.value}</p>
                    <p className="text-xs text-gray-600">
                      {((segment.value / data!.metrics.totalClients) * 100).toFixed(1)}%
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* At-Risk Clients */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserX className="h-5 w-5 text-red-600" />
            At-Risk Clients - Immediate Action Required
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {data?.atRiskClients?.map((client, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold">{client.clientName}</span>
                    <Badge variant="destructive" className="text-xs">
                      At Risk
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{client.clientEmail}</p>
                  <p className="text-xs text-gray-500">
                    Last visit: {new Date(client.lastVisit).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right ml-4">
                  <p className="font-bold text-green-600">${client.totalSpent.toFixed(0)}</p>
                  <p className="text-xs text-gray-600">lifetime value</p>
                  <div className="flex gap-1 mt-2">
                    <Button size="sm" variant="outline" className="text-xs">
                      <Mail className="h-3 w-3 mr-1" />
                      Email
                    </Button>
                    <Button size="sm" variant="outline" className="text-xs">
                      <Phone className="h-3 w-3 mr-1" />
                      Call
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Retention Strategies */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-green-600" />
            AI-Powered Retention Strategies
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="strategies" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="strategies">Strategies</TabsTrigger>
              <TabsTrigger value="followups">Follow-ups</TabsTrigger>
            </TabsList>

            <TabsContent value="strategies" className="space-y-4 mt-6">
              {data?.analysis?.retentionStrategies?.map((strategy, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-lg">{strategy.strategy}</h4>
                    <div className="flex gap-2">
                      <Badge variant={strategy.expectedImpact === 'high' ? 'default' : 'secondary'}>
                        {strategy.expectedImpact} impact
                      </Badge>
                      <Badge variant="outline">{strategy.targetSegment}</Badge>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-3">{strategy.description}</p>
                  <div className="bg-blue-50 p-3 rounded">
                    <p className="text-sm">
                      <strong>Implementation:</strong> {strategy.implementation}
                    </p>
                  </div>
                </motion.div>
              ))}
            </TabsContent>

            <TabsContent value="followups" className="space-y-4 mt-6">
              {data?.analysis?.followUpSuggestions?.map((followUp, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{followUp.clientName}</span>
                      <div className={`w-3 h-3 rounded-full ${getUrgencyColor(followUp.urgency)}`}></div>
                      <Badge variant={followUp.urgency === 'high' ? 'destructive' : 'secondary'}>
                        {followUp.urgency} priority
                      </Badge>
                    </div>
                    <p className="font-bold text-green-600">
                      +${followUp.expectedRevenue}
                    </p>
                  </div>
                  <p className="text-gray-600 mb-2">{followUp.suggestion}</p>
                  <p className="text-xs text-gray-500">
                    Last visit: {followUp.lastVisit}
                  </p>
                </motion.div>
              ))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Strategy Impact Chart */}
      {retentionScoreData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Strategy Impact Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={retentionScoreData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="strategy" 
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
                    value: 'Impact Score', 
                    angle: -90, 
                    position: 'insideLeft',
                    style: { textAnchor: 'middle', fontSize: 11 }
                  }}
                />
                <Tooltip 
                  formatter={(value: any) => [`${value}%`, 'Impact Score']}
                />
                <Bar dataKey="impact" fill="#60B5FF" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
}
