
'use client'

import { useEffect, useState } from 'react'
import { Calendar, DollarSign, Users, Star, TrendingUp, Clock, MapPin, Settings, Trophy, Zap, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useTranslations } from '@/lib/i18n-client'
import { LanguageSelector } from '@/components/language-selector'
import { PointsDisplay } from '@/components/gamification/points-display'
import { LeaderboardCard } from '@/components/gamification/leaderboard-card'

interface ProfessionalDashboardData {
  professional: {
    businessName: string
    avatar?: string
    rating: number
    totalReviews: number
  }
  todaysBookings: any[]
  weeklyEarnings: number
  monthlyEarnings: number
  totalClients: number
  completedServices: number
  recentActivity: any[]
}

export function ProfessionalHome() {
  const [dashboardData, setDashboardData] = useState<ProfessionalDashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const t = useTranslations()

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/dashboard/professional')
      if (response.ok) {
        const data = await response.json()
        setDashboardData(data)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <ProfessionalHomeSkeleton />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-700 to-amber-600 text-white p-6 pb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">{t('home.appName')}</h1>
            <p className="text-amber-100 text-sm">{t('home.welcomeProfessional')}, {dashboardData?.professional?.businessName}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-amber-100">
              <MapPin size={16} />
              <span className="text-sm">Florida</span>
            </div>
            <LanguageSelector />
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/10 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5" />
              <span className="text-sm">{t('dashboard.todaysBookings')}</span>
            </div>
            <p className="text-2xl font-bold">{dashboardData?.todaysBookings?.length || 0}</p>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5" />
              <span className="text-sm">{t('dashboard.weeklyEarnings')}</span>
            </div>
            <p className="text-2xl font-bold">${dashboardData?.weeklyEarnings || 0}</p>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-4 space-y-6">
        {/* Quick Actions */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 gap-3"
        >
          <Link href="/calendar">
            <Card className="bg-white hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-4 text-center">
                <Calendar className="w-8 h-8 text-amber-600 mx-auto mb-2" />
                <p className="font-medium text-gray-800">{t('navigation.calendar')}</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/services/manage">
            <Card className="bg-white hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-4 text-center">
                <Settings className="w-8 h-8 text-amber-600 mx-auto mb-2" />
                <p className="font-medium text-gray-800">{t('navigation.services')}</p>
              </CardContent>
            </Card>
          </Link>
        </motion.div>

        {/* Gamification Elements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-4"
        >
          {/* Points Display */}
          <Card className="bg-white">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-gray-800 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-600" />
                  Beauty Points
                </CardTitle>
                <Link href="/gamification">
                  <Button variant="ghost" size="sm" className="text-amber-600">
                    View All <ArrowRight size={16} className="ml-1" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <PointsDisplay compact />
            </CardContent>
          </Card>

          {/* Leaderboard */}
          <Card className="bg-white">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-gray-800 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-amber-600" />
                  Your Ranking
                </CardTitle>
                <Link href="/leaderboard">
                  <Button variant="ghost" size="sm" className="text-amber-600">
                    View All <ArrowRight size={16} className="ml-1" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <LeaderboardCard compact initialType="professionals" initialPeriod="weekly" limit={3} />
            </CardContent>
          </Card>
        </motion.div>

        {/* Today's Bookings */}
        {dashboardData?.todaysBookings && dashboardData.todaysBookings.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-white">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-gray-800">{t('dashboard.todaysBookings')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {dashboardData.todaysBookings.slice(0, 3).map((booking) => (
                  <div key={booking.id} className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg">
                    <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                      <Clock className="w-6 h-6 text-amber-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-800">{booking.service?.name}</h4>
                      <p className="text-sm text-gray-600">
                        {booking.scheduledTime} - {booking.client?.name}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-amber-700 border-amber-200">
                      ${booking.service?.price}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Performance Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 gap-3"
        >
          <Card className="bg-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-amber-600" />
                <span className="text-sm text-gray-600">{t('dashboard.totalClients')}</span>
              </div>
              <p className="text-2xl font-bold text-gray-800">{dashboardData?.totalClients || 0}</p>
            </CardContent>
          </Card>
          <Card className="bg-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-5 h-5 text-amber-600" />
                <span className="text-sm text-gray-600">{t('dashboard.averageRating')}</span>
              </div>
              <p className="text-2xl font-bold text-gray-800">
                {dashboardData?.professional?.rating?.toFixed(1) || '0.0'}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Monthly Earnings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-white">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-gray-800">{t('dashboard.monthlyEarnings')}</CardTitle>
                <Link href="/earnings">
                  <Button variant="ghost" size="sm" className="text-amber-600">
                    {t('home.viewAll')}
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-gray-800">
                    ${dashboardData?.monthlyEarnings || 0}
                  </p>
                  <p className="text-sm text-gray-600">{t('time.thisMonth')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

function ProfessionalHomeSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      <div className="bg-gradient-to-r from-amber-700 to-amber-600 text-white p-6 pb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Beauty GO</h1>
            <Skeleton className="h-4 w-40 bg-white/20 mt-1" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-20 bg-white/20" />
          <Skeleton className="h-20 bg-white/20" />
        </div>
      </div>
      
      <div className="px-4 -mt-4 space-y-6">
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-20 bg-white" />
          <Skeleton className="h-20 bg-white" />
        </div>
        <Skeleton className="h-40 bg-white" />
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-20 bg-white" />
          <Skeleton className="h-20 bg-white" />
        </div>
      </div>
    </div>
  )
}
