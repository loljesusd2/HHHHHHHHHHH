
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Settings, Edit, Star, Calendar, Heart, LogOut, User as UserIcon, Shield, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { BottomNavigation } from '@/components/bottom-navigation'
import { AuthGuard } from '@/components/auth-guard'
import { User } from '@/lib/types'
import { useToast } from '@/hooks/use-toast'
import VerificationBadge from '@/components/verification/verification-badge'
import VerificationStatus from '@/components/verification/verification-status'
import DocumentUpload from '@/components/verification/document-upload'

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null)
  const [stats, setStats] = useState({
    totalBookings: 0,
    completedBookings: 0,
    averageRating: 0,
    totalReviews: 0
  })
  const [showVerificationSection, setShowVerificationSection] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    fetchUserProfile()
    fetchUserStats()
  }, [])

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const data = await response.json()
        setUser(data)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchUserStats = async () => {
    try {
      const response = await fetch('/api/profile/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      })
      router.push('/auth/login')
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to logout. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 to-amber-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-700"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Profile not found</h2>
          <Button onClick={() => router.push('/auth/login')}>Sign In</Button>
        </div>
      </div>
    )
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-stone-50 to-amber-50 pb-24">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-700 to-amber-600 text-white">
          <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-2xl font-bold">Profile</h1>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push('/profile/edit')}
                className="text-white hover:bg-white/20 w-10 h-10"
              >
                <Edit size={20} />
              </Button>
            </div>

            {/* Profile Info */}
            <div className="flex items-center gap-6">
              <Avatar className="w-24 h-24 border-4 border-white/20">
                <AvatarImage src={user.avatar} />
                <AvatarFallback className="text-2xl bg-white/20 text-white">
                  {user.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-semibold">{user.name}</h2>
                  {user.verificationStatus && (
                    <VerificationBadge status={user.verificationStatus as any} size="sm" />
                  )}
                </div>
                <p className="text-amber-100 text-lg mb-3">{user.email}</p>
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30 px-3 py-1">
                  {user.role === 'CLIENT' ? 'Client' : user.role === 'PROFESSIONAL' ? 'Professional' : 'Admin'}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 -mt-6 space-y-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-white shadow-sm border-0 rounded-xl">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-amber-700 mb-2">{stats.totalBookings}</div>
                <div className="text-sm text-gray-600 font-medium">Total Bookings</div>
              </CardContent>
            </Card>
            <Card className="bg-white shadow-sm border-0 rounded-xl">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-amber-700 mb-2">{stats.completedBookings}</div>
                <div className="text-sm text-gray-600 font-medium">Completed</div>
              </CardContent>
            </Card>
          </div>

          {user.role === 'PROFESSIONAL' && (
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-white shadow-sm border-0 rounded-xl">
                <CardContent className="p-6 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                    <span className="text-3xl font-bold text-amber-700">
                      {stats.averageRating.toFixed(1)}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 font-medium">Average Rating</div>
                </CardContent>
              </Card>
              <Card className="bg-white shadow-sm border-0 rounded-xl">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-amber-700 mb-2">{stats.totalReviews}</div>
                  <div className="text-sm text-gray-600 font-medium">Reviews</div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Menu Options */}
          <Card className="bg-white shadow-sm border-0 rounded-xl">
            <CardContent className="p-0">
              <div className="divide-y divide-gray-100">
                <button
                  onClick={() => router.push('/profile/edit')}
                  className="w-full flex items-center gap-4 p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <UserIcon className="w-5 h-5 text-gray-600" />
                  </div>
                  <span className="flex-1 text-left font-medium text-gray-800">Edit Profile</span>
                </button>
                
                <button
                  onClick={() => router.push('/bookings')}
                  className="w-full flex items-center gap-4 p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-gray-600" />
                  </div>
                  <span className="flex-1 text-left font-medium text-gray-800">My Bookings</span>
                </button>

                <button
                  onClick={() => setShowVerificationSection(!showVerificationSection)}
                  className="w-full flex items-center gap-4 p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Shield className="w-5 h-5 text-gray-600" />
                  </div>
                  <span className="flex-1 text-left font-medium text-gray-800">Verification</span>
                  {user.verificationStatus && (
                    <VerificationBadge status={user.verificationStatus as any} size="sm" showText={false} />
                  )}
                </button>



                <button
                  onClick={() => router.push('/contact')}
                  className="w-full flex items-center gap-4 p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-gray-600" />
                  </div>
                  <span className="flex-1 text-left font-medium text-gray-800">Contact Support</span>
                </button>

                {user.role === 'CLIENT' && (
                  <button
                    onClick={() => router.push('/favorites')}
                    className="w-full flex items-center gap-4 p-6 hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Heart className="w-5 h-5 text-gray-600" />
                    </div>
                    <span className="flex-1 text-left font-medium text-gray-800">Favorites</span>
                  </button>
                )}

                {user.role === 'PROFESSIONAL' && (
                  <button
                    onClick={() => router.push('/dashboard')}
                    className="w-full flex items-center gap-4 p-6 hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Settings className="w-5 h-5 text-gray-600" />
                    </div>
                    <span className="flex-1 text-left font-medium text-gray-800">Professional Dashboard</span>
                  </button>
                )}

                {user.role === 'ADMIN' && (
                  <button
                    onClick={() => router.push('/admin')}
                    className="w-full flex items-center gap-4 p-6 hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Settings className="w-5 h-5 text-gray-600" />
                    </div>
                    <span className="flex-1 text-left font-medium text-gray-800">Admin Panel</span>
                  </button>
                )}

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-4 p-6 hover:bg-gray-50 transition-colors text-red-600"
                >
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <LogOut className="w-5 h-5 text-red-600" />
                  </div>
                  <span className="flex-1 text-left font-medium">Logout</span>
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Verification Section */}
          {showVerificationSection && (
            <div className="space-y-6">
              <VerificationStatus />
              
              {user.verificationStatus !== 'APPROVED' && (
                <DocumentUpload onUploadSuccess={() => {
                  toast({
                    title: "Document Uploaded",
                    description: "Your verification document has been submitted for review.",
                  })
                }} />
              )}
            </div>
          )}



          {/* App Info */}
          <Card className="bg-white shadow-sm border-0 rounded-xl">
            <CardContent className="p-8 text-center">
              <div className="bg-gradient-to-r from-amber-700 to-amber-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">BG</span>
              </div>
              <h3 className="font-semibold text-gray-800 text-lg mb-2">Beauty GO</h3>
              <p className="text-gray-600 mb-3">Professional Beauty Services</p>
              <p className="text-xs text-gray-500">Version 1.0.0</p>
            </CardContent>
          </Card>
        </div>

        <BottomNavigation />
      </div>
    </AuthGuard>
  )
}
