
'use client'

import { useEffect, useState } from 'react'
import { BottomNavigation } from '@/components/bottom-navigation'
import { ClientHome } from '@/components/client-home'
import { ProfessionalHome } from '@/components/professional-home'
import { AuthGuard } from '@/components/auth-guard'
import { Skeleton } from '@/components/ui/skeleton'

interface UserData {
  id: string
  email: string
  name: string
  role: 'CLIENT' | 'PROFESSIONAL' | 'ADMIN'
  avatar?: string
}

export default function HomePage() {
  const [user, setUser] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <HomePageSkeleton />
  }

  return (
    <AuthGuard>
      <div className="min-h-screen">
        {user?.role === 'PROFESSIONAL' ? <ProfessionalHome /> : <ClientHome />}
        <BottomNavigation />
      </div>
    </AuthGuard>
  )
}

function HomePageSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      <div className="bg-gradient-to-r from-amber-700 to-amber-600 text-white p-6 pb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Beauty GO</h1>
            <Skeleton className="h-4 w-40 bg-white/20 mt-1" />
          </div>
        </div>
        <Skeleton className="h-12 w-full bg-white/20" />
      </div>
      
      <div className="px-4 -mt-4 space-y-6">
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-20 bg-white" />
          <Skeleton className="h-20 bg-white" />
        </div>
        <Skeleton className="h-40 bg-white" />
        <Skeleton className="h-60 bg-white" />
      </div>
    </div>
  )
}
