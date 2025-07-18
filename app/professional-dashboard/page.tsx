
'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Brain, Clock, Users, TrendingUp, Lightbulb, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';

// Import analytics components
import EarningsPrediction from '@/components/analytics/earnings-prediction';
import ScheduleOptimization from '@/components/analytics/schedule-optimization';
import DemandHeatmap from '@/components/analytics/demand-heatmap';
import ClientRetention from '@/components/analytics/client-retention';
import BusinessInsights from '@/components/analytics/business-insights';
import CompetitiveAnalysis from '@/components/analytics/competitive-analysis';

export default function ProfessionalDashboard() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState('overview');

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!session?.user || (session.user as any).role !== 'PROFESSIONAL') {
    redirect('/auth/login');
  }

  const dashboardSections = [
    {
      id: 'overview',
      label: 'Overview',
      icon: <BarChart3 className="h-4 w-4" />,
      description: 'AI-powered insights dashboard'
    },
    {
      id: 'earnings',
      label: 'Earnings AI',
      icon: <Brain className="h-4 w-4" />,
      description: 'Predictive earnings analysis',
      badge: 'AI'
    },
    {
      id: 'schedule',
      label: 'Schedule',
      icon: <Clock className="h-4 w-4" />,
      description: 'Smart schedule optimization',
      badge: 'AI'
    },
    {
      id: 'demand',
      label: 'Demand',
      icon: <TrendingUp className="h-4 w-4" />,
      description: 'Heat maps & analytics'
    },
    {
      id: 'retention',
      label: 'Clients',
      icon: <Users className="h-4 w-4" />,
      description: 'Retention & follow-ups',
      badge: 'AI'
    },
    {
      id: 'insights',
      label: 'Insights',
      icon: <Lightbulb className="h-4 w-4" />,
      description: 'Business recommendations',
      badge: 'AI'
    },
    {
      id: 'competitive',
      label: 'Market',
      icon: <Trophy className="h-4 w-4" />,
      description: 'Competitive analysis',
      badge: 'AI'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Professional Analytics Dashboard
              </h1>
              <p className="text-gray-600 mt-2">
                AI-powered insights to grow your beauty business
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="default" className="bg-gradient-to-r from-blue-600 to-purple-600">
                <Brain className="h-3 w-3 mr-1" />
                AI-Powered
              </Badge>
              <Badge variant="outline">
                Welcome, {session.user.name}
              </Badge>
            </div>
          </div>
        </motion.div>

        {/* Dashboard Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Tab Navigation */}
          <Card>
            <CardContent className="p-6">
              <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-1">
                {dashboardSections.map((section) => (
                  <TabsTrigger
                    key={section.id}
                    value={section.id}
                    className="flex flex-col gap-1 p-3 h-auto data-[state=active]:bg-blue-100"
                  >
                    <div className="flex items-center gap-1">
                      {section.icon}
                      <span className="font-medium text-xs">{section.label}</span>
                      {section.badge && (
                        <Badge variant="secondary" className="text-xs px-1 py-0 h-4">
                          {section.badge}
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-gray-500 text-center hidden sm:block">
                      {section.description}
                    </span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </CardContent>
          </Card>

          {/* Tab Content */}
          <TabsContent value="overview" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-6 w-6" />
                    Welcome to Your AI Analytics Dashboard
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold">📊 Earnings Prediction</h3>
                      <p className="text-sm opacity-90">
                        AI analyzes your booking patterns to predict future earnings with confidence intervals.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold">🕐 Schedule Optimization</h3>
                      <p className="text-sm opacity-90">
                        Smart recommendations for optimal working hours and pricing strategies.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold">🗺️ Demand Analytics</h3>
                      <p className="text-sm opacity-90">
                        Heat maps showing demand patterns by time and location for strategic planning.
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold">👥 Client Retention</h3>
                      <p className="text-sm opacity-90">
                        AI-powered insights on client behavior with personalized retention strategies.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold">💡 Business Insights</h3>
                      <p className="text-sm opacity-90">
                        Actionable recommendations to increase revenue and optimize operations.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-semibold">🏆 Competitive Analysis</h3>
                      <p className="text-sm opacity-90">
                        Market position analysis with strategic recommendations for growth.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick Stats Preview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="cursor-pointer hover:shadow-lg transition-shadow" 
                      onClick={() => setActiveTab('earnings')}>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Brain className="h-5 w-5 text-blue-600" />
                      AI Earnings
                      <Badge variant="secondary">AI</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm mb-3">
                      Get AI-powered predictions for your monthly earnings with confidence intervals.
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-green-600">Predict</span>
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={() => setActiveTab('schedule')}>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Clock className="h-5 w-5 text-purple-600" />
                      Smart Schedule
                      <Badge variant="secondary">AI</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm mb-3">
                      Optimize your working hours for maximum revenue with AI recommendations.
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-purple-600">Optimize</span>
                      <Clock className="h-5 w-5 text-purple-600" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={() => setActiveTab('insights')}>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Lightbulb className="h-5 w-5 text-yellow-600" />
                      AI Insights
                      <Badge variant="secondary">AI</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm mb-3">
                      Personalized business recommendations to boost your earnings.
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-yellow-600">Grow</span>
                      <Lightbulb className="h-5 w-5 text-yellow-600" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </TabsContent>

          <TabsContent value="earnings">
            <EarningsPrediction />
          </TabsContent>

          <TabsContent value="schedule">
            <ScheduleOptimization />
          </TabsContent>

          <TabsContent value="demand">
            <DemandHeatmap />
          </TabsContent>

          <TabsContent value="retention">
            <ClientRetention />
          </TabsContent>

          <TabsContent value="insights">
            <BusinessInsights />
          </TabsContent>

          <TabsContent value="competitive">
            <CompetitiveAnalysis />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
