
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Calendar,
  Star,
  Target,
  BarChart3,
  PieChart,
  LineChart
} from 'lucide-react'
import { ResponsiveContainer, LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell } from 'recharts'

const COLORS = ['#F59E0B', '#3B82F6', '#EF4444', '#10B981', '#8B5CF6', '#F97316']

export function AggregatedAnalytics() {
  const [analytics, setAnalytics] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('30d')

  useEffect(() => {
    fetchAnalytics()
  }, [timeRange])

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`/api/salon-portal/analytics?range=${timeRange}`)
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data)
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div>Loading analytics...</div>
  }

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Analytics Overview</h2>
          <p className="text-gray-600">Comprehensive salon performance metrics</p>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="1y">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="clients">Clients</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$24,580</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">+18.2%</span> from last period
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Bookings</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">342</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-600">+12.1%</span> from last period
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Professionals</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">28</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-blue-600">+2 new</span> this month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">4.8</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-yellow-600">Excellent</span> customer satisfaction
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trend</CardTitle>
                <CardDescription>Daily revenue over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsLineChart data={analytics?.revenueData || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="revenue" stroke="#F59E0B" strokeWidth={2} />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Service Distribution</CardTitle>
                <CardDescription>Booking distribution by service type</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={analytics?.serviceData || []}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {(analytics?.serviceData || []).map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Revenue Analytics</CardTitle>
              <CardDescription>Detailed revenue breakdown and trends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm font-medium text-green-900">Total Revenue</p>
                  <p className="text-2xl font-bold text-green-600">$24,580</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-blue-900">Platform Fees</p>
                  <p className="text-2xl font-bold text-blue-600">$2,458</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <p className="text-sm font-medium text-purple-900">Net Revenue</p>
                  <p className="text-2xl font-bold text-purple-600">$22,122</p>
                </div>
              </div>
              
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={analytics?.revenueByProfessional || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="revenue" fill="#F59E0B" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Professional Performance</CardTitle>
              <CardDescription>Individual professional metrics and rankings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(analytics?.topPerformers || []).map((performer: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-amber-600">#{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium">{performer.name}</p>
                        <p className="text-sm text-gray-600">{performer.businessName}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-6">
                      <div className="text-right">
                        <p className="text-sm font-medium">${performer.revenue.toLocaleString()}</p>
                        <p className="text-xs text-gray-600">Revenue</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{performer.bookings}</p>
                        <p className="text-xs text-gray-600">Bookings</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span className="ml-1 text-sm font-medium">{performer.rating}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clients" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Client Analytics</CardTitle>
              <CardDescription>Client acquisition and retention metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm font-medium text-blue-900">New Clients</p>
                    <p className="text-2xl font-bold text-blue-600">156</p>
                    <p className="text-xs text-blue-700">+12% from last month</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-sm font-medium text-green-900">Returning Clients</p>
                    <p className="text-2xl font-bold text-green-600">432</p>
                    <p className="text-xs text-green-700">73% retention rate</p>
                  </div>
                </div>
                
                <ResponsiveContainer width="100%" height={200}>
                  <RechartsLineChart data={analytics?.clientData || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="new" stroke="#3B82F6" strokeWidth={2} />
                    <Line type="monotone" dataKey="returning" stroke="#10B981" strokeWidth={2} />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
