
'use client'

import { motion } from 'framer-motion'
import { Users, Gift, Trophy, Share2, Copy, Check } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ReferralProgress } from '@/components/gamification/referral-progress'
import { EnhancedSkeleton } from '@/components/ui/enhanced-skeleton'
import { useReferrals } from '@/hooks/use-referrals'

export function ReferralsPage() {
  const { code, stats, loading, error } = useReferrals()

  if (loading) {
    return <ReferralsPageSkeleton />
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-6 text-center">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-800 mb-2">Error Loading Referrals</h3>
            <p className="text-gray-600">We couldn't load your referral data. Please try again later.</p>
          </CardContent>
        </Card>
      </div>
    )
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
            <h1 className="text-3xl font-bold mb-2 flex items-center justify-center gap-3">
              <Users className="w-8 h-8" />
              Refer Friends & Earn Rewards
            </h1>
            <p className="text-amber-100">Share Beauty GO with friends and earn points for every successful referral</p>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 -mt-4">
        <div className="space-y-6">
          {/* How It Works */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="w-5 h-5 text-amber-600" />
                  How It Works
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Share2 className="w-8 h-8 text-amber-600" />
                    </div>
                    <h3 className="font-medium text-gray-800 mb-2">1. Share Your Code</h3>
                    <p className="text-sm text-gray-600">Share your unique referral code with friends and family</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="font-medium text-gray-800 mb-2">2. Friends Join</h3>
                    <p className="text-sm text-gray-600">They sign up using your code and book their first service</p>
                  </div>
                  <div className="text-center">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Trophy className="w-8 h-8 text-purple-600" />
                    </div>
                    <h3 className="font-medium text-gray-800 mb-2">3. Earn Rewards</h3>
                    <p className="text-sm text-gray-600">Get 100 points for each successful referral</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Main Referral Component */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <ReferralProgress />
          </motion.div>

          {/* Referral Benefits */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-600" />
                  Referral Benefits
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-800 mb-3">For You</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">100 Beauty Points per successful referral</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">Unlock exclusive badges</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">Climb the leaderboard</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">Get priority booking</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800 mb-3">For Your Friends</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">20 welcome bonus points</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">Access to verified professionals</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">Personalized service matching</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm text-gray-600">Join the beauty community</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Referral Tips */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-amber-600" />
                  Referral Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                    <h4 className="font-medium text-amber-800 mb-2">💬 Personal Touch</h4>
                    <p className="text-sm text-amber-700">Share your personal experience with Beauty GO when referring friends</p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-medium text-blue-800 mb-2">📱 Social Media</h4>
                    <p className="text-sm text-blue-700">Share your referral code on social media with beautiful transformation photos</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <h4 className="font-medium text-green-800 mb-2">💄 Show Results</h4>
                    <p className="text-sm text-green-700">Let your beauty transformations speak for themselves</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <h4 className="font-medium text-purple-800 mb-2">🎯 Target Audience</h4>
                    <p className="text-sm text-purple-700">Share with friends who are interested in beauty and self-care</p>
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

function ReferralsPageSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      <div className="bg-gradient-to-r from-amber-700 to-amber-600 text-white p-6 pb-8">
        <div className="max-w-6xl mx-auto text-center">
          <EnhancedSkeleton className="h-8 w-64 mx-auto mb-2 bg-white/20" />
          <EnhancedSkeleton className="h-4 w-80 mx-auto bg-white/20" />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-4 space-y-6">
        <EnhancedSkeleton className="h-48 bg-white" />
        <EnhancedSkeleton className="h-96 bg-white" />
        <EnhancedSkeleton className="h-64 bg-white" />
        <EnhancedSkeleton className="h-48 bg-white" />
      </div>
    </div>
  )
}
