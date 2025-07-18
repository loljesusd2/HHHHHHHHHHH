
'use client'

import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { Trophy, TrendingUp, Users, Zap, Star, Gift } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PointsDisplay } from '@/components/gamification/points-display'
import { BadgeCollection } from '@/components/gamification/badge-collection'
import { LeaderboardCard } from '@/components/gamification/leaderboard-card'
import { ReferralProgress } from '@/components/gamification/referral-progress'
import { FlashDealsGrid } from '@/components/gamification/flash-deal-timer'
import { EnhancedSkeleton } from '@/components/ui/enhanced-skeleton'
import Link from 'next/link'

export function GamificationDashboard() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return <GamificationDashboardSkeleton />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-700 to-amber-600 text-white p-6 pb-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-3xl font-bold mb-2">Beauty GO Gamification</h1>
            <p className="text-amber-100">Track your beauty journey, earn rewards, and climb the leaderboard!</p>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 -mt-4">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-white shadow-sm">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Leaderboard
            </TabsTrigger>
            <TabsTrigger value="referrals" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Referrals
            </TabsTrigger>
            <TabsTrigger value="deals" className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Flash Deals
            </TabsTrigger>
            <TabsTrigger value="badges" className="flex items-center gap-2">
              <Star className="w-4 h-4" />
              Badges
            </TabsTrigger>
          </TabsList>

          <div className="mt-6 space-y-6">
            <TabsContent value="overview" className="space-y-6">
              {/* Overview Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Points Display */}
                <div className="lg:col-span-1">
                  <PointsDisplay />
                </div>

                {/* Quick Actions */}
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Gift className="w-5 h-5 text-amber-600" />
                        Quick Actions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <Link href="/beauty-profile">
                          <Button 
                            variant="outline" 
                            className="w-full h-20 flex flex-col items-center gap-2 hover:bg-amber-50"
                          >
                            <Star className="w-6 h-6 text-amber-600" />
                            <span>Beauty Profile</span>
                          </Button>
                        </Link>
                        <Link href="/referrals">
                          <Button 
                            variant="outline" 
                            className="w-full h-20 flex flex-col items-center gap-2 hover:bg-amber-50"
                          >
                            <Users className="w-6 h-6 text-amber-600" />
                            <span>Refer Friends</span>
                          </Button>
                        </Link>
                        <Link href="/flash-deals">
                          <Button 
                            variant="outline" 
                            className="w-full h-20 flex flex-col items-center gap-2 hover:bg-amber-50"
                          >
                            <Zap className="w-6 h-6 text-amber-600" />
                            <span>Flash Deals</span>
                          </Button>
                        </Link>
                        <Link href="/leaderboard">
                          <Button 
                            variant="outline" 
                            className="w-full h-20 flex flex-col items-center gap-2 hover:bg-amber-50"
                          >
                            <TrendingUp className="w-6 h-6 text-amber-600" />
                            <span>Leaderboard</span>
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Recent Activity & Compact Views */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Badges</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <BadgeCollection compact />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Referral Progress</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ReferralProgress compact />
                  </CardContent>
                </Card>
              </div>

              {/* Mini Leaderboard */}
              <Card>
                <CardHeader>
                  <CardTitle>Weekly Leaderboard</CardTitle>
                </CardHeader>
                <CardContent>
                  <LeaderboardCard compact initialPeriod="weekly" limit={5} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="leaderboard" className="space-y-6">
              <LeaderboardCard initialPeriod="weekly" limit={20} />
            </TabsContent>

            <TabsContent value="referrals" className="space-y-6">
              <ReferralProgress />
            </TabsContent>

            <TabsContent value="deals" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-amber-600" />
                    Active Flash Deals
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <FlashDealsGrid limit={9} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="badges" className="space-y-6">
              <BadgeCollection />
            </TabsContent>
          </div>
        </Tabs>
      </div>

      <div className="h-20"></div>
    </div>
  )
}

function GamificationDashboardSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      <div className="bg-gradient-to-r from-amber-700 to-amber-600 text-white p-6 pb-8">
        <div className="max-w-6xl mx-auto text-center">
          <EnhancedSkeleton className="h-8 w-64 mx-auto mb-2 bg-white/20" />
          <EnhancedSkeleton className="h-4 w-80 mx-auto bg-white/20" />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-4 space-y-6">
        <EnhancedSkeleton className="h-12 w-full bg-white" />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <EnhancedSkeleton className="h-80 bg-white" />
          <div className="lg:col-span-2">
            <EnhancedSkeleton className="h-80 bg-white" />
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <EnhancedSkeleton className="h-60 bg-white" />
          <EnhancedSkeleton className="h-60 bg-white" />
        </div>
      </div>
    </div>
  )
}
