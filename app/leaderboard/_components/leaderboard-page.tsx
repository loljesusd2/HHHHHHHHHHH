
'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Trophy, Medal, MapPin, Filter } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { LeaderboardCard } from '@/components/gamification/leaderboard-card'
import { EnhancedSkeleton } from '@/components/ui/enhanced-skeleton'
import { useLeaderboard } from '@/hooks/use-leaderboard'

export function LeaderboardPage() {
  const [selectedNeighborhood, setSelectedNeighborhood] = useState<string>('')
  const [selectedType, setSelectedType] = useState<'all' | 'professionals' | 'clients'>('all')
  const [selectedPeriod, setSelectedPeriod] = useState<'all' | 'weekly' | 'monthly'>('weekly')

  const neighborhoods = [
    'Miami', 'Orlando', 'Tampa', 'Jacksonville', 'Fort Lauderdale', 
    'St. Petersburg', 'Hialeah', 'Tallahassee', 'Port St. Lucie', 'Cape Coral'
  ]

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
            <h1 className="text-3xl font-bold mb-2 flex items-center justify-center gap-3">
              <Trophy className="w-8 h-8" />
              Beauty GO Leaderboard
            </h1>
            <p className="text-amber-100">See who are the top performers in your area</p>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 -mt-4">
        <div className="space-y-6">
          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-amber-600" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Time Period
                    </label>
                    <Select value={selectedPeriod} onValueChange={(value) => setSelectedPeriod(value as any)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekly">This Week</SelectItem>
                        <SelectItem value="monthly">This Month</SelectItem>
                        <SelectItem value="all">All Time</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      User Type
                    </label>
                    <Select value={selectedType} onValueChange={(value) => setSelectedType(value as any)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Users</SelectItem>
                        <SelectItem value="professionals">Professionals</SelectItem>
                        <SelectItem value="clients">Clients</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Neighborhood
                    </label>
                    <Select value={selectedNeighborhood} onValueChange={setSelectedNeighborhood}>
                      <SelectTrigger>
                        <SelectValue placeholder="All neighborhoods" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All neighborhoods</SelectItem>
                        {neighborhoods.map((neighborhood) => (
                          <SelectItem key={neighborhood} value={neighborhood}>
                            {neighborhood}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-end">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedNeighborhood('')
                        setSelectedType('all')
                        setSelectedPeriod('weekly')
                      }}
                      className="w-full"
                    >
                      Reset Filters
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Leaderboard Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200">
                <CardContent className="p-4 text-center">
                  <Trophy className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-yellow-700">1st</div>
                  <div className="text-sm text-yellow-600">Gold Medal</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200">
                <CardContent className="p-4 text-center">
                  <Medal className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-gray-700">2nd</div>
                  <div className="text-sm text-gray-600">Silver Medal</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
                <CardContent className="p-4 text-center">
                  <Medal className="w-8 h-8 text-amber-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-amber-700">3rd</div>
                  <div className="text-sm text-amber-600">Bronze Medal</div>
                </CardContent>
              </Card>
            </div>
          </motion.div>

          {/* Main Leaderboard */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <LeaderboardCard
              initialType={selectedType}
              initialPeriod={selectedPeriod}
              neighborhood={selectedNeighborhood || undefined}
              limit={50}
            />
          </motion.div>

          {/* Additional Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-amber-600" />
                  How Rankings Work
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-800 mb-2">Points System</h4>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span>Booking completed</span>
                        <Badge variant="outline">+50 points</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Review written</span>
                        <Badge variant="outline">+25 points</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Successful referral</span>
                        <Badge variant="outline">+100 points</Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Photo uploaded</span>
                        <Badge variant="outline">+15 points</Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-800 mb-2">Ranking Periods</h4>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div><strong>Weekly:</strong> Points earned in the last 7 days</div>
                      <div><strong>Monthly:</strong> Points earned in the last 30 days</div>
                      <div><strong>All Time:</strong> Total points earned since joining</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      <div className="h-20"></div>
    </div>
  )
}
