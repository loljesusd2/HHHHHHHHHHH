
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, DollarSign, TrendingUp, Calendar, Download, User, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { BottomNavigation } from '@/components/bottom-navigation'
import { AuthGuard } from '@/components/auth-guard'
import { useToast } from '@/hooks/use-toast'


interface EarningsData {
  totalEarnings: number
  totalBookings: number
  averageBookingValue: number
  serviceBreakdown: Array<{
    name: string
    count: number
    earnings: number
  }>
  chartData: Array<{
    date: string
    earnings: number
  }>
  recentBookings: Array<{
    id: string
    scheduledDate: string
    scheduledTime: string
    totalAmount: number
    service: {
      name: string
      duration: number
    }
    client: {
      name: string
      avatar?: string
    }
    payment?: {
      professionalAmount: number
      status: string
    }
  }>
}

export default function EarningsPage() {
  const [earningsData, setEarningsData] = useState<EarningsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [period, setPeriod] = useState('month')
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    fetchEarningsData()
  }, [period])

  const fetchEarningsData = async () => {
    try {
      const response = await fetch(`/api/earnings?period=${period}`)
      if (response.ok) {
        const data = await response.json()
        setEarningsData(data)
      } else if (response.status === 403) {
        toast({
          title: "Access Denied",
          description: "You must be a professional to view earnings.",
          variant: "destructive",
        })
        router.push('/profile')
      }
    } catch (error) {
      console.error('Error fetching earnings:', error)
      toast({
        title: "Error",
        description: "Failed to load earnings data.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  const exportData = () => {
    if (!earningsData) return

    const csvContent = [
      ['Date', 'Service', 'Client', 'Amount', 'Status'],
      ...earningsData.recentBookings.map(booking => [
        new Date(booking.scheduledDate).toLocaleDateString(),
        booking.service.name,
        booking.client.name,
        booking.payment?.professionalAmount || 0,
        booking.payment?.status || 'N/A'
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `earnings-${period}-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-700"></div>
      </div>
    )
  }

  if (!earningsData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">No earnings data available</h2>
          <Button onClick={() => router.push('/dashboard')}>Go to Dashboard</Button>
        </div>
      </div>
    )
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 pb-20">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-700 to-amber-600 text-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.back()}
                className="text-white hover:bg-white/20"
              >
                <ArrowLeft size={20} />
              </Button>
              <div className="flex items-center gap-2">
                <DollarSign className="w-6 h-6" />
                <h1 className="text-xl font-bold">Earnings Report</h1>
              </div>
            </div>
            <Button
              onClick={exportData}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20"
            >
              <Download size={16} className="mr-2" />
              Export
            </Button>
          </div>
        </div>

        <div className="p-4 space-y-6">
          {/* Period Selector */}
          <Card className="bg-white shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-amber-800">Time Period</h3>
                <Select value={period} onValueChange={setPeriod}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="year">This Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-white shadow-sm">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <DollarSign className="w-8 h-8 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(earningsData.totalEarnings)}
                </div>
                <div className="text-sm text-gray-600">Total Earnings</div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-sm">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <Calendar className="w-8 h-8 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  {earningsData.totalBookings}
                </div>
                <div className="text-sm text-gray-600">Completed Bookings</div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-sm">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center mb-2">
                  <TrendingUp className="w-8 h-8 text-amber-600" />
                </div>
                <div className="text-2xl font-bold text-amber-600">
                  {formatCurrency(earningsData.averageBookingValue)}
                </div>
                <div className="text-sm text-gray-600">Average Booking</div>
              </CardContent>
            </Card>
          </div>

          {/* Earnings Chart */}
          {earningsData.chartData.length > 0 && (
            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-amber-800">Earnings Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-amber-50 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <TrendingUp className="w-12 h-12 text-amber-600 mx-auto mb-2" />
                    <p className="text-amber-700 font-medium">Earnings Chart</p>
                    <p className="text-sm text-gray-600">
                      {earningsData.chartData.length} data points available
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Service Breakdown */}
          {earningsData.serviceBreakdown.length > 0 && (
            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-amber-800">Service Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {earningsData.serviceBreakdown.map((service, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-amber-800">{service.name}</h4>
                        <p className="text-sm text-gray-600">{service.count} bookings</p>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-amber-700">
                          {formatCurrency(service.earnings)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatCurrency(service.earnings / service.count)} avg
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Bookings */}
          {earningsData.recentBookings.length > 0 && (
            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-amber-800">Recent Completed Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {earningsData.recentBookings.slice(0, 5).map((booking) => (
                    <div key={booking.id} className="flex items-center gap-4 p-3 border border-amber-100 rounded-lg">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={booking.client.avatar} />
                        <AvatarFallback className="bg-amber-100 text-amber-700">
                          {booking.client.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium text-gray-800">{booking.service.name}</h4>
                          <span className="font-semibold text-green-600">
                            {formatCurrency(booking.payment?.professionalAmount || 0)}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <User size={14} />
                            <span>{booking.client.name}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar size={14} />
                            <span>{new Date(booking.scheduledDate).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock size={14} />
                            <span>{booking.service.duration} min</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <BottomNavigation />
      </div>
    </AuthGuard>
  )
}
