
'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Users, Gift, Copy, Check, Share2, ExternalLink } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { useReferrals } from '@/hooks/use-referrals'
import { useSocialShare } from '@/hooks/use-social-share'
import { EnhancedSkeleton } from '@/components/ui/enhanced-skeleton'

interface ReferralProgressProps {
  compact?: boolean
}

export function ReferralProgress({ compact = false }: ReferralProgressProps) {
  const { code, stats, nextMilestone, referrals, loading, error, claimRewards } = useReferrals()
  const { generateShareContent, shareToSocial } = useSocialShare()
  const [copied, setCopied] = useState(false)
  const [claiming, setClaiming] = useState(false)

  const handleCopyCode = async () => {
    if (!code) return
    
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy code:', error)
    }
  }

  const handleShare = async () => {
    try {
      const shareData = await generateShareContent('app_referral', {
        customMessage: `Join me on Beauty GO! Use my referral code ${code} to get started with professional beauty services. 💄✨`
      })
      
      shareToSocial('twitter', shareData.shareData)
    } catch (error) {
      console.error('Error sharing:', error)
    }
  }

  const handleClaimRewards = async () => {
    if (!stats?.unclaimedRewards || claiming) return
    
    try {
      setClaiming(true)
      await claimRewards()
    } catch (error) {
      console.error('Error claiming rewards:', error)
    } finally {
      setClaiming(false)
    }
  }

  if (loading) {
    return <ReferralProgressSkeleton compact={compact} />
  }

  if (error || !stats) {
    return null
  }

  if (compact) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="space-y-3"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Users className="w-4 h-4 text-amber-500" />
            Referrals ({stats.totalReferrals})
          </h3>
          {stats.unclaimedRewards > 0 && (
            <Badge variant="outline" className="text-green-600 border-green-200">
              {stats.unclaimedRewards} rewards!
            </Badge>
          )}
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Input
              value={code || ''}
              readOnly
              className="text-sm font-mono"
            />
            <Button
              size="sm"
              variant="outline"
              onClick={handleCopyCode}
              className="flex items-center gap-1"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
          
          {nextMilestone && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Progress to {nextMilestone.reward}</span>
                <span className="text-amber-600">{nextMilestone.progress}%</span>
              </div>
              <Progress value={nextMilestone.progress} className="h-2" />
            </div>
          )}
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-800">
            <Users className="w-5 h-5 text-amber-600" />
            Refer Friends & Earn Rewards
            {stats.unclaimedRewards > 0 && (
              <Badge variant="outline" className="text-green-600 border-green-200">
                {stats.unclaimedRewards} rewards to claim!
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Referral Code */}
          <div className="space-y-3">
            <div>
              <h4 className="font-medium text-gray-800 mb-2">Your Referral Code</h4>
              <div className="flex items-center gap-2">
                <Input
                  value={code || ''}
                  readOnly
                  className="font-mono text-lg text-center tracking-wider"
                />
                <Button
                  variant="outline"
                  onClick={handleCopyCode}
                  className="flex items-center gap-2"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleShare}
                className="flex items-center gap-2 flex-1"
              >
                <Share2 className="w-4 h-4" />
                Share Code
              </Button>
              <Button
                variant="outline"
                onClick={() => window.open(`https://wa.me/?text=Join me on Beauty GO! Use my referral code ${code} to get started with professional beauty services. 💄✨`, '_blank')}
                className="flex items-center gap-2 flex-1"
              >
                <ExternalLink className="w-4 h-4" />
                WhatsApp
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
              <div className="text-2xl font-bold text-green-600">{stats.completedReferrals}</div>
              <p className="text-sm text-gray-600">Successful Referrals</p>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg border border-amber-200">
              <div className="text-2xl font-bold text-amber-600">{stats.totalRewardPoints}</div>
              <p className="text-sm text-gray-600">Points Earned</p>
            </div>
          </div>

          {/* Progress to Next Milestone */}
          {nextMilestone && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-gray-800">Next Milestone</h4>
                <Badge variant="outline" className="text-amber-600 border-amber-200">
                  {nextMilestone.reward}
                </Badge>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    {stats.completedReferrals} of {nextMilestone.count} referrals
                  </span>
                  <span className="text-amber-600 font-medium">{nextMilestone.progress}%</span>
                </div>
                <Progress value={nextMilestone.progress} className="h-3" />
              </div>
            </div>
          )}

          {/* Unclaimed Rewards */}
          {stats.unclaimedRewards > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Gift className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium text-green-800">
                      {stats.unclaimedRewards} reward{stats.unclaimedRewards > 1 ? 's' : ''} ready!
                    </p>
                    <p className="text-sm text-green-600">
                      Click to claim your {stats.unclaimedRewards * 100} points
                    </p>
                  </div>
                </div>
                <Button
                  onClick={handleClaimRewards}
                  disabled={claiming}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {claiming ? 'Claiming...' : 'Claim Rewards'}
                </Button>
              </div>
            </motion.div>
          )}

          {/* Recent Referrals */}
          {referrals.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium text-gray-800">Recent Referrals</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {referrals.slice(0, 5).map((referral, index) => (
                  <motion.div
                    key={referral.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={referral.referred?.avatar} />
                        <AvatarFallback>
                          {referral.referred?.name?.charAt(0) || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {referral.referred?.name || 'Pending'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(referral.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        referral.status === 'completed'
                          ? 'text-green-600 border-green-200'
                          : 'text-gray-500 border-gray-200'
                      }
                    >
                      {referral.status}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

function ReferralProgressSkeleton({ compact }: { compact: boolean }) {
  if (compact) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <EnhancedSkeleton className="h-4 w-24" />
          <EnhancedSkeleton className="h-6 w-20 rounded-full" />
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <EnhancedSkeleton className="h-10 flex-1" />
            <EnhancedSkeleton className="h-10 w-16" />
          </div>
          <EnhancedSkeleton className="h-2 w-full" />
        </div>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <EnhancedSkeleton className="h-6 w-48" />
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <EnhancedSkeleton className="h-4 w-32" />
          <div className="flex items-center gap-2">
            <EnhancedSkeleton className="h-12 flex-1" />
            <EnhancedSkeleton className="h-12 w-20" />
          </div>
          <div className="flex gap-2">
            <EnhancedSkeleton className="h-10 flex-1" />
            <EnhancedSkeleton className="h-10 flex-1" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <EnhancedSkeleton className="h-20 rounded-lg" />
          <EnhancedSkeleton className="h-20 rounded-lg" />
        </div>
      </CardContent>
    </Card>
  )
}
