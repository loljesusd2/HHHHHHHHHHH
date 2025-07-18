
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  DollarSign, 
  Users, 
  Calendar, 
  Star, 
  TrendingUp, 
  TrendingDown,
  ShieldCheck,
  AlertCircle
} from 'lucide-react'
import { SalonDashboardStats } from '@/lib/types'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from 'recharts'

export function SalonDashboard() {
  const [stats, setStats] = useState<SalonDashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('/api/salon-portal/dashboard')
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard stats')
      }
      const data = await response.json()
      setStats(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <DashboardSkeleton />
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8 text-red-600">
        <AlertCircle className="h-5 w-5 mr-2" />
        Error: {error}
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">No salon data available</p>
        <Button onClick={fetchDashboardStats} className="mt-4">
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                +12.5% from last month
              </span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBookings}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                +8.2% from last month
              </span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Professionals</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProfessionals}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-blue-600 flex items-center">
                <ShieldCheck className="h-3 w-3 mr-1" />
                All verified
              </span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageRating.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-yellow-600 flex items-center">
                <Star className="h-3 w-3 mr-1 fill-current" />
                Excellent rating
              </span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
            <CardDescription>Monthly revenue over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.revenueChart}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="revenue" stroke="#F59E0B" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bookings by Service</CardTitle>
            <CardDescription>Distribution of bookings across services</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.bookingsByService}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="service" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#F59E0B" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Professionals */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Professionals</CardTitle>
          <CardDescription>Your best performing salon professionals</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.topProfessionals.map((professional, index) => (
              <div key={professional.user.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                    <span className="text-amber-600 font-medium">#{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium">{professional.user.name}</p>
                    <p className="text-sm text-gray-600">{professional.professional.businessName}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-6">
                  <div className="text-right">
                    <p className="text-sm font-medium">${professional.revenue.toLocaleString()}</p>
                    <p className="text-xs text-gray-600">Revenue</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{professional.bookings}</p>
                    <p className="text-xs text-gray-600">Bookings</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="ml-1 text-sm font-medium">{professional.rating.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-lg" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton className="h-96 rounded-lg" />
        <Skeleton className="h-96 rounded-lg" />
      </div>
      <Skeleton className="h-64 rounded-lg" />
    </div>
  )
}
